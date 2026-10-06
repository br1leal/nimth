"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { Avatar, Button, Dropdown, Label, Spinner, Toast } from "@heroui/react";
import Logo from "@/components/Logo";
import Icon, { type IconName } from "@/components/Icon";
import TemaSwitch from "@/components/ui/TemaSwitch";
import { supabase } from "@/lib/supabase";
import type { Psicologo } from "./usePsicologo";

const iniciais = (nome = "") => nome.trim().split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join("").toUpperCase() || "N";
const sair = async () => { await supabase()?.auth.signOut(); window.location.href = "/entrar"; };

function ItemMenu({ href, icon, children, ativo, externo }: { href: string; icon: IconName; children: ReactNode; ativo?: boolean; externo?: boolean }) {
  return (
    <Link
      href={href}
      target={externo ? "_blank" : undefined}
      rel={externo ? "noopener noreferrer" : undefined}
      aria-current={ativo ? "page" : undefined}
      className={`flex h-10 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition-colors ${ativo ? "bg-accent-soft text-accent-soft-foreground" : "text-muted hover:bg-default hover:text-foreground"}`}
    >
      <Icon name={icon} />
      <span className="flex-1">{children}</span>
      {externo && <Icon name="external" className="icon-sm opacity-60" />}
    </Link>
  );
}

/**
 * Moldura do painel da psicóloga.
 * Computador: menu lateral fixo. Celular: barra no topo com menu da conta.
 */
export default function Shell({ children, psi }: { children: ReactNode; psi?: Psicologo | null }) {
  const path = usePathname();
  const fichaLink = psi ? `/f/${psi.slug}` : "#";
  const primeiro = psi?.nome.split(/\s+/)[0] ?? "";

  const conta = (
    <Dropdown>
      <Dropdown.Trigger className="rounded-full">
        <Avatar size="sm" color="accent" variant="soft"><Avatar.Fallback>{iniciais(psi?.nome)}</Avatar.Fallback></Avatar>
      </Dropdown.Trigger>
      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu aria-label="Conta" onAction={(k) => { if (k === "sair") sair(); if (k === "ficha") window.open(fichaLink, "_blank"); }}>
          <Dropdown.Item id="ficha" textValue="Ver minha ficha"><Icon name="external" className="icon-sm" /><Label>Ver minha ficha</Label></Dropdown.Item>
          <Dropdown.Item id="sair" textValue="Sair" variant="danger"><Icon name="logout" className="icon-sm" /><Label>Sair</Label></Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );

  return (
    <div className="min-h-dvh bg-background text-foreground md:grid md:grid-cols-[256px_minmax(0,1fr)]">
      <Toast.Provider placement="bottom" />

      {/* menu lateral (computador) */}
      <aside className="no-print sticky top-0 hidden h-dvh flex-col gap-8 border-r border-separator px-4 py-6 md:flex">
        <Link href="/painel" aria-label="Início do painel" className="px-3 text-foreground"><Logo className="h-8 w-auto" /></Link>
        <nav className="grid gap-1" aria-label="Menu">
          <ItemMenu href="/painel" icon="users" ativo={path.startsWith("/painel")}>Pacientes</ItemMenu>
          <ItemMenu href={fichaLink} icon="external" externo>Ver minha ficha</ItemMenu>
        </nav>
        <div className="mt-auto grid gap-4">
          <TemaSwitch className="justify-self-start" />
          <div className="flex items-center gap-3 rounded-3xl bg-surface p-3 shadow-surface">
            <Avatar size="sm" color="accent" variant="soft"><Avatar.Fallback>{iniciais(psi?.nome)}</Avatar.Fallback></Avatar>
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-sm font-medium">{psi?.nome || " "}</p>
              <p className="truncate text-xs text-muted">{psi?.crp ? `CRP ${psi.crp}` : "Psicóloga"}</p>
            </div>
            <Button isIconOnly size="sm" variant="ghost" aria-label="Sair" onPress={sair}><Icon name="logout" className="icon-sm" /></Button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        {/* barra do topo (celular) */}
        <header className="no-print sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-separator bg-background/80 px-5 backdrop-blur-xl md:hidden">
          <Link href="/painel" aria-label="Início do painel" className="text-foreground"><Logo className="h-7 w-auto" /></Link>
          <div className="flex items-center gap-2">
            {primeiro && <span className="text-sm text-muted max-[360px]:hidden">{primeiro}</span>}
            <TemaSwitch />
            {conta}
          </div>
        </header>

        <main className="mx-auto grid w-full max-w-[960px] gap-6 px-5 pt-6 pb-24 md:px-10 md:pt-10">{children}</main>
      </div>
    </div>
  );
}

export function Carregando({ texto = "Carregando…" }: { texto?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-20 text-sm text-muted">
      <Spinner size="sm" color="current" /> {texto}
    </div>
  );
}

export function Vazio({ icon = "inbox", titulo, children }: { icon?: IconName; titulo: string; children?: ReactNode }) {
  return (
    <div className="grid justify-items-center gap-2 px-6 py-14 text-center">
      <span className="mb-2 grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent-soft-foreground"><Icon name={icon} /></span>
      <p className="font-medium">{titulo}</p>
      {children && <div className="max-w-[36ch] text-sm text-muted">{children}</div>}
    </div>
  );
}
