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
          <span class="pr-model__img"><img src="img/lineup-live/${slug}.webp" width="462" height="462" loading="lazy" alt="Ferrari ${name}"></span>
          <span class="pr-model__name">${name}</span>
        </a>
        <button type="button" class="pr-model__td" data-pop="pr-lead" data-intent="testdrive" data-car="Ferrari ${name}" data-spec="2026 range" data-img="img/lineup-live/${slug}.webp">Schedule test drive ${chev}</button>
      </li>`;

/* the dealer's details and hours — the client's confirmed wording (Oct 2026);
   on every vehicle page and on the pages that send people to the dealer */
const DEALER = `  <section class="pr-dealer" aria-labelledby="dl-h">
    <div class="pr-shell pr-dealer__in">
      <div>
        <h2 class="pr-h2" id="dl-h">Ferrari Puerto Rico</h2>
        <p class="pr-body"><span>John F. Kennedy Ave,</span> <span>Cll John Alberto Ernot</span><br>San Juan, 00920, Puerto Rico</p>
        <p class="pr-body"><a href="tel:+17872969996">787-296-9996</a></p>
        <a class="btn btn--ghost" href="https://www.google.com/maps/dir/?api=1&amp;destination=18.4217456,-66.096962" target="_blank" rel="noopener">Get directions ${chev}</a>
      </div>
      <dl class="pr-hours">
        <div><dt>Sales Hours</dt><dd>Monday to Saturday, 9:00am to 6:00pm<br>Sunday, Closed</dd></div>
        <div><dt>Service &amp; Parts Hours</dt><dd>Monday to Friday, 8:00am to 5:00pm<br>Saturday and Sunday, Closed</dd></div>
      </dl>
    </div>
  </section>`;

/* ── the dealer's stock ─────────────────────────────────────────────── */
const INV = JSON.parse(read('data/inventory.json'));
/* the stock's own copy writes the dealer's number several ways; one format, also after a re-scrape */
const CARS = INV.cars.map(c => ({ ...c, description: (c.description || '').replace(/(\+?1[ .-]*)?\(?787\)?[ .-]*296[ .-]*9996/g, '787-296-9996') }));
/* three listings carry only the source's "Photos coming soon" frames
   (checked by eye, 22 Oct 2026): show the one with the horse, once */
const soon = c => c.photo_count <= 6;
/* the first half of each car's photographs, for a lighter page */
const shots = c => soon(c) ? c.photos.slice(0, 1) : c.photos.slice(0, Math.ceil(c.photos.length / 2));
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
          <!-- primary and secondary (4 Nov meeting): Inquire in red, as on
               the stock cards; the test drive beside it in outline -->
          <div class="pr-vdp__cta">
            <button type="button" class="btn btn--primary" data-pop="pr-lead" data-intent="inquire" ${leadData(c)}>Inquire</button>
            <button type="button" class="btn btn--ghost" data-pop="pr-lead" data-intent="testdrive" ${leadData(c)}>Schedule test drive</button>
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

${DEALER}
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
  { slug: '',                            y: 50, name: 'Peter Tocci',                 role: 'Sales Manager',                         tel: '787-665-3865', email: 'peter.tocci@ferraripuertorico.com' },
  { slug: 'mia-karina-rodriguez-imbert', y: 56, name: 'Mia Karina Rodríguez Imbert', role: 'Experience Manager, Marketing Manager',  tel: '787-665-3864', email: 'mia.rodriguez@ferraripuertorico.com' },
  { slug: 'naomi-negron',                y: 64, name: 'Naomi Negron',                role: 'Service Manager, Spare Parts Manager',  tel: '787-665-3866', email: 'naomi.negron@ferraripuertorico.com' },
  { slug: 'alexandra-martinez',          y: 30, name: 'Alexandra Martinez',          role: 'After Sales Ambassador, Service Advisor', tel: '787-665-3867', email: 'alexandra.martinez@ferraripuertorico.com' },
  { slug: 'jose-a-vera',                 y: 42, name: 'Jose A Vera',                 role: 'Warranty Manager',                      tel: '787-665-3862', email: 'jose.vera@ferraripuertorico.com' },
  { slug: 'chaffiel-diaz',               y: 32, name: 'Chaffiel Díaz',               role: 'Master Technician',                     tel: '787-296-9996', email: 'chaffiel.diaz@ferraripuertorico.com' },
  { slug: 'juan-lizardi-velez',          y: 38, name: 'Juan Carlos Lizardi Vélez',   role: 'Master Technician',                     tel: '787-665-3867', email: 'juan.lizardi@ferraripuertorico.com' },
  { slug: '',                            y: 50, name: 'Alondra Figueroa',            role: 'Receptionist',                          tel: '787-296-9996', email: 'ea@ferraripuertorico.com' },
];
const digits = t => t.replace(/[^\d+]/g, '');
const member = m => `      <li class="pr-member">
        <div class="pr-member__img">${m.slug
          ? `<img src="img/team/${m.slug}-900.webp" width="900" height="1125" loading="lazy" alt="${m.name}" style="object-position: 50% ${m.y}%">`
          : `<span class="pr-member__nophoto">${tbc('Photo')}</span>`}</div>
        <h2 class="pr-member__name">${m.name || tbc('Name')}</h2>
        <p class="pr-member__role">${m.role || tbc('Position')}</p>
        <div class="pr-member__info">
          <p>${m.tel ? `<a href="tel:+1${digits(m.tel).slice(-10)}">${m.tel}</a>` : tbc('Phone')}</p>
          <p>${m.email ? `<a href="mailto:${m.email}">${m.email}</a>` : tbc('Email')}</p>
        </div>
      </li>`;

/* ── Ferrari's own news, on the dealer's site — as Cauley's /news/ runs it.
   Photograph, date, category, title and Ferrari's summary as published on
   ferrari.com (read 22 Oct 2026); the article text arrives with Ferrari's
   news feed and shows as still to be supplied. `src` stays for the record. */
const NEWS = [
  { slug: "austin-livery", date: "21 Oct 2026", cat: "Scuderia",
    title: "Scuderia Ferrari HP unveils special Austin livery revealing the path from concept to competition",
    summary: "For the United States Grand Prix in Austin, Scuderia Ferrari HP will race with a special livery on the two SF-26s of Charles Leclerc and Lewis Hamilton, celebrating the creative and engineering process that transforms an idea into a Formula 1 car.",
    src: "https://www.ferrari.com/en-US/formula1/articles/united-states-grand-prix-2026-livery" },
  { slug: "austin-cover-art", date: "21 Oct 2026", cat: "Scuderia",
    title: "United States Grand Prix 2026 by Margherita Caspani",
    summary: "Cover Art by Margherita Caspani",
    src: "https://www.ferrari.com/en-US/formula1/articles/united-states-grand-prix-2026-cover-art" },
  { slug: "austin-preview", date: "21 Oct 2026", cat: "Scuderia",
    title: "American triple-header kicks off in Austin",
    summary: "Following on from two races in Asia, the Formula 1 World Championship moves on to the Americas and the United States Grand Prix, held at the Circuit of The Americas in Austin, Texas.",
    src: "https://www.ferrari.com/en-US/formula1/articles/united-states-grand-prix-2026-preview" },
  { slug: "new-manual-era", date: "21 Oct 2026", cat: "Magazine",
    title: "A New Manual Era",
    summary: "The Ferrari manual gear shift returns with the 12Cilindri Manuale, combining a classic open-gate interface with innovative Manuale By-Wire technology.",
    src: "https://www.ferrari.com/en-US/magazine/articles/ferrari-12cilindri-manuale-new-manual-era" },
  { slug: "550-bloodline", date: "20 Oct 2026", cat: "Magazine",
    title: "The 550 Maranello Bloodline",
    summary: "Thirty years after the 550 Maranello revived Ferrari’s front-engined V12 flagship, trace the remarkable naturally aspirated bloodline that continues through to today’s 12Cilindri.",
    src: "https://www.ferrari.com/en-US/magazine/articles/ferrari-550-maranello-v12-bloodline" },
  { slug: "barcelona-comments", date: "14 Oct 2026", cat: "6 Hours of Barcelona",
    title: "Comments ahead of 6 Hours of Barcelona",
    summary: "The 499P cars head to the Circuit de Barcelona-Catalunya for the seventh and penultimate round of the season.",
    src: "https://www.ferrari.com/en-US/hypercar/articles/fia-wec-6h-barcelona-2026-pre-race-comments" },
];
const newsHref = n => `news-${n.slug}.html`;
/* the post card — Ferrari's news and the dealer's blog alike */
const postCard = (p, cls = '') => `        <li class="pr-post${cls}">
          <a class="pr-post__img" href="${p.href}" tabindex="-1" aria-hidden="true"><img src="${p.img}" width="860" height="484" loading="lazy" alt=""></a>
          <p class="pr-record pr-record--red"><span>${esc(p.date)}</span><span class="pr-record__rule"></span><span>${esc(p.cat)}</span></p>
          <div class="pr-post__copy">
            <h3 data-reveal-words>${esc(p.title)}</h3>
            <p>${esc(p.summary)}</p>
          </div>
          <div class="pr-post__links">
            <a class="pr-link pr-link--dark" href="${p.href}" aria-label="${p.more || 'Read more'}: ${esc(p.title)}"><span class="pr-jumbo pr-jumbo--40">${ring40}${chev}</span><span>${p.more || 'read more'}</span></a>
          </div>
        </li>`;
const newsCard = (n, cls = '') => postCard({ ...n, href: newsHref(n), img: `img/news/${n.slug}.webp` }, cls);

/* ── the dealer's own blog, from its own photographs (EVENT IMAGES, AMALFI
   EVENT). Dates are the cameras' (EXIF); titles from the folder names; the
   write-ups are the dealer's to supply. `photos` are the 800px sizes, in
   order, for the frames' proportions. ─────────────────────────────────── */
const BLOG = [
  { slug: 'amalfi-evening', date: '28 Aug 2026', cat: 'Events',
    title: 'The Ferrari Amalfi evening',
    summary: 'Photographs from the Ferrari Amalfi evening at Ferrari Puerto Rico, San Juan.',
    photos: [[533, 800], [533, 800], [571, 800], [533, 800], [571, 800], [571, 800], [571, 800], [571, 800], [571, 800], [533, 800], [533, 800], [571, 800]] },
  { slug: 'coffee-event', date: '1 Aug 2026', cat: 'Events',
    title: 'Ferrari Coffee Event',
    summary: 'Photographs from the Ferrari Coffee Event at Ferrari Puerto Rico, San Juan.',
    photos: [[533, 800], [533, 800], [533, 800], [533, 800], [533, 800], [533, 800], [533, 800], [533, 800], [533, 800], [533, 800], [533, 800], [533, 800]] },
];
const blogHref = p => `blog-${p.slug}.html`;
const blogCard = (p, cls = '') => postCard({ ...p, href: blogHref(p), img: `img/blog/${p.slug}/cover-860.webp` }, cls);

/* ── the photo albums: the same two events, more of each (img/gallery) ── */
const GALLERY = [
  { slug: 'amalfi-evening', photos: [[700, 467], [467, 700], [467, 700], [500, 700], [467, 700], [500, 700], [500, 700], [467, 700], [467, 700], [467, 700], [500, 700], [500, 700]] },
  { slug: 'coffee-event', photos: [[700, 467], [467, 700], [467, 700], [467, 700], [467, 700], [467, 700], [467, 700], [467, 700], [467, 700], [467, 700], [467, 700], [467, 700]] },
].map(a => ({ ...BLOG.find(p => p.slug === a.slug), ...a }));
const albumHref = a => `gallery-${a.slug}.html`;
const albumCard = a => postCard({ ...a, cat: 'Photo album', href: albumHref(a), img: `img/blog/${a.slug}/cover-860.webp`,
  summary: `${a.photos.length} photographs`, more: 'view album' });
/* a grid of photographs that open full screen (js/gallery.js) */
const photoGrid = (dir, photos, title, big) => `      <ul class="pr-photos__grid" data-lightbox>
${photos.map(([w, h], i) => {
  const n = String(i + 1).padStart(2, '0'), small = big === 1400 ? 700 : 800;
  return `        <li><button type="button" class="pr-photos__open" data-full="${dir}/${n}-${big}.webp" aria-label="Open photograph ${i + 1} of ${photos.length}"><img src="${dir}/${n}-${small}.webp" width="${w}" height="${h}" loading="lazy" alt="${esc(title)}, photograph ${i + 1} of ${photos.length}"></button></li>`;
}).join('\n')}
      </ul>`;

/* ── the site's sections — the client's sitemap (FROM CLIENT/FPR_Sitemap-1.png).
 One list feeds the header, the mobile menu and the footer; a page that is
   not built yet points to "#", and 'model' marks the entries the footer leaves out. ─────────────────────────────────────────── */
const NAV = [
  ['New Model Range', '#', [
    ['Current Range', '#'], ['Amalfi', '#', 'model'], ['Amalfi Spider', '#', 'model'], ['849 Testarossa', '#', 'model'],
    ['849 Testarossa Spider', '#', 'model'], ['12Cilindri', '#', 'model'], ['12Cilindri Spider', '#', 'model'], ['Purosangue', '#', 'model'],
    ['Luce', '#', 'model'], ['296 GTB', '#', 'model'], ['296 GTS', '#', 'model'], ['Configure Your Ferrari', '#'], ['Schedule a Demo Drive', 'demo-drive.html'],
  ]],
  ['Pre-Owned', 'pre-owned.html', [
    ['Pre-Owned Inventory', 'pre-owned.html'], ['Ferrari Approved Inventory', 'pre-owned.html'],
    ['Ferrari Approved Program', 'ferrari-approved.html'], ['Sell or Consign Your Ferrari', 'sell-or-consign.html'],
    ['How Consignment Works', 'sell-or-consign.html#how'], ['Value Your Ferrari', 'sell-or-consign.html#value'], ['Recently Sold', 'sell-or-consign.html#sold'],
  ]],
  ['Service', '#', [
    ['Schedule Service', '#'], ['Ferrari Warranty & Power', 'warranty-and-power.html'], ['Ferrari Classiche', '#'],
    ['Roadside Assistance', '#'], ['Parts & Accessories', '#'],
  ]],
  ['Financing', '#', [['Finance Center', '#'], ['Apply for Financing', '#']]],
  ['Motorsports', '#', [
    ['Ferrari Corso Pilota', 'corso-pilota.html'], ['Ferrari Challenge', 'ferrari-challenge.html'], ['Club Competizioni GT', 'club-competizioni-gt.html'],
    /* extra: the Club's own car, not in the client's sitemap */
    ['296 GT Modificata', '296-gt-modificata.html'],
    ['Ferrari Club Challenge', 'club-challenge.html'], ['XX Programme', 'xx-programme.html'], ['Our Racing Pedigree', 'racing-pedigree.html'],
  ]],
  ['Owners', '#', [
    ['Owner Resources', '#'], ["Owner’s Manuals", 'owners-manuals.html'], ['Hybrid Recharge Guide', 'hybrid-recharge-guide.html'],
    ['Personalization', '#'], ['My Ferrari App', '#'],
  ]],
  ['About Us', '#', [['Our Story', '#'], ['Our Team', 'our-team.html'], ['Contact Us', '#']]],
  ['Events & Media', '#', [
    /* Event Recaps is the blog the client asked for (blog.html) */
    ['Event Schedule', 'event-schedule.html'], ['Event Recaps (Blog)', 'blog.html'], ['Gallery', 'gallery.html'],
    /* extra, not in the client's sitemap: Ferrari's own news (feeds the home page block) */
    ['News & Events', 'news.html'],
  ]],
];
const navLink = ([label, href]) => `<a href="${href}">${esc(label)}</a>`;
const NAV_MENU = `<ul class="header__menu">
${NAV.map(([label, href, sub]) => `          <li class="has-children">
            ${navLink([label, href])}
            <ul class="sub-menu">
${sub.map(s => `              <li>${navLink(s)}</li>`).join('\n')}
            </ul>
          </li>`).join('\n')}
        </ul>`;
const NAV_MOBILE = NAV.map(n => `    ${navLink(n)}`).join('\n');
/* the footer lists each section's pages, not every model: those stay in the
   header and on Current Range */
const NAV_FOOTER = `<nav class="pr-footer__map" aria-label="Site map">
${NAV.map(([label, , sub]) => `      <div>
        <p class="pr-footer__h">${esc(label)}</p>
        <ul>${sub.filter(s => s[2] !== 'model').map(s => `<li>${navLink(s)}</li>`).join('')}</ul>
      </div>`).join('\n')}
    </nav>`;
const chromePart = f => read(f)
  .replace('{{NAV_MENU}}', NAV_MENU).replace('{{NAV_MOBILE}}', NAV_MOBILE).replace('{{NAV_FOOTER}}', NAV_FOOTER);

/* the gallery: the albums as cards, then video */
const galleryroom = () => `<main id="main" class="pr-newsroom pr-light">
  <div class="pr-shell">
    <p class="marker"><span>1</span><span class="marker__rule"></span><span>Gallery</span></p>
    <h1 class="pr-h2 pr-h2--ink">Photo albums</h1>
    <ul class="pr-newsroom__grid">
