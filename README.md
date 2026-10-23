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
