/* LES YEUX DANS LES YEUX · V3 desktop · moteur de la table.
   Le geste : on saisit la carte à la souris et on la pose sur un bulletin. Le bulletin est aussi cliquable, les flèches du clavier marchent.
   Pas de score conservé, pas de rejouabilité : une révélation, pas une démo (brief § 16). */
const EYE = '<svg viewBox="0 0 120 70" fill="none" stroke="currentColor" stroke-width="5" aria-hidden="true"><path d="M8 38 Q60 -6 112 38 Q60 80 8 38 Z"/><circle cx="60" cy="38" r="15"/><circle cx="60" cy="38" r="5.5" fill="currentColor" stroke="none"/></svg>';
const CARTES = window.CARTES_DATA || [];
const body = document.body;
const $ = id => document.getElementById(id);
const slot = $('slot'), deck = $('deck'), fan = $('fan'), verdict = $('verdict'), suite = $('suite'), compteur = $('compteur');
const buls = { 0: $('bul-info'), 1: $('bul-intox') };
const piles = { 0: $('pile-info'), 1: $('pile-intox') };
const params = new URLSearchParams(location.search);
const reduit = matchMedia('(prefers-reduced-motion: reduce)').matches;

const etat = { i: -1, reponses: [], resolu: false, carte: null, mover: null };

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

/* ---- la main : cinq emplacements, une Magouille par erreur ---- */
function dessinerMain(){
  fan.innerHTML = '';
  const n = CARTES.length;
  for (let k = 0; k < n; k++){
    const m = document.createElement('div');
    const prise = etat.reponses[k] === false;
    m.className = 'm' + (prise ? '' : ' vide');
    m.style.left = `${k * 12}%`;
    m.style.transform = `rotate(${(k - (n - 1) / 2) * 4}deg)`;
    fan.appendChild(m);
  }
}

/* ---- distribuer la carte suivante ---- */
function distribuer(){
  etat.i++;
  etat.resolu = false;
  body.classList.remove('resolu');
  const c = CARTES[etat.i];
  const n = etat.i + 1;
  compteur.textContent = `Casserole ${n} sur ${CARTES.length} · Cote ${c.cote}`;
  suite.innerHTML = (n < CARTES.length ? 'Casserole suivante' : 'Le bilan') + ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M9 4l8 8-8 8"/></svg>';
  slot.classList.remove('face', 'livree', 'hint');
  slot.innerHTML = `<div class="mover"><div class="flip"><div class="back"></div><div class="front">${carteHTML(c, n)}</div></div></div>`;
  etat.carte = slot.querySelector('.carte');
  etat.mover = slot.querySelector('.mover');
  etat.carte.addEventListener('pointerdown', debutDrag);
  const dos = deck.querySelectorAll('.dos:not(.pris)');
  if (dos.length) dos[dos.length - 1].classList.add('pris');
  setTimeout(() => { slot.classList.add('face'); if (etat.i === 0 && !reduit) slot.classList.add('hint'); }, 260);
}

/* ---- le geste : glisser la carte ---- */
let drag = null;
function debutDrag(e){
  if (etat.resolu || body.classList.contains('fiche-ouverte') || body.classList.contains('arrivee')) return;
  e.preventDefault();
  etat.carte.setPointerCapture(e.pointerId);
  drag = { x0: e.clientX, y0: e.clientY, sur: null };
  slot.classList.remove('hint');
  body.classList.add('drag');
  etat.carte.addEventListener('pointermove', mouvDrag);
  etat.carte.addEventListener('pointerup', finDrag);
  etat.carte.addEventListener('pointercancel', finDrag);
}
function surBulletin(x, y){
  for (const v of [0, 1]){
    const r = buls[v].getBoundingClientRect();
    const marge = 40;
    if (x > r.left - marge && x < r.right + marge && y > r.top - marge && y < r.bottom + marge) return v;
  }
  return null;
}
function mouvDrag(e){
  if (!drag) return;
  const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
  etat.mover.style.transform = `translate(${dx}px,${dy}px) rotate(${Math.max(-9, Math.min(9, dx / 30))}deg) scale(1.03)`;
  /* on juge par le centre de la carte, pas par le curseur */
  const r = etat.carte.getBoundingClientRect();
  const sur = surBulletin(r.left + r.width / 2, r.top + r.height / 2);
  if (sur !== drag.sur){
    drag.sur = sur;
    [0, 1].forEach(v => buls[v].classList.toggle('over', v === sur));
  }
}
function finDrag(e){
  if (!drag) return;
  etat.carte.removeEventListener('pointermove', mouvDrag);
  etat.carte.removeEventListener('pointerup', finDrag);
  etat.carte.removeEventListener('pointercancel', finDrag);
  body.classList.remove('drag');
  const sur = drag.sur;
  drag = null;
  [0, 1].forEach(v => buls[v].classList.remove('over'));
  etat.mover.style.transform = '';
  /* le relâchement produit aussi un clic : on l'ignore, sinon la carte suivante arriverait avant la lecture */
  etat.ignoreClic = true;
  setTimeout(() => { etat.ignoreClic = false; }, 500);
  if (sur !== null) poser(sur === 1);
}

