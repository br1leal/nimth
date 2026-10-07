/**
 * Cor do tema do nimth. A cor escolhida pinta o balão do logo e o destaque do app inteiro
 * (botões, pílulas, foco, painel). Fica salva no aparelho da pessoa.
 */
export type Cor = { id: string; nome: string; hex: string };

export const CORES: Cor[] = [
  { id: "nimth", nome: "Roxo nimth", hex: "#5720EF" },
  { id: "azul", nome: "Azul", hex: "#4F5BFF" },
  { id: "calma", nome: "Lavanda", hex: "#8E5CF5" },
  { id: "tristeza", nome: "Céu", hex: "#2F7BEA" },
  { id: "ansiedade", nome: "Verde-água", hex: "#0E9F8F" },
  { id: "alegria", nome: "Laranja", hex: "#EE7A12" },
  { id: "raiva", nome: "Coral", hex: "#E5533D" },
];

export const CHAVE_COR = "nimth-cor";
export const COR_PADRAO = CORES[0].hex;
const valida = (v: string | null) => (v && /^#[0-9a-f]{6}$/i.test(v) ? v : null);

export function corSalva(): string {
  try { return valida(localStorage.getItem(CHAVE_COR)) ?? COR_PADRAO; } catch { return COR_PADRAO; }
}

export function aplicarCor(hex: string, salvar = true) {
  document.documentElement.style.setProperty("--marca", hex);
  if (salvar) { try { localStorage.setItem(CHAVE_COR, hex); } catch { /* sem armazenamento: vale só nesta visita */ } }
  window.dispatchEvent(new CustomEvent("nimth:cor", { detail: hex }));
}
