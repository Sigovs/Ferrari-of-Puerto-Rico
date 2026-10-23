/* Shared by every page: inertia scrolling on desktop, as the retailer
   theme's ScrollSmoother (1.4) — Lenis gives the same feel. */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!window.Lenis || !window.matchMedia('(min-width: 1024px)').matches) return;
  var lenis = window.__lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true });
  var raf = function (t) { lenis.raf(t); requestAnimationFrame(raf); };
  requestAnimationFrame(raf);
})();
