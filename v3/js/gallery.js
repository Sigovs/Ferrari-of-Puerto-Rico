/* Photographs full screen — any [data-lightbox] grid or reel, on an album
   or a blog post. A native <dialog>: Esc closes it and focus returns to the photograph
   that opened it; the arrows and ← → step through the grid. Without this
   file the grid is still the whole set, at its own size. */

(function () {
  'use strict';

  var grids = document.querySelectorAll('[data-lightbox]');
  if (!grids.length || !window.HTMLDialogElement) return;

  var dlg = document.createElement('dialog');
  dlg.className = 'pr-shot';
  dlg.setAttribute('aria-label', 'Photograph');
  dlg.innerHTML =
    '<img class="pr-shot__img" alt="">' +
    '<p class="pr-shot__count" aria-live="polite"></p>' +
    '<button type="button" class="pr-shot__close">Close</button>' +
    '<button type="button" class="pr-shot__prev" aria-label="Previous photograph"><svg aria-hidden="true" style="transform:scaleX(-1)"><use href="#chev"/></svg></button>' +
    '<button type="button" class="pr-shot__next" aria-label="Next photograph"><svg aria-hidden="true"><use href="#chev"/></svg></button>';
  document.body.appendChild(dlg);

  var img = dlg.querySelector('.pr-shot__img');
  var count = dlg.querySelector('.pr-shot__count');
  var list = [], at = 0, opener = null;

  function show(i) {
    at = (i + list.length) % list.length;
    var b = list[at];
    img.src = b.getAttribute('data-full');
    img.alt = b.querySelector('img').alt;
    count.textContent = (at + 1) + ' / ' + list.length;
  }

  [].forEach.call(grids, function (grid) {
    var buttons = [].slice.call(grid.querySelectorAll('.pr-photos__open'));
    buttons.forEach(function (b, i) {
      b.addEventListener('click', function () {
        list = buttons; opener = b;
        show(i);
        dlg.showModal();
      });
    });
  });

  dlg.querySelector('.pr-shot__prev').addEventListener('click', function () { show(at - 1); });
  dlg.querySelector('.pr-shot__next').addEventListener('click', function () { show(at + 1); });
  dlg.querySelector('.pr-shot__close').addEventListener('click', function () { dlg.close(); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(at - 1);
    if (e.key === 'ArrowRight') show(at + 1);
  });
  /* a click on the black around the photograph closes it */
  dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', function () { if (opener) opener.focus(); });
  /* a reel's arrows step it by most of a screen; each hides at its end */
  [].forEach.call(document.querySelectorAll('.pr-reel'), function (reel) {
    var track = reel.querySelector('.pr-reel__track');
    var prev = reel.querySelector('.pr-reel__step--prev'), next = reel.querySelector('.pr-reel__step--next');
    var ends = function () {
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth > track.scrollWidth - 4;
    };
    var step = function (d) { track.scrollBy({ left: d * track.clientWidth * 0.8, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); };
    prev.addEventListener('click', function () { step(-1); });
    next.addEventListener('click', function () { step(1); });
    track.addEventListener('scroll', ends, { passive: true });
    ends();
  });
})();
