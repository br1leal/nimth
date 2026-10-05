import type { Metadata, Viewport } from "next";
import { fontes, themeColor } from "../fontes";
import "../globals.css";

export const metadata: Metadata = {
  title: "Nimth · Ficha de cadastro",
  description: "Ficha de cadastro do paciente, com personagens que acolhem cada emoção.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor };

/** Área do paciente: tela inicial e ficha. Visual próprio, sem o design system do painel. */
export default function LayoutPaciente({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={fontes} suppressHydrationWarning>
      {/* suppressHydrationWarning: extensões do navegador (ex.: ColorZilla) injetam atributos no body */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
