/* Shared site chrome — single source for header, footer, breadcrumbs, prev/next flow,
   and count-up numbers. Injected per page via:
     <div id="site-header"></div><script>SitePartials.header(el)</script>
     <div id="site-footer"></div><script>SitePartials.footer(el)</script>
   Edit chrome HERE, not in the 33 pages. Last regenerated: 2026-09-06. */
(function () {
  'use strict';
  var CHUNK = `
<header class="topbar">
 <div class="top-util" aria-label="Official municipal services">
  <div class="wrap">
   <span class="util-left"><b>बागलुङ नगरपालिका · Baglung Municipality</b> — Official Portal</span>
   <div class="util-right">
    <label class="util-ward" for="navWardFind"><span data-i18n="findward">Find my ward</span>:
     <select id="navWardFind" aria-label="Find my ward">
      <option value="">Ward…</option>
    <option value="1">Ward 1</option>
    <option value="2">Ward 2</option>
    <option value="3">Ward 3</option>
    <option value="4">Ward 4</option>
    <option value="5">Ward 5</option>
    <option value="6">Ward 6</option>
    <option value="7">Ward 7</option>
    <option value="8">Ward 8</option>
    <option value="9">Ward 9</option>
    <option value="10">Ward 10</option>
    <option value="11">Ward 11</option>
    <option value="12">Ward 12</option>
    <option value="13">Ward 13</option>
    <option value="14">Ward 14</option>
     </select>
    </label>
    <a class="util-link" href="complaints.html#official" data-i18n="helpline">Helpline · Ward offices</a>
    <button type="button" class="lang-toggle" id="langToggle" data-i18n="langlabel" aria-label="Switch language">EN / नेपाली</button>
   </div>
  </div>
 </div>
 <div class="topbar-main">
  <div class="wrap">
  <a class="brand" href="index.html"><img class="brand-logo" src="assets/logos/baglung-municipality-logo.png" alt="Baglung Municipality logo"><span class="brand-name"><b>Baglung</b> Municipality</span><span class="brand-sub" data-i18n="brandsub">IUDP 2026–2041 · Official Plan Portal</span></a>
  <button class="nav-toggle" aria-label="Toggle menu" aria-expanded="false">☰</button>
   <nav class="navlinks" aria-label="Primary">
   <button type="button" class="nav-search" data-search-open aria-label="Search the plan"><span class="sbi">⌕</span><span data-i18n="search">Search</span><span class="ns-hint">— every page</span></button>
  <div class="nav-item">
  <button type="button" class="nav-trigger" data-link="" aria-expanded="false"><span data-i18n="atlas">The Atlas</span> <span class="caret">▼</span></button>
  <div class="dropdown">
  <a href="overview.html"><span class="dd-title">Plan at a Glance</span><span class="dd-sub">Vision &amp; objectives · start here</span></a>
  <a href="municipality.html"><span class="dd-title">Baglung Today</span><span class="dd-sub">Place, people, services</span></a>
  <a href="analysis.html"><span class="dd-title">Analysis</span><span class="dd-sub">Gaps, SWOT, concept</span></a>
  <a href="spatial.html"><span class="dd-title">Where We'll Grow</span><span class="dd-sub">Map &amp; spatial strategy</span></a>
  <a href="sectors.html"><span class="dd-title">What We'll Build</span><span class="dd-sub">8 sector plans</span></a>
  <a href="projects.html"><span class="dd-title">Projects</span><span class="dd-sub">Flagships &amp; local works</span></a>
  <a href="wards.html"><span class="dd-title">Wards 1–14</span><span class="dd-sub">Find my ward</span></a>
  </div>
  </div>
  <div class="nav-item nav-item--consult">
  <button type="button" class="nav-trigger" data-link="" aria-expanded="false"><span data-i18n="consult">Consult</span> <span class="caret">▼</span></button>
  <div class="dropdown">
  <a href="mental-health.html"><span class="dd-title">Sahara — Mental Health Support</span><span class="dd-sub">Talk to someone · helplines · self-check</span></a>
  <a href="women-helpline.html"><span class="dd-title">Aawaj — Women's Safety</span><span class="dd-sub">Emergency help · reporting · support</span></a>
  </div>
  </div>
  <a href="agriculture.html" data-link="agriculture.html" data-i18n="kisan">Kisan Guide</a>
  <a href="complaints.html" data-link="complaints.html" data-i18n="complaints">Complaints</a>
  <a href="services.html" data-link="services.html" data-i18n="services">Services</a>
  <a href="gallery.html" data-i18n="gallery">Gallery</a>
  </nav>
     <button type="button" class="search-btn" id="searchOpen" data-search-open aria-label="Search the plan"><span class="sbi">⌕</span><span class="sbl" data-i18n="search">Search</span><kbd>Ctrl K</kbd></button>
  </div>
 </div>
</header>
<div class="progress" id="progress" aria-hidden="true"></div>
<div class="search-modal" id="searchModal" role="dialog" aria-modal="true" aria-label="Search the plan" hidden>
 <div class="sm-shell">
  <div class="sm-head">
   <span class="sbi">⌕</span>
   <input id="searchInput" type="search" placeholder="Search the plan… खोज्नुहोस्" autocomplete="off" aria-label="Search the plan">
   <button type="button" class="sm-close" id="searchClose" aria-label="Close search">✕</button>
  </div>
  <div class="sm-hint"><b>⌕</b> type to search every page · <b>↑↓</b> move · <b>↵</b> open · <b>Esc</b> or <b>Ctrl K</b> to close</div>
  <ul class="sm-results" id="searchResults"></ul>
  <div class="sm-none" id="searchNone" hidden></div>
 </div>
</div>
`;
  var FOOTER = `
<footer>
 <div class="footer-top">
 <div class="wrap">
 <span><b>Protect the core, grow the corridor, hold the hills</b> — Wards 1–4 · 13–14 · 5–12 &nbsp;·&nbsp; 2026–2041 · 98.01 km² · 56,102 · 14 wards</span>
 <span>Sources: Census 2021 · Municipal records · Field surveys 2025–26 — <a href="references.html">see References</a></span>
 </div>
 </div>
 <div class="wrap footer-main grid">
 <div class="footer-brand">
 <img class="foot-logo" src="assets/logos/baglung-municipality-logo.png" alt="Baglung Municipality logo">
 <div class="foot-title">Baglung <span>IUDP 2026–2041</span></div>
 <p class="foot-desc">Digital Integrated Urban Development Plan — M.Sc. Urban Planning (2025–27), IOE Pulchowk Campus, Tribhuvan University, 3rd Semester Planning Studio II. Planning logic visible: Baglung today → evidence → vision → spatial strategy → sector plans → projects → MSIP → implementation → monitoring.</p>
 <div class="foot-meta">
 <span>IOE Pulchowk</span>
 <span>Planning Studio II</span>
 <span>14 wards</span>
 <span>98.01 km²</span>
 </div>
 </div>
 <div>
 <h3>Explore the Plan</h3>
 <ul>
 <li><a href="overview.html">Plan at a Glance</a></li>
 <li><a href="municipality.html">Municipality Profile</a></li>
 <li><a href="analysis.html">Analysis &amp; Diagnosis</a></li>
 <li><a href="spatial.html">Spatial Plan &amp; Explorer</a></li>
 <li><a href="demographics.html">Demographic Evidence</a></li>
 </ul>
 <h4>Sector Plans</h4>
 <ul>
 <li><a href="sectors.html">All 8 Thematic Plans</a></li>
 <li><a href="sector-physical.html">Physical</a> · <a href="sector-social.html">Social</a> · <a href="sector-economic.html">Economic</a></li>
 <li><a href="sector-tourism.html">Tourism &amp; Homestay</a></li>
 </ul>
 </div>
 <div>
 <h3>Implementation</h3>
 <ul>
 <li><a href="projects.html">Projects &amp; Programmes</a></li>
 <li><a href="investment.html">MSIP &amp; Phasing</a></li>
 <li><a href="wards.html">Wards 1–14 Profiles</a></li>
 <li><a href="monitoring.html">Monitoring &amp; Scorecard</a></li>
 <li><a href="bylaws.html">Planning &amp; Building Bylaws</a></li>
 </ul>
 <h4>Flagships</h4>
 <ul>
 <li><a href="flagship-rafting.html">Rafting Corridor</a></li>
 <li><a href="flagship-bungy.html">Gorge Bungy</a></li>
 <li><a href="flagship-cablecar.html">Panchakot Cable Car</a></li>
 <li><a href="annex-shaligram.html">Shaligram Museum</a> · <a href="homestay-ward10.html">Homestay</a></li>
 </ul>
 </div>
 <div>
 <h3>Evidence &amp; Method</h3>
 <ul>
 <li><a href="methodology.html">Methodology &amp; Data Lineage</a></li>
 <li><a href="fieldwork.html">Fieldwork (14 wards)</a></li>
 <li><a href="gallery.html">Charts &amp; Maps Gallery (171)</a></li>
 <li><a href="references.html">References &amp; Sources (Ch11)</a></li>
 <li><a href="spatial.html">Interactive GIS (Leaflet 1.9.4)</a></li>
 </ul>
 <h4>Citizen</h4>
 <ul>
 <li><a href="agriculture.html">Kisan Guide</a> · <a href="services.html">Services</a> · <a href="complaints.html">Complaints</a></li>
 <li><a href="gallery.html">Visual Gallery</a></li>
 <li><a href="mental-health.html">Sahara — Mental Health Support</a> · <a href="women-helpline.html">Aawaj — Women's Safety</a></li>
 </ul>
 <p class="footer-links-compact">Data: <a href="data/wards.json">wards</a> · <a href="data/projects.json">projects</a> · <a href="data/investment.json">investment</a> · <a href="data/indicators.json">indicators</a></p>
 </div>
 </div>
 <div class="wrap foot-bottom">
 <span>© 2026 <b>Baglung Planning Studio</b> · IOE Pulchowk · Tribhuvan University · 3rd Sem Planning Studio II · Last update: 2026-09-02</span>
 <span>Sources: Census, municipal &amp; field records · <a href="https://github.com/Crazay247/BaglungIUDP" target="_blank" rel="noopener">github.com/Crazay247/BaglungIUDP</a> · Static site</span>
 </div>
</footer>
`;

  var FLOW = ['overview.html','municipality.html','analysis.html','spatial.html','sectors.html','projects.html','wards.html','investment.html','monitoring.html','methodology.html','references.html','demographics.html','social-development.html','fieldwork.html','bylaws.html'];
  var SECTORS = ['sector-physical.html','sector-social.html','sector-economic.html','sector-tourism.html','sector-environment.html','sector-drr.html','sector-financial.html','sector-institutional.html'];
  var PROJECT_PAGES = ['flagship-rafting.html','flagship-bungy.html','flagship-cablecar.html','annex-shaligram.html','annex-kalika.html','homestay-ward10.html'];
  var TOOLS = ['agriculture.html','services.html','complaints.html','gallery.html'];
  var CONSULT = ['mental-health.html','women-helpline.html'];

  var SHORT = {
    'overview.html':'Overview','municipality.html':'Baglung Today','analysis.html':'Analysis',
    'spatial.html':'Spatial Plan','sectors.html':'Sectors','projects.html':'Projects','wards.html':'Wards',
    'investment.html':'MSIP','monitoring.html':'Monitoring','methodology.html':'Methodology',
    'references.html':'References','demographics.html':'Demographics','social-development.html':'Social Development',
    'fieldwork.html':'Fieldwork','bylaws.html':'Bylaws',
    'agriculture.html':'Kisan Guide','services.html':'Services','complaints.html':'Complaints','gallery.html':'Gallery',
    'sector-physical.html':'Physical','sector-social.html':'Social','sector-economic.html':'Economic',
    'sector-tourism.html':'Tourism','sector-environment.html':'Environment','sector-drr.html':'DRR',
    'sector-financial.html':'Financial','sector-institutional.html':'Institutional',
    'flagship-rafting.html':'Rafting Corridor','flagship-bungy.html':'Gorge Bungy','flagship-cablecar.html':'Cable Car',
    'annex-shaligram.html':'Shaligram Museum','annex-kalika.html':'Kalika Heritage','homestay-ward10.html':'Ward 10 Homestay','mental-health.html':'Sahara — Mental Health','women-helpline.html':'Aawaj — Women Safety'
  };

  var GROUPS = {};
  SECTORS.forEach(function (f) { GROUPS[f] = { group: 'Sector Plans', parent: ['sectors.html', 'All 8 Sector Plans'], list: SECTORS }; });
  PROJECT_PAGES.forEach(function (f) { GROUPS[f] = { group: 'Projects', parent: ['projects.html', 'Projects'], list: PROJECT_PAGES }; });
  TOOLS.forEach(function (f) { GROUPS[f] = { group: 'Everyday Tools', parent: ['index.html', 'Home'], list: TOOLS }; });
  CONSULT.forEach(function (f) { GROUPS[f] = { group: 'Consult', parent: ['index.html', 'Home'], list: CONSULT }; });

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function pageFile() { return location.pathname.split('/').pop() || 'index.html'; }
  function pageTitle() { var t = (document.title.split('·')[0] || '').trim(); return t || pageFile(); }

  function header(el) { if (el) el.outerHTML = CHUNK; }
  function footer(el) { if (el) el.outerHTML = FOOTER; }

  /* Breadcrumb + prev/next Atlas-flow bar, inserted after the page hero */
  function initCrumbs() {
    var file = pageFile();
    if (file === 'index.html' || !SHORT[file]) return;
    var list = GROUPS[file] ? GROUPS[file].list : (FLOW.indexOf(file) >= 0 ? FLOW : null);
    if (!list) return;
    var idx = list.indexOf(file);
    if (idx < 0) return;
    var g = GROUPS[file];
    var prev = idx > 0 ? list[idx - 1] : null;
    var next = idx < list.length - 1 ? list[idx + 1] : null;
    var nav = document.createElement('nav');
    nav.className = 'crumbs';
    nav.setAttribute('aria-label', 'Breadcrumb and plan flow');
    var html = '<div class="wrap crumbs-inner"><div class="crumbs-path">';
    html += '<a href="index.html">Home</a>';
    if (g) html += '<span class="crumb-sep" aria-hidden="true">/</span><a href="' + g.parent[0] + '">' + esc(g.parent[1]) + '</a>';
    html += '<span class="crumb-sep" aria-hidden="true">/</span><span class="crumb-here">' + esc(pageTitle()) + '</span>';
    html += '</div><div class="crumb-flow">';
    html += prev ? '<a class="crumb-btn" href="' + prev + '">&larr; ' + esc(SHORT[prev]) + '</a>' : '<span class="crumb-btn crumb-btn--ghost" aria-hidden="true"></span>';
    html += next ? '<a class="crumb-btn" href="' + next + '">' + esc(SHORT[next]) + ' &rarr;</a>' : '<span class="crumb-btn crumb-btn--ghost" aria-hidden="true"></span>';
    html += '</div></div>';
    nav.innerHTML = html;
    var hero = document.querySelector('.page-hero');
    if (hero) hero.insertAdjacentElement('afterend', nav);
    /* pages without a hero (agriculture, services, complaints) run self-contained
       app layouts that manage their own top spacing — skip the bar there */
  }

  /* [data-countup] (attribute = final display string). Previously animated 0→N,
     which made the hero chips jitter/shift width on every page open — now renders
     the final value statically, no animation, no layout shift. */
  function initCountUp() {
    var els = document.querySelectorAll('[data-countup]');
    if (!els.length) return;
    Array.prototype.forEach.call(els, function (el) {
      el.textContent = el.getAttribute('data-countup');
    });
  }

  document.addEventListener('DOMContentLoaded', function () { initCrumbs(); initCountUp(); });

  window.SitePartials = { header: header, footer: footer };
})();
