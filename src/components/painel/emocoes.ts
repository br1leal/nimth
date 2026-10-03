// @ts-nocheck
import { CAST } from "@/lib/nimbo/cast";
/** Nome, cor e imagem de cada emoção, para mostrar na lista e na ficha. */
export function emocaoInfo(k?: string | null) {
  const d = k && CAST[k];
  if (!d) return null;
  return { nome: d.name as string, img: d.img as string, cor: d.c.e3 as string, claro: d.c.e1 as string, meio: d.c.e2 as string };
}
