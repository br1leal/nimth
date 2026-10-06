"use client";

import { useId, useMemo } from "react";
import { CAST } from "@/lib/nimbo/cast";
import { pecasDoPersonagem, palpebraDescanso } from "@/lib/nimbo/pecas";

/**
 * Personagem da emoção completo e parado: corpo, olhos, sobrancelhas, boca, braços e pernas.
 * Mesmo desenho da ficha do paciente (lib/nimbo/pecas.ts), sem animação.
 */
export default function Retrato({ emocao, className = "", titulo }: { emocao: string; className?: string; titulo?: string }) {
  const uid = "r" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const p = useMemo(() => {
    if (!(CAST as Record<string, unknown>)[emocao]) return null;
    const { d, W, H, r, L, limbs, face } = pecasDoPersonagem(emocao, uid);
    // olhos na posição de descanso (ex.: Calma e Tristeza meio fechados)
    const lid = palpebraDescanso(emocao, r);
    let i = 0;
    const rosto = face.replace(/<g class="lid" data-x="([\d.]+)" data-y="([\d.]+)"/g, (m: string, x: string, y: string) => `${m} transform="${lid(x, y, i++)}"`);
    // área com folga para braços e pernas que saem do corpo
    const u = r * 1.05, au = r * (L.armLen || 1.45), sw = r * 0.26;
    const ax = (L.armAt?.[0] || 0) * 10, ay = ((L.armAt?.[1] || 0) / 100) * H;
    const temBraco = L.arm && L.arm !== "none" && L.arm !== "crossed";
    const minX = Math.min(0, temBraco ? ax - 1.6 * au - sw : 0);
    const pernaY = L.legAt ? Math.max(...L.legAt.map((q: number[]) => (q[1] / 100) * H)) + 1.2 * u + sw : 0;
    const maxY = Math.max(H, pernaY, temBraco ? ay + 1.7 * au : 0);
    return { d, W, H, minX, maxY, limbs, rosto };
  }, [emocao, uid]);

  if (!p) return null;
  const largura = p.W - 2 * p.minX;
  return (
    <svg className={`retrato ${className}`} viewBox={`${p.minX} 0 ${largura} ${p.maxY}`} role={titulo ? "img" : undefined}
      aria-label={titulo} aria-hidden={titulo ? undefined : true}>
      <g className="retrato-membros" dangerouslySetInnerHTML={{ __html: p.limbs }} />
      <image href={p.d.img} x="0" y="0" width={p.W} height={p.H} />
      <g dangerouslySetInnerHTML={{ __html: p.rosto }} />
    </svg>
  );
}
