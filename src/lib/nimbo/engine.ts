// @ts-nocheck
/**
 * Motor dos personagens do Nimbo (DOM + SVG + requestAnimationFrame).
 * Monta a tela inicial, o personagem principal, os chips de emoção e as bolhas de motivos,
 * e anima olhos, pálpebras, braços, pernas, reações ao toque e arraste com mola.
 * initNimbo() devolve uma função de limpeza (usada pelo useEffect do React).
 */
import { ARMS, LEGS, CAST, ORDER, REASONS, BPOS } from "./cast";

export function initNimbo(): () => void {
const $=id=>document.getElementById(id);
let raf=0, alive=true;
['stage','heroSlot','chips','bubbles'].forEach(id=>{ const n=$(id); if(n) n.innerHTML=''; });
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS='http://www.w3.org/2000/svg';
const INK='#1E1830';

const drop=(x,y,s)=>`M${x} ${y} c0 0 ${-s} ${s*1.55} ${-s} ${s*2.4} a${s} ${s} 0 0 0 ${s*2} 0 c0 ${-s*.85} ${-s} ${-s*2.4} ${-s} ${-s*2.4} z`;

const chars=[];
function makeChar(key, opts={}){
  const d=CAST[key], W=1000, H=Math.round(1000*d.ratio), f=d.face, L=d.limbs;
  const el=document.createElement('div'); el.className='char'; el.dataset.k=key;
  const r=d.r*10, u=r*1.05, au=r*(L.armLen||1.45), sw=r*.15;
  const mid=(d.eyes[0][0]+d.eyes[1][0])/2;
  const ex=d.eyes.map(e=>(mid+(e[0]-mid)*.9)*10), ey=d.eyes.map(e=>e[1]*10);
  const cx=(ex[0]+ex[1])/2, mouthY=ey[0]+r*1.6;
  const uid=key+Math.random().toString(36).slice(2,6);
  const stroke=c=>`fill="none" style="stroke:${c}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"`;
  const ax=L.armAt[0]*10, ay=L.armAt[1]/100*H;

  /* membros atrás do corpo */
  const limbs=document.createElementNS(NS,'svg'); limbs.setAttribute('viewBox',`0 0 ${W} ${H}`); limbs.setAttribute('class','limbs');
  let lm='';
  if(L.leg&&L.leg!=='lotus') L.legAt.forEach((p,i)=>{ lm+=`<g transform="translate(${p[0]*10} ${p[1]/100*H}) scale(${i?-1:1} 1)"><g class="leg"><path d="${LEGS[L.leg](u)}" ${stroke('var(--limb)')}/></g></g>`; });
  if(L.arm!=='crossed') [ax, W-ax].forEach((x,i)=>{ lm+=`<g transform="translate(${x} ${ay}) scale(${i?-1:1} 1)"><g class="arm"><path d="${ARMS[L.arm](au)}" ${stroke('var(--limb)')}/></g></g>`; });
  limbs.innerHTML=lm; el.appendChild(limbs);

  const img=document.createElement('img'); img.src=d.img; img.alt=d.name; img.draggable=false; el.appendChild(img);

  /* rosto e elementos na frente */
  const face=document.createElementNS(NS,'svg'); face.setAttribute('viewBox',`0 0 ${W} ${H}`); face.setAttribute('class','face');
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
      <ellipse cx="${x}" cy="${y+r*.14}" rx="${r*1.03}" ry="${r*1.13}" fill="rgba(0,0,0,.12)"/>
      <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*1.1}" fill="#FFFFFF"/>
      <g clip-path="url(#${id})">
        <g class="pupil" data-x="${x}" data-y="${y+r*.12}"><circle cx="${x}" cy="${y+r*.12}" r="${r*.55*f.pupil}" fill="${INK}"/><circle cx="${x+r*.2}" cy="${y-r*.12}" r="${r*.17}" fill="#fff"/><circle cx="${x-r*.12}" cy="${y+r*.32}" r="${r*.07}" fill="#fff" opacity=".7"/></g>
        <g class="lid" data-x="${x}" data-y="${y}"><rect x="${x-r*1.8}" y="${y-r*3.8}" width="${r*3.6}" height="${r*2.6}" fill="${L.tone}"/><line x1="${x-r*1.8}" y1="${y-r*1.2}" x2="${x+r*1.8}" y2="${y-r*1.2}" stroke="${INK}" stroke-width="${r*.12}" stroke-linecap="round"/></g>
      </g>
      <ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r*1.1}" fill="none" stroke="rgba(0,0,0,.08)" stroke-width="${r*.08}"/>
    </g>`;
  });
  const B=f.brow, bw=r*.62, by=ey[0]-r*1.55+B.y*r;
  const brow=(x,side)=>`<path d="M${x-bw} ${by} Q${x} ${by-(B.arch||0)*r*.5} ${x+bw} ${by}" fill="none" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round" transform="rotate(${B.angle*side} ${x} ${by})"/>`;
  s+=`<g class="brows">`+brow(ex[0],1)+(B.one?`<path class="brow-up" d="M${ex[1]-bw} ${by-r*.4} Q${ex[1]} ${by-r*.62} ${ex[1]+bw} ${by-r*.4}" fill="none" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round"/>`:brow(ex[1],-1))+`</g>`;
  if(f.cheeks) s+=`<ellipse cx="${ex[0]-r*.95}" cy="${ey[0]+r*1.3}" rx="${r*.8}" ry="${r*.4}" fill="#FF7FA0" opacity="${.38*f.cheeks}"/><ellipse cx="${ex[1]+r*.95}" cy="${ey[1]+r*1.3}" rx="${r*.8}" ry="${r*.4}" fill="#FF7FA0" opacity="${.38*f.cheeks}"/>`;
  const mw=r*.6, M={
    grin:`<path d="M${cx-mw*1.3} ${mouthY} Q${cx} ${mouthY+r*1.1} ${cx+mw*1.3} ${mouthY} Z" fill="${INK}" stroke="${INK}" stroke-width="${sw*.6}" stroke-linejoin="round"/><path d="M${cx-mw*.8} ${mouthY+r*.55} Q${cx} ${mouthY+r*1.0} ${cx+mw*.8} ${mouthY+r*.55} Z" fill="#FF8FA3"/>`,
    soft:`<path d="M${cx-mw*.75} ${mouthY} Q${cx} ${mouthY+r*.4} ${cx+mw*.75} ${mouthY}" fill="none" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round"/>`,
    flat:`<path d="M${cx-mw*.7} ${mouthY} L${cx+mw*.7} ${mouthY}" fill="none" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round"/>`,
    frown:`<path d="M${cx-mw*.85} ${mouthY+r*.3} Q${cx} ${mouthY-r*.3} ${cx+mw*.85} ${mouthY+r*.3}" fill="none" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round"/>`,
    wavy:`<path d="M${cx-mw} ${mouthY} Q${cx-mw*.5} ${mouthY-r*.35} ${cx} ${mouthY} Q${cx+mw*.5} ${mouthY+r*.35} ${cx+mw} ${mouthY}" fill="none" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round"/>`,
    grumpy:`<path d="M${cx-mw*.8} ${mouthY+r*.22} Q${cx} ${mouthY-r*.22} ${cx+mw*.8} ${mouthY+r*.22}" fill="none" stroke="${INK}" stroke-width="${sw*1.15}" stroke-linecap="round"/>`
  }[f.mouth];
  s+=`<g class="mouth" data-x="${cx}" data-y="${mouthY}">${M}</g>`;
  if(f.tear){
    s+=`<path class="tear-rest" d="${drop(ex[1]+r*.8, ey[1]+r*.95, r*.32)}" fill="#CFE6FF" stroke="#fff" stroke-width="${r*.06}"/>`;
    s+=`<g class="tears" opacity="0">`+[0,1].map(i=>[0,.5].map(o=>`<path data-o="${o}" d="${drop(ex[i]+(i?r*.75:-r*.75), ey[i]+r*.95, r*.3)}" fill="#CFE6FF" stroke="#fff" stroke-width="${r*.06}"/>`).join('')).join('')+`</g>`;
  }
  if(f.sweat) s+=`<path class="sweat" d="${drop(ex[1]+r*1.85, ey[1]-r*1.8, r*.36)}" fill="#D8F3FF" stroke="#fff" stroke-width="${r*.06}"/>`;
  if(f.smoke) s+=`<g class="smoke" opacity="0">`+[0,.2,.4,.6,.8].map((o,i)=>`<circle data-o="${o}" cx="${W*(.3+i*.1)}" cy="${H*.06}" r="${r*.55}" fill="#C9C2CE"/>`).join('')+`</g>`;
  face.innerHTML=s; el.appendChild(face);

  const c={key, el, d, r, img, W, H,
    eyes:[...face.querySelectorAll('.eye')], pupils:[...face.querySelectorAll('.pupil')], lids:[...face.querySelectorAll('.lid')],
    arms:[...limbs.querySelectorAll('.arm')], legs:[...limbs.querySelectorAll('.leg')],
    mouth:face.querySelector('.mouth'), brows:face.querySelector('.brows'), sweat:face.querySelector('.sweat'),
    tears:face.querySelector('.tears'), tearRest:face.querySelector('.tear-rest'), smoke:face.querySelector('.smoke'), crossed:face.querySelector('.crossed'),
    look:{x:0,y:0}, blinkStart:-1, nextBlink:1500+Math.random()*2500, seed:Math.random()*10, phase:Math.random()*6,
    energy:.3, reactT:-1e9, shiverT:-1e9, nextShiver:3000+Math.random()*4000, shrugT:-1e9, nextShrug:2500+Math.random()*3000,
    drag:false, ox:0, oy:0, vx:0, vy:0, sx0:0, sy0:0, moved:0, pid:null, static:false, ...opts};
  if(!c.static){
    el.addEventListener('pointerdown', e=>{ e.stopPropagation(); e.preventDefault(); c.drag=true; c.moved=0; c.sx0=e.clientX-c.ox; c.sy0=e.clientY-c.oy; c.pid=e.pointerId; try{ el.setPointerCapture(e.pointerId); }catch(_){} });
    el.addEventListener('pointermove', e=>{ if(!c.drag||e.pointerId!==c.pid) return; const dx=e.clientX-c.sx0, dy=e.clientY-c.sy0; c.moved=Math.max(c.moved, Math.hypot(dx,dy));
      const dist=Math.hypot(dx,dy)||1, k=1/(1+dist/260); c.ox=dx*.6*k; c.oy=dy*.6*k; });
    const up=e=>{ if(!c.drag) return; c.drag=false; if(c.moved<8) react(c); };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    el.addEventListener('click', e=>e.stopPropagation());
  }
  chars.push(c); return c;
}
function react(c){ c.reactT=performance.now(); }

