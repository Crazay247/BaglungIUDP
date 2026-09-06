/* Dev tool — regenerates js/search-index.js (window.SITE_INDEX) from the HTML
   pages. Run:  node js/gen-search-index.js
   Chrome (header/footer/nav/search modal) is injected via js/partials.js
   placeholders, so this script never indexes navigation boilerplate. */
'use strict';
const fs = require('fs');

const PAGES = fs.readdirSync('.').filter(f => f.endsWith('.html') && f !== '404.html');

const GROUPS = {
  'sector-physical.html': 'Sector Plans', 'sector-social.html': 'Sector Plans', 'sector-economic.html': 'Sector Plans',
  'sector-tourism.html': 'Sector Plans', 'sector-environment.html': 'Sector Plans', 'sector-drr.html': 'Sector Plans',
  'sector-financial.html': 'Sector Plans', 'sector-institutional.html': 'Sector Plans',
  'flagship-rafting.html': 'Projects', 'flagship-bungy.html': 'Projects', 'flagship-cablecar.html': 'Projects',
  'annex-shaligram.html': 'Projects', 'annex-kalika.html': 'Projects', 'homestay-ward10.html': 'Projects',
  'agriculture.html': 'Everyday Tools', 'services.html': 'Everyday Tools', 'complaints.html': 'Everyday Tools', 'gallery.html': 'Everyday Tools', 'mental-health.html': 'Consult', 'women-helpline.html': 'Consult'
};
const NAMES = {
  'index.html': 'Home', 'overview.html': 'Plan at a Glance', 'municipality.html': 'Baglung Today', 'analysis.html': 'Analysis & Diagnosis',
  'spatial.html': 'Spatial Plan & Explorer', 'sectors.html': 'All 8 Sector Plans', 'projects.html': 'Projects & Programmes',
  'wards.html': 'Wards 1–14', 'investment.html': 'MSIP & Phasing', 'monitoring.html': 'Monitoring & Scorecard',
  'methodology.html': 'Methodology & Data Lineage', 'references.html': 'References & Sources', 'demographics.html': 'Demographic Evidence',
  'social-development.html': 'Social Development Strategy', 'fieldwork.html': 'Fieldwork', 'bylaws.html': 'Planning & Building Bylaws',
  'agriculture.html': 'Kisan Guide', 'services.html': 'Municipal Services Guide', 'complaints.html': 'Complaints & Feedback',
  'gallery.html': 'Charts & Maps Gallery', 'mental-health.html': 'Mental Health Support — Sahara', 'women-helpline.html': 'Aawaj — Women Safety & Empowerment'
};

function strip(s) {
  return s
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ').trim();
}

const entries = PAGES.map(f => {
  let html = fs.readFileSync(f, 'utf8');
  const t = strip((html.match(/<title>([\s\S]*?)<\/title>/i) || ['', ''])[1]);
  const d = strip((html.match(/<meta name="description" content="([\s\S]*?)">/i) || ['', ''])[1]);
  const group = GROUPS[f] || 'The Atlas';
  const name = NAMES[f] || t;
  // body content only: between header placeholder and footer placeholder
  let body = html;
  const hp = body.indexOf('id="site-header"');
  const fp = body.indexOf('id="site-footer"');
  if (hp >= 0) body = body.slice(body.indexOf('>', body.indexOf('<div id="site-header"', hp)) + 1);
  if (fp >= 0) body = body.slice(0, body.lastIndexOf('<div id="site-footer"'));
  const h = [];
  const bodyNoTags = strip(body).slice(0, 6000); // cap body text
  body.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (m, inner) => { h.push(strip(inner)); return m; });
  const k = group + ' / ' + name;
  const words = [...new Set((t + ' ' + d + ' ' + k + ' ' + h.join(' ') + ' ' + bodyNoTags)
    .toLowerCase()
    .match(/[\p{L}\p{N}]+/gu)
    .filter(w => w.length >= 2 && w.length <= 40)
  )].slice(0, 600);
  return { u: f, t: t, d: d, k: k, h: h, w: words };
});

fs.writeFileSync('js/search-index.js', 'window.SITE_INDEX=' + JSON.stringify(entries) + ';\n');
console.log('regenerated js/search-index.js —', entries.length, 'pages,', Math.round(fs.statSync('js/search-index.js').size / 1024) + ' KB');
