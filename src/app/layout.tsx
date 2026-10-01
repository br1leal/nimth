import type { Metadata, Viewport } from "next";
import { Young_Serif, IBM_Plex_Mono, Caveat } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const youngSerif = Young_Serif({ weight: "400", subsets: ["latin"], variable: "--font-young-serif", display: "swap" });
/* Switzer (textos): Fontshare, licença ITF Free Font License, arquivos em src/app/fonts */
const switzer = localFont({
  src: [
    { path: "./fonts/switzer-400.woff2", weight: "400" },
    { path: "./fonts/switzer-500.woff2", weight: "500" },
    { path: "./fonts/switzer-600.woff2", weight: "600" },
  ],
  variable: "--font-switzer",
  display: "swap",
});
const plexMono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-plex-mono", display: "swap" });
const caveat = Caveat({ weight: "500", subsets: ["latin"], variable: "--font-caveat", display: "swap" });

export const metadata: Metadata = {
  title: "Nimth · Ficha de cadastro",
  description: "Ficha de cadastro do paciente, com personagens que acolhem cada emoção.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF8F4" },
    { media: "(prefers-color-scheme: dark)", color: "#111016" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${youngSerif.variable} ${switzer.variable} ${plexMono.variable} ${caveat.variable}`} suppressHydrationWarning>
      {/* suppressHydrationWarning: extensões do navegador (ex.: ColorZilla) injetam atributos no body */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
