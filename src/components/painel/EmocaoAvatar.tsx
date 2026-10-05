import { emocaoInfo } from "./emocoes";

/** Bolinha com o personagem da emoção do paciente, no tom da emoção. Sem emoção: inicial do nome. */
export default function EmocaoAvatar({ emocao, nome, tamanho = 44 }: { emocao?: string | null; nome: string; tamanho?: number }) {
  const e = emocaoInfo(emocao);
  return (
    <span
      className="emo-av grid shrink-0 place-items-center rounded-full font-medium text-muted"
      style={{ width: tamanho, height: tamanho, ["--av" as string]: e?.claro ?? "var(--default)" }}
      aria-hidden="true"
    >
      {e ? <img src={e.img} alt="" style={{ width: tamanho * 0.82, height: tamanho * 0.82 }} className="object-contain" /> : nome.trim()[0]?.toUpperCase()}
    </span>
  );
}
