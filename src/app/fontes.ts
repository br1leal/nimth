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

/** Barra do navegador no tom claro (o claro é o tema padrão). */
export const themeColor = "#FAF8F4";

/** Claro é o padrão; escuro só se a pessoa escolheu. Roda antes da página aparecer (evita piscar). */
export const scriptTema = `try{if(localStorage.getItem('nimbo-theme')==='escuro')document.documentElement.setAttribute('data-theme','dark');}catch(e){}`;
