/* Assembles the Ferrari of Puerto Rico site from its parts.
   Primary reference: cauleyferrari.com (modules, behaviour, measurements);
   the Figma frames (AAN FERRARI PROJECT LIB, Aci2Fz647chvtpI1bMUdhJ) are
   secondary. The SRP and VDP are built out toward ferrarifl.com's, in this
   site's own system.

     _head.html            document head + the shared chevron symbol
     _header-pr.html       top bar + navigation band
     _mobilemenu-pr.html
     _home.html            the home page; {{LINEUP}} {{CPO_CARDS}} {{POPUPS}}
     _team.html            Our Team; {{STAFF}}
     _approved.html        Ferrari Approved (the Cauley page, this chrome)
     _popups.html          Text to Phone, Share, Inquire / Test drive
     _footer-pr.html
     _tail.html            scripts
     data/inventory.json   the dealer's live pre-owned stock, copied from
                           ferraripuertorico.com (see README)

   Run `node build.mjs`; never edit the .html outputs by hand. */
import { readFileSync, writeFileSync, statSync, readdirSync, unlinkSync } from 'node:fs';

const read = f => readFileSync(f, 'utf8');
const stamp = f => { try { return Math.floor(statSync(f).mtimeMs).toString(36); } catch { return '0'; } };
const bust = html => html.replace(/(href|src)="(css\/[^"?]+\.css|js\/[^"?]+\.js)"/g,
  (_, a, p) => `${a}="${p}?v=${stamp(p)}"`);
const esc = s => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/* anything missing shows as "… to be confirmed", in the placeholder style */
const tbc = what => `<span class="pr-todo">${what} to be confirmed</span>`;
const chev = '<svg aria-hidden="true"><use href="#chev"/></svg>';
const ring40 = '<svg class="pr-ring" viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="19" pathLength="100"/></svg>';

/* ── the 2026 range — Cauley's model list, in Cauley's order; the
   photographs are ferrari.com's own (each model's page, cropped square). ── */
const MODELS = [
  ['849-testarossa',        '849 Testarossa',        'https://www.ferrari.com/en-US/auto/849-testarossa'],
  ['849-testarossa-spider', '849 Testarossa Spider', 'https://www.ferrari.com/en-US/auto/849-testarossa-spider'],
  ['296-gtb',               '296 GTB',               'https://www.ferrari.com/en-US/auto/296-gtb'],
  ['296-gts',               '296 GTS',               'https://www.ferrari.com/en-US/auto/296-gts'],
  ['12cilindri',            '12Cilindri',            'https://www.ferrari.com/en-US/auto/ferrari-12cilindri'],
  ['12cilindri-spider',     '12Cilindri Spider',     'https://www.ferrari.com/en-US/auto/ferrari-12cilindri-spider'],
  ['purosangue',            'Purosangue',            'https://www.ferrari.com/en-US/auto/ferrari-purosangue'],
  ['amalfi',                'Amalfi',                'https://www.ferrari.com/en-US/auto/ferrari-amalfi'],
  ['amalfi-spider',         'Amalfi Spider',         'https://www.ferrari.com/en-US/auto/ferrari-amalfi-spider'],
  ['luce',                  'Luce',                  'https://www.ferrari.com/en-US/auto/ferrari-luce'],
];
const tile = ([slug, name, url]) => `      <li class="pr-lineup__item">
        <a class="pr-model" href="${url}" target="_blank" rel="noopener">
          <span class="pr-model__img"><img src="img/lineup/${slug}.webp" width="462" height="462" loading="lazy" alt="Ferrari ${name}"></span>
          <span class="pr-model__name">${name}</span>
        </a>
        <button type="button" class="pr-model__td" data-pop="pr-lead" data-intent="testdrive" data-car="Ferrari ${name}" data-spec="2026 range" data-img="img/lineup/${slug}.webp">Schedule test drive ${chev}</button>
      </li>`;

/* ── the dealer's stock ─────────────────────────────────────────────── */
const INV = JSON.parse(read('data/inventory.json'));
const CARS = INV.cars;
/* three listings carry only the source's "Photos coming soon" frames
   (checked by eye, 22 Oct 2026): show the one with the horse, once */
