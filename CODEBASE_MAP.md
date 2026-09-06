# Codebase Map — BaglungIUDP Website

Architecture reference for adding features. Last updated: 2026-09-06.

**What this is:** a zero-build static site (plain HTML + vanilla JS + React-UMD-from-CDN on 3 pages + Leaflet on 1 page), served on Vercel (`vercel.json`: `cleanUrls`, root output, 1-day cache on `/assets/*`). Data-driven from hand-maintained JSON in `data/`, with a frozen provenance hierarchy documented in `data/README.md` (Finance docx = numeric authority, For addition.docx = narrative authority, v3 report = fallback).

## Dependency graph (page → assets)

```
ALL content pages ─┬─ css/style.css  (design system + nav/footer/grid + R1 citizen-UX additions at EOF)
                   ├─ js/partials.js     (INJECTED header/footer from one template; breadcrumbs +
                   │                      prev/next Atlas flow; count-up for [data-countup];
                   │                      page lives at top of body via <div id="site-header"> placeholder)
                   ├─ js/search-index.js  (window.SITE_INDEX — REGENERATE with `node js/gen-search-index.js`)
                   ├─ js/search.js        (Ctrl-K overlay, reads SITE_INDEX)
                   ├─ js/toc.js           ("On this page" bar + scrollspy (pages w/ ≥3 h2 + hero);
                   │                      .note → collapsible details.acc; back-to-top. Skips tool apps)
                   ├─ js/glossary.js      (auto-links jargon → tooltip; data/glossary.json)
                   └─ js/nav.js           (dropdowns, mobile menu, scroll progress,
                                           ward-finder deep-link, EN/नेपाली toggle,
                                           .reveal IntersectionObserver, i18n dict)

Specialized pages:
spatial.html ──── Leaflet 1.9.4 CDN ── js/map.js ──── assets/data/*.geojson (7 files)
                 └ assets/overlays/*.png (6 raster layers, georef via BOUNDS in map.js:8)
                 └ data/concepts.json (zone lookup per ward)

complaints.html ─ React 18 UMD CDN ── js/complaints.js ── localStorage only (bgl_complaints_v1)
services.html   ─ React 18 UMD CDN ── js/services.js     (static bilingual data inline)
agriculture.html─ React+three.js CDN ─ js/kisan.js       (786-line app, inline CAL/CROPS data)
mental-health.html ─ React 18 UMD CDN ─ js/mental-health.js ── localStorage only (bgl_mh_appointments_v1)
                   └ STANDALONE prototype (not in nav): "Sahara" mental-health portal,
                     simulated counsellor booking, non-diagnostic self-check (never stored),
                     real Nepal helplines (1166, TPO, TUTH, Patan), WHO safe-messaging framing
women-helpline.html ─ React 18 UMD CDN ─ js/women-helpline.js ── "Aawaj" women's safety portal (standalone)

investment.html, sector-*.html (×8) ── js/project-blurbs.js ─ data/projects.json (fetch)
investment.html ── data/investment.json
projects.html    ── data/projects.json  (tabs: flagship/annex/priorities + ward/phase filters)
wards.html       ── data/wards.json     (per-ward anchors #ward-N)
monitoring.html  ── data/indicators.json
bylaws.html      ── data/bylaws.json
references.html  ── data/references.json
analysis.html, index.html ── data/concepts.json (+wards/projects on index)
gallery.html     ── js/gallery.js ── assets/charts/{demographic(60),sdp(55)}/*.png
index.html       ── data/wards.json (hero ward-finder)
```

**Orphans / notes:**
- `data/sectors.json` is **not fetched by any page** (sector pages hardcode their narrative).
- `404.html` loads no JS/CSS — intentionally untouched by the partials refactor.
- `js/map.js` still contains dead "chapter-rail" code paths (`hasRail` checks, js:60–68, 158–162) — only `spatial.html` uses the chip UI (`data-layer` buttons, spatial.html:130–139).
- `mental-health.html` / `women-helpline.html` are standalone React portals not reachable from the nav dropdown (linked from footer/other pages); register them in `js/partials.js` FLOW/TOOLS + `js/gen-search-index.js` GROUPS when promoting.

