"use client";

import { useEffect, useRef, useState } from "react";
import { CORES, COR_PADRAO, aplicarCor, corSalva } from "@/lib/cores";

/**
 * Escolha da cor do tema: uma bolinha com a cor atual; ao tocar, abre as opções.
 * A cor pinta o balão do logo e os destaques do app (ficha e painel).
 */
export default function CorTema({ className = "", acima = true }: { className?: string; acima?: boolean }) {
  const [cor, setCor] = useState(COR_PADRAO);
  const [aberto, setAberto] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);

  useEffect(() => { setCor(corSalva()); }, []);
  useEffect(() => {
    if (!aberto) return;
    const fora = (e: PointerEvent) => { if (!caixa.current?.contains(e.target as Node)) setAberto(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setAberto(false); };
    window.addEventListener("pointerdown", fora, true); window.addEventListener("keydown", esc);
    return () => { window.removeEventListener("pointerdown", fora, true); window.removeEventListener("keydown", esc); };
  }, [aberto]);

  const escolher = (hex: string) => { setCor(hex); aplicarCor(hex); };
  const nomeAtual = CORES.find(c => c.hex.toLowerCase() === cor.toLowerCase())?.nome ?? "Personalizada";

  return (
    <div ref={caixa} className={`cor-tema ${acima ? "acima" : "abaixo"} ${className}`} onPointerDown={e => e.stopPropagation()}>
      <button type="button" className="cor-tema-botao" aria-haspopup="true" aria-expanded={aberto}
        aria-label={`Cor do tema: ${nomeAtual}. Trocar cor`} onClick={() => setAberto(a => !a)}>
        <span className="cor-tema-bola" style={{ background: cor }} />
      </button>
      {aberto && (
        <div className="cor-tema-painel" role="radiogroup" aria-label="Cor do tema">
          {CORES.map(c => {
            const on = c.hex.toLowerCase() === cor.toLowerCase();
            return (
              <button key={c.id} type="button" role="radio" aria-checked={on} aria-label={c.nome} title={c.nome}
                className={`cor-tema-opcao${on ? " on" : ""}`} style={{ ["--c" as string]: c.hex }} onClick={() => escolher(c.hex)} />
            );
          })}
        </div>
      )}
    </div>
  );
}
