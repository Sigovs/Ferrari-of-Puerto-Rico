/* Ferrari's chapter navigation (ferrari.com experience pages): a column of
   dots fixed at the lower left, one per [data-chapter] section; the current
   chapter is a ring; any dot shows its name on hover or focus (the names
   stay hidden otherwise, so they never sit on the copy); the arrow below goes back to the
   top. Clicks run through site.js's smooth anchors. Built here, so without
   script there is nothing to show; shown from 80rem, past the first screen. */
(function () {
  'use strict';
  var secs = [].slice.call(document.querySelectorAll('[data-chapter][id]'));
  if (secs.length < 3) return;

  var nav = document.createElement('nav');
  nav.className = 'pr-chapnav';
  nav.setAttribute('aria-label', 'Page chapters');
  var html = '<ol class="pr-chapnav__list">';
  secs.forEach(function (s) {
    html += '<li><a class="pr-chapnav__dot" href="#' + s.id + '"><span class="pr-chapnav__label">' + s.getAttribute('data-chapter') + '</span></a></li>';
  });
  html += '</ol><a class="pr-chapnav__top" href="#main" aria-label="Back to the top"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 10.5 8 5.5l5 5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg></a>';
  nav.innerHTML = html;
  document.body.appendChild(nav);

  var dots = [].slice.call(nav.querySelectorAll('.pr-chapnav__dot'));
  var cur = -1;

  function set(i) {
    if (i === cur) return;
    cur = i;
    dots.forEach(function (d, k) {
      var on = k === i;
      d.classList.toggle('is-current', on);
      if (on) d.setAttribute('aria-current', 'location'); else d.removeAttribute('aria-current');
    });
  }

  var ticking = false;
  function update() {
    ticking = false;
    var mid = window.innerHeight * 0.5, at = -1;
    secs.forEach(function (s, k) { if (s.getBoundingClientRect().top <= mid) at = k; });
    var first = secs[0].getBoundingClientRect().top;
    var last = secs[secs.length - 1].getBoundingClientRect().bottom;
    var show = first < window.innerHeight * 0.75 && last > window.innerHeight * 0.4;
    nav.classList.toggle('is-shown', show);
    set(show ? at : -1);
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();