${GALLERY.map(albumCard).join('\n')}
    </ul>
    <section class="pr-room__more" aria-labelledby="video-h">
      <p class="marker"><span>2</span><span class="marker__rule"></span><span id="video-h">Video</span></p>
      <p class="pr-room__empty">${tbc('Videos from Ferrari Puerto Rico')}</p>
    </section>
  </div>
</main>`;

/* an album: its heading, every photograph, the story it belongs to */
const album = a => `<main id="main" class="pr-newsroom pr-light">
  <div class="pr-shell">
    <a class="pr-vdp__back pr-vdp__back--ink" href="gallery.html"><svg aria-hidden="true" style="transform:scaleX(-1)"><use href="#chev"/></svg>Back to the gallery</a>
    <p class="pr-record pr-record--red"><span>${esc(a.date)}</span><span class="pr-record__rule"></span><span>${a.photos.length} photographs</span></p>
    <h1 class="pr-h2 pr-h2--ink">${esc(a.title)}</h1>
    <p class="pr-room__lead"><a class="pr-link pr-link--dark" href="${blogHref(a)}"><span class="pr-jumbo pr-jumbo--40">${ring40}${chev}</span><span>read the story</span></a></p>
    <section class="pr-photos" aria-label="Photographs">
${photoGrid(`img/gallery/${a.slug}`, a.photos, a.title, 1400)}
    </section>
  </div>
