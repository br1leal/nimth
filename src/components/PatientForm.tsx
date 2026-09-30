"use client";

import { useEffect } from "react";
import { initNimbo } from "@/lib/nimbo/engine";

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

      <section className="screen" id="intro" aria-label="Boas-vindas. Toque para começar.">
        <div id="stage" />
        <div className="copy">
          <small>Ficha de cadastro</small>
          <h1>Como você está chegando hoje?</h1>
          <span className="tag">Suas emoções são bem-vindas aqui</span>
          <div className="tap">Toque em qualquer lugar para começar</div>
        </div>
      </section>

      <section className="screen" id="form">
        <div className="inner">
          <div className="top">
            <button className="back" id="back" type="button">← Voltar</button>
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

          <form className="card" id="ficha" noValidate>
            <h3>Seus dados</h3>
            <div className="field"><label htmlFor="f-nome">Nome completo <em>*</em></label><input className="inp" id="f-nome" name="nome" placeholder="Como está no documento" autoComplete="name" /></div>
            <div className="field"><label htmlFor="f-social">Como prefere ser chamado(a)?</label><input className="inp" id="f-social" name="apelido" placeholder="Opcional" /></div>
            <div className="field">
              <label htmlFor="f-zap">WhatsApp <em>*</em></label>
              <div className="row">
                <input className="inp" id="f-ddi" name="ddi" defaultValue="+55" aria-label="Código do país" />
                <input className="inp" id="f-zap" name="whatsapp" placeholder="(11) 90000-0000" inputMode="tel" autoComplete="tel-national" />
              </div>
            </div>
            <div className="field"><label htmlFor="f-nasc">Data de nascimento <em>*</em></label><input className="inp" id="f-nasc" name="nascimento" placeholder="dd/mm/aaaa" inputMode="numeric" autoComplete="bday" /></div>
            <div className="field"><label htmlFor="f-mail">E-mail</label><input className="inp" id="f-mail" name="email" placeholder="voce@email.com" inputMode="email" autoComplete="email" /></div>
            <label className="consent" htmlFor="f-lgpd"><input type="checkbox" id="f-lgpd" name="lgpd" />Autorizo o uso destes dados pela minha psicóloga, apenas para o meu atendimento, conforme a LGPD.</label>
            <button className="btn" type="submit">Enviar ficha</button>
            <p className="note">Seus dados ficam guardados com segurança e só a sua psicóloga tem acesso.</p>
          </form>
        </div>
      </section>

      <div className="toast" id="toast" role="status" />
      </div>
      <p className="device-note">Prévia em tamanho de celular · abra no celular para testar o toque</p>
    </>
  );
}
