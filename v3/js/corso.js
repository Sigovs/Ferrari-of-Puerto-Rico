/* Corso Pilota — calendar, rails, the off-track accordion, the turns switch.
   Calendar: the CATEGORY dropdown (Ferrari's, js/dropdown.js) filters the
   rows; a row's arrow fills the interest form with that course and venue
   (site.js scrolls there smoothly). Rails (the cars, the slideshow): the
   arrows step the rail — one car, or most of a screen of photographs — and
   the bar shows how far along it is; the mouse drags the rail and the bar
   is a scrubber, both settling on a slide. Accordion: Ferrari's large rows, the
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

    /* the snap points: each slide's leading edge, less the rail's scroll padding */
    var stops = function () {
      var pad = parseFloat(getComputedStyle(rail).scrollPaddingInlineStart) || 0;
      var r0 = rail.getBoundingClientRect().left - rail.scrollLeft + pad;
      var max = rail.scrollWidth - rail.clientWidth;
      return [].map.call(rail.children, function (c) { return Math.min(max, Math.max(0, c.getBoundingClientRect().left - r0)); });
    };
    /* after a drag, settle on the slide nearest where the throw would land */
    var settle = function (aim) {
      var s = stops(), best = s[0] || 0;
      s.forEach(function (x) { if (Math.abs(x - aim) < Math.abs(best - aim)) best = x; });
      rail.scrollTo({ left: best, behavior: still ? 'auto' : 'smooth' });
      var done = function () { rail.classList.remove('is-dragging'); bar.parentNode.classList.remove('is-scrub'); };
      if ('onscrollend' in window && !still) {
        var t = setTimeout(done, 900);
        rail.addEventListener('scrollend', function () { clearTimeout(t); done(); }, { once: true });
      } else done();
    };

    /* 1 · the photographs drag with the mouse as they do under a finger;
       a drag never counts as a click on a photograph */
    var drag = null, moved = false;
    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      drag = { x: e.clientX, left: rail.scrollLeft, lx: e.clientX, lt: e.timeStamp, v: 0 }; moved = false;
    });
    window.addEventListener('pointermove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x;
      if (!moved && Math.abs(dx) > 5) { moved = true; rail.classList.add('is-dragging'); }
      if (!moved) return;
      rail.scrollLeft = drag.left - dx;
      var dt = e.timeStamp - drag.lt;
      if (dt > 0) { drag.v = (e.clientX - drag.lx) / dt; drag.lx = e.clientX; drag.lt = e.timeStamp; }
    });
    window.addEventListener('pointerup', function () {
      if (!drag) return;
      var v = drag.v; drag = null;
      if (!moved) return;
      settle(rail.scrollLeft - v * 220);           /* a quick throw carries on a little */
      setTimeout(function () { moved = false; }, 0);  /* after the drag's own click */
    });
    rail.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);
    rail.addEventListener('dragstart', function (e) { e.preventDefault(); });

    /* 2 · the progress bar is a scrubber: take the dark segment and slide it,
       or press anywhere on the line to bring the segment there */
    var track = bar.parentNode, grab = 0;
    track.addEventListener('pointerdown', function (e) {
      if (e.button !== 0) return;
      var tr = track.getBoundingClientRect(), br = bar.getBoundingClientRect();
      grab = (e.clientX >= br.left && e.clientX <= br.right) ? e.clientX - br.left : br.width / 2;
      track.setPointerCapture(e.pointerId);
      track.classList.add('is-scrub'); rail.classList.add('is-dragging');
      scrub(e, tr, br.width);
      e.preventDefault();
    });
    var scrub = function (e, tr, bw) {
      tr = tr || track.getBoundingClientRect(); bw = bw || bar.getBoundingClientRect().width;
      var room = tr.width - bw;
      var at = room > 0 ? Math.min(1, Math.max(0, (e.clientX - tr.left - grab) / room)) : 0;
      rail.scrollLeft = at * (rail.scrollWidth - rail.clientWidth);
    };
    track.addEventListener('pointermove', function (e) { if (track.hasPointerCapture(e.pointerId)) scrub(e); });
    var release = function (e) {
      if (!track.hasPointerCapture(e.pointerId)) return;
      track.releasePointerCapture(e.pointerId);
      settle(rail.scrollLeft);
    };
    track.addEventListener('pointerup', release);
    track.addEventListener('pointercancel', release);
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
