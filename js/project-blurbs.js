/* Shared, site-facing one-line blurbs for projects — no provenance, no field notes.
   Kept out of projects.json so the evidence file stays intact; this is presentation copy
   derived only from the data fields.
   Exposes: window.PROJECT_BLURB (id -> blurb) and window.PROJECT_DESC(id, fallback). */
window.PROJECT_BLURB = {
  'annex-04-shaligram':'Museum, meditation centre and pilgrim facilities on the Kali Gandaki at Kundule, Ward 4 — an economic catalyst for the ward and its surroundings.',
  'annex-05-kalika-malika':'A heritage circuit linking Kalika Bhagawati, the Malika forest and the Panchakot ridge — 17 project heads and a private eco-resort.',
  'homestay-ward10':'A 1D/1N homestay route around Baraha Lake — a booking desk and quality standard to revive 11 registered homestays, 4 of them operating.',
  'flagship-02-bungy':'A 120–150 m drop on the Baglung bank of the Kali Gandaki gorge, opposite the Kushma jump — the bankable flagship at IRR 32%.',
  'flagship-03-cablecar':'A ~1.6 km lift from the bazaar edge to the Panchakot ridge, built on existing 5,000–7,000 visitor/day demand.',
  'flagship-01-rafting':'A ~25 km grade 2–3 corridor from Balewa to Ramrekha — 10-year concession turning the river into a revenue asset.',
  'priority-P1-agro':'Cold chain, collection and processing infrastructure serving Wards 8 and 4 — the largest single investment in the plan.',
  'priority-P3-bhairabsthan':'A provisional public-realm package covering pilgrim, rafting and climbing infrastructure, licensed to operators.',
  'pl-physical-spine':'64.2 km of strategic all-weather blacktop, a bazaar storm-drainage trunk, four gravity tanks and a working bus park — drain first, blacktop second.',
  'pl-social-services':'Consolidate nine under-enrolled schools into destination schools, upgrade the Ward 7 health post, and roll out child-protection and geriatric care in the thin hills wards.',
  'pl-environment-waste-forest':'Scale zero-waste collection to all 14 wards, close the open dump, and protect the green belt — no net forest loss.',
  'pl-drr-resilience':'Early-warning sirens on the river, slope works on the landslide corridor, and a hazard screen on every project.',
  'pl-financial-revenue':'One revenue database with a GIS tax layer, a complete asset inventory, and a monetised bus park.',
  'pl-institutional-capacity':'Add GIS and urban-planning staff, launch the Baglung App and call centre, and keep mapping capability in-house.'
};
window.PROJECT_DESC = function(id, fallback){
  if(window.PROJECT_BLURB[id]) return window.PROJECT_BLURB[id];
  const s=(fallback||'')
    .replace(/\.docx/gi,'')
    .replace(/From\s+v3\s*/gi,'')
    .replace(/For\s+addition\s*/gi,'')
    .replace(/\(?\s*(?:v3|Financial\s*doc|IUDP\s*PROJECTS\s*DESIGNS)\s*/gi,'')
    .replace(/\s{2,}/g,' ').replace(/^[\u2014\-\s\u00b7]+|[\u2014\-\s]+$/g,'').trim();
  return s.length>12 ? s : (s||id);
};
window.PROJECT_COST = function(raw){
  return (raw||'')
    .split(/\s*[\u2014]\s*/)[0]
    .replace(/\s*;\s*(?:v3|For\s+addition|Financial).*$/i,'')
    .replace(/\s{2,}/g,' ').trim();
};