/* ---- la carte est posée : verdict, tampon, chute ---- */
function poser(ditIntox){
  if (etat.resolu) return;
  etat.resolu = true;
  const c = CARTES[etat.i];
  const juste = ditIntox === c.ko;
  etat.reponses[etat.i] = juste;
  body.classList.add('resolu');
  etat.carte.classList.add(c.ko ? 'ko' : 'ok');
  const ditMot = ditIntox ? 'intox' : 'info', etaitMot = c.ko ? 'intox' : 'info';
  verdict.innerHTML = juste
    ? `Vous aviez dit <b class="${ditIntox ? 'r' : 'v'}">${ditMot}</b>. C'était bien ${etaitMot}. <b>Avancez de 10.</b>`
    : `Vous aviez dit <b class="${ditIntox ? 'r' : 'v'}">${ditMot}</b>. C'était <b class="${c.ko ? 'r' : 'v'}">${etaitMot}</b>. À table, vous piochez une Magouille.`;
  if (!juste) setTimeout(piocherMagouille, 900);
}

/* une Magouille vole de la pioche à votre main */
function piocherMagouille(){
  const src = $('mdeck').getBoundingClientRect();
  const k = etat.i;
  dessinerMain();
  const cible = fan.children[k];
  if (!cible) return;
  const dst = cible.getBoundingClientRect();
  const vol = document.createElement('div');
  vol.className = 'm';
  vol.style.cssText = `position:fixed;left:${src.left}px;top:${src.top}px;width:${src.width}px;height:${src.height}px;z-index:25;transition:all .8s cubic-bezier(.2,.8,.2,1);background:url(../v2/assets/dos_magouille.webp) center/cover;border-radius:5px;box-shadow:0 14px 30px rgba(0,0,0,.6);`;
  document.body.appendChild(vol);
  cible.classList.add('vide');
  requestAnimationFrame(() => requestAnimationFrame(() => {
    vol.style.left = dst.left + 'px'; vol.style.top = dst.top + 'px';
    vol.style.width = dst.width + 'px'; vol.style.height = dst.height + 'px';
    vol.style.transform = cible.style.transform;
  }));
  setTimeout(() => { cible.classList.remove('vide'); vol.remove(); }, 850);
}

/* ---- suite : la carte rejoint sa pile, la suivante arrive ---- */
function ranger(){
  const c = CARTES[etat.i];
  const juste = etat.reponses[etat.i];
  const pile = piles[c.ko ? 1 : 0];
  const clone = etat.carte.cloneNode(true);
  clone.classList.add(c.ko ? 'ko' : 'ok');
  if (!juste){ const m = document.createElement('div'); m.className = 'marque-erreur'; clone.appendChild(m); }
  const k = pile.children.length;
  const rot = (k % 2 ? 1 : -1) * (3 + k * 2);
  pile.appendChild(clone);
  /* FLIP : de la position de la carte en jeu à sa place dans la pile */
  const a = etat.carte.getBoundingClientRect(), b = clone.getBoundingClientRect();
  const s = a.width / b.width;
  clone.style.transition = 'none';
  clone.style.transform = `translate(${a.left - b.left}px,${a.top - b.top}px) scale(${s})`;
  clone.style.transformOrigin = '0 0';
  slot.style.visibility = 'hidden';
  requestAnimationFrame(() => requestAnimationFrame(() => {
    clone.style.transition = '';
    clone.style.transform = `translate(${k * 6}px,${-k * 5}px) rotate(${rot}deg)`;
    clone.style.transformOrigin = '';
  }));
  setTimeout(() => {
    slot.style.visibility = '';
    if (etat.i + 1 < CARTES.length) distribuer(); else bilan();
  }, 420);
}