</main>`;

/* ── news and blog articles, as ferrari.com/magazine lays them out: the
   story frame the full width of the screen — photograph, category, title,
   standfirst — then one centred reading column, then the photographs in a
   full-width reel. ─────────────────────────────────────────────────────── */
const back = href => `<a class="pr-link pr-link--dark pr-back" href="${href}"><span class="pr-jumbo pr-jumbo--40">${ring40}<svg aria-hidden="true" style="transform:scaleX(-1)"><use href="#chev"/></svg></span><span>Back</span></a>`;
const story = (p, tag = 'h2', more = true) => `  <section class="pr-story">
    <picture class="pr-story__img"><img src="${p.big}" alt="" ${tag === 'h1' ? 'fetchpriority="high"' : 'loading="lazy"'}></picture>
    <div class="pr-story__copy">
      <p class="pr-story__cat">${esc(p.cat)}</p>
      <${tag} class="pr-story__title">${esc(p.title)}</${tag}>
      <p class="pr-story__lead">${esc(p.summary)}</p>
${more ? `      <a class="pr-link pr-link--after pr-story__more" href="${p.href}" aria-label="Read more: ${esc(p.title)}"><span>Read more</span><span class="pr-jumbo pr-jumbo--40">${ring40}${chev}</span></a>` : ''}
    </div>
  </section>`;
const reel = (dir, photos, title, big) => `  <section class="pr-reel" aria-label="Photographs" data-lightbox>
    <ul class="pr-reel__track">
${photos.map(([w, h], i) => {
  const n = String(i + 1).padStart(2, '0'), small = big === 1400 ? 700 : 800;
  return `      <li><button type="button" class="pr-photos__open" data-full="${dir}/${n}-${big}.webp" aria-label="Open photograph ${i + 1} of ${photos.length}"><img src="${dir}/${n}-${small}.webp" srcset="${dir}/${n}-${small}.webp ${small}w, ${dir}/${n}-${big}.webp ${big}w" sizes="60vh" width="${w}" height="${h}" loading="lazy" alt="${esc(title)}, photograph ${i + 1} of ${photos.length}"></button></li>`;
}).join('\n')}
    </ul>
    <button type="button" class="pr-reel__step pr-reel__step--prev" aria-label="Previous photographs"><svg aria-hidden="true" style="transform:scaleX(-1)"><use href="#chev"/></svg></button>
    <button type="button" class="pr-reel__step pr-reel__step--next" aria-label="Next photographs"><svg aria-hidden="true"><use href="#chev"/></svg></button>
  </section>`;
/* an article, as ferrari.com/news sets one: back; date and category, the
   title in capitals, in the reading column; the photograph the width of
   the page, not the screen; then the text in the same column */
const readPage = (p, { backHref, by, body, after = '', ctas }) => `<main id="main" class="pr-read">
  <div class="pr-read__back">${back(backHref)}</div>
  <header class="pr-read__head">
    <p class="pr-record pr-record--red"><span>${esc(p.date)}</span><span class="pr-record__rule"></span><span>${esc(p.cat)}</span></p>
    <h1 class="pr-read__title">${esc(p.title)}</h1>
  </header>
  <figure class="pr-read__hero"><img src="${p.big}" alt="" fetchpriority="high"></figure>
  <div class="pr-read__body">
    <p class="pr-read__by">${by}</p>
    <p class="pr-read__lead">${esc(p.summary)}</p>
${body}
  </div>
${after}
  <div class="pr-read__cta">${ctas}</div>
</main>`
const newsStory = n => ({ ...n, href: newsHref(n), big: `img/news/${n.slug}.jpg` });
const blogStory = p => ({ ...p, href: blogHref(p), big: `img/blog/${p.slug}/cover-1600.webp` });
/* a listing, as ferrari.com/news under the site's own heading (the marker
   and title of the stock list): the two latest side
   by side (two thirds and one third) with the title on the photograph,
   then the rest three across — photograph, date and category, title */
const listTile = (p, cls) => `      <li class="${cls}">
        <a class="pr-tile" href="${p.href}">
          <span class="pr-tile__img"><img src="${p.big}" alt="" loading="lazy"></span>
          <span class="pr-tile__copy">
            <span class="pr-record"><span>${esc(p.date)}</span><span class="pr-record__rule"></span><span>${esc(p.cat)}</span></span>
            <span class="pr-tile__title">${esc(p.title)}</span>
          </span>
        </a>
      </li>`;
const listing = (items, label, title) => `<main id="main" class="pr-list">
  <div class="pr-shell">
    <p class="marker"><span>1</span><span class="marker__rule"></span><span>${esc(label)}</span></p>
    <h1 class="pr-list__h">${esc(title)}</h1>
    <ul class="pr-list__lead">
${items.slice(0, 2).map(p => listTile(p, 'pr-list__big')).join('\n')}
    </ul>
${items.length > 2 ? `    <ul class="pr-list__grid">
${items.slice(2).map(p => listTile(p, 'pr-list__card')).join('\n')}
    </ul>` : ''}
  </div>
</main>`;
const newsroom = () => listing(NEWS.map(newsStory), 'News & Events', 'The latest from Ferrari');
const blogroom = () => listing(BLOG.map(blogStory), 'Event Recaps', 'Life at Ferrari Puerto Rico');
const article = n => readPage(newsStory(n), {
  backHref: 'news.html',
  by: `${esc(n.date)} / Source: Ferrari S.p.A.`,
  body: `    <p>${tbc('Article text from Ferrari’s news feed')}</p>`,
  ctas: `<a class="btn btn--outline-dark btn--auto" href="news.html">All news &amp; events</a>`,
});
const blogPost = p => readPage(blogStory(p), {
  backHref: 'blog.html',
  by: `${esc(p.date)} / Ferrari Puerto Rico`,
  body: `    <p>${tbc('Write-up from Ferrari Puerto Rico')}</p>`,
  /* the whole album under the text, no further click (js/gallery.js opens
     each photograph full screen) */
  after: `  <section class="pr-shell pr-photos" aria-label="Photographs">
${photoGrid(`img/gallery/${p.slug}`, GALLERY.find(a => a.slug === p.slug).photos, p.title, 1400)}
  </section>`,
  ctas: `<a class="btn btn--outline-dark btn--auto" href="blog.html">More event recaps</a>`,
});

const INV_CSS = '<link rel="stylesheet" href="css/inventory.css">\n<link rel="stylesheet" href="css/form.css">\n';
const POP_JS = '<script src="js/pop.js" defer></script>\n<script src="js/inventory.js" defer></script>\n';
const popups = () => read('_popups.html');

/* ── Schedule a Demo Drive — the client's sitemap, New Model Range. The car
   first, then the day: the ten models of the range as one choice (radios,
   so it works without script), then the form beside a dark panel that keeps
   the chosen car in view — the dark band the Inquire drawer opens with.
   Dates follow the dealer's confirmed sales hours (closed on Sunday). ── */
const pick = ([slug, name]) => `        <li><label class="pr-pick">
          <input type="radio" name="model" value="Ferrari ${name}" data-slug="${slug}" required>
          <span class="pr-pick__img"><img src="img/lineup-live/${slug}.webp" width="924" height="924" loading="lazy" alt=""></span>
          <span class="pr-pick__name">${name}</span>
        </label></li>`;
const drive = () => `<main id="main" class="pr-drive pr-light">
  <div class="pr-shell">
    <p class="marker"><span>1</span><span class="marker__rule"></span><span>Demo drive</span></p>
    <h1 class="pr-list__h pr-drive__h">Schedule a demo drive</h1>
    <p class="pr-drive__lead">Choose your Ferrari, then a day and a time. We will confirm your demo drive by phone or email.</p>
    <form class="pr-drive__form" id="pr-drive" novalidate>
      <fieldset class="pr-drive__models">
        <legend class="pr-drive__legend"><span class="pr-drive__n">Step 1</span>Choose your Ferrari</legend>
        <ul class="pr-picks">
${MODELS.map(pick).join('\n')}
        </ul>
        <p class="pr-drive__err" id="pr-drive-model-err" aria-live="polite"></p>
        <p class="pr-drive__used">Looking for a pre-owned Ferrari? Each car in our inventory has its own Schedule test drive button.
          <a class="pr-link pr-link--dark" href="pre-owned.html"><span class="pr-jumbo pr-jumbo--40">${ring40}${chev}</span><span>Browse pre-owned inventory</span></a></p>
      </fieldset>
      <div class="pr-drive__split">
        <aside class="pr-drive__car" aria-live="polite">
          <p class="pr-drive__label">Your demo drive</p>
          <span class="pr-drive__img"><img src="" width="924" height="924" alt="" hidden></span>
          <p class="pr-drive__model">Choose a model</p>
          <p class="pr-drive__where">Ferrari Puerto Rico, San Juan<br>Sales: Monday to Saturday, 9:00am to 6:00pm</p>
        </aside>
        <fieldset class="pr-drive__you">
          <legend class="pr-drive__legend"><span class="pr-drive__n">Step 2</span>Your details</legend>
          <div class="pr-drive__fields">
          <p class="pr-drive__req">*Required fields</p>
          <div class="pr-lead__pair">
            <div class="pr-field"><input type="text" id="dd-fname" name="fname" autocomplete="given-name" placeholder=" " required><label for="dd-fname">First Name*</label></div>
            <div class="pr-field"><input type="text" id="dd-lname" name="lname" autocomplete="family-name" placeholder=" " required><label for="dd-lname">Last Name*</label></div>
          </div>
          <div class="pr-lead__pair">
            <div class="pr-field"><input type="email" id="dd-email" name="email" autocomplete="email" placeholder=" " required><label for="dd-email">Email*</label></div>
            <div class="pr-field"><input type="tel" id="dd-phone" name="phone" autocomplete="tel" placeholder=" " required><label for="dd-phone">Phone*</label></div>
          </div>
          <div class="pr-lead__pair">
            <div class="pr-field pr-field--fixed"><input type="date" id="dd-date" name="date" required aria-describedby="dd-date-err"><label for="dd-date">Preferred date*</label><span class="pr-drive__err" id="dd-date-err" aria-live="polite"></span></div>
            <div class="pr-field pr-field--fixed pr-field--select"><select id="dd-time" name="time" required>
              <option value="" disabled selected hidden></option>
              <option>Morning, 9:00am to 12:00pm</option>
              <option>Afternoon, 12:00pm to 6:00pm</option>
            </select><label for="dd-time">Preferred time*</label></div>
          </div>
          <div class="pr-field"><textarea id="dd-msg" name="message" placeholder=" "></textarea><label for="dd-msg">Message</label></div>
          <label class="pr-check"><input type="checkbox" name="i_agree" value="1"><span>Please note that by completing this form, you agree to being contacted via text, phone and email.</span></label>
          <div class="pr-drawer__actions">
            <button class="btn btn--primary btn--auto" type="submit">Request demo drive <svg class="btn__chev" aria-hidden="true"><use href="#chev"/></svg></button>
          </div>
          <p class="pr-pop__sent" aria-live="polite"></p>
          </div>
        </fieldset>
      </div>
    </form>
  </div>
