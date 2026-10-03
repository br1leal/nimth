"use client";
import { useEffect, useState } from "react";
import Icon from "@/components/Icon";

/** Chave sol/lua das telas da psicóloga (mesma preferência salva da ficha). */
export default function ThemeToggle() {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => {
    let d = matchMedia("(prefers-color-scheme: dark)").matches;
    try { const v = localStorage.getItem("nimbo-theme"); if (v === "escuro") d = true; else if (v === "claro") d = false; } catch {}
    setDark(d);
  }, []);
  useEffect(() => { if (dark !== null) document.documentElement.setAttribute("data-theme", dark ? "dark" : "light"); }, [dark]);
  const toggle = () => { const d = !dark; setDark(d); try { localStorage.setItem("nimbo-theme", d ? "escuro" : "claro"); } catch {} };
  return (
    <button className={`theme${dark ? " is-dark" : ""}`} type="button" role="switch" aria-checked={!!dark} aria-label="Modo escuro" onClick={toggle}>
      <span className="theme-knob" aria-hidden="true" />
      <Icon name="sun" className="icon-sm t-sun" />
      <Icon name="moon" className="icon-sm t-moon" />
    </button>
  );
}
