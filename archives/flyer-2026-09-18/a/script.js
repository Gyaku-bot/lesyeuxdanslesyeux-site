// Direction A · « L'antenne, 20 h » · progressive enhancement : sans JS, tout est visible à l'état final.
document.documentElement.classList.add('js');
(function () {
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
    });
  }, { threshold: 0.18 }) : null;
  var cibles = document.querySelectorAll('.reveal, .fan');
  if (!io) { cibles.forEach(function (el) { el.classList.add('on'); }); return; }
  cibles.forEach(function (el) { io.observe(el); });
  // sécurité : après 2,5 s tout ce qui n'est pas passé devant l'observer est rendu visible (captures, lecteurs d'écran)
  setTimeout(function () { cibles.forEach(function (el) { el.classList.add('on'); }); }, 2500);
})();
