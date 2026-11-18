# Ferrari of Puerto Rico — home page

Built from Figma, AAN FERRARI PROJECT LIB (`Aci2Fz647chvtpI1bMUdhJ`),
frame `2791:32481` "Ferrari of Puerto Rico _index", 1920 × 10222.
`node build.mjs` → `index.html`. Never edit `index.html` by hand.

Rule for this build: **cauleyferrari.com is the primary reference; the Figma
frame is secondary.** Invent nothing — missing data shows as "to be confirmed". Copy, numbering and
placeholders are the frame's own, verbatim. Where the frame is silent (phone,
in-between widths, hover), the house system decides — base.css is the Cauley /
AAN base with the `fr-*` buttons and header mechanics.

## Layout

```
_head.html _header-pr.html _mobilemenu-pr.html _home.html _footer-pr.html _tail.html
build.mjs           assembles; fills the three pre-owned cards
css/base.css        house base (copied from the Cauley Ferrari Approved build)
css/pr.css          dealer layer: header sizes, type, buttons, record, footer
css/home.css        the sections
js/page.js          sticky band + mobile menu
js/home.js          range slider, pre-owned rail
img/figma/          every asset as downloaded from Figma (source)
img/home/           webp derivatives, cropped to the frame's own crops
img/models/         range renders taken from cauleyferrari.com
img/icons/          svgs; logo-pr.svg is the frame's four lockup parts joined
```

## Open — from the frame itself, left as the frame has it

- About section (`2797:1070`) had `Xxxxxxx` copy: now **drafted copy** modelled
  on Cauley's own "Dealership" block — no facts, to be confirmed.
- News & Events: the six latest stories from ferrari.com/en-US/news (read
  22 Oct 2026) — photograph, date, category, title, Ferrari's own summary;
  in a looping Swiper carousel at Cauley's settings (3s autoplay, 3/2/1 per
  view at 1280/960/below, dots under 1280); read more opens the article. No PDF link: as on Cauley's, it appears only
  when a story has a PDF. Cards reveal as ferrari.com's do: the card
  fades in, the title's words rise into place one by one.
- Markers: the frame had 1, 2, 4, 6, 8, 7. Now 1–8 in order: 3 Service and
  5 Dealership added on the photographs as Cauley sets them; Value your exotic
  car (7) now sits before Curated Moments (8), the order the numbers — and
  Cauley's page — already had.
- **Client edit 1:** the 2026 range is now Ferrari of Fort Lauderdale's model
  line-up (ferrarifl.com "Our Collection"): ten square lifestyle photographs from
  Ferrari's dealer asset library, name on each, arrows and dots, Contact us. This
  replaced the frame's single-car slider — and with it the frame's Roma Spider
  and its 849 figures.
- The nav drop-down for New Model Range repeats Purosangue; the duplicate was dropped.
- Pre-owned cards carry the frame's sample cars and prices; live inventory replaces them.
- "Enquire" and "Colour" as in the frame (the Cauley ticket used "Inquire").
- Address from the dealer's setup form: JF Kennedy Ave. Marginal Calle John Erndt,
  San Juan, PR 00920; the logo links only to this build's own home (`./`) — this is the new 2026
  site, not the dealer's current one. The
  form's phone is a 555 placeholder, so the frame's (787) 296-9996 stays.
- Internal pages have no URLs yet: every other internal link is `#`.
- Footer © at 9 px and "Powered by" in #303030 on #181818, as drawn.

## Behaviour taken from cauleyferrari.com (the theme's own scripts)

- Our Selection / Service / Owners are pinned: each holds while the next
  slides over it (theme rule: a section taller than the screen finishes first).
- Inertia scrolling on desktop (theme: ScrollSmoother 1.4; here Lenis).
- fr-* buttons; round buttons draw a rosso-corsa ring over 1s on hover.
- Nav hover lifts to #f7f7f7; drop-down links grey to #8f8f8f; bookmark pin
  on #f7f7f7 halves on hover.

## Our Team — `our-team.html`

