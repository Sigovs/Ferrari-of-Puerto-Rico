/* Ferrari's tabs (f-tab): the current tab in red over a 2px bar that slides
   to it (transform and width .3s); one panel at a time. ← → Home End move
   between tabs (ARIA tabs pattern). Without script every panel shows. */
(function () {
  'use strict';
  [].forEach.call(document.querySelectorAll('[data-tabs]'), function (root) {
    var tabs = [].slice.call(root.querySelectorAll('[role=tab]'));
    var panels = tabs.map(function (t) { return document.getElementById(t.getAttribute('aria-controls')); });
    var bar = root.querySelector('.pr-tabs__bar');
    root.classList.add('is-ready');
    var place = function (t) {
      if (!bar) return;
      bar.style.width = t.offsetWidth + 'px';
      bar.style.transform = 'translateX(' + t.offsetLeft + 'px)';
    };
    var select = function (i, focus) {
      tabs.forEach(function (t, k) {
        var on = k === i;
        t.classList.toggle('is-current', on);
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        panels[k].hidden = !on;
      });
      place(tabs[i]);
      if (focus) tabs[i].focus();
    };
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(i, false); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') n = 0;
        if (e.key === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); select(n, true); }
      });
    });
    var cur = Math.max(0, tabs.findIndex(function (t) { return t.getAttribute('aria-selected') === 'true'; }));
    select(cur, false);
    var replace = function () { place(tabs[cur = tabs.findIndex(function (t) { return t.classList.contains('is-current'); })]); };
    window.addEventListener('resize', replace);
    /* the labels change width when the face arrives: measure again then */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(replace);
    window.addEventListener('load', replace);
  });
})();
