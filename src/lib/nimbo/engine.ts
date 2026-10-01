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
  // sorrisinho de despedida (usado no tchau ao rolar a página)
  if(f.mouth!=='grin') s+=`<g class="smile" opacity="0"><path d="M${cx-mw} ${mouthY-r*.05} Q${cx} ${mouthY+r*.8} ${cx+mw} ${mouthY-r*.05}" fill="none" stroke="${INK}" stroke-width="${sw}" stroke-linecap="round"/></g>`;
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
    mouth:face.querySelector('.mouth'), smile:face.querySelector('.smile'), brows:face.querySelector('.brows'), sweat:face.querySelector('.sweat'),
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
  // braço que acena no tchau: troca pelo desenho de braço erguido enquanto acena
  c.armPaths=[...limbs.querySelectorAll('.arm path')];
  if(c.armPaths[1]){ // quanto girar para a ponta da mão apontar para cima e para fora (~235° no SVG)
    const END={up:[-1.25,-1.45], wiggle:[-1.55,-.35], droop:[-.9,1.6], mudra:[-.8,1.02], hips:[-.7,.6], shrug:[-1.45,-.4]}, [ex,ey]=END[L.arm]||[-1,0];
    let ang=Math.atan2(ey,ex)*180/Math.PI; if(ang<0) ang+=360; let lift=238-ang; if(lift>180) lift-=360; if(lift<-180) lift+=360; c.liftR=lift; }
  chars.push(c); return c;
}
function react(c){ const now=performance.now(); c.reactT=now; if(c.dieAt) c.dieAt=Math.max(c.dieAt, now+c.d.react+LIFE); }

/* ponteiro */
let ptr={x:innerWidth/2, y:innerHeight*.4}, lastMove=-1e9;
const onPt=(x,y)=>{ ptr={x,y}; lastMove=performance.now(); };
const onMove=e=>onPt(e.clientX,e.clientY);
const onTouch=e=>{ const t=e.touches[0]; if(t) onPt(t.clientX,t.clientY); };
window.addEventListener('pointermove', onMove, {passive:true});
window.addEventListener('touchstart', onTouch, {passive:true});

const ease=x=>x<0?0:x>1?1:x*x*(3-2*x);
const outBack=x=>{ const k=1.9, u=x-1; return 1+(k+1)*u*u*u+k*u*u; };
const BYE_MS=2000; // duração do tchau
const LIFE=1700; // quanto tempo o personagem fica depois da reação (ms)
const env=(p,a,b)=>p<0||p>1?0:Math.min(ease(p/a),1-ease((p-(1-b))/b));

