"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Icon from "@/components/Icon";
import Especialidades from "@/components/Especialidades";
import { supabase, semConfig, TEXTO_LGPD } from "@/lib/supabase";

/**
 * Ficha de cadastro do paciente.
 * Máscaras (CEP, telefone, data), busca do endereço pelo CEP (ViaCEP, com BrasilAPI de reserva),
 * perguntas Sim/Não que abrem os campos extras e validação no envio.
 * Protótipo: nada é enviado ainda.
 */

type YN = "" | "sim" | "nao";
type Values = {
  nome: string; nascimento: string; telefone: string;
  cep: string; rua: string; numero: string; complemento: string; bairro: string; cidade: string; uf: string;
  emergNome: string; emergTel: string;
  med: YN; medQuais: string;
  medico: YN; esp: string[]; docs: Record<string, { nome: string; contato: string }>;
  lgpd: boolean;
};
type Key = keyof Values;
type CepStatus = "idle" | "loading" | "ok" | "notfound" | "error";

const EMPTY: Values = {
  nome: "", nascimento: "", telefone: "",
  cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "",
  emergNome: "", emergTel: "",
  med: "", medQuais: "", medico: "", esp: [], docs: {},
  lgpd: false,
};

/* ordem dos campos na tela, para focar o primeiro com erro */
const ORDER: Key[] = ["nome", "nascimento", "telefone", "cep", "rua", "numero", "bairro", "cidade", "uf", "emergNome", "emergTel", "med", "medQuais", "medico", "esp", "lgpd"];

const digits = (v: string) => v.replace(/\D/g, "");
const maskCep = (v: string) => { const d = digits(v).slice(0, 8); return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d; };
const maskDate = (v: string) => { const d = digits(v).slice(0, 8); return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join("/"); };
const maskPhone = (v: string) => {
  const d = digits(v).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  const ddd = d.slice(0, 2), n = d.slice(2), cut = n.length > 8 ? 5 : 4;
  return n.length > cut ? `(${ddd}) ${n.slice(0, cut)}-${n.slice(cut)}` : `(${ddd}) ${n}`;
};
const validPhone = (v: string) => { const n = digits(v).length; return n === 10 || n === 11; };
function validDate(v: string) {
  const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/); if (!m) return false;
  const [d, mo, y] = [+m[1], +m[2], +m[3]], dt = new Date(y, mo - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === mo - 1 && dt.getDate() === d && y > 1900 && dt <= new Date();
}

async function fetchJson(url: string, ms = 6000) {
  const ctl = new AbortController(), t = setTimeout(() => ctl.abort(), ms);
  try { const r = await fetch(url, { signal: ctl.signal }); return { status: r.status, data: r.ok ? await r.json() : null }; }
  finally { clearTimeout(t); }
}
type Address = { rua: string; bairro: string; cidade: string; uf: string } | null;
async function lookupCep(cep: string): Promise<Address> {
  try {
    const { data } = await fetchJson(`https://viacep.com.br/ws/${cep}/json/`);
    if (data && !data.erro) return { rua: data.logradouro || "", bairro: data.bairro || "", cidade: data.localidade || "", uf: data.uf || "" };
    if (data?.erro) return null;
  } catch { /* tenta a reserva */ }
  const { status, data } = await fetchJson(`https://brasilapi.com.br/api/cep/v1/${cep}`);
  if (status === 404) return null;
  if (!data) throw new Error("cep");
  return { rua: (data.street || "").split(" - ")[0], bairro: data.neighborhood || "", cidade: data.city || "", uf: data.state || "" };
}

function Field({ id, label, required, error, hint, children }: { id: string; label: string; required?: boolean; error?: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className={`field${error ? " has-error" : ""}`}>
      <label htmlFor={id}>{label}{required && <em aria-hidden="true"> *</em>}</label>
      {children}
      {error ? (
        <p className="msg err" id={`${id}-msg`}><Icon name="alert" className="icon-sm" />{error}</p>
      ) : hint ? (
        <p className="msg" id={`${id}-msg`}>{hint}</p>
      ) : null}
    </div>
  );
}

