/* Sell or Consign: the Value your Ferrari form (cauleyferrari.com
   /value-your-trade/'s fields). A link can preset the choice (data-intent, or
   sell-or-consign.html?intent=consign#value). Checks every starred field, an
   email, a 10-digit phone and a 5-digit zip; VIN, when given, 17 characters.
   Images: Click to upload or drop them on the area, up to 12, each removable.
   No endpoint yet: a valid form — and Upload — say so, as every form on this
   preview does. */
(function () {
  var form = document.getElementById('pr-sell');
  if (!form) return;
  var pick = document.getElementById('sv-intent');
  var sent = form.querySelector('.pr-vform__actions .pr-pop__sent');
  var TBC = 'Sending to be confirmed — no service is connected to this preview yet.';

  /* "Consign your Ferrari" (and ?intent=consign) preset the choice */
  [].forEach.call(document.querySelectorAll('a[data-intent]'), function (b) {
    b.addEventListener('click', function () {
      var o = [].filter.call(pick.options, function (x) { return x.value && x.value.toLowerCase().indexOf(b.dataset.intent.toLowerCase()) === 0; })[0];
      if (o) pick.value = o.value;
      pick.classList.remove('is-invalid');
    });
  });
  var want = new URLSearchParams(location.search).get('intent');
  if (want) {
    var opt = [].filter.call(pick.options, function (o) { return o.value && o.value.toLowerCase().indexOf(want.toLowerCase()) === 0; })[0];
    if (opt) pick.value = opt.value;
  }

  var fields = [].slice.call(form.querySelectorAll('[required]'));
  var vin = form.querySelector('[name=vin]');
  fields.concat(vin).forEach(function (i) {
    var clear = function () { i.classList.remove('is-invalid'); sent.textContent = ''; };
    i.addEventListener('input', clear); i.addEventListener('change', clear);
  });
  var bad = function (i) {
    var v = i.value.trim();
    if (i === vin) return v !== '' && !/^[A-HJ-NPR-Z0-9]{17}$/i.test(v);
    if (!v) return true;
    if (i.type === 'email') return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (i.type === 'tel') return v.replace(/\D/g, '').length < 10;
    if (i.name === 'zip') return !/^\d{5}(-\d{4})?$/.test(v);
    return false;
  };
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    sent.textContent = '';
    var first = null;
    fields.concat(vin).forEach(function (i) { var b = bad(i); i.classList.toggle('is-invalid', b); if (b && !first) first = i; });
    if (first) { first.focus(); return; }
    sent.textContent = TBC;
  });

  /* ── upload: up to 12 images, by the button or by dropping them ── */
  var up = form.querySelector('.pr-vup');
  if (!up) return;
  var MAX = +up.dataset.max || 12;
  var file = up.querySelector('.pr-vup__file');
  var drop = up.querySelector('.pr-vup__drop');
  var send = up.querySelector('.pr-vup__send');
  var list = up.querySelector('.pr-vup__list');
  var note = document.createElement('p');
  note.className = 'pr-vup__note'; note.setAttribute('aria-live', 'polite');
  up.appendChild(note);
  var chosen = [];

  var draw = function () {
    [].forEach.call(list.querySelectorAll('img'), function (img) { URL.revokeObjectURL(img.src); });
    list.innerHTML = '';
    chosen.forEach(function (f, n) {
      var li = document.createElement('li');
      var img = document.createElement('img');
      img.src = URL.createObjectURL(f); img.alt = f.name;
      var x = document.createElement('button');
      x.type = 'button'; x.textContent = '×'; x.setAttribute('aria-label', 'Remove ' + f.name);
      x.addEventListener('click', function () { chosen.splice(n, 1); note.textContent = ''; draw(); send.focus(); });
      li.appendChild(img); li.appendChild(x); list.appendChild(li);
    });
    send.disabled = !chosen.length;
  };
  var add = function (files) {
    var imgs = [].filter.call(files, function (f) { return /^image\//.test(f.type); });
    var room = MAX - chosen.length;
    chosen = chosen.concat(imgs.slice(0, Math.max(room, 0)));
    note.textContent = imgs.length > room ? 'Up to ' + MAX + ' images — ' + (imgs.length - Math.max(room, 0)) + ' not added.' : '';
    draw();
  };

  up.querySelector('.pr-vup__pick').addEventListener('click', function () { file.click(); });
  file.addEventListener('change', function () { add(file.files); file.value = ''; });
  ['dragenter', 'dragover'].forEach(function (t) {
    drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.add('is-over'); });
  });
  ['dragleave', 'drop'].forEach(function (t) {
    drop.addEventListener(t, function (e) { e.preventDefault(); drop.classList.remove('is-over'); });
  });
  drop.addEventListener('drop', function (e) { if (e.dataTransfer) add(e.dataTransfer.files); });
  send.addEventListener('click', function () {
    note.textContent = 'Uploading to be confirmed — no service is connected to this preview yet.';
  });
})();
