"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export type Psicologo = { id: string; nome: string; crp: string; slug: string };

/** Garante que há alguém logado; sem sessão, manda para /entrar. */
export function usePsicologo() {
  const router = useRouter();
  const [psi, setPsi] = useState<Psicologo | null>(null);
  const [erro, setErro] = useState("");
  useEffect(() => {
    const sb = supabase();
    if (!sb) { setErro("config"); return; }
    let vivo = true;
    sb.auth.getSession().then(async ({ data }) => {
      if (!data.session) { router.replace("/entrar"); return; }
      const { data: p, error } = await sb.from("psicologos").select("id,nome,crp,slug").eq("id", data.session.user.id).maybeSingle();
      if (!vivo) return;
      if (error || !p) { setErro("perfil"); return; }
      setPsi(p as Psicologo);
    });
    const { data: sub } = sb.auth.onAuthStateChange((ev) => { if (ev === "SIGNED_OUT") router.replace("/entrar"); });
    return () => { vivo = false; sub.subscription.unsubscribe(); };
  }, [router]);
  return { psi, erro };
}
