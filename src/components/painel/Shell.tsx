"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/lib/supabase";

/** Moldura das telas da psicóloga: topo com logo e sair, conteúdo rolável, chave de tema. */
export default function Shell({ children, nome }: { children: ReactNode; nome?: string }) {
  const sair = async () => { await supabase()?.auth.signOut(); window.location.href = "/entrar"; };
  return (
    <div className="pnl">
      <header className="pnl-top">
        <Link href="/painel" className="pnl-logo" aria-label="Início do painel"><Logo className="logo-sm" /></Link>
        <div className="pnl-user">
          {nome && <span className="pnl-nome">{nome}</span>}
          <ThemeToggle />
          <button className="pnl-ghost" type="button" onClick={sair} aria-label="Sair"><Icon name="logout" className="icon-sm" /><span className="pnl-sair">Sair</span></button>
        </div>
      </header>
      <main className="pnl-main">{children}</main>
    </div>
  );
}

export function Carregando({ texto = "Carregando…" }: { texto?: string }) {
  return <div className="pnl-vazio"><Icon name="loader" className="spin" /> {texto}</div>;
}
