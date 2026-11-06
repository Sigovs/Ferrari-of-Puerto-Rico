/* The page's one behaviour. Without this file every word is on the page —
   nothing here adds content. */

(function () {
  'use strict';

  /* 1 · Read more.
     The markup ships open, so without script the extra copy is simply there.
     Script closes it and hands the visitor the button. The panel opens below
     the button, so nothing above the pointer moves.

     The motion is Ferrari's own, measured on their page: the panel's height
     runs 0 → full in ~400ms on an ease-out (40% open at 115ms, 79% at
     220ms), the same back; the copy inside does not fade or travel. CSS
     carries the curve (.fa-chapter__more); this only sets the heights. */
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');

  [].forEach.call(document.querySelectorAll('.fa-more'), function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    var label = btn.querySelector('.fa-more__label');
    if (!panel) return;

    var finish = function () {
      if (btn.getAttribute('aria-expanded') !== 'true') panel.hidden = true;
      panel.style.height = '';
      panel.classList.remove('is-moving');
    };
    panel.addEventListener('transitionend', function (e) {
      if (e.target === panel && e.propertyName === 'height') finish();
    });

    var set = function (open, animate) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (label) label.textContent = open ? 'Close' : 'Read more';

      if (!animate || still.matches) {
        panel.hidden = !open;
        panel.style.height = '';
        return;
      }
      panel.classList.add('is-moving');
      if (open) {
        panel.hidden = false;
        panel.style.height = '0px';
        panel.offsetHeight;                       // commit the start
        panel.style.height = panel.scrollHeight + 'px';
      } else {
        panel.style.height = panel.offsetHeight + 'px';
        panel.offsetHeight;
        panel.style.height = '0px';
      }
    };

    set(false, false);
    btn.addEventListener('click', function () {
      set(btn.getAttribute('aria-expanded') !== 'true', true);
    });
  });

  /* 2 · The program tiles arrive one by one.
     Tiles that enter together (a row) are staggered 140 ms by their order;
     each is revealed once and then left alone. */
  window.__prReveal = true;
  var root = document.documentElement;
  var tiles = [].slice.call(document.querySelectorAll('.fa-tile'));
  if (root.classList.contains('js-reveal') && tiles.length) {
    var io = new IntersectionObserver(function (entries) {
      var batch = entries.filter(function (e) { return e.isIntersecting; })
        .sort(function (a, b) { return tiles.indexOf(a.target) - tiles.indexOf(b.target); });
      batch.forEach(function (e, i) {
        e.target.style.setProperty('--fa-d', (i * 140) + 'ms');
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });
    tiles.forEach(function (t) { io.observe(t); });
  }

})();
