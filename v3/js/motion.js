/* The home page's two motions, on the inner pages (Alex, 18 Nov 2026: "move
   what the site already has onto every inner page, invent nothing"):
   1 · pinned chapters (home.js § 1, the retailer's rule): a full-image
       chapter holds while the next section slides over it; one taller than
       the screen first scrolls to its own bottom.
   2 · rising titles (home.js § 4, ferrari.com's f-title): a chapter title's
       words rise into place one after another — 25px down, 4° turned, 0.6s,
       70ms apart — once, as it comes in. The copy under it never moves.
   Armed only under js-reveal (set in the head; never under reduced motion,
   stood down at 3s if this file does not arrive). The hero, forms,
   calendars and tables stay still. */
(function () {
  'use strict';
  var root = document.documentElement;
  if (!root.classList.contains('js-reveal')) return;
  window.__prReveal = true;
  var main = document.getElementById('main');
  if (!main) return;
  root.classList.add('pr-mo');

  /* 1 · pinned full-image chapters */
  var pins = [].slice.call(main.querySelectorAll(':scope > .pr-full, :scope > .pr-open, :scope > .pr-feature--band, :scope > .pr-chal__full'));
  pins.forEach(function (p) { p.classList.add('pr-pinned'); });
  var setPins = function () {
    var vh = window.innerHeight;
    pins.forEach(function (s) {
      var h = s.offsetHeight;
      s.style.top = (h > vh ? vh - h : 0) + 'px';
    });
  };
  setPins();
  window.addEventListener('resize', setPins);
  window.addEventListener('load', setPins);

  /* 2 · rising titles: plain-text chapter titles outside the hero */
  var heads = [].slice.call(main.querySelectorAll('h2, .pr-ed__title, .pr-focus__title')).filter(function (h) {
    return !h.closest('.fa-hero') && !h.classList.contains('sr-only') && !h.children.length && h.textContent.trim();
  });
  heads.forEach(function (h) {
    var text = h.textContent.trim().replace(/\s+/g, ' ');
    h.setAttribute('aria-label', text);
    h.innerHTML = text.split(' ').map(function (w, i) {
      return '<span class="rw" aria-hidden="true"><span class="rw__p" style="--rw:' + (150 + Math.min(i, 10) * 70) + 'ms">' +
        w.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span></span>';
    }).join(' ');
    h.classList.add('pr-rise');
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2 });
  heads.forEach(function (h) { io.observe(h); });
})();