const soon = c => c.photo_count <= 6;
const shots = c => soon(c) ? c.photos.slice(0, 1) : c.photos;
/* the model as the dealer names it: "Scuderia" + "16M Spider"; "Base" stays off */
const modelOf = c => (c.trim && c.trim !== 'Base' ? `${c.model} ${c.trim}` : c.model);
const nameOf = c => `Ferrari ${modelOf(c)}`;
const titleOf = c => `${c.year} Ferrari ${modelOf(c)}`;
const slugOf = c => `pre-owned-${c.year}-ferrari-${modelOf(c)}-${c.stock}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
const hrefOf = c => `${slugOf(c)}.html`;
const money = n => (n ? '$' + Number(n).toLocaleString('en-US') : '');
const miles = n => Number(n || 0).toLocaleString('en-US') + ' mi';
const pic = (c, n, w) => `img/inventory/${c.stock}/${String(n).padStart(2, '0')}-${w}.webp`;
const leadData = c => `data-car="${esc(titleOf(c))}" data-stock="${c.stock}" data-spec="${c.year} · ${miles(c.mileage)}" data-price="${money(c.price)}" data-img="${pic(c, 1, 640)}"`;

const card = (c, extra = '') => {
  const ph = shots(c);
  return `      <li class="pr-car${extra}" data-model="${esc(modelOf(c))}" data-year="${c.year}" data-price="${c.price || 0}" data-miles="${c.mileage || 0}" data-listed="${c.id}" data-ext="${esc(c.exterior)}" data-int="${esc(c.interior)}" data-prog="${c.certified ? 'Ferrari Approved' : 'Pre-owned'}" data-text="${esc([titleOf(c), c.stock, c.vin, c.exterior, c.interior].join(' ').toLowerCase())}">
        <div class="pr-car__media" data-photos="${ph.map(p => pic(c, p.n, 640)).join(' ')}">
          <a class="pr-car__photo" href="${hrefOf(c)}" tabindex="-1" aria-hidden="true"><img src="${pic(c, 1, 640)}" width="640" height="427" loading="lazy" alt=""></a>
          ${c.one_owner ? '<p class="pr-car__badges"><span class="pr-badge">One owner</span></p>' : ''}
          <button type="button" class="pr-car__save" aria-pressed="false" data-save="${c.stock}" aria-label="Save ${esc(titleOf(c))}"><img src="img/icons/icon-favourite.svg" width="24" height="24" alt=""></button>
          ${ph.length > 1 ? `<div class="pr-car__step">
            <button type="button" data-step="-1" aria-label="Previous photo"><svg aria-hidden="true" style="transform:scaleX(-1)"><use href="#chev"/></svg></button>
            <span class="pr-car__count"><span>1</span> of ${ph.length}</span>
            <button type="button" data-step="1" aria-label="Next photo">${chev}</button>
          </div>` : ''}
        </div>
        <div class="pr-car__body">
          <div class="pr-car__eyebrow"><span>${c.year}</span><span>${miles(c.mileage)}</span>${c.certified ? '<span class="pr-tag">Ferrari Approved</span>' : ''}</div>
          <h3 class="pr-car__name"><a href="${hrefOf(c)}">${esc(nameOf(c))}</a></h3>
          <p class="pr-car__ids"><span>Stock: ${c.stock}</span><span>VIN: ${c.vin}</span></p>
          <div class="pr-car__price"><span>${money(c.price) || tbc('Price')}</span></div>
          <dl class="pr-car__colours">
            <div><dt>Exterior Colour</dt><dd>${esc(c.exterior)}</dd></div>
            <div><dt>Interior colour</dt><dd>${esc(c.interior)}</dd></div>
          </dl>
          <div class="pr-car__cta">
            <button type="button" class="btn btn--primary btn--fill" data-pop="pr-lead" data-intent="inquire" ${leadData(c)}>Inquire</button>
            <a class="btn btn--outline-dark btn--fill" href="${hrefOf(c)}">More details</a>
          </div>
          <button type="button" class="btn btn--outline-dark pr-car__td" data-pop="pr-lead" data-intent="testdrive" ${leadData(c)}>Schedule test drive</button>
          <div class="pr-car__share">
            <button type="button" data-pop="pr-sms" data-car="${esc(titleOf(c))}"><img src="img/icons/icon-chat.svg" width="16" height="16" alt="">Text to Phone</button>
            <button type="button" data-pop="pr-share" data-car="${esc(titleOf(c))}"><img src="img/icons/icon-share.svg" width="16" height="16" alt="">Share</button>
          </div>
        </div>
      </li>`;
};

/* ── SRP — ferrarifl.com's: filters on the left, search, count, grid /
   list, sort, the active filters as chips; the cards are this site's ── */
const facet = (key, label, values, open) => {
  const counts = values.reduce((m, v) => (m.set(v, (m.get(v) || 0) + 1), m), new Map());
  const keys = [...counts.keys()].sort((a, b) => key === 'year' ? b - a : String(a).localeCompare(String(b)));
  return `        <details class="pr-filter"${open ? ' open' : ''}>
          <summary>${label}${chev}</summary>
          <ul>
${keys.map(v => `            <li><label class="pr-check"><input type="checkbox" name="${key}" value="${esc(v)}"><span>${esc(v)}</span><span class="pr-filter__n">${counts.get(v)}</span></label></li>`).join('\n')}
          </ul>
        </details>`;
};
/* the dealer's own disclaimer, from its current vehicle pages */
const DISCLAIMER = `*All pricing and details are believed to be accurate, but we do not warrant or guarantee such accuracy. The prices shown above may vary from region to region, as will incentives, and are subject to change. Vehicle information is based off standard equipment and may vary from vehicle to vehicle. Call or email for complete vehicle information. All specifications, prices and equipment are subject to change without notice. Prices and payments do not include tax, titles, tags, finance charges, documentation charges, emissions testing charges, or other fees required by law, vehicle sellers or lending organizations.`;

const srp = () => `<main id="main" class="pr-inv pr-srp">
  <div class="pr-shell">
    <p class="marker"><span>1</span><span class="marker__rule"></span><span>Pre-owned inventory</span></p>
    <h1 class="pr-srp__title">Ferrari Approved pre-owned inventory</h1>
    <div class="pr-srp__layout">
      <aside class="pr-filters" aria-label="Filter vehicles">
        <div class="pr-filters__head"><h2>Filter</h2><button type="button" class="pr-filters__clear" data-clear>Clear all</button></div>
        <button type="button" class="pr-filters__toggle" aria-expanded="false" aria-controls="pr-facets">Filter <span data-active></span>${chev}</button>
        <div class="pr-filters__body" id="pr-facets">
