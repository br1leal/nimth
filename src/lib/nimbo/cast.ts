// @ts-nocheck
/**
 * Elenco do Nimbo: forma dos braços e pernas, rosto, cores e motivos de cada emoção.
 * Coordenadas em % da imagem de cada personagem (public/chars/*.png).
 */
/* Braços e pernas em traço fino. Desenhados para o lado ESQUERDO (x negativo = para fora); o direito é espelhado. */
export const ARMS={
  up:     u=>`M0 0 C${-.75*u} ${-.1*u} ${-1.15*u} ${-.65*u} ${-1.25*u} ${-1.45*u}`,
  wiggle: u=>`M0 0 Q${-.3*u} ${-.45*u} ${-.55*u} ${-.1*u} T${-1.05*u} ${-.2*u} T${-1.55*u} ${-.35*u}`,
  droop:  u=>`M0 0 C${-.7*u} ${.25*u} ${-.95*u} ${.95*u} ${-.9*u} ${1.6*u}`,
  mudra:  u=>`M0 0 C${-.55*u} ${.2*u} ${-.9*u} ${.6*u} ${-.8*u} ${1.02*u} M${-.8*u} ${1.02*u} m${-.13*u} ${.13*u} a${.13*u} ${.13*u} 0 1 0 ${.26*u} 0 a${.13*u} ${.13*u} 0 1 0 ${-.26*u} 0`,
  hips:   u=>`M0 ${-.2*u} L${-1.05*u} ${.3*u} L${-.35*u} ${.95*u}`,
  shrug:  u=>`M0 0 C${-.6*u} ${.55*u} ${-1.1*u} ${.55*u} ${-1.3*u} ${.05*u} L${-1.45*u} ${-.4*u}`
};
export const LEGS={
  step:  u=>`M0 0 L${-.12*u} ${1.05*u} L${-.5*u} ${1.05*u}`,
  stand: u=>`M0 0 Q${-.18*u} ${.5*u} 0 ${u} L${-.42*u} ${u}`,
  knock: u=>`M0 0 L${.32*u} ${.55*u} L${.05*u} ${1.05*u} L${-.32*u} ${1.05*u}`,
  lotus: u=>{ u*=1.3; return `M0 0 C${-.5*u} ${.1*u} ${-1.0*u} ${.32*u} ${-.97*u} ${.58*u} C${-.93*u} ${.84*u} ${-.2*u} ${.9*u} ${.52*u} ${.8*u} L${.78*u} ${.66*u}`; },
  wide:  u=>`M0 0 L${-.45*u} ${.95*u} L${-.88*u} ${.95*u}`,
  plain: u=>`M0 0 L0 ${u} L${-.38*u} ${u}`
};

