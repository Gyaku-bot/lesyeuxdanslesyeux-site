/* LES YEUX DANS LES YEUX · V3 desktop simplifiée · moteur de la table.
   Une Casserole en grand, deux bulletins cliquables (flèches du clavier aussi), le tampon, la chute, la suivante.
   Pas de score conservé, pas de rejouabilité : une révélation, pas une démo (brief § 16). */
const EYE = '<svg viewBox="0 0 120 70" fill="none" stroke="currentColor" stroke-width="5" aria-hidden="true"><path d="M8 38 Q60 -6 112 38 Q60 80 8 38 Z"/><circle cx="60" cy="38" r="15"/><circle cx="60" cy="38" r="5.5" fill="currentColor" stroke="none"/></svg>';
const CARTES = window.CARTES_DATA || [];
const body = document.body;
const $ = id => document.getElementById(id);
const slot = $('slot'), verdict = $('verdict'), suite = $('suite'), compteur = $('compteur');
const buls = { 0: $('bul-info'), 1: $('bul-intox') };
const params = new URLSearchParams(location.search);
const etat = { i: -1, reponses: [], resolu: false, carte: null, occupe: false, main: 0, score: 0 };

/* Les Magouilles qu'on pioche, une par erreur, dans l'ordre. Textes = ceux imprimés sur les cartes. */
const MAGOUILLES = [
  { nom: 'le 49.3', src: '../v2/assets/mag_attaque_493.webp', alt: 'Magouille 49.3, carte Attaque.', effet: 'Tu t\'es trompé ? +10 pour toi quand même.' },
  { nom: 'le Kompromat', src: '../v2/assets/mag_kompromat.webp', alt: 'Magouille Kompromat, carte Attaque.', effet: 'Tu détiens une information compromettante sur le joueur de ton choix : il perd 10.' },
  { nom: 'la Corruption', src: '../v2/assets/mag_corruption.webp', alt: 'Magouille Corruption, carte Attaque.', effet: 'Le joueur de ton choix ne peut plus t\'attaquer jusqu\'à la fin de la manche.' },
  { nom: 'l\'Immunité parlementaire', src: '../v2/assets/mag_parade_immunite.webp', alt: 'Magouille Immunité parlementaire, carte Parade.', effet: 'Quand une Magouille te vise : il ne se passe rien.' },
  { nom: 'la Perquisition', src: '../v2/assets/mag_perquisition.webp', alt: 'Magouille Perquisition, carte Attaque.', effet: 'Prends une Magouille face cachée au joueur de ton choix.' },
];

/* ---- piocher : la Magouille arrive dans la main, face visible ---- */
function piocher(){
  const m = MAGOUILLES[etat.main];
  if (!m) return null;
  etat.main++;
  const fan = $('fan');
  fan.classList.add('pleine');
  const fig = document.createElement('figure');
  fig.className = 'm arrive';
  fig.tabIndex = 0;
  fig.innerHTML = `<img src="${m.src}" alt="${m.alt}">`;
  fan.appendChild(fig);
  placerMain();
  requestAnimationFrame(() => requestAnimationFrame(() => fig.classList.remove('arrive')));
  const n = etat.main;
  $('main-etiq').textContent = `Votre main · ${n === 1 ? 'Une Magouille' : n + ' Magouilles'}`;
  $('main-legende').textContent = `${m.nom.charAt(0).toUpperCase() + m.nom.slice(1)} : ${m.effet} À jouer à la phase Magouilles. Survolez pour lire la carte.`;
  return m;
}
/* l'éventail se resserre à mesure : la main garde la même largeur, quelle que soit la taille */
function placerMain(){
  const cartes = [...$('fan').querySelectorAll('.m')];
  const n = cartes.length;
  cartes.forEach((c, k) => {
    const pas = n > 1 ? Math.min(0.30, 0.74 / (n - 1)) : 0;       /* en fraction de --cw ; 0.74 = largeur de la main moins une carte */
    c.style.left = `calc(var(--cw) * ${(k * pas).toFixed(3)})`;
    c.style.setProperty('--r', `${((k - (n - 1) / 2) * 3).toFixed(1)}deg`);
  });
}

function hl(t){ return t.replace(/\[\[(.+?)\]\]/g, '<span class="hl">$1</span>'); }
function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