Cauley's /our-team/ page at its values (white page, "Our Team" 32/40, three-up
grid of 448 × 299 portraits, name 18 / position 13 / contact 11), with this
dealer's portraits from `STAFF IMAGES/2026`. Names, positions, phones and
e-mails are copied from the dealer's current site
(ferraripuertorico.com/meet-our-staff/, read 22 Oct 2026), in its order.
Each 4:5 portrait is cropped to the 3:2 card by its own `y` in `build.mjs`.

Open:
- Rule: anything not supplied shows as "Photo / Position / Phone / Email to be
  confirmed". Peter Tocci and Alondra Figueroa have no 2026 portrait yet.

## Ferrari Approved (`ferrari-approved.html`)

The Ferrari Approved Program page built for Cauley (FERRARI_PROJECTS /
Ferrari_Approved), on this dealer's header and footer: `_approved.html`,
`css/approved.css` (+ a closing block that puts it on this site's 1408 / 256
frame), `js/approved.js`, `img/approved/`. Content is Ferrari's own, unchanged.
Linked from Pre-Owned › Ferrari Approved in the header and the footer.
*Search now* goes to the home page's pre-owned section (`./#pre-owned`) and
*Value your car* to its value section (`./#value`) until the site has its own
inventory and valuation pages.

## Pre-owned stock — SRP and VDP

`pre-owned.html` (SRP) and one `pre-owned-<year>-ferrari-<model>-<stock>.html`
per car (VDP), generated by `build.mjs` from `data/inventory.json`.

- **The stock is the dealer's own, not sample data.** `tools/scrape_inventory.py`
  (outside `site/`) reads ferraripuertorico.com: the cars its home page lists,
  each VDP's structured data, dealer description and standard equipment, and the
  public `vehicle-facts.json` (VIN, stock, price, odometer, certified / one-owner
  flags). Photos: the first 30 per car, as `img/inventory/<stock>/NN-{1600,640}.webp`.
  Read 22 Oct 2026: 9 cars. A tenth (an 812 GTS) is in the dataset but its page
  redirects to search, so it is left out.
- Three listings carry only the source's "Photos coming soon" frames; they show
  that frame once, small, on black. Three have no price in the source and read
  "Price to be confirmed".
- Refresh: `python tools/scrape_inventory.py` then `node build.mjs`. A car that
  has left the stock loses its page on the next build.
- **SRP** — ferrarifl.com's structure: filters left (model, year, program,
  colours, with counts), search, count, grid / list, sort, active-filter chips,
  an empty state. The cards are this site's (Figma card + photo stepper).
- **VDP** — ferrarifl.com's order in Cauley's language: a held title bar, the
  photo mosaic and full-screen viewer, price + Inquire / Schedule test drive /
  Text to Phone / Share, Overview, tabs (Dealer description, Standard equipment,
  Technical details), the Ferrari Approved band for certified cars, other
  vehicles, the dealership with its hours, the dealer's own disclaimer.
- **Inquire / Schedule test drive** is Cauley's `contacts_vdp` drawer (the car
  on a dark band; First / Last, Email / Phone, a message naming the car, the
  consent line, Send). Test drive is the same form with its own title and first
  line. No endpoint: a valid form says "Sending to be confirmed".
- **Home** — the 2026 range is Cauley's model list in Cauley's order, with
  ferrari.com's photographs (each model page, cropped square; Luce's studio black
  and the 12Cilindri's white studio extended to a square, nothing drawn in).
  Every tile and every pre-owned card carries Schedule test drive. The
  Certified pre-owned rail shows the real stock.

## Status — 23 Oct 2026

- **Deployed:** repo `Sigovs/Ferrari-of-Puerto-Rico` (main), preview
  https://sigovs.github.io/Ferrari-of-Puerto-Rico/ — the repo root is this
  folder without `img/figma` (Figma exports, unused by any page).
- **Built (13 pages):** home, Our Team, Ferrari Approved, Pre-owned SRP and
  nine VDPs. Every other menu item still points nowhere.
- **References per module:** home pre-owned rail and its nav row,
  outline-button hover, VDP top — thecollectionferrari.com; SRP search bar,
  Order select, VDP full-screen gallery — ferrariofnewengland.com; SRP view
  icons — ferrariofcentralnj.com (their SVG, verbatim); gallery view toggle —
  ferrarifl.com (Font Awesome 4.7 square-o / th glyphs); popups, forms,
  buttons — cauleyferrari.com.