/* ---- le bilan ---- */
function bilan(){
  body.classList.remove('resolu');
  body.classList.add('fin');
  slot.innerHTML = '';
  compteur.textContent = 'Cinq Casseroles tranchées · Prototype 2026';
  const fautes = etat.reponses.filter(r => r === false).length;
  const ph = {
    0: `Cinq sur cinq. Vous lisez la presse judiciaire, ou vous y figurez.`,
    1: `Une erreur sur cinq. La réalité vous a eu une fois. Elle recommencera.`,
    2: `Deux erreurs sur cinq. Comme tout le monde.`,
    3: `Trois erreurs sur cinq. Comme tout le monde, un verre plus tard.`,
    4: `Quatre erreurs sur cinq. Le réel dépasse votre imagination. Il dépasse celle de tout le monde.`,
    5: `Cinq erreurs sur cinq. Vous avez cru tout le faux et douté de tout le vrai. Bienvenue à table.`,
  };
  $('score').innerHTML = fautes === 0
    ? `Main vide<small>aucune Magouille piochée</small>`
    : `${fautes} Magouille${fautes > 1 ? 's' : ''} en main<small>une par erreur</small>`;
  $('phrase').textContent = ph[fautes];
  $('bilan').setAttribute('aria-hidden', 'false');
}

/* ---- fiches d'instruction ---- */
let ficheOuverte = null;
function ouvrirFiche(nom){
  fermerFiche(true);
  const f = $('fiche-' + nom);
  if (!f) return;
  ficheOuverte = f;
  body.classList.add('fiche-ouverte');
  body.dataset.fiche = nom;
  f.classList.add('ouverte');
  f.scrollTop = 0;
}
function fermerFiche(silencieux){
  if (ficheOuverte){ ficheOuverte.classList.remove('ouverte'); ficheOuverte = null; }
  if (!silencieux){ body.classList.remove('fiche-ouverte'); delete body.dataset.fiche; }
}
document.querySelectorAll('[data-fiche]').forEach(b => b.addEventListener('click', () => ouvrirFiche(b.dataset.fiche)));
document.querySelectorAll('[data-fermer]').forEach(b => b.addEventListener('click', () => fermerFiche()));
$('voile').addEventListener('click', () => fermerFiche());

/* ---- commandes ---- */
[0, 1].forEach(v => {
  buls[v].addEventListener('click', () => { if (!body.classList.contains('arrivee')) poser(v === 1); });
  buls[v].addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' '){ e.preventDefault(); poser(v === 1); } });
});
suite.addEventListener('click', ranger);
slot.addEventListener('click', () => { if (etat.resolu && !drag && !etat.ignoreClic) ranger(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') return fermerFiche();
  if (body.classList.contains('fiche-ouverte') || body.classList.contains('fin')) return;
  if (!etat.resolu && e.key === 'ArrowLeft') poser(false);
  else if (!etat.resolu && e.key === 'ArrowRight') poser(true);
  else if (etat.resolu && (e.key === 'Enter' || e.key === ' ')) ranger();
});

/* ---- l'arrivée : la table se dresse, la première carte se retourne ---- */
dessinerMain();
distribuer();
setTimeout(() => body.classList.remove('arrivee'), 80);

/* Vues de contrôle pour la revue : ?etat=resolu | fin | fiche=jeu|auteur|editeurs (sans animation). */
if (params.has('etat') || params.has('fiche')){
  body.classList.remove('arrivee');
  const e = params.get('etat');
  if (e === 'resolu'){ poser(true); }
  if (e === 'fin' || params.has('fiche')){
    etat.reponses = [true, false, true, false, true];
    etat.i = 4;
    dessinerMain();
    [1, 3].forEach(k => {});
    /* piles factices */
    CARTES.forEach((c, k) => { const cl = document.createElement('div'); cl.innerHTML = carteHTML(c, k + 1); const el = cl.firstElementChild; el.classList.add(c.ko ? 'ko' : 'ok'); if (!etat.reponses[k]){ const m = document.createElement('div'); m.className = 'marque-erreur'; el.appendChild(m); } const p = piles[c.ko ? 1 : 0]; const n = p.children.length; el.style.transform = `translate(${n * 6}px,${-n * 5}px) rotate(${(n % 2 ? 1 : -1) * (3 + n * 2)}deg)`; p.appendChild(el); });
    bilan();
  }
  if (params.has('fiche')) ouvrirFiche(params.get('fiche'));
}
