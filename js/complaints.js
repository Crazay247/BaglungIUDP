/* ============================================================================
   Complaints & Feedback — giant form first (Baglung IUDP)
   React (UMD, no build). Complaints live in the visitor's own browser (localStorage).
   Official channels are listed at the bottom of the page.
   ============================================================================ */
(function () {
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') return;
  var h = React.createElement;

  var STORE_KEY = 'bgl_complaints_v1';
  var LOGO = 'assets/logos/baglung-municipality-logo.png';

  var CATS = [
    { k: 'general', en: 'General / Other', np: 'सामान्य',    emj: '📋' },
    { k: 'roads',   en: 'Roads & Footpaths', np: 'सडक',     emj: '🛣️' },
    { k: 'water',   en: 'Water Supply',      np: 'पानी',     emj: '🚰' },
    { k: 'waste',   en: 'Waste & Sanitation',np: 'फोहोर',    emj: '🗑️' },
    { k: 'light',   en: 'Street Lights',     np: 'बत्ती',    emj: '💡' },
    { k: 'drain',   en: 'Drainage / Floods', np: 'नाली',     emj: '🌊' },
    { k: 'health',  en: 'Public Health',     np: 'स्वास्थ्य', emj: '🏥' },
    { k: 'build',   en: 'Public Buildings',  np: 'भवन',      emj: '🏛️' },
    { k: 'green',   en: 'Trees & Parks',     np: 'पार्क',    emj: '🌳' }
  ];
  var catByKey = {};
  CATS.forEach(function (c) { catByKey[c.k] = c; });

  var STATUSES = [
    { en: 'Submitted',    np: 'दर्ता भयो',  c: '#C1502E' },
    { en: 'Under Review', np: 'समीक्षामा',  c: '#E0A800' },
    { en: 'In Progress',  np: 'कार्य जारी', c: '#2d6a4f' },
    { en: 'Resolved',     np: 'समाधान भयो', c: '#1C4F3A' }
  ];
  var ST = { Submitted: 0, UnderReview: 1, InProgress: 2, Resolved: 3 };

  function daysAgo(d) { return new Date(Date.now() - d * 86400000 - 3 * 3600000).toISOString(); }
  var SEEDS = [
    { id: 'BGL-2026-0049', name: 'Sabita Thapa Magar', anon: false, ward: '3', cat: 'light', desc: 'Street lights out near the school — kids walk before sunrise.', tole: 'Khalanga', ts: daysAgo(1), status: ST.InProgress },
    { id: 'BGL-2026-0048', name: '', anon: true, ward: '7', cat: 'water', desc: 'Tap runs only every third day and stays brown after rain.', tole: 'Damek', ts: daysAgo(3), status: ST.UnderReview },
    { id: 'BGL-2026-0047', name: 'Gopal Kunwar', anon: false, ward: '11', cat: 'waste', desc: 'Market skip container overflows every evening, drain blocked.', tole: 'Kusma bazaar', ts: daysAgo(5), status: ST.Resolved, rating: 'fixed' },
    { id: 'BGL-2026-0046', name: '', anon: true, ward: '2', cat: 'roads', desc: 'Culvert collapsed on the lane — pit is a danger at night.', tole: 'Kharpan Tole', ts: daysAgo(7), status: ST.Submitted },
    { id: 'BGL-2026-0045', name: 'Mina Gurung', anon: false, ward: '9', cat: 'drain', desc: 'No drain along the footpath; monsoon water pours into two houses.', tole: 'Kande hill', ts: daysAgo(9), status: ST.InProgress }
  ];

  function storageOk() {
    try { localStorage.setItem(STORE_KEY + '_probe', '1'); localStorage.removeItem(STORE_KEY + '_probe'); return true; }
    catch (e) { return false; }
  }
  function loadStore() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      var list = JSON.parse(raw);
      return Array.isArray(list) ? list : null;
    } catch (e) { return null; }
  }
  function saveStore(list) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function nextId(list) {
    var max = 0;
    list.forEach(function (c) {
      var n = parseInt((c.id || '').split('-').pop(), 10);
      if (!isNaN(n) && n > max) max = n;
    });
    return 'BGL-2026-' + String(max + 1).padStart(4, '0');
  }
  function timeAgo(ts) {
    var s = (Date.now() - new Date(ts).getTime()) / 1000;
    if (s < 0) s = 0;
    var m = Math.floor(s / 60);
    if (m < 1) return 'just now';
    if (m < 60) return m + ' min ago';
    var hh = Math.floor(m / 60);
    if (hh < 24) return hh + ' hr ago';
    return Math.floor(hh / 24) + ' day' + (Math.floor(hh / 24) === 1 ? '' : 's') + ' ago';
  }
  function fileToThumb(file, cb) {
    if (!file || !/^image\//.test(file.type)) { cb(null); return; }
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        try {
          var W = 480, H = 320;
          var scale = Math.max(W / img.width, H / img.height);
          var dw = img.width * scale, dh = img.height * scale;
          var cv = document.createElement('canvas');
          cv.width = W; cv.height = H;
          cv.getContext('2d').drawImage(img, (W - dw) / 2, (H - dh) / 2, dw, dh);
          cb(cv.toDataURL('image/jpeg', 0.72));
        } catch (err) { cb(null); }
      };
      img.onerror = function () { cb(null); };
      img.src = e.target.result;
    };
    reader.onerror = function () { cb(null); };
    reader.readAsDataURL(file);
  }

  var ST_CHIP = function (c, status, advance) {
    var st = STATUSES[status];
    return h('button', { type: 'button', className: 'st', title: 'Demo tracker: click to advance status',
      style: { background: st.c }, onClick: function () { if (advance && status < STATUSES.length - 1) advance(); } },
      st.en + ' · ' + st.np);
  };
  var PILL = function (c, on, pick) {
    return h('button', { type: 'button', className: 'pill' + (on ? ' on' : ''), key: c.k,
      onClick: function () { pick(c.k); }, 'aria-pressed': on },
      h('span', { 'aria-hidden': 'true' }, c.emj),
      ' ', c.en, ' ',
      h('span', { className: 'cnp', lang: 'ne' }, c.np));
  };
  var WARD_OPTS = [];
  (function () { var i; for (i = 1; i <= 14; i++) WARD_OPTS.push(h('option', { key: i, value: String(i) }, 'Ward ' + i + ' · वडा ' + i)); })();

  var RATES = [
    { k: 'fixed', en: 'Fixed',   np: 'समाधान',   emj: '✅' },
    { k: 'partly', en: 'Partly', np: 'आंशिक',    emj: '🟡' },
    { k: 'no',    en: 'Not fixed', np: 'भएन',    emj: '❌' }
  ];
  var RATE_CHIP = function (r, on, pick) {
    return h('button', { type: 'button', className: 'rate' + (on ? ' on' : ''), key: r.k,
      onClick: function () { pick(r.k); }, 'aria-pressed': on, title: 'Rate this complaint' },
      h('span', { 'aria-hidden': 'true' }, r.emj, ' '),
      r.en, ' ',
      h('span', { className: 'cnp', lang: 'ne' }, r.np));
  };

  function App() {
    var listS = React.useState(null);
    var list = listS[0], setList = listS[1];
    var storeS = React.useState(false);
    var storeFailed = storeS[0], setStoreFailed = storeS[1];

    var f = React.useState({ detail: '', ward: '', cat: 'general', showOpt: false, name: '', tole: '', photo: null });
    var form = f[0], setForm = f[1];
    var errS = React.useState({});
    var errors = errS[0], setErrors = errS[1];
    var okS = React.useState('');
    var success = okS[0], setSuccess = okS[1];
    var flt = React.useState({ ward: '', status: '' });
    var filter = flt[0], setFilter = flt[1];
    var taRef = React.useRef(null);

    React.useEffect(function () {
      if (!storageOk()) { setStoreFailed(true); setList(SEEDS); return; }
      var data = loadStore();
      setList(data && data.length ? data : []);
    }, []);

    React.useEffect(function () {
      var el = taRef.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = el.scrollHeight + 'px';
    }, [form.detail]);

    function setK(key, val) {
      var next = {};
      for (var k in form) next[k] = form[k];
      next[key] = val;
      setForm(next);
    }

    function submit(e) {
      e.preventDefault();
      var ne = {};
      if (form.detail.trim().length < 5) ne.detail = 'Tell us briefly what is wrong — one line is enough.';
      if (!form.ward) ne.ward = 'Pick your ward so it reaches the right office.';
      setErrors(ne);
      if (ne.detail || ne.ward) return;

      var base = list || [];
      var item = {
        id: nextId(base),
        name: form.showOpt && form.name.trim() ? form.name.trim() : '',
        anon: !(form.showOpt && form.name.trim()),
        ward: form.ward,
        cat: form.cat || 'general',
        desc: form.detail.trim(),
        tole: (form.showOpt && form.tole.trim()) ? form.tole.trim() : '',
        photo: form.photo || null,
        ts: new Date().toISOString(),
        status: ST.Submitted
      };
      var next = [item].concat(base);
      setList(next);
      saveStore(next);
      setSuccess('Done — ' + item.id + ' registered · उजुरी दर्ता भयो। It is now on the wall below.');
      setForm({ detail: '', ward: '', cat: 'general', showOpt: false, name: '', tole: '', photo: null });
      var w = document.getElementById('wall');
      if (w) w.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function seed() { var next = SEEDS.concat(list || []); setList(next); saveStore(next); }
    function advance(id) {
      var next = (list || []).map(function (c) {
        if (c.id === id && c.status < STATUSES.length - 1) return Object.assign({}, c, { status: c.status + 1 });
        return c;
      });
      setList(next); saveStore(next);
    }
    function rate(id, r) {
      var next = (list || []).map(function (c) {
        if (c.id !== id) return c;
        var n = Object.assign({}, c, { rating: r });
        if (c.status === ST.Resolved && r === 'no') {
          n.status = ST.InProgress;
          n.reopened = true;
        }
        return n;
      });
      setList(next); saveStore(next);
    }
    function onFile(ev) {
      var file = ev.target.files && ev.target.files[0];
      if (!file) { setK('photo', null); return; }
      fileToThumb(file, function (dataUrl) { setK('photo', dataUrl); });
    }

    var shown = (list || []).filter(function (c) {
      if (filter.ward && c.ward !== filter.ward) return false;
      if (filter.status !== '' && String(c.status) !== String(filter.status)) return false;
      return true;
    });
    var len = form.detail.trim().length;

    var rated = (list || []).filter(function (c) { return c.rating && c.status === ST.Resolved; });
    var fixedN = rated.filter(function (c) { return c.rating === 'fixed'; }).length;
    var fixPct = rated.length ? Math.round(fixedN / rated.length * 100) : 0;

    return h('div', { className: 'cp' },

      /* ================= THE GIANT FORM — opens the page ================= */
      h('section', { className: 'giant', id: 'quick' },
        h('div', { className: 'giant-inner' },
          h('div', { className: 'giant-seal' },
            h('img', { src: LOGO, alt: 'Baglung Municipality logo' }),
            h('span', { className: 'cm' }, 'Baglung Municipality', h('small', { lang: 'ne' }, 'बागलुङ नगरपालिका · Citizen service'))),
          h('h1', { className: 'giant-h' }, 'Tell the ward. ', h('em', null, 'Get it fixed.')),
          h('p', { className: 'giant-sub' }, 'One line, one ward, one tap. ', h('b', null, '20 seconds'), ' start to finish — your complaint lands on the live wall instantly.'),
          h('div', { className: 'giant-card' },
            h('span', { className: 'demo-flag' }, 'Demo · no backend'),
            h('div', { className: 'gl' }, 'Quick complaint · दुई कुरा मात्र'),
            h('h2', null, 'What is wrong, and where? ', h('span', { className: 'np', lang: 'ne' }, 'के र कहाँ?'), h('span', { className: 'freq' }, ' *')),
            h('div', { className: 'bigta-wrap' },
              h('textarea', {
                ref: taRef, className: 'big-ta' + (errors.detail ? ' pick-err' : ''),
                placeholder: 'e.g. Street light out near the bus park · बसपार्क नजिकको बत्ती निभेको छ',
                value: form.detail, onChange: function (e) { setK('detail', e.target.value); }, 'aria-label': 'Describe the problem'
              }),
              h('span', { className: 'ta-count' + (len >= 5 ? ' ok' : '') }, len ? len + ' chars · अक्षर' : '')),
            errors.detail ? h('span', { className: 'frm-err' }, errors.detail) : null,
            h('div', { className: 'ward-field' },
              h('label', null, 'Your ward ', h('span', { className: 'np', lang: 'ne' }, 'वडा'), h('span', { className: 'freq' }, ' *')),
              h('div', { className: 'selbox' },
                h('select', { value: form.ward, onChange: function (e) { setK('ward', e.target.value); }, className: errors.ward ? 'pick-err' : '', 'aria-label': 'Select ward' },
                  h('option', { value: '', disabled: true }, 'Tap to pick your ward · वडा छान्नुहोस्'),
                  WARD_OPTS)),
              errors.ward ? h('span', { className: 'frm-err' }, errors.ward) : null),
            h('div', { className: 'pills-box' },
              h('div', { className: 'pills-label' }, 'Category ', h('small', null, '(optional — tap one) · वर्ग (वैकल्पिक)')),
              h('div', { className: 'pills' }, CATS.map(function (c) { return PILL(c, form.cat === c.k, function (k) { setK('cat', k); }); }))),
            h('button', { type: 'button', className: 'opt-toggle', onClick: function () { setK('showOpt', !form.showOpt); } },
              form.showOpt ? 'Hide optional details ▲' : 'Add name / photo (optional) ▼'),
            form.showOpt ? h('div', { className: 'opt-box' },
              h('input', { type: 'text', placeholder: 'Your name (optional) · नाम (वैकल्पिक)', value: form.name, onChange: function (e) { setK('name', e.target.value); } }),
              h('input', { type: 'text', placeholder: 'Tole / exact place (optional) · स्थान (वैकल्पिक)', value: form.tole, onChange: function (e) { setK('tole', e.target.value); } }),
              h('div', null,
                h('input', { type: 'file', accept: 'image/*', onChange: onFile, id: 'cp-file' }),
                form.photo ? h('span', { className: 'hint' }, 'Photo attached ✓') : null)) : null,
            h('button', { type: 'submit', className: 'btn-send', onClick: submit },
              'Send to your ward', h('small', null, '· 20 seconds')),
            h('div', { className: 'micro-trust' }, '✓ Registers with a tracking ID · ', h('b', null, '15-day response'), ' under LGO 2073'),
            success ? h('div', { className: 'ok-banner', role: 'status' }, '✓ ', success) : null)
        )
      ),

      /* ================= LIVE WALL ================= */
      h('section', { className: 'wall-sec', id: 'wall' },
        h('div', { className: 'wrap' },
          h('div', { className: 'k2' }, 'Live wall · भर्खरका उजुरी'),
          h('h2', null, 'Every complaint, in the open ', h('span', { className: 'np', lang: 'ne' }, 'सबै उजुरी सार्वजनिक')),
          h('div', { className: 'wall-tools' },
            h('select', { 'aria-label': 'Filter by ward', value: filter.ward, onChange: function (e) { setFilter(Object.assign({}, filter, { ward: e.target.value })); } },
              h('option', { value: '' }, 'All wards'), WARD_OPTS),
            h('select', { 'aria-label': 'Filter by status', value: filter.status, onChange: function (e) { setFilter(Object.assign({}, filter, { status: e.target.value })); } },
              h('option', { value: '' }, 'Any status'),
              STATUSES.map(function (s, i) { return h('option', { key: s.en, value: String(i) }, s.en); })),
            (list === null || (list && !list.length)) && !storeFailed ?
              h('button', { type: 'button', className: 'demo-btn', onClick: seed }, 'Load demo examples') : null),
          storeFailed ?
            h('div', { className: 'empty-wall' }, 'Your browser blocks local storage, so this wall shows the example set only. Use the strip at the bottom to file a real complaint.') :
            !shown.length ?
              h('div', { className: 'empty-wall' }, 'Nothing here yet — send the first complaint above and it will appear right here.') : null,
          rated.length ?
            h('div', { className: 'fixbar' },
              h('div', { className: 'fb-label' }, 'Fix-rate · समाधान दर'),
              h('div', { className: 'fb-meters' },
                h('div', { className: 'fb-track' }, h('div', { className: 'fb-fill', style: { width: fixPct + '%' } })),
                h('span', { className: 'fb-num' }, String(fixPct) + '%')),
              h('div', { className: 'fb-sub' }, String(fixedN), ' of ', String(rated.length), ' rated complaints fixed · ', h('b', null, 'प्रतिक्रिया दिइएका उजुरीहरूमध्ये समाधान')) ) : null,
          h('div', { className: 'wall' },
            shown.slice(0, 12).map(function (c) {
              var cat = catByKey[c.cat] || { en: 'General', np: '', emj: '📋' };
              return h('div', { className: 'cmp', key: c.id },
                h('div', { className: 'cmp-ava', 'aria-hidden': 'true' }, cat.emj),
                h('div', { className: 'cmp-body' },
                  h('div', { className: 'cmp-top' },
                    h('span', { className: 'cmp-id' }, c.id),
                    ST_CHIP(c, c.status, function () { advance(c.id); }),
                    h('span', { className: 'ward-chip' }, 'Ward ' + c.ward),
                    c.reopened ? h('span', { className: 're-open' }, '↺ Reopened · पुनः खोलियो') : null),
                  h('p', { className: 'cmp-desc' }, c.desc),
                  c.photo ? h('div', { className: 'cmp-photo' }, h('img', { src: c.photo, alt: 'Complaint photo' })) : null,
                  h('div', { className: 'cmp-meta' },
                    c.anon ? null : h('span', { className: 'who' }, '👤 ' + c.name),
                    c.tole ? h('span', { className: 'who' }, '📍 ' + c.tole) : null,
                    h('span', { className: 'cmp-time' }, timeAgo(c.ts))),
                  c.status === ST.Resolved ?
                    h('div', { className: 'cmp-rate' },
                      h('span', { className: 'rate-q' }, 'Was it fixed? · समाधान भयो?'),
                      h('div', { className: 'rates' }, RATES.map(function (r) { return RATE_CHIP(r, c.rating === r.k, function () { rate(c.id, r.k); }); })),
                      c.rating ? h('span', { className: 'rate-done' }, '✓ Rated · प्रतिक्रिया दिनुभयो') : null)
                      : null)
                    );
                  }))
        )
      )
    );
  }

  var rootEl = document.getElementById('cp-root');
  if (rootEl) ReactDOM.createRoot(rootEl).render(h(App));
})();