${facet('model', 'Model', CARS.map(modelOf), true)}
${facet('year', 'Year', CARS.map(c => c.year))}
${facet('prog', 'Program', CARS.map(c => c.certified ? 'Ferrari Approved' : 'Pre-owned'))}
${facet('ext', 'Exterior Color', CARS.map(c => c.exterior))}
${facet('int', 'Interior Color', CARS.map(c => c.interior))}
        </div>
      </aside>
      <div class="pr-results">
        <form class="pr-search" role="search" action="#" onsubmit="return false">
          <span class="pr-search__icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M16.5 16.5 21 21" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>
          <input type="search" placeholder="Search by make, model, stock # or vin" aria-label="Search by make, model, stock number or VIN" autocomplete="off">
          <button type="button" class="pr-search__clear" aria-label="Clear search" hidden>&times;</button>
          <button type="submit" class="btn btn--primary pr-search__go">Search</button>
        </form>
        <div class="pr-results__bar">
          <p class="pr-results__count" aria-live="polite"><span data-count>${CARS.length}</span> results found</p>
          <div class="pr-results__tools">
            <div class="pr-view" role="group" aria-label="Layout">
              <button type="button" data-view="list" aria-pressed="false" aria-label="List"><svg viewBox="0 0 20 18" fill="none" aria-hidden="true"><path d="M0.678 0.061 C 0.368 0.169,0.164 0.377,0.051 0.696 C -0.117 1.174,0.159 1.747,0.645 1.929 C 0.827 1.997,0.892 2.000,2.000 2.000 C 3.108 2.000,3.173 1.997,3.355 1.929 C 3.479 1.882,3.601 1.802,3.702 1.702 C 4.184 1.219,4.052 0.411,3.441 0.110 L 3.250 0.017 2.050 0.009 C 0.965 0.001,0.834 0.006,0.678 0.061 M6.678 0.062 C 6.369 0.169,6.164 0.376,6.051 0.696 C 5.883 1.174,6.159 1.747,6.645 1.929 L 6.836 2.000 13.000 2.000 L 19.164 2.000 19.355 1.929 C 19.479 1.882,19.601 1.802,19.702 1.702 C 20.184 1.219,20.052 0.411,19.441 0.110 L 19.250 0.017 13.050 0.009 C 7.166 0.002,6.841 0.005,6.678 0.062 M0.678 5.061 C 0.368 5.169,0.164 5.377,0.051 5.696 C -0.117 6.174,0.159 6.747,0.645 6.929 C 0.827 6.997,0.892 7.000,2.000 7.000 C 3.108 7.000,3.173 6.997,3.355 6.929 C 3.479 6.882,3.601 6.802,3.702 6.702 C 4.184 6.219,4.052 5.411,3.441 5.110 L 3.250 5.017 2.050 5.009 C 0.965 5.001,0.834 5.006,0.678 5.061 M6.678 5.062 C 6.369 5.169,6.164 5.376,6.051 5.696 C 5.883 6.174,6.159 6.747,6.645 6.929 L 6.836 7.000 13.000 7.000 L 19.164 7.000 19.355 6.929 C 19.479 6.882,19.601 6.802,19.702 6.702 C 20.184 6.219,20.052 5.411,19.441 5.110 L 19.250 5.017 13.050 5.009 C 7.166 5.002,6.841 5.005,6.678 5.062 M0.678 10.061 C 0.368 10.169,0.164 10.377,0.051 10.696 C -0.117 11.174,0.159 11.747,0.645 11.929 C 0.827 11.997,0.892 12.000,2.000 12.000 C 3.108 12.000,3.173 11.997,3.355 11.929 C 3.479 11.882,3.601 11.802,3.702 11.702 C 4.184 11.219,4.052 10.411,3.441 10.110 L 3.250 10.017 2.050 10.009 C 0.965 10.001,0.834 10.006,0.678 10.061 M6.678 10.062 C 6.369 10.169,6.164 10.376,6.051 10.696 C 5.883 11.174,6.159 11.747,6.645 11.929 L 6.836 12.000 13.000 12.000 L 19.164 12.000 19.355 11.929 C 19.479 11.882,19.601 11.802,19.702 11.702 C 20.184 11.219,20.052 10.411,19.441 10.110 L 19.250 10.017 13.050 10.009 C 7.166 10.002,6.841 10.005,6.678 10.062" fill="currentColor" fill-rule="evenodd"/></svg></button>
              <button type="button" data-view="grid" aria-pressed="true" aria-label="Grid"><svg viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M0.808 0.041 C 0.621 0.092,0.407 0.221,0.317 0.340 C 0.166 0.538,0.109 0.715,0.109 0.990 C 0.109 1.334,0.186 1.530,0.399 1.732 C 0.675 1.993,0.690 1.995,2.100 1.995 C 3.217 1.995,3.328 1.990,3.479 1.938 C 3.706 1.859,3.938 1.636,4.024 1.414 C 4.098 1.221,4.113 0.898,4.056 0.703 C 3.967 0.399,3.643 0.100,3.329 0.033 C 3.109 -0.015,0.988 -0.008,0.808 0.041 M6.808 0.041 C 6.621 0.092,6.407 0.221,6.317 0.340 C 6.166 0.538,6.109 0.715,6.109 0.990 C 6.109 1.334,6.186 1.530,6.399 1.732 C 6.675 1.993,6.690 1.995,8.100 1.995 C 9.217 1.995,9.328 1.990,9.479 1.938 C 9.706 1.859,9.938 1.636,10.024 1.414 C 10.098 1.221,10.113 0.898,10.056 0.703 C 9.967 0.399,9.643 0.100,9.329 0.033 C 9.109 -0.015,6.988 -0.008,6.808 0.041 M12.808 0.041 C 12.621 0.092,12.407 0.221,12.317 0.340 C 12.166 0.538,12.109 0.715,12.109 0.990 C 12.109 1.334,12.186 1.530,12.399 1.732 C 12.675 1.993,12.690 1.995,14.100 1.995 C 15.217 1.995,15.328 1.990,15.479 1.938 C 15.706 1.859,15.938 1.636,16.024 1.414 C 16.100 1.219,16.115 0.870,16.056 0.670 C 15.964 0.359,15.682 0.102,15.355 0.032 C 15.138 -0.015,12.986 -0.007,12.808 0.041 M0.730 5.065 C 0.458 5.160,0.258 5.353,0.162 5.612 C 0.092 5.800,0.093 6.182,0.163 6.387 C 0.239 6.612,0.467 6.841,0.699 6.926 C 0.865 6.987,0.922 6.990,2.100 6.990 C 3.261 6.990,3.337 6.987,3.491 6.929 C 3.868 6.788,4.089 6.452,4.093 6.014 C 4.095 5.801,4.084 5.751,3.996 5.573 C 3.889 5.355,3.739 5.206,3.514 5.094 C 3.376 5.026,3.363 5.025,2.130 5.018 C 0.995 5.011,0.871 5.015,0.730 5.065 M6.730 5.065 C 6.458 5.160,6.258 5.353,6.162 5.612 C 6.092 5.800,6.093 6.182,6.163 6.387 C 6.239 6.612,6.467 6.841,6.699 6.926 C 6.865 6.987,6.922 6.990,8.100 6.990 C 9.261 6.990,9.337 6.987,9.491 6.929 C 9.868 6.788,10.089 6.452,10.093 6.014 C 10.095 5.801,10.084 5.751,9.996 5.573 C 9.889 5.355,9.739 5.206,9.514 5.094 C 9.376 5.026,9.363 5.025,8.130 5.018 C 6.995 5.011,6.871 5.015,6.730 5.065 M12.726 5.066 C 12.207 5.248,11.969 5.819,12.169 6.403 C 12.241 6.613,12.474 6.844,12.699 6.926 C 12.865 6.987,12.922 6.990,14.100 6.990 C 15.261 6.990,15.337 6.987,15.491 6.929 C 15.868 6.788,16.089 6.452,16.093 6.014 C 16.095 5.801,16.084 5.751,15.996 5.573 C 15.889 5.355,15.739 5.206,15.514 5.094 C 15.376 5.026,15.363 5.025,14.130 5.018 C 12.985 5.011,12.872 5.015,12.726 5.066 M0.909 10.019 C 0.576 10.070,0.291 10.291,0.174 10.589 C 0.125 10.713,0.109 10.820,0.108 11.016 C 0.108 11.254,0.116 11.293,0.211 11.480 C 0.336 11.723,0.525 11.881,0.779 11.952 C 1.028 12.022,3.169 12.023,3.418 11.953 C 3.769 11.855,4.009 11.582,4.081 11.201 C 4.168 10.740,3.950 10.317,3.516 10.103 L 3.316 10.005 2.191 10.000 C 1.572 9.997,0.995 10.006,0.909 10.019 M6.909 10.019 C 6.576 10.070,6.291 10.291,6.174 10.589 C 6.125 10.713,6.109 10.820,6.108 11.016 C 6.108 11.254,6.116 11.293,6.211 11.480 C 6.336 11.723,6.525 11.881,6.779 11.952 C 7.028 12.022,9.169 12.023,9.418 11.953 C 9.769 11.855,10.009 11.582,10.081 11.201 C 10.168 10.740,9.950 10.317,9.516 10.103 L 9.316 10.005 8.191 10.000 C 7.572 9.997,6.995 10.006,6.909 10.019 M12.909 10.019 C 12.576 10.070,12.291 10.291,12.174 10.589 C 12.125 10.713,12.109 10.820,12.108 11.016 C 12.108 11.254,12.116 11.293,12.211 11.480 C 12.336 11.723,12.525 11.881,12.779 11.952 C 13.028 12.022,15.169 12.023,15.418 11.953 C 15.769 11.855,16.009 11.582,16.081 11.201 C 16.168 10.740,15.950 10.317,15.516 10.103 L 15.316 10.005 14.191 10.000 C 13.572 9.997,12.995 10.006,12.909 10.019" fill="currentColor" fill-rule="evenodd"/></svg></button>
            </div>
            <label class="pr-order"><span class="pr-order__label">Order</span>
              <select class="pr-order__select">
                <option value="price-asc">Lowest Price</option>
                <option value="price-desc">Highest Price</option>
                <option value="year-asc">Oldest Year</option>
                <option value="year-desc">Newest Year</option>
                <option value="miles-asc">Lowest Mileage</option>
                <option value="miles-desc">Highest Mileage</option>
                <option value="listed-desc" selected>Newest Listed</option>
              </select>
            </label>
          </div>
        </div>
        <div class="pr-chips" hidden></div>
        <ul class="pr-srp__grid">
