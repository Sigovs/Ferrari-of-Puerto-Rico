/* Interest forms (Corso Pilota, Ferrari Challenge …): every starred field,
   a valid e-mail, a ten-digit phone. No endpoint yet: a valid form says so,
   as every form on this preview does. Dropdowns are js/dropdown.js. */
(function () {
  'use strict';
  var TBC = 'Sending to be confirmed — no service is connected to this preview yet.';
  [].forEach.call(document.querySelectorAll('form.pr-interest'), function (form) {
    var sent = form.querySelector('.pr-pop__sent');
    var fields = [].slice.call(form.querySelectorAll('[required]'));
    fields.forEach(function (i) {
      var clear = function () { i.classList.remove('is-invalid'); if (sent) sent.textContent = ''; };
      i.addEventListener('input', clear); i.addEventListener('change', clear);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null;
      fields.forEach(function (i) {
        var v = i.value.trim();
        var bad = !v || (i.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) || (i.type === 'tel' && v.replace(/\D/g, '').length < 10);
        i.classList.toggle('is-invalid', bad);
        if (bad && !first) first = i;
      });
      if (first) { first.focus(); return; }
      if (sent) sent.textContent = TBC;
    });
  });
})();
