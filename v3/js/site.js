/* Shared by every page: inertia scrolling on desktop, as the retailer
   theme's ScrollSmoother (1.4) — Lenis gives the same feel — and every
   in-page anchor (#how, #value, sell-or-consign.html#sold …) reached by a
   smooth scroll, never a jump, landing below the sticky band. Reduced
   motion: the jump, as asked. */
(function () {
  'use strict';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lenis = null;
  if (!still && window.Lenis && window.matchMedia('(min-width: 1024px)').matches) {
    lenis = window.__lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
    var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  /* the band that stays on screen: the navigation band on desktop, the
     Menu bar on a phone — whichever is sticky at this width */
  var band = function () {
    var els = document.querySelectorAll('.header__navigation-section, .header__mobile-section');
    var h = 0;
    [].forEach.call(els, function (el) {
      if (getComputedStyle(el).position === 'sticky' && el.offsetParent !== null) h = Math.max(h, el.getBoundingClientRect().height);
    });
    return h;
  };
  var go = function (el, instant) {
    var y = el.getBoundingClientRect().top + window.scrollY - band() - 24;
    if (lenis && !instant) lenis.scrollTo(y, { duration: 1.2, easing: function (t) { return 1 - Math.pow(1 - t, 3); } });
    else window.scrollTo({ top: Math.max(0, y), behavior: still || instant ? 'auto' : 'smooth' });
  };

  /* shared: other scripts scroll the same way (demo drive: to step 2) */
  window.__prScrollTo = function (el) { go(el, false); };

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    var url = new URL(a.href, location.href);
    if (url.pathname !== location.pathname || !url.hash || url.hash === '#') return;
    var el = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!el) return;
    e.preventDefault();
    go(el, false);
    history.pushState(null, '', url.hash);
  });

  /* arriving from another page with a hash: land below the band too */
  if (location.hash.length > 1) {
    var el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (el) window.addEventListener('load', function () { setTimeout(function () { go(el, true); }, 0); });
  }
})();
