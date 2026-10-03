"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Shell, { Carregando } from "@/components/painel/Shell";
import Icon from "@/components/Icon";
import { usePsicologo } from "@/components/painel/usePsicologo";
import { emocaoInfo } from "@/components/painel/emocoes";
import { type Ficha, dataBR, idade, intensTexto } from "@/components/painel/tipos";
import { supabase } from "@/lib/supabase";

type Linha = [string, string];

/** Ficha do paciente: cada dado com botão de copiar, copiar tudo e baixar PDF (impressão). */
export default function FichaPaciente() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { psi } = usePsicologo();
  const [f, setF] = useState<Ficha | null | undefined>(undefined);
  const [toast, setToast] = useState("");
  const say = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2000); };

  useEffect(() => {
    if (!psi) return;
    const sb = supabase()!;
    sb.from("fichas").select("*").eq("id", id).maybeSingle().then(({ data }) => {
      setF((data as Ficha) ?? null);
      if (data && data.status === "nova") sb.from("fichas").update({ status: "vista" }).eq("id", id).then(() => {});
    });
  }, [psi, id]);

  if (!psi || f === undefined) return <Shell><Carregando /></Shell>;
  if (f === null) return <Shell><div className="pnl-vazio">Ficha não encontrada. <Link href="/painel">Voltar</Link></div></Shell>;

  const d = f.dados ?? {}, en = d.endereco ?? {}, em = d.emergencia ?? {}, sa = d.saude ?? {};
  const e = emocaoInfo(f.emocao), a = idade(f.nascimento);
  const endereco = [[en.rua, en.numero].filter(Boolean).join(", "), en.complemento, en.bairro, [en.cidade, en.uf].filter(Boolean).join(" / "), en.cep].filter(Boolean).join(" · ");

  const blocos: [string, Linha[]][] = [
    ["Dados pessoais", [["Nome completo", f.nome], ["Data de nascimento", f.nascimento ? `${dataBR(f.nascimento)}${a != null ? ` (${a} anos)` : ""}` : ""], ["Telefone", f.telefone ?? ""]]],
    ["Endereço", [["CEP", en.cep ?? ""], ["Rua e número", [en.rua, en.numero].filter(Boolean).join(", ")], ["Complemento", en.complemento ?? ""], ["Bairro", en.bairro ?? ""], ["Cidade / UF", [en.cidade, en.uf].filter(Boolean).join(" / ")], ["Endereço completo", endereco]]],
    ["Contato de emergência", [["Nome", em.nome ?? ""], ["Telefone", em.telefone ?? ""]]],
    ["Saúde", [["Usa medicamento?", sa.medicamento ? "Sim" : "Não"], ...(sa.medicamento ? [["Quais", sa.medicamentos ?? ""] as Linha] : []), ["Acompanhado(a) por médico?", sa.medico ? "Sim" : "Não"], ...(sa.medico ? [["Médico", sa.medicoNome ?? ""] as Linha, ["Contato do médico", sa.medicoContato ?? ""] as Linha] : [])]],
  ];

  const copiar = async (t: string, rot: string) => { if (!t) return; await navigator.clipboard.writeText(t); say(`${rot} copiado`); };
  const tudo = () => [
    `Ficha de ${f.nome}`, `Enviada em ${dataBR(f.criado_em)}`, "",
    ...(e && f.emocao !== "nimbo" ? [`Como chegou: ${e.nome}${f.intensidade != null ? ` (${intensTexto(f.intensidade)})` : ""}${f.motivos?.length ? ` · ${f.motivos.join(", ")}` : ""}`, ""] : []),
    ...blocos.flatMap(([t, ls]) => [t.toUpperCase(), ...ls.filter(([k, v]) => v && k !== "Endereço completo").map(([k, v]) => `${k}: ${v}`), ""]),
  ].join("\n");
  const arquivar = async () => {
    const novo = f.status === "arquivada" ? "vista" : "arquivada";
    await supabase()!.from("fichas").update({ status: novo }).eq("id", f.id);
    if (novo === "arquivada") router.push("/painel"); else setF({ ...f, status: novo });
  };

  return (
    <Shell nome={psi.nome.split(/\s+/)[0]}>
      <Link href="/painel" className="pnl-back no-print"><Icon name="arrow-left" className="icon-sm" />Pacientes</Link>

      <section className="fp-head" style={e ? { ["--fe1" as string]: e.claro, ["--fe3" as string]: e.cor } : undefined}>
        {e && <img className="fp-char" src={e.img} alt="" />}
        <div>
          <h1>{f.nome}</h1>
          <p>Enviada em {dataBR(f.criado_em)}{a != null ? ` · ${a} anos` : ""}</p>
          {e && f.emocao !== "nimbo" && (
            <div className="fp-emo">
              <span className="fp-emo-nome">Chegou com {e.nome.toLowerCase()}{f.intensidade != null ? ` · ${intensTexto(f.intensidade)}` : ""}</span>
              {f.motivos?.length > 0 && <span className="fp-motivos">{f.motivos.map(m => <span key={m}>{m}</span>)}</span>}
            </div>
          )}
        </div>
      </section>

      <div className="fp-acoes no-print">
        <button className="pnl-ghost" type="button" onClick={() => copiar(tudo(), "Ficha")}><Icon name="copy" className="icon-sm" />Copiar tudo</button>
        <button className="pnl-ghost" type="button" onClick={() => window.print()}><Icon name="download" className="icon-sm" />Baixar PDF</button>
        <button className="pnl-ghost" type="button" onClick={arquivar}><Icon name="archive" className="icon-sm" />{f.status === "arquivada" ? "Desarquivar" : "Arquivar"}</button>
      </div>

      {blocos.map(([titulo, linhas]) => (
        <section className="card fp-bloco" key={titulo}>
          <h3>{titulo}</h3>
          <dl>
            {linhas.map(([k, v]) => (
              <div className="fp-linha" key={k}>
                <dt>{k}</dt>
                <dd>{v || <span className="vazio">—</span>}</dd>
                {v && <button type="button" className="fp-copy no-print" aria-label={`Copiar ${k}`} onClick={() => copiar(v, k)}><Icon name="copy" className="icon-sm" /></button>}
              </div>
            ))}
          </dl>
        </section>
      ))}

      <p className="note fp-lgpd"><Icon name="lock" className="icon-sm" />Consentimento LGPD aceito em {new Date(f.lgpd_aceito_em).toLocaleString("pt-BR")}.</p>
      <div className={`toast${toast ? " on" : ""}`} role="status">{toast}</div>
    </Shell>
  );
}