</main>
${DEALER}`;

/* ── Sell or Consign Your Ferrari — the client's sitemap, Pre-Owned: one
   page, his three children as its chapters (#how · #value · #sold), the way
   Ferrari Approved carries What / Why / How.
   Patterns, not inventions (research 17 Nov 2026):
   · the intro line is Ferrari's own, from preowned.ferrari.com Value your car;
   · how consignment works = numbered steps (ferrarifl.com's six), set as the
     Approved page's hairline list; consign first, an outright purchase as the
     alternative — no dealer publishes fees, nor do we;
   · the valuation form = Ferrari's fields (model, year, VIN, mileage mi/km,
     notes; then the contact), on the demo-drive page's two steps;
   · recently sold = SOLD cards with the price hidden (Cauley, Quebec) — no
     sold list exists yet, so the chapter says so.
   The consignment copy is a draft until the dealer confirms its process. ── */
const CONSIGN_STEPS = ['Tell us about your Ferrari', 'Market valuation', 'Inspection and preparation',
  'Photography and marketing', 'Viewings and negotiation', 'Sale and payout'];
const SOLD_SAMPLE = ['FC168269', 'FC329737', 'FC263540'];
const soldCard = c => `        <li class="pr-car pr-car--sold">
          <div class="pr-car__media">
            <span class="pr-car__photo"><img src="${pic(c, 1, 640)}" width="640" height="427" loading="lazy" alt="${esc(titleOf(c))}"></span>
            <p class="pr-car__badges"><span class="pr-badge pr-badge--red">Sold</span></p>
          </div>
          <div class="pr-car__body">
            <div class="pr-car__eyebrow"><span>${c.year}</span><span>${miles(c.mileage)}</span></div>
            <h3 class="pr-car__name">${esc(nameOf(c))}</h3>
            <div class="pr-car__price"><span>Sold</span></div>
            <dl class="pr-car__colours">
              <div><dt>Exterior Colour</dt><dd>${esc(c.exterior)}</dd></div>
              <div><dt>Interior colour</dt><dd>${esc(c.interior)}</dd></div>
            </dl>
          </div>
        </li>`;
/* the Value your Ferrari form — cauleyferrari.com /value-your-trade/'s
   lists as that form has them (Year 2027–1920, its Make list, its states),
   Puerto Rico added to State; field helpers on the site's .pr-field */
const V_YEARS = Array.from({ length: 108 }, (_, i) => String(2027 - i));
const V_MAKES = ['ACURA','ALFA ROMEO','AM GENERAL','AMC','AMERICAN MOTORS','ASTON MARTIN','AUBURN','AUSTIN','AUSTIN HEALEY','AUDI','AVANTI','A.C.','BENTLEY','BMC','BMW','BUELL','BUICK','BUCKBOARD','CADILLAC','CHEVROLET','CHRYSLER','CORD','CROSLEY','CUSHMAN','DAEWOO','DAIHATSU','DELOREAN','DETOMASO','DODGE','DUCATI','DUESENBERG','EAGLE','EDSEL','ESSEX','EXCALIBUR','FERRARI','FIAT','FIRESTONE','FORD','GEO','GMC','HARLEY-DAVIDSON','HOLLYWOOD','HOLLYWOOD+PROP','HONDA','HUMMER','HYUNDAI','INTERNATIONAL','INFINITI','ISUZU','JAGUAR','JEEP','JENSEN','JENSEN HEALEY','JOHN','KARMA','KAWASAKI','KENT','KIA','KIT CARS','LAMBORGHINI','LAND ROVER','LA SALLE','LEXUS','LINCOLN','LOTUS','MASERATI','MAYBACH','MAZDA','MAXWELL','MCLAREN','MERCEDES-BENZ','MERCURY','MERKUR','MINI','MITSUBISHI','MORGAN','MG','MGA','MGB','NISSAN','OLDSMOBILE','OTHER','PANOZ','PACKARD','PATHFINDER','PEUGEOT','PONTIAC','PORSCHE','PLYMOUTH','QVALE','RENAULT','ROLLS-ROYCE','SAAB','SALEEN','SATURN','SCHWIN','SCION','SMART','STERLING','STUDEBAKER','SUBARU','SUZUKI','TESLA','TEXACO','TOYOTA','TRIUMPH','ULTRA','VOLKSWAGEN','VOLVO','WHIPPET','WOOD','YAMAHA','YUGO','ZIMMER'];
const V_STATES = ['Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut','Delaware','District of Columbia','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey','New Mexico','New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Puerto Rico','Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont','Virgin Islands','Virginia','Washington','West Virginia','Wisconsin','Wyoming'];
/* a select as theirs: the label is the first option, in ink, no floating label */
const vsel = (id, name, label, opts, span, req = false, pick = '') => `<div class="pr-field pr-vform__c${span}"><select id="${id}" name="${name}" aria-label="${label.replace('*', '')}"${req ? ' required' : ''}>
            <option value=""${pick ? '' : ' selected'}>${label}</option>${opts.map(o => `<option${o === pick ? ' selected' : ''}>${o}</option>`).join('')}
          </select></div>`;
const vin = (id, name, label, span, req = false, attrs = '', type = 'text') => `<div class="pr-field pr-vform__c${span}"><input type="${type}" id="${id}" name="${name}" placeholder=" "${attrs ? ' ' + attrs : ''}${req ? ' required' : ''}><label for="${id}">${label}</label></div>`;

const sell = () => {
  return `<main id="main" class="pr-sell">

<!-- the site's one hero (Ferrari Approved's fa-hero, unchanged): full
     screen, the lockup low left. The frame is chosen for it — the car whole,
     right of centre, below the header; dark hedge and lawn on the left for
     the type. Ferrari's own after-sales editorial (ferrari.com after-sales
     home 2024, cdn.ferrari.com 66fe6b4c…), used nowhere else on the site. -->
<section class="fa-hero pr-sell__hero" aria-labelledby="sell-title">
  <picture class="fa-hero__bg">
    <img src="img/sell/hero-296-1920.webp"
         srcset="img/sell/hero-296-800.webp 800w, img/sell/hero-296-1280.webp 1280w, img/sell/hero-296-1920.webp 1920w"
         sizes="100vw" width="1920" height="1254" alt="A red Ferrari 296 GTB on the lawn in front of a red-brick building" fetchpriority="high">
  </picture>
  <div class="fa-hero__scrim" aria-hidden="true"></div>
  <div class="fa-shell fa-hero__body">
    <p class="fa-hero__pretitle">Pre-owned</p>
    <h1 class="fa-hero__title" id="sell-title">Sell or consign your Ferrari</h1>
    <div class="actions">
      <a class="btn btn--primary" href="#value">Value your Ferrari</a>
      <a class="btn btn--ghost" href="#how">How consignment works <svg class="btn__chev" aria-hidden="true"><use href="#chev"/></svg></a>
    </div>
  </div>
</section>

<section class="pr-sell__how" id="how" aria-labelledby="how-h">
  <div class="pr-shell">
    <p class="marker"><span>1</span><span class="marker__rule"></span><span id="how-h">How consignment works</span></p>
    <div class="pr-sell__how-in">
      <div class="pr-sell__how-copy">
        <h2 class="pr-h2">We present and sell your Ferrari on your behalf</h2>
        <p class="pr-sell__body">From the first valuation to the payout, Ferrari Puerto Rico takes care of the sale. If you would rather not wait for the right buyer, ask us about selling it to us outright.</p>
        <p class="pr-sell__note">${tbc('Consignment process and terms: a draft —')}</p>
        <a class="btn btn--primary btn--auto" href="#value" data-intent="Consign my Ferrari">Consign your Ferrari <svg class="btn__chev" aria-hidden="true"><use href="#chev"/></svg></a>
      </div>
      <ol class="pr-steps">
${CONSIGN_STEPS.map(t => `        <li>${esc(t)}</li>`).join('\n')}
      </ol>
    </div>
  </div>
</section>

