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

  /* Dedicated quick-tap questions per category. All optional — they only
     appear on that category's own form. tag = short bilingual label used
     in the saved report summary. note = info box shown when `when` is picked. */
  var EXTRA = {
    domestic: [
      { key: 'dm_who', q: 'Who is harming you?', qnp: 'हानि पुर्‍याउने को हो?', tag: 'Who · को',
        opts: [
          { k: 'partner', en: 'Partner / spouse', np: 'श्रीमान् / श्रीमती / साथी' },
          { k: 'inlaw', en: 'In-law or family member', np: 'सासू-ससुरा वा परिवारका सदस्य' },
          { k: 'parent', en: 'Parent', np: 'आमाबुबा' },
          { k: 'other_hh', en: 'Other household member', np: 'घरका अन्य सदस्य' } ] },
      { key: 'dm_live', q: 'Do you live with them?', qnp: 'तपाईं उनीहरूसँगै बस्नुहुन्छ?', tag: 'Lives together · सँगै बसाइ',
        opts: [
          { k: 'yes', en: 'Yes', np: 'हो' },
          { k: 'no', en: 'No', np: 'होइन' },
          { k: 'sometimes', en: 'Sometimes', np: 'कहिलेकाहीँ' } ] },
      { key: 'dm_kids', q: 'Are children affected too?', qnp: 'बालबालिका पनि प्रभावित छन्?', tag: 'Children affected · बालबालिका',
        opts: [
          { k: 'yes', en: 'Yes', np: 'छन्' },
          { k: 'no', en: 'No', np: 'छैनन्' } ] }
    ],
    sexual: [
      { key: 'sx_where', q: 'Where did it happen?', qnp: 'कहाँ भयो?', tag: 'Where · कहाँ',
        opts: [
          { k: 'home', en: 'Home', np: 'घर' },
          { k: 'work', en: 'Workplace', np: 'कार्यस्थल' },
          { k: 'public', en: 'Public place / street', np: 'सार्वजनिक ठाउँ / बाटो' },
          { k: 'school', en: 'School / campus', np: 'विद्यालय / क्याम्पस' },
          { k: 'online', en: 'Online', np: 'अनलाइन' } ] },
      { key: 'sx_care', q: 'Do you need medical care right now?', qnp: 'अहिले उपचार चाहिन्छ?', tag: 'Medical care · उपचार',
        opts: [
          { k: 'yes', en: 'Yes', np: 'चाहिन्छ' },
          { k: 'no', en: 'No', np: 'चाहिँदैन' } ],
        note: { when: 'yes',
          en: 'Dhaulagiri Hospital (068-520288) gives free, confidential checkups — please go as soon as you can, and avoid bathing or changing clothes before the checkup if possible.',
          np: 'धौलागिरि अस्पताल (068-520288) मा निःशुल्क, गोप्य जाँच हुन्छ — सक्दो चाँडो जानुहोस्।' } }
    ],
    discrim: [
      { key: 'dc_where', q: 'Where are you facing this?', qnp: 'कहाँ भेदभाव भइरहेको छ?', tag: 'Where · कहाँ',
        opts: [
          { k: 'work', en: 'Work', np: 'काममा' },
          { k: 'school', en: 'School / college', np: 'पढाइमा' },
          { k: 'property', en: 'Property / inheritance', np: 'सम्पत्ति / अंशमा' },
          { k: 'citizen', en: 'Citizenship / documents', np: 'नागरिकता / कागजातमा' },
          { k: 'services', en: 'Public services', np: 'सार्वजनिक सेवामा' } ] }
    ],
    emotional: [
      { key: 'em_who', q: 'Who is doing this?', qnp: 'यो गर्ने को हो?', tag: 'Who · को',
        opts: [
          { k: 'partner', en: 'Partner / spouse', np: 'श्रीमान् / श्रीमती / साथी' },
          { k: 'family', en: 'Family member', np: 'परिवारका सदस्य' },
          { k: 'boss', en: 'Employer / teacher', np: 'रोजगारदाता / शिक्षक' },
          { k: 'other', en: 'Someone else', np: 'अरू कोही' } ] },
      { key: 'em_often', q: 'How often does it happen?', qnp: 'कत्तिको बारम्बार हुन्छ?', tag: 'How often · बारम्बारता',
        opts: [
          { k: 'daily', en: 'Daily', np: 'दैनिक' },
          { k: 'weekly', en: 'Weekly', np: 'हप्तामा' },
          { k: 'ongoing', en: 'Constant control', np: 'निरन्तर नियन्त्रण' } ] }
    ],
    economic: [
      { key: 'ec_what', q: 'What is being denied or controlled?', qnp: 'के रोकिएको वा नियन्त्रणमा छ?', tag: 'What · के',
        opts: [
          { k: 'income', en: 'My income / wages', np: 'मेरो आम्दानी / ज्याला' },
          { k: 'property', en: 'Property / land', np: 'सम्पत्ति / जग्गा' },
          { k: 'inherit', en: 'Inheritance share', np: 'अंश' },
          { k: 'dowry', en: 'Dowry pressure', np: 'दाइजोको दबाब' },
          { k: 'cash', en: 'Access to money', np: 'पैसामा पहुँच' } ] }
    ],
    child: [
      { key: 'ch_who', q: 'Is this about you or someone else?', qnp: 'यो तपाईं वा अरू कसैको बारेमा हो?', tag: 'About · बारेमा',
        opts: [
          { k: 'me', en: 'Me', np: 'म' },
          { k: 'daughter', en: 'My daughter / relative', np: 'मेरी छोरी / नातेदार' },
          { k: 'known', en: 'Someone I know', np: 'चिनेको व्यक्ति' } ] },
      { key: 'ch_fixed', q: 'Is a wedding or event already fixed?', qnp: 'विवाह वा कार्यक्रम तय भइसकेको छ?', tag: 'Event fixed · तय',
        opts: [
          { k: 'fixed', en: 'Yes, date fixed', np: 'हो, मिति तय छ' },
          { k: 'planning', en: 'Being planned', np: 'कुरा चल्दैछ' },
          { k: 'done', en: 'Already happened', np: 'भइसक्यो' },
          { k: 'na', en: 'Not applicable', np: 'लागू हुँदैन' } ] }
    ],
    other: []
  };

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
    { en: 'Your report', np: 'तपाईंको उजुरी' },
    { en: 'Done', np: 'भयो' }
  ];

  var ERR_IDS = {
    cat: 'wh-err-cat', urgency: 'wh-err-urgency', ward: 'wh-err-ward',
    desc: 'wh-err-desc', name: 'wh-err-name', phone: 'wh-err-phone'
  };

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
    var common = { type: 'button', className: cls, onClick: props.onClick };
    if (props.radio) {
      common.role = 'radio';
      common['aria-checked'] = props.on ? 'true' : 'false';
    } else {
      common['aria-pressed'] = props.on ? 'true' : 'false';
    }
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
    var child = React.Children.only(props.children);
    var extra = {};
    if (props.req) { extra.required = true; extra['aria-required'] = 'true'; }
    if (props.err) {
      extra['aria-invalid'] = 'true';
      if (props.errId) extra['aria-describedby'] = props.errId;
    }
    return h('div', { className: 'wh-field' },
      h('label', { htmlFor: props.id },
        props.label,
        props.req ? h('span', { className: 'wh-reqd', 'aria-hidden': 'true' }, ' *') : null,
        props.req ? h('span', { className: 'wh-vh' }, ' (required)') : null,
        props.hint ? h('small', null, ' — ', props.hint) : null),
      React.cloneElement(child, extra),
      props.err ? h('span', { className: 'wh-frm-err', id: props.errId, role: 'alert', tabIndex: -1 }, props.err) : null
    );
  }

  function GroupHead(props) {
    return h('h4', { className: 'wh-group-h' }, props.children,
      props.req ? h('span', { className: 'wh-reqd', 'aria-hidden': 'true' }, ' *') : null,
      props.req ? h('span', { className: 'wh-vh' }, ' (required)') : null);
  }

  function focusErr(id, ev) {
    if (ev) ev.preventDefault();
    var t = document.getElementById(id);
    if (t) { t.setAttribute('tabindex', '-1'); t.scrollIntoView({ block: 'center' }); t.focus({ preventScroll: true }); }
  }

  /* ------------------------------------------------------------------ */
  function App() {
    var st = React.useState({
      step: 0, done: null, myOpen: false,
      form: { cat: null, ward: '', when: '', desc: '', urgency: '', anon: true, name: '', phone: '', extra: {} },
      errs: {}
    });
    var state = st[0], setState = st[1];
    var reports = React.useState(loadStore());
    var myReports = reports[0], setMyReports = reports[1];

    function patch(frag) {
      setState(function (s) { return Object.assign({}, s, { form: Object.assign({}, s.form, frag), errs: {} }); });
    }

    function patchExtra(k, v) {
      setState(function (s) {
        var ex = Object.assign({}, s.form.extra || {});
        ex[k] = v;
        return Object.assign({}, s, { form: Object.assign({}, s.form, { extra: ex }), errs: {} });
      });
    }

    function extraLabelFor(cat, extra) {
      var parts = [];
      ((EXTRA[cat] || [])).forEach(function (q) {
        var v = (extra || {})[q.key];
        if (!v) return;
        var o = q.opts.filter(function (x) { return x.k === v; })[0];
        if (o) parts.push(q.tag + ': ' + o.en);
      });
      return parts.join(' · ');
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
        setTimeout(function () {
          var s = document.getElementById('wh-err-summary');
          if (s) { s.scrollIntoView({ block: 'center' }); s.focus({ preventScroll: true }); }
        }, 60);
        return;
      }
      var rec = {
        id: nextId(myReports), ts: nowIso(), status: 'Submitted',
        cat: f.cat, ward: f.ward, when: f.when, desc: f.desc.trim(),
        urgency: f.urgency, anon: f.anon,
        name: f.anon ? '' : f.name.trim(), phone: f.anon ? '' : f.phone.trim(),
        extra: f.extra || {}, extraLabel: extraLabelFor(f.cat, f.extra || {})
      };
      var list = [rec].concat(myReports);
      saveStore(list); setMyReports(list);
      setState(function (s) { return Object.assign({}, s, { step: 1, done: rec }); });
      setTimeout(function () {
        var w = document.getElementById('file');
        if (w) w.scrollIntoView();
        var t = document.querySelector('#file .wh-done-h');
        if (t) { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
      }, 60);
    }

    function removeOne(id) {
      var list = myReports.filter(function (r) { return r.id !== id; });
      saveStore(list); setMyReports(list);
    }
    function clearAll() {
      saveStore([]); setMyReports([]);
    }

    var f = state.form, errs = state.errs;

    /* ---- error summary (form view) ---- */
    var errList = Object.keys(errs).map(function (k) {
      return ERR_IDS[k] ? { k: k, id: ERR_IDS[k], msg: errs[k] } : null;
    }).filter(Boolean);

    var errSummary = errList.length ? h('div', { className: 'wh-err-summary', id: 'wh-err-summary', role: 'alert', tabIndex: -1 },
      h('b', null, 'Please fix ' + errList.length + (errList.length > 1 ? ' things' : ' thing') + ' below · कृपया तल सच्याउनुहोस्'),
      h('ul', null, errList.map(function (e) {
        return h('li', { key: e.k }, h('a', { href: '#' + e.id, onClick: function (ev) { focusErr(e.id, ev); } }, e.msg));
      }))
    ) : null;

    /* ---- step 1: done / confirmation ---- */
    var doneCard = null;
    if (state.step === 1 && state.done) {
      var d = state.done;
      var uBadge = URGENCY.filter(function (u) { return u.k === d.urgency; })[0];
      doneCard = h('div', { className: 'wh-wizard', id: 'file' },
        h(StepChips, { step: 1 }),
        h('h3', { className: 'wh-done-h' }, 'Your report is saved · तपाईंको उजुरी सुरक्षित छ'),
        h('p', { className: 'wz-sub' }, 'Kept only in this browser — nothing was sent anywhere. · यो जानकारी तपाईंकै ब्राउजरमा मात्र छ, कतै पठाइएको छैन।'),
        h('div', { className: 'wh-confirm' },
          h('dl', null,
            h('dt', null, 'Tracking ID'), h('dd', null, d.id),
            h('dt', null, 'Category'), h('dd', null, catByKey[d.cat].en, ' · ', catByKey[d.cat].np),
            d.extraLabel ? h('dt', null, 'Your answers') : null,
            d.extraLabel ? h('dd', null, d.extraLabel) : null,
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
          h('button', { type: 'button', className: 'wh-btn wh-btn-plum', onClick: function () { setState(function (s) { return Object.assign({}, s, { myOpen: true }); }); var m = document.getElementById('myreports-h'); if (m) { m.scrollIntoView({ behavior: 'smooth' }); m.setAttribute('tabindex', '-1'); m.focus({ preventScroll: true }); } } }, 'View my reports · मेरो उजुरीहरू'),
          h('button', {
            type: 'button', className: 'wh-btn wh-btn-ghost', style: { color: '#fff', border: '1.5px solid rgba(110,59,126,.4)' },
            onClick: function () {
              setState(function (s) {
                return Object.assign({}, s, { step: 0, done: null, errs: {}, form: { cat: null, ward: '', when: '', desc: '', urgency: '', anon: true, name: '', phone: '', extra: {} } });
              });
            }
          }, 'File another · अर्को उजुरी')
        )
      );
    }

    /* ---- card grid (pick a case) + dedicated form per category ---- */
    var picked = f.cat ? catByKey[f.cat] : null;
    var exQs = f.cat ? (EXTRA[f.cat] || []) : [];
    var exVals = f.extra || {};

    var wizard = h('div', { className: 'wh-wizard', id: 'file' },
      h(StepChips, { step: state.step }),

      state.step === 0 && !f.cat && [
        h('h3', { key: 't' }, 'What happened? · के भयो?'),
        h('p', { key: 's', className: 'wz-sub' }, 'Tap a card to open its own short form — each one asks only what matters for that case. · आफ्नो फारम खोल्न कार्ड थिच्नुहोस्।'),
        h('div', { key: 'c', className: 'wh-choices' },
          CATS.map(function (c) {
            return h(Choice, { key: c.k, onClick: function () {
                setState(function (s) { return Object.assign({}, s, { form: Object.assign({}, s.form, { cat: c.k }), errs: {} }); });
                setTimeout(function () { var w = document.getElementById('file'); if (w) w.scrollIntoView(); }, 60);
              },
              emoji: { domestic: '🏠', sexual: '🚫', discrim: '⚖️', emotional: '💭', economic: '💰', child: '👧', other: '✋' }[c.k],
              img: 'assets/photos/stock/wh-' + c.k + '.jpg',
              main: c.en + ' · ' + c.np, sub: c.sub + ' — ' + c.subnp });
          })
        ),
        h('div', { key: 'n', className: 'wh-nav-row' },
          h('a', { className: 'wh-btn wh-btn-danger', href: 'tel:100' }, '📞 In danger? Call 100')
        )
      ],

      state.step === 0 && f.cat && [
        errSummary ? React.cloneElement(errSummary, { key: 'es' }) : null,
        h('div', { key: 'pick', className: 'wh-pick' },
          h('img', { src: 'assets/photos/stock/wh-' + f.cat + '.jpg', alt: '' }),
          h('div', { className: 'wh-pick-t' }, h('b', null, picked.en), h('span', null, picked.np)),
          h('button', { type: 'button', className: 'wh-back', onClick: function () { patch({ cat: null }); setTimeout(function () { var w = document.getElementById('file'); if (w) w.scrollIntoView(); }, 60); } }, 'Change · परिवर्तन')
        ),
        h('h3', { key: 't' }, 'Your report · तपाईंको उजुरी'),
        h('p', { key: 's', className: 'wz-sub' }, 'One short form — fill everything below, then press one button. Anonymous by default. · एउटै छोटो फारम — तल सबै भरेर एउटा बटन थिच्नुहोस्। गुमनाम रूपमा।'),

        exQs.length ? h(GroupHead, { key: 'ghx' }, 'About this case · यस घटनाबारे') : null,
        exQs.length ? h('p', { key: 'sx', className: 'wz-sub' }, 'Quick taps only — everything here is optional, skip anything. · छिटो छान्नुहोस् — यहाँ सबै वैकल्पिक छ।') : null,
        exQs.map(function (q) {
          return h('div', { key: q.key, className: 'wh-xq' },
            h('p', { className: 'wh-q' }, q.q, ' · ', q.qnp),
            h('div', { className: 'wh-choices', role: 'radiogroup', 'aria-label': q.q + ' · ' + q.qnp },
              q.opts.map(function (o) {
                return h(Choice, { key: o.k, radio: true, on: exVals[q.key] === o.k, onClick: function () { patchExtra(q.key, o.k); }, main: o.en + ' · ' + o.np, sub: '' });
              })
            ),
            (q.note && exVals[q.key] === q.note.when)
              ? h('div', { className: 'wh-note-info' }, 'ℹ️ ', q.note.en, ' · ', q.note.np)
              : null
          );
        }),

        h(GroupHead, { key: 'gh2', req: true }, '1 · How urgent is it? · कति तत्काल?'),
        h('div', { key: 'u', className: 'wh-choices', role: 'radiogroup', 'aria-label': 'How urgent is it? · कति तत्काल?', 'aria-describedby': errs.urgency ? ERR_IDS.urgency : undefined },
          URGENCY.map(function (u) {
            return h(Choice, { key: u.k, radio: true, on: f.urgency === u.k, onClick: function () { patch({ urgency: u.k }); },
              main: u.en + ' · ' + u.np, sub: '' });
          })
        ),
        errs.urgency ? h('span', { key: 'eu', className: 'wh-frm-err', id: ERR_IDS.urgency, role: 'alert', tabIndex: -1 }, errs.urgency) : null,

        h(GroupHead, { key: 'gh3' }, '2 · A few details · थप विवरण'),
        h(Field, { key: 'w', id: 'wh-ward', label: 'Ward · वडा', req: true, err: errs.ward, errId: ERR_IDS.ward },
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
        h(Field, { key: 'd', id: 'wh-desc', label: 'What happened? · के भयो?', hint: 'names are optional', req: true, err: errs.desc, errId: ERR_IDS.desc },
          h('textarea', { id: 'wh-desc', value: f.desc, onChange: function (e) { patch({ desc: e.target.value }); },
            placeholder: 'Describe what happened, where, and by whom — as much or as little as you want. · के, कहाँ र कसैले भयो, जति सहज छ त्यति लेख्नुहोस्।' })
        ),

        h(GroupHead, { key: 'gh4' }, '3 · Contact & privacy · सम्पर्क र गोपनीयता'),
        h('p', { key: 's4', className: 'wz-sub' }, 'Anonymous is the default and is completely fine. Share contact details only if you want a callback. · गुमनाम नै पूर्वनिर्धारित हो। सम्पर्क चाहनुहुन्छ भने मात्र विवरण दिनुहोस्।'),
        h('label', { key: 'a', className: 'wh-check' },
          h('input', { type: 'checkbox', checked: f.anon, onChange: function (e) { patch({ anon: e.target.checked }); } }),
          h('span', null,
            h('b', null, 'File anonymously · गुमनाम उजुरी'),
            h('div', { className: 'ck-sub' }, 'No name or phone is saved. Nobody can trace this report back to you from this page. · नाम वा फोन नम्बर सुरक्षित हुँदैन।')
          )
        ),
        !f.anon && [
          h(Field, { key: 'n', id: 'wh-name', label: 'Your name · तपाईंको नाम', req: true, err: errs.name, errId: ERR_IDS.name },
            h('input', { id: 'wh-name', value: f.name, onChange: function (e) { patch({ name: e.target.value }); }, autoComplete: 'off' })
          ),
          h(Field, { key: 'p', id: 'wh-phone', label: 'Phone for callback · सम्पर्क नम्बर', hint: 'a trusted number, not one your abuser checks', req: true, err: errs.phone, errId: ERR_IDS.phone },
            h('input', { id: 'wh-phone', type: 'tel', value: f.phone, onChange: function (e) { patch({ phone: e.target.value }); }, autoComplete: 'off', inputMode: 'tel' })
          )
        ],
        h('div', { key: 'pn', className: 'wh-privacy-note' },
          '🔒 ', h('b', null, 'Demo notice · डेमो सूचना: '), 'This portal is a demonstration prototype. Reports are stored only in this browser (localStorage) and are NOT sent to the municipality, police, or anyone else. For real help today, call ', h('b', null, '1145'), ' or ', h('b', null, '100'), '.'),
        h('div', { key: 'n', className: 'wh-nav-row' },
          h('button', { type: 'button', className: 'wh-btn wh-btn-plum', onClick: submit }, 'Submit report · उजुरी दर्ता गर्नुहोस्'),
          h('a', { className: 'wh-btn wh-btn-danger', href: 'tel:100' }, '📞 In danger? Call 100')
        )
      ]
    );

    /* ---- my reports ---- */
    var myReportsCard = h('div', { id: 'myreports' },
      h('h3', { id: 'myreports-h', style: { fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: '1.2rem', color: 'var(--wh-ink)', margin: '40px 0 6px' } },
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
                  r.extraLabel ? h('div', { className: 'ap-meta', style: { marginTop: 4 } }, r.extraLabel) : null,
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
        h('p', { className: 'wh-sub' }, 'Tap a card to open its own short form. Anonymous by default. Nothing leaves this browser. ', h('span', { lang: 'ne', style: { fontWeight: 700, color: 'var(--wh-purple)' } }, 'आफ्नो फारम खोल्न कार्ड थिच्नुहोस्। गुमनाम रूपमा। कुनै पनि जानकारी यो ब्राउजरबाहिर जाँदैन।')),
        wizard,
        doneCard || h('div', null),
        myReportsCard
      )
    );
  }

  var rootEl = document.getElementById('wh-root');
  if (rootEl) ReactDOM.createRoot(rootEl).render(h(App));
})();
