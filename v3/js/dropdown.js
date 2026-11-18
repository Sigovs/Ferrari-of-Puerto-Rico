/* Ferrari's dropdown (www.ferrari.com f-dropdown, FERRARI_DESIGN.md §12.10)
   over a native <select>. Without script the select is the field; with it
   the select stays in the form (value, validation, change events) and this
   draws Ferrari's frame: a 56px box, the caps label in the middle until a
   value is chosen, then up in the notch of the top border; the layer opens
   below with a 0.2s fade, 12px items, grey on hover.
   Keyboard: Enter / Space / ↓ open; ↑ ↓ Home End move; Enter picks; Esc or
   Tab closes. Setting select.value then dispatching "change" redraws it. */
(function () {
  'use strict';
  var n = 0;
  [].forEach.call(document.querySelectorAll('.pr-field--select'), function (field) {
    var sel = field.querySelector('select'), lab = field.querySelector('label');
    if (!sel || !lab) return;
    var id = 'pr-dd-' + (++n);
    var opts = [].filter.call(sel.options, function (o) { return o.value; });

    var dd = document.createElement('div');
    dd.className = 'pr-dd';
    dd.innerHTML =
      '<button type="button" class="pr-dd__toggler" aria-haspopup="listbox" aria-expanded="false" aria-controls="' + id + '">' +
        '<span class="pr-dd__frame"><span class="pr-dd__label"><span class="pr-dd__label-text"></span></span></span>' +
        '<span class="pr-dd__value"></span>' +
        '<svg class="pr-dd__arrow" width="12" height="8" viewBox="0 0 12 8" aria-hidden="true"><path d="M1 1.5l5 5 5-5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>' +
      '</button>' +
      '<div class="pr-dd__layer" hidden><ul class="pr-dd__list" role="listbox" id="' + id + '" tabindex="-1"></ul></div>';
    var btn = dd.querySelector('.pr-dd__toggler'), val = dd.querySelector('.pr-dd__value');
    var layer = dd.querySelector('.pr-dd__layer'), list = dd.querySelector('.pr-dd__list');
    dd.querySelector('.pr-dd__label-text').textContent = lab.textContent;
    btn.setAttribute('aria-label', lab.textContent);
    opts.forEach(function (o, i) {
      var li = document.createElement('li');
      li.className = 'pr-dd__item'; li.setAttribute('role', 'option'); li.id = id + '-' + i;
      li.textContent = o.textContent; li.dataset.value = o.value;
      list.appendChild(li);
    });
    var items = [].slice.call(list.children), cur = -1;

    /* the native select leaves the screen but stays in the form */
    field.classList.add('has-dd');
    sel.tabIndex = -1; sel.setAttribute('aria-hidden', 'true');
    field.appendChild(dd);

    var draw = function () {
      var o = sel.options[sel.selectedIndex];
      var has = !!(o && o.value);
      dd.classList.toggle('is-selected', has);
      val.textContent = has ? o.textContent : '';
      btn.setAttribute('aria-label', lab.textContent + (has ? ': ' + o.textContent : ''));
      items.forEach(function (li) { li.setAttribute('aria-selected', String(has && li.dataset.value === o.value)); });
      dd.classList.toggle('is-invalid', sel.classList.contains('is-invalid'));
    };
    var mark = function (i) {
      cur = Math.max(0, Math.min(items.length - 1, i));
      items.forEach(function (li, k) { li.classList.toggle('is-active', k === cur); });
      list.setAttribute('aria-activedescendant', items[cur].id);
      items[cur].scrollIntoView({ block: 'nearest' });
    };
    var open = function () {
      if (!layer.hidden) return;
      layer.hidden = false; dd.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true');
      var k = items.findIndex(function (li) { return li.dataset.value === sel.value; });
      mark(k < 0 ? 0 : k); list.focus({ preventScroll: true });
    };
    var close = function (back) {
      if (layer.hidden) return;
      layer.hidden = true; dd.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false');
      if (back) btn.focus({ preventScroll: true });
    };
    var pick = function (i) {
      sel.value = items[i].dataset.value;
      sel.classList.remove('is-invalid');
      sel.dispatchEvent(new Event('change', { bubbles: true }));
      close(true);
    };

    btn.addEventListener('click', function () { layer.hidden ? open() : close(true); });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); open(); }
    });
    list.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); mark(cur + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); mark(cur - 1); }
      else if (e.key === 'Home') { e.preventDefault(); mark(0); }
      else if (e.key === 'End') { e.preventDefault(); mark(items.length - 1); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(cur); }
      else if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (e.key === 'Tab') { close(false); }
    });
    items.forEach(function (li, i) {
      li.addEventListener('mousemove', function () { if (cur !== i) mark(i); });
      li.addEventListener('click', function () { pick(i); });
    });
    document.addEventListener('pointerdown', function (e) { if (!dd.contains(e.target)) close(false); });
    sel.addEventListener('change', draw);
    /* the page's validation marks the select: mirror it on the frame */
    new MutationObserver(draw).observe(sel, { attributes: true, attributeFilter: ['class'] });
    /* a form reset puts the select back: redraw after it */
    if (sel.form) sel.form.addEventListener('reset', function () { setTimeout(draw, 0); });
    /* focus from validation lands on the frame */
    sel.focus = function () { btn.focus(); };
    draw();
  });
})();
