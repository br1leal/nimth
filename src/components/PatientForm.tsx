"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { initNimbo } from "@/lib/nimbo/engine";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";
import FichaForm from "@/components/FichaForm";

/**
 * Ficha de cadastro do paciente.
 * A marcação é estática; o motor em lib/nimbo/engine.ts monta os personagens,
 * as animações, os chips de emoção e as bolhas de motivos.
 */
export default function PatientForm({ slug }: { slug?: string }) {
  useEffect(() => initNimbo(), []);
  const [psi, setPsi] = useState("");
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    // links de convite / nova senha do Supabase chegam na raiz: manda para a tela de definir senha
    const h = window.location.hash;
    if (/type=(invite|recovery|signup)|error_code=/.test(h)) { window.location.replace("/definir-senha" + h); return; }
    const sb = supabase();
    if (!slug || !sb) return;
    sb.rpc("psicologo_do_link", { p_slug: slug }).then(({ data }) => {
      const nome = (data as { nome: string }[] | null)?.[0]?.nome?.trim();
      if (nome) setPsi(nome.split(/\s+/)[0]);
    });
  }, [slug]);

  return (
    <>
      <div className="app">
      <button className="theme" id="themeBtn" type="button" role="switch" aria-checked="false" aria-label="Modo escuro">
        <span className="theme-knob" aria-hidden="true" />
        <Icon name="sun" className="icon-sm t-sun" />
        <Icon name="moon" className="icon-sm t-moon" />
      </button>

      <section className="screen boot" id="intro" aria-label="Boas-vindas">
        <div id="stage" aria-hidden="true" />
        <header className="brand">
          <Logo />
        </header>
        <div className="copy">
          <h1>Que bom ter você aqui.</h1>
          <p className="sub-hand"><span>um cantinho seu,</span> <span>sem pressa e sem julgamento</span></p>
          <button className="btn start vidro" id="startBtn" type="button">
            Preencher ficha de cadastro <Icon name="arrow-right" />
          </button>
        </div>
        <div className="tap-hint" aria-hidden="true">
          <span className="tap-hand"><span className="tap-ring" /><Icon name="hand" /></span>
          <span className="tap-text">Hey! Toca aqui</span>
        </div>
      </section>

      <section className="screen" id="form" data-enviado={enviado || undefined}>
        <div className="inner">
          <div className="top">
            <button className="back-logo" id="back" type="button" aria-label="Voltar ao início"><Logo className="logo-sm" /></button>
            <span className="pill">{psi ? `Ficha · ${psi}` : "Ficha de cadastro"}</span>
          </div>
          <h2 className="q">Seu sentimento agora é…</h2>
          <div className="hero" id="hero"><div className="glow" /><div id="heroSlot" />
            <div className="swipe-hint" id="swipeHint" role="img" aria-label="Deslize o personagem para os lados para trocar de emoção">
              <Icon name="chevron-left" className="chev l" />
              <Icon name="hand" className="icon-hand" />
              <Icon name="chevron-right" className="chev r" />
            </div>
          </div>
          <div className="feel" aria-live="polite"><b id="feelName" /><small id="feelLine" /></div>
          <div className="chips" id="chips" role="group" aria-label="Escolha uma emoção" />

          <section className="motivos" id="motivos" hidden>
            <h3>O que trouxe esse sentimento?</h3>
            <p>Toque nas bolhas que fazem sentido pra você. Pode escolher mais de uma.</p>
            <div className="bubbles" id="bubbles" />
          </section>

          <div className="intens" id="intens" hidden>
            <label htmlFor="intensity">Quanto? <span id="intLbl">bastante</span></label>
            <input type="range" id="intensity" min={15} max={100} defaultValue={75} />
            <div className="scale"><span>um pouco</span><span>muito</span></div>
          </div>
          <button className="skip" id="skip" type="button" hidden>Prefiro não responder</button>

          <FichaForm slug={slug} onEnviado={() => setEnviado(true)} />
        </div>
      </section>

      </div>
    </>
  );
}
