/* Schedule a Demo Drive: the chosen model goes onto the dark panel; the
   form checks every starred field, the model choice and the date (not in the
   past, not a Sunday — the dealer's sales hours). ?model=<slug> preselects.
   No endpoint yet: a valid form says so, as the Inquire drawer does. */
(function () {
  var form = document.getElementById('pr-drive');
  if (!form) return;
  var models = form.querySelector('.pr-drive__models');
  var radios = [].slice.call(form.querySelectorAll('input[name=model]'));
  var modelErr = document.getElementById('pr-drive-model-err');
  var panel = form.querySelector('.pr-drive__car');
  var name = panel.querySelector('.pr-drive__model');
  var date = document.getElementById('dd-date');
  var dateErr = document.getElementById('dd-date-err');
  var sent = form.querySelector('.pr-pop__sent');
  var TBC = 'Sending to be confirmed — no service is connected to this preview yet.';

  /* today, in the visitor's own calendar, as the earliest date */
  var d = new Date(), pad = function (n) { return (n < 10 ? '0' : '') + n; };
  date.min = d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());

  /* the panel: a fresh <img> each time, so its fade-in plays again */
  var show = function (r) {
    var box = panel.querySelector('.pr-drive__img'), old = box.querySelector('img'), img = old.cloneNode();
    img.src = r.closest('.pr-pick').querySelector('img').getAttribute('src');
    img.alt = r.value; img.hidden = false;
    box.replaceChild(img, old);
    name.textContent = r.value;
    panel.classList.add('is-set');
    models.classList.remove('is-invalid'); modelErr.textContent = '';
  };
  radios.forEach(function (r) { r.addEventListener('change', function () { show(r); }); });

  /* a car picked by pointer: once the choice shows, glide down to step 2
     (site.js's smooth scroll, below the sticky band). Arrow keys moving
     through the radios do not scroll — the page would jump on every model. */
  var byPointer = false, step2 = form.querySelector('.pr-drive__split');
  form.querySelector('.pr-picks').addEventListener('pointerdown', function () { byPointer = true; });
  radios.forEach(function (r) {
    r.addEventListener('change', function () {
      if (!byPointer || !step2) return;
      byPointer = false;
      setTimeout(function () {
        if (window.__prScrollTo) window.__prScrollTo(step2);
        else step2.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 350);
    });
  });

  var want = new URLSearchParams(location.search).get('model');
  radios.forEach(function (r) { if (want && r.dataset.slug === want) { r.checked = true; show(r); } });

  var dateProblem = function () {
    if (!date.value) return 'Please choose a date.';
    if (date.value < date.min) return 'Please choose a date from today on.';
    var p = date.value.split('-');
    if (new Date(+p[0], p[1] - 1, +p[2]).getDay() === 0) return 'Sales is closed on Sunday. Please choose Monday to Saturday.';
    return '';
  };

  [].forEach.call(form.querySelectorAll('.pr-drive__you [required]'), function (i) {
    var clear = function () { i.classList.remove('is-invalid'); sent.textContent = ''; if (i === date) dateErr.textContent = ''; };
    i.addEventListener('input', clear); i.addEventListener('change', clear);
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    sent.textContent = '';
    var first = null;
    if (!radios.some(function (r) { return r.checked; })) {
      models.classList.add('is-invalid'); modelErr.textContent = 'Please choose a model.';
      first = radios[0];
    }
    [].forEach.call(form.querySelectorAll('.pr-drive__you [required]'), function (i) {
      var v = i.value.trim(), bad;
      if (i === date) { var m = dateProblem(); dateErr.textContent = m; bad = !!m; }
      else bad = !v || (i.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) || (i.type === 'tel' && v.replace(/\D/g, '').length < 10);
      i.classList.toggle('is-invalid', bad);
      if (bad && !first) first = i;
    });
    if (first) { first.focus(); return; }
    sent.textContent = TBC;
  });
})();
