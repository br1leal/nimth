"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Label, Spinner, TextField } from "@heroui/react";
import AuthCard, { Aviso } from "@/components/painel/AuthCard";
import Icon from "@/components/Icon";
import { supabase, semConfig } from "@/lib/supabase";

/** Entrada da psicóloga: e-mail e senha, com "esqueci minha senha". */
export default function Entrar() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [modo, setModo] = useState<"entrar" | "esqueci">("entrar");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ t: "danger" | "success"; s: string } | null>(null);

  useEffect(() => {
    if (/type=(invite|recovery|signup)|error_code=/.test(window.location.hash)) { window.location.replace("/definir-senha" + window.location.hash); return; }
    supabase()?.auth.getSession().then(({ data }) => { if (data.session) router.replace("/painel"); });
  }, [router]);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    const sb = supabase();
    if (!sb) { setMsg({ t: "danger", s: semConfig }); return; }
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setMsg({ t: "danger", s: "Digite um e-mail válido." }); return; }
    setBusy(true); setMsg(null);
    if (modo === "esqueci") {
      const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/definir-senha` });
      setBusy(false);
      setMsg(error ? { t: "danger", s: "Não deu para enviar agora. Tente de novo em instantes." } : { t: "success", s: "Se esse e-mail tiver conta, você vai receber um link para criar uma nova senha." });
      return;
    }
    const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: senha });
    setBusy(false);
    if (error) { setMsg({ t: "danger", s: "E-mail ou senha incorretos." }); return; }
    router.replace("/painel");
  }

  const trocar = () => { setModo(modo === "entrar" ? "esqueci" : "entrar"); setMsg(null); };

  return (
    <AuthCard
      titulo={modo === "entrar" ? "Área da psicóloga" : "Esqueci minha senha"}
      texto={modo === "entrar" ? "Entre para ver as fichas dos seus pacientes." : "Enviamos um link para você criar uma nova senha."}
      onSubmit={enviar}
      rodape={<span className="inline-flex items-center gap-1.5"><Icon name="lock" className="icon-sm" />Acesso só por convite.</span>}
    >
      <TextField value={email} onChange={setEmail} type="email" autoComplete="email" name="email">
        <Label>E-mail</Label>
        <Input placeholder="voce@email.com" inputMode="email" />
      </TextField>
      {modo === "entrar" && (
        <TextField value={senha} onChange={setSenha} type="password" autoComplete="current-password" name="senha">
          <div className="flex items-baseline justify-between">
            <Label>Senha</Label>
            <button type="button" onClick={trocar} className="cursor-pointer text-xs text-muted underline-offset-4 hover:text-foreground hover:underline">Esqueci minha senha</button>
          </div>
          <Input />
        </TextField>
      )}
      {msg && <Aviso tipo={msg.t}>{msg.s}</Aviso>}
      <Button type="submit" variant="primary" size="lg" fullWidth isDisabled={busy} className="mt-1">
        {busy ? <Spinner size="sm" color="current" /> : modo === "entrar" ? <>Entrar <Icon name="arrow-right" className="icon-sm" /></> : "Enviar link"}
      </Button>
      {modo === "esqueci" && <Button variant="ghost" fullWidth onPress={trocar}>Voltar para entrar</Button>}
    </AuthCard>
  );
}