<!-- 2 · Value your Ferrari: cauleyferrari.com /value-your-trade/ reproduced —
     its five boxed blocks (Trade-in Vehicle Info, Upload Supporting Documents,
     Contact Information, Vehicle Notes, Desired Vehicle Info), its fields,
     its order, its stars, its 12-column rows; Submit outside the blocks at
     the right. Two additions for this page: "I would like to" (the hero's
     Consign / Sell links preset it) and Puerto Rico in State, chosen. -->
<section class="pr-light pr-formsec pr-sell__value" id="value" aria-labelledby="value-h">
  <div class="pr-shell">
    <p class="marker"><span>2</span><span class="marker__rule"></span><span>Valuation</span></p>
    <div class="pr-formsec__head">
      <h2 class="pr-formsec__title" id="value-h">Value your Ferrari</h2>
      <p class="pr-formsec__text">Our Maranello-trained specialists will provide an expert appraisal to ensure you get the best value for your Ferrari.</p>
    </div>
    <form class="pr-vform" id="pr-sell" novalidate>
      <div class="pr-vform__sec">
        <h3 class="pr-vform__h">Trade-in Vehicle Info</h3>
        <div class="pr-vform__grid">
          ${vsel('sv-intent', 'intent', 'I would like to*', ['Consign my Ferrari', 'Sell my Ferrari', 'Know its value'], 6, true)}
          <span class="pr-vform__break" aria-hidden="true"></span>
          ${vsel('sv-year', 'year', 'Year*', V_YEARS, 3, true)}
          ${vsel('sv-make', 'make', 'Make*', V_MAKES, 3, true, 'FERRARI')}
          ${vin('sv-model', 'model', 'Model*', 3, true)}
          <span class="pr-vform__break" aria-hidden="true"></span>
          ${vin('sv-trim', 'trim', 'Trim', 6)}
          ${vsel('sv-body', 'body', 'Body Style', ['2 Door', '4 Door', 'Hatchback'], 3)}
          <span class="pr-vform__break" aria-hidden="true"></span>
          ${vin('sv-vin', 'vin', 'VIN', 6, false, 'maxlength="17" autocapitalize="characters"')}
          <span class="pr-vform__break" aria-hidden="true"></span>
          ${vin('sv-ext', 'ext_color', 'Exterior Color', 3)}
          ${vin('sv-int', 'int_color', 'Interior Color', 3)}
          <span class="pr-vform__break" aria-hidden="true"></span>
          ${vin('sv-cyl', 'cylinders', 'Cylinders', 3, false, 'inputmode="numeric"')}
          ${vin('sv-litres', 'litrs', 'Liters', 3, false, 'inputmode="decimal"')}
          <span class="pr-vform__break" aria-hidden="true"></span>
          ${vin('sv-miles', 'mileage', 'Mileage', 3, false, 'inputmode="numeric"')}
          ${vsel('sv-trans', 'trans', 'Transmission', ['Automatic', 'Manual'], 3)}
          <span class="pr-vform__break" aria-hidden="true"></span>
          ${vin('sv-lien', 'lienholder', 'Lien Holder', 6)}
          ${vin('sv-payoff', 'estimatepayoff', 'Estimated Payoff', 3, false, 'inputmode="decimal"')}
        </div>
      </div>

      <div class="pr-vform__sec">
        <h3 class="pr-vform__h">Upload Supporting Documents</h3>
        <div class="pr-vup" data-max="12">
          <button type="button" class="btn pr-vup__pick">Click to Upload Images (up to 12)</button>
          <input class="pr-vup__file" type="file" name="uploader" accept="image/*" multiple hidden>
          <div class="pr-vup__drop" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path fill-rule="evenodd" clip-rule="evenodd" d="M7.0625 8.93404L.5 8.49671C.224 8.49671 0 8.2728 0 7.9969C0 7.72101.224 7.4971.5 7.4971L7.0625 7.05977L7.5.499806C7.5.223913 7.724 0 8 0C8.276 0 8.5.223913 8.5.499806L8.9375 7.05977L15.5 7.4971C15.776 7.4971 16 7.72101 16 7.9969C16 8.2728 15.776 8.49671 15.5 8.49671L8.9375 8.93404L8.5 15.494C8.5 15.7699 8.276 15.9938 8 15.9938C7.724 15.9938 7.5 15.7699 7.5 15.494L7.0625 8.93404Z" fill="#181818"/></svg>
            <span>Drag and Drop Here</span>
          </div>
          <button type="button" class="btn pr-vup__send" disabled>Upload <svg class="btn__chev" aria-hidden="true"><use href="#chev"/></svg></button>
          <ul class="pr-vup__list" aria-live="polite"></ul>
        </div>
      </div>

      <div class="pr-vform__sec">
        <h3 class="pr-vform__h">Contact Information</h3>
        <div class="pr-vform__grid">
          ${vin('sv-fname', 'fname', 'First Name*', 4, true, 'autocomplete="given-name"')}
          ${vin('sv-lname', 'lname', 'Last Name*', 4, true, 'autocomplete="family-name"')}
          <span class="pr-vform__break" aria-hidden="true"></span>
          ${vin('sv-address', 'address', 'Your Address', 4, false, 'autocomplete="street-address"')}
          ${vin('sv-city', 'city', 'City', 4, false, 'autocomplete="address-level2"')}
          <span class="pr-vform__break" aria-hidden="true"></span>
          ${vsel('sv-state', 'state', 'State*', V_STATES, 4, true, 'Puerto Rico')}
          ${vin('sv-zip', 'zip', 'Zip*', 4, true, 'inputmode="numeric" autocomplete="postal-code"')}
          <span class="pr-vform__break" aria-hidden="true"></span>
          ${vin('sv-email', 'email', 'Email*', 4, true, 'autocomplete="email"', 'email')}
          ${vin('sv-phone', 'phone', 'Phone*', 4, true, 'autocomplete="tel"', 'tel')}
        </div>
      </div>

      <div class="pr-vform__sec">
        <h3 class="pr-vform__h">Vehicle Notes</h3>
        <div class="pr-vform__grid">
          <div class="pr-field pr-vform__c9"><textarea id="sv-notes" name="message" placeholder=" " required></textarea><label for="sv-notes">Tell us More*</label></div>
        </div>
      </div>

      <div class="pr-vform__sec">
        <h3 class="pr-vform__h">Desired Vehicle Info</h3>
        <div class="pr-vform__grid">
          ${vsel('sv-yeari', 'yeari', 'Year', V_YEARS, 3)}
          ${vsel('sv-makei', 'makei', 'Make', V_MAKES, 3)}
          ${vin('sv-modeli', 'modeli', 'Model', 3)}
        </div>
        <label class="pr-check pr-vform__agree"><input type="checkbox" name="i_agree" value="1"><span>Please note that by completing this form, you agree to being contacted via text, phone and email.</span></label>
      </div>

      <div class="pr-vform__actions">
        <p class="pr-pop__sent" aria-live="polite"></p>
        <button class="btn btn--primary" type="submit">Submit <svg class="btn__chev" aria-hidden="true"><use href="#chev"/></svg></button>
      </div>
    </form>
  </div>
</section>

<section class="pr-sell__sold pr-light" id="sold" aria-labelledby="sold-h">
  <div class="pr-shell">
    <div class="pr-sell__sold-in">
      <div>
        <p class="marker"><span>3</span><span class="marker__rule"></span><span>Sold</span></p>
        <h2 class="pr-h2 pr-h2--ink pr-sell__sold-h" id="sold-h">Recently sold</h2>
      </div>
      <a class="pr-link pr-link--dark" href="pre-owned.html"><span class="pr-jumbo pr-jumbo--40">${ring40}${chev}</span><span>See the cars for sale</span></a>
    </div>
    <ul class="pr-sell__grid">
${SOLD_SAMPLE.map(st => soldCard(CARS.find(c => c.stock === st))).join('\n')}
    </ul>
  </div>
</section>

