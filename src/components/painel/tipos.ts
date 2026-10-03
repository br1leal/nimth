export type Ficha = {
  id: string; nome: string; nascimento: string | null; telefone: string | null;
  dados: {
    endereco?: { cep?: string; rua?: string; numero?: string; complemento?: string; bairro?: string; cidade?: string; uf?: string };
    emergencia?: { nome?: string; telefone?: string };
    saude?: { medicamento?: boolean; medicamentos?: string; medico?: boolean; medicoNome?: string; medicoContato?: string };
  };
  emocao: string | null; motivos: string[]; intensidade: number | null;
  lgpd_aceito_em: string; lgpd_texto: string; status: "nova" | "vista" | "arquivada"; criado_em: string;
};
export const dataBR = (iso?: string | null) => {
  if (!iso) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) { const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; }
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
};
export const quando = (iso: string) => {
  const d = new Date(iso), hoje = new Date(), ontem = new Date(); ontem.setDate(hoje.getDate() - 1);
  const h = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  if (d.toDateString() === hoje.toDateString()) return `Hoje, ${h}`;
  if (d.toDateString() === ontem.toDateString()) return `Ontem, ${h}`;
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" }).replace(".", "");
};
export const idade = (iso?: string | null) => {
  if (!iso) return null; const b = new Date(iso + "T12:00:00"), n = new Date();
  let a = n.getFullYear() - b.getFullYear(); if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--; return a;
};
export const intensTexto = (n: number | null) => n == null ? "" : n < 40 ? "um pouco" : n < 70 ? "mais ou menos" : n < 90 ? "bastante" : "muito";
