/* The inventory card's popups, as the retailer's: Text to Phone and Share.
   Open on the card's button, close on the ring, the backdrop or Escape;
   focus goes in and comes back. The forms check what the retailer checks
   (a ten-digit number; both e-mail fields) — nothing is sent, because no
   service is connected yet, and a valid form says exactly that. */
(function () {
  'use strict';
  var opener = null, openPop = null, timer = 0;
  var lock = function (on) {
    if (window.__lenis) window.__lenis[on ? 'stop' : 'start']();
  };
  var hold = function (e) {
    if (!openPop) return;
    var s = e.target.closest && e.target.closest('.pr-drawer__content, .pr-sms__modal');
    if (s && s.scrollHeight > s.clientHeight) return;
    e.preventDefault();
  };
  document.addEventListener('wheel', hold, { passive: false });
  document.addEventListener('touchmove', hold, { passive: false });
  var open = function (pop, from) {
    if (openPop) close(openPop, true);
    clearTimeout(timer);
    opener = from; openPop = pop;
    pop.hidden = false;
    pop.offsetHeight;                              // commit the closed state
    pop.classList.add('is-open');
    lock(true);
    var first = pop.querySelector('input, textarea');
    setTimeout(function () { (first || pop.querySelector('.pr-pop__close')).focus({ preventScroll: true }); }, 50);
  };
  var close = function (pop, now) {
    pop.classList.remove('is-open');
    lock(false);
    openPop = null;
    var done = function () { pop.hidden = true; };
    if (now) done(); else timer = setTimeout(done, 650);
    if (opener && !now) { opener.focus({ preventScroll: true }); opener = null; }
  };

  [].forEach.call(document.querySelectorAll('[data-pop]'), function (btn) {
    btn.addEventListener('click', function () {
      var pop = document.getElementById(btn.dataset.pop);
      if (!pop) return;
      pop.querySelector('form').reset();
      [].forEach.call(pop.querySelectorAll('.is-invalid'), function (e) { e.classList.remove('is-invalid'); });
      [].forEach.call(pop.querySelectorAll('.pr-pop__error, .pr-pop__sent'), function (e) { e.textContent = ''; });
      var num = pop.querySelector('.pr-sms__num');
      if (num) num.textContent = ' (___) ___-____';
      pop.dataset.car = btn.dataset.car || '';
      if (pop.id === 'pr-lead') fillLead(pop, btn.dataset);
      open(pop, btn);
    });
  });
  [].forEach.call(document.querySelectorAll('[data-pop-close]'), function (el) {
    el.addEventListener('click', function () { var p = el.closest('.pr-pop'); if (p) close(p); });
  });
  document.addEventListener('keydown', function (e) {
    if (!openPop) return;
    if (e.key === 'Escape') { close(openPop); return; }
    if (e.key !== 'Tab') return;                   // keep focus inside
    var f = [].filter.call(openPop.querySelectorAll('button, input, textarea'), function (x) { return x.offsetParent !== null; });
    if (!f.length) return;
    var a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
    else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });

  var TBC = 'Sending to be confirmed — no service is connected to this preview yet.';

  /* Inquire / Schedule test drive: the car the button belongs to goes on
     the dark band, and the message names it the way the retailer's does
     ("I would like more information about: [Stock No: …] year name") */
  var fillLead = function (pop, d) {
    var drive = d.intent === 'testdrive';
    var im = pop.querySelector('.pr-lead__img img');
    im.src = d.img || ''; im.alt = d.car || '';
    pop.querySelector('.pr-lead__img').hidden = !d.img;
    pop.querySelector('#pr-lead-h').textContent = d.car || '';
    pop.querySelector('.pr-lead__spec').textContent = d.spec || '';
    pop.querySelector('.pr-lead__price').textContent = d.price || '';
    pop.querySelector('.pr-lead__intent').hidden = !drive;
    var line = d.stock ? '[Stock No: ' + d.stock + ']  ' + d.car : d.car;
    pop.querySelector('textarea').value = (drive
      ? 'I would like to schedule a test drive of:\n'
      : 'I would like more information about:\n') + line;
    pop.classList.toggle('is-drive', drive);
  };

  /* the lead form: every starred field, an address that reads as one */
  var lead = document.getElementById('pr-lead');
  if (lead) {
    var lf = lead.querySelector('form'), lo = lead.querySelector('.pr-pop__sent');
    [].forEach.call(lf.querySelectorAll('[required]'), function (i) {
      i.addEventListener('input', function () { i.classList.remove('is-invalid'); lo.textContent = ''; });
    });
    lf.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = [].filter.call(lf.querySelectorAll('[required]'), function (i) {
        var v = i.value.trim();
        var b = !v || (i.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) || (i.type === 'tel' && v.replace(/\D/g, '').length < 10);
        i.classList.toggle('is-invalid', b); return b;
      });
      if (bad.length) { bad[0].focus(); return; }
      lo.textContent = TBC;
    });
  }

  /* Text to Phone: the mask fills as the digits come in, as theirs does */
  var sms = document.getElementById('pr-sms');
  if (sms) {
    var tel = sms.querySelector('input[type=tel]'), num = sms.querySelector('.pr-sms__num');
    var err = sms.querySelector('.pr-pop__error'), sent = sms.querySelector('.pr-pop__sent');
    tel.addEventListener('input', function () {
      var d = tel.value.replace(/\D/g, '').slice(0, 10);
      tel.value = d;
      var m = '(___) ___-____'.split(''), i = 0;
      for (var k = 0; k < m.length && i < d.length; k++) if (m[k] === '_') m[k] = d[i++];
      num.textContent = ' ' + m.join('');
      tel.classList.remove('is-invalid'); err.textContent = ''; sent.textContent = '';
    });
    sms.querySelector('form').addEventListener('submit', function (e) {
      e.preventDefault();
      if (tel.value.length !== 10) { tel.classList.add('is-invalid'); err.textContent = 'Please enter valid phone number'; return; }
      sent.textContent = TBC;
    });
  }

  /* Share: both addresses are required; a bad one marks its line red */
  var share = document.getElementById('pr-share');
  if (share) {
    var form = share.querySelector('form'), out = share.querySelector('.pr-pop__sent');
    var ok = function (i) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim()); };
    [].forEach.call(form.querySelectorAll('input[type=email]'), function (i) {
      i.addEventListener('input', function () { i.classList.remove('is-invalid'); out.textContent = ''; });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = [].filter.call(form.querySelectorAll('input[type=email]'), function (i) {
        var b = !ok(i); i.classList.toggle('is-invalid', b); return b;
      });
      if (bad.length) { bad[0].focus(); return; }
      out.textContent = TBC;
    });
  }
})();
