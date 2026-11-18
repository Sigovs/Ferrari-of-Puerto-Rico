/* ═══════════════════════════════════════════════════════════════════════
   Ferrari 296 GT Modificata — motion.

   One observer, two states. A frame opens from its centre line and its
   picture settles; a text block slides up a short distance and fades in.
   Each element arrives once and then stays put: nothing moves while it is
   being read, and nothing re-animates on the way back up.

   No library. The stylesheet's finished state is "arrived", so with this
   file blocked, failed or switched off — or with prefers-reduced-motion
   set — the page is the completed composition rather than an empty one.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (still.matches || !('IntersectionObserver' in window)) return;

  document.documentElement.classList.add('js');

  var items = document.querySelectorAll('.reveal, .slide');
  if (!items.length) { document.documentElement.classList.remove('js'); return; }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);           /* arrives once */
    });
  }, {
    /* it starts as it comes over the fold, and has finished by the time it
       is in the reading zone */
    rootMargin: '0px 0px -12% 0px',
    threshold: 0.08
  });

  items.forEach(function (el) { io.observe(el); });

  /* anything already on screen at load is simply there */
  requestAnimationFrame(function () {
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9) { el.classList.add('is-in'); io.unobserve(el); }
    });
  });
})();


/* The arrival's layout, with or without motion: on a wide, short screen
   the words would reach the car's final nose (y 0.42 of the frame), so
   the frame is lifted until 40px stands between them. */
(function () {
  'use strict';
  var section = document.querySelector('.scrub');
  if (!section) return;
  var media = section.querySelector('.scrub__media');
  var type = section.querySelector('.scrub__type');
  var phone = window.matchMedia('(max-width: 60rem)');
  function fit() {
    if (phone.matches) { section.style.removeProperty('--scrub-rise'); return; }
    var w = media.offsetWidth, h = media.offsetHeight;
    var frameH = 907 * Math.max(w / 1600, h / 907);        /* object-fit: cover */
    var rise = Math.max(0, frameH * 0.42 + 40 - type.offsetTop);
    section.style.setProperty('--scrub-rise', Math.round(rise) + 'px');
  }
  window.addEventListener('resize', fit);
  fit();
})();

/* ═══════════════════════════════════════════════════════════════════════
   The arrival. The scroll through chapter 7 picks the frame: 72 stills of
   the one locked-off shot, drawn to a canvas. Paced in the extraction, not
   here — frame i belongs to progress i/71 — so the arrival itself has most
   of the travel. The frames load only as the chapter comes within two
   screens, and until they have, the poster (the last frame) stands.

   On a wide screen the stage is held for 150vh of scroll. On the phone the
   frame is held at the top while the words scroll beneath it, and the
   arrival runs from the moment the frame is half-way up the screen.

   The words come up from below one at a time (Alex, 23 Sep 2026) — the
   marker, the title, each paragraph, the facts — and the scroll drives
   them as it drives the frames, so they can be stopped half-way and run
   back. On a wide screen they have all arrived over the empty floor, by
   a third of the run, before the car does; on the phone each one comes
   up as it reaches the screen.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  var section = document.querySelector('.scrub');
  var canvas = section && section.querySelector('.scrub__canvas');
  if (!canvas || still.matches || !canvas.getContext || !('IntersectionObserver' in window)) return;

  var ctx = canvas.getContext('2d');
  var base = canvas.getAttribute('data-frames');
  var count = +canvas.getAttribute('data-count');
  var frames = new Array(count);
  var phone = window.matchMedia('(max-width: 60rem)');
  var shown = -1, loading = false;
  var lines = section.querySelectorAll('.scrub__type .marker, .scrub__type .h2, .scrub__type .copy > p, .scrub__type .facts');
  var RISE = 32;                                         /* px, from below */

  document.documentElement.classList.add('scrub-on');

  function load() {
    if (loading) return;
    loading = true;
    for (var i = 0; i < count; i++) {
      (function (i) {
        var img = new Image();
        img.decoding = 'async';
        img.onload = function () { frames[i] = img; if (i === want()) draw(); };
        img.src = base + ('00' + i).slice(-3) + '.webp';
      })(i);
    }
  }

  function progress() {
    var r = section.getBoundingClientRect(), vh = window.innerHeight;
    var start = phone.matches ? vh * 0.5 : 0;           /* where the run begins */
    var run = r.height - vh + start;
    return run > 0 ? Math.min(1, Math.max(0, (start - r.top) / run)) : 1;
  }
  function want() { return Math.round(progress() * (count - 1)); }

  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { return 1 - Math.pow(1 - x, 3); }   /* out-cubic */
  function set(el, t) {
    t = ease(t);
    el.style.opacity = t;
    el.style.transform = t < 1 ? 'translateY(' + ((1 - t) * RISE).toFixed(1) + 'px)' : '';
  }
  function words() {
    var vh = window.innerHeight, n = lines.length, i;
    if (phone.matches) {
      /* each line on its own: from the moment it clears the screen's foot
         to a fifth of a screen above it */
      for (i = 0; i < n; i++) set(lines[i], clamp((vh - lines[i].getBoundingClientRect().top) / (vh * 0.2)));
      return;
    }
    /* one shared clock: from the stage half-way up the screen to a third
       of the held run; each line takes 30% of it, a step of 15% apart */
    var r = section.getBoundingClientRect();
    var run = r.height - vh;
    var q = clamp((vh * 0.5 - r.top) / (vh * 0.5 + run / 3));
    for (i = 0; i < n; i++) set(lines[i], clamp((q - i * 0.15) / 0.3));
  }

  function draw() {
    var i = want(), j = i;
    while (j >= 0 && !frames[j]) j--;                   /* nearest loaded, never ahead */
    if (j < 0 || j === shown) return;
    ctx.drawImage(frames[j], 0, 0, canvas.width, canvas.height);
    shown = j;
    section.classList.add('is-playing');
  }

  new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) load();
  }, { rootMargin: '200% 0px' }).observe(section);

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { draw(); words(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', function () { shown = -1; draw(); words(); });
  words();
})();

