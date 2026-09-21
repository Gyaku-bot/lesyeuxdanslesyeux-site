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
const etat = { i: -1, reponses: [], resolu: false, carte: null, occupe: false };

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
  /* le paquet maigrit : il reste (5 - n) cartes dessous */
  const reste = CARTES.length - n;
  $('dos1').classList.toggle('parti', reste < 1);
  $('dos2').classList.toggle('parti', reste < 2);
  requestAnimationFrame(() => requestAnimationFrame(() => slot.classList.add('face')));
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
  verdict.innerHTML = juste
    ? `Vous aviez dit <b class="${ditIntox ? 'r' : 'v'}">${ditMot}</b>. C'était bien ${etaitMot}. <b>Dix points dans les sondages.</b>`
    : `Vous aviez dit <b class="${ditIntox ? 'r' : 'v'}">${ditMot}</b>. C'était <b class="${c.ko ? 'r' : 'v'}">${etaitMot}</b>. À table, vous piochez une Magouille. C'est là que le 49.3 sert.`;
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
    3: `Trois erreurs sur cinq. Comme tout le monde, un verre plus tard.`,
    4: `Quatre erreurs sur cinq. Le réel dépasse votre imagination. Il dépasse celle de tout le monde.`,
    5: `Cinq erreurs sur cinq. Vous avez cru tout le faux et douté de tout le vrai. Bienvenue à table.`,
  };
  $('phrase').textContent = ph[fautes];
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
distribuer();
setTimeout(() => body.classList.remove('arrivee'), 60);

/* Vues de contrôle pour la revue : ?etat=resolu | fin (sans animation), ?vue=editeurs (second écran seul). */
if (params.get('vue') === 'editeurs') body.classList.add('sans-table');
if (params.has('etat')){
  body.classList.remove('arrivee');
  if (params.get('etat') === 'resolu') poser(true);
  if (params.get('etat') === 'fin'){ etat.reponses = [true, false, true, false, true]; etat.i = 4; bilan(); }
}
