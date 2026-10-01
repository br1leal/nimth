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

      <section className="screen" id="intro" aria-label="Boas-vindas">
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
        <p className="hint">
          <span className="tapdot" aria-hidden="true" />
          Toque na tela e veja uma emoção aparecer
        </p>
      </section>

      <section className="screen" id="form">
        <div className="inner">
          <div className="top">
            <button className="back" id="back" type="button"><Icon name="arrow-left" className="icon-sm" />Voltar</button>
            <span className="pill">Ficha de cadastro</span>
          </div>
          <h2 className="q">Escolha como você está</h2>
          <div className="hero"><div className="glow" /><div id="heroSlot" /></div>
          <div className="feel" aria-live="polite"><b id="feelName" /><small id="feelLine" /></div>
          <div className="chips" id="chips" role="group" aria-label="Escolha uma emoção" />

          <section className="motivos" id="motivos" hidden>
            <h3>O que tem a ver com isso?</h3>
            <p>Selecione quantos quiser. Isso ajuda sua psicóloga a entender o momento.</p>
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
