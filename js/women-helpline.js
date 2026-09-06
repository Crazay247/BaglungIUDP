/* ============================================================================
   Aawaj · आवाज — Women's Safety & Empowerment Portal (Baglung IUDP demo)
   React (UMD, no build). Reports stay in the visitor's own browser (localStorage).
   Nothing is transmitted anywhere. Real helplines are listed on the page.
   ============================================================================ */
(function () {
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') return;
  var h = React.createElement;

  var STORE_KEY = 'bgl_women_reports_v1';

  var CATS = [
    { k: 'domestic',  en: 'Domestic violence',            np: 'घरेलु हिंसा',           sub: 'Violence at home — physical, verbal, economic', subnp: 'घरभित्रको शारीरिक, मौखिक वा आर्थिक हिंसा' },
    { k: 'sexual',    en: 'Sexual assault or harassment', np: 'यौनजन्य आक्रमण/उत्पीडन', sub: 'Rape, molestation, harassment in public or private', subnp: 'बलात्कार, छुवाइ वा सार्वजनिक उत्पीडन' },
    { k: 'discrim',   en: 'Discrimination / inequality',  np: 'भेदभाव / असमानता',      sub: 'Denied rights, property, education or work because you are a woman', subnp: 'महिला भएकै कारण अधिकार, सम्पत्ति वा कामबाट वञ्चित' },
    { k: 'emotional', en: 'Emotional / psychological abuse', np: 'मनोवैज्ञानिक हिंसा',  sub: 'Threats, humiliation, isolation, control', subnp: 'धम्की, अपमान, एक्लो बनाउने वा नियन्त्रण' },
    { k: 'economic',  en: 'Economic abuse',               np: 'आर्थिक हिंसा',          sub: 'Denied income, property, inheritance or dowry pressure', subnp: 'आम्दानी, सम्पत्ति वा दाइजोको दबाब' },
    { k: 'child',     en: 'Child marriage / dowry / other GBV', np: 'बालविवाह / दाइजो / अन्य', sub: 'Child marriage, dowry, witchcraft accusation, trafficking', subnp: 'बालविवाह, दाइजो, बोक्सीको आरोप, मानव बेचबिखन' },
    { k: 'other',     en: 'Something else',               np: 'अन्य',                  sub: 'Anything else that made you unsafe or unequal', subnp: 'तपाईंलाई असुरक्षित वा असमान महसुस गराउने अन्य कुनै कुरा' }
  ];
  var catByKey = {}; CATS.forEach(function (c) { catByKey[c.k] = c; });

  var URGENCY = [
    { k: 'danger', en: 'Someone is in danger right now', np: 'अहिले नै खतरा छ', badge: 'danger' },
    { k: 'soon',   en: 'I need help soon',               np: 'छिट्टै सहयोग चाहिन्छ', badge: 'soon' },
    { k: 'listen', en: 'I want to be heard / documented', np: 'मेरो कुरा सुनियोस्', badge: 'listen' }
  ];

  var WHEN = [
    { k: 'today',  en: 'Today',            np: 'आज' },
    { k: 'week',   en: 'Within this week', np: 'यो हप्ताभित्र' },
    { k: 'month',  en: 'Within this month', np: 'यो महिनाभित्र' },
    { k: 'older',  en: 'Longer ago',       np: 'अझ पहिले' }
  ];

  function storageOk() {
    try { localStorage.setItem(STORE_KEY + '_probe', '1'); localStorage.removeItem(STORE_KEY + '_probe'); return true; }
    catch (e) { return false; }
  }
  function loadStore() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return [];
      var list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  }
  function saveStore(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function nextId(list) {
    var max = 0;
    list.forEach(function (r) {
      var m = /-(\d+)$/.exec(r.id || '');
      if (m) max = Math.max(max, parseInt(m[1], 10));
    });
    return 'BGL-W-2026-' + ('0000' + (max + 1)).slice(-4);
  }
  function nowIso() { return new Date().toISOString(); }
  function fmtDate(iso) {
    try {
      return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (e) { return iso; }
  }

  /* ------------------------------------------------------------------ */
  var STEP_TITLES = [
    { en: 'What happened', np: 'के भयो?' },
    { en: 'Details', np: 'विवरण' },
    { en: 'Contact', np: 'सम्पर्क' },
    { en: 'Done', np: 'भयो' }
  ];

  function StepChips(props) {
    return h('div', { className: 'wh-steps', role: 'list' },
      STEP_TITLES.map(function (s, i) {
        var cls = 'wh-step-chip' + (i === props.step ? ' on' : (i < props.step ? ' done' : ''));
        return h('span', { key: i, className: cls, role: 'listitem' },
          i < props.step ? '✓ ' : '', s.en, ' · ', s.np);
      })
    );
  }

  function Choice(props) {
    var cls = 'wh-choice' + (props.img ? ' has-img' : '') + (props.on ? ' on' : '');
    var common = { type: 'button', className: cls, onClick: props.onClick, 'aria-pressed': props.on ? 'true' : 'false' };
    if (props.img) {
      return h('button', common,
        h('span', { className: 'ch-img' },
          h('img', { src: props.img, alt: '', loading: 'lazy', decoding: 'async' }),
          props.emoji ? h('span', { className: 'ch-emoji', 'aria-hidden': 'true' }, props.emoji) : null
        ),
        h('span', { className: 'ch-txt' },
          h('span', { className: 'ch-main' }, props.main),
          h('span', { className: 'ch-sub' }, props.sub)
        )
      );
    }
    return h('button', common,
      props.emoji ? h('span', { className: 'ch-emoji', 'aria-hidden': 'true' }, props.emoji) : null,
      h('span', { className: 'ch-main' }, props.main),
      h('span', { className: 'ch-sub' }, props.sub)
    );
  }

  function Field(props) {
    return h('div', { className: 'wh-field' },
      h('label', { htmlFor: props.id }, props.label, props.hint ? h('small', null, ' — ', props.hint) : null),
      props.children,
      props.err ? h('span', { className: 'wh-frm-err' }, props.err) : null
    );
  }

  /* ------------------------------------------------------------------ */
  function App() {
    var st = React.useState({
      step: 0, done: null, myOpen: false,
      form: { cat: null, ward: '', when: '', desc: '', urgency: '', anon: true, name: '', phone: '' },
      errs: {}
    });
    var state = st[0], setState = st[1];
    var reports = React.useState(loadStore());
    var myReports = reports[0], setMyReports = reports[1];

    function patch(frag) {
      setState(function (s) { return Object.assign({}, s, { form: Object.assign({}, s.form, frag), errs: {} }); });
    }

    function submit() {
      var f = state.form;
      var errs = {};
      if (!f.cat) errs.cat = 'Choose what happened · के भयो छान्नुहोस्';
      if (!f.ward) errs.ward = 'Select a ward · वडा छान्नुहोस्';
      if (f.desc.trim().length < 10) errs.desc = 'Please write a little more (at least 10 characters) · अलि विस्तृत लेख्नुहोस्';
      if (!f.urgency) errs.urgency = 'How urgent is it? · कति तत्काल?' ;
      if (!f.anon) {
        if (!f.name.trim()) errs.name = 'Name required for a callback · पछि सम्पर्कका लागि नाम आवश्यक';
        if (!/^[+\d][\d\s-]{6,}$/.test(f.phone.trim())) errs.phone = 'A valid phone number helps us reach you · सही फोन नम्बर दिनुहोस्';
      }
      if (Object.keys(errs).length) {
        setState(function (s) { return Object.assign({}, s, { errs: errs }); });
        return;
      }
      var rec = {
        id: nextId(myReports), ts: nowIso(), status: 'Submitted',
        cat: f.cat, ward: f.ward, when: f.when, desc: f.desc.trim(),
        urgency: f.urgency, anon: f.anon,
        name: f.anon ? '' : f.name.trim(), phone: f.anon ? '' : f.phone.trim()
      };
      var list = [rec].concat(myReports);
      saveStore(list); setMyReports(list);
      setState(function (s) { return Object.assign({}, s, { step: 3, done: rec }); });
    }

    function removeOne(id) {
      var list = myReports.filter(function (r) { return r.id !== id; });
      saveStore(list); setMyReports(list);
    }
    function clearAll() {
      saveStore([]); setMyReports([]);
    }

    var f = state.form, errs = state.errs;

    /* ---- step 3: done / confirmation ---- */
    var doneCard = null;
    if (state.step === 3 && state.done) {
      var d = state.done;
      var uBadge = URGENCY.filter(function (u) { return u.k === d.urgency; })[0];
      doneCard = h('div', { className: 'wh-wizard', id: 'file' },
        h(StepChips, { step: 3 }),
        h('h3', null, 'Your report is saved · तपाईंको उजुरी सुरक्षित छ'),
        h('p', { className: 'wz-sub' }, 'Kept only in this browser — nothing was sent anywhere. · यो जानकारी तपाईंकै ब्राउजरमा मात्र छ, कतै पठाइएको छैन।'),
        h('div', { className: 'wh-confirm' },
          h('dl', null,
            h('dt', null, 'Tracking ID'), h('dd', null, d.id),
            h('dt', null, 'Category'), h('dd', null, catByKey[d.cat].en, ' · ', catByKey[d.cat].np),
            h('dt', null, 'Ward'), h('dd', null, 'Ward ', d.ward),
            h('dt', null, 'Urgency'), h('dd', null, uBadge ? uBadge.en + ' · ' + uBadge.np : d.urgency),
            h('dt', null, 'Filed as'), h('dd', null, d.anon ? 'Anonymous · गुमनाम' : d.name)
          )
        ),
        h('div', { className: 'wh-ok' },
          'Suggested next steps · अब के गर्ने?', h('br'),
          '• In danger right now? Call ', h('a', { href: 'tel:100', style: { color: 'inherit' } }, '100'), ' or ', h('a', { href: 'tel:1145', style: { color: 'inherit' } }, '1145'), ' (free, 24/7).', h('br'),
          '• Save your tracking ID — it is the only way to find this report later.', h('br'),
          '• If you are worried someone may see this device, use ', h('b', null, 'Quick Exit'), ' (button or press Esc twice).'
        ),
        h('div', { className: 'wh-nav-row' },
          h('button', { type: 'button', className: 'wh-btn wh-btn-plum', onClick: function () { setState(function (s) { return Object.assign({}, s, { myOpen: true }); }); document.getElementById('myreports').scrollIntoView({ behavior: 'smooth' }); } }, 'View my reports · मेरो उजुरीहरू'),
          h('button', {
            type: 'button', className: 'wh-btn wh-btn-ghost', style: { color: '#fff', border: '1.5px solid rgba(110,59,126,.4)' },
            onClick: function () {
              setState(function (s) {
                return Object.assign({}, s, { step: 0, done: null, errs: {}, form: { cat: null, ward: '', when: '', desc: '', urgency: '', anon: true, name: '', phone: '' } });
              });
            }
          }, 'File another · अर्को उजुरी')
        )
      );
    }

    /* ---- wizard steps 0–2 ---- */
    var wizard = h('div', { className: 'wh-wizard', id: 'file' },
      h(StepChips, { step: state.step }),

      state.step === 0 && [
        h('h3', { key: 't' }, 'What happened? · के भयो?'),
        h('p', { key: 's', className: 'wz-sub' }, 'Choose the closest one — there are no wrong answers. · जे भएको हो सो नै छान्नुहोस्।'),
        h('div', { className: 'wh-choices', key: 'c' },
          CATS.map(function (c) {
            return h(Choice, { key: c.k, on: f.cat === c.k, onClick: function () { patch({ cat: c.k }); },
              emoji: { domestic: '🏠', sexual: '🚫', discrim: '⚖️', emotional: '💭', economic: '💰', child: '👧', other: '✋' }[c.k],
              img: 'assets/photos/stock/wh-' + c.k + '.jpg',
              main: c.en + ' · ' + c.np, sub: c.sub + ' — ' + c.subnp });
          })
        ),
        errs.cat ? h('span', { className: 'wh-frm-err', key: 'e' }, errs.cat) : null,
        h('div', { className: 'wh-nav-row', key: 'n' },
          h('button', { type: 'button', className: 'wh-btn wh-btn-plum', onClick: function () { if (!f.cat) { setState(function (s) { return Object.assign({}, s, { errs: { cat: errs.cat || 'Choose one to continue · अगाडि बढ्न छान्नुहोस्' } }); }); return; } setState(function (s) { return Object.assign({}, s, { step: 1 }); }); } }, 'Next · अगाडि →'),
          h('a', { className: 'wh-btn wh-btn-danger', href: 'tel:100' }, '📞 In danger? Call 100')
        )
      ],

      state.step === 1 && [
        h('h3', { key: 't' }, 'Tell us a little more · थप विवरण'),
        h('p', { key: 's', className: 'wz-sub' }, 'Write only what you are comfortable sharing. · तपाईं सहज हुने जति मात्र लेख्नुहोस्।'),
        h('div', { className: 'wh-choices', key: 'u' },
          URGENCY.map(function (u) {
            return h(Choice, { key: u.k, on: f.urgency === u.k, onClick: function () { patch({ urgency: u.k }); },
              main: u.en + ' · ' + u.np, sub: '' });
          })
        ),
        errs.urgency ? h('span', { className: 'wh-frm-err', key: 'eu' }, errs.urgency) : null,
        h(Field, { key: 'w', id: 'wh-ward', label: 'Ward · वडा', err: errs.ward },
          h('select', { id: 'wh-ward', value: f.ward, onChange: function (e) { patch({ ward: e.target.value }); } },
            h('option', { value: '' }, 'Select ward · वडा छान्नुहोस्'),
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].map(function (n) {
              return h('option', { key: n, value: String(n) }, 'Ward ' + n);
            })
          )
        ),
        h(Field, { key: 'wh', id: 'wh-when', label: 'When did it last happen? · कहिले भयो?' },
          h('select', { id: 'wh-when', value: f.when, onChange: function (e) { patch({ when: e.target.value }); } },
            h('option', { value: '' }, 'Select · छान्नुहोस्'),
            WHEN.map(function (w) { return h('option', { key: w.k, value: w.k }, w.en + ' · ' + w.np); })
          )
        ),
        h(Field, { key: 'd', id: 'wh-desc', label: 'What happened? · के भयो?', hint: 'names are optional', err: errs.desc },
          h('textarea', { id: 'wh-desc', value: f.desc, onChange: function (e) { patch({ desc: e.target.value }); },
            placeholder: 'Describe what happened, where, and by whom — as much or as little as you want. · के, कहाँ र कसैले भयो, जति सहज छ त्यति लेख्नुहोस्।' })
        ),
        h('div', { className: 'wh-nav-row', key: 'n' },
          h('button', { type: 'button', className: 'wh-back', onClick: function () { setState(function (s) { return Object.assign({}, s, { step: 0 }); }); } }, '← Back · पछाडि'),
          h('button', { type: 'button', className: 'wh-btn wh-btn-plum', onClick: function () { setState(function (s) { return Object.assign({}, s, { step: 2 }); }); } }, 'Next · अगाडि →')
        )
      ],

      state.step === 2 && [
        h('h3', { key: 't' }, 'Contact & privacy · सम्पर्क र गोपनीयता'),
        h('p', { key: 's', className: 'wz-sub' }, 'Reporting anonymously is completely fine. · गुमनाम उजुरी गर्न पनि पूर्ण रूपमा सही छ।'),
        h('label', { className: 'wh-check', key: 'a' },
          h('input', { type: 'checkbox', checked: f.anon, onChange: function (e) { patch({ anon: e.target.checked }); } }),
          h('span', null,
            h('b', null, 'File anonymously · गुमनाम उजुरी'), 
            h('div', { className: 'ck-sub' }, 'No name or phone is saved. Nobody can trace this report back to you from this page. · नाम वा फोन नम्बर सुरक्षित हुँदैन।')
          )
        ),
        !f.anon && [
          h(Field, { key: 'n', id: 'wh-name', label: 'Your name · तपाईंको नाम', err: errs.name },
            h('input', { id: 'wh-name', value: f.name, onChange: function (e) { patch({ name: e.target.value }); }, autoComplete: 'off' })
          ),
          h(Field, { key: 'p', id: 'wh-phone', label: 'Phone for callback · सम्पर्क नम्बर', hint: 'a trusted number, not one your abuser checks', err: errs.phone },
            h('input', { id: 'wh-phone', type: 'tel', value: f.phone, onChange: function (e) { patch({ phone: e.target.value }); }, autoComplete: 'off', inputMode: 'tel' })
          )
        ],
        h('div', { className: 'wh-privacy-note', key: 'pn' },
          '🔒 ', h('b', null, 'Demo notice · डेमो सूचना: '), 'This portal is a demonstration prototype. Reports are stored only in this browser (localStorage) and are NOT sent to the municipality, police, or anyone else. For real help today, call ', h('b', null, '1145'), ' or ', h('b', null, '100'), '.'),
        h('div', { className: 'wh-nav-row', key: 'n' },
          h('button', { type: 'button', className: 'wh-back', onClick: function () { setState(function (s) { return Object.assign({}, s, { step: 1 }); }); } }, '← Back · पछाडि'),
          h('button', { type: 'button', className: 'wh-btn wh-btn-plum', onClick: submit }, 'Submit report · उजुरी दर्ता गर्नुहोस्')
        )
      ]
    );

    /* ---- my reports ---- */
    var myReportsCard = h('div', { id: 'myreports' },
      h('h3', { style: { fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--wh-ink)', margin: '40px 0 6px' } },
        'My reports · मेरा उजुरीहरू'),
      h('p', { style: { color: 'var(--wh-soft)', fontSize: '.92rem', fontWeight: 600 } },
        'Only the reports filed from this browser are shown here — never anyone else\u2019s. · यहाँ यसै ब्राउजरबाट दर्ता भएका मात्र उजुरी देखिन्छन्।'),
      myReports.length === 0
        ? h('div', { className: 'wh-empty' }, 'No reports yet from this browser. · यस ब्राउजरबाट अझै कुनै उजुरी छैन।')
        : h('div', { className: 'wh-appts' },
            myReports.map(function (r) {
              var c = catByKey[r.cat] || { en: r.cat, np: '' };
              var u = URGENCY.filter(function (x) { return x.k === r.urgency; })[0];
              return h('div', { className: 'wh-appt', key: r.id },
                h('div', { className: 'ap-body' },
                  h('div', null,
                    h('span', { className: 'ap-id' }, r.id), ' ',
                    u ? h('span', { className: 'wh-badge ' + u.badge }, u.en) : null, ' ',
                    h('span', { className: 'wh-badge status' }, r.status)
                  ),
                  h('div', { style: { marginTop: 6 } }, h('b', null, c.en, r.np ? ' · ' + c.np : '')),
                  h('div', { className: 'ap-meta' }, 'Ward ', r.ward, ' · ', fmtDate(r.ts), ' · ', r.anon ? 'Anonymous · गुमनाम' : r.name),
                  h('div', { className: 'ap-meta', style: { marginTop: 4 } }, r.desc)
                ),
                h('button', { type: 'button', className: 'wh-cancel', onClick: function () { removeOne(r.id); } }, 'Delete · मेट्नुहोस्')
              );
            })
          ),
      myReports.length > 0 && h('div', { className: 'wh-clear-row' },
        h('button', { type: 'button', className: 'wh-cancel', onClick: clearAll }, 'Delete all · सबै मेट्नुहोस्')
      )
    );

    return h('section', { className: 'wh-sec', id: 'report', 'aria-labelledby': 'rep-h' },
      h('div', { className: 'wrap' },
        h('div', { className: 'wh-kicker' }, 'Report · उजुरी गर्नुहोस्'),
        h('h2', { id: 'rep-h' }, 'Tell us what happened ', h('span', { className: 'np', lang: 'ne' }, '· आफ्नो कुरा राख्नुहोस्')),
        h('p', { className: 'wh-sub' }, 'Three short steps. Anonymous by default. Nothing leaves this browser. ', h('span', { lang: 'ne', style: { fontWeight: 700, color: 'var(--wh-purple)' } }, 'तीन साना चरण। गुमनाम रूपमा। कुनै पनि जानकारी यो ब्राउजरबाहिर जाँदैन।')),
        wizard,
        doneCard || h('div', null),
        myReportsCard
      )
    );
  }

  var rootEl = document.getElementById('wh-root');
  if (rootEl) ReactDOM.createRoot(rootEl).render(h(App));
})();