${CARS.map(c => card(c)).join('\n')}
        </ul>
        <div class="pr-empty" hidden>
          <p>No vehicles match these filters.</p>
          <button type="button" class="btn btn--outline-dark" data-clear>Clear all</button>
        </div>
      </div>
    </div>
    <p class="pr-disclaimer">${DISCLAIMER}</p>
  </div>
{{POPUPS}}
</main>`;

/* ── VDP — ferrarifl.com's order (a held title bar, the photo mosaic,
   price and actions, the records, the tabs, more cars, the dealer) in
   cauleyferrari.com's language (Overview, its tabs, Inquire) ─────────── */
const bullet = /^[•–-]\s*/;
const paras = t => t.split(/\n\s*\n+/).map(b => {
  const lines = b.split('\n').map(l => l.trim()).filter(Boolean);
  const item = l => bullet.test(l);
  const list = ls => `<ul class="pr-desc__list">${ls.map(l => `<li>${esc(l.replace(bullet, ''))}</li>`).join('')}</ul>`;
  if (lines.length > 1 && lines.every(item)) return list(lines);
  if (lines.length > 1 && lines.slice(1).every(item)) return `<p>${esc(lines[0])}</p>${list(lines.slice(1))}`;
  return `<p>${lines.map(esc).join('<br>')}</p>`;
}).join('\n        ');
const rec = (k, v) => `<div><dt>${k}</dt><dd>${v}</dd></div>`;
const related = c => CARS.filter(x => x !== c)
  .sort((a, b) => (modelOf(b) === modelOf(c)) - (modelOf(a) === modelOf(c)) || Math.abs((a.price || 0) - (c.price || 0)) - Math.abs((b.price || 0) - (c.price || 0)))
  .slice(0, 3);

const vdp = c => {
  const ph = shots(c), price = money(c.price);
  const n = ph.length;
  const thumbs = [2, 3, 4].filter(i => i < n);
  const eq = Object.entries(c.equipment || {});
  const longArrow = flip => `<svg viewBox="0 0 54 16" aria-hidden="true"${flip ? ' style="transform:scaleX(-1)"' : ''}><path d="M0 8h52M45 1l7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.2"/></svg>`;
  return `<main id="main" class="pr-inv pr-vdp">
  <!-- the top — thecollectionferrari.com's VDP: the car's first photograph,
       blurred, behind the header and the gallery under their gradient;
       Back to stock; two large frames, three small and View more; then the
       name, year and miles, VIN and stock, and the price with the actions -->
  <section class="pr-vdp__top" aria-labelledby="vdp-h">
    <div class="pr-vdp__bg" aria-hidden="true"><img src="${pic(c, 1, 640)}" alt=""></div>
    <div class="pr-shell pr-vdp__top-in">
      <a class="pr-vdp__back" href="pre-owned.html"><svg aria-hidden="true" style="transform:scaleX(-1)"><use href="#chev"/></svg>Back to stock</a>
      <div class="pr-gal${n === 1 ? ' pr-gal--one' : ''}" data-photos="${ph.map(p => pic(c, p.n, 1600)).join(' ')}" data-thumbs="${ph.map(p => pic(c, p.n, 640)).join(' ')}">
        ${n === 1
          ? `<button type="button" class="pr-gal__one" data-shot="0"><img src="${pic(c, 1, 1600)}" width="1600" height="1067" alt="${esc(titleOf(c))}"></button>`
          : `<button type="button" class="pr-gal__a" data-shot="0"><img src="${pic(c, 1, 1600)}" width="1600" height="1067" alt="${esc(titleOf(c))}, photo 1 of ${n}"></button>
        <button type="button" class="pr-gal__b" data-shot="1"><img src="${pic(c, 2, 1600)}" width="1600" height="1067" alt="Photo 2 of ${n}"></button>
        <div class="pr-gal__side">
          ${thumbs.map(i => `<button type="button" data-shot="${i}"><img src="${pic(c, i + 1, 640)}" width="640" height="427" alt="Photo ${i + 1} of ${n}"></button>`).join('\n          ')}
          <button type="button" class="btn btn--ghost pr-gal__more" data-shot="0" data-view="grid">View more ${chev}</button>
        </div>`}
      </div>
      <div class="pr-vdp__head">
        <div class="pr-vdp__name">
          <h1 id="vdp-h">${esc(titleOf(c))}</h1>
          <p class="pr-vdp__meta"><span>${c.year}</span><span>${miles(c.mileage)}</span>${c.certified ? '<span>Ferrari Approved</span>' : ''}${c.one_owner ? '<span>One owner</span>' : ''}</p>
          <p class="pr-vdp__ids"><span>VIN# <b>${c.vin}</b></span><span>Stock#: <b>${c.stock}</b></span></p>
        </div>
        <div class="pr-vdp__deal">
          <p class="pr-vdp__price">${price || tbc('Price')}</p>
          <div class="pr-vdp__cta">
            <button type="button" class="btn btn--ghost" data-pop="pr-lead" data-intent="testdrive" ${leadData(c)}>Schedule test drive</button>
            <button type="button" class="btn btn--ghost" data-pop="pr-lead" data-intent="inquire" ${leadData(c)}>Inquire</button>
          </div>
        </div>
      </div>
      <div class="pr-vdp__tools">
        <button type="button" data-pop="pr-sms" data-car="${esc(titleOf(c))}"><img src="img/icons/icon-chat.svg" width="16" height="16" alt="">Text to Phone</button>
        <button type="button" data-pop="pr-share" data-car="${esc(titleOf(c))}"><img src="img/icons/icon-share.svg" width="16" height="16" alt="">Share</button>
        <button type="button" data-save="${c.stock}" aria-pressed="false"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12v18l-6-4.5L6 21z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>Save</button>
        <button type="button" data-print><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V3h10v6M7 17H4V9h16v8h-3M7 14h10v7H7z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>Print</button>
      </div>
    </div>
  </section>

  <div class="pr-shell">
    <section class="pr-vdp__overview" aria-labelledby="ov-h">
      <h2 class="pr-vdp__h2" id="ov-h">Overview</h2>
      <dl class="pr-records">
        ${rec('Exterior color', esc(c.exterior))}
        ${rec('Interior color', esc(c.interior))}
        ${rec('Odometer', miles(c.mileage))}
        ${rec('Engine', esc(c.engine))}
        ${rec('Transmission', esc(c.transmission))}
        ${rec('Fuel economy', c.mpg ? `${c.mpg} MPG` : tbc('Figure'))}
        ${rec('Doors', c.doors || tbc('Figure'))}
        ${rec('Seats', c.seats || tbc('Figure'))}
      </dl>
    </section>

    <section class="pr-tabs" aria-label="Vehicle details">
      <div class="pr-tabs__list" role="tablist">
        <button type="button" role="tab" id="t-desc" aria-controls="p-desc" aria-selected="true">Dealer description</button>
        ${eq.length ? '<button type="button" role="tab" id="t-eq" aria-controls="p-eq" aria-selected="false" tabindex="-1">Standard equipment</button>' : ''}
        <button type="button" role="tab" id="t-tech" aria-controls="p-tech" aria-selected="false" tabindex="-1">Technical details</button>
      </div>
      <div class="pr-tabs__panel pr-desc" role="tabpanel" id="p-desc" aria-labelledby="t-desc">
        ${c.description ? paras(c.description) : `<p>${tbc('Dealer description')}</p>`}
      </div>
      ${eq.length ? `<div class="pr-tabs__panel" role="tabpanel" id="p-eq" aria-labelledby="t-eq" hidden>
        ${eq.map(([g, items]) => `<h3 class="pr-eq__h">${esc(g)}</h3><ul class="pr-eq">${items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>`).join('\n        ')}
      </div>` : ''}
      <div class="pr-tabs__panel" role="tabpanel" id="p-tech" aria-labelledby="t-tech" hidden>
        <dl class="pr-records pr-records--table">
          ${rec('Year', c.year)}${rec('Make', 'Ferrari')}${rec('Model', esc(modelOf(c)))}${rec('Trim', esc(c.trim))}
          ${rec('VIN', c.vin)}${rec('Stock #', c.stock)}${rec('Mileage', miles(c.mileage))}${rec('Engine', esc(c.engine))}
          ${rec('Transmission', esc(c.transmission))}${rec('Fuel economy', c.mpg ? `${c.mpg} MPG` : tbc('Figure'))}${rec('Doors', c.doors || tbc('Figure'))}${rec('Seats', c.seats || tbc('Figure'))}
        </dl>
      </div>
    </section>
  </div>

  ${c.certified ? `<section class="pr-vdp__approved" aria-labelledby="fa-h">
    <div class="pr-shell pr-vdp__approved-in">
      <div>
        <p class="pr-pretitle">Ferrari Approved</p>
        <h2 class="pr-h2" id="fa-h">Certified Pre-Owned Program</h2>
        <p class="pr-body">Ferrari Approved is a pre-owned certification program designed to help provide maximum security and peace of mind to owners purchasing Ferraris registered within the last 14 years.</p>
        <a class="pr-link pr-link--after" href="ferrari-approved.html"><span>Discover the program</span><span class="pr-jumbo pr-jumbo--40">${ring40}${chev}</span></a>
      </div>
      <dl class="pr-vdp__figures">
        <div><dt>Points inspected</dt><dd>101</dd></div>
        <div><dt>Minimum coverage</dt><dd>24 <span>months</span></dd></div>
        <div><dt>Roadside assistance</dt><dd>24 <span>months</span></dd></div>
      </dl>
    </div>
  </section>` : ''}

  <section class="pr-related" aria-labelledby="rel-h">
    <div class="pr-shell">
      <p class="marker"><span>2</span><span class="marker__rule"></span><span id="rel-h">Other vehicles you may like</span></p>
      <ul class="pr-related__grid">
${related(c).map(x => card(x)).join('\n')}
      </ul>
      <div class="pr-center"><a class="btn btn--outline-dark" href="pre-owned.html">View all</a></div>
    </div>
  </section>

  <section class="pr-dealer" aria-labelledby="dl-h">
    <div class="pr-shell pr-dealer__in">
      <div>
        <h2 class="pr-h2" id="dl-h">Ferrari of Puerto Rico</h2>
        <p class="pr-body">JF Kennedy Ave. Marginal Calle John Erndt<br>San Juan, PR 00920</p>
        <p class="pr-body"><a href="tel:+17872969996">787-296-9996</a></p>
        <a class="btn btn--ghost" href="https://www.google.com/maps/dir/?api=1&amp;destination=18.421542,-66.095417" target="_blank" rel="noopener">Get directions ${chev}</a>
      </div>
      <dl class="pr-hours">
        <div><dt>Sales</dt><dd>Monday – Saturday, 9:00am – 6:00pm<br>Sunday, closed</dd></div>
        <div><dt>Service &amp; Parts</dt><dd>Monday – Friday, 8:00am – 5:00pm</dd></div>
      </dl>
    </div>
  </section>
  <div class="pr-shell"><p class="pr-disclaimer">${DISCLAIMER}</p></div>

  <!-- the full-screen gallery — ferrariofnewengland.com's: #181818;
       Close (a ring and the word) top left, one-photo / grid top right
       (ferrarifl.com's toggle: Font Awesome 4.7 square-o and th, 20 px); the
       photo at full height; long arrows at the foot, 64 in; the dots between
       them. Grid: four across, a click opens that photo. -->
  <div class="pr-lightbox" hidden role="dialog" aria-modal="true" aria-label="Photos of the ${esc(titleOf(c))}">
    <div class="pr-lightbox__head">
      <button type="button" class="pr-lightbox__close" data-lb-close><span class="pr-lightbox__ring"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13" stroke="currentColor" stroke-width="1.4"/></svg></span><span>Close</span></button>
      <div class="pr-lightbox__views" role="group" aria-label="View">
        <button type="button" data-lb-view="single" aria-pressed="true" aria-label="One photo"><svg viewBox="0 0 1408 1792" aria-hidden="true"><path transform="matrix(1 0 0 -1 0 1536)" fill="currentColor" d="M1120 1280h-832q-66 0 -113 -47t-47 -113v-832q0 -66 47 -113t113 -47h832q66 0 113 47t47 113v832q0 66 -47 113t-113 47zM1408 1120v-832q0 -119 -84.5 -203.5t-203.5 -84.5h-832q-119 0 -203.5 84.5t-84.5 203.5v832q0 119 84.5 203.5t203.5 84.5h832 q119 0 203.5 -84.5t84.5 -203.5z"/></svg></button>
        <button type="button" data-lb-view="grid" aria-pressed="false" aria-label="All photos"><svg viewBox="0 0 1792 1792" aria-hidden="true"><path transform="matrix(1 0 0 -1 0 1536)" fill="currentColor" d="M512 288v-192q0 -40 -28 -68t-68 -28h-320q-40 0 -68 28t-28 68v192q0 40 28 68t68 28h320q40 0 68 -28t28 -68zM512 800v-192q0 -40 -28 -68t-68 -28h-320q-40 0 -68 28t-28 68v192q0 40 28 68t68 28h320q40 0 68 -28t28 -68zM1152 288v-192q0 -40 -28 -68t-68 -28h-320 q-40 0 -68 28t-28 68v192q0 40 28 68t68 28h320q40 0 68 -28t28 -68zM512 1312v-192q0 -40 -28 -68t-68 -28h-320q-40 0 -68 28t-28 68v192q0 40 28 68t68 28h320q40 0 68 -28t28 -68zM1152 800v-192q0 -40 -28 -68t-68 -28h-320q-40 0 -68 28t-28 68v192q0 40 28 68t68 28 h320q40 0 68 -28t28 -68zM1792 288v-192q0 -40 -28 -68t-68 -28h-320q-40 0 -68 28t-28 68v192q0 40 28 68t68 28h320q40 0 68 -28t28 -68zM1152 1312v-192q0 -40 -28 -68t-68 -28h-320q-40 0 -68 28t-28 68v192q0 40 28 68t68 28h320q40 0 68 -28t28 -68zM1792 800v-192 q0 -40 -28 -68t-68 -28h-320q-40 0 -68 28t-28 68v192q0 40 28 68t68 28h320q40 0 68 -28t28 -68zM1792 1312v-192q0 -40 -28 -68t-68 -28h-320q-40 0 -68 28t-28 68v192q0 40 28 68t68 28h320q40 0 68 -28t28 -68z"/></svg></button>
      </div>
    </div>
    <div class="pr-lightbox__stage"><img class="pr-lightbox__img" src="" alt=""></div>
    <ul class="pr-lightbox__grid" hidden></ul>
    <div class="pr-lightbox__nav">
      <button type="button" class="pr-lightbox__prev" data-lb="-1" aria-label="Previous photo">${longArrow(true)}</button>
      <div class="pr-lightbox__dots" aria-hidden="true"></div>
      <p class="pr-lightbox__count" aria-live="polite"><span>1</span> / ${n}</p>
      <button type="button" class="pr-lightbox__next" data-lb="1" aria-label="Next photo">${longArrow(false)}</button>
    </div>
  </div>
{{POPUPS}}
</main>`;
};

/* Our Team — Cauley's /our-team/ page, with this dealer's own portraits
   (STAFF IMAGES/2026). Names, positions, phones and e-mails are copied from
   the dealer's current site (ferraripuertorico.com/meet-our-staff/, read
   22 Oct 2026), in its order; accents as the portrait files spell them.
   Anything not supplied renders as "… to be confirmed". `y` is where the 3:2
   card window sits on each 4:5 portrait (object-position). */
const STAFF = [
  { slug: '',                            y: 50, name: 'Peter Tocci',                 role: 'Sales Manager',                         tel: '+1 (787) 665-3865', email: 'peter.tocci@ferraripuertorico.com' },
  { slug: 'mia-karina-rodriguez-imbert', y: 56, name: 'Mia Karina Rodríguez Imbert', role: 'Experience Manager, Marketing Manager',  tel: '+1 (787) 665-3864', email: 'mia.rodriguez@ferraripuertorico.com' },
  { slug: 'naomi-negron',                y: 64, name: 'Naomi Negron',                role: 'Service Manager, Spare Parts Manager',  tel: '+1 (787) 665-3866', email: 'naomi.negron@ferraripuertorico.com' },
  { slug: 'alexandra-martinez',          y: 30, name: 'Alexandra Martinez',          role: 'After Sales Ambassador, Service Advisor', tel: '+1 (787) 665-3867', email: 'alexandra.martinez@ferraripuertorico.com' },
  { slug: 'jose-a-vera',                 y: 42, name: 'Jose A Vera',                 role: 'Warranty Manager',                      tel: '+1 (787) 665-3862', email: 'jose.vera@ferraripuertorico.com' },
  { slug: 'chaffiel-diaz',               y: 32, name: 'Chaffiel Díaz',               role: 'Master Technician',                     tel: '+1 (787) 296-9996', email: 'chaffiel.diaz@ferraripuertorico.com' },
  { slug: 'juan-lizardi-velez',          y: 38, name: 'Juan Carlos Lizardi Vélez',   role: 'Master Technician',                     tel: '+1 (787) 665-3867', email: 'juan.lizardi@ferraripuertorico.com' },
  { slug: '',                            y: 50, name: 'Alondra Figueroa',            role: 'Receptionist',                          tel: '+1 (787) 296-9996', email: 'ea@ferraripuertorico.com' },
];
const digits = t => t.replace(/[^\d+]/g, '');
const member = m => `      <li class="pr-member">
        <div class="pr-member__img">${m.slug
          ? `<img src="img/team/${m.slug}-900.webp" width="900" height="1125" loading="lazy" alt="${m.name}" style="object-position: 50% ${m.y}%">`
          : `<span class="pr-member__nophoto">${tbc('Photo')}</span>`}</div>
        <h2 class="pr-member__name">${m.name || tbc('Name')}</h2>
        <p class="pr-member__role">${m.role || tbc('Position')}</p>
        <div class="pr-member__info">
          <p>${m.tel ? `<a href="tel:${digits(m.tel)}">${m.tel}</a>` : tbc('Phone')}</p>
          <p>${m.email ? `<a href="mailto:${m.email}">${m.email}</a>` : tbc('Email')}</p>
        </div>
      </li>`;

const INV_CSS = '<link rel="stylesheet" href="css/inventory.css">\n';
const POP_JS = '<script src="js/pop.js" defer></script>\n<script src="js/inventory.js" defer></script>\n';
const popups = () => read('_popups.html');

const PAGES = [
  {
    out: 'index.html',
    TITLE: 'Ferrari of Puerto Rico — Official Ferrari Dealer, San Juan',
    DESC: 'Ferrari of Puerto Rico, official Ferrari dealer in San Juan: the 2026 range, Ferrari Approved pre-owned, genuine service and ownership.',
    PRELOAD: '<link rel="preload" href="img/home/hero-night-1920.webp" as="image" imagesrcset="img/home/hero-night-800.webp 800w, img/home/hero-night-1280.webp 1280w, img/home/hero-night-1920.webp 1920w" imagesizes="100vw">\n',
    PAGE_CSS: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11.1.14/swiper-bundle.min.css">\n<link rel="stylesheet" href="css/home.css">\n' + INV_CSS,
    PAGE_JS: '<script src="https://cdn.jsdelivr.net/npm/swiper@11.1.14/swiper-bundle.min.js" defer></script>\n<script src="js/home.js" defer></script>\n' + POP_JS,
    main: () => read('_home.html')
      .replace('{{LINEUP}}', MODELS.map(tile).join('\n'))
      .replace('{{CPO_CARDS}}', CARS.map(c => card(c, ' swiper-slide')).join('\n'))
      .replace('{{POPUPS}}', popups()),
  },
  {
    out: 'our-team.html',
    TITLE: 'Our Team — Ferrari of Puerto Rico',
    DESC: 'Meet the team at Ferrari of Puerto Rico, official Ferrari dealer in San Juan.',
    PRELOAD: '', PAGE_CSS: '<link rel="stylesheet" href="css/team.css">\n', PAGE_JS: '',
    main: () => read('_team.html').replace('{{STAFF}}', STAFF.map(member).join('\n')),
  },
  {
    /* Ferrari Approved — the page built for Cauley (FERRARI_PROJECTS /
       Ferrari_Approved), Ferrari's content, on this dealer's chrome */
    out: 'ferrari-approved.html',
    TITLE: 'Ferrari Approved Program — Ferrari of Puerto Rico',
    DESC: 'Ferrari Approved, the certified pre-owned program performed exclusively by Ferrari technicians: inspection, provenance, preparation, warranty and roadside assistance. At Ferrari of Puerto Rico.',
    PRELOAD: '<link rel="preload" href="img/approved/hero-1920.webp" as="image" imagesrcset="img/approved/hero-800.webp 800w, img/approved/hero-1280.webp 1280w, img/approved/hero-1920.webp 1920w" imagesizes="100vw">\n',
    PAGE_CSS: '<link rel="stylesheet" href="css/approved.css">\n',
    PAGE_JS: '<script src="js/approved.js" defer></script>\n',
    main: () => read('_approved.html'),
  },
  {
    out: 'pre-owned.html',
    TITLE: 'Pre-Owned Ferrari Inventory — Ferrari of Puerto Rico',
    DESC: `Ferrari Approved and pre-owned Ferrari for sale at Ferrari of Puerto Rico, San Juan — ${CARS.length} vehicles in stock.`,
    PRELOAD: '', PAGE_CSS: INV_CSS, PAGE_JS: POP_JS,
    main: () => srp().replace('{{POPUPS}}', popups()),
  },
  ...CARS.map(c => ({
    out: hrefOf(c),
    TITLE: `${c.certified ? 'Certified ' : 'Pre-Owned '}${titleOf(c)}${c.price ? ' — ' + money(c.price) : ''} | Ferrari of Puerto Rico`,
    DESC: `${titleOf(c)}, ${miles(c.mileage)}, ${c.exterior} over ${c.interior}. Stock ${c.stock}, VIN ${c.vin}. At Ferrari of Puerto Rico, San Juan.`,
    PRELOAD: `<link rel="preload" href="${pic(c, 1, 1600)}" as="image">\n`,
    PAGE_CSS: INV_CSS, PAGE_JS: POP_JS,
    main: () => vdp(c).replace('{{POPUPS}}', popups()),
  })),
];

/* a car that has left the stock takes its page with it */
const live = new Set(PAGES.map(p => p.out));
for (const f of readdirSync('.')) if (/^pre-owned-.+\.html$/.test(f) && !live.has(f)) unlinkSync(f);

for (const p of PAGES) {
  const fill = h => h.replace(/\{\{(TITLE|DESC|PRELOAD|PAGE_CSS|PAGE_JS)\}\}/g, (_, k) => p[k]);
  const page = [
    fill(read('_head.html')), read('_header-pr.html'), read('_mobilemenu-pr.html'),
    p.main(), read('_footer-pr.html'), fill(read('_tail.html')),
  ].join('\n');
  writeFileSync(p.out, bust(page));
  console.log(`${p.out.padEnd(48)} ${page.split('\n').length} lines`);
}