## Page families & nav structure

- **Atlas flow** (nav dropdown "The Atlas"): overview → municipality → analysis → spatial → sectors → projects → wards; docs tail: investment → monitoring → methodology → references → demographics → social-development → fieldwork → bylaws
- **8 sector pages** `sector-{physical,social,economic,tourism,environment,drr,financial,institutional}.html` — all same template; each fetches `projects.json`, filters `p.sector===...`, and renders cards linking to `projects.html#<id>` (sector-physical.html:322–324)
- **Project detail pages**: `flagship-{rafting,bungy,cablecar}.html`, `annex-{shaligram,kalika}.html`, `homestay-ward10.html` (static narrative, ~12 KB each)
- **Citizen tools** (self-contained app layouts, no hero/crumbs/TOC): agriculture (Kisan), services, complaints, gallery, mental-health (Sahara), women-helpline (Aawaj)
- **Docs**: methodology, monitoring, references, demographics, social-development, fieldwork, bylaws, investment

## Shared layout conventions (R1 refactor — chrome is now injected, not copied)

1. Every page has `<div id="site-header"></div><script src="js/partials.js"></script><script>SitePartials.header(...)</script>` at the top of body, and `<div id="site-footer"></div><script>SitePartials.footer(...)</script>` where the footer goes — **the actual header/footer/search-modal markup lives ONLY in `js/partials.js`**. Edit chrome there, never in pages.
2. `js/partials.js` also holds the page-order map: `FLOW` (Atlas/docs reading order), `SECTORS`, `PROJECT_PAGES`, `TOOLS` groups → drives the breadcrumb + prev/next bar injected after each `.page-hero`, and prev/next shortcuts. Register a new page in those arrays (and `SHORT` labels).
3. Scripts at body end: `search-index.js → search.js → nav.js → toc.js → glossary.js` (+ page-specific React/Leaflet before those).
4. `js/toc.js` auto-adds an "On this page" bar (pages with ≥3 content h2s + a hero), converts `.note` blocks into `<details class="note acc">` collapsibles, and appends a back-to-top button. Tool-app pages skip notes/TOC but keep back-to-top.
5. `js/glossary.js` auto-links jargon (data/glossary.json, ~21 terms: MSIP, LFA, DUDBC, ROW, DPR, BOQ, PPP, IRR, tukra…) to a tooltip / mobile bottom-sheet. Add terms by editing the JSON — no code changes.
6. Count-up numbers: wrap in `<span data-countup="56,102">56,102</span>` (partials.js animates on scroll-into-view, respects prefers-reduced-motion).
7. English/Nepali: `data-i18n="key"` attributes resolve against the `I18N` dict hardcoded in nav.js:88–98 (nav/utility labels only).

## Data layer shapes

| JSON | Shape | Consumed by |
|---|---|---|
| projects.json (14 records) | `{_provenance, projects:[{id, name, sector, ward, phase, cost_estimate_npr, funding_source, …, *_provenance}]}` | projects, investment, 8 sector pages, map via blurbs |
| wards.json (14) | per-ward pop/HH/area/density + `_source` fields for every value (dual sources with conflict notes) | wards, index |
| investment.json | total 1,040 cr; by_sector/by_phase/funding_sources/by_ward | investment |
| concepts.json | zones: core 1–4, corridor 13–14, hills 5–12 | analysis, index, map.js zone popups |
| glossary.json | `{_provenance, terms:[{id, matches[], en}]}` | js/glossary.js (all pages) |
| indicators/bylaws/references | scaffolded | monitoring/bylaws/references |
| sectors.json | 8 sectors w/ goal+strategy | **currently orphaned** |

## Key gotchas for adding features

