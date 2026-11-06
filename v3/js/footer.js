/* The footer's site map folds up where the header goes to its burger, as
   cauleyferrari.com's does. Without this file every link simply stays open.
   Groups open independently: closing one would move the one just tapped. */

(function () {
  'use strict';

  var map = document.querySelector('.pr-footer__map');
  if (!map) return;
  var narrow = window.matchMedia('(max-width: 75rem)');

  var groups = [].slice.call(map.children).map(function (col, i) {
    var head = col.querySelector('.pr-footer__h');
    var list = col.querySelector('ul');
    var label = head.textContent;
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'pr-footer__toggle';
    button.textContent = label;
    list.id = 'footer-group-' + i;
    button.setAttribute('aria-controls', list.id);
    button.addEventListener('click', function () {
      var open = col.classList.toggle('is-open');
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    return { col: col, head: head, button: button, label: label };
  });

  function apply() {
    map.classList.toggle('is-accordion', narrow.matches);
    groups.forEach(function (g) {
      g.col.classList.remove('is-open');
      g.button.setAttribute('aria-expanded', 'false');
      if (narrow.matches) {
        g.head.textContent = '';
        g.head.appendChild(g.button);
      } else {
        g.head.textContent = g.label;
      }
    });
  }

  apply();
  narrow.addEventListener('change', apply);
})();
