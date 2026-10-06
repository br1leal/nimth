"use client";
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

const CHAVE = "nimbo-theme";

/** Claro/escuro no design system: dois botões sol e lua num trilho. Mesma preferência da ficha do paciente. */
export default function TemaSwitch({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => {
    let d = false; // claro é o padrão; escuro só se a pessoa escolher
    try { const v = localStorage.getItem(CHAVE); if (v === "escuro") d = true; else if (v === "claro") d = false; } catch {}
    setDark(d);
  }, []);
  useEffect(() => { if (dark !== null) document.documentElement.setAttribute("data-theme", dark ? "dark" : "light"); }, [dark]);
  const escolher = (d: boolean) => { setDark(d); try { localStorage.setItem(CHAVE, d ? "escuro" : "claro"); } catch {} };

  const opc = (d: boolean, nome: "sun" | "moon", rot: string) => (
    <button
      type="button"
      aria-label={rot}
      aria-pressed={dark === d}
      onClick={() => escolher(d)}
      className={`grid size-8 cursor-pointer place-items-center rounded-full transition-colors ${dark === d ? "bg-surface text-foreground shadow-surface" : "text-muted hover:text-foreground"}`}
    >
      <Icon name={nome} className="icon-sm" />
    </button>
  );

  return (
    <div role="group" aria-label="Tema" className={`inline-flex items-center gap-0.5 rounded-full bg-default p-0.5 ${className}`}>
      {opc(false, "sun", "Tema claro")}
      {opc(true, "moon", "Tema escuro")}
    </div>
  );
}
