/* Direction B · La carte grandeur nature, jouable.
   Textes des cartes recopiés MOT POUR MOT depuis corpus/lots_cales/lot_*.md ({…} = partie piégée, rendue en rouge gras). */
(function () {
  'use strict';

  var CARTES = [
    { cote: 'DP-08/07', manchette: 'G20 de Cannes · 2011', verdict: 'INFO', page: 22,
      fait: 'Un micro resté ouvert a capté Nicolas Sarkozy confiant à Barack Obama, à propos de Netanyahou : {« Je ne peux plus le voir, c\'est un menteur. »}',
      revelation: 'Réponse d\'Obama : « Tu en as marre de lui, mais moi, je dois traiter avec lui tous les jours ! »',
      chute: 'Un micro ouvert : la seule chose honnête autour de la table.' },
    { cote: 'DP-08/01', manchette: 'Tombouctou · 2013', verdict: 'INTOX', page: 21,
      fait: 'Le dromadaire offert à François Hollande par la ville de Tombouctou {vit toujours} au parc zoologique de Vincennes.',
      revelation: 'Probablement mangé par la famille à qui on l\'avait confié, selon le ministère de la Défense. Le Mali a promis un « plus gros et plus beau ».',
      chute: 'Le deuxième prénom du dromadaire ? Plat du jour.' },
    { cote: 'DA-01/01', manchette: 'L\'écotaxe · 2014', verdict: 'INFO', page: 3,
      fait: 'L\'État a versé {957 M€} d\'indemnités pour 174 portiques écotaxe qui n\'ont jamais scanné un seul camion.',
      revelation: 'Dont 652 M€ d\'équipements, portiques, bornes et 718 000 boîtiers. Jamais mis en service.',
      chute: 'Construit par un privé, payé par l\'État, détruit par l\'État. Le circuit court.' },
    { cote: 'AP-05/11', manchette: 'L\'Élysée · révélé en 2016', verdict: 'INTOX', page: 15,
      fait: 'De 2012 à 2017, le coiffeur personnel de François Hollande était payé {4 900 €} brut par mois.',
      revelation: '9 895 €, soit 593 700 € sur le quinquennat, pour le recoiffer chaque matin et à chaque prise de parole, week-ends compris.',
      chute: 'Un salaire de ministre pour recoiffer François Hollande. La nation avait manifestement besoin de volume.' },
    { cote: 'DP-08/05', manchette: 'Stade de France · 2019', verdict: 'INFO', page: 22,
      fait: 'Avant un France-Albanie, la sono a joué {l\'hymne d\'Andorre}, puis le speaker s\'est excusé auprès des supporters... de l\'Arménie.',
      revelation: 'Trois jours plus tard, l\'Andorre jouait au Stade de France : ses officiels sont venus vérifier l\'hymne à la répétition.',
      chute: 'On peut se tromper d\'hymne une fois. On peut se tromper de pays mille fois. Mais on ne peut pas… Putain, c\'était l\'Albanie ou l\'Arménie ? Bref, bon match à l\'Andorre.' },
    { cote: 'DP-08/06', manchette: 'Hôtel de Marigny · 2007', verdict: 'INTOX', page: 22,
      fait: 'La tente bédouine dressée par Mouammar Kadhafi face à l\'Élysée est restée plantée {douze jours}.',
      revelation: 'Cinq jours, la durée de la visite d\'État. Dix-huit ans plus tard, Nicolas Sarkozy a pris cinq ans pour association de malfaiteurs, en première instance, et il a fait appel.',
      chute: 'Cinq jours de camping pour Kadhafi, cinq ans pour son hôte. Chacun son hébergement d\'État.' },
    { cote: 'EF-04/02', manchette: 'Ministère du Budget · 2012', verdict: 'INFO', page: 10,
      fait: 'On nomme ministre chargé de la lutte contre la fraude fiscale un homme qui détient depuis vingt ans {un compte caché à l\'étranger}.',
      revelation: 'Jérôme Cahuzac, plus de 600 000 € à l\'UBS puis à Singapour, niés devant l\'Assemblée avant d\'être avoués.',
      chute: 'Les yeux dans les yeux.' },
    { cote: 'AP-05/03', manchette: 'Hôtel de Lassay · 2017-2018', verdict: 'INTOX', page: 13,
      fait: 'Président de l\'Assemblée nationale, François de Rugy a organisé {quatre dîners} privés aux frais de l\'institution : homards et grands crus, dix à trente convives.',
      revelation: 'Douze dîners, dont trois jugés d\'un niveau manifestement excessif par l\'Assemblée.',
      chute: 'Les neuf autres homards étaient donc en mission de service public.' },
    { cote: 'FE-02/01', manchette: 'Perpignan · municipales 2008', verdict: 'INFO', page: 5,
      fait: 'Chargé de garantir la sincérité du dépouillement, le président du bureau n° 4 est surpris en train de {planquer des bulletins dans ses chaussettes} pour faire gagner son camp.',
      revelation: 'Georges Garcia, frère d\'une colistière du maire sortant : son bureau pesait 825 voix, et l\'élection s\'est jouée à 574.',
      chute: 'Le scrutin puait la fraude. Et un peu des pieds.' },
    { cote: 'CE-09/03', manchette: 'Compte de campagne 2022', verdict: 'INTOX', page: 24,
      fait: 'Le compte de campagne d\'Emmanuel Macron porte une facture de {500 €} pour surveiller les pages Wikipédia du candidat, de son épouse et du secrétaire général de l\'Élysée.',
      revelation: '5 000 €, versés à une société espagnole, pour une surveillance sans aucune intervention sur les articles.',
      chute: '5 000 € pour surveiller trois pages gratuites. La start-up nation venait d\'ubériser le bouton « actualiser ».' }
  ];

  var idx = 0, bonnes = 0, jouees = 0;
  var $ = function (s) { return document.querySelector(s); };
  var carte = $('#carte'), scene = $('#scene');

  function esc(t) {
    return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function fait(t) {
    return esc(t).replace(/\{([^}]+)\}/g, '<b class="piege">$1</b>');
  }

  function rendre(c) {
    $('#cote').textContent = 'Cote ' + c.cote;
    $('#manchette').textContent = c.manchette;
    $('#fait').innerHTML = fait(c.fait);
    $('#page').textContent = 'Registre des scellés, p. ' + c.page;
    $('#cote-verso').textContent = 'Cote ' + c.cote;
    $('#manchette-verso').textContent = c.manchette;
    $('#fait-verso').innerHTML = fait(c.fait);
    $('#page-verso').textContent = 'Registre des scellés, p. ' + c.page;
    var tampon = $('#tampon');
    tampon.textContent = c.verdict;
    tampon.className = 'tampon-verdict ' + (c.verdict === 'INFO' ? 'ok' : 'ko');
    $('#revelation').textContent = c.revelation;
    $('#chute').textContent = c.chute;
    $('#numero').textContent = 'Casserole ' + (idx + 1) + ' / ' + CARTES.length;
    carte.classList.remove('retournee');
    $('#suite').hidden = true;
    $('#resultat').hidden = true;
    $('#vote-info').disabled = false;
    $('#vote-intox').disabled = false;
    scene.setAttribute('aria-busy', 'false');
  }

  function voter(choix) {
    var c = CARTES[idx];
    var juste = (choix === c.verdict);
    jouees += 1;
    if (juste) bonnes += 1;
    $('#vote-info').disabled = true;
    $('#vote-intox').disabled = true;
    var r = $('#resultat');
    r.textContent = juste ? 'Vous aviez raison. +10 %.' : 'Vous vous êtes fait avoir. Une Magouille pour vous.';
    r.className = 'resultat ' + (juste ? 'ok' : 'ko');
    r.hidden = false;
    $('#score').textContent = bonnes + ' / ' + jouees;
    var pct = Math.min(50, bonnes * 10);
    $('#jauge').style.width = (pct * 2) + '%';
    $('#jauge-label').textContent = pct + ' %';
    carte.classList.add('retournee');
    $('#suite').hidden = false;
    if (idx === CARTES.length - 1) {
      $('#suivante').textContent = 'Rejouer';
    }
    $('#suivante').focus();
  }

  $('#vote-info').addEventListener('click', function () { voter('INFO'); });
  $('#vote-intox').addEventListener('click', function () { voter('INTOX'); });
  $('#suivante').addEventListener('click', function () {
    if (idx === CARTES.length - 1) {
      idx = 0; bonnes = 0; jouees = 0;
      $('#score').textContent = '0 / 0';
      $('#jauge').style.width = '0%';
      $('#jauge-label').textContent = '0 %';
      $('#suivante').textContent = 'Casserole suivante';
    } else {
      idx += 1;
    }
    rendre(CARTES[idx]);
    scene.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  rendre(CARTES[0]);
})();
