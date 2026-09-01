# Data Architecture — Baglung IUDP 2026–2041

**Field-level source hierarchy (frozen):**
1. `For addition.docx` — narrative/planning-text authority where it covers same topic as v3
2. `Financial_Development_Plan_MSIP_IUDP_Format.docx` — numeric authority for financial figures, MSIP, investment, phasing, costs; wins on numeric conflicts
3. `Baglung_IUDP_2026_2041_Report_v3.docx` — fallback/base where 1–2 absent
4. `IUDP PROJECTS DESIGNS.docx` — Annex Projects 4–5
5. `report on homestay.docx` — Tourism / Ward 10
6. `MERGED.docx` deprecated

No silent reconciliation. Conflicts logged in this folder or code comments. Missing → `Data not available in current IUDP documentation.`

## Files

| File | Source | Status |
|---|---|---|
| `wards.json` | Appendix B + wards.geojson POPULATION; zone from Ch4.6 core/corridor/hills | Populated 14 wards, other fields scaffolded |
| `concepts.json` | v3 Ch4.6 | Complete (core 1–4, corridor 13–14, hills 5–12) |
| `projects.json` | Field-level hierarchy above; 6 entries (3 flagships + 2 annex + W10 homestay) | Scaffolded, cost/phasing pending Finance doc extraction |
| `sectors.json` | v3 Ch5 + For Addition overlay | 8 sectors scaffolded, template §18 sections listed |
| `investment.json` | Finance doc Ch6 | Scaffolded, pending table extraction |
| `indicators.json` | v3 Ch9.2/9.5 | Scaffolded |
| `references.json` | v3 Ch11 | Scaffolded |

## Geo Data (authoritative for map)

`assets/data/*.geojson` (wards, boundary, roads, rivers, schools, hospitals, ward_offices) — CRS84 for web, UTM44N for analysis (`methodology.html` lineage). `assets/overlays/*.png` bounds in `js/map.js:BOUNDS`.

## Usage

Vanilla `fetch('data/*.json').then(r=>r.json())` — no build step. Keep single source; do not duplicate across HTML.

## Next

- Extract Finance doc Ch6 tables → populate `investment.json` + `projects.json` cost/phase/funding
- Extract v3 Appendix B Ward snapshots → fill `wards.json` strengths/constraints/potential
- Extract Ch9.2/9.5 → `indicators.json`
- Extract Ch11 → `references.json`

