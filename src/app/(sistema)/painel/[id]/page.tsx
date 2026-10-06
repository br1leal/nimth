"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Chip, toast } from "@heroui/react";
import Shell, { Carregando, Vazio } from "@/components/painel/Shell";
import Icon from "@/components/Icon";
import { usePsicologo } from "@/components/painel/usePsicologo";
import { emocaoInfo } from "@/components/painel/emocoes";
import { type Ficha, dataBR, idade, intensTexto } from "@/components/painel/tipos";
import { supabase } from "@/lib/supabase";

type Linha = [string, string];

function Bloco({ titulo, linhas, copiar, className = "" }: { titulo: string; linhas: Linha[]; copiar: (v: string, k: string) => void; className?: string }) {
  return (
    <Card className={`bloco gap-2 p-5 md:p-6 ${className}`}>
      <Card.Header className="p-0"><Card.Title className="font-serif text-[22px] font-normal">{titulo}</Card.Title></Card.Header>
      <dl className="grid">
        {linhas.map(([k, v]) => (
          <div key={k} className="group flex items-center gap-3 border-t border-separator py-3 first:border-t-0 first:pt-1">
            <div className="grid min-w-0 flex-1 gap-0.5">
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="text-[15px] break-words">{v || <span className="text-muted">—</span>}</dd>
            </div>
            {v && (
              <Button isIconOnly size="sm" variant="ghost" aria-label={`Copiar ${k}`} onPress={() => copiar(v, k)} className="no-print shrink-0 text-muted opacity-70 group-hover:opacity-100">
                <Icon name="copy" className="icon-sm" />
              </Button>
            )}
          </div>
        ))}
      </dl>
    </Card>
  );
}

