import { Young_Serif, IBM_Plex_Sans, IBM_Plex_Mono, Caveat } from "next/font/google";

const youngSerif = Young_Serif({ weight: "400", subsets: ["latin"], variable: "--font-young-serif", display: "swap" });
/* IBM Plex Sans (textos): Google Fonts, licença OFL. Mesma família da Plex Mono dos rótulos. */
const plexSans = IBM_Plex_Sans({ weight: ["400", "500", "600"], style: ["normal", "italic"], subsets: ["latin", "latin-ext"], variable: "--font-plex-sans", display: "swap" });
const plexMono = IBM_Plex_Mono({ weight: ["400", "500"], subsets: ["latin"], variable: "--font-plex-mono", display: "swap" });
const caveat = Caveat({ weight: "500", subsets: ["latin"], variable: "--font-caveat", display: "swap" });

/** Classes das fontes para o <html>. */
export const fontes = `${youngSerif.variable} ${plexSans.variable} ${plexMono.variable} ${caveat.variable}`;

/** Barra do navegador no tom claro (o claro é o tema padrão). */
export const themeColor = "#FAF8F4";

/** Claro é o padrão; escuro só se a pessoa escolheu. Aplica também a cor do tema salva. Roda antes da página aparecer (evita piscar). */
export const scriptTema = `try{var h=document.documentElement;if(localStorage.getItem('nimbo-theme')==='escuro')h.setAttribute('data-theme','dark');var c=localStorage.getItem('nimth-cor');if(/^#[0-9a-f]{6}$/i.test(c||''))h.style.setProperty('--marca',c);}catch(e){}`;