1. **New page checklist**: copy the two partial placeholders (header + footer) from any existing page → register the file in `js/partials.js` (`FLOW` or a group + `SHORT` label) and `js/gen-search-index.js` (`GROUPS`/`NAMES`) → add footer link if appropriate → run `node js/gen-search-index.js` → add CSS to style.css, never a new framework. Tool-app pages (React portals) don't need hero/crumbs — they self-manage layout.
2. **Provenance discipline**: every data value carries a `_source`/`_provenance` field; conflicts are logged, never silently resolved (`data/README.md`). Missing data renders the literal string "Data not available in current IUDP documentation." Deep provenance prose on pages sits in `.note` blocks (auto-collapsible since R1).
3. **New map layer**: add to `OVERLAYS`/`BOUNDS` (map.js:8–24) + a `data-layer` chip in spatial.html; vectors follow the `state.vectors` + `data-vector` pattern
4. **New project**: add to `data/projects.json` (id, sector must match a sector page's filter) + a blurb in `js/project-blurbs.js` or the sector card falls back to raw description text
5. **Search freshness**: `js/search-index.js` is generated — never hand-edit; run `node js/gen-search-index.js` after content changes (it excludes nav/footer boilerplate automatically).
6. **Identity**: 14 wards, 98.01 km², 56,102 pop (2021), 1,040 cr envelope, "Protect the core, grow the corridor, hold the hills"
7. Source repo: `github.com/Crazay247/BaglungIUDP`, last update stamp 2026-09-02

## R1 citizen-UX additions (2026-09-06) — what ships where

| Feature | Where | How it works |
|---|---|---|
| Injected shared chrome | all pages | `js/partials.js` templates + placeholders; single source of truth for header/footer/search modal |
| Breadcrumbs + prev/next | pages with `.page-hero` | partials.js; flow maps; hidden path on ≤560px, keeps prev/next |
| "On this page" bar | pages with ≥3 h2s (all 8 sectors, overview, …) | js/toc.js; details bar + IntersectionObserver scrollspy |
| Collapsible provenance notes | every `.note` block (43 site-wide) | js/toc.js converts to `<details class="note acc">` |
| Glossary tooltips | all pages, ~21 planning terms | js/glossary.js + data/glossary.json; dotted underline, mobile bottom sheet |
| Back-to-top | all pages | js/toc.js; appears after 600px scroll |
| Count-up hero stats | index.html hero chips | `[data-countup]` via partials.js |
| Lazy images | all static `<img>` (gallery JS images already lazy) | `loading="lazy" decoding="async"` added site-wide |
| Mobile search prominence | ≤768px | search button becomes solid moss-green tap target |
| Search index generator | dev tool | `node js/gen-search-index.js` → regenerates js/search-index.js (80 KB, 36 pages) |

QA status: 84 automated checks pass (headless Edge, desktop 1280px + mobile 375px) — header/footer injection, crumbs, TOC anchors, note accordions, glossary tooltips, search, count-up finals, no horizontal overflow, console clean on all pages except the pre-existing `/favicon.ico` probe.

## Assets inventory

- `assets/charts/demographic/` — 60 numbered PNGs (01–60), titles in `js/gallery.js` DEMO_TITLES
- `assets/charts/sdp/` — 55 PNGs (c01–c51 + sdp_*), SDP report charts
- `assets/data/` — 7 GeoJSON layers (wards, boundary, roads ~1 MB, rivers, schools, hospitals, ward_offices); CRS84 for web
- `assets/july28/` — 34 full-res thematic map PNGs (source plates, 2.5–7 MB each)
- `assets/maps/` — 26 numbered report maps (same plates, ordered for the report)
- `assets/overlays/` — 6 lightweight georeferenced PNGs for the Leaflet map
- `assets/photos/` — field survey photos (`field/`), stock (`stock/`), hero shots
- `assets/logos/` — municipality logo (favicon + brand + complaints/services)