/** Ficha do paciente: dados com copiar, copiar tudo, baixar PDF (impressão) e arquivar. */
export default function FichaPaciente() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { psi } = usePsicologo();
  const [f, setF] = useState<Ficha | null | undefined>(undefined);

  useEffect(() => {
    if (!psi) return;
    const sb = supabase()!;
    sb.from("fichas").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setF((data as Ficha) ?? null);
      if (data && data.status === "nova") sb.from("fichas").update({ status: "vista" }).eq("id", id).then(() => {});
    });
  }, [psi, id]);

  if (!psi || f === undefined) return <Shell psi={psi}><Carregando /></Shell>;
  if (f === null) return (
    <Shell psi={psi}>
      <Card><Vazio icon="alert" titulo="Ficha não encontrada">Ela pode ter sido apagada. <Link href="/painel" className="text-foreground underline">Voltar para pacientes</Link></Vazio></Card>
    </Shell>
  );

  const d = f.dados ?? {}, en = d.endereco ?? {}, em = d.emergencia ?? {}, sa = d.saude ?? {};
  const e = emocaoInfo(f.emocao), a = idade(f.nascimento);
  const temEmocao = !!e && f.emocao !== "nimbo";
  const endereco = [[en.rua, en.numero].filter(Boolean).join(", "), en.complemento, en.bairro, [en.cidade, en.uf].filter(Boolean).join(" / "), en.cep].filter(Boolean).join(" · ");

  // fichas novas: lista de especialidades (com nome e contato opcionais); antigas: um médico só
  const medicos: Linha[] = sa.medicos?.length
    ? [["Especialidades", sa.medicos.map(m => m.especialidade).join(", ")],
       ...sa.medicos.filter(m => m.nome || m.contato).map(m => [m.especialidade, [m.nome, m.contato].filter(Boolean).join(" · ")] as Linha)]
    : [["Médico", sa.medicoNome ?? ""], ["Contato do médico", sa.medicoContato ?? ""]];
  const blocos: Record<string, Linha[]> = {
    "Dados pessoais": [["Nome completo", f.nome], ["Data de nascimento", f.nascimento ? `${dataBR(f.nascimento)}${a != null ? ` (${a} anos)` : ""}` : ""], ["Telefone", f.telefone ?? ""]],
    "Contato de emergência": [["Nome", em.nome ?? ""], ["Telefone", em.telefone ?? ""]],
    "Endereço": [["Endereço completo", endereco], ["CEP", en.cep ?? ""], ["Rua e número", [en.rua, en.numero].filter(Boolean).join(", ")], ["Complemento", en.complemento ?? ""], ["Bairro", en.bairro ?? ""], ["Cidade / UF", [en.cidade, en.uf].filter(Boolean).join(" / ")]],
    "Saúde": [["Usa medicamento?", sa.medicamento ? "Sim" : "Não"], ...(sa.medicamento ? [["Quais", sa.medicamentos ?? ""] as Linha] : []), ["Acompanhado(a) por médico?", sa.medico ? "Sim" : "Não"], ...(sa.medico ? medicos : [])],
  };

  const copiar = async (t: string, rot: string) => { if (!t) return; await navigator.clipboard.writeText(t); toast.success(`${rot} copiado`); };
  const tudo = () => [
    `Ficha de ${f.nome}`, `Enviada em ${dataBR(f.criado_em)}`, "",
    ...(temEmocao ? [`Como chegou: ${e!.nome}${f.intensidade != null ? ` (${intensTexto(f.intensidade)})` : ""}${f.motivos?.length ? ` · ${f.motivos.join(", ")}` : ""}`, ""] : []),
    ...Object.entries(blocos).flatMap(([t, ls]) => [t.toUpperCase(), ...ls.filter(([k, v]) => v && k !== "Endereço completo").map(([k, v]) => `${k}: ${v}`), ""]),
  ].join("\n");
  const arquivar = async () => {
    const novo = f.status === "arquivada" ? "vista" : "arquivada";
    await supabase()!.from("fichas").update({ status: novo }).eq("id", f.id);
    if (novo === "arquivada") { toast.success("Ficha arquivada"); router.push("/painel"); } else { setF({ ...f, status: novo }); toast.success("Ficha de volta à lista"); }
  };

  return (
    <Shell psi={psi}>
      <Link href="/painel" className="no-print inline-flex w-fit items-center gap-1.5 text-sm text-muted hover:text-foreground">
        <Icon name="arrow-left" className="icon-sm" />Pacientes
      </Link>

      <Card className="ficha-topo gap-5 p-5 md:flex-row md:items-center md:gap-6 md:p-7" style={e ? { ["--fe1" as string]: e.claro, ["--fe3" as string]: e.cor } : undefined}>
        <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-5">
          {e && <img src={e.img} alt="" className="size-20 shrink-0 object-contain md:size-24" />}
          <div className="grid min-w-0 gap-1">
            {f.status === "arquivada" && <Chip size="sm" variant="secondary" className="w-fit">Arquivada</Chip>}
            <h1 className="font-serif text-[28px] leading-tight md:text-[34px]">{f.nome}</h1>
            <p className="text-sm text-muted">Enviada em {dataBR(f.criado_em)}{a != null ? ` · ${a} anos` : ""}</p>
            {temEmocao && (
              <div className="mt-2 grid gap-2">
                <span className="emo-nome text-sm font-medium">Chegou com {e!.nome.toLowerCase()}{f.intensidade != null ? ` · ${intensTexto(f.intensidade)}` : ""}</span>
                {f.motivos?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {f.motivos.map(m => <Chip key={m} size="sm" variant="secondary" className="bg-surface shadow-surface">{m}</Chip>)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="no-print flex flex-wrap gap-2 md:flex-col md:items-stretch">
          <Button variant="primary" onPress={() => copiar(tudo(), "Ficha")}><Icon name="copy" className="icon-sm" />Copiar tudo</Button>
          <Button variant="secondary" onPress={() => window.print()}><Icon name="download" className="icon-sm" />Baixar PDF</Button>
          <Button variant="ghost" onPress={arquivar}><Icon name="archive" className="icon-sm" />{f.status === "arquivada" ? "Desarquivar" : "Arquivar"}</Button>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Bloco titulo="Dados pessoais" linhas={blocos["Dados pessoais"]} copiar={copiar} />
        <Bloco titulo="Contato de emergência" linhas={blocos["Contato de emergência"]} copiar={copiar} />
        <Bloco titulo="Endereço" linhas={blocos["Endereço"]} copiar={copiar} />
        <Bloco titulo="Saúde" linhas={blocos["Saúde"]} copiar={copiar} />
      </div>

      <p className="flex items-center gap-2 text-xs text-muted">
        <Icon name="lock" className="icon-sm" />Consentimento LGPD aceito em {new Date(f.lgpd_aceito_em).toLocaleString("pt-BR")}.
      </p>
    </Shell>
  );
}