/* ═══════════════════════════════════════════════════════════════════════
   The specification comes up with the scroll (Alex, 23 Sep 2026). Each
   group label and each row rises 24px and fades in over the fifth of a
   screen after it clears the screen's foot; the right-hand column runs a
   step behind the left. Driven by the scroll, so it can be stopped half-way
   and runs back on the way up. With no script or reduced motion the table
   is simply there.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var items = document.querySelectorAll('.spec__label, .spec__row');
  var spec = document.querySelector('.spec');
  if (!items.length || !spec) return;
  var RISE = 24;
  function clamp(x) { return x < 0 ? 0 : x > 1 ? 1 : x; }
  function ease(x) { return 1 - Math.pow(1 - x, 3); }
  function run() {
    var vh = window.innerHeight, mid = spec.getBoundingClientRect().left + spec.offsetWidth / 2;
    for (var i = 0; i < items.length; i++) {
      var r = items[i].getBoundingClientRect();
      var lag = r.left > mid ? 0.35 : 0;                 /* the right column, a step behind */
      var t = ease(clamp((vh - r.top) / (vh * 0.2) - lag));
      items[i].style.opacity = t;
      items[i].style.transform = t < 1 ? 'translateY(' + ((1 - t) * RISE).toFixed(1) + 'px)' : '';
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { run(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', run);
  run();
})();

/* ═══════════════════════════════════════════════════════════════════════
   Words that come up as you arrive ([data-rise]) — the pinned chapters'
   title, paragraphs and facts (Alex, 23 Sep 2026: "the moment I enter
   that area"). As soon as a line clears the screen's foot it rises 32px
   into place on its own clock, the lines of one block a beat apart; they
   reset only once the block is back below the screen, so it plays on every
   pass down. No script or reduced motion: .rise-on is never set.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var items = document.querySelectorAll('[data-rise]');
  if (!items.length || !('IntersectionObserver' in window)) return;
  /* the beat: each line's place in its own block */
  items.forEach(function (el) {
    var sibs = el.closest('.block__in').querySelectorAll('[data-rise]');
    el.style.setProperty('--rise-i', Array.prototype.indexOf.call(sibs, el));
  });
  document.documentElement.classList.add('rise-on');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) e.target.classList.add('is-up');
      else if (e.boundingClientRect.top > 0) e.target.classList.remove('is-up');
    });
  }, { rootMargin: '0px 0px -6% 0px' });
  items.forEach(function (el) { io.observe(el); });
})();

/* ═══════════════════════════════════════════════════════════════════════
   The box door ([data-door]). The stylesheet runs the lift; this only says
   when: open once a third of the plate is on screen, closed again once the
   plate is wholly below the screen, so it plays on every pass down. No
   script or reduced motion: .door-on is never set and the plate is open.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var doors = document.querySelectorAll('[data-door]');
  /* the lift needs a registered --door (@property); without it, stay open */
  if (!doors.length || !('IntersectionObserver' in window) || !(window.CSS && CSS.registerProperty)) return;
  document.documentElement.classList.add('door-on');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.intersectionRatio >= 0.33) e.target.classList.add('is-open');
      else if (!e.isIntersecting && e.boundingClientRect.top > 0) e.target.classList.remove('is-open');
    });
  }, { threshold: [0, 0.33] });
  doors.forEach(function (d) { io.observe(d); });
})();

/* ═══════════════════════════════════════════════════════════════════════
   The first screen opens itself. The stylesheet holds the picture and the
   words back only while `.js` is set, so with the script blocked or with
   prefers-reduced-motion the first screen is simply there; here it is
   released as soon as the picture has decoded, and in any case within
   1.2s, so a slow image can never leave the screen empty.
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  var hero = document.querySelector('.hero');
  if (!hero) return;
  var img  = hero.querySelector('img');
  var done = false;
  function open() {
    if (done) return; done = true;
    /* two frames: the held state has to be painted once, or the browser
       has nothing to transition from and the screen simply appears */
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { hero.classList.add('is-in'); });
    });
  }
  if (img && typeof img.decode === 'function') { img.decode().then(open, open); }
  else if (img && !img.complete) { img.addEventListener('load', open); img.addEventListener('error', open); }
  else { open(); }
  setTimeout(open, 1200);
})();