function carteHTML(c, n){
  const mot = c.ko ? 'INTOX' : 'INFO';
  const chute = c.chute.trim().startsWith('«') ? esc(c.chute) : `<q>«</q> ${esc(c.chute)} <q>»</q>`;
  return `<article class="carte" aria-label="Casserole ${n}">
    <div class="ck"><span>Casserole</span><span>Cote ${esc(c.cote)}</span></div>
    <div class="ville">${esc(c.ville)}</div>
    <div class="filetr"></div>
    <div class="fait">${hl(esc(c.fait))}</div>
    <div class="milieu"><div class="arret"><span class="ligne"></span><span class="q">Info ou intox ?</span></div></div>
    <div class="bas">
      <div class="tamp-row"><div class="tampon ${c.ko ? 'ko' : 'ok'}"><span>${mot}</span></div></div>
      <div class="rev">${esc(c.revelation)}</div>
      <div class="chute">${chute}</div>
      <div class="pied"><span>Registre des scellés, p.&nbsp;${c.page}</span><span>${EYE}</span></div>
    </div>
  </article>`;
}

/* ---- une carte trop pleine se resserre, comme à l'impression ---- */
function ajuster(carte){
  const deborde = () => carte.scrollHeight > carte.clientHeight + 1;
  if (deborde()) carte.classList.add('serre');
  if (deborde()) carte.classList.add('serre2');
}

/* ---- distribuer : la carte du dessus se retourne ---- */
function distribuer(){
  etat.i++;
  etat.resolu = false;
  body.classList.remove('resolu');
  [0, 1].forEach(v => buls[v].classList.remove('choisi'));
  const c = CARTES[etat.i];
  const n = etat.i + 1;
  compteur.textContent = `Casserole ${n} sur ${CARTES.length} · Cote ${c.cote}`;
  suite.innerHTML = (n < CARTES.length ? 'Casserole suivante' : 'Le bilan') + ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 4l8 8-8 8"/></svg>';
  slot.classList.remove('face', 'sort');
  slot.innerHTML = `<div class="flip"><div class="back"></div><div class="front">${carteHTML(c, n)}</div></div>`;
  etat.carte = slot.querySelector('.carte');
  ajuster(etat.carte);
  /* le paquet maigrit : il reste (5 - n) cartes dessous */
  const reste = CARTES.length - n;
  $('dos1').classList.toggle('parti', reste < 1);
  $('dos2').classList.toggle('parti', reste < 2);
  requestAnimationFrame(() => requestAnimationFrame(() => slot.classList.add('face')));
}

/* ---- les sondages : le +10 monte de la carte jusqu'au score ---- */
function marquer(){
  const a = etat.carte.getBoundingClientRect(), b = $('pct').getBoundingClientRect();
  const plus = document.createElement('div');
  plus.className = 'plus';
  plus.textContent = '+10';
  plus.style.left = (a.left + a.width / 2) + 'px';
  plus.style.top = (a.top + a.height * .62) + 'px';
  document.body.appendChild(plus);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    plus.classList.add('visible');
    plus.style.left = (b.left + b.width / 2) + 'px';
    plus.style.top = (b.top + b.height / 2) + 'px';
    plus.style.fontSize = '18px';
  }));
  setTimeout(() => { plus.classList.remove('visible'); }, 800);
  setTimeout(() => { plus.remove(); afficherScore(etat.score); }, 1100);
}
function afficherScore(cible){
  const el = $('pct'), pct = el.parentElement;
  let v = parseInt(el.textContent, 10) || 0;
  pct.classList.add('pop');
  const tick = setInterval(() => {
    v = Math.min(cible, v + 1);
    el.textContent = v;
    if (v >= cible){ clearInterval(tick); pct.classList.remove('pop'); }
  }, 28);
  document.querySelectorAll('.piste .pt').forEach(p => {
    const val = parseInt(p.dataset.v, 10);
    const on = val <= cible;
    if (on && !p.classList.contains('on')){ p.classList.add('on', 'neuf'); setTimeout(() => p.classList.remove('neuf'), 500); }
  });
}