/* ponteiro */
let ptr={x:innerWidth/2, y:innerHeight*.4}, lastMove=-1e9;
const onPt=(x,y)=>{ ptr={x,y}; lastMove=performance.now(); };
const onMove=e=>onPt(e.clientX,e.clientY);
const onTouch=e=>{ const t=e.touches[0]; if(t) onPt(t.clientX,t.clientY); };
window.addEventListener('pointermove', onMove, {passive:true});
window.addEventListener('touchstart', onTouch, {passive:true});

const ease=x=>x<0?0:x>1?1:x*x*(3-2*x);
const env=(p,a,b)=>p<0||p>1?0:Math.min(ease(p/a),1-ease((p-(1-b))/b));

function frame(now){
  if(!alive) return;
  const t=now/1000, dt=1/60, idle=now-lastMove>3000;
  for(const c of chars){
    const rect=c.el.getBoundingClientRect(); if(rect.width===0) continue;
    const ccx=rect.left+rect.width/2, ccy=rect.top+rect.height/2;
    let tx=(ptr.x-ccx)/Math.max(240,rect.width*1.6), ty=(ptr.y-ccy)/Math.max(240,rect.height*1.6);
    if(idle){ tx=Math.sin(t*.35+c.seed)*.45; ty=Math.sin(t*.27+c.seed)*.22; }
    const mm=Math.hypot(tx,ty); if(mm>1){ tx/=mm; ty/=mm; }
    if(c.d.face.lookDown) ty=Math.max(ty,.25);
    c.look.x+=(tx-c.look.x)*.1; c.look.y+=(ty-c.look.y)*.1;
    const p=(now-c.reactT)/c.d.react, R=p>=0&&p<1, mood=c.d.mood;

    // piscar pela pálpebra
    if(!reduce && c.blinkStart<0 && now>c.nextBlink) c.blinkStart=now;
    let bl=0; if(c.blinkStart>=0){ const q=(now-c.blinkStart)/260; bl=q<.45?ease(q/.45):q<1?1-ease((q-.45)/.55):0; if(q>=1){ c.blinkStart=-1; c.nextBlink=now+2800+Math.random()*3800; } }
    let rest=c.d.face.lid||0;
    if(R&&mood==='calm') rest=rest+(.94-rest)*env(p,.2,.3);
    if(R&&mood==='joy') rest=0;
    const lid=rest+(1-rest)*bl, ang=c.d.face.lidAngle||0;
    // olhos (ansiedade: branco cresce, íris diminui)
    const eyeS=R&&mood==='anx'?1+.28*env(p,.12,.3):1, pupS=R&&mood==='anx'?1-.42*env(p,.12,.3):1;
    const px=c.look.x*c.r*.4, py=c.look.y*c.r*.35;
    c.eyes.forEach(e=>{ const x=e.dataset.x, y=e.dataset.y; e.setAttribute('transform', eyeS===1?'':`translate(${x} ${y}) scale(${eyeS.toFixed(3)}) translate(${-x} ${-y})`); });
    c.pupils.forEach(pu=>{ const x=+pu.dataset.x, y=+pu.dataset.y; pu.setAttribute('transform',`translate(${(px+x).toFixed(1)} ${(py+y).toFixed(1)}) scale(${pupS.toFixed(3)}) translate(${-x} ${-y})`); });
    c.lids.forEach((l,i)=>{ const x=l.dataset.x, y=l.dataset.y; l.setAttribute('transform',`rotate(${i?-ang:ang} ${x} ${y}) translate(0 ${(lid*c.r*2.55).toFixed(1)})`); });
    if(c.static) continue;

    // energia: lenta parada, mais viva com hover, arraste ou toque
    const hover=ptr.x>rect.left-30&&ptr.x<rect.right+30&&ptr.y>rect.top-30&&ptr.y<rect.bottom+30&&now-lastMove<1500;
    const target=(hover||c.drag||R)?1:.25;
    c.energy+=(target-c.energy)*.05;
    const E=reduce?0:c.energy;
    c.phase+=dt*(.45+E*.9);
    const fl=Math.sin(c.phase)*(c.floatAmp||4)*(.35+.65*E);
    const br=Math.sin(c.phase*c.d.speed*1.3)*.012*(.4+.6*E);
    // arrastar: mola de volta
    if(!c.drag){ c.vx+=(-150*c.ox-9*c.vx)*dt; c.vy+=(-150*c.oy-9*c.vy)*dt; c.ox+=c.vx*dt; c.oy+=c.vy*dt; }
    const dist=Math.hypot(c.ox,c.oy), st=Math.min(.32,dist/380), a=Math.atan2(c.oy,c.ox)*180/Math.PI;

    // reações
    let hopY=0, extraRot=0, jx=0, grow=1, squashY=0;
    if(R&&!reduce) switch(mood){
      case 'joy': { const hp=Math.abs(Math.sin(p*Math.PI*2)); hopY=-hp*(rect.height*.16)*(1-p*.35); if(hp<.18) squashY=.06*(1-hp/.18); break; }
      case 'calm': extraRot=Math.sin(p*Math.PI*2.2)*7*(1-p); break;
      case 'anx': jx=Math.sin(p*80)*2.2*env(p,.05,.4); break;
      case 'angry': jx=Math.sin(t*55)*2.4*env(p,.1,.3); grow=1+.07*env(p,.12,.3); break;
    }
    if(c.d.face.shiver&&!reduce&&!R){ if(now>c.nextShiver){ c.shiverT=now; c.nextShiver=now+3500+Math.random()*4500; } const sd=(now-c.shiverT)/420; if(sd<1) jx=Math.sin(sd*Math.PI*9)*2.2*(1-sd); }
    const tilt=c.look.x*(c.tilt||3)*(.4+.6*E)+extraRot;
    const sx=(1+br+squashY)*grow, sy=(1-br-squashY)*grow;
    c.el.style.transform=`${c.baseTransform||''} translate(${(c.ox+jx+c.look.x*(c.parallax||0)*E).toFixed(1)}px, ${(c.oy+fl+hopY+c.look.y*(c.parallax||0)*.6*E).toFixed(1)}px) rotate(${a.toFixed(1)}deg) scale(${(1+st).toFixed(3)},${(1-st*.45).toFixed(3)}) rotate(${(-a+tilt).toFixed(2)}deg) scale(${sx.toFixed(4)},${sy.toFixed(4)})`;

    // membros
    let aL=0,aR=0,lL=0,lR=0; const amp=reduce?0:(.3+.7*E);
    switch(mood){
      case 'joy':  aL=Math.sin(t*3)*9*amp; aR=-Math.sin(t*3)*9*amp; if(R){ const w=Math.sin(p*Math.PI*6)*14; aL-=18+w; aR-=18-w; }
                   lL=Math.max(0,Math.sin(t*3))*-9*amp; lR=Math.max(0,-Math.sin(t*3))*-9*amp; if(R){ lL=lR=-Math.abs(Math.sin(p*Math.PI*2))*14; } break;
      case 'anx':  aL=Math.sin(t*5+c.seed)*5*amp; aR=Math.sin(t*5.6+c.seed)*5*amp; if(R){ aL-=20*env(p,.1,.3); aR-=20*env(p,.1,.3); } break;
      case 'sad':  aL=aR=Math.sin(t*.8+c.seed)*2.5*amp; break;
      case 'angry':aL=aR=Math.sin(t*2+c.seed)*1.5*amp; break;
      case 'meh': { if(now>c.nextShrug){ c.shrugT=now; c.nextShrug=now+4500+Math.random()*3500; } const sh=Math.max(env((now-c.shrugT)/1100,.3,.4), R?env(p,.25,.35):0); aL=aR=-sh*24; if(c.brows) c.brows.setAttribute('transform',`translate(0 ${(-sh*c.r*.25).toFixed(1)})`); break; }
    }
    if(c.drag){ aL-=18; aR-=18; }
    if(c.arms[0]){ c.arms[0].setAttribute('transform',`rotate(${aL.toFixed(1)})`); c.arms[1].setAttribute('transform',`rotate(${aR.toFixed(1)})`); }
    if(c.legs[0]){ c.legs[0].setAttribute('transform',`rotate(${lL.toFixed(1)})`); c.legs[1].setAttribute('transform',`rotate(${lR.toFixed(1)})`); }

    // boca da alegria ri
    if(mood==='joy'){ const lf=R?1+.5*Math.abs(Math.sin(p*Math.PI*7))*(1-p*.5):1; const x=c.mouth.dataset.x, y=c.mouth.dataset.y; c.mouth.setAttribute('transform', lf===1?'':`translate(${x} ${y}) scale(${(1+(lf-1)*.3).toFixed(3)} ${lf.toFixed(3)}) translate(${-x} ${-y})`); }
    // gota de suor cai
    if(c.sweat){ if(R){ const q=ease(Math.min(1,p/.75)); c.sweat.setAttribute('transform',`translate(0 ${(q*c.r*3.2).toFixed(1)})`); c.sweat.setAttribute('opacity',(p<.75?1-q*.9:ease((p-.75)/.25)).toFixed(2)); if(p>.75) c.sweat.setAttribute('transform',''); } else { c.sweat.setAttribute('transform',''); c.sweat.setAttribute('opacity','1'); } }
    // lágrimas caem
    if(c.tears){ if(R){ c.tears.setAttribute('opacity','1'); c.tearRest.setAttribute('opacity','0'); [...c.tears.children].forEach(dp=>{ const q=(p*2.2+ +dp.dataset.o)%1; dp.setAttribute('transform',`translate(0 ${(q*c.r*2.8).toFixed(1)})`); dp.setAttribute('opacity',(q<.12?q/.12:1-ease((q-.5)/.5)).toFixed(2)); }); }
                 else { c.tears.setAttribute('opacity','0'); c.tearRest.setAttribute('opacity','1'); } }
    // raiva: chama e fumaça
    if(c.smoke){ if(R){ const e2=env(p,.1,.3); c.smoke.setAttribute('opacity','1'); [...c.smoke.children].forEach(pf=>{ const q=(p*1.8+ +pf.dataset.o)%1; pf.setAttribute('transform',`translate(${(Math.sin(q*6+ +pf.dataset.o*9)*c.r*.4).toFixed(1)} ${(-q*c.r*3.2).toFixed(1)})`); pf.setAttribute('r',(c.r*(.35+q*.6)).toFixed(1)); pf.setAttribute('opacity',(Math.sin(q*Math.PI)*.75*e2).toFixed(2)); });
                   const fk=10+Math.sin(t*28)*4+Math.sin(t*41)*3; c.img.style.filter=`drop-shadow(0 0 ${(fk*e2).toFixed(1)}px rgba(255,190,60,${(.95*e2).toFixed(2)})) drop-shadow(0 -${(8*e2).toFixed(1)}px ${(fk*2*e2).toFixed(1)}px rgba(255,90,50,${(.8*e2).toFixed(2)}))`;
                   c.brows.setAttribute('transform',`translate(0 ${(c.r*.18*e2).toFixed(1)})`); }
                 else { c.smoke.setAttribute('opacity','0'); if(c.img.style.filter) c.img.style.filter=''; c.brows.setAttribute('transform',''); } }
  }
  raf=requestAnimationFrame(frame);
}