- **Dealership photo:** DSC02989 (Amalfi event, the chassis plate), cropped
  so the plate clears the copy. The Amalfi showroom evening (EJ_06599) is kept
  commented out in `_home.html` (`img/home/about-amalfi-*`).
- **Tools** (outside `site/`, in `../tools`): `scrape_inventory.py` (refresh
  the stock), `shot.mjs` (headless Chrome screenshots:
  `node shot.mjs <url> <out.jpg> <w> <h> [js] [mobile]`),
  `fontawesome-4.7-webfont.svg` (source of the two gallery glyphs).
- **Open:** no form endpoint; three cars without photos, three without a
  price; Amalfi archive in `../AMALFI EVENT` is truncated (22 frames out).

## Status — 30 Oct 2026

- **Client's confirmed details** (address, hours, Service & Parts as one block)
  are on every page through `_header-pr.html`, `_mobilemenu-pr.html`,
  `_footer-pr.html`, `css/v2.css` and the dealer block in `build.mjs`. Map links
  go to the Google profile (`maps?cid=8225234948455781208`). Phone is shown as 787-296-9996,
  as the client writes it.
- **Footer on narrow screens:** cauleyferrari.com's accordion up to 1024
  (`js/footer.js`, their `arrow-close_w.svg`).
- **Old home:** `index-v1.html`, on the `_*-pr-v1.html` chrome.

## v3 — status 6 Nov 2026

- **Where:** this folder (`site-v3`), built with `node build.mjs`. Live as a
  separate preview at https://sigovs.github.io/Ferrari-of-Puerto-Rico/v3/ (commit
  ffe656d, 18 Nov 2026: sitemap pages 1–6 + Ferrari forms); the root site (v2) is what the client's earlier links show.
- **Deploy:** clone the repo, replace its `v3/` folder with this folder, commit,
  push — only when Alex says "pushaj". Keep the file count down: a ~800-file push
  timed out on GitHub Pages; 388 files deploy in under a minute.
- **Scope:** the existing pages (home, SRP, 9 VDPs, Our Team, Ferrari Approved) +
  the client's sitemap navigation (`NAV` in build.mjs; pages not built point to
  "#") + News & Events (6 Ferrari articles), Blog (2 posts) and Gallery (2 albums
  of 12). No other sitemap pages.
- **One home** (since 18 Nov 2026): `index.html` with the lineup in live photographs
  (`img/lineup-live`, frames made by `../tools/lineup/`). The studio line-up version,
  `index-live.html` and `img/lineup` were removed at Alex's request.
- **Layouts:** news and blog after ferrari.com — listing as ferrari.com/news
  under the site's marker heading; article as a ferrari.com news article (back,
  date/category, title in capitals, photograph the page's width, text column).
  A blog post shows its whole album under the text. Never take layouts from
  cauleyferrari.com (the AAN master).
- **Open:** full article text (Ferrari's, needs the news feed — not copied from
  ferrari.com), blog write-ups, event photo approval, pages marked "to be
  confirmed"; Luce is the only live frame from the client folder (`FROM CLIENT`).
- **QA:** `node ../tools/qa-v3.mjs <out-dir>` — every page at 1920/1440/1024/768/390.


## Sitemap pass — 17 Nov 2026

- **Client's priority list** (email, 17 Nov): 15 pages, all from his own sitemap
  (`FROM CLIENT/FPR_Sitemap-1.png`). Built **one page at a time** (Alex).
- **Menu now follows his sitemap:** Events & Media = Event Schedule · Event Recaps
  (`blog.html`, was "Blog") · Gallery, plus **News & Events** kept as an extra page
  (Ferrari news; feeds the home block). URLs unchanged.
- **`sitemap.html`** — his sitemap with each page's status (In preview / Next / Later /
  Extra), made by `python -I ../tools/sitemap.py`. Update the status there whenever a page
  ships. PNG for e-mail: `../FPR_Sitemap-status-2026-11-17.png`.
