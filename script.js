/* =========================================================
   Relógio analógico — EMEF Etelvina Rocha Duro (3º ano)
   Horário de Brasília em tempo real (horas, minutos e segundos)
   ========================================================= */

const clockEl   = document.getElementById('clock');
const dotsEl    = document.getElementById('dots');
const minNumsEl = document.getElementById('minNums');
const hoursEl   = document.getElementById('hours');
const photosEl  = document.getElementById('photos');

// tamanho real renderizado do relógio (responsivo)
function getSize(){ return clockEl.clientWidth || 540; }

// posiciona um elemento em coordenadas polares (12h = topo)
function place(el, radius, deg, size){
  const a  = (deg - 90) * Math.PI / 180;
  const cx = size / 2, cy = size / 2;
  el.style.left = (cx + radius * Math.cos(a)) + 'px';
  el.style.top  = (cy + radius * Math.sin(a)) + 'px';
}

/* ---- fotos dos alunos (pasta recomendada) ----
   27 alunos na pasta "novos alunos 2026".
   A numeração pula o 11 (foto duplicada, removida).
   Para adicionar/remover alunos, basta editar a lista "ids" abaixo. */
const ids = [1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28];
const alunos = ids.map(n => `alunos/novos%20alunos%202026/aluno2026-${n}.jpeg`);

// paleta dos anéis coloridos ao redor de cada foto
const palette = ['#f39c12','#9b59b6','#3b82f6','#55b46e','#d7a31c','#e63946',
                 '#2aa4f4','#a23aa8','#5a3aa8','#16a085','#c7a10f','#e91e8c'];

/* ---- mostrador: pontinhos, 01..60 e 1..12 ---- */
function buildFace(){
  const size = getSize();
  dotsEl.innerHTML = ''; minNumsEl.innerHTML = ''; hoursEl.innerHTML = '';

  const rim        = size * 0.015;
  const rEdge      = size / 2 - rim;
  const rMinCircle = rEdge - size * 0.035;
  const rDots      = rMinCircle - size * 0.020;
  const rHours     = rMinCircle - size * 0.080;

  // pontinhos (vermelhos nos múltiplos de 5)
  for(let i = 0; i < 60; i++){
    const d = document.createElement('div');
    d.className = 'dot' + (i % 5 === 0 ? ' major' : '');
    place(d, rDots, i * 6, size);
    dotsEl.appendChild(d);
  }
  // números dos minutos 01..60 (vermelhos nos múltiplos de 5)
  for(let i = 1; i <= 60; i++){
    const el = document.createElement('div');
    el.className = 'm-item' + (i % 5 === 0 ? ' bubble' : '');
    el.textContent = String(i).padStart(2, '0');
    place(el, rMinCircle, i * 6, size);
    minNumsEl.appendChild(el);
  }
  // números das horas 1..12 (coloridos)
  const cls = ['c12','c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11'];
  for(let h = 1; h <= 12; h++){
    const el = document.createElement('div');
    el.className = `h ${cls[h % 12]}`;
    el.textContent = h;
    place(el, rHours, h * 30, size);
    hoursEl.appendChild(el);
  }
  return { size, rHours };
}

/* ---- distribui as fotos em anéis concêntricos uniformes ---- */
function layoutPhotos(urls, face){
  const size   = face.size;
  const rHours = face.rHours;
  photosEl.innerHTML = '';

  const N      = urls.length;
  const photoD = size * 0.094;                 // diâmetro de cada foto
  const photoR = photoD / 2;

  const Rout = rHours - photoR - size * 0.080; // anel externo (com folga dos números)
  const Rin  = size * 0.085;                    // folga para o centro/ponteiros

  // número de anéis conforme o espaço disponível
  const ringGap = photoD * 1.05;
  let numRings  = Math.max(1, Math.round((Rout - Rin) / ringGap) + 1);
  numRings      = Math.min(numRings, Math.max(1, Math.ceil(N / 3)));

  // raios dos anéis (do externo para o interno)
  const radii = [];
  if(numRings === 1){
    radii.push(Rout);
  } else {
    for(let i = 0; i < numRings; i++){
      radii.push(Rout - (Rout - Rin) * i / (numRings - 1));
    }
  }

  // quantidade por anel ~ proporcional ao raio (densidade uniforme)
  const sumR   = radii.reduce((a, b) => a + b, 0);
  const exact  = radii.map(r => N * r / sumR);
  const counts = exact.map(Math.floor);
  let used     = counts.reduce((a, b) => a + b, 0);

  // distribui o restante pelos maiores "restos"
  const order = exact
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  let k = 0;
  while(used < N){ counts[order[k % order.length].i]++; used++; k++; }

  // posiciona cada foto
  let idx = 0;
  radii.forEach((r, ri) => {
    const c = counts[ri];
    if(c <= 0) return;
    const startDeg = ri * 18;                   // leve defasagem entre anéis
    for(let i = 0; i < c; i++){
      const deg = startDeg + (360 / c) * i;
      addPhoto(urls[idx], r, deg, size, photoD, palette[idx % palette.length]);
      idx++;
    }
  });
}

function addPhoto(src, radius, deg, size, diameter, color){
  const card = document.createElement('div');
  card.className = 'photo';
  card.style.width       = diameter + 'px';
  card.style.height      = diameter + 'px';
  card.style.borderColor = color;

  const img = document.createElement('img');
  img.src = src;
  img.alt = 'Aluno(a)';
  img.loading = 'lazy';
  card.appendChild(img);

  place(card, radius, deg, size);
  photosEl.appendChild(card);
}

/* ---- monta tudo (e refaz ao redimensionar a tela) ---- */
function buildAll(){
  const face = buildFace();
  layoutPhotos(alunos, face);
}
buildAll();

let resizeT;
window.addEventListener('resize', () => {
  clearTimeout(resizeT);
  resizeT = setTimeout(buildAll, 150);
});

/* =========================================================
   Hora de Brasília (America/Sao_Paulo) — sem drift
   ========================================================= */
const fmt = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo', hour12: false,
  hour: '2-digit', minute: '2-digit', second: '2-digit', timeZoneName: 'short'
});

function getSaoPaulo(now = new Date()){
  const parts = fmt.formatToParts(now);
  let h = 0, m = 0, s = 0, tz = 'BRT';
  for(const p of parts){
    if(p.type === 'hour')          h = (+p.value) % 24;
    if(p.type === 'minute')        m = +p.value;
    if(p.type === 'second')        s = +p.value;
    if(p.type === 'timeZoneName')  tz = p.value;
  }
  return { h, m, s, tz };
}

const hourHand = document.getElementById('hourHand');
const minHand  = document.getElementById('minHand');
const secHand  = document.getElementById('secHand');
const tzEl     = document.getElementById('tzLabel');

function animate(){
  const now = new Date();
  const { h, m, s, tz } = getSaoPaulo(now);

  const seconds = s + now.getMilliseconds() / 1000; // movimento suave
  const minutes = m + seconds / 60;
  const hours   = (h % 12) + minutes / 60;

  hourHand.style.transform = `translate(-50%,-90%) rotate(${hours   * 30}deg)`;
  minHand .style.transform = `translate(-50%,-90%) rotate(${minutes * 6}deg)`;
  secHand .style.transform = `translate(-50%,-90%) rotate(${seconds * 6}deg)`;

  tzEl.textContent = `Horário de Brasília — America/Sao_Paulo (${tz})`;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