/* INTRO */
const stage=$('stage');
const layout=[
  {k:'alegria',  x:52, y:80, w:46, max:330, depth:10, tilt:4},
  {k:'calma',    x:16, y:15, w:32, max:230, depth:6,  tilt:3},
  {k:'ansiedade',x:84, y:17, w:32, max:230, depth:7,  tilt:3},
  {k:'tristeza', x:11, y:64, w:30, max:220, depth:7,  tilt:3},
  {k:'raiva',    x:89, y:62, w:22, max:180, depth:8,  tilt:4},
  {k:'nimbo',    x:50, y:9,  w:24, max:175, depth:4,  tilt:2},
];
layout.forEach(L=>{
  const c=makeChar(L.k,{parallax:L.depth, tilt:L.tilt, floatAmp:4+L.depth*.3});
  c.el.style.width=`min(${L.w}cqw, ${L.max}px)`; c.el.style.left=L.x+'%'; c.el.style.top=L.y+'%';
  c.baseTransform='translate(-50%,-50%)';
  stage.appendChild(c.el);
});

/* FORM */
let current=null, intensity=.75;
const heroSlot=$('heroSlot'), chipsEl=$('chips'), heroChars={};
Object.keys(CAST).forEach(k=>{ const c=makeChar(k,{tilt:3, floatAmp:4}); c.el.style.display='none'; c.baseTransform='translate(-50%,-56%)';
  c.el.style.width=`min(${Math.min(54,40/CAST[k].ratio).toFixed(0)}cqw, ${Math.round(215/CAST[k].ratio)}px)`; heroSlot.appendChild(c.el); heroChars[k]=c; });
