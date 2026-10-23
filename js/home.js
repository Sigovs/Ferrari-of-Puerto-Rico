/* Ferrari of Puerto Rico — home behaviours. Without this file the page
   shows the first model and all three cars, unpinned; nothing here adds
   content. Every behaviour below is the retailer theme's own
   (cauleyferrari.com: home.js, car-models-slider.js), rebuilt without GSAP. */

(function () {
  'use strict';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1 · Pinned sections. The theme's rule: a section taller than the
     screen first scrolls to its own bottom, then holds while the next one
     slides over it. */
  var pinned = [].slice.call(document.querySelectorAll('.pr-pinned'));
  var setPins = function () {
    var vh = window.innerHeight;
    pinned.forEach(function (s) {
      var h = s.offsetHeight;
      s.style.top = (h > vh ? vh - h : 0) + 'px';
    });
  };
  setPins();
  window.addEventListener('resize', setPins);

  /* 2 · The 2025 range — Ferrari of Fort Lauderdale's line-up rail.
     A dot per page of tiles; the arrows move a page; both follow the
     scroll, and the arrows disable at either end. */
  var line = document.querySelector('.pr-lineup__track');
  var dotsEl = document.querySelector('.pr-lineup__dots');
  if (line && dotsEl) {
    var arrows = [].slice.call(document.querySelectorAll('.pr-lineup__arrow'));
    var tileW = function () { var t = line.querySelector('li'); return t ? t.getBoundingClientRect().width + 20 : 430; };
    var perPage = function () { return Math.max(1, Math.floor((line.clientWidth - 2 * parseFloat(getComputedStyle(line).paddingLeft)) / tileW())); };
    var pages = 1;
    var build = function () {
      var n = line.children.length;
      pages = Math.max(1, Math.ceil((n - perPage()) / perPage()) + 1);
      dotsEl.innerHTML = '';
      for (var k = 0; k < pages; k++) {
        var b = document.createElement('button');
        b.type = 'button'; b.setAttribute('aria-label', 'Page ' + (k + 1));
        b.addEventListener('click', (function (p) { return function () { go(p); }; })(k));
        dotsEl.appendChild(b);
      }
      sync();
    };
    var go = function (p) {
      var max = line.scrollWidth - line.clientWidth;
      line.scrollTo({ left: Math.min(max, p * perPage() * tileW()), behavior: still ? 'auto' : 'smooth' });
    };
    var current = function () {
      var max = line.scrollWidth - line.clientWidth;
      if (line.scrollLeft >= max - 2) return pages - 1;
      return Math.min(pages - 1, Math.round(line.scrollLeft / (perPage() * tileW())));
    };
    var sync = function () {
      var c = current(), max = line.scrollWidth - line.clientWidth;
      [].forEach.call(dotsEl.children, function (d, k) { d.setAttribute('aria-current', k === c ? 'true' : 'false'); });
      arrows[0].disabled = line.scrollLeft <= 1;
      arrows[1].disabled = line.scrollLeft >= max - 2;
    };
    arrows.forEach(function (a) {
      a.addEventListener('click', function () { go(Math.max(0, Math.min(pages - 1, current() + Number(a.dataset.step)))); });
    });
    line.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', build);
    build();
  }

  /* 4 · News cards, as ferrari.com/news reveals its cards: the card fades
     in (0.8s), then the title's words rise into place one after another —
     each from 25px down and 4° turned, 0.6s, 70ms apart (measured on
     ferrari.com's f-card-editorial / f-title). */
  window.__prReveal = true;
  var root = document.documentElement;
  [].forEach.call(document.querySelectorAll('[data-reveal-words]'), function (h) {
    var text = h.textContent.trim();
    h.setAttribute('aria-label', text);
    h.innerHTML = text.split(/\s+/).map(function (w, i) {
      return '<span class="rw" aria-hidden="true"><span class="rw__p" style="--rw:' + (150 + i * 70) + 'ms">' +
        w.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span></span>';
    }).join(' ');
  });
  /* the news carousel, at Cauley's settings — built after the titles are
     split, so Swiper's loop clones carry the split words too */
  var newsEl = document.querySelector('.pr-news__swiper');
  if (newsEl && window.Swiper) {
    new window.Swiper(newsEl, {
      loop: true, speed: 300, slidesPerView: 1, spaceBetween: 16,
      autoplay: still ? false : { delay: 3000, disableOnInteraction: false },
      pagination: { el: '.pr-news__dots', clickable: true },
      breakpoints: { 960: { slidesPerView: 2, spaceBetween: 16 }, 1280: { slidesPerView: 3, spaceBetween: 32 } }
    });
  }
  /* the reveal runs once, for the whole row, when the carousel comes in */
  if (root.classList.contains('js-reveal') && newsEl) {
    var seenNews = new IntersectionObserver(function (e) {
      if (!e[0].isIntersecting) return;
      seenNews.disconnect();
      [].forEach.call(document.querySelectorAll('.pr-post'), function (p) { p.classList.add('is-in'); });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.2 });
    seenNews.observe(newsEl);
  }

  /* 3 · Certified pre-owned rail — thecollectionferrari.com's inventory
     slider, at its settings: one car a step, 0.3s, no loop, no autoplay,
     drag with mouse or finger; five dynamic dots, arrows that
     rest at either end. A drag never counts as a click on a card. */
  var cpo = document.querySelector('.pr-cpo__swiper');
  if (cpo && window.Swiper) {
    new window.Swiper(cpo, {
      speed: still ? 0 : 300, loop: false, slidesPerView: 1, spaceBetween: 16,
      grabCursor: true, watchOverflow: true, preventClicks: true, preventClicksPropagation: true,
      noSwipingSelector: 'button, input, select, textarea',
      navigation: { prevEl: '.pr-cpo__prev', nextEl: '.pr-cpo__next' },
      pagination: { el: '.pr-cpo__dots', clickable: true, dynamicBullets: true, dynamicMainBullets: 1 },
      keyboard: { enabled: true, onlyInViewport: true },
      a11y: { prevSlideMessage: 'Previous car', nextSlideMessage: 'Next car' },
      breakpoints: { 768: { slidesPerView: 2, spaceBetween: 24 }, 1280: { slidesPerView: 3, spaceBetween: 32 } }
    });
  }
})();