- **Facts found (sources in the 17 Nov research):** current ferraripuertorico.com has
  none of the 15 except Ferrari Approved; its `/hybrid/` is a leftover **Lexus** page and
  `/warranty/` a generic third-party template — tell the client. Ferrari's US name is
  **Power Contract** (not "New Power 15"); "Ferrari Club Challenge" = **Passione Ferrari
  Club Challenge** (European rounds only); Ronnie Vogel is documented with Ferrari of Fort
  Lauderdale — "25 years" has no source yet; Challenge NA 2027 and Corso Pilota NA dates/fees
  are dealer/press sources only, not ferrari.com.

## Feedback log (Alex, 17 Nov 2026 — rules for every new page)

- **One hero.** Every hero is Approved's `.fa-hero` unchanged: full screen, pretitle + title +
  actions low left. Never resize or restructure it for a picture — **choose the picture for the
  hero**: the car whole, right of centre, below the header, never cropped by it, never under the
  type; set `object-position` so narrow screens crop the background, not the car.
- **No repeated images.** A page never reuses a photograph the home page (or another page)
  already shows; ferrari.com has plenty — take a new one and note its source.
- **Marker → 24px → heading**, in every section, as on the stock list and the newsroom.
- **Anchors scroll smoothly** (js/site.js: Lenis on desktop, native smooth on phones), landing
  24px under the sticky band; reduced motion jumps.
- **Dropdowns are Ferrari's f-dropdown** (js/dropdown.js + css/dropdown.css over the native
  select), never the OS select list.
- **Forms stay on the page and are Ferrari's enrolment form** (ferrari.com Corso Pilota →
  Request information; css/form.css, opt-in class `.pr-fform`): marker, title and text centred,
  then ONE 720px column — bold intro line, fields full width 48px on a 1px #8f8f8f rule,
  labels 14px grey, 34px apart, Message a 100px box, consent in caps, red SUBMIT 200×56 at the
  left. Applied 18 Nov 2026 to Corso Pilota, Challenge, Sell or Consign and the VDP drawers;
  **demo-drive.html keeps its own form (Alex: leave it as is).** No "Step" boxes, no button-tiles.
- Pages are built **one at a time, in the client's order**; next only after Alex approves.
- **Schedules and galleries are Ferrari's components**, never an invented grid: the calendar
  = ferrari.com's Corso Pilota calendar (one centred column, CATEGORY dropdown, date · course ·
  venue · round arrow); the gallery = f-image-slideshow (centred title, a rail of photographs at
  their own ratio, bottom-aligned, past the edge, full-screen button, navigator). Long programme
  copy = accordion rows (Approved chapters), never cards that grow or slide-in panels.
- **Every image reference must exist** — check src *and* srcset after swapping a picture.
- **Content source order** for every page: 1) the dealer's current site (ferraripuertorico.com),
  2) cauleyferrari.com, 3) ferrari.com. Check all three before writing; ferrari.com hides
  tabbed copy in its __NEXT_DATA__ JSON (Warranty & Power: the Extensions tab programs).
- **Build each page against Ferrari's own page on the same subject, chapter by chapter**
  (18 Nov 2026, Corso Pilota v4 vs ferrari.com/corso-pilota-sport): take every chapter, element
  and fact it has — chapter dots, openers, tabs, white accordion chapter, full images,
  focus-on slider (on the page, not an overlay), circuit map + turns switch, figures strip —
  then check the photographs with a perceptual hash so none repeats on the site.

## Resume point — 18 Nov 2026
- Pushed 8bc8e03: pages 1–6 of the client's list, Ferrari forms, one home, sitemap NEW tags.
- Page generators (were in the session scratchpad) now in `../tools/pages/`; some hold the old
  scratchpad path — point them at this folder before running.
- Next: **7 Club Competizioni GT**. Current site and Cauley both have a "Ferrari 296 GT
  Modificata" page (current site's text in `../_reference/club-competizioni-gt/`). Still to
  read: Cauley's page, then ferrari.com's Club Competizioni GT and 296 GT Modificata pages.
