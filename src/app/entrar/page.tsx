"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase, semConfig } from "@/lib/supabase";

/** Entrada da psicóloga: e-mail e senha, com "esqueci minha senha". */
export default function Entrar() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modo, setModo] = useState<"entrar" | "esqueci">("entrar");
  const [estado, setEstado] = useState<"idle" | "busy">("idle");
  const [msg, setMsg] = useState<{ t: "err" | "ok"; s: string } | null>(null);

  useEffect(() => {
    if (/type=(invite|recovery|signup)|error_code=/.test(window.location.hash)) { window.location.replace("/definir-senha" + window.location.hash); return; }
    supabase()?.auth.getSession().then(({ data }) => { if (data.session) router.replace("/painel"); });
  }, [router]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const sb = supabase();
    if (!sb) { setMsg({ t: "err", s: semConfig }); return; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { setMsg({ t: "err", s: "Digite um e-mail válido." }); return; }
    setEstado("busy"); setMsg(null);
    if (modo === "esqueci") {
      const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/definir-senha` });
      setEstado("idle");
      setMsg(error ? { t: "err", s: "Não deu para enviar agora. Tente de novo em instantes." } : { t: "ok", s: "Se esse e-mail tiver conta, você vai receber um link para criar uma nova senha." });
      return;
    }
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: senha });
    setEstado("idle");
    if (error) { setMsg({ t: "err", s: "E-mail ou senha incorretos." }); return; }
    router.replace("/painel");
  }

  return (
    <div className="pnl pnl-auth">
      <form className="auth-card" onSubmit={enviar} noValidate>
        <Logo className="logo-auth" />
        <div className="auth-head">
          <h1>{modo === "entrar" ? "Área da psicóloga" : "Esqueci minha senha"}</h1>
          <p>{modo === "entrar" ? "Entre para ver as fichas dos seus pacientes." : "Enviamos um link para você criar uma nova senha."}</p>
        </div>
        <div className="field">
          <label htmlFor="a-email">E-mail</label>
          <input className="inp" id="a-email" type="email" autoComplete="email" inputMode="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@email.com" />
        </div>
        {modo === "entrar" && (
          <div className="field">
            <label htmlFor="a-senha">Senha</label>
            <input className="inp" id="a-senha" type="password" autoComplete="current-password" value={senha} onChange={e => setSenha(e.target.value)} />
          </div>
        )}
        {msg && <p className={`msg${msg.t === "err" ? " err" : ""}`}>{msg.t === "err" && <Icon name="alert" className="icon-sm" />}{msg.s}</p>}
        <button className="btn btn-icon" type="submit" disabled={estado === "busy"}>
          {estado === "busy" ? <Icon name="loader" className="spin" /> : modo === "entrar" ? <>Entrar <Icon name="arrow-right" /></> : "Enviar link"}
        </button>
        <button className="auth-link" type="button" onClick={() => { setModo(modo === "entrar" ? "esqueci" : "entrar"); setMsg(null); }}>
          {modo === "entrar" ? "Esqueci minha senha" : "Voltar para entrar"}
        </button>
        <p className="note"><Icon name="lock" className="icon-sm" />Acesso só por convite.</p>
      </form>
      <ThemeToggle />
    </div>
  );
}
