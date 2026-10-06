"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import Icon from "@/components/Icon";
import { MAIS_COMUNS, buscarEspecialidades, nomeOficial, semAcento } from "@/lib/especialidades";

/** Destaca no nome a parte que a pessoa digitou. */
function Realce({ texto, q }: { texto: string; q: string }): ReactNode {
  const i = semAcento(texto).indexOf(semAcento(q));
  if (!q || i < 0) return texto;
  return <>{texto.slice(0, i)}<mark>{texto.slice(i, i + q.trim().length)}</mark>{texto.slice(i + q.trim().length)}</>;
}

/**
 * Escolha de especialidades médicas em "pills".
 * Digita e a lista filtra (sem acento, por apelido: "endócrino", "psiquiatra"…),
 * setas + Enter escolhem, vírgula ou Enter adicionam o que não está na lista,
 * Backspace no campo vazio tira a última. Atalhos de um toque para as mais comuns.
 */
export default function Especialidades({ id, value, onChange, invalid, describedBy }: {
  id: string; value: string[]; onChange: (v: string[]) => void; invalid?: boolean; describedBy?: string;
}) {
  const [q, setQ] = useState("");
  const [ativo, setAtivo] = useState(0);
  const [aviso, setAviso] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const lista = useId();

  const sugestoes = useMemo(() => buscarEspecialidades(q, value), [q, value]);
  const texto = q.trim();
  const jaTem = (n: string) => value.some(v => semAcento(v) === semAcento(n));
  // opção de adicionar o que a pessoa escreveu, quando nada da lista combina
  const livre = !sugestoes.length && texto.length >= 3 && !nomeOficial(texto) && !jaTem(texto) ? texto : null;
  const opcoes = [...sugestoes, ...(livre ? [`__livre__${livre}`] : [])];
  const aberto = texto.length > 0;

  function adicionar(nome: string) {
    const n = nomeOficial(nome) ?? nome.trim().replace(/^./, c => c.toUpperCase());
    if (!n || jaTem(n)) { setQ(""); return; }
    onChange([...value, n]);
    setAviso(`${n} adicionada`);
    setQ(""); setAtivo(0);
    inputRef.current?.focus();
  }
  function remover(n: string) {
    onChange(value.filter(v => v !== n));
    setAviso(`${n} removida`);
    inputRef.current?.focus();
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown" && aberto) { e.preventDefault(); setAtivo(a => Math.min(a + 1, opcoes.length - 1)); }
    else if (e.key === "ArrowUp" && aberto) { e.preventDefault(); setAtivo(a => Math.max(a - 1, 0)); }
    else if (e.key === "Enter" || e.key === "," || e.key === "Tab" && texto) {
      if (!texto) { if (e.key === "Enter") e.preventDefault(); return; }
      e.preventDefault();
      const o = opcoes[ativo];
      adicionar(o ? o.replace(/^__livre__/, "") : texto);
    }
    else if (e.key === "Backspace" && !q && value.length) remover(value[value.length - 1]);
    else if (e.key === "Escape") setQ("");
  }

  const comuns = MAIS_COMUNS.filter(n => !jaTem(n));

  return (
    <div className="esp">
      <div className={`esp-box${value.length ? " tem" : ""}`} aria-invalid={invalid || undefined} onClick={() => inputRef.current?.focus()}>
        {value.map(n => (
          <span key={n} className="esp-pill">
            {n}
            <button type="button" aria-label={`Remover ${n}`} onClick={ev => { ev.stopPropagation(); remover(n); }}>
              <Icon name="x" className="icon-xs" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef} id={id} className="esp-inp" type="text" autoComplete="off" autoCapitalize="none" spellCheck={false} enterKeyHint="done"
          role="combobox" aria-expanded={aberto} aria-controls={lista} aria-autocomplete="list"
          aria-activedescendant={aberto && opcoes[ativo] ? `${lista}-${ativo}` : undefined}
          aria-invalid={invalid || undefined} aria-describedby={describedBy}
          value={q} onChange={e => { setQ(e.target.value); setAtivo(0); }} onKeyDown={onKey}
          onBlur={() => { if (texto && nomeOficial(texto)) adicionar(texto); }}
          placeholder={value.length ? "Mais alguma?" : "Digite: psiquiatra, endócrino…"}
        />
      </div>

      {aberto && (
        <ul className="esp-lista" id={lista} role="listbox" aria-label="Especialidades">
          {opcoes.map((o, i) => {
            const eLivre = o.startsWith("__livre__"), nome = o.replace(/^__livre__/, "");
            return (
              <li key={o} id={`${lista}-${i}`} role="option" aria-selected={i === ativo}
                className={`esp-op${i === ativo ? " on" : ""}${eLivre ? " livre" : ""}`}
                onMouseDown={e => e.preventDefault()} onMouseEnter={() => setAtivo(i)} onClick={() => adicionar(nome)}>
                <Icon name={eLivre ? "plus" : "check"} className="icon-sm" />
                {eLivre ? <span>Adicionar “<b>{nome}</b>”</span> : <span><Realce texto={nome} q={texto} /></span>}
              </li>
            );
          })}
          {!opcoes.length && <li className="esp-vazio" role="presentation">Continue digitando para adicionar.</li>}
        </ul>
      )}

      {!aberto && comuns.length > 0 && (
        <div className="esp-comuns" role="group" aria-label="Mais comuns">
          {comuns.slice(0, value.length ? 4 : 6).map(n => (
            <button key={n} type="button" className="esp-atalho" onClick={() => adicionar(n)}>
              <Icon name="plus" className="icon-xs" />{n}
            </button>
          ))}
        </div>
      )}

      <span className="sr-only" aria-live="polite">{aviso}</span>
    </div>
  );
}