</main>
${DEALER}`;
};

const PAGES = [
  {
    out: 'index.html',
    TITLE: 'Ferrari of Puerto Rico — Official Ferrari Dealer, San Juan',
    DESC: 'Ferrari of Puerto Rico, official Ferrari dealer in San Juan: the 2026 range, Ferrari Approved pre-owned, genuine service and ownership.',
    PRELOAD: '<link rel="preload" href="img/home/hero-showroom-2000.webp" as="image" imagesrcset="img/home/hero-showroom-800.webp 800w, img/home/hero-showroom-1280.webp 1280w, img/home/hero-showroom-2000.webp 2000w" imagesizes="100vw" media="(min-width: 48.0625rem)">\n<link rel="preload" href="img/home/hero-showroom-m-800.webp" as="image" imagesrcset="img/home/hero-showroom-m-430.webp 430w, img/home/hero-showroom-m-800.webp 800w" imagesizes="100vw" media="(max-width: 48rem)">\n',
    PAGE_CSS: '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@11.1.14/swiper-bundle.min.css">\n<link rel="stylesheet" href="css/home.css">\n' + INV_CSS,
    PAGE_JS: '<script src="https://cdn.jsdelivr.net/npm/swiper@11.1.14/swiper-bundle.min.js" defer></script>\n<script src="js/home.js" defer></script>\n' + POP_JS,
    main: () => read('_home.html')
      .replace('{{LINEUP}}', MODELS.map(tile).join('\n'))
      .replace('{{CPO_CARDS}}', CARS.map(c => card(c, ' swiper-slide')).join('\n'))
      .replace('{{NEWS_CARDS}}', NEWS.map(n => newsCard(n, ' swiper-slide')).join('\n'))
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
    out: 'demo-drive.html',
    TITLE: 'Schedule a Demo Drive — Ferrari of Puerto Rico',
    DESC: 'Schedule a demo drive of a Ferrari from the 2026 range at Ferrari of Puerto Rico, official Ferrari dealer in San Juan.',
    PRELOAD: '', PAGE_CSS: INV_CSS + '<link rel="stylesheet" href="css/news.css">\n<link rel="stylesheet" href="css/drive.css">\n<link rel="stylesheet" href="css/dropdown.css">\n',
    PAGE_JS: '<script src="js/dropdown.js" defer></script>\n<script src="js/drive.js" defer></script>\n',
    main: drive,
  },
  {
    /* Ferrari Club Challenge — Passione Ferrari Club Challenge: Ferrari Québec's
       overview and cars, ferrari.com's programme (tools/pages/clubchallenge_page.py) */
    out: 'club-challenge.html',
    TITLE: 'Passione Ferrari Club Challenge — Ferrari of Puerto Rico',
    DESC: 'The Passione Ferrari Club Challenge for Ferrari Challenge car owners: dedicated driving slots, personal Ferrari instructors, telemetry analysis and hospitality, at Ferrari of Puerto Rico in San Juan.',
    PRELOAD: '<link rel="preload" href="img/clubchallenge/hero-1920.webp" as="image" imagesrcset="img/clubchallenge/hero-800.webp 800w, img/clubchallenge/hero-1280.webp 1280w, img/clubchallenge/hero-1920.webp 1920w, img/clubchallenge/hero-2560.webp 2560w" imagesizes="100vw">\n',
    PAGE_CSS: INV_CSS + '<link rel="stylesheet" href="css/approved.css">\n<link rel="stylesheet" href="css/home.css">\n<link rel="stylesheet" href="css/news.css">\n<link rel="stylesheet" href="css/drive.css">\n<link rel="stylesheet" href="css/sell.css">\n<link rel="stylesheet" href="css/dropdown.css">\n<link rel="stylesheet" href="css/warranty.css">\n<link rel="stylesheet" href="css/corso.css">\n<link rel="stylesheet" href="css/tabs.css">\n<link rel="stylesheet" href="css/chapnav.css">\n<link rel="stylesheet" href="css/ccgt.css">\n<link rel="stylesheet" href="css/clubchallenge.css">\n<link rel="stylesheet" href="css/motion.css">\n',
    PAGE_JS: '<script src="js/dropdown.js" defer></script>\n<script src="js/interest.js" defer></script>\n<script src="js/tabs.js" defer></script>\n<script src="js/chapnav.js" defer></script>\n<script src="js/motion.js" defer></script>\n',
    main: () => read('_clubchallenge.html') + '\n' + DEALER,
  },
  {
    /* Club Competizioni GT — ferrari.com's programme page module by module and
       its 2027 calendar article (tools/pages/ccgt_page.py); Ferrari's photographs */
    out: 'club-competizioni-gt.html',
    TITLE: 'Club Competizioni GT — Ferrari of Puerto Rico',
    DESC: 'Club Competizioni GT: Ferrari GT racing cars produced since 1989 on the world’s great circuits, the 2027 calendar, the eligible models and the International and US programmes, at Ferrari of Puerto Rico in San Juan.',
    PRELOAD: '<link rel="preload" href="img/ccgt/hero-1920.webp" as="image" imagesrcset="img/ccgt/hero-800.webp 800w, img/ccgt/hero-1280.webp 1280w, img/ccgt/hero-1920.webp 1920w" imagesizes="100vw" media="(min-aspect-ratio: 5/4)">\n',
    PAGE_CSS: INV_CSS + '<link rel="stylesheet" href="css/approved.css">\n<link rel="stylesheet" href="css/home.css">\n<link rel="stylesheet" href="css/news.css">\n<link rel="stylesheet" href="css/drive.css">\n<link rel="stylesheet" href="css/sell.css">\n<link rel="stylesheet" href="css/dropdown.css">\n<link rel="stylesheet" href="css/warranty.css">\n<link rel="stylesheet" href="css/corso.css">\n<link rel="stylesheet" href="css/chapnav.css">\n<link rel="stylesheet" href="css/ccgt.css">\n<link rel="stylesheet" href="css/motion.css">\n',
    PAGE_JS: '<script src="js/dropdown.js" defer></script>\n<script src="js/interest.js" defer></script>\n<script src="js/corso.js" defer></script>\n<script src="js/chapnav.js" defer></script>\n<script src="js/motion.js" defer></script>\n',
    main: () => read('_ccgt.html') + '\n' + DEALER,
  },
  {
    /* XX Programme — ferrari.com's programme page, its two car pages and two
       articles (the 2027 calendar, Road Atlanta), tools/pages/xx_page.py;
       Ferrari's photographs, tools/pages/xx_imgs.py */
    out: 'xx-programme.html',
    TITLE: 'XX Programme — Ferrari of Puerto Rico',
    DESC: 'The Ferrari XX Programme: FXX, FXX Evo, 599XX, 599XX Evo, FXX K and FXX-K Evo on track at private events, the 2027 calendar opening at The Thermal Club and Laguna Seca, at Ferrari of Puerto Rico in San Juan.',
    PRELOAD: '<link rel="preload" href="img/xx/hero-1920.webp" as="image" imagesrcset="img/xx/hero-800.webp 800w, img/xx/hero-1280.webp 1280w, img/xx/hero-1920.webp 1920w, img/xx/hero-2560.webp 2560w" imagesizes="100vw" media="(min-aspect-ratio: 1/1)">\n',
    PAGE_CSS: INV_CSS + '<link rel="stylesheet" href="css/approved.css">\n<link rel="stylesheet" href="css/home.css">\n<link rel="stylesheet" href="css/news.css">\n<link rel="stylesheet" href="css/drive.css">\n<link rel="stylesheet" href="css/sell.css">\n<link rel="stylesheet" href="css/dropdown.css">\n<link rel="stylesheet" href="css/warranty.css">\n<link rel="stylesheet" href="css/corso.css">\n<link rel="stylesheet" href="css/chapnav.css">\n<link rel="stylesheet" href="css/ccgt.css">\n<link rel="stylesheet" href="css/xx.css">\n<link rel="stylesheet" href="css/motion.css">\n',
    PAGE_JS: '<script src="js/dropdown.js" defer></script>\n<script src="js/interest.js" defer></script>\n<script src="js/gallery.js" defer></script>\n<script src="js/corso.js" defer></script>\n<script src="js/chapnav.js" defer></script>\n<script src="js/motion.js" defer></script>\n',
    main: () => read('_xx.html') + '\n' + DEALER,
  },
  {
    /* Our Racing Pedigree — DRAFT: Ronnie Vogel from public record only (Maxim 2019,
       ferrarifl.com 2019); tools/pages/pedigree_page.py */
    out: 'racing-pedigree.html',
    TITLE: 'Our Racing Pedigree — Ferrari of Puerto Rico',
    DESC: 'Ronnie Vogel and the championships won under his management, and every Ferrari racing programme for owners, at Ferrari of Puerto Rico in San Juan.',
    PRELOAD: '<link rel="preload" href="img/pedigree/hero-1920.webp" as="image" imagesrcset="img/pedigree/hero-800.webp 800w, img/pedigree/hero-1280.webp 1280w, img/pedigree/hero-1920.webp 1920w" imagesizes="100vw">\n',
    PAGE_CSS: INV_CSS + '<link rel="stylesheet" href="css/approved.css">\n<link rel="stylesheet" href="css/home.css">\n<link rel="stylesheet" href="css/news.css">\n<link rel="stylesheet" href="css/drive.css">\n<link rel="stylesheet" href="css/sell.css">\n<link rel="stylesheet" href="css/dropdown.css">\n<link rel="stylesheet" href="css/warranty.css">\n<link rel="stylesheet" href="css/corso.css">\n<link rel="stylesheet" href="css/chapnav.css">\n<link rel="stylesheet" href="css/ccgt.css">\n<link rel="stylesheet" href="css/pedigree.css">\n<link rel="stylesheet" href="css/motion.css">\n',
    PAGE_JS: '<script src="js/dropdown.js" defer></script>\n<script src="js/interest.js" defer></script>\n<script src="js/gallery.js" defer></script>\n<script src="js/corso.js" defer></script>\n<script src="js/chapnav.js" defer></script>\n<script src="js/motion.js" defer></script>\n',
    main: () => read('_pedigree.html') + '\n' + DEALER,
  },
  {
    /* Owner's Manuals — Ferrari's Smart Guides (ferrari.com/en-US/auto/smart-guide-ferrari)
       and a request form for earlier models, as Ferrari of Fort Lauderdale offers;
       tools/pages/owners_page.py, images tools/pages/owners_imgs.py */
    out: 'owners-manuals.html',
    TITLE: 'Owner’s Manuals — Ferrari of Puerto Rico',
    DESC: 'Ferrari’s interactive Smart Guides for the Roma, SF90, 296, Purosangue, SF90 XX and Amalfi, and the owner’s manual of an earlier Ferrari on request, at Ferrari of Puerto Rico in San Juan.',
    PRELOAD: '<link rel="preload" href="img/owners/hero-1920.webp" as="image" imagesrcset="img/owners/hero-800.webp 800w, img/owners/hero-1280.webp 1280w, img/owners/hero-1920.webp 1920w" imagesizes="100vw" media="(min-aspect-ratio: 5/4)">\n',
    PAGE_CSS: INV_CSS + '<link rel="stylesheet" href="css/approved.css">\n<link rel="stylesheet" href="css/home.css">\n<link rel="stylesheet" href="css/news.css">\n<link rel="stylesheet" href="css/drive.css">\n<link rel="stylesheet" href="css/sell.css">\n<link rel="stylesheet" href="css/dropdown.css">\n<link rel="stylesheet" href="css/warranty.css">\n<link rel="stylesheet" href="css/corso.css">\n<link rel="stylesheet" href="css/chapnav.css">\n<link rel="stylesheet" href="css/ccgt.css">\n<link rel="stylesheet" href="css/owners.css">\n<link rel="stylesheet" href="css/motion.css">\n',
    PAGE_JS: '<script src="js/interest.js" defer></script>\n<script src="js/chapnav.js" defer></script>\n<script src="js/motion.js" defer></script>\n',
    main: () => read('_owners.html') + '\n' + DEALER,
  },
  {
    /* Hybrid Recharge Guide — Ferrari of Fort Lauderdale's owner's guide (procedures)
       and Ferrari's own words and figures; tools/pages/hybrid_page.py, images
       tools/pages/hybrid_imgs.py */
    out: 'hybrid-recharge-guide.html',
    TITLE: 'Hybrid Recharge Guide — Ferrari of Puerto Rico',
    DESC: 'How to charge a Ferrari plug-in hybrid — 296, SF90, SF90 XX and 849 Testarossa: the steps, the indicator lights, home charging, Long Parking Mode and the eManettino, at Ferrari of Puerto Rico in San Juan.',
    PRELOAD: '<link rel="preload" href="img/hybrid/hero-1920.webp" as="image" imagesrcset="img/hybrid/hero-800.webp 800w, img/hybrid/hero-1280.webp 1280w, img/hybrid/hero-1920.webp 1920w" imagesizes="100vw" media="(min-aspect-ratio: 5/4)">\n',
    PAGE_CSS: INV_CSS + '<link rel="stylesheet" href="css/approved.css">\n<link rel="stylesheet" href="css/home.css">\n<link rel="stylesheet" href="css/news.css">\n<link rel="stylesheet" href="css/drive.css">\n<link rel="stylesheet" href="css/sell.css">\n<link rel="stylesheet" href="css/dropdown.css">\n<link rel="stylesheet" href="css/warranty.css">\n<link rel="stylesheet" href="css/corso.css">\n<link rel="stylesheet" href="css/chapnav.css">\n<link rel="stylesheet" href="css/ccgt.css">\n<link rel="stylesheet" href="css/hybrid.css">\n<link rel="stylesheet" href="css/motion.css">\n',
    PAGE_JS: '<script src="js/dropdown.js" defer></script>\n<script src="js/interest.js" defer></script>\n<script src="js/corso.js" defer></script>\n<script src="js/chapnav.js" defer></script>\n<script src="js/motion.js" defer></script>\n',
    main: () => read('_hybrid.html') + '\n' + DEALER,
  },
  {
    /* Event Schedule — Ferrari's 2027 programme calendars as one (Corso Pilota NA,
       Ferrari Challenge NA, Club Competizioni GT, XX Programme) and the dealer's own
       events kept as "Coming soon"; tools/pages/events_page.py, events_imgs.py */
    out: 'event-schedule.html',
    TITLE: 'Event Schedule — Ferrari of Puerto Rico',
    DESC: 'Every 2027 date in one calendar: Corso Pilota and Ferrari Challenge in North America, Club Competizioni GT and the XX Programme, at Ferrari of Puerto Rico in San Juan.',
    PRELOAD: '<link rel="preload" href="img/events/hero-1920.webp" as="image" imagesrcset="img/events/hero-800.webp 800w, img/events/hero-1280.webp 1280w, img/events/hero-1920.webp 1920w, img/events/hero-2560.webp 2560w" imagesizes="100vw" media="(min-aspect-ratio: 5/4)">\n',
    PAGE_CSS: INV_CSS + '<link rel="stylesheet" href="css/approved.css">\n<link rel="stylesheet" href="css/home.css">\n<link rel="stylesheet" href="css/news.css">\n<link rel="stylesheet" href="css/drive.css">\n<link rel="stylesheet" href="css/sell.css">\n<link rel="stylesheet" href="css/dropdown.css">\n<link rel="stylesheet" href="css/warranty.css">\n<link rel="stylesheet" href="css/corso.css">\n<link rel="stylesheet" href="css/chapnav.css">\n<link rel="stylesheet" href="css/ccgt.css">\n<link rel="stylesheet" href="css/events.css">\n<link rel="stylesheet" href="css/motion.css">\n',
    PAGE_JS: '<script src="js/dropdown.js" defer></script>\n<script src="js/interest.js" defer></script>\n<script src="js/corso.js" defer></script>\n<script src="js/chapnav.js" defer></script>\n<script src="js/motion.js" defer></script>\n',
    main: () => read('_events.html') + '\n' + DEALER,
  },
  {
    /* 296 GT Modificata — our Cauley page (cauleyferrari.com) ported by
       tools/pages/modificata_port.py: the acts 1:1 under the site's hero, then
       Ferrari's enrolment form. Extra: not in the client's sitemap. */
    out: '296-gt-modificata.html',
    TITLE: 'Ferrari 296 GT Modificata — Ferrari of Puerto Rico',
    DESC: 'The Ferrari 296 GT Modificata, the most extreme model yet created for the Club Competizioni GT program. Track use only. Register your interest at Ferrari of Puerto Rico, San Juan.',
    PRELOAD: '<link rel="preload" href="img/modificata/hero-3_4-1920.webp" as="image" imagesrcset="img/modificata/hero-3_4-800.webp 800w, img/modificata/hero-3_4-1200.webp 1200w, img/modificata/hero-3_4-1600.webp 1600w, img/modificata/hero-3_4-1920.webp 1920w" imagesizes="100vw">\n',
    PAGE_CSS: INV_CSS + '<link rel="stylesheet" href="css/approved.css">\n<link rel="stylesheet" href="css/modificata.css">\n',
    PAGE_JS: '<script src="js/interest.js" defer></script>\n<script src="js/modificata.js" defer></script>\n',
    main: () => read('_modificata.html') + '\n' + DEALER,
  },
  {
    /* Ferrari Challenge — ferrari.com's series page, 296 Challenge page and the
       official 2027 North America calendar article; Ferrari's photographs */
    out: 'ferrari-challenge.html',
    TITLE: 'Ferrari Challenge — Ferrari of Puerto Rico',
    DESC: 'Ferrari Challenge Trofeo Pirelli North America: the series, its four classes, the Ferrari 296 Challenge and the 2027 calendar, at Ferrari of Puerto Rico in San Juan.',
    PRELOAD: '<link rel="preload" href="img/challenge/hero-1920.webp" as="image" imagesrcset="img/challenge/hero-800.webp 800w, img/challenge/hero-1280.webp 1280w, img/challenge/hero-1920.webp 1920w" imagesizes="100vw">\n',
    PAGE_CSS: INV_CSS + '<link rel="stylesheet" href="css/approved.css">\n<link rel="stylesheet" href="css/home.css">\n<link rel="stylesheet" href="css/news.css">\n<link rel="stylesheet" href="css/drive.css">\n<link rel="stylesheet" href="css/sell.css">\n<link rel="stylesheet" href="css/dropdown.css">\n<link rel="stylesheet" href="css/warranty.css">\n<link rel="stylesheet" href="css/corso.css">\n<link rel="stylesheet" href="css/tabs.css">\n<link rel="stylesheet" href="css/challenge.css">\n<link rel="stylesheet" href="css/motion.css">\n',
    PAGE_JS: '<script src="js/approved.js" defer></script>\n<script src="js/dropdown.js" defer></script>\n<script src="js/interest.js" defer></script>\n<script src="js/gallery.js" defer></script>\n<script src="js/corso.js" defer></script>\n<script src="js/tabs.js" defer></script>\n<script src="js/motion.js" defer></script>\n',
    main: () => read('_challenge.html') + '\n' + DEALER,
  },
  {
    /* Ferrari Corso Pilota — Cauley's course texts (Ferrari's), ferrari.com's
       lines, special editions and photographs; the network's 2027 North
       America dates (ferrariquebec.com), without prices */
    out: 'corso-pilota.html',
    TITLE: 'Ferrari Corso Pilota — Ferrari of Puerto Rico',
    DESC: 'Ferrari Corso Pilota driving courses — Sport, Evoluzione+ and Race, special editions and the 2027 North America schedule — at Ferrari of Puerto Rico in San Juan.',
    PRELOAD: '<link rel="preload" href="img/corso/hero-1920.webp" as="image" imagesrcset="img/corso/hero-800.webp 800w, img/corso/hero-1280.webp 1280w, img/corso/hero-1920.webp 1920w" imagesizes="100vw" media="(min-aspect-ratio: 5/4)">\n',
    PAGE_CSS: INV_CSS + '<link rel="stylesheet" href="css/approved.css">\n<link rel="stylesheet" href="css/home.css">\n<link rel="stylesheet" href="css/news.css">\n<link rel="stylesheet" href="css/drive.css">\n<link rel="stylesheet" href="css/sell.css">\n<link rel="stylesheet" href="css/dropdown.css">\n<link rel="stylesheet" href="css/warranty.css">\n<link rel="stylesheet" href="css/corso.css">\n<link rel="stylesheet" href="css/tabs.css">\n<link rel="stylesheet" href="css/chapnav.css">\n<link rel="stylesheet" href="css/motion.css">\n',
    PAGE_JS: '<script src="js/approved.js" defer></script>\n<script src="js/dropdown.js" defer></script>\n<script src="js/interest.js" defer></script>\n<script src="js/gallery.js" defer></script>\n<script src="js/corso.js" defer></script>\n<script src="js/tabs.js" defer></script>\n<script src="js/chapnav.js" defer></script>\n<script src="js/motion.js" defer></script>\n',
    main: () => read('_corso.html') + '\n' + DEALER,
  },
  {
    /* Ferrari Warranty & Power — Ferrari's own US aftersales texts
       (ferrari.com/en-US/auto/car-part-services-warranty-maintenance),
       verbatim, in Approved's hero, welcome and chapters */
    out: 'warranty-and-power.html',
    TITLE: 'Ferrari Warranty & Power — Ferrari of Puerto Rico',
    DESC: 'Ferrari Manufacturer’s Warranty, 7-year Genuine Maintenance, hybrid service contracts and the Ferrari Power Contract, at Ferrari of Puerto Rico in San Juan.',
    PRELOAD: '<link rel="preload" href="img/warranty/hero-12cilindri-1920.webp" as="image" imagesrcset="img/warranty/hero-12cilindri-800.webp 800w, img/warranty/hero-12cilindri-1280.webp 1280w, img/warranty/hero-12cilindri-1920.webp 1920w" imagesizes="100vw">\n',
    PAGE_CSS: INV_CSS + '<link rel="stylesheet" href="css/approved.css">\n<link rel="stylesheet" href="css/home.css">\n<link rel="stylesheet" href="css/warranty.css">\n<link rel="stylesheet" href="css/motion.css">\n',
    PAGE_JS: '<script src="js/approved.js" defer></script>\n<script src="js/motion.js" defer></script>\n',
    main: () => read('_warranty.html') + '\n' + DEALER,
  },
  {
    out: 'sell-or-consign.html',
    TITLE: 'Sell or Consign Your Ferrari — Ferrari of Puerto Rico',
    DESC: 'Sell or consign your Ferrari with Ferrari of Puerto Rico in San Juan: how consignment works, an expert valuation of your Ferrari, and recently sold cars.',
    PRELOAD: '<link rel="preload" href="img/sell/hero-296-1920.webp" as="image" imagesrcset="img/sell/hero-296-800.webp 800w, img/sell/hero-296-1280.webp 1280w, img/sell/hero-296-1920.webp 1920w" imagesizes="100vw">\n',
    PAGE_CSS: INV_CSS + '<link rel="stylesheet" href="css/approved.css">\n<link rel="stylesheet" href="css/drive.css">\n<link rel="stylesheet" href="css/sell.css">\n<link rel="stylesheet" href="css/vform.css">\n<link rel="stylesheet" href="css/dropdown.css">\n<link rel="stylesheet" href="css/motion.css">\n',
    PAGE_JS: '<script src="js/dropdown.js" defer></script>\n<script src="js/sell.js" defer></script>\n<script src="js/motion.js" defer></script>\n',
    main: sell,
  },
  {
    /* Ferrari Approved — the page built for Cauley (FERRARI_PROJECTS /
       Ferrari_Approved), Ferrari's content, on this dealer's chrome */
    out: 'ferrari-approved.html',
    TITLE: 'Ferrari Approved Program — Ferrari of Puerto Rico',
    DESC: 'Ferrari Approved, the certified pre-owned program performed exclusively by Ferrari technicians: inspection, provenance, preparation, warranty and roadside assistance. At Ferrari of Puerto Rico.',
    PRELOAD: '<link rel="preload" href="img/approved/hero-1920.webp" as="image" imagesrcset="img/approved/hero-800.webp 800w, img/approved/hero-1280.webp 1280w, img/approved/hero-1920.webp 1920w" imagesizes="100vw">\n',
    PAGE_CSS: '<link rel="stylesheet" href="css/approved.css">\n<link rel="stylesheet" href="css/motion.css">\n',
    PAGE_JS: '<script src="js/approved.js" defer></script>\n<script src="js/motion.js" defer></script>\n',
    main: () => read('_approved.html'),
  },
  {
    out: 'pre-owned.html',
    TITLE: 'Pre-Owned Ferrari Inventory — Ferrari of Puerto Rico',
    DESC: `Ferrari Approved and pre-owned Ferrari for sale at Ferrari of Puerto Rico, San Juan — ${CARS.length} vehicles in stock.`,
    PRELOAD: '', PAGE_CSS: INV_CSS, PAGE_JS: POP_JS,
    main: () => srp().replace('{{POPUPS}}', popups()),
  },
  {
    out: 'news.html',
    TITLE: 'News & Events — Ferrari of Puerto Rico',
    DESC: 'The latest news from Ferrari: Scuderia Ferrari, the Ferrari magazine and endurance racing, at Ferrari of Puerto Rico.',
    PRELOAD: '', PAGE_CSS: '<link rel="stylesheet" href="css/news.css">\n', PAGE_JS: '',
    main: newsroom,
  },
  ...NEWS.map(n => ({
    out: newsHref(n),
    TITLE: `${n.title} — News | Ferrari of Puerto Rico`,
    DESC: n.summary,
    PRELOAD: `<link rel="preload" href="img/news/${n.slug}.jpg" as="image">\n`,
    PAGE_CSS: '<link rel="stylesheet" href="css/news.css">\n', PAGE_JS: '',
    main: () => article(n),
  })),
  {
    out: 'blog.html',
    TITLE: 'Event Recaps — Ferrari of Puerto Rico',
    DESC: 'Events and stories from Ferrari Puerto Rico, the official Ferrari dealer in San Juan.',
    PRELOAD: '', PAGE_CSS: '<link rel="stylesheet" href="css/news.css">\n', PAGE_JS: '',
    main: blogroom,
  },
  ...BLOG.map(p => ({
    out: blogHref(p),
    TITLE: `${p.title} — Event Recaps | Ferrari of Puerto Rico`,
    DESC: p.summary,
    PRELOAD: `<link rel="preload" href="img/blog/${p.slug}/cover-1200.jpg" as="image">\n`,
    PAGE_CSS: '<link rel="stylesheet" href="css/news.css">\n', PAGE_JS: '<script src="js/gallery.js" defer></script>\n',
    main: () => blogPost(p),
  })),
  {
    out: 'gallery.html',
    TITLE: 'Gallery — Ferrari of Puerto Rico',
    DESC: 'Photo albums from events at Ferrari Puerto Rico, the official Ferrari dealer in San Juan.',
    PRELOAD: '', PAGE_CSS: '<link rel="stylesheet" href="css/news.css">\n', PAGE_JS: '',
    main: galleryroom,
  },
  ...GALLERY.map(a => ({
    out: albumHref(a),
    TITLE: `${a.title} — Gallery | Ferrari of Puerto Rico`,
    DESC: `${a.photos.length} photographs: ${a.summary}`,
    PRELOAD: '', PAGE_CSS: '<link rel="stylesheet" href="css/news.css">\n', PAGE_JS: '<script src="js/gallery.js" defer></script>\n',
    main: () => album(a),
  })),
  ...CARS.map(c => ({
    out: hrefOf(c),
    TITLE: `${c.certified ? 'Certified ' : 'Pre-Owned '}${titleOf(c)}${c.price ? ' — ' + money(c.price) : ''} | Ferrari of Puerto Rico`,
    DESC: `${titleOf(c)}, ${miles(c.mileage)}, ${c.exterior} over ${c.interior}. Stock ${c.stock}, VIN ${c.vin}. At Ferrari of Puerto Rico, San Juan.`,
    PRELOAD: `<link rel="preload" href="${pic(c, 1, 1600)}" as="image">\n`,
    PAGE_CSS: INV_CSS, PAGE_JS: POP_JS,
    main: () => vdp(c).replace('{{POPUPS}}', popups()),
  })),
];

/* the home as it was before the dealer's confirmed details, on its old chrome */
// (v1 home lives only in ../site)

/* one home since 18 Nov 2026 (Alex): the lineup in live photographs
   (img/lineup-live); the studio cut-out version and index-live.html are gone */

/* a car that has left the stock takes its page with it */
const live = new Set(PAGES.map(p => p.out));
for (const f of readdirSync('.')) if (/^pre-owned-.+\.html$/.test(f) && !live.has(f)) unlinkSync(f);

for (const p of PAGES) {
  const vars = {
    ...p,
    PAGE_CSS: p.PAGE_CSS + '<link rel="stylesheet" href="css/v2.css">\n',
    PAGE_JS: p.PAGE_JS + '<script src="js/footer.js" defer></script>\n',
  };
  const fill = h => h.replace(/\{\{(TITLE|DESC|PRELOAD|PAGE_CSS|PAGE_JS)\}\}/g, (_, k) => vars[k]);
  const page = [
    fill(read('_head.html')), chromePart('_header-pr.html'), chromePart('_mobilemenu-pr.html'),
    p.main(), chromePart('_footer-pr.html'), fill(read('_tail.html')),
  ].join('\n');
  writeFileSync(p.out, bust(page));
  console.log(`${p.out.padEnd(48)} ${page.split('\n').length} lines`);
}
