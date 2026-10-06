/**
 * Especialidades médicas para a ficha.
 * Cada uma tem apelidos (como as pessoas falam: "endócrino", "psiquiatra", "cardio")
 * para a busca achar mesmo quando a pessoa digita do jeito dela.
 */
export type Especialidade = { nome: string; apelidos: string[] };

export const ESPECIALIDADES: Especialidade[] = [
  { nome: "Psiquiatria", apelidos: ["psiquiatra", "psiquiatrico"] },
  { nome: "Clínica geral", apelidos: ["clinico", "clinico geral", "generalista", "medico geral"] },
  { nome: "Medicina de família", apelidos: ["medico de familia", "familia", "posto", "ubs"] },
  { nome: "Endocrinologia", apelidos: ["endocrino", "endocrinologista", "tireoide", "diabetes", "hormonio"] },
  { nome: "Neurologia", apelidos: ["neuro", "neurologista", "enxaqueca", "epilepsia"] },
  { nome: "Cardiologia", apelidos: ["cardio", "cardiologista", "coracao", "pressao"] },
  { nome: "Ginecologia e obstetrícia", apelidos: ["gineco", "ginecologista", "obstetra", "gestacao", "gravidez", "pre-natal"] },
  { nome: "Gastroenterologia", apelidos: ["gastro", "gastroenterologista", "estomago", "intestino"] },
  { nome: "Dermatologia", apelidos: ["dermato", "dermatologista", "pele"] },
  { nome: "Reumatologia", apelidos: ["reumato", "reumatologista", "fibromialgia", "artrite"] },
  { nome: "Pediatria", apelidos: ["pediatra"] },
  { nome: "Psiquiatria da infância e adolescência", apelidos: ["psiquiatra infantil", "psiquiatria infantil"] },
  { nome: "Neuropediatria", apelidos: ["neuropediatra", "neurologista infantil", "neuro infantil"] },
  { nome: "Geriatria", apelidos: ["geriatra", "idoso"] },
  { nome: "Oncologia", apelidos: ["oncologista", "oncologia clinica", "cancer"] },
  { nome: "Ortopedia", apelidos: ["ortopedista", "ossos", "coluna", "joelho"] },
  { nome: "Otorrinolaringologia", apelidos: ["otorrino", "ouvido", "nariz", "garganta"] },
  { nome: "Oftalmologia", apelidos: ["oftalmo", "oftalmologista", "oculista", "olhos"] },
  { nome: "Pneumologia", apelidos: ["pneumo", "pneumologista", "pulmao", "asma"] },
  { nome: "Nefrologia", apelidos: ["nefro", "nefrologista", "rim", "rins"] },
  { nome: "Urologia", apelidos: ["urologista", "prostata"] },
  { nome: "Infectologia", apelidos: ["infecto", "infectologista", "hiv"] },
  { nome: "Hematologia", apelidos: ["hemato", "hematologista", "sangue", "anemia"] },
  { nome: "Alergia e imunologia", apelidos: ["alergista", "imunologista", "alergia"] },
  { nome: "Nutrologia", apelidos: ["nutrologo", "obesidade"] },
  { nome: "Medicina do sono", apelidos: ["sono", "insonia", "apneia"] },
  { nome: "Medicina da dor", apelidos: ["dor", "dor cronica"] },
  { nome: "Medicina esportiva", apelidos: ["esporte", "medico do esporte"] },
  { nome: "Fisiatria", apelidos: ["fisiatra", "reabilitacao"] },
  { nome: "Cirurgia geral", apelidos: ["cirurgiao", "cirurgia"] },
  { nome: "Cirurgia bariátrica", apelidos: ["bariatrica", "bariatrico"] },
  { nome: "Cirurgia vascular", apelidos: ["vascular", "angiologia", "angiologista", "varizes"] },
  { nome: "Coloproctologia", apelidos: ["procto", "proctologista"] },
  { nome: "Mastologia", apelidos: ["mastologista", "mama"] },
  { nome: "Neurocirurgia", apelidos: ["neurocirurgiao"] },
  { nome: "Hepatologia", apelidos: ["hepatologista", "figado"] },
  { nome: "Genética médica", apelidos: ["geneticista", "genetica"] },
  { nome: "Acupuntura", apelidos: ["acupunturista"] },
  { nome: "Homeopatia", apelidos: ["homeopata"] },
];

/** As que mais aparecem num consultório de psicologia, nesta ordem: primeiras opções da lista e atalhos de um toque. */
export const MAIS_COMUNS = ["Psiquiatria", "Endocrinologia", "Neurologia", "Clínica geral", "Ginecologia e obstetrícia", "Cardiologia", "Gastroenterologia", "Geriatria"];

/** Psiquiatria (inclusive a da infância): nome e contato do médico são obrigatórios. */
export const exigeMedico = (nome: string) => semAcento(nome).startsWith("psiquiatria");

export const semAcento = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/**
 * Busca tolerante: ignora acento e maiúscula, olha nome e apelidos.
 * Ordem: nome começa com o texto > apelido começa > nome contém > apelido contém.
 */
export function buscarEspecialidades(q: string, fora: string[] = [], limite = 6): string[] {
  const t = semAcento(q);
  if (!t) return [];
  const ja = new Set(fora.map(semAcento));
  const pontos: [string, number][] = [];
  for (const e of ESPECIALIDADES) {
    if (ja.has(semAcento(e.nome))) continue;
    const n = semAcento(e.nome), ap = e.apelidos.map(semAcento);
    const p =
      n.startsWith(t) ? 0 :
      ap.some(a => a.startsWith(t)) ? 1 :
      n.split(/\s+/).some(w => w.length > 2 && w.startsWith(t)) ? 2 :
      n.includes(t) ? 3 :
      ap.some(a => a.includes(t)) ? 4 : -1;
    if (p >= 0 && (t.length > 1 || p <= 2)) pontos.push([e.nome, p]); // com 1 letra, só o que começa com ela
  }
  // no mesmo nível de acerto, as mais comuns vêm primeiro
  const peso = (n: string) => { const i = MAIS_COMUNS.indexOf(n); return i < 0 ? 99 : i; };
  return pontos.sort((a, b) => a[1] - b[1] || peso(a[0]) - peso(b[0])).slice(0, limite).map(([n]) => n);
}

/** Nome oficial se o texto bater exatamente com um nome ou apelido ("endocrino" vira "Endocrinologia"). */
export function nomeOficial(q: string): string | null {
  const t = semAcento(q);
  const e = ESPECIALIDADES.find(x => semAcento(x.nome) === t || x.apelidos.some(a => semAcento(a) === t));
  return e?.nome ?? null;
}
