/* Corso Pilota — calendar, rails, the off-track accordion, the turns switch.
   Calendar: the CATEGORY dropdown (Ferrari's, js/dropdown.js) filters the
   rows; a row's arrow fills the interest form with that course and venue
   (site.js scrolls there smoothly). Rails (the cars, the slideshow): the
   arrows step the rail — one car, or most of a screen of photographs — and
   the bar shows how far along it is. Accordion: Ferrari's large rows, the
   text opening in place (all open without script). Switch: the turns layer
   of the Fiorano map. */
(function () {
  'use strict';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var cat = document.getElementById('cal-cat');
  var rows = [].slice.call(document.querySelectorAll('.pr-cal__row'));
  var empty = document.querySelector('.pr-cal__empty');
  if (cat) cat.addEventListener('change', function () {
    var n = 0;
    rows.forEach(function (r) { var on = cat.value === 'all' || r.dataset.course === cat.value; r.hidden = !on; if (on) n++; });
    if (empty) empty.hidden = n > 0;
  });

  var setSel = function (id, v) {
    var s = document.getElementById(id);
    if (!s || !v) return;
    if ([].some.call(s.options, function (o) { return o.value === v || o.text === v; })) {
      s.value = v; s.classList.remove('is-invalid'); s.dispatchEvent(new Event('change'));
    }
  };
  [].forEach.call(document.querySelectorAll('.pr-cal__go'), function (a) {
    a.addEventListener('click', function () { setSel('ci-course', a.dataset.course); setSel('ci-venue', a.dataset.venue); });
  });

  [].forEach.call(document.querySelectorAll('.pr-rail, .pr-show__rail'), function (rail) {
    var box = rail.closest('section');
    var prev = box.querySelector('.pr-show__step[data-step="-1"]');
    var next = box.querySelector('.pr-show__step[data-step="1"]');
    var bar = box.querySelector('.pr-show__bar span');
    if (!prev || !next || !bar) return;
    var whole = rail.hasAttribute('data-rail');
    var upd = function () {
      var max = rail.scrollWidth - rail.clientWidth;
      var at = max > 0 ? rail.scrollLeft / max : 0;
      prev.disabled = rail.scrollLeft < 4;
      next.disabled = rail.scrollLeft > max - 4;
      var share = Math.min(1, rail.clientWidth / rail.scrollWidth);
      bar.style.width = (share * 100) + '%';
      bar.style.transform = 'translateX(' + (at * (1 / share - 1) * 100) + '%)';
    };
    [prev, next].forEach(function (b) {
      b.addEventListener('click', function () {
        var how = still ? 'auto' : 'smooth';
        if (whole) {   /* one car: aim at the next slide's own edge, not a distance */
          var w = rail.clientWidth, i = Math.round(rail.scrollLeft / w) + +b.dataset.step;
          rail.scrollTo({ left: Math.max(0, i) * w, behavior: how });
        } else rail.scrollBy({ left: +b.dataset.step * rail.clientWidth * 0.8, behavior: how });
      });
    });
    rail.addEventListener('scroll', upd, { passive: true });
    window.addEventListener('resize', upd);
    upd();
  });

  [].forEach.call(document.querySelectorAll('.pr-acc__btn'), function (b) {
    var panel = document.getElementById(b.getAttribute('aria-controls'));
    if (!panel) return;
    var set = function (open) {
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.classList.toggle('is-open', open);
      panel.inert = !open;
    };
    set(false);
    b.addEventListener('click', function () { set(b.getAttribute('aria-expanded') !== 'true'); });
  });
  var acc = document.querySelector('.pr-acc');
  if (acc) acc.classList.add('is-ready');

  var sw = document.querySelector('.pr-switch');
  var turns = document.querySelector('.pr-circuit__turns');
  if (sw && turns) sw.addEventListener('click', function () {
    var on = sw.getAttribute('aria-checked') !== 'true';
    sw.setAttribute('aria-checked', on ? 'true' : 'false');
    turns.classList.toggle('is-off', !on);
  });
})();