/* ---- poser son bulletin ---- */
function poser(ditIntox){
  if (etat.resolu || etat.occupe || body.classList.contains('arrivee')) return;
  etat.resolu = true;
  const c = CARTES[etat.i];
  const juste = ditIntox === c.ko;
  etat.reponses[etat.i] = juste;
  buls[ditIntox ? 1 : 0].classList.add('choisi');
  body.classList.add('resolu');
  etat.carte.classList.add(c.ko ? 'ko' : 'ok');
  const ditMot = ditIntox ? 'intox' : 'info', etaitMot = c.ko ? 'intox' : 'info';
  if (juste){
    etat.score += 10;
    verdict.innerHTML = `Vous aviez dit <b class="${ditIntox ? 'r' : 'v'}">${ditMot}</b>. C'était bien ${etaitMot}. <b class="v">+10</b> dans les sondages.`;
    setTimeout(marquer, 500);
  } else {
    const prochaine = MAGOUILLES[etat.main];
    verdict.innerHTML = `Vous aviez dit <b class="${ditIntox ? 'r' : 'v'}">${ditMot}</b>. C'était <b class="${c.ko ? 'r' : 'v'}">${etaitMot}</b>. `
      + `Vous piochez une Magouille : <b>${prochaine.nom}</b> arrive dans votre main.`;
    setTimeout(piocher, 700);
  }
}

/* ---- la suivante : la carte s'efface, la prochaine se retourne ---- */
function suivante(){
  if (!etat.resolu || etat.occupe) return;
  etat.occupe = true;
  if (etat.i + 1 >= CARTES.length){ etat.occupe = false; return bilan(); }
  slot.classList.add('sort');
  body.classList.remove('resolu');
  setTimeout(() => { distribuer(); etat.occupe = false; }, 380);
}

/* ---- le bilan ---- */
function bilan(){
  body.classList.remove('resolu');
  body.classList.add('fin');
  const fautes = etat.reponses.filter(r => r === false).length;
  const ph = {
    0: `Cinq sur cinq. Vous lisez la presse judiciaire, ou vous y figurez.`,
    1: `Une erreur sur cinq. La réalité vous a eu une fois. Elle recommencera.`,
    2: `Deux erreurs sur cinq. Comme tout le monde.`,
    3: `Trois erreurs sur cinq. Le réel a gagné, de peu.`,
    4: `Quatre erreurs sur cinq. Le réel dépasse votre imagination. Il dépasse celle de tout le monde.`,
    5: `Cinq erreurs sur cinq. Vous avez cru tout le faux et douté de tout le vrai. Bienvenue à table.`,
  };
  const score = etat.score, manque = 50 - score;
  $('final-pct').textContent = `${score} %`;
  const oral = score >= 50
    ? `Vous êtes à 50 %. Vous nouez la cravate : le grand oral. Trois casseroles, deux bonnes réponses, élu. C'est une élection, pas un concours.`
    : `Il vous manque ${manque} points pour être candidat au grand oral.`;
  $('phrase').innerHTML = `<span>${oral}</span><span>${ph[fautes]}</span>`;
  $('bilan').setAttribute('aria-hidden', 'false');
}

/* ---- commandes ---- */
[0, 1].forEach(v => buls[v].addEventListener('click', () => poser(v === 1)));
suite.addEventListener('click', suivante);
slot.addEventListener('click', () => { if (etat.resolu) suivante(); });
document.addEventListener('keydown', e => {
  if (body.classList.contains('fin')) return;
  if (!etat.resolu && e.key === 'ArrowLeft') poser(false);
  else if (!etat.resolu && e.key === 'ArrowRight') poser(true);
  else if (etat.resolu && (e.key === 'Enter' || e.key === ' ')){ e.preventDefault(); suivante(); }
});

/* ---- arrivée : tout se pose, puis la première carte se retourne ---- */
if (params.has('carte')) etat.i = parseInt(params.get('carte'), 10) - 2;   /* vue de contrôle : ?carte=N démarre à la carte N */
distribuer();
setTimeout(() => body.classList.remove('arrivee'), 60);

/* Vues de contrôle pour la revue : ?etat=resolu | fin (sans animation), ?vue=editeurs (second écran seul). */
if (params.get('vue') === 'editeurs') body.classList.add('sans-table');
if (params.get('vue') === 'table') body.classList.add('sans-hero');
if (params.has('etat')){
  body.classList.remove('arrivee');
  if (params.get('etat') === 'resolu') poser(true);
  if (params.get('etat') === 'fin'){ etat.reponses = [true, false, true, false, true]; etat.i = 4; etat.score = 30; afficherScore(30); piocher(); piocher(); bilan(); }
  if (params.get('etat') === 'erreur'){ poser(false); }
  if (params.get('etat') === 'main5'){ for (let k = 0; k < 5; k++) piocher(); }
  if (params.get('etat') === 'fin5'){ etat.reponses = [false, false, false, false, false]; etat.i = 4; for (let k = 0; k < 5; k++) piocher(); bilan(); }
}