ORDER.forEach(k=>{
  const b=document.createElement('button'); b.type='button'; b.className='chip'; b.dataset.k=k; b.setAttribute('aria-label', CAST[k].name);
  const slot=document.createElement('div'); slot.className='slot';
  const c=makeChar(k,{static:true}); c.el.style.width=Math.round(Math.min(50, 40/CAST[k].ratio))+'px'; c.el.querySelector('.limbs').remove();
  const cr=c.el.querySelector('.crossed'); if(cr) cr.remove();
  slot.appendChild(c.el); b.appendChild(slot);
  b.onclick=()=>select(k); chipsEl.appendChild(b);
});
const root=document.documentElement;
const intro=$('intro'), form=$('form');
const picked={};
const CHECK='<span class="ck" aria-hidden="true"><svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>';
function renderBubbles(k){
  const box=$('bubbles'); box.innerHTML='';
  const show=k!=='nimbo'; $('motivos').hidden=!show; $('intens').hidden=!show; $('skip').hidden=!show;
  if(!show) return;
  picked[k]=picked[k]||new Set();
  const labels=[...REASONS[k]].sort((a,b)=>b.length-a.length);
  const pos=[...BPOS].sort((a,b)=>b[2]-a[2]);
  labels.forEach((txt,i)=>{ const [x,y,sz]=pos[i];
    const bt=document.createElement('button'); bt.type='button'; bt.className='bubble'; bt.innerHTML=`<span>${txt}</span>`+CHECK;
    bt.style.cssText=`left:${x}%; top:${(y/112*100).toFixed(2)}%; width:${sz}%; font-size:${sz<32?13:14}px; animation-delay:${i*60}ms, ${i*.7}s`;
    bt.setAttribute('aria-pressed', picked[k].has(txt));
    bt.onclick=()=>{ const on=!picked[k].has(txt); on?picked[k].add(txt):picked[k].delete(txt); bt.setAttribute('aria-pressed',on); };
    box.appendChild(bt);
  });
}
function select(k){
  const changed=k!==current; current=k; const d=CAST[k];
  Object.entries(heroChars).forEach(([key,c])=>{ const on=key===k; if(on&&c.el.style.display==='none') c.reactT=performance.now()-c.d.react*.6; c.el.style.display=on?'':'none'; });
  document.querySelectorAll('.chip').forEach(b=>b.classList.toggle('gone', b.dataset.k===k));
  $('feelName').textContent=d.name; $('feelLine').textContent=d.line;
  for(const t in d.c) root.style.setProperty('--'+t, d.c[t]);
  if(changed||!$('bubbles').children.length) renderBubbles(k);
}
$('intensity').oninput=(e=>{ intensity=e.target.value/100; $('intLbl').textContent=intensity<.4?'um pouco':intensity<.7?'mais ou menos':intensity<.9?'bastante':'muito'; });
$('skip').onclick=()=>select('nimbo');