- **Sitemap tags (18 Nov 2026, Alex):** the client's original sitemap (FROM CLIENT/FPR_Sitemap-1.png)
  is the base; the 15 pages the client sent to design carry a green "New added" tag; pages we
  added on top are "Extra": **Blog** (blog.html — the dealer's own blog, name to be decided;
  NOT Event Recaps, which is page 13, still to do) and News & Events. Gallery (gallery.html,
  their photo albums) is the client's page 14.
- **Event Recaps = the blog (18 Nov 2026, Alex — supersedes the note above):** one page,
  blog.html. Sitemap card "Event Recaps (Blog)" with "The blog you asked for", so the client
  sees it was his request; the site's menu and titles say Event Recaps. No separate Blog.
- **Speed over questions (18 Nov 2026, Alex):** the client wants to launch fast — do not hold a
  page on questions to the client; build from what the current site, Cauley, other dealers and
  ferrari.com give, and leave out anything that would need the client's facts (e.g. Boca
  Raton's "dealer track support" section was skipped on Club Competizioni GT).
- **Page 10 idea:** a titles block (as ferrariboca.com shows ITS OWN Ferrari Challenge titles —
  Boca's badges are Boca's and never go on this site). Only Ronnie Vogel's / Ferrari of Puerto
  Rico's own titles, and only if they are on public record; otherwise no such block.
- **AI-restored images (provenance):** img/clubchallenge/hero-*.webp — Ferrari's Club Challenge
  photo (cdn.ferrari.com 69bbcf8f…-2026-photo, served at 1620×1080, heavily compressed),
  upscaled ×2 by Topaz Upscale Precision, Low Resolution V2, fix_compression 0.6, via fal.ai
  (request 01a1ef67-62fb-7362-98e1-8eb95650198e), 18 Nov 2026. Restoration only, nothing added.
  Also img/clubchallenge/lounge-* and tab-{slots,instructors,telemetry,lounge-tab,ceremony}-*:
  Ferrari serves them at 720×480 only; each upscaled ×2 the same way (Topaz Precision, Low
  Resolution V2, fix_compression 0.6, face enhancement OFF so real faces are not redrawn).
- **Motion on the inner pages (18 Nov 2026, Alex):** the home page's own two motions, nothing
  new — js/motion.js + css/motion.css on Approved, Sell or Consign, Warranty & Power, Corso
  Pilota, Challenge, Club Competizioni GT, Club Challenge (not the home, not demo-drive, not
  296 GT Modificata, which runs the Cauley page's own motion): 1) a chapter pins only if no
  copy is lost — .pr-full / .pr-chal__full that fits the screen with its copy in the upper
  62%, decided per viewport (openers and bands with copy at the foot never pin: the next
  section covered their text); 2) chapter titles rise word by word once (25px, 4°, 0.6s,
  70ms apart). Armed by the head's js-reveal, never under reduced motion. New pages load
  both files.
- **No widgets the dealer has to keep up (18 Nov 2026, Alex):** the CCGT next-event countdown
  was removed — nobody will set or watch it. No countdowns, live clocks or dated tickers.
- **9 XX Programme (19 Nov 2026)** — `xx-programme.html` from `tools/pages/xx_page.py`
  (+ `xx_imgs.py`, `xx_wire.py`), `css/xx.css` over the CCGT components. No dealer page
  exists for it (current site Cloudflare-gated and had none on 17 Nov; Cauley, Boca, US
  dealer sitemaps none), so the copy is ferrari.com's, verbatim: corse-clienti/xx-programmes,
  /fxx-k-evo, /fxx-k, the 2027 calendar article (25 Jul 2026) and the Road Atlanta report
  (26 May 2026). The 2027 season opens in the US (The Thermal Club, Laguna Seca — tagged
  "In the US"). Ferrari's article gives Mugello as 1–3 July in its text and 1–3 September
  in its table: Mugello is listed with its date "TBC" — do not pick one. Calendar arrows
  fill the form's Event (corso.js `ci-venue`). Hero: Ferrari's Portimão 2026 photo of two
  FXX-K Evo (its own XX cover set the car under the title); portrait cut below 1:1 only.
