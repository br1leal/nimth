"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente do Supabase usado no navegador.
 * As chaves vêm do .env.local (e das variáveis da Vercel):
 *   NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY
 * A chave "anon" é pública por natureza; quem protege os dados são as regras (RLS) do banco.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;
export function supabase(): SupabaseClient | null {
  if (!url || !key) return null;
  if (!client) client = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "implicit" } });
  return client;
}
export const semConfig = "O app ainda não está ligado ao banco. Confira as chaves do Supabase no .env.local.";

/** Texto exato do consentimento, gravado junto com cada ficha. */
export const TEXTO_LGPD = "Autorizo o uso destes dados, inclusive os de saúde, pela minha psicóloga, apenas para o meu atendimento, conforme a LGPD.";