function YesNo({ id, label, value, error, onChange }: { id: string; label: string; value: YN; error?: string; onChange: (v: YN) => void }) {
  return (
    <div className={`field${error ? " has-error" : ""}`}>
      <span className="rotulo" id={`${id}-label`}>{label}<em aria-hidden="true"> *</em></span>
      <div className="seg" role="radiogroup" aria-labelledby={`${id}-label`} aria-required="true" id={id}>
        {([["sim", "Sim"], ["nao", "Não"]] as const).map(([v, t]) => (
          <label key={v} className="seg-opt">
            <input type="radio" name={id} value={v} checked={value === v} onChange={() => onChange(v)} />
            <span>{t}</span>
          </label>
        ))}
      </div>
      {error && <p className="msg err"><Icon name="alert" className="icon-sm" />{error}</p>}
    </div>
  );
}

/** Nome e contato do médico de uma especialidade: fechado numa linha, abre ao tocar. */
function MedicoDe({ esp, valor, onChange }: { esp: string; valor?: { nome: string; contato: string }; onChange: (v: { nome: string; contato: string }) => void }) {
  const d = valor ?? { nome: "", contato: "" };
  const [aberto, setAberto] = useState(!!(d.nome || d.contato));
  const nomeRef = useRef<HTMLInputElement>(null);
  const resumo = [d.nome, d.contato].filter(Boolean).join(" · ");
  return (
    <div className={`esp-doc${aberto ? " aberto" : ""}`}>
      <button type="button" className="esp-doc-t" aria-expanded={aberto}
        onClick={() => { setAberto(a => !a); if (!aberto) requestAnimationFrame(() => nomeRef.current?.focus()); }}>
        <span className="esp-doc-nome">{esp}</span>
        <span className="esp-doc-acao">{aberto ? "Fechar" : resumo || <><Icon name="plus" className="icon-xs" />Nome e contato</>}</span>
      </button>
      {aberto && (
        <div className="esp-doc-campos">
          <input ref={nomeRef} className="inp" value={d.nome} onChange={e => onChange({ ...d, nome: e.target.value })} placeholder="Nome do(a) médico(a)" aria-label={`Nome do médico de ${esp}`} autoComplete="off" />
          <input className="inp" value={d.contato} onChange={e => onChange({ ...d, contato: e.target.value })} placeholder="Telefone ou e-mail" aria-label={`Contato do médico de ${esp}`} autoComplete="off" />
        </div>
      )}
    </div>
  );
}

