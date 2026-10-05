"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Description, Input, Label, Spinner, TextField, buttonVariants } from "@heroui/react";
import AuthCard, { Aviso } from "@/components/painel/AuthCard";
import Icon from "@/components/Icon";
import { supabase, semConfig } from "@/lib/supabase";

/**
 * Aceitar convite ou trocar senha. O link do e-mail traz a sessão;
 * no primeiro acesso também pede nome e CRP.
 */
export default function DefinirSenha() {
  const router = useRouter();
  const [pronto, setPronto] = useState<"esperando" | "ok" | "sem-sessao">("esperando");
  const [primeiro, setPrimeiro] = useState(false);
  const [nome, setNome] = useState("");
  const [crp, setCrp] = useState("");
  const [senha, setSenha] = useState("");
  const [senha2, setSenha2] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const sb = supabase();
    if (!sb) { setMsg(semConfig); setPronto("sem-sessao"); return; }
    // Link já usado ou vencido: o Supabase devolve #error_code=... em vez da sessão.
    if (/error_code=/.test(window.location.hash)) { setPronto("sem-sessao"); return; }
    let feito = false;
    const verificar = async () => {
      const { data } = await sb.auth.getSession();
      if (!data.session || feito) return false;
      feito = true;
      const { data: p } = await sb.from("psicologos").select("nome").eq("id", data.session.user.id).maybeSingle();
      setPrimeiro(!p?.nome);
      setPronto("ok");
      return true;
    };
    const { data: sub } = sb.auth.onAuthStateChange(() => { verificar(); });
    verificar();
    const t = setTimeout(async () => { if (!(await verificar()) && !feito) setPronto("sem-sessao"); }, 2500);
    return () => { clearTimeout(t); sub.subscription.unsubscribe(); };
  }, []);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    const sb = supabase(); if (!sb) return;
    if (primeiro && nome.trim().split(/\s+/).length < 2) { setMsg("Escreva nome e sobrenome."); return; }
    if (senha.length < 8) { setMsg("A senha precisa ter pelo menos 8 caracteres."); return; }
    if (senha !== senha2) { setMsg("As senhas não são iguais."); return; }
    setBusy(true); setMsg("");
    const { error } = await sb.auth.updateUser({ password: senha });
    if (error) { setBusy(false); setMsg(error.message.includes("different") ? "Use uma senha diferente da anterior." : "Não deu para salvar a senha. Tente de novo."); return; }
    if (primeiro) {
      const { data } = await sb.auth.getUser();
      if (data.user) await sb.from("psicologos").update({ nome: nome.trim(), crp: crp.trim() }).eq("id", data.user.id);
    }
    router.replace("/painel");
  }

  if (pronto === "esperando") return (
    <AuthCard>
      <p className="flex items-center justify-center gap-3 py-4 text-sm text-muted"><Spinner size="sm" color="current" />Abrindo seu convite…</p>
    </AuthCard>
  );

  if (pronto === "sem-sessao") return (
    <AuthCard titulo="Link expirado" texto={msg || "Esse link não vale mais. Peça um novo convite ou use \"Esqueci minha senha\" na tela de entrar."}>
      <a className={buttonVariants({ variant: "primary", size: "lg", fullWidth: true })} href="/entrar">Ir para entrar <Icon name="arrow-right" className="icon-sm" /></a>
    </AuthCard>
  );

  return (
    <AuthCard
      titulo={primeiro ? "Boas-vindas ao nimth" : "Nova senha"}
      texto={primeiro ? "Complete seus dados e crie uma senha para entrar." : "Crie uma nova senha para sua conta."}
      onSubmit={salvar}
    >
      {primeiro && <>
        <TextField value={nome} onChange={setNome} autoComplete="name" name="nome">
          <Label>Nome completo</Label>
          <Input placeholder="Como aparece para os pacientes" />
        </TextField>
        <TextField value={crp} onChange={setCrp} name="crp">
          <Label>CRP</Label>
          <Input placeholder="00/000000" />
        </TextField>
      </>}
      <TextField value={senha} onChange={setSenha} type="password" autoComplete="new-password" name="senha">
        <Label>Senha</Label>
        <Input />
        <Description>Pelo menos 8 caracteres.</Description>
      </TextField>
      <TextField value={senha2} onChange={setSenha2} type="password" autoComplete="new-password" name="senha2">
        <Label>Repita a senha</Label>
        <Input />
      </TextField>
      {msg && <Aviso>{msg}</Aviso>}
      <Button type="submit" variant="primary" size="lg" fullWidth isDisabled={busy} className="mt-1">
        {busy ? <Spinner size="sm" color="current" /> : <>Salvar e entrar <Icon name="arrow-right" className="icon-sm" /></>}
      </Button>
    </AuthCard>
  );
}
