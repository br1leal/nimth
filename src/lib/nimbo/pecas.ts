// @ts-nocheck
/**
 * Desenho de um personagem em SVG (braços, pernas e rosto), sem animação.
 * Usado pelo motor da ficha (engine.ts) e pelo retrato estático do painel (Retrato.tsx),
 * para os dois mostrarem exatamente o mesmo personagem.
 */
import { ARMS, LEGS, CAST } from "./cast";

export const INK = '#1E1830';
const drop=(x,y,s)=>`M${x} ${y} c0 0 ${-s} ${s*1.55} ${-s} ${s*2.4} a${s} ${s} 0 0 0 ${s*2} 0 c0 ${-s*.85} ${-s} ${-s*2.4} ${-s} ${-s*2.4} z`;

/** Devolve as medidas e o SVG (em texto) dos membros (atrás do corpo) e do rosto (na frente). */
export function pecasDoPersonagem(key, uid){
  const d=CAST[key], W=1000, H=Math.round(1000*d.ratio), f=d.face, L=d.limbs;
  const r=d.r*10, u=r*1.05, au=r*(L.armLen||1.45), sw=r*.26, fw=sw; // traço grosso, com personalidade (fw no rosto, sw nos braços e pernas)
  const mid=(d.eyes[0][0]+d.eyes[1][0])/2;
  const ex=d.eyes.map(e=>(mid+(e[0]-mid)*.9)*10), ey=d.eyes.map(e=>e[1]*10);
  const cx=(ex[0]+ex[1])/2, mouthY=ey[0]+r*1.6;
  const stroke=c=>`fill="none" style="stroke:${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
  const ax=(L.armAt?.[0]||0)*10, ay=(L.armAt?.[1]||0)/100*H;

  /* membros atrás do corpo */
  let lm='';
  if(L.leg&&L.leg!=='lotus') L.legAt.forEach((p,i)=>{ lm+=`<g transform="translate(${p[0]*10} ${p[1]/100*H}) scale(${i?-1:1} 1)"><g class="leg"><path d="${LEGS[L.leg](u)}" ${stroke('var(--limb)')}/></g></g>`; });
  if(L.arm!=='crossed'&&L.arm!=='none') [ax, W-ax].forEach((x,i)=>{ lm+=`<g transform="translate(${x} ${ay}) scale(${i?-1:1} 1)"><g class="arm"><path d="${ARMS[L.arm](au)}" ${stroke('var(--limb)')}/></g></g>`; });


  /* rosto e elementos na frente */
  let s='';
  if(L.leg==='lotus') L.legAt.forEach((p,i)=>{ s+=`<g transform="translate(${p[0]*10} ${p[1]/100*H}) scale(${i?-1:1} 1)"><path d="${LEGS.lotus(u)}" ${stroke(INK)}/></g>`; });
  if(L.arm==='crossed'){ // braços cruzados na frente da barriga
    const xl=ax, xr=W-ax, c1=W/2;
    s+=`<g class="crossed">
      <path d="M${xl} ${ay} C${xl+.3*u} ${ay+.75*u} ${c1-.1*u} ${ay+.8*u} ${c1+.85*u} ${ay-.1*u}" ${stroke(INK)}/>
      <path d="M${xr} ${ay} C${xr-.3*u} ${ay+.55*u} ${c1+.1*u} ${ay+.6*u} ${c1-.85*u} ${ay-.25*u}" ${stroke(INK)}/></g>`;
  }
  ex.forEach((x,i)=>{ const y=ey[i], id=uid+i;
    s+=`<defs><clipPath id="${id}"><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*1.1}"/></clipPath></defs>
    <g class="eye" data-x="${x}" data-y="${y}">
      <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*1.1}" fill="#FFFFFF"/>
      <g clip-path="url(#${id})">
        <g class="pupil" data-x="${x}" data-y="${y+r*.12}"><circle cx="${x}" cy="${y+r*.12}" r="${r*.64*f.pupil}" fill="${INK}"/><circle cx="${x+r*.22}" cy="${y-r*.14}" r="${r*.2}" fill="#fff"/><circle cx="${x-r*.12}" cy="${y+r*.32}" r="${r*.07}" fill="#fff" opacity=".7"/></g>
        <g class="lid" data-x="${x}" data-y="${y}"><rect x="${x-r*1.8}" y="${y-r*3.92}" width="${r*3.6}" height="${r*2.6}" fill="${L.tone}"/><line x1="${x-r*1.8}" y1="${y-r*1.32}" x2="${x+r*1.8}" y2="${y-r*1.32}" stroke="${INK}" stroke-width="${r*.22}" stroke-linecap="round"/></g>
      </g>
    </g>`;
  });
  const B=f.brow, bw=r*.62, by=ey[0]-r*1.55+B.y*r;
  const brow=(x,side)=>`<path d="M${x-bw} ${by} Q${x} ${by-(B.arch||0)*r*.5} ${x+bw} ${by}" fill="none" stroke="${INK}" stroke-width="${fw}" stroke-linecap="round" transform="rotate(${B.angle*side} ${x} ${by})"/>`;
  s+=`<g class="brows">`+brow(ex[0],1)+(B.one?`<path class="brow-up" d="M${ex[1]-bw} ${by-r*.4} Q${ex[1]} ${by-r*.62} ${ex[1]+bw} ${by-r*.4}" fill="none" stroke="${INK}" stroke-width="${fw}" stroke-linecap="round"/>`:brow(ex[1],-1))+`</g>`;
  if(f.cheeks) s+=`<ellipse cx="${ex[0]-r*.95}" cy="${ey[0]+r*1.3}" rx="${r*.8}" ry="${r*.4}" fill="#FF7FA0" opacity="${.38*f.cheeks}"/><ellipse cx="${ex[1]+r*.95}" cy="${ey[1]+r*1.3}" rx="${r*.8}" ry="${r*.4}" fill="#FF7FA0" opacity="${.38*f.cheeks}"/>`;
  const mw=r*.6, M={
    grin:`<path d="M${cx-mw*1.3} ${mouthY} Q${cx} ${mouthY+r*1.1} ${cx+mw*1.3} ${mouthY} Z" fill="${INK}" stroke="${INK}" stroke-width="${fw*.5}" stroke-linejoin="round"/><path d="M${cx-mw*.8} ${mouthY+r*.55} Q${cx} ${mouthY+r*1.0} ${cx+mw*.8} ${mouthY+r*.55} Z" fill="#FF8FA3"/>`,
    soft:`<path d="M${cx-mw*.75} ${mouthY} Q${cx} ${mouthY+r*.4} ${cx+mw*.75} ${mouthY}" fill="none" stroke="${INK}" stroke-width="${fw}" stroke-linecap="round"/>`,
    flat:`<path d="M${cx-mw*.7} ${mouthY} L${cx+mw*.7} ${mouthY}" fill="none" stroke="${INK}" stroke-width="${fw}" stroke-linecap="round"/>`,
    frown:`<path d="M${cx-mw*.85} ${mouthY+r*.3} Q${cx} ${mouthY-r*.3} ${cx+mw*.85} ${mouthY+r*.3}" fill="none" stroke="${INK}" stroke-width="${fw}" stroke-linecap="round"/>`,
    wavy:`<path d="M${cx-mw} ${mouthY} Q${cx-mw*.5} ${mouthY-r*.35} ${cx} ${mouthY} Q${cx+mw*.5} ${mouthY+r*.35} ${cx+mw} ${mouthY}" fill="none" stroke="${INK}" stroke-width="${fw}" stroke-linecap="round"/>`,
    grumpy:`<path d="M${cx-mw*.8} ${mouthY+r*.22} Q${cx} ${mouthY-r*.22} ${cx+mw*.8} ${mouthY+r*.22}" fill="none" stroke="${INK}" stroke-width="${fw*1.1}" stroke-linecap="round"/>`
  }[f.mouth];
  s+=`<g class="mouth" data-x="${cx}" data-y="${mouthY}">${M}</g>`;
  // sorriso aberto só quando reage (ex.: Alegria sorri de leve parada e ri ao ser tocada)
  if(f.grinOnReact) s+=`<g class="grin" opacity="0" data-x="${cx}" data-y="${mouthY}"><path d="M${cx-mw*1.3} ${mouthY} Q${cx} ${mouthY+r*1.1} ${cx+mw*1.3} ${mouthY} Z" fill="${INK}" stroke="${INK}" stroke-width="${fw*.6}" stroke-linejoin="round"/><path d="M${cx-mw*.8} ${mouthY+r*.55} Q${cx} ${mouthY+r*1.0} ${cx+mw*.8} ${mouthY+r*.55} Z" fill="#FF8FA3"/></g>`;
  // sorrisinho de despedida (usado no tchau ao rolar a página)
  if(f.mouth!=='grin') s+=`<g class="smile" opacity="0"><path d="M${cx-mw} ${mouthY-r*.05} Q${cx} ${mouthY+r*.8} ${cx+mw} ${mouthY-r*.05}" fill="none" stroke="${INK}" stroke-width="${fw}" stroke-linecap="round"/></g>`;
  if(f.tear){
    s+=`<path class="tear-rest" d="${drop(ex[1]+r*.8, ey[1]+r*.95, r*.32)}" fill="#CFE6FF" stroke="#fff" stroke-width="${r*.06}"/>`;
    s+=`<g class="tears" opacity="0">`+[0,1].map(i=>[0,.5].map(o=>`<path data-o="${o}" d="${drop(ex[i]+(i?r*.75:-r*.75), ey[i]+r*.95, r*.3)}" fill="#CFE6FF" stroke="#fff" stroke-width="${r*.06}"/>`).join('')).join('')+`</g>`;
  }
  if(f.sweat) s+=`<path class="sweat" d="${drop(ex[1]+r*1.85, ey[1]-r*1.8, r*.36)}" fill="#D8F3FF" stroke="#fff" stroke-width="${r*.06}"/>`;
  if(f.smoke) s+=`<g class="smoke" opacity="0">`+[0,.2,.4,.6,.8].map((o,i)=>`<circle data-o="${o}" cx="${W*(.3+i*.1)}" cy="${H*.06}" r="${r*.55}" fill="#C9C2CE"/>`).join('')+`</g>`;

  return { d, W, H, r, L, limbs: lm, face: s };
}

/** Pálpebras na posição de descanso (ex.: Calma e Tristeza com olhos meio fechados). */
export function palpebraDescanso(key, r){
  const f=CAST[key].face, lid=f.lid||0, ang=f.lidAngle||0;
  return (x, y, i) => `rotate(${i?-ang:ang} ${x} ${y}) translate(0 ${(lid*r*2.67).toFixed(1)})`;
}