function frame(now){
  if(!alive) return;
  const t=now/1000, dt=1/60, idle=now-lastMove>3000;
  stepBubbles();
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
    // tchau: ao rolar a página, o personagem acena, sorri e sobe um pouquinho
    let byeE=0, byeQ=-1; if(c.byeT){ byeQ=(now-c.byeT)/BYE_MS; if(byeQ<1) byeE=env(byeQ,.12,.28); else { c.byeT=0; byeQ=-1; } }
    if(byeE) hopY-=byeE*rect.height*.1;
    // surgir e sumir (personagens que aparecem no toque da tela inicial)
    let pop='';
    if(c.born){
      const age=(now-c.born)/480; let ps=age>=1?1:reduce?ease(age):outBack(age);
      if(c.drag&&c.dieAt<now+900) c.dieAt=now+900;
      if(!c.dieT&&now>c.dieAt) c.dieT=now;
      if(c.dieT){ const q=(now-c.dieT)/520; if(q>=1){ c.el.remove(); chars.splice(chars.indexOf(c),1); continue; } ps*=1-ease(q)*.7; c.el.style.opacity=(1-ease(q)).toFixed(3); }
      pop=` scale(${Math.max(0,ps).toFixed(3)})`;
    }
    const tilt=c.look.x*(c.tilt||3)*(.4+.6*E)+extraRot;
    const sx=(1+br+squashY)*grow, sy=(1-br-squashY)*grow;
    c.el.style.transform=`${c.baseTransform||''}${pop} translate(${(c.ox+jx+c.look.x*(c.parallax||0)*E).toFixed(1)}px, ${(c.oy+fl+hopY+c.look.y*(c.parallax||0)*.6*E).toFixed(1)}px) rotate(${a.toFixed(1)}deg) scale(${(1+st).toFixed(3)},${(1-st*.45).toFixed(3)}) rotate(${(-a+tilt).toFixed(2)}deg) scale(${sx.toFixed(4)},${sy.toFixed(4)})`;

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
    // tchau: o braço direito gira rápido para cima e para fora e acena
    const scR=1;
    if(byeE && c.liftR!=null){ const w=Math.sin((now-c.byeT)/1000*14)*22; aR=aR*(1-byeE)+(c.liftR+w)*byeE; aL=aL*(1-byeE); }
    if(c.smile){ c.smile.setAttribute('opacity',byeE.toFixed(2)); c.mouth.setAttribute('opacity',(1-byeE).toFixed(2)); }
    if(c.arms[0]){ c.arms[0].setAttribute('transform',`rotate(${aL.toFixed(1)})`); c.arms[1].setAttribute('transform',`rotate(${aR.toFixed(1)}) scale(${scR.toFixed(3)})`); }
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
/* toque em qualquer lugar: uma emoção aleatória surge no ponto tocado, reage e some */
const MAX_SPAWN=7; let lastKey=null, bag=[];
// sorteio sem repetir: todas as emoções aparecem antes de alguma voltar
function nextKey(){
  if(!bag.length){ bag=[...ORDER].sort(()=>Math.random()-.5); if(bag[0]===lastKey) bag.push(bag.shift()); }
  return lastKey=bag.shift();
}
function spawn(x,y){
  const sr=stage.getBoundingClientRect(); x-=sr.left; y-=sr.top;
  const k=nextKey();
  const d=CAST[k], w=.8*Math.min(sr.width*Math.min(38,30/d.ratio)/100, 170/d.ratio), h=w*d.ratio, pad=10;
  x=Math.min(Math.max(x, w/2+pad), sr.width-w/2-pad); y=Math.min(Math.max(y, h/2+pad), sr.height-h/2-pad);
  const sp=document.createElement('span'); sp.className='spark'; sp.style.cssText=`left:${x}px; top:${y}px; --c:${d.c.e2}`;
  sp.addEventListener('animationend', ()=>sp.remove()); stage.appendChild(sp);
  const now=performance.now();
  const c=makeChar(k,{tilt:3, floatAmp:3, parallax:3});
  c.baseTransform='translate(-50%,-50%)'; c.el.style.width=w+'px'; c.el.style.left=x+'px'; c.el.style.top=y+'px';
  c.born=now; c.reactT=now+160; c.dieAt=now+160+d.react+LIFE; c.energy=1;
  stage.appendChild(c.el);
  intro.classList.add('played');
  const live=chars.filter(o=>o.born&&!o.dieT);
  if(live.length>MAX_SPAWN) live[0].dieT=now;
}

/* FORM */
let current=null, intensity=.75;
const heroSlot=$('heroSlot'), chipsEl=$('chips'), heroChars={};
Object.keys(CAST).forEach(k=>{ const c=makeChar(k,{tilt:3, floatAmp:4}); c.el.style.display='none'; c.baseTransform='translate(-50%,-56%)';
  c.el.style.width=`min(${Math.min(50,38/CAST[k].ratio).toFixed(0)}cqw, ${Math.round(210/CAST[k].ratio)}px)`; heroSlot.appendChild(c.el); heroChars[k]=c; });
ORDER.forEach(k=>{
  const b=document.createElement('button'); b.type='button'; b.className='chip'; b.dataset.k=k; b.setAttribute('aria-label', CAST[k].name);
  const slot=document.createElement('div'); slot.className='slot';
  const c=makeChar(k,{static:true}); c.el.style.width=Math.round(Math.min(44, 35/CAST[k].ratio))+'px'; c.el.querySelector('.limbs').remove();
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
    const bt=document.createElement('button'); bt.type='button'; bt.className='bubble'; bt.innerHTML=`<span>${txt}</span>`;
    bt.style.cssText=`left:${x}%; top:${(y/112*100).toFixed(2)}%; width:${sz}%; font-size:${sz<32?13:14}px; animation-delay:${i*60}ms, ${i*.7}s`;
    bt.setAttribute('aria-pressed', picked[k].has(txt));
    bt.onclick=()=>{
      if(bt._dragged){ bt._dragged=false; return; } // foi arraste, não toque
      const on=!picked[k].has(txt); on?picked[k].add(txt):picked[k].delete(txt);
      if(!on||reduce){ bt.setAttribute('aria-pressed',on); return; }
      // estoura: gotinhas saem do centro, a bolha some e volta menor, marcada
      const cx=bt.offsetLeft+bt.offsetWidth/2, cy=bt.offsetTop+bt.offsetHeight/2, R=bt.offsetWidth*.55;
      for(let i=0;i<9;i++){ const a=i/9*Math.PI*2+Math.random()*.4, d=R*(.8+Math.random()*.5);
        const dp=document.createElement('span'); dp.className='drop';
        dp.style.cssText=`left:${cx}px; top:${cy}px; --dx:${(Math.cos(a)*d).toFixed(1)}px; --dy:${(Math.sin(a)*d).toFixed(1)}px; width:${6+Math.random()*6}px; height:auto; aspect-ratio:1`;
        dp.addEventListener('animationend',()=>dp.remove()); box.appendChild(dp); }
      bt.style.animation=`drift 6s ease-in-out ${i*.7}s infinite`; // sem repetir a entrada depois do estouro
      bt.classList.add('burst');
      setTimeout(()=>{ bt.classList.remove('burst'); bt.setAttribute('aria-pressed',true); bt.classList.add('regrow'); setTimeout(()=>bt.classList.remove('regrow'),520); },220);
    };
    box.appendChild(bt);
    setTimeout(()=>{ if(!bt.style.animation) bt.style.animation=`drift 6s ease-in-out ${i*.7}s infinite`; }, 700+i*60);
  });
  initBubblePhysics(box);
}

