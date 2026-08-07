# SkyLine Stretch Ceilings — landing page

React + Vite implementation of the `SkyLine Stretch Ceilings.dc.html` design
from the [Claude Design project](https://claude.ai/design/p/c76d3028-b272-4b6b-a228-3d63d6579969).

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
```

No API keys, accounts or environment variables are needed — clone and run.

## Structure

```
index.html                 Google Fonts (Marcellus + Manrope), #root
public/assets/             Photography and logos, served from /assets/*
src/
  main.jsx                 React entry
  App.jsx                  Section order + hero variant state
  styles.css               All styling, organised section by section
  data.js                  Every piece of copy: nav, services, FAQ, reviews…
  hooks/useScrollReveal.js IntersectionObserver fade-in
  components/              One component per page section
```

Copy lives in `src/data.js`, not in the components — editing text, phone
numbers, cities or FAQ entries should never mean touching JSX.

Styling is a single stylesheet with semantic class names. Only genuinely
dynamic values (accordion `max-height`, slide `opacity`, portfolio
`aspect-ratio`) stay inline.

## Service-area map

`src/components/ServiceAreaMap.jsx` renders a dark map outlining **every
municipality in the service area** in brand orange, each with a hover tooltip.
Built on [Leaflet](https://leafletjs.com/) — open source, no API key, no
account, no billing.

Two free pieces:

- **Tiles** — [CARTO](https://carto.com/basemaps) `dark_all` basemap over
  OpenStreetMap data. Keyless; attribution is rendered by Leaflet bottom-right
  and must stay visible.
- **Boundaries** — `src/geo/service-area.json`, a 12-feature GeoJSON collection
  of the real municipal polygons from OpenStreetMap, fetched via Nominatim,
  simplified and committed (12 KB). Bundled, not fetched at runtime, so the map
  has no third-party dependency beyond tile images.

The 12 features cover the 10 cities in `data.js`, plus both halves of the two
split municipalities: Nominatim's default match for "North Vancouver" and
"Langley" is the small *City*, so the *District of North Vancouver* and
*Township of Langley* are included as well — otherwise most of the populated
area around them would sit outside the outline.

The map frames itself to the polygon's bounds, so there is no zoom level to keep
in sync. Scroll-wheel zoom is off (scrolling the section scrolls the page);
the +/− buttons and dragging still work.

### Changing the outlined cities

Edit `src/geo/service-area.json` — any GeoJSON `FeatureCollection` works, and
`properties.name` becomes the hover tooltip. To pull another municipality from
OpenStreetMap:

```
https://nominatim.openstreetmap.org/search?city=Burnaby&state=British+Columbia
  &country=Canada&format=jsonv2&polygon_geojson=1&polygon_threshold=0.00008
```

`polygon_threshold` trades detail for file size. Wrap the returned `geojson`
object as `{ "type": "Feature", "properties": {}, "geometry": … }`.

### Usage terms

OpenStreetMap data is ODbL — attribution required, which the map already shows.
CARTO's basemaps are free for reasonable volumes; if the site starts drawing
serious traffic, check their [terms](https://carto.com/legal/) or swap
`TILE_URL` for another provider. The tile URL is a single constant in the
component.

## Hero A/B switcher

The design ships two hero treatments and a floating toggle to compare them.
`App.jsx` keeps a `heroVariant` state (`'a'` = dark, `'b'` = image slider).
To ship a single hero, delete the `<HeroSwitcher />` line and render the one
you want.

## Contact form → Telegram

`api/lead.js` is a serverless function that validates the submission, optionally
scores it with reCAPTCHA v3, and posts the lead to a Telegram chat. It uses the
plain `(req, res)` signature, so **Vercel picks it up from `/api` with no
config** — the project does not need to be Next.js.

`src/components/Contact.jsx` POSTs to `/api/lead` and handles the
sending / sent / error states.

### Setup

Copy `.env.example` to `.env` and fill in:

| Variable | Required | Notes |
| --- | --- | --- |
| `TELEGRAM_BOT_TOKEN` | yes | From [@BotFather](https://t.me/BotFather) |
| `TELEGRAM_CHAT_ID` | yes | Message the bot, then read `https://api.telegram.org/bot<TOKEN>/getUpdates` |
| `VITE_RECAPTCHA_SITE_KEY` | no | Public — inlined into the bundle |
| `RECAPTCHA_SECRET` | no | Server-side only |

On Vercel, add the same names under **Project Settings → Environment
Variables**. Only `VITE_*` reaches the browser; the token and secret never
leave the server.

### Behaviour

- **reCAPTCHA is optional and never blocks a lead.** Verification runs only when
  both the site key and the secret are set. If Google times out or errors, the
  submission goes through anyway — losing a real customer costs more than
  letting a bot through. The score threshold is `0.3`, because mobile devices
  routinely score 0.3–0.5.
- **Honeypot.** A hidden `website` field; if it is filled the API answers `200`
  and silently drops the lead, so bots get no signal.
- **UTM tags** are read off the landing URL and kept in `sessionStorage`
  (`src/lib/utm.js`), so a lead submitted after scrolling still carries the
  campaign that produced it.
- **Input is HTML-escaped** before it goes into the Telegram message. Telegram
  parses it with `parse_mode: HTML`, so an unescaped `<` in a customer's message
  makes the whole send fail with a 400 — worth porting back to your other
  project, which interpolates the fields raw.
- Fields are length-capped and both outbound calls have abort timeouts
  (4 s reCAPTCHA, 8 s Telegram).

### Local development

`npm run dev` mounts the same handler through a small middleware in
`vite.config.js`, so the form works locally — Vite alone does not serve `/api`.
Verified responses:

```
GET  /api/lead                    405 {"message":"Method not allowed"}
POST /api/lead  (no name)         400 {"message":"Missing required fields"}
POST /api/lead  (honeypot set)    200 {"success":true}   ← dropped
POST /api/lead  (valid)           200 {"success":true}
```

### reCAPTCHA badge

Google's floating badge appears bottom-right by default, which satisfies their
branding requirement. If you hide it, you must instead show the "protected by
reCAPTCHA — Privacy / Terms" text near the form.

## Brief cross-check

Copy was audited against the client brief. Corrections already applied are in
`src/data.js`. The items below are **not** fixed in code because they are the
client's call, and all of them are live claims on the page today.

### Blocking before launch

| Claim on the page | What the brief says |
| --- | --- |
| Three testimonials + "Rated 5.0 by clients across Vancouver" | No completed Canadian projects, no orders yet, Google profile still in progress. The names literally read "Client Name" — these are template placeholders. Publishing them as real reviews is deceptive and is exactly what Canada's Competition Act penalises. Replace with real, attributable reviews or delete the Reviews section and its nav link. |
| "Licensed & insured" (was in the footer and the Why-us grid) | Trust elements answer: *"поки нічого"* — no business licence, liability insurance or workers' comp confirmed. Both mentions have been **removed** pending proof; put them back once documents exist. |
| Portfolio titled "Recent installs" / "Our work" | No Canadian projects yet. Either relabel (e.g. "Finishes and lighting we install") or state that photos are from the team's earlier work. |

### Verify before launch

- **Fire ratings.** The page says films meet North American safety standards, and the Why-us grid now names Laqfoil / Descor Class 1. The brief supports this (CAN-S102, ASTM-E84, EN 13501-1) but adds: confirm the certificates are on hand *and* that SkyLine is permitted to cite them.
- **Experience.** "Since 2017" is on the page. Actual trading was Ukraine 2017–2022, none in Canada. The earlier "A decade of experience" heading was softened to "Experience since 2017".
- **Business address.** The page says "Based in Vancouver"; the registered address is 398 Hickey Dr, Coquitlam. The client's mark-up asks for Vancouver framing, so it was left as is — but the home address is deliberately not published.
- **Hours.** The brief gives only "8AM – 6PM" with no days. The invented Mon–Fri / Sat / Sun breakdown was removed; add days back once confirmed.
- **LED warranty.** Brief marks it "треба уточнити". The page claims 15 years total (10 materials + 3 installation) and stays silent on LED — keep it that way until confirmed.

### Applied from the brief

- "Dust-free" → "low-dust" / "minimal dust" throughout — the brief explicitly flags *«без пилу» замість «мінімум пилу»* as a phrase to avoid.
- Height loss corrected: was "1–2 inches"; the brief gives under one inch for standard PVC, ~0.25" for Descor, and ~6" for backlit translucent.
- "Backlit / Luminous" renamed **Translucent** — fully luminous ceilings (item 10) are *not* offered; translucent (item 3) is.
- Added **Track Lighting** — one of the three priority lighting solutions for the first screen, previously missing.
- Added a "We also install" list: satin, fabric/polyester, multi-level, acoustic, starry sky, **stretch walls**, repair & replacement. All offered per the brief, none had photography — listed as text rather than illustrated with unrelated images. Stretch walls were an explicit client request.
- Added the load-bearing FAQ (membrane holds nothing; fixtures mount above, penetrations reinforced) and a "where we don't recommend it" FAQ — both marked ОБОВ'ЯЗКОВО.
- Installation times aligned to the brief: 4–6 hours standard room, 2–3 days for light lines / multi-level / commercial; 1–2 weeks from measurement to install.
- Footer now carries the Instagram, Facebook and Google links from the brief.

## Note on the image filenames

The uploaded asset set arrived numbered one higher than the design expects
(`g04.jpg` held the image the page references as `g03.jpg`, and so on all the
way up). The files were renamed down by one to match, verified by SHA-256
against the originals in the design project. Two extensions were corrected at
the same time: the design's `g09.png` and `g10.png` are genuinely PNGs.

If you re-export assets from the design project, keep the original names —
no renaming needed.
