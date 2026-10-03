"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";
import ThemeToggle from "@/components/ThemeToggle";
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

  return (
    <div className="pnl pnl-auth">
      <form className="auth-card" onSubmit={salvar} noValidate>
        <Logo className="logo-auth" />
        {pronto === "esperando" && <p className="auth-wait"><Icon name="loader" className="spin" /> Abrindo seu convite…</p>}
        {pronto === "sem-sessao" && (
          <div className="auth-head">
            <h1>Link expirado</h1>
            <p>{msg || "Esse link não vale mais. Peça um novo convite ou use \"Esqueci minha senha\" na tela de entrar."}</p>
            <a className="btn btn-icon" href="/entrar">Ir para entrar <Icon name="arrow-right" /></a>
          </div>
        )}
        {pronto === "ok" && <>
          <div className="auth-head">
            <h1>{primeiro ? "Boas-vindas ao nimth" : "Nova senha"}</h1>
            <p>{primeiro ? "Complete seus dados e crie uma senha para entrar." : "Crie uma nova senha para sua conta."}</p>
          </div>
          {primeiro && <>
            <div className="field"><label htmlFor="d-nome">Nome completo</label><input className="inp" id="d-nome" autoComplete="name" value={nome} onChange={e => setNome(e.target.value)} /></div>
            <div className="field"><label htmlFor="d-crp">CRP</label><input className="inp" id="d-crp" value={crp} onChange={e => setCrp(e.target.value)} placeholder="00/000000" /></div>
          </>}
          <div className="field"><label htmlFor="d-s1">Senha</label><input className="inp" id="d-s1" type="password" autoComplete="new-password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="Pelo menos 8 caracteres" /></div>
          <div className="field"><label htmlFor="d-s2">Repita a senha</label><input className="inp" id="d-s2" type="password" autoComplete="new-password" value={senha2} onChange={e => setSenha2(e.target.value)} /></div>
          {msg && <p className="msg err"><Icon name="alert" className="icon-sm" />{msg}</p>}
          <button className="btn btn-icon" type="submit" disabled={busy}>{busy ? <Icon name="loader" className="spin" /> : <>Salvar e entrar <Icon name="arrow-right" /></>}</button>
        </>}
      </form>
      <ThemeToggle />
    </div>
  );
}
