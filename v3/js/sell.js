/* Sell or Consign: the Value your Ferrari form. A link can preset the
   choice (data-intent, or sell-or-consign.html?intent=consign#value). Checks every starred field, a four-digit year, a
   17-character VIN and a mileage in figures. No endpoint yet: a valid form
   says so, as every form on this preview does. */
(function () {
  var form = document.getElementById('pr-sell');
  if (!form) return;
  var pick = document.getElementById('sv-intent');
  var sent = form.querySelector('.pr-pop__sent');
  var TBC = 'Sending to be confirmed — no service is connected to this preview yet.';
  var year = new Date().getFullYear() + 1;

  /* "Consign your Ferrari" (and ?intent=consign) preset the choice */
  [].forEach.call(document.querySelectorAll('a[data-intent]'), function (b) {
    b.addEventListener('click', function () { pick.value = b.dataset.intent; pick.classList.remove('is-invalid'); pick.dispatchEvent(new Event('change')); });
  });
  var want = new URLSearchParams(location.search).get('intent');
  if (want) {
    var opt = [].filter.call(pick.options, function (o) { return o.value && o.value.toLowerCase().indexOf(want.toLowerCase()) === 0; })[0];
    if (opt) { pick.value = opt.value; pick.dispatchEvent(new Event('change')); }
  }

  var fields = [].slice.call(form.querySelectorAll('[required]'));
  fields.forEach(function (i) {
    var clear = function () { i.classList.remove('is-invalid'); sent.textContent = ''; };
    i.addEventListener('input', clear); i.addEventListener('change', clear);
  });
  var bad = function (i) {
    var v = i.value.trim();
    if (!v) return true;
    if (i.type === 'email') return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
    if (i.type === 'tel') return v.replace(/\D/g, '').length < 10;
    if (i.name === 'year') return !/^\d{4}$/.test(v) || +v < 1947 || +v > year;
    if (i.name === 'vin') return !/^[A-HJ-NPR-Z0-9]{17}$/i.test(v);
    if (i.name === 'mileage') return !/^[\d,.\s]+$/.test(v);
    return false;
  };
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    sent.textContent = '';
    var first = null;
    fields.forEach(function (i) { var b = bad(i); i.classList.toggle('is-invalid', b); if (b && !first) first = i; });
    if (first) { first.focus(); return; }
    sent.textContent = TBC;
  });
})();
