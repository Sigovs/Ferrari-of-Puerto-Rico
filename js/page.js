/* Two behaviours only. Everything else on this page is static by decision:
   the composition has to hold as a screenshot, so nothing here creates
   meaning that is absent without it. */

(function () {
  'use strict';

  /* 0 · The stuck band.
     The navigation band is sticky; its cover value (.6 black) is unreadable
     over the page, so it changes once the top bar is out of view. CSS does
     the sticking — this only says when it has happened. */
  var head = document.getElementById('masthead');
  var topBar = head && head.querySelector('.header__top-bar');
  if (head && topBar && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      head.classList.toggle('is-stuck', !entries[0].isIntersecting);
    }).observe(topBar);
  }

  /* 1 · The mobile menu.
     The only thing the bar needs is the panel behind its Menu button.
     Nothing below 64rem can reach the nav without it. */
  var burger = document.getElementById('burger');
  var panel = document.getElementById('mobile-menu');
  if (burger && panel) {
    var setOpen = function (open) {
      panel.hidden = !open;
      document.body.classList.toggle('menu-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.textContent = open ? 'Close' : 'Menu';
    };
    burger.addEventListener('click', function () { setOpen(panel.hidden); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) setOpen(false); });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1024 && !panel.hidden) setOpen(false);
    });
  }

  /* 2 · The campaign films.
     `autoplay muted playsinline` is the contract, but a browser is still
     entitled to refuse it, so nudge each one and let the poster stand if the
     nudge is declined — the poster is a frame of the same film, so a refusal
     costs nothing. Under `prefers-reduced-motion: reduce` nothing plays at
     all: the still is the page. */
  var films = [].slice.call(document.querySelectorAll('video[autoplay]'));
  if (films.length) {
    var still = window.matchMedia('(prefers-reduced-motion: reduce)');
    var settle = function () {
      films.forEach(function (v) {
        if (still.matches) { v.pause(); v.removeAttribute('autoplay'); return; }
        var p = v.play();
        if (p && p.catch) p.catch(function () { /* poster stands */ });
      });
    };
    settle();
    if (still.addEventListener) still.addEventListener('change', settle);
  }

  /* 3 · The inquiry form has no endpoint yet. It says so on the page and it
     says so again here, rather than pretending to have sent anything. */
  var form = document.getElementById('inquiry-form');
  var status = document.getElementById('form-status');
  if (form && status) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent =
        'Not sent — this form is a sample. Connect it to the retailer inquiry endpoint before launch.';
    });
  }
})();
