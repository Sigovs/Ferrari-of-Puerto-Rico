/* Club Competizioni GT — Ferrari's next-event countdown (RaceCalendarFC):
   days, hours, minutes and seconds to the opening round, once a second.
   Without script, or once the round has begun, the date stands alone. */
(function () {
  'use strict';
  var box = document.querySelector('.pr-count[data-count]');
  if (!box) return;
  var at = Date.parse(box.getAttribute('data-count'));
  if (isNaN(at) || at <= Date.now()) return;
  var clock = box.querySelector('.pr-count__clock'), units = box.querySelector('.pr-count__units');
  var el = {};
  ['d', 'h', 'm', 's'].forEach(function (u) { el[u] = box.querySelector('[data-u="' + u + '"]'); });
  var pad = function (n) { return (n < 10 ? '0' : '') + n; };
  var tick = function () {
    var t = Math.max(0, Math.floor((at - Date.now()) / 1000));
    el.d.textContent = pad(Math.floor(t / 86400));
    el.h.textContent = pad(Math.floor(t % 86400 / 3600));
    el.m.textContent = pad(Math.floor(t % 3600 / 60));
    el.s.textContent = pad(t % 60);
  };
  tick();
  clock.hidden = false; units.hidden = false; box.classList.add('is-live');
  setInterval(tick, 1000);
})();
