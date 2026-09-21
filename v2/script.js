/* LES YEUX DANS LES YEUX · accueil V2 · moteur des cinq Casseroles.
   Les textes des cartes sont ceux imprimés (corpus/lots_cales), verdict caché jusqu'au vote. Pas de score conservé, pas de
   rejouabilité : une révélation, pas une démo (brief § 16). */
const EYE = '<svg viewBox="0 0 120 70" fill="none" stroke="currentColor" stroke-width="5" aria-hidden="true"><path d="M8 38 Q60 -6 112 38 Q60 80 8 38 Z"/><circle cx="60" cy="38" r="15"/><circle cx="60" cy="38" r="5.5" fill="currentColor" stroke="none"/></svg>';
const CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 9l8 8 8-8"/></svg>';

/* CARTES : remplies depuis assets/RAPPORT_MATIERE.md (5 Casseroles choisies le 19/09). ko = INTOX. */
const CARTES = window.CARTES_DATA || [];

const wrap = document.getElementById('cartes');
const etat = { reponses: [] };

function hl(txt){ return txt.replace(/\[\[(.+?)\]\]/g, '<span class="hl">$1</span>'); }
function esc(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;'); }

function tuile(c, i){
  const n = i + 1;
  const mot = c.ko ? 'INTOX' : 'INFO';
  const chute = c.chute.trim().startsWith('«') ? esc(c.chute) : `<q>«</q> ${esc(c.chute)} <q>»</q>`;
  const sec = document.createElement('section');
  sec.className = 'cass papier';
  sec.id = `c${n}`;
  sec.innerHTML = `
    <div class="num"><span>Casserole ${n} sur ${CARTES.length}</span><span>Cote ${esc(c.cote)}</span></div>
    <div class="scene">
      <article class="carte" aria-label="Casserole ${n}">
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
      </article>
      <div class="vote">
        <div class="consigne">Posez votre bulletin</div>
        <div class="bulletins">
          <button class="bulletin info" data-v="0" aria-label="Voter Info"><span class="p">Bulletin</span>Info</button>
          <button class="bulletin intox" data-v="1" aria-label="Voter Intox"><span class="p">Bulletin</span>Intox</button>
        </div>
        <div class="verdict" aria-live="polite"></div>
        <a class="suite" href="#${n < CARTES.length ? 'c' + (n + 1) : 'promesse'}">${n < CARTES.length ? 'Casserole suivante' : 'Le bilan'} ${CHEV}</a>
      </div>
    </div>`;
  const vote = sec.querySelector('.vote');
  const carte = sec.querySelector('.carte');
  const verdict = sec.querySelector('.verdict');
  sec.querySelectorAll('.bulletin').forEach(b => b.addEventListener('click', () => {
    if (vote.classList.contains('fait')) return;
    const dit = b.dataset.v === '1';
    b.classList.add('choisi');
    vote.classList.add('fait');
    carte.classList.add(c.ko ? 'ko' : 'ok');
    const juste = dit === c.ko;
    etat.reponses[i] = juste;
    const ditMot = dit ? 'intox' : 'info', etaitMot = c.ko ? 'intox' : 'info';
    verdict.innerHTML = juste
      ? `Vous aviez dit <b class="${dit ? 'r' : 'v'}">${ditMot}</b>. C'était bien ${etaitMot}. <b>Avancez de 10.</b>`
      : `Vous aviez dit <b class="${dit ? 'r' : 'v'}">${ditMot}</b>. C'était <b class="${c.ko ? 'r' : 'v'}">${etaitMot}</b>. À table, vous piochez une Magouille.`;
    majBilan();
  }));
  return sec;
}

function majBilan(){
  const total = CARTES.length;
  const rep = etat.reponses.filter(r => r !== undefined);
  const fautes = rep.filter(r => !r).length;
  const score = document.getElementById('score');
  const texte = document.getElementById('bilan-texte');
  if (!score || !texte) return;
  if (rep.length < total){
    score.innerHTML = `${rep.length}<span style="opacity:.5">/${total}</span><small>cartes tranchées</small>`;
    texte.innerHTML = `<p>Vous n'avez pas tout tranché. À table, ça ne passe pas : le Porte-parole attend, les yeux dans les yeux.</p>`;
    return;
  }
  score.innerHTML = `${fautes}<span style="opacity:.5">/${total}</span><small>${fautes > 1 ? 'erreurs' : 'erreur'}</small>`;
  const ph = {
    0: `Cinq sur cinq. Vous lisez la presse judiciaire, ou vous y figurez.`,
    1: `Une erreur sur cinq. La réalité vous a eu une fois. Elle recommencera.`,
    2: `Deux erreurs sur cinq. Comme tout le monde.`,
    3: `Trois erreurs sur cinq. Le réel a gagné, de peu.`,
    4: `Quatre erreurs sur cinq. Le réel dépasse votre imagination. Il dépasse celle de tout le monde.`,
    5: `Cinq erreurs sur cinq. Vous avez cru tout le faux et douté de tout le vrai. Bienvenue à table.`,
  };
  texte.innerHTML = `<p>${ph[fautes]}</p><p>Il en reste quatre-vingt-quinze dans la boîte. Chacune est vraie, ou déformée. Chacune est cotée au Registre des scellés.</p>`;
}

CARTES.forEach((c, i) => wrap.appendChild(tuile(c, i)));
majBilan();

/* apparitions au scroll, sobres */
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) e.target.classList.add('vu'); }), { threshold: .18 });
document.querySelectorAll('.in').forEach(el => io.observe(el));
