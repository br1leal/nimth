import type { Metadata, Viewport } from "next";
import { fontes, themeColor, scriptTema } from "../fontes";
import "../globals.css";

const base = process.env.NEXT_PUBLIC_SITE_URL || "https://nimth.vercel.app";

/** Prévia do link (WhatsApp, iMessage etc.): título da marca e a estrelinha da Alegria. */
export const metadata: Metadata = {
  metadataBase: new URL(base),
  title: "Nimth.Psico | Ficha de Cadastro",
  description: "Preencha sua ficha antes da primeira sessão. Leva poucos minutos.",
  openGraph: {
    title: "Nimth.Psico | Ficha de Cadastro",
    description: "Preencha sua ficha antes da primeira sessão. Leva poucos minutos.",
    siteName: "Nimth.Psico",
    type: "website",
    locale: "pt_BR",
    images: [{ url: "/og-ficha.png", width: 1200, height: 630, alt: "Alegria, a estrelinha do nimth" }],
  },
  twitter: { card: "summary_large_image", images: ["/og-ficha.png"] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor };

/** Área do paciente: tela inicial e ficha. Visual próprio, sem o design system do painel. */
export default function LayoutPaciente({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={fontes} data-theme="light" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: scriptTema }} /></head>
      {/* suppressHydrationWarning: extensões do navegador (ex.: ColorZilla) injetam atributos no body */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
