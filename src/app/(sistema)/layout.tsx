import type { Metadata, Viewport } from "next";
import { fontes, themeColor, scriptTema } from "../fontes";
import "../globals.css";
import "../sistema.css";

export const metadata: Metadata = {
  title: "Nimth · Painel",
  description: "Área da psicóloga no nimth.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor };

/** Área da psicóloga: usa o design system (HeroUI + tema nimth). */
export default function LayoutSistema({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`ds ${fontes}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptTema }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
