/* ============================================================================
   Service Guide — "Do I have everything?" (Baglung IUDP)
   React (UMD, no build). Static data of common municipal services with
   bilingual document checklists. Requirements follow common Nepali municipal
   practice (LGO 2073); specifics confirmed at the counters.
   ============================================================================ */
(function () {
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') return;
  var h = React.createElement;

  var LOGO = 'assets/logos/baglung-municipality-logo.png';

  var CATS = [
    { k: 'all',     en: 'All services', np: 'सबै' },
    { k: 'vital',   en: 'Vital events', np: 'दर्ता' },
    { k: 'permit',  en: 'Permits & licences', np: 'अनुमति' },
    { k: 'revenue', en: 'Revenue & tax', np: 'राजस्व' }
  ];

  var SERVICES = [
    {
      id: 'birth', cat: 'vital',
      en: 'Birth Certificate', np: 'जन्मदर्ता', emj: '👶',
      desc: 'Registration of a birth — needed for citizenship, school admission and every document later in life.',
      docs: [
        { en: 'Hospital discharge / birth notice', np: 'अस्पताल डिस्चार्ज वा जन्म सूचना' },
        { en: 'Mother or father\u0027s citizenship copy', np: 'आमा वा बुबाको नागरिकता' },
        { en: 'Applicant\u0027s citizenship (if 16 or above)', np: 'आवेदकको नागरिकता (१६ वर्षभन्दा माथि)' },
        { en: 'Ward attestation / tole committee letter (home birth)', np: 'घरमा जन्मिएको भए वडा सिफारिस' }
      ],
      where: 'Central counters → Vital events (Counter 2)',
      timeline: 'Same day when filed on time',
      fee: 'No fee within 35 days of birth; late fee per schedule'
    },
    {
      id: 'death', cat: 'vital',
      en: 'Death Registration', np: 'मृत्युदर्ता', emj: '🕊️',
      desc: 'Registration of a death — settles records, pensions and property succession.',
      docs: [
        { en: 'Death notice (hospital / house statement)', np: 'मृत्युको जानकारी पत्र' },
        { en: 'Deceased\u0027s citizenship copy', np: 'मृतकको नागरिकता' },
        { en: 'Applicant\u0027s citizenship and relation proof', np: 'आवेदकको नागरिकता र नाता' },
        { en: 'Ward attestation for home death', np: 'घरमै मृत्यु भएको भए वडा सिफारिस' }
      ],
      where: 'Central counters → Vital events (Counter 2)',
      timeline: 'Same day; late registration after verification',
      fee: 'Registration itself is free'
    },
    {
      id: 'marriage', cat: 'vital',
      en: 'Marriage Registration', np: 'विवाह दर्ता', emj: '💍',
      desc: 'Registers the marriage legally — required for citizenship recommendation of spouses and family records.',
      docs: [
        { en: 'Citizenship of both spouses', np: 'दुवै पतिपत्नीको नागरिकता' },
        { en: 'Two witnesses with citizenship', np: 'दुई जना साक्षी र उनीहरूको नागरिकता' },
        { en: 'Photos (couple + witnesses)', np: 'फोटाहरू' },
        { en: 'Divorce decree / death cert of prior spouse (if applicable)', np: 'अघिल्लो विवाह समाप्त भएको कागज' }
      ],
      where: 'Central counters → Vital events (Counter 2)',
      timeline: 'Same day; register within 35 days of marriage',
      fee: 'Free at the counter'
    },
    {
      id: 'citizenship', cat: 'vital',
      en: 'Citizenship Recommendation', np: 'नागरिकता सिफारिस', emj: '🪪',
      desc: 'The municipality\u0027s recommendation letter you carry to the District Administration Office for a citizenship card.',
      docs: [
        { en: 'Birth certificate', np: 'जन्मदर्ता' },
        { en: 'Citizenship of one parent', np: 'आमा वा बुबाको नागरिकता' },
        { en: 'Permanent address proof / ward verification', np: 'स्थायी ठेगाना र वडा प्रमाण' },
        { en: 'Photos and prescribed forms', np: 'फोटो र फारम' }
      ],
      where: 'Your ward office → municipal recommendation desk',
      timeline: 'A few working days (varies by ward)',
      fee: 'No service fee'
    },
    {
      id: 'permit', cat: 'permit',
      en: 'Building Permit', np: 'भवन निर्माण अनुमति', emj: '🏗️',
      desc: 'Approval to construct or repair — drawings must meet the Nepal Building Codes (NBC 105/110).',
      docs: [
        { en: 'Lalpurja (land ownership certificate)', np: 'लालपुर्जा' },
        { en: 'Cadastral map of the plot', np: 'नक्सा प्रति (जग्गाको नापी)' },
        { en: 'House & land tax receipt', np: 'घरजग्गा करको भुक्तानी रसिद' },
        { en: 'Site plan & drawings by architect / engineer', np: 'साइट प्लान र नक्सा (इन्जिनियर/आर्किटेक्ट)' },
        { en: 'Ward land-use confirmation', np: 'वडाको जग्गा प्रयोग सिफारिस' }
      ],
      where: 'Planning & building permit unit',
      timeline: 'Simple structures up to ~15 days; verified buildings per by-law',
      fee: 'Per building permit by-law schedule'
    },
    {
      id: 'business', cat: 'permit',
      en: 'Business Registration', np: 'फर्म दर्ता', emj: '🏪',
      desc: 'Licences a firm or shop operating in the municipality — keeps records clean for renewal and tax.',
      docs: [
        { en: 'Trade / firm name approval', np: 'फर्म नाम स्वीकृति' },
        { en: 'Citizenship of owner / all partners', np: 'धनी वा साझेदारहरूको नागरिकता' },
        { en: 'Rent agreement or ownership of trade place', np: 'पसल स्थानको लिज वा स्वामित्व' },
        { en: 'Trade description and photos', np: 'व्यवसाय विवरण र फोटो' },
        { en: 'VAT / PAN details (if applicable)', np: 'VAT/PAN विवरण (लागू भएमा)' }
      ],
      where: 'Business & revenue unit',
      timeline: 'A few working days',
      fee: 'Per licence fee schedule'
    },
    {
      id: 'landtax', cat: 'revenue',
      en: 'House & Land Tax', np: 'घरजग्गा कर', emj: '🧾',
      desc: 'Annual municipal levy on property — the receipt is asked for by every permit and at sale time.',
      docs: [
        { en: 'Previous tax bill / receipt', np: 'अघिल्लो वर्षको कर बिल वा रसिद' },
        { en: 'Lalpurja or deed details', np: 'लालपुर्जा वा कित्ता विवरण' },
        { en: 'Owner\u0027s citizenship', np: 'धनीको नागरिकता' }
      ],
      where: 'Revenue counter',
      timeline: 'Same day; pay on time to avoid fine',
      fee: 'Annual levy per valuation; no fine if paid on time'
    }
  ];

  function matchSvc(s, q) {
    if (!q) return true;
    var hay = (s.en + ' ' + s.np + ' ' + s.desc + ' ' + s.where + ' ' + s.docs.map(function (d) { return d.en + ' ' + d.np; }).join(' ')).toLowerCase();
    return hay.indexOf(q.toLowerCase()) !== -1;
  }

  var DOC = function (d, done, toggle) {
    return h('li', null,
      h('button', { type: 'button', className: 'doc-toggle' + (done ? ' done' : ''), onClick: toggle, 'aria-pressed': done },
        h('span', { className: 'box' }, done ? '✓' : ''),
        h('span', { className: 'dt' }, d.en, h('em', { lang: 'ne' }, d.np))));
  };
  var META = function (ic, label, en, np) {
    return h('div', null,
      h('span', { className: 'mk', 'aria-hidden': 'true' }, ic, ' '),
      h('span', null, h('b', null, label, ': '), en, np ? h('span', { className: 'np', lang: 'ne' }, np) : null));
  };

  function App() {
    var qS = React.useState('');
    var q = qS[0], setQ = qS[1];
    var catS = React.useState('all');
    var cat = catS[0], setCat = catS[1];
    var doneS = React.useState({});
    var done = doneS[0], setDone = doneS[1];

    function toggle(id, i) {
      var key = id + ':' + i;
      var next = {};
      for (var k in done) next[k] = done[k];
      if (next[key]) delete next[key]; else next[key] = 1;
      setDone(next);
    }
    function reset() { setDone({}); setQ(''); setCat('all'); }

    var shown = SERVICES.filter(function (s) { return (cat === 'all' || s.cat === cat) && matchSvc(s, q); });
    function count(k) { return SERVICES.filter(function (s) { return s.cat === k; }).length; }
    var ticked = Object.keys(done).length;

    return h('div', { className: 'srv' },
      h('section', { className: 'srv-hero' },
        h('div', { className: 'wrap' },
          h('div', { className: 'srv-seal' },
            h('img', { src: LOGO, alt: 'Baglung Municipality logo' }),
            h('b', null, 'Baglung Municipality · Citizen services', h('small', { lang: 'ne' }, 'बागलुङ नगरपालिका — नागरिक सेवा'))),
          h('h1', null, 'What do you need? ', h('em', null, 'We list every document.')),
          h('p', { className: 'sub' }, 'Tap a service, tick what you already have, and see in one glance what is missing — before you stand in line. ', h('b', null, 'के चाहिन्छ भन्ने थाहा पाउनुहोस्।')),
          h('div', { className: 'srv-search' },
            h('span', { className: 's-ic', 'aria-hidden': 'true' }, '🔎'),
            h('input', { type: 'search', placeholder: 'Search: birth · permit · tax · जन्मदर्ता …', value: q, onChange: function (e) { setQ(e.target.value); }, 'aria-label': 'Search services' }),
            q ? h('button', { className: 'clear', onClick: function () { setQ(''); } }, 'Clear') : null),
          h('div', { className: 'srv-chiprow' },
            CATS.map(function (c) {
              var n = c.k === 'all' ? SERVICES.length : count(c.k);
              return h('button', { type: 'button', key: c.k, className: 'srv-chip' + (cat === c.k ? ' on' : ''),
                onClick: function () { setCat(c.k); } }, c.en, ' ', h('small', { lang: 'ne' }, c.np, ' · ', n));
            }))
        )
      ),

      h('section', { className: 'srv-grid' },
        h('div', { className: 'wrap' },
          h('div', { className: 'srv-note' },
            h('span', { 'aria-hidden': 'true' }, '📌'),
            h('div', null,
              h('b', null, 'Demo guide · नमुना मार्गदर्शन '),
              'Requirements follow common municipal practice and LGO 2073. Fees and timelines can change — always confirm with your ',
              h('a', { href: 'complaints.html#official' }, 'ward office'),
              ' before visiting.')),
          h('div', { className: 'srv-stats' },
            h('b', null, String(shown.length)),
            ' of ', String(SERVICES.length), ' services shown · ', String(ticked), ' item' + (ticked === 1 ? '' : 's'), ' ticked',
            ticked ? h('span', null, ' — ', h('button', { type: 'button', onClick: reset, style: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--moss)', fontWeight: 800, textDecoration: 'underline', fontSize: 'inherit' } }, 'reset')) : null),
          !shown.length ?
            h('div', { className: 'srv-empty' }, 'No service matches, ', h('b', null, q), '. Try "birth", "permit" or "tax" · कृपया अर्को शब्द लेख्नुहोस्।') :
            h('div', { className: 'srv-cards' },
              shown.map(function (s) {
                var total = s.docs.length;
                var got = s.docs.reduce(function (acc, d, i) { return acc + (done[s.id + ':' + i] ? 1 : 0); }, 0);
                var pct = Math.round(got / total * 100);
                return h('div', { className: 'srv-card', key: s.id },
                  h('div', { className: 'srv-head' },
                    h('span', { className: 'ce', 'aria-hidden': 'true' }, s.emj),
                    h('h3', null, s.en, h('span', { className: 'np', lang: 'ne' }, s.np)),
                    h('span', { className: 'srv-cat' }, (CATS.find(function (c) { return c.k === s.cat; }) || {}).en)),
                  h('p', { className: 'srv-desc' }, s.desc),
                  h('div', { className: 'srv-tagline' }, 'Required documents · आवश्यक कागजात'),
                  h('div', { className: 'prog' },
                    h('div', { className: 'prog-top' },
                      h('span', null, got === total ? 'All set ✓' : (got + ' of ' + total + ' ready · तयार')),
                      h('b', null, pct + '%')),
                    h('div', null, h('div', { className: 'prog-fill', style: { width: pct + '%' } }))),
                  h('ul', { className: 'docs' },
                    s.docs.map(function (d, i) { return DOC(d, !!done[s.id + ':' + i], function () { toggle(s.id, i); }); })),
                  h('div', { className: 'srv-meta' },
                    META('🏛️', 'Where', s.where, ''),
                    META('⏱️', 'Timeline', s.timeline, ''),
                    META('💵', 'Fee', s.fee, '')),
                  got === total ? h('span', { className: 'srv-ready go' }, '✓ Ready — take these to the counter · तयार हुनुहुन्छ') : null
                );
              })
            )
        )
      )
    );
  }

  var rootEl = document.getElementById('srv-root');
  if (rootEl) ReactDOM.createRoot(rootEl).render(h(App));
})();