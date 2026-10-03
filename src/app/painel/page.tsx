"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Shell, { Carregando } from "@/components/painel/Shell";
import Icon from "@/components/Icon";
import { usePsicologo } from "@/components/painel/usePsicologo";
import { emocaoInfo } from "@/components/painel/emocoes";
import { type Ficha, quando, idade } from "@/components/painel/tipos";
import { supabase, semConfig } from "@/lib/supabase";

type Filtro = "todas" | "nova" | "vista" | "arquivada";
const FILTROS: [Filtro, string][] = [["todas", "Todas"], ["nova", "Novas"], ["vista", "Vistas"], ["arquivada", "Arquivadas"]];
const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Pacientes: lista de fichas recebidas, com busca, filtros e o link para mandar aos pacientes. */
export default function Pacientes() {
  const { psi, erro } = usePsicologo();
  const [fichas, setFichas] = useState<Ficha[] | null>(null);
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!psi) return;
    supabase()!.from("fichas").select("id,nome,nascimento,telefone,emocao,motivos,intensidade,status,criado_em").order("criado_em", { ascending: false })
      .then(({ data }) => setFichas((data as Ficha[]) ?? []));
  }, [psi]);

  const link = psi && typeof window !== "undefined" ? `${window.location.origin}/f/${psi.slug}` : "";
  const say = (m: string) => { setToast(m); setTimeout(() => setToast(""), 2400); };
  const copiarLink = async () => { await navigator.clipboard.writeText(link); say("Link copiado"); };
  const whats = `https://wa.me/?text=${encodeURIComponent(`Oi! Antes da nossa sessão, você pode preencher sua ficha por aqui? Leva poucos minutos: ${link}`)}`;

  const lista = useMemo(() => {
    if (!fichas) return [];
    const t = semAcento(q.trim());
    return fichas.filter(f => (filtro === "todas" ? f.status !== "arquivada" : f.status === filtro) && (!t || semAcento(f.nome).includes(t) || (f.telefone ?? "").replace(/\D/g, "").includes(t.replace(/\D/g, "") || "§")));
  }, [fichas, q, filtro]);
  const novas = fichas?.filter(f => f.status === "nova").length ?? 0;

  if (erro) return <Shell><div className="pnl-vazio">{erro === "config" ? semConfig : "Não encontramos seu perfil. Fale com o suporte."}</div></Shell>;
  if (!psi) return <Shell><Carregando /></Shell>;

  return (
    <Shell nome={psi.nome.split(/\s+/)[0]}>
      <section className="pnl-head">
        <div>
          <h1>Pacientes</h1>
          <p>{fichas ? `${fichas.length} ${fichas.length === 1 ? "ficha" : "fichas"}${novas ? ` · ${novas} ${novas === 1 ? "nova" : "novas"}` : ""}` : " "}</p>
        </div>
      </section>

      <section className="meu-link">
        <div className="ml-txt">
          <span className="ml-rot">Seu link da ficha</span>
          <span className="ml-url">{link.replace(/^https?:\/\//, "")}</span>
        </div>
        <div className="ml-acoes">
          <button className="pnl-ghost" type="button" onClick={copiarLink}><Icon name="copy" className="icon-sm" />Copiar</button>
          <a className="pnl-ghost" href={whats} target="_blank" rel="noopener noreferrer"><Icon name="share" className="icon-sm" />WhatsApp</a>
        </div>
      </section>

      <div className="busca">
        <Icon name="search" className="icon-sm" />
        <input className="inp" type="search" placeholder="Buscar por nome ou telefone" value={q} onChange={e => setQ(e.target.value)} aria-label="Buscar paciente" />
      </div>
      <div className="filtros" role="tablist">
        {FILTROS.map(([k, t]) => <button key={k} role="tab" aria-selected={filtro === k} className={`filtro${filtro === k ? " on" : ""}`} onClick={() => setFiltro(k)}>{t}</button>)}
      </div>

      {!fichas ? <Carregando /> : lista.length === 0 ? (
        <div className="pnl-vazio">{fichas.length === 0 ? "Ainda não chegou nenhuma ficha. Mande seu link para os pacientes." : "Nenhuma ficha encontrada."}</div>
      ) : (
        <ul className="lista">
          {lista.map(f => {
            const e = emocaoInfo(f.emocao), a = idade(f.nascimento);
            return (
              <li key={f.id}>
                <Link href={`/painel/${f.id}`} className="item">
                  <span className="item-av" style={e ? { ["--av" as string]: e.claro } : undefined}>{e ? <img src={e.img} alt="" /> : f.nome[0]}</span>
                  <span className="item-txt">
                    <b>{f.nome}</b>
                    <small>{[a != null ? `${a} anos` : "", e && f.emocao !== "nimbo" ? e.nome : ""].filter(Boolean).join(" · ") || "—"}</small>
                  </span>
                  <span className="item-dir">
                    {f.status === "nova" && <span className="selo">Nova</span>}
                    <small>{quando(f.criado_em)}</small>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
      <div className={`toast${toast ? " on" : ""}`} role="status">{toast}</div>
    </Shell>
  );
}
