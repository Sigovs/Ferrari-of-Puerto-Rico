/* Inventory behaviours — the card, the SRP, the VDP. Without this file
   every car, every photo link, every description and every record is on
   the page; the filters simply show all, the tabs simply stack. */

(function () {
  'use strict';
  var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* 1 · The card's photographs, as ferrarifl.com's SRP cards step through
     them in place: arrows and a "1 of N" count. */
  $$('.pr-car__media[data-photos]').forEach(function (m) {
    var list = m.dataset.photos.split(' '), img = m.querySelector('.pr-car__photo img');
    var count = m.querySelector('.pr-car__count span'), i = 0;
    $$('.pr-car__step button', m).forEach(function (b) {
      b.addEventListener('click', function () {
        i = (i + Number(b.dataset.step) + list.length) % list.length;
        img.src = list[i];
        if (count) count.textContent = i + 1;
      });
    });
  });

  /* 2 · Save — the retailer's pin. Kept in this browser only. */
  var KEY = 'pr-saved', saved = [];
  try { saved = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { saved = []; }
  var paint = function () {
    $$('[data-save]').forEach(function (b) { b.setAttribute('aria-pressed', saved.indexOf(b.dataset.save) > -1 ? 'true' : 'false'); });
  };
  $$('[data-save]').forEach(function (b) {
    b.addEventListener('click', function () {
      var k = saved.indexOf(b.dataset.save);
      if (k > -1) saved.splice(k, 1); else saved.push(b.dataset.save);
      try { localStorage.setItem(KEY, JSON.stringify(saved)); } catch (e) { /* private window */ }
      paint();
    });
  });
  paint();

  /* 3 · SRP — filters (any of a group, all groups together), free-text
     search, sort, grid / list, the active filters as chips. */
  var grid = document.querySelector('.pr-srp__grid');
  if (grid) {
    var cards = $$('.pr-car', grid);
    var boxes = $$('.pr-filters input[type=checkbox]');
    var search = document.querySelector('.pr-search input');
    var sort = document.querySelector('.pr-order__select');
    var chips = document.querySelector('.pr-chips');
    var countEl = document.querySelector('[data-count]');
    var empty = document.querySelector('.pr-empty');
    var KEYS = { model: 'model', year: 'year', prog: 'prog', ext: 'ext', int: 'int' };

    var apply = function () {
      var want = {};
      boxes.forEach(function (b) { if (b.checked) (want[b.name] = want[b.name] || []).push(b.value); });
      var q = (search.value || '').trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (c) {
        var ok = Object.keys(want).every(function (k) { return want[k].indexOf(c.dataset[KEYS[k]]) > -1; });
        if (ok && q) ok = q.split(/\s+/).every(function (w) { return c.dataset.text.indexOf(w) > -1; });
        c.hidden = !ok;
        if (ok) shown++;
      });
      countEl.textContent = shown;
      empty.hidden = shown > 0;
      /* chips: one per ticked value, and the search */
      chips.innerHTML = '';
      var any = false;
      boxes.forEach(function (b) {
        if (!b.checked) return;
        any = true;
        var x = document.createElement('button');
        x.type = 'button'; x.className = 'pr-chip';
        x.innerHTML = '<span></span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.4"/></svg>';
        x.firstChild.textContent = b.value;
        x.setAttribute('aria-label', 'Remove ' + b.value);
        x.addEventListener('click', function () { b.checked = false; apply(); });
        chips.appendChild(x);
      });
      if (q) {
        any = true;
        var s = document.createElement('button');
        s.type = 'button'; s.className = 'pr-chip';
        s.innerHTML = '<span></span><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.4"/></svg>';
        s.firstChild.textContent = '“' + search.value.trim() + '”';
        s.addEventListener('click', function () { search.value = ''; apply(); });
        chips.appendChild(s);
      }
      if (any) {
        var all = document.createElement('button');
        all.type = 'button'; all.className = 'pr-chip pr-chip--all'; all.textContent = 'Clear all';
        all.addEventListener('click', clear);
        chips.insertBefore(all, chips.firstChild);
      }
      chips.hidden = !any;
    };
    var clear = function () { boxes.forEach(function (b) { b.checked = false; }); search.value = ''; var c = document.querySelector('.pr-search__clear'); if (c) c.hidden = true; apply(); };
    var order = function () {
      var v = sort.value.split('-'), k = v[0], dir = v[1] === 'asc' ? 1 : -1;
      cards.slice().sort(function (a, b) {
        var x = Number(a.dataset[k]) || 0, y = Number(b.dataset[k]) || 0;
        /* a car without a price goes last whichever way price is sorted */
        if (k === 'price' && (!x || !y)) return (!x) - (!y);
        return (x - y) * dir;
      }).forEach(function (c) { grid.appendChild(c); });
    };
    boxes.forEach(function (b) { b.addEventListener('change', apply); });
    search.addEventListener('input', apply);
    var clr = document.querySelector('.pr-search__clear');
    var showClr = function () { if (clr) clr.hidden = !search.value; };
    search.addEventListener('input', showClr);
    if (clr) clr.addEventListener('click', function () { search.value = ''; showClr(); apply(); search.focus(); });
    document.querySelector('.pr-search').addEventListener('submit', function (e) { e.preventDefault(); apply(); search.blur(); });
    sort.addEventListener('change', order);
    $$('[data-clear]').forEach(function (b) { b.addEventListener('click', clear); });
    $$('.pr-view button').forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.pr-view button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
        grid.classList.toggle('is-list', b.dataset.view === 'list');
      });
    });
    /* on a phone the filters fold behind one button, with a count */
    var tog = document.querySelector('.pr-filters__toggle');
    if (tog) {
      tog.addEventListener('click', function () {
        var open = tog.getAttribute('aria-expanded') !== 'true';
        tog.setAttribute('aria-expanded', open ? 'true' : 'false');
        tog.parentNode.classList.toggle('is-open', open);
      });
      var mark = function () {
        var n = boxes.filter(function (b) { return b.checked; }).length;
        tog.querySelector('[data-active]').textContent = n ? '(' + n + ')' : '';
      };
      boxes.forEach(function (b) { b.addEventListener('change', mark); });
      $$('[data-clear]').forEach(function (b) { b.addEventListener('click', mark); });
    }
    order(); apply();
  }

  /* 4 · VDP tabs — the retailer's: an underline under the open one;
     arrow keys move between them. */
  var tabs = $$('.pr-tabs [role=tab]');
  var show = function (t) {
    tabs.forEach(function (x) {
      var on = x === t;
      x.setAttribute('aria-selected', on ? 'true' : 'false');
      x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
  };
  tabs.forEach(function (t, k) {
    t.addEventListener('click', function () { show(t); });
    t.addEventListener('keydown', function (e) {
      var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      var n = tabs[(k + d + tabs.length) % tabs.length]; show(n); n.focus();
    });
  });

  /* 5 · VDP photographs — the mosaic opens ferrariofnewengland.com's
     full-screen gallery: one photo at full height with long arrows and
     dots at the foot, or every photo four across; keys, a swipe, Escape. */
  var gal = document.querySelector('.pr-gal[data-photos]');
  var lb = document.querySelector('.pr-lightbox');
  if (gal && lb) {
    var shots = gal.dataset.photos.split(' '), small = (gal.dataset.thumbs || gal.dataset.photos).split(' ');
    var at = 0, from = null, one = shots.length < 2;
    var big = lb.querySelector('.pr-lightbox__img'), num = lb.querySelector('.pr-lightbox__count span');
    var dots = lb.querySelector('.pr-lightbox__dots'), grid = lb.querySelector('.pr-lightbox__grid');
    $$('[data-lb]', lb).forEach(function (b) { b.hidden = one; });
    grid.innerHTML = small.map(function (src, k) {
      return '<li><button type="button" data-lb-go="' + k + '" aria-label="Photo ' + (k + 1) + ' of ' + shots.length + '"><img src="' + src + '" alt="" loading="lazy"></button></li>';
    }).join('');
    /* five dots at most, the current one a ring, as theirs */
    var paintDots = function () {
      var lo = Math.max(0, Math.min(at - 2, shots.length - 5)), hi = Math.min(shots.length, lo + 5), h = '';
      for (var k = lo; k < hi; k++) h += '<span' + (k === at ? ' class="is-on"' : '') + '></span>';
      dots.innerHTML = one ? '' : h;
    };
    var view = function (v) {
      lb.classList.toggle('is-grid', v === 'grid');
      grid.hidden = v !== 'grid';
      $$('[data-lb-view]', lb).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.lbView === v ? 'true' : 'false'); });
    };
    var go = function (i) {
      at = (i + shots.length) % shots.length;
      big.src = shots[at];
      big.alt = 'Photo ' + (at + 1) + ' of ' + shots.length;
      num.textContent = at + 1;
      paintDots();
    };
    var openLb = function (i, btn, v) {
      from = btn; go(i); view(v || 'single'); lb.hidden = false;
      if (window.__lenis) window.__lenis.stop();
      document.documentElement.classList.add('is-lb');
      lb.querySelector('[data-lb-close]').focus({ preventScroll: true });
    };
    var closeLb = function () {
      lb.hidden = true;
      if (window.__lenis) window.__lenis.start();
      document.documentElement.classList.remove('is-lb');
      if (from) from.focus({ preventScroll: true });
    };
    $$('[data-shot]', gal).forEach(function (b) { b.addEventListener('click', function () { openLb(Number(b.dataset.shot), b, b.dataset.view); }); });
    $$('[data-lb]', lb).forEach(function (b) { b.addEventListener('click', function () { go(at + Number(b.dataset.lb)); }); });
    $$('[data-lb-view]', lb).forEach(function (b) { b.addEventListener('click', function () { view(b.dataset.lbView); }); });
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-lb-go]'); if (!b) return;
      go(Number(b.dataset.lbGo)); view('single');
    });
    lb.querySelector('[data-lb-close]').addEventListener('click', closeLb);
    document.addEventListener('keydown', function (e) {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      else if (e.key === 'ArrowRight' && !lb.classList.contains('is-grid')) go(at + 1);
      else if (e.key === 'ArrowLeft' && !lb.classList.contains('is-grid')) go(at - 1);
      else if (e.key === 'Tab') {                     // keep focus inside
        var f = $$('button', lb).filter(function (x) { return x.offsetParent !== null; });
        var a = f[0], z = f[f.length - 1];
        if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
        else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
      }
    });
    var x0 = null;
    lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', function (e) {
      if (x0 === null || lb.classList.contains('is-grid')) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40 && !one) go(at + (dx < 0 ? 1 : -1));
    });
  }

  $$('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });
  void still;
})();
