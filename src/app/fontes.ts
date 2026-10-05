import { Young_Serif, IBM_Plex_Mono, Caveat } from "next/font/google";
import localFont from "next/font/local";

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

/** Classes das fontes para o <html>. */
export const fontes = `${youngSerif.variable} ${switzer.variable} ${plexMono.variable} ${caveat.variable}`;

export const themeColor = [
  { media: "(prefers-color-scheme: light)", color: "#FAF8F4" },
  { media: "(prefers-color-scheme: dark)", color: "#111016" },
];

/** Aplica o tema salvo antes da página aparecer (evita piscar claro→escuro). */
export const scriptTema = `try{var t=localStorage.getItem('nimbo-theme');if(t==='escuro')document.documentElement.setAttribute('data-theme','dark');else if(t==='claro')document.documentElement.setAttribute('data-theme','light');}catch(e){}`;