export const CAST={
  alegria:{name:'Alegria', line:'Leve, com vontade de sorrir', img:'/chars/alegria.png', ratio:.9172,
    eyes:[[39,46],[61,46]], r:10, face:{lid:0, lidAngle:0, brow:{y:-.6, angle:-8, arch:1.2}, pupil:1, mouth:'soft', grinOnReact:1, cheeks:1},
    limbs:{arm:'none', leg:'step', legAt:[[38,95],[62,95]], tone:'#FFEA85'},
    /* os braços fazem parte do desenho: recortamos as duas pontas laterais e giramos no ombro */
    imgArms:{body:'0 0,100% 0,100% 28%,86% 28%,86% 60%,100% 60%,100% 100%,0 100%,0 64%,14% 64%,14% 30%,0 30%',
      L:{poly:'0 30%,22% 30%,22% 64%,0 64%', pivot:[17,47]}, R:{poly:'78% 28%,100% 28%,100% 60%,78% 60%', pivot:[83,43]}},
    c:{e1:'#FFEBCB',e2:'#FFBE7A',e3:'#B35712'}, speed:1.6, mood:'joy', react:1200},
  calma:{name:'Calma', line:'Respirando no meu ritmo', img:'/chars/calma.png', ratio:.8531,
    eyes:[[37,50],[55,50]], r:8.8, face:{lid:.6, lidAngle:0, brow:{y:-.3, angle:-4, arch:.8}, pupil:.95, mouth:'soft', cheeks:.6},
    limbs:{arm:'mudra', armLen:1.3, armAt:[6,68], leg:'lotus', legAt:[[33,86],[67,86]], tone:'#A98BF5'}, c:{e1:'#E6DCFF',e2:'#B99BFF',e3:'#4A1FD1'}, speed:.6, mood:'calm', react:3200},
  ansiedade:{name:'Ansiedade', line:'Com a cabeça acelerada', img:'/chars/ansiedade.png', ratio:.9719,
    eyes:[[44,49],[59,49]], r:8.2, face:{lid:0, lidAngle:0, brow:{y:-.8, angle:-16, arch:.3}, pupil:.55, mouth:'wavy', cheeks:.2, sweat:1, shiver:1},
    limbs:{arm:'wiggle', armLen:1.45, armAt:[7,50], leg:'knock', legAt:[[40,93],[60,93]], tone:'#5FD0BD'}, c:{e1:'#D3F6F1',e2:'#72DACD',e3:'#0F7468'}, speed:2.4, mood:'anx', react:1700},
  tristeza:{name:'Tristeza', line:'Com o coração pesado', img:'/chars/tristeza.png', ratio:.7953,
    eyes:[[37,63],[53,63]], r:8.6, face:{lid:.42, lidAngle:-16, brow:{y:-.6, angle:-18, arch:.2}, pupil:1, mouth:'frown', cheeks:.25, tear:1, lookDown:1},
    limbs:{arm:'droop', armLen:1.45, armAt:[4,66], leg:null, tone:'#8DB6EE'}, c:{e1:'#DDEBFF',e2:'#94BEF2',e3:'#1F5AA6'}, speed:.8, mood:'sad', react:2200},
  raiva:{name:'Raiva', line:'Com algo me incomodando', img:'/chars/raiva.png', ratio:1.2098,
    eyes:[[41,66],[60,66]], r:9.8, face:{lid:.34, lidAngle:18, brow:{y:-.4, angle:22, arch:0}, pupil:.95, mouth:'grumpy', cheeks:.8, smoke:1},
    limbs:{arm:'hips', armLen:1.45, armAt:[6,70], leg:'wide', legAt:[[38,95],[62,95]], tone:'#F58B78'}, c:{e1:'#FFE2DC',e2:'#FF9E8E',e3:'#B3352A'}, speed:1.4, mood:'angry', react:2200},
  nimbo:{name:'Neutro', line:'Toque numa emoção abaixo, se quiser', img:'/chars/nimbo.png', ratio:1.2839,
    eyes:[[36,52],[64,52]], r:12.5, face:{lid:.5, lidAngle:0, brow:{y:-.5, angle:0, arch:.1, one:1}, pupil:1, mouth:'flat', cheeks:0},
    limbs:{arm:'shrug', armLen:1.3, armAt:[4,60], leg:'plain', legAt:[[36,97],[64,97]], tone:'#E3DFEC'}, c:{e1:'#ECE8F4',e2:'#C7BFDD',e3:'#4E4766'}, speed:1, mood:'meh', react:1200}
};
export const ORDER=['alegria','calma','ansiedade','tristeza','raiva','nimbo'];
export const REASONS={
  alegria:['Família','Amizades','Trabalho','Conquista','Amor','Saúde'],
  calma:['Descanso','Rotina','Natureza','Respirar','Boa conversa','Sem pressa'],
  ansiedade:['Trabalho','Futuro','Dinheiro','Saúde','Relação','Sono'],
  tristeza:['Saudade','Solidão','Relação','Família','Cansaço','Não sei'],
  raiva:['Injustiça','Trabalho','Família','Frustração','Alguém','Não sei']
};
export const BPOS=[[2,4,36],[38,0,44],[0,40,40],[42,42,36],[72,30,28],[22,76,34]]; // x, y, tamanho (em % da largura)

