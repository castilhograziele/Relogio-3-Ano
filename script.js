// posiciona um elemento em coordenadas polares (12h = topo)
function place(el, radius, deg, size){
  const a = (deg - 90) * Math.PI / 180;
  const cx = size/2, cy = size/2;
  el.style.left = (cx + radius * Math.cos(a)) + 'px';
  el.style.top  = (cy + radius * Math.sin(a)) + 'px';
  el.style.transform = 'translate(-50%,-50%)';
}

// constrói mostrador (pontinhos, 01..60 e 1..12)
(function buildFace(){
  const size = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--size'));

  const rim = 8;
  const rEdge = size/2 - rim;
  const rMinCircle = rEdge - 12;
  const rDots      = rMinCircle - 6;
  const rHours     = rMinCircle - 40;

  const dots = document.getElementById('dots');
  const minNums = document.getElementById('minNums');
  const hours = document.getElementById('hours');

  for(let i=0;i<60;i++){
    const d = document.createElement('div');
    d.className = 'dot' + (i%5===0?' major':'');
    place(d, rDots, i*6, size);
    dots.appendChild(d);
  }
  for(let i=1;i<=60;i++){
    const el = document.createElement('div');
    el.className = 'm-item' + (i%5===0?' bubble':'');
    el.textContent = String(i).padStart(2,'0');
    place(el, rMinCircle, i*6, size);
    minNums.appendChild(el);
  }
  const cls = ['c12','c1','c2','c3','c4','c5','c6','c7','c8','c9','c10','c11'];
  for(let h=1;h<=12;h++){
    const el = document.createElement('div');
    el.className = `h ${cls[h%12]}`;
    el.textContent = h;
    place(el, rHours, h*30, size);
    hours.appendChild(el);
  }
})();

// distribui fotos em 3 anéis (externo, meio e centro)
function layoutPhotos(urls){
  const size  = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--size'));
  const layer = document.getElementById('photos');
  layer.innerHTML = '';

  const rim = 8;
  const rEdge = size/2 - rim;
  const rFace = rEdge - 16;

  const rOuter  = rFace - 24;  // afastado dos números
  const rMiddle = rOuter - 68;
  const rCenter = rMiddle - 40;

  const N = urls.length;
  const outerCount  = Math.min(N, 12);
  const remaining   = Math.max(0, N - outerCount);
  const centerCount = Math.min(5, remaining);
  const middleCount = Math.max(0, remaining - centerCount);

  const startOuter  = -15;
  const startMiddle = 0;
  const startCenter = -90;

  for(let i=0;i<outerCount;i++){
    addPhoto(urls[i], rOuter, startOuter + (360/outerCount)*i, size, 'ring-outer');
  }
  for(let i=0;i<middleCount;i++){
    const deg = startMiddle + (360/middleCount)*i + (middleCount ? 180/middleCount : 0);
    addPhoto(urls[outerCount + i], rMiddle, deg, size, 'ring-middle');
  }
  for(let i=0;i<centerCount;i++){
    addPhoto(urls[outerCount + middleCount + i], rCenter, startCenter + (360/centerCount)*i, size, 'ring-center');
  }
}
function addPhoto(src, radius, deg, size, ringClass){
  const layer = document.getElementById('photos');
  const card = document.createElement('div');
  card.className = `photo ${ringClass}`;
  const img = document.createElement('img');
  img.src = src; img.alt = 'Aluno(a)';
  card.appendChild(img);
  place(card, radius, deg, size);
  layer.appendChild(card);
}

/* >>> substitua pelos seus caminhos/URLs <<< */
const alunos = [
  'alunos/2.png','alunos/3.png','alunos/4.png','alunos/5.png',
  'alunos/6.png','alunos/7.png','alunos/8.png','alunos/9.png',
  'alunos/10.png','alunos/11.png','alunos/12.png','alunos/13.png',
  'alunos/14.png','alunos/15.png','alunos/16.png','alunos/17.png',
  'alunos/18.png','alunos/19.png','alunos/20.png','alunos/21.png',
  'alunos/22.png','alunos/23.png','alunos/24.png','alunos/25.png',
  'alunos/26.png','alunos/27.png','alunos/28.png','alunos/29.png','alunos/30.png'
];
layoutPhotos(alunos);

// hora de Brasília (sem drift)
const fmt = new Intl.DateTimeFormat('pt-BR',{
  timeZone:'America/Sao_Paulo', hour12:false,
  hour:'2-digit', minute:'2-digit', second:'2-digit', timeZoneName:'short'
});
function getSaoPaulo(now=new Date()){
  const parts = fmt.formatToParts(now);
  let h=0,m=0,s=0,tz='BRT';
  for(const p of parts){
    if(p.type==='hour') h=+p.value;
    if(p.type==='minute') m=+p.value;
    if(p.type==='second') s=+p.value;
    if(p.type==='timeZoneName') tz=p.value;
  }
  return {h,m,s,tz};
}
const hourHand = document.getElementById('hourHand');
const minHand  = document.getElementById('minHand');
const secHand  = document.getElementById('secHand');
const tzEl     = document.getElementById('tzLabel');

function animate(){
  const now = new Date();
  const {h,m,s,tz} = getSaoPaulo(now);
  const seconds = s + now.getMilliseconds()/1000;
  const minutes = m + seconds/60;
  const hours   = (h%12) + minutes/60;

  hourHand.style.transform = `translate(-50%,-90%) rotate(${hours*30}deg)`;
  minHand .style.transform = `translate(-50%,-90%) rotate(${minutes*6}deg)`;
  secHand .style.transform = `translate(-50%,-90%) rotate(${seconds*6}deg)`;

  tzEl.textContent = `Horário de Brasília — America/Sao_Paulo (${tz})`;
  requestAnimationFrame(animate);
}
requestAnimationFrame(animate);
