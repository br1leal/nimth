import type { Metadata } from "next";
import PatientForm from "@/components/PatientForm";

type Props = { params: Promise<{ slug: string }> };

/** Nome da psicóloga pelo link (função pública do banco; não expõe mais nada). */
async function nomeDaPsicologa(slug: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const r = await fetch(`${url}/rest/v1/rpc/psicologo_do_link`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ p_slug: slug }),
      next: { revalidate: 3600 },
    });
    if (!r.ok) return null;
    const data = (await r.json()) as { nome?: string }[];
    return data?.[0]?.nome?.trim() || null;
  } catch {
    return null;
  }
}

/** Prévia do link da ficha: "Nimth.Psico - Jéssica Campos | Ficha de Cadastro", com a estrelinha da Alegria. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const nome = await nomeDaPsicologa(slug.toLowerCase());
  const titulo = nome ? `Nimth.Psico - ${nome} | Ficha de Cadastro` : "Nimth.Psico | Ficha de Cadastro";
  const texto = nome
    ? `Preencha sua ficha antes da primeira sessão com ${nome.split(/\s+/)[0]}. Leva poucos minutos.`
    : "Preencha sua ficha antes da primeira sessão. Leva poucos minutos.";
  return {
    title: titulo,
    description: texto,
    openGraph: { title: titulo, description: texto, siteName: "Nimth.Psico", type: "website", locale: "pt_BR",
      images: [{ url: "/og-ficha.png", width: 1200, height: 630, alt: "Alegria, a estrelinha do nimth" }] },
    twitter: { card: "summary_large_image", title: titulo, description: texto, images: ["/og-ficha.png"] },
  };
}

/** Link da ficha de cada psicóloga: /f/<slug> */
export default async function FichaDoPsicologo({ params }: Props) {
  const { slug } = await params;
  return <PatientForm slug={slug.toLowerCase()} />;
}
