"use client";
import { useEffect, useMemo, useState, type Key } from "react";
import Link from "next/link";
import { Button, Card, Chip, SearchField, Separator, Tabs, buttonVariants, toast } from "@heroui/react";
import Shell, { Carregando, Vazio } from "@/components/painel/Shell";
import EmocaoAvatar from "@/components/painel/EmocaoAvatar";
import Icon from "@/components/Icon";
import { usePsicologo } from "@/components/painel/usePsicologo";
import { emocaoInfo } from "@/components/painel/emocoes";
import { type Ficha, quando, idade } from "@/components/painel/tipos";
import { supabase, semConfig } from "@/lib/supabase";

type Filtro = "todas" | "nova" | "vista" | "arquivada";
const FILTROS: [Filtro, string][] = [["todas", "Todas"], ["nova", "Novas"], ["vista", "Vistas"], ["arquivada", "Arquivadas"]];
const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const noFiltro = (f: Ficha, k: Filtro) => (k === "todas" ? f.status !== "arquivada" : f.status === k);

function Numero({ rotulo, valor, destaque }: { rotulo: string; valor: number | string; destaque?: boolean }) {
  return (
    <Card className={`gap-1 p-4 md:p-5 ${destaque ? "bg-accent-soft" : ""}`}>
      <span className={`text-xs font-medium ${destaque ? "text-accent-soft-foreground" : "text-muted"}`}>{rotulo}</span>
      <span className={`font-serif text-[28px] leading-none md:text-[32px] ${destaque ? "text-accent-soft-foreground" : ""}`}>{valor}</span>
    </Card>
  );
}

/** Pacientes: resumo, link da ficha e lista de fichas com busca e filtros. */
export default function Pacientes() {
  const { psi, erro } = usePsicologo();
  const [fichas, setFichas] = useState<Ficha[] | null>(null);
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");

  useEffect(() => {
    if (!psi) return;
    supabase()!.from("fichas").select("id,nome,nascimento,telefone,emocao,motivos,intensidade,status,criado_em").order("criado_em", { ascending: false })
      .then(({ data }) => setFichas((data as Ficha[]) ?? []));
  }, [psi]);

  const link = psi && typeof window !== "undefined" ? `${window.location.origin}/f/${psi.slug}` : "";
  const copiarLink = async () => { await navigator.clipboard.writeText(link); toast.success("Link copiado", { description: "Agora é só colar na conversa com o paciente." }); };
  const whats = `https://wa.me/?text=${encodeURIComponent(`Oi! Antes da nossa sessão, você pode preencher sua ficha por aqui? Leva poucos minutos: ${link}`)}`;

  const lista = useMemo(() => {
    if (!fichas) return [];
    const t = semAcento(q.trim()), dig = t.replace(/\D/g, "");
    return fichas.filter(f => noFiltro(f, filtro) && (!t || semAcento(f.nome).includes(t) || (!!dig && (f.telefone ?? "").replace(/\D/g, "").includes(dig))));
  }, [fichas, q, filtro]);

  const conta = (k: Filtro) => fichas?.filter(f => noFiltro(f, k)).length ?? 0;
  const semana = fichas?.filter(f => Date.now() - new Date(f.criado_em).getTime() < 7 * 864e5).length ?? 0;

  if (erro) return <Shell><Vazio icon="alert" titulo="Algo não está certo">{erro === "config" ? semConfig : "Não encontramos seu perfil. Fale com o suporte."}</Vazio></Shell>;
  if (!psi) return <Shell><Carregando /></Shell>;

  return (
    <Shell psi={psi}>
      <header className="grid gap-1">
        <p className="text-sm text-muted">Olá, {psi.nome.split(/\s+/)[0] || "boas-vindas"}</p>
        <h1 className="font-serif text-[32px] leading-tight md:text-[40px]">Pacientes</h1>
      </header>

      <section className="grid grid-cols-3 gap-3" aria-label="Resumo">
        <Numero rotulo="Novas" valor={fichas ? conta("nova") : "–"} destaque />
        <Numero rotulo="Semana" valor={fichas ? semana : "–"} />
        <Numero rotulo="Ativas" valor={fichas ? conta("todas") : "–"} />
      </section>

      <Card className="link-ficha gap-4 p-5 md:flex-row md:items-center md:justify-between md:p-6">
        <div className="grid min-w-0 gap-1">
          <span className="font-mono text-[11px] tracking-[.08em] text-muted uppercase">Seu link da ficha</span>
          <span className="truncate text-[15px] font-medium">{link.replace(/^https?:\/\//, "")}</span>
          <span className="text-sm text-muted">Mande para o paciente preencher antes da primeira sessão.</span>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="primary" onPress={copiarLink}><Icon name="copy" className="icon-sm" />Copiar link</Button>
          <a className={buttonVariants({ variant: "secondary" })} href={whats} target="_blank" rel="noopener noreferrer"><Icon name="share" className="icon-sm" />WhatsApp</a>
        </div>
      </Card>

      <Card className="gap-0 p-0">
        <div className="grid gap-3 p-4 md:flex md:items-center md:justify-between md:p-5">
          <Tabs variant="secondary" selectedKey={filtro} onSelectionChange={(k: Key) => setFiltro(k as Filtro)} className="min-w-0">
            <Tabs.ListContainer>
              <Tabs.List aria-label="Filtrar fichas">
                {FILTROS.map(([k, t]) => (
                  <Tabs.Tab key={k} id={k}>
                    {t}{fichas && k !== "arquivada" && <span className="ml-1.5 hidden text-xs tabular-nums opacity-60 sm:inline">{conta(k)}</span>}
                    <Tabs.Indicator />
                  </Tabs.Tab>
                ))}
              </Tabs.List>
            </Tabs.ListContainer>
          </Tabs>
          <SearchField value={q} onChange={setQ} aria-label="Buscar paciente" className="md:w-72">
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input placeholder="Buscar por nome ou telefone" />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </div>
        <Separator />

        {!fichas ? <Carregando /> : lista.length === 0 ? (
          fichas.length === 0
            ? <Vazio titulo="Nenhuma ficha ainda">Copie seu link e mande para os pacientes. As fichas aparecem aqui assim que forem enviadas.</Vazio>
            : <Vazio icon="search" titulo="Nada encontrado">Tente outro nome, telefone ou filtro.</Vazio>
        ) : (
          <ul className="grid p-2">
            {lista.map(f => {
              const e = emocaoInfo(f.emocao), a = idade(f.nascimento);
              const meta = [a != null ? `${a} anos` : "", e && f.emocao !== "nimbo" ? e.nome : ""].filter(Boolean).join(" · ");
              return (
                <li key={f.id}>
                  <Link href={`/painel/${f.id}`} className="group flex items-center gap-3 rounded-2xl p-3 transition-colors hover:bg-default md:gap-4">
                    <EmocaoAvatar emocao={f.emocao} nome={f.nome} />
                    <span className="grid min-w-0 flex-1 gap-0.5">
                      <span className="truncate font-medium">{f.nome}</span>
                      <span className="truncate text-sm text-muted">{meta || "Sem emoção marcada"}</span>
                    </span>
                    <span className="grid shrink-0 justify-items-end gap-1">
                      {f.status === "nova" && <Chip size="sm" color="accent" variant="soft">Nova</Chip>}
                      <span className="text-xs text-muted tabular-nums">{quando(f.criado_em)}</span>
                    </span>
                    <Icon name="chevron-right" className="icon-sm shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </Shell>
  );
}