function start(){ intro.classList.add('out'); form.classList.add('in'); form.scrollTop=0; }
intro.onclick=start;
intro.onkeydown=e=>{ if(e.key==='Enter'||e.key===' ') start(); };
intro.tabIndex=0;
$('back').onclick=()=>{ intro.classList.remove('out'); form.classList.remove('in'); };

const toast=$('toast'); let tt;
function say(m){ toast.textContent=m; toast.classList.add('on'); clearTimeout(tt); tt=setTimeout(()=>toast.classList.remove('on'),2400); }
$('ficha').onsubmit=e=>{ e.preventDefault(); say('Protótipo: nenhum dado foi enviado.'); };

const themes=['sistema','claro','escuro']; let ti=0;
try{ const v=localStorage.getItem('nimbo-theme'); if(themes.includes(v)) ti=themes.indexOf(v); }catch(e){}
function applyTheme(){ const v=themes[ti]; if(v==='sistema') root.removeAttribute('data-theme'); else root.setAttribute('data-theme', v==='claro'?'light':'dark'); $('themeBtn').textContent='Tema: '+v; try{ localStorage.setItem('nimbo-theme',v); }catch(e){} }
$('themeBtn').onclick=e=>{ e.stopPropagation(); ti=(ti+1)%3; applyTheme(); }; applyTheme();

select('nimbo');
raf=requestAnimationFrame(frame);

return ()=>{
  alive=false; cancelAnimationFrame(raf); clearTimeout(tt);
  window.removeEventListener('pointermove', onMove);
  window.removeEventListener('touchstart', onTouch);
  ['stage','heroSlot','chips','bubbles'].forEach(id=>{ const n=$(id); if(n) n.innerHTML=''; });
};

}