export default function FichaForm({ slug, onEnviado }: { slug?: string; onEnviado?: () => void }) {
  const [envio, setEnvio] = useState<"idle" | "sending" | "done">("idle");
  const [v, setV] = useState<Values>(EMPTY);
  const [err, setErr] = useState<Partial<Record<Key, string>>>({});
  const [cepStatus, setCepStatus] = useState<CepStatus>("idle");
  const [toast, setToast] = useState("");
  const cepReq = useRef(0), toastT = useRef<ReturnType<typeof setTimeout>>(undefined);
  const numeroRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => clearTimeout(toastT.current), []);
  const say = (m: string) => { setToast(m); clearTimeout(toastT.current); toastT.current = setTimeout(() => setToast(""), 2800); };

  const set = <K extends Key>(k: K, val: Values[K]) => {
    setV(p => ({ ...p, [k]: val }));
    if (err[k]) setErr(p => ({ ...p, [k]: undefined }));
  };

  async function onCep(raw: string) {
    const masked = maskCep(raw); set("cep", masked);
    const cep = digits(masked);
    if (cep.length < 8) { cepReq.current++; setCepStatus("idle"); return; }
    const req = ++cepReq.current; setCepStatus("loading");
    try {
      const a = await lookupCep(cep);
      if (req !== cepReq.current) return;
      if (!a) { setCepStatus("notfound"); return; }
      setV(p => ({ ...p, rua: a.rua, bairro: a.bairro, cidade: a.cidade, uf: a.uf }));
      setErr(p => ({ ...p, rua: undefined, bairro: undefined, cidade: undefined, uf: undefined }));
      setCepStatus("ok");
      requestAnimationFrame(() => numeroRef.current?.focus());
    } catch {
      if (req === cepReq.current) setCepStatus("error");
    }
  }

  function validate() {
    const e: Partial<Record<Key, string>> = {}, need = "Campo obrigatório";
    if (v.nome.trim().split(/\s+/).length < 2) e.nome = v.nome.trim() ? "Escreva nome e sobrenome" : need;
    if (!validDate(v.nascimento)) e.nascimento = v.nascimento ? "Data inválida. Use dd/mm/aaaa" : need;
    if (!validPhone(v.telefone)) e.telefone = v.telefone ? "Telefone incompleto" : need;
    if (digits(v.cep).length !== 8) e.cep = v.cep ? "CEP incompleto" : need;
    for (const k of ["rua", "numero", "bairro", "cidade"] as const) if (!v[k].trim()) e[k] = need;
    if (!/^[A-Za-z]{2}$/.test(v.uf.trim())) e.uf = v.uf ? "UF" : need;
    if (!v.emergNome.trim()) e.emergNome = need;
    if (v.emergTel && !validPhone(v.emergTel)) e.emergTel = "Telefone incompleto";
    if (!v.med) e.med = "Escolha uma opção";
    if (v.med === "sim" && !v.medQuais.trim()) e.medQuais = "Conte quais medicamentos";
    if (!v.medico) e.medico = "Escolha uma opção";
    if (v.medico === "sim" && !v.esp.length) e.esp = "Escolha ao menos uma especialidade";
    if (!v.lgpd) e.lgpd = "Precisamos da sua autorização para continuar";
    return e;
  }

  function onSubmit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate(); setErr(e);
    const first = ORDER.find(k => e[k]);
    if (first) {
      const el = document.getElementById(`f-${first}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      (el?.querySelector("input") ?? el)?.focus({ preventScroll: true });
      say("Confira os campos destacados");
      return;
    }
    enviar();
  }

  async function enviar() {
    const sb = supabase();
    if (!sb) { say(semConfig); return; }
    if (!slug) { say("Abra a ficha pelo link que sua psicóloga enviou."); return; }
    const em = (window as unknown as { __nimthEmocao?: () => { emocao: string | null; motivos: string[]; intensidade: number | null } }).__nimthEmocao?.()
      ?? { emocao: null, motivos: [], intensidade: null };
    const [d, m, y] = v.nascimento.split("/");
    setEnvio("sending");
    const { error } = await sb.rpc("enviar_ficha", {
      p_slug: slug,
      p_nome: v.nome.trim(),
      p_nascimento: `${y}-${m}-${d}`,
      p_telefone: v.telefone,
      p_dados: {
        endereco: { cep: v.cep, rua: v.rua.trim(), numero: v.numero.trim(), complemento: v.complemento.trim(), bairro: v.bairro.trim(), cidade: v.cidade.trim(), uf: v.uf.trim() },
        emergencia: { nome: v.emergNome.trim(), telefone: v.emergTel },
        saude: {
          medicamento: v.med === "sim", medicamentos: v.med === "sim" ? v.medQuais.trim() : "",
          medico: v.medico === "sim",
          medicos: v.medico === "sim" ? v.esp.map(x => ({ especialidade: x, nome: v.docs[x]?.nome.trim() ?? "", contato: v.docs[x]?.contato.trim() ?? "" })) : [],
        },
      },
      p_emocao: em.emocao,
      p_motivos: em.motivos,
      p_intensidade: em.intensidade,
      p_lgpd: v.lgpd,
      p_lgpd_texto: TEXTO_LGPD,
    });
    if (error) {
      setEnvio("idle");
      say(error.message.includes("link inválido") ? "Esse link não está mais ativo. Peça um novo à sua psicóloga." : "Não deu para enviar agora. Confira a internet e tente de novo.");
      return;
    }
    setEnvio("done");
    onEnviado?.();
    requestAnimationFrame(() => document.getElementById("form")?.scrollTo({ top: 0 }));
  }

  const inp = (k: Key) => ({
    id: `f-${k}`, name: k, className: "inp",
    "aria-invalid": err[k] ? true : undefined, "aria-describedby": err[k] ? `f-${k}-msg` : undefined,
  });

  const cepHint =
    cepStatus === "loading" ? "Buscando endereço…" :
    cepStatus === "ok" ? "Endereço preenchido. Confira e coloque o número." :
    cepStatus === "notfound" ? "Não encontramos esse CEP. Preencha o endereço abaixo." :
    cepStatus === "error" ? "Não deu para buscar agora. Preencha o endereço abaixo." :
    "O endereço é preenchido automaticamente.";

  if (envio === "done") return (
    <section className="cartao enviado" id="ficha-ok" role="status">
      <span className="enviado-ic"><Icon name="check" className="icon-lg" /></span>
      <h3>Ficha enviada</h3>
      <p>Obrigado por compartilhar. Sua psicóloga já recebeu seus dados com segurança.</p>
    </section>
  );

  return (
    <>
      <form className="ficha" id="ficha" noValidate onSubmit={onSubmit}>
        <section className="cartao">
          <h3>Seus dados</h3>
          <Field id="f-nome" label="Nome completo" required error={err.nome}>
            <input {...inp("nome")} value={v.nome} onChange={e => set("nome", e.target.value)} placeholder="Como está no documento" autoComplete="name" />
          </Field>
          <Field id="f-nascimento" label="Data de nascimento" required error={err.nascimento}>
            <input {...inp("nascimento")} value={v.nascimento} onChange={e => set("nascimento", maskDate(e.target.value))} placeholder="dd/mm/aaaa" inputMode="numeric" />
          </Field>
          <Field id="f-telefone" label="Telefone" required error={err.telefone}>
            <input {...inp("telefone")} value={v.telefone} onChange={e => set("telefone", maskPhone(e.target.value))} placeholder="(11) 90000-0000" inputMode="tel" autoComplete="tel-national" />
          </Field>
        </section>

        <section className="cartao">
          <h3>Endereço</h3>
          <Field id="f-cep" label="CEP" required error={err.cep} hint={cepHint}>
            <div className="inp-wrap">
              <input {...inp("cep")} value={v.cep} onChange={e => onCep(e.target.value)} placeholder="00000-000" inputMode="numeric" autoComplete="postal-code"
                aria-describedby="f-cep-msg" />
              <span className={`adorn ${cepStatus}`}>
                <Icon name={cepStatus === "loading" ? "loader" : cepStatus === "ok" ? "check" : "map-pin"} />
              </span>
            </div>
          </Field>
          <Field id="f-rua" label="Endereço" required error={err.rua}>
            <input {...inp("rua")} value={v.rua} onChange={e => set("rua", e.target.value)} placeholder="Rua, avenida…" autoComplete="address-line1" />
          </Field>
          <div className="row-2">
            <Field id="f-numero" label="Número" required error={err.numero}>
              <input {...inp("numero")} ref={numeroRef} value={v.numero} onChange={e => set("numero", e.target.value)} placeholder="123" />
            </Field>
            <Field id="f-complemento" label="Complemento">
              <input {...inp("complemento")} value={v.complemento} onChange={e => set("complemento", e.target.value)} placeholder="Apto, bloco" autoComplete="address-line2" />
            </Field>
          </div>
          <Field id="f-bairro" label="Bairro" required error={err.bairro}>
            <input {...inp("bairro")} value={v.bairro} onChange={e => set("bairro", e.target.value)} />
          </Field>
          <div className="row-uf">
            <Field id="f-cidade" label="Cidade" required error={err.cidade}>
              <input {...inp("cidade")} value={v.cidade} onChange={e => set("cidade", e.target.value)} autoComplete="address-level2" />
            </Field>
            <Field id="f-uf" label="UF" required error={err.uf}>
              <input {...inp("uf")} value={v.uf} onChange={e => set("uf", e.target.value.replace(/[^a-z]/gi, "").slice(0, 2).toUpperCase())} placeholder="SP" autoComplete="address-level1" />
            </Field>
          </div>
        </section>

        <section className="cartao">
          <h3>Contato de emergência</h3>
          <Field id="f-emergNome" label="Nome do contato" required error={err.emergNome}>
            <input {...inp("emergNome")} value={v.emergNome} onChange={e => set("emergNome", e.target.value)} placeholder="Quem podemos chamar" autoComplete="off" />
          </Field>
          <Field id="f-emergTel" label="Telefone do contato" error={err.emergTel}>
            <input {...inp("emergTel")} value={v.emergTel} onChange={e => set("emergTel", maskPhone(e.target.value))} placeholder="(11) 90000-0000" inputMode="tel" autoComplete="off" />
          </Field>
        </section>

        <section className="cartao">
          <h3>Saúde</h3>
          <YesNo id="f-med" label="Usa algum medicamento?" value={v.med} error={err.med} onChange={x => set("med", x)} />
          {v.med === "sim" && (
            <div className="reveal">
              <Field id="f-medQuais" label="Quais?" required error={err.medQuais}>
                <textarea {...inp("medQuais")} className="inp area" rows={3} value={v.medQuais} onChange={e => set("medQuais", e.target.value)} placeholder="Nome e, se souber, a dose" />
              </Field>
            </div>
          )}
          <YesNo id="f-medico" label="É acompanhado(a) por algum médico?" value={v.medico} error={err.medico} onChange={x => set("medico", x)} />
          {v.medico === "sim" && (
            <div className="reveal">
              <Field id="f-esp" label="Qual especialidade?" required error={err.esp} hint="Pode escolher mais de uma.">
                <Especialidades id="f-esp" value={v.esp} onChange={x => set("esp", x)} invalid={!!err.esp} describedBy="f-esp-msg" />
              </Field>
              {v.esp.length > 0 && (
                <div className="esp-docs">
                  <p className="rotulo">Se souber, quem acompanha você <span>(opcional)</span></p>
                  {v.esp.map(x => <MedicoDe key={x} esp={x} valor={v.docs[x]} onChange={d => set("docs", { ...v.docs, [x]: d })} />)}
                </div>
              )}
            </div>
          )}
        </section>

        <div className="submit">
          <div className={`field${err.lgpd ? " has-error" : ""}`}>
            <label className="consent" htmlFor="f-lgpd">
              <input type="checkbox" id="f-lgpd" checked={v.lgpd} onChange={e => set("lgpd", e.target.checked)} />
              {TEXTO_LGPD}
            </label>
            {err.lgpd && <p className="msg err"><Icon name="alert" className="icon-sm" />{err.lgpd}</p>}
          </div>
          <button className="btn btn-icon vidro" type="submit" disabled={envio === "sending"}>{envio === "sending" ? <>Enviando… <Icon name="loader" className="spin" /></> : <>Enviar ficha <Icon name="arrow-right" /></>}</button>
          <p className="note"><Icon name="lock" className="icon-sm" />Seus dados ficam guardados com segurança e só a sua psicóloga tem acesso.</p>
        </div>
      </form>
      <div className={`aviso${toast ? " on" : ""}`} role="status" aria-live="polite">{toast}</div>
    </>
  );
}