/* bolhas arrastáveis: empurram umas às outras (colisão de círculos), ficam dentro da área e deformam de leve */
let bub=[], bubBox=null, bubDrag=null;
function initBubblePhysics(box){
  bubBox=box; bubDrag=null;
  requestAnimationFrame(()=>{
    const W=box.clientWidth, H=box.clientHeight;
    bub=[...box.querySelectorAll('.bubble')].map(el=>{ const r=el.offsetWidth/2;
      const b={el, r, x:el.offsetLeft+r, y:el.offsetTop+r, vx:0, vy:0, sq:0, sa:0};
      el.style.left='0px'; el.style.top='0px'; el.style.width=(r*2)+'px';
      el.addEventListener('pointerdown', e=>{ bubDrag={b, id:e.pointerId, ox:e.clientX, oy:e.clientY, bx:b.x, by:b.y, moved:0, t:performance.now(), tvx:0, tvy:0}; b.vx=b.vy=0; try{ el.setPointerCapture(e.pointerId); }catch(_){} });
      el.addEventListener('pointermove', e=>{ const d=bubDrag; if(!d||d.b!==b||e.pointerId!==d.id) return;
        const nx=d.bx+(e.clientX-d.ox), ny=d.by+(e.clientY-d.oy); d.moved=Math.max(d.moved, Math.hypot(e.clientX-d.ox, e.clientY-d.oy));
        const now=performance.now(), dtm=Math.max(8,now-d.t); d.t=now;
        // velocidade do arraste (px por quadro, suavizada) para poder "jogar" a bolha
        d.tvx=d.tvx*.6+((nx-b.x)/dtm*16)*.4; d.tvy=d.tvy*.6+((ny-b.y)/dtm*16)*.4;
        b.x=nx; b.y=ny; });
      const up=e=>{ const d=bubDrag; if(!d||d.b!==b) return; if(d.moved>6) b.el._dragged=true;
        if(performance.now()-d.t<90){ const v=Math.hypot(d.tvx,d.tvy), k=v>22?22/v:1; b.vx=d.tvx*k; b.vy=d.tvy*k; } bubDrag=null; };
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
      return b; });
    placeBubbles();
  });
}
function stepBubbles(){
  if(!bub.length||!bubBox||!bubBox.isConnected) return;
  const W=bubBox.clientWidth, H=bubBox.clientHeight, drag=bubDrag?.b;
  if(drag){ drag.vx=bubDrag.tvx; drag.vy=bubDrag.tvy; bubDrag.tvx*=.85; bubDrag.tvy*=.85; }
  for(const b of bub) if(b!==drag){ b.x+=b.vx; b.y+=b.vy; b.vx*=.955; b.vy*=.955; if(Math.abs(b.vx)<.02) b.vx=0; if(Math.abs(b.vy)<.02) b.vy=0; }
  for(let it=0; it<4; it++){
    for(let i=0;i<bub.length;i++) for(let j=i+1;j<bub.length;j++){
      const a=bub[i], c=bub[j], dx=c.x-a.x, dy=c.y-a.y, d=Math.hypot(dx,dy)||.01, min=a.r+c.r+2;
      if(d>=min) continue;
      const o=min-d, nx=dx/d, ny=dy/d, wa=a===drag?0:c===drag?1:.5, wc=1-wa;
      a.x-=nx*o*wa; a.y-=ny*o*wa; c.x+=nx*o*wc; c.y+=ny*o*wc;
      // choque: troca de impulso na direção do contato (a arrastada empurra como se fosse pesada)
      const rv=(a.vx-c.vx)*nx+(a.vy-c.vy)*ny;
      if(it===0 && rv>0){ const e=.85;
        if(a===drag){ c.vx+=nx*rv*(1+e)*.8; c.vy+=ny*rv*(1+e)*.8; }
        else if(c===drag){ a.vx-=nx*rv*(1+e)*.8; a.vy-=ny*rv*(1+e)*.8; }
        else { const jj=rv*(1+e)/2; a.vx-=nx*jj; a.vy-=ny*jj; c.vx+=nx*jj; c.vy+=ny*jj; }
        const hit=Math.min(.14,rv*.025);
        if(a!==drag){ a.sq=Math.max(a.sq,hit); a.sa=Math.atan2(ny,nx); } if(c!==drag){ c.sq=Math.max(c.sq,hit); c.sa=Math.atan2(ny,nx); } }
      else if(it===0){ if(a!==drag){ a.sq=Math.min(.1,a.sq+o*.003); a.sa=Math.atan2(ny,nx); } if(c!==drag){ c.sq=Math.min(.1,c.sq+o*.003); c.sa=Math.atan2(ny,nx); } }
    }
    for(const b of bub){ // paredes: quica
      if(b.x<b.r){ b.x=b.r; if(b.vx<0) b.vx*=-.7; } if(b.x>W-b.r){ b.x=W-b.r; if(b.vx>0) b.vx*=-.7; }
      if(b.y<b.r){ b.y=b.r; if(b.vy<0) b.vy*=-.7; } if(b.y>H-b.r){ b.y=H-b.r; if(b.vy>0) b.vy*=-.7; } }
  }
  if(drag){ const v=Math.hypot(drag.vx,drag.vy); drag.sq+=(Math.min(.16,.05+v*.012)-drag.sq)*.3; if(v>.5) drag.sa=Math.atan2(drag.vy,drag.vx); }
  for(const b of bub) if(b!==drag){ const v=Math.hypot(b.vx,b.vy); if(v>1.5){ b.sq=Math.max(b.sq,Math.min(.1,v*.008)); b.sa=Math.atan2(b.vy,b.vx); } }
  placeBubbles();
}
function placeBubbles(){
  for(const b of bub){ b.sq*=.9; const a=b.sa*180/Math.PI;
    b.el.style.left=(b.x-b.r).toFixed(1)+'px'; b.el.style.top=(b.y-b.r).toFixed(1)+'px';
    b.el.style.transform=b.sq>.004?`rotate(${a.toFixed(1)}deg) scale(${(1+b.sq).toFixed(3)},${(1-b.sq*.8).toFixed(3)}) rotate(${(-a).toFixed(1)}deg)`:''; }
}
function select(k){
  const changed=k!==current; current=k; const d=CAST[k];
  // troca do personagem: o atual sai desfocando e o novo entra com mola
  Object.entries(heroChars).forEach(([key,c])=>{
    clearTimeout(c.swapT);
    if(key===k){
      if(c.el.style.display==='none'){ c.el.classList.add('away'); c.el.style.display=''; c.reactT=performance.now()-c.d.react*.6; }
      requestAnimationFrame(()=>requestAnimationFrame(()=>c.el.classList.remove('away')));
    } else if(c.el.style.display!=='none'){
      c.el.classList.add('away'); c.swapT=setTimeout(()=>{ c.el.style.display='none'; }, 360);
    }
  });
  document.querySelectorAll('.chip').forEach(b=>{ const on=b.dataset.k===k; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  // nome da emoção: o antigo sobe desfocando, o novo entra de baixo
  const nameEl=$('feelName');
  if(nameEl.lastElementChild?.textContent!==d.name){
    [...nameEl.children].forEach(o=>{ o.classList.add('out'); setTimeout(()=>o.remove(), 360); });
    const sp=document.createElement('span'); sp.textContent=d.name; nameEl.appendChild(sp);
  }
  $('feelLine').textContent=d.line;
  for(const t in d.c) root.style.setProperty('--'+t, d.c[t]);
  if(changed||!$('bubbles').children.length) renderBubbles(k);
}
$('intensity').oninput=(e=>{ intensity=e.target.value/100; $('intLbl').textContent=intensity<.4?'um pouco':intensity<.7?'mais ou menos':intensity<.9?'bastante':'muito'; });
$('skip').onclick=()=>select('nimbo');

/* deslizar no personagem troca a emoção (esquerda = próxima, direita = anterior) */
const hero=$('hero'); let sw=null;
const swDown=e=>{ sw={x:e.clientX, y:e.clientY, id:e.pointerId}; };
const swUp=e=>{
  if(!sw||e.pointerId!==sw.id) return; const dx=e.clientX-sw.x, dy=e.clientY-sw.y; sw=null;
  if(Math.abs(dx)<50||Math.abs(dx)<Math.abs(dy)*1.4) return;
  const i=ORDER.indexOf(current), n=ORDER.length;
  select(ORDER[(i+(dx<0?1:-1)+n)%n]);
  $('swipeHint')?.classList.add('done');
};
hero.addEventListener('pointerdown', swDown, true);
hero.addEventListener('pointerup', swUp, true);
hero.addEventListener('pointercancel', ()=>{ sw=null; }, true);

/* ao começar a rolar a ficha para baixo, o personagem dá tchau (ainda visível); rearma quando volta ao topo */
let byeArmed=true;
const onFormScroll=()=>{
  const y=form.scrollTop;
  if(byeArmed && y>60){ byeArmed=false; const c=heroChars[current]; if(c) c.byeT=performance.now(); }
  else if(!byeArmed && y<16) byeArmed=true;
};
form.addEventListener('scroll', onFormScroll, {passive:true});

function start(){ intro.classList.add('out'); form.classList.add('in'); form.scrollTop=0; }
$('startBtn').onclick=start;
/* abertura: depois que o logo se monta no centro, ele sobe e o resto da tela aparece */
const bootT=setTimeout(()=>intro.classList.remove('boot'), reduce?0:1500);
intro.onpointerdown=e=>{ if(intro.classList.contains('out')||intro.classList.contains('boot')||e.target.closest('button')) return; spawn(e.clientX, e.clientY); };
$('back').onclick=()=>{ intro.classList.remove('out'); form.classList.remove('in'); };


/* tema: chave sol/lua (claro/escuro); sem escolha salva, segue o sistema */
const darkMQ=matchMedia('(prefers-color-scheme: dark)');
let dark=darkMQ.matches;
try{ const v=localStorage.getItem('nimbo-theme'); if(v==='escuro') dark=true; else if(v==='claro') dark=false; }catch(e){}
function applyTheme(save){ root.setAttribute('data-theme', dark?'dark':'light'); const b=$('themeBtn'); b.setAttribute('aria-checked', String(dark)); b.classList.toggle('is-dark', dark);
  if(save){ try{ localStorage.setItem('nimbo-theme', dark?'escuro':'claro'); }catch(e){} } }
$('themeBtn').onclick=e=>{ e.stopPropagation(); dark=!dark; applyTheme(true); }; applyTheme(false);

select('nimbo');
raf=requestAnimationFrame(frame);

return ()=>{
  alive=false; cancelAnimationFrame(raf); clearTimeout(bootT);
  form.removeEventListener('scroll', onFormScroll); hero.removeEventListener('pointerdown', swDown, true); hero.removeEventListener('pointerup', swUp, true);
  window.removeEventListener('pointermove', onMove);
  window.removeEventListener('touchstart', onTouch);
  ['stage','heroSlot','chips','bubbles'].forEach(id=>{ const n=$(id); if(n) n.innerHTML=''; });
};

}