/* ═══ chapter 5: the cockpit lifts over the seats ══════════════════════
   While the .swap track passes, --swap runs 0 → 1 with the scroll and
   the stylesheet uncovers the second frame from the foot. The first and
   last tenth of the travel are held, so each frame is seen whole. The
   scroll is the transport: stop and it stops, go back and it closes.
   Phone, reduced motion or no script: .swap-on is never set. */
(function () {
  'use strict';
  var track = document.querySelector('[data-swap]');
  if (!track) return;
  var wide = window.matchMedia('(min-width: 60.0625rem)');
  var still = window.matchMedia('(prefers-reduced-motion: reduce)');
  var frame = track.querySelector('.swap__frame');
  var queued = false;
  function update() {
    queued = false;
    var r = track.getBoundingClientRect();
    var run = r.height - frame.offsetHeight;
    var p = run > 0 ? Math.min(1, Math.max(0, -r.top / run)) : 0;
    /* 130vh of track: the lift runs over the first 100vh, the rest is the hold */
    p = Math.min(1, Math.max(0, (p - 0.05) / 0.72));
    p = p * p * (3 - 2 * p);
    target = p;
    if (!easing) { easing = true; requestAnimationFrame(ease); }
  }
  /* the lift follows the scroll with a little lag, so it settles rather
     than stops dead (Alex, 24 Sep 2026) */
  var target = 0, shown = 0, easing = false;
  function ease() {
    shown += (target - shown) * 0.14;
    if (Math.abs(target - shown) < 0.0005) { shown = target; easing = false; }
    else requestAnimationFrame(ease);
    track.style.setProperty('--swap', shown.toFixed(4));
  }
  function queue() { if (!queued) { queued = true; requestAnimationFrame(update); } }
  function mode() {
    var on = wide.matches && !still.matches;
    document.documentElement.classList.toggle('swap-on', on);
    if (on) { update(); shown = target; track.style.setProperty('--swap', shown.toFixed(4)); } else track.style.removeProperty('--swap');
  }
  window.addEventListener('scroll', queue, { passive: true });
  window.addEventListener('resize', queue);
  (wide.addEventListener ? wide.addEventListener('change', mode) : wide.addListener(mode));
  (still.addEventListener ? still.addEventListener('change', mode) : still.addListener(mode));
  mode();
})();

/* ═══ the hold ═════════════════════════════════════════════════════════
   Where a pinned chapter's words come to rest: their foot on the foot of
   the screen, or — in chapter 8 — on the foot of the picture they stand
   on. The stylesheet makes them sticky there; this only measures. */
(function () {
  'use strict';
  var items = document.querySelectorAll('[data-hold]');
  if (!items.length) return;
  function measure() {
    items.forEach(function (el) {
      var fig = el.parentElement.querySelector('.frame--stage');
      var floor = fig ? Math.min(window.innerHeight, fig.offsetHeight) : window.innerHeight;
      var top = floor - el.offsetHeight;
      /* data-car: where the car ends in the source frame (share of its
         height). Where it is given, the words rest just under the car
         rather than on the foot of the screen (chapter 6, Alex, 24 Sep
         2026) — never lower than the foot allows. */
      var img = fig && fig.querySelector('img[data-car]');
      if (img && img.naturalWidth) {
        var ir = img.getBoundingClientRect(), fr = fig.getBoundingClientRect();
        var sx = ir.width / img.naturalWidth, sy = ir.height / img.naturalHeight;
        var scale = getComputedStyle(img).objectFit === 'contain' ? Math.min(sx, sy) : Math.max(sx, sy);
        var carFoot = ir.top - fr.top + img.naturalHeight * scale * parseFloat(img.getAttribute('data-car'));
        var gap = parseFloat(img.getAttribute('data-car-gap') || '64');
        top = Math.min(top, carFoot + gap);
      }
      top = Math.max(0, Math.round(top));
      el.style.setProperty('--hold-top', top + 'px');
      /* resting above the foot, the words keep the rest of the plate as
         their own margin, so picture and words still leave as one */
      el.style.marginBlockEnd = Math.max(0, (fig ? fig.offsetHeight : floor) - top - el.offsetHeight) + 'px';
    });
  }
  window.addEventListener('resize', measure);
  window.addEventListener('load', measure);
  document.querySelectorAll('.frame--stage img[data-car]').forEach(function (i) { i.addEventListener('load', measure); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure();
})();

/* v3: Register your interest is the form on the page (#interest); smooth
   scrolling is the site's own Lenis (js/site.js). */
