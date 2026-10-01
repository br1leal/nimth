"use client";

import { useEffect } from "react";
import { initNimbo } from "@/lib/nimbo/engine";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";
import FichaForm from "@/components/FichaForm";

/**
 * Ficha de cadastro do paciente.
 * A marcação é estática; o motor em lib/nimbo/engine.ts monta os personagens,
 * as animações, os chips de emoção e as bolhas de motivos.
 */
export default function PatientForm() {
  useEffect(() => initNimbo(), []);

  return (
    <>
      <div className="app">
      <button className="theme" id="themeBtn" type="button">Tema: sistema</button>

      <section className="screen boot" id="intro" aria-label="Boas-vindas">
        <div id="stage" aria-hidden="true" />
        <header className="brand">
          <Logo />
        </header>
        <div className="copy">
          <h1>Que bom ter você aqui.</h1>
          <p className="sub-hand"><span>um cantinho seu,</span> <span>sem pressa e sem julgamento</span></p>
          <button className="btn start" id="startBtn" type="button">
            Preencher ficha de cadastro <Icon name="arrow-right" />
          </button>
        </div>
        <div className="tap-hint" aria-hidden="true">
          <span className="tap-hand"><span className="tap-ring" /><Icon name="hand" /></span>
          <span className="tap-text">Hey! Toca aqui</span>
        </div>
      </section>

      <section className="screen" id="form">
        <div className="inner">
          <div className="top">
            <button className="back-logo" id="back" type="button" aria-label="Voltar ao início"><Logo className="logo-sm" /></button>
            <span className="pill">Ficha de cadastro</span>
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

          <FichaForm />
        </div>
      </section>

      </div>
    </>
  );
}
