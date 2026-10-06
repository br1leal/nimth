import { emocaoInfo } from "./emocoes";
import Retrato from "./Retrato";

/** Bolinha com o personagem da emoção do paciente, no tom da emoção. Sem emoção: inicial do nome. */
export default function EmocaoAvatar({ emocao, nome, tamanho = 44 }: { emocao?: string | null; nome: string; tamanho?: number }) {
  const e = emocaoInfo(emocao);
  return (
    <span
      className="emo-av grid shrink-0 place-items-center rounded-full font-medium text-muted"
      style={{ width: tamanho, height: tamanho, ["--av" as string]: e?.claro ?? "var(--default)" }}
      aria-hidden="true"
    >
      {e && emocao ? <span style={{ width: tamanho * 0.86, height: tamanho * 0.86 }} className="grid place-items-center"><Retrato emocao={emocao} className="size-full" /></span> : nome.trim()[0]?.toUpperCase()}
    </span>
  );
}
