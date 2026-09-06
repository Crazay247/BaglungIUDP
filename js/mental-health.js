/* ============================================================================
   Sahara — Mental Health Support Portal (academic prototype, Baglung IUDP)
   React (UMD, no build). Simulated consultations + bookings live ONLY in the
   visitor's own browser (localStorage: bgl_mh_appointments_v1).
   Doctors, fees and slots are FICTIONAL demo data, flagged on-page.
   Helpline numbers elsewhere on the page are real.
   Designed per WHO/IASP safe-messaging guidance: hopeful language, no methods,
   self-check is explicitly non-diagnostic and never stored.
   ============================================================================ */
(function () {
  if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') return;
  var h = React.createElement;

  var STORE_KEY = 'bgl_mh_appointments_v1';

  /* ---------- fictional demo counsellors ---------- */
  var DOCTORS = [
    { id: 'anjali', photo: 'assets/photos/mh/c1.jpg', emj: '🩺', name: 'Dr. Anjali Rana', role: 'Psychiatrist · मनोचिकित्सक', rate: '₨ 500 / session (demo fee)', langs: 'Nepali · English', modes: ['Video', 'Phone', 'Chat'], focus: ['Depression', 'Anxiety', 'Medication review'], bio: '12 years of experience supporting adults through low mood and anxiety, with a calm, practical style.' },
    { id: 'bikash', photo: 'assets/photos/mh/c2.jpg', emj: '🧠', name: 'Dr. Bikash Thapa', role: 'Clinical Psychologist · मनोवैज्ञानिक', rate: '₨ 400 / session (demo fee)', langs: 'Nepali · English', modes: ['Video', 'Chat'], focus: ['Talk therapy (CBT)', 'Students & youth', 'Exam stress'], bio: 'Specialises in talk therapy for young people and students — no medication, just structured conversations that work.' },
    { id: 'sara', photo: 'assets/photos/mh/c3.jpg', emj: '🌼', name: 'Dr. Sara Gurung', role: 'Counsellor · परामर्शदाता', rate: 'Free pilot (demo)', langs: 'Nepali · Gurung · English', modes: ['Phone', 'Chat'], focus: ['Grief & loss', 'Family conflict', 'Low mood'], bio: 'Believes every difficult feeling deserves a listener. Gentle, unhurried sessions by phone or chat.' },
    { id: 'prakash', photo: 'assets/photos/mh/c5.jpg', emj: '🌿', name: 'Dr. Prakash Adhikari', role: 'Psychiatrist · मनोचिकित्सक', rate: '₨ 500 / session (demo fee)', langs: 'Nepali · English', modes: ['Video', 'Phone'], focus: ['Substance use', 'Sleep problems', 'Stress & burnout'], bio: 'Works on habit change and recovery without judgement — practical plans, small steps, steady follow-up.' },
    { id: 'mina', photo: 'assets/photos/mh/c6.jpg', emj: '🕊️', name: 'Dr. Mina Sherpa', role: 'Counsellor · परामर्शदाता', rate: 'Free pilot (demo)', langs: 'Nepali · English', modes: ['Video', 'Chat'], focus: ["Women's mental health", 'Trauma-informed care', 'New mothers'], bio: 'Trauma-informed support for women and new mothers. You lead; she walks beside you.' }
  ];

  var MODE_ICONS = { Video: '🎥', Phone: '📞', Chat: '💬' };
  var MODE_HINT = {
    Video: 'camera optional — audio-only is perfectly fine',
    Phone: 'the counsellor calls your number',
    Chat: 'type at your own pace, no voice needed'
  };

  /* ---------- self-check questions (non-diagnostic, PHQ-inspired) ---------- */
  var QUESTIONS = [
    { en: 'Over the last two weeks, how often have you felt down, sad, or hopeless?', np: 'गएको दुई हप्तामा कति पटक मन खिन्न वा निराश महशुस भयो?' },
    { en: 'How often have you had little interest in things you usually enjoy?', np: 'मन पर्ने कुरामा कति पटक रुचि गुमाउनुभयो?' },
    { en: 'How often has sleep been difficult — too little, too much, or restless?', np: 'कति पटक सुत्न गाह्रो वा अस्थिर भयो?' },
    { en: 'How often have you felt tense, worried, or on edge?', np: 'कति पटक तनाव वा चिन्ता महशुस भयो?' },
    { en: 'How often have you felt cut off from the people around you?', np: 'कति पटक एक्लो महशुस भयो?' }
  ];
  var SCALE = ['Not at all', 'Several days', 'More than half', 'Nearly every day'];

  function band(score) {
    if (score <= 3) return {
      title: 'Feeling steady — keep caring for yourself · अवस्था राम्रै छ',
      body: 'Your answers suggest you are managing right now. Keep your routines, stay connected to people who feel safe, and remember this check-in for harder weeks. Support is here whenever you want it — no minimum level of distress required.'
    };
    if (score <= 8) return {
      title: 'Carrying some weight — it helps to talk · अलि गाह्रो भइरहेको हुनसक्छ',
      body: "Your answers suggest things have been heavier than usual lately. You don't have to wait until it gets worse. A conversation with a counsellor — or even one trusted person — can take real weight off. Try one coping step today and consider booking a session below."
    };
    return {
      title: 'It sounds heavy right now — you deserve support · तपाईंलाई सहयोग चाहिन्छ, र त्यो ठीक छ',
      body: "Your answers suggest you are going through a genuinely hard time. Please don't carry it alone: call 1166 (free, 24/7) or book a session below today. These feelings are treatable, and reaching out is the strongest move you can make."
    };
  }

  /* ---------- storage (appointments only; quiz is never persisted) ---------- */
  function storageOk() {
    try { localStorage.setItem(STORE_KEY + '_probe', '1'); localStorage.removeItem(STORE_KEY + '_probe'); return true; }
    catch (e) { return false; }
  }
  function loadStore() {
    try {
      var raw = localStorage.getItem(STORE_KEY);
      var list = raw ? JSON.parse(raw) : null;
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  }
  function saveStore(list) { try { localStorage.setItem(STORE_KEY, JSON.stringify(list)); } catch (e) {} }
  function nextId(list) {
    var max = 0;
    list.forEach(function (a) {
      var n = parseInt((a.id || '').split('-').pop(), 10);
      if (!isNaN(n) && n > max) max = n;
    });
    return 'MH-2026-' + String(max + 1).padStart(4, '0');
  }

  /* ---------- demo slot generation (deterministic, starts tomorrow) ---------- */
  var TIMES = ['10:00', '12:30', '15:00', '17:30'];
  function slotsFor(docId) {
    var out = [];
    var base = 0;
    for (var i = 0; i < docId.length; i++) base += docId.charCodeAt(i);
    for (var d = 1; d <= 5; d++) {
      var date = new Date(Date.now() + d * 86400000);
      var label = date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
      var count = 2 + ((base + d) % 3); /* 2–4 slots per day */
      for (var t = 0; t < count; t++) out.push({ date: label, time: TIMES[(base + d + t) % TIMES.length] });
    }
    return out;
  }
  function App() {
    /* ---- quiz state (never persisted) ---- */
    var ansS = React.useState([null, null, null, null, null]);
    var answers = ansS[0], setAnswers = ansS[1];
    var checkedS = React.useState(false);
    var checked = checkedS[0], setChecked = checkedS[1];

    /* ---- booking state ---- */
    var stepS = React.useState(0);
    var step = stepS[0], setStep = stepS[1];
    var docS = React.useState(null);
    var doc = docS[0], setDoc = docS[1];
    var slotS = React.useState(null);
    var slot = slotS[0], setSlot = slotS[1];
    var modeS = React.useState('Video');
    var mode = modeS[0], setMode = modeS[1];
    var fS = React.useState({ name: '', phone: '', concern: '' });
    var form = fS[0], setForm = fS[1];
    var errS = React.useState({});
    var errors = errS[0], setErrors = errS[1];
    var okS = React.useState(null);
    var confirmed = okS[0], setConfirmed = okS[1];

    /* ---- appointments ---- */
    var listS = React.useState([]);
    var appts = listS[0], setAppts = listS[1];
    var storeFailedS = React.useState(false);
    var storeFailed = storeFailedS[0], setStoreFailed = storeFailedS[1];
    React.useEffect(function () {
      if (!storageOk()) { setStoreFailed(true); return; }
      setAppts(loadStore());
    }, []);

    function setAns(i, v) {
      var next = answers.slice(); next[i] = v; setAnswers(next); setChecked(false);
    }
    var answered = answers.every(function (a) { return a !== null; });
    var score = answers.reduce(function (s, a) { return s + (a || 0); }, 0);
    var result = checked ? band(score) : null;

    function setK(key, val) { var n = {}; for (var k in form) n[k] = form[k]; n[key] = val; setForm(n); }

    function startBooking(d) {
      setDoc(d); setSlot(null); setConfirmed(null); setMode('Video');
      setErrors({}); setStep(1);
      var el = document.getElementById('booking');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    function nextStep() {
      var docSlots = doc ? slotsFor(doc.id) : [];
      if (step === 2) {
        if (slot === null) { setErrors({ slot: 'Pick a time that works for you · समय छान्नुहोस्' }); return; }
        setErrors({}); setStep(3); return;
      }
      if (step === 3) {
        var ne = {};
        var digits = (form.phone || '').replace(/[^0-9]/g, '');
        if (digits.length < 7 || digits.length > 15) ne.phone = 'Enter a phone number we can reach you on (prototype only — nothing is sent).';
        setErrors(ne);
        if (ne.phone) return;
        var chosen = docSlots[slot];
        var appt = {
          id: nextId(appts),
          doctor: doc.name, doctorRole: doc.role, emj: doc.emj,
          mode: mode, date: chosen.date, time: chosen.time,
          name: form.name.trim(), phone: form.phone.trim(), concern: form.concern.trim(),
          ts: new Date().toISOString()
        };
        var list = [appt].concat(appts);
        setAppts(list); saveStore(list);
        setConfirmed(appt); setStep(4);
        return;
      }
      setStep(step + 1);
    }
    function cancel(id) {
      var next = appts.filter(function (a) { return a.id !== id; });
      setAppts(next); saveStore(next);
      if (confirmed && confirmed.id === id) { setConfirmed(null); setStep(0); }
    }
    /* ================= render helpers ================= */
    var SLIDER = function (q, i) {
      return h('div', { className: 'mh-q', key: i, role: 'group', 'aria-label': q.en },
        h('p', { className: 'q-label' }, q.en, h('small', { lang: 'ne' }, q.np)),
        h('input', {
          type: 'range', min: 0, max: 3, step: 1,
          value: answers[i] === null ? 1 : answers[i],
          onChange: function (e) { setAns(i, parseInt(e.target.value, 10)); },
          'aria-label': q.en, 'aria-valuenow': answers[i] === null ? 1 : answers[i],
          style: answers[i] === null ? { opacity: 0.55 } : null
        }),
        h('div', { className: 'mh-scale-lbl' }, SCALE.map(function (s, si) {
          return h('span', { key: s, style: answers[i] === si ? { color: 'var(--mh-teal)', fontWeight: 800 } : null }, s);
        }))
      );
    };

    var DOC_CARD = function (d) {
      return h('div', { className: 'mh-doc', key: d.id },
        h('div', { className: 'mh-doc-top' },
          h('div', {
            className: 'mh-doc-ava', 'aria-hidden': 'true',
            style: d.photo ? { backgroundImage: 'url(' + d.photo + ')', backgroundSize: 'cover', backgroundPosition: 'center top', color: 'transparent' } : null
          }, d.emj),
          h('div', null,
            h('h3', null, d.name),
            h('div', { className: 'doc-role' }, d.role),
            h('div', { className: 'doc-rate' }, d.rate))),
        h('p', { style: { margin: '12px 0 0', fontSize: '.92rem', lineHeight: 1.65, color: 'var(--mh-soft)' } }, d.bio),
        h('div', { className: 'mh-tags' },
          d.focus.map(function (f) { return h('span', { className: 'mh-tag', key: f }, f); }),
          h('span', { className: 'mh-tag' }, '🗣 ' + d.langs),
          d.modes.map(function (m) { return h('span', { className: 'mh-tag', key: m }, MODE_ICONS[m] + ' ' + m); })),
        h('div', { className: 'mh-doc-foot' },
          h('button', { type: 'button', className: 'mh-btn mh-btn-teal', onClick: function () { startBooking(d); } },
            'Book a session · समय तोक्नुहोस्'))
      );
    };

    var STEP_CHIPS = ['1 · Counsellor', '2 · Time', '3 · Details', '4 · Done'];
    var chips = h('div', { className: 'mh-steps', 'aria-hidden': 'true' },
      STEP_CHIPS.map(function (s, i) {
        var cls = 'mh-step-chip' + (i + 1 === step ? ' on' : '') + (i + 1 < step ? ' done' : '');
        return h('span', { className: cls, key: s }, s);
      }));

    var docSlots = doc ? slotsFor(doc.id) : [];
    var wizard;

    if (step === 0) {
      wizard = h('div', null,
        h('h3', null, 'Book an online consultation ', h('span', { className: 'np', lang: 'ne' }, '· ऑनलाइन परामर्श')),
        h('p', { className: 'bk-sub' }, 'Pick a counsellor above, then choose a time. No account, no payment — everything stays on your device.'),
        h('span', { className: 'mh-demo-flag' }, '⚠ Demo · doctors are illustrative, not real'));
    } else if (step === 1 && doc) {
      wizard = h('div', null, chips,
        h('h3', null, doc.emj + ' ' + doc.name),
        h('p', { className: 'bk-sub' }, doc.role + ' · ' + doc.focus.join(' · ')),
        h('div', { className: 'mh-choices' },
          doc.modes.map(function (m) {
            return h('button', { type: 'button', key: m, className: 'mh-choice' + (mode === m ? ' on' : ''),
              onClick: function () { setMode(m); setStep(2); setErrors({}); } },
              h('span', { 'aria-hidden': 'true' }, MODE_ICONS[m]),
              h('span', null,
                h('span', { className: 'ch-main' }, m + ' session'),
                h('span', { className: 'ch-sub' }, ' — ' + MODE_HINT[m])));
          })));
    } else if (step === 2 && doc) {
      wizard = h('div', null, chips,
        h('h3', null, 'Pick a time · समय छान्नुहोस्'),
        h('p', { className: 'bk-sub' }, 'Demo availability for ' + doc.name + ' over the next five days.'),
        h('div', { className: 'mh-slots' },
          docSlots.map(function (s, i) {
            return h('button', { type: 'button', key: i, className: 'mh-slot' + (slot === i ? ' on' : ''),
              onClick: function () { setSlot(i); setErrors({}); }, 'aria-pressed': slot === i },
              s.time, h('small', null, s.date));
          })),
        errors.slot ? h('span', { className: 'mh-frm-err' }, errors.slot) : null,
        h('div', { className: 'mh-nav-row' },
          h('button', { type: 'button', className: 'mh-back', onClick: function () { setStep(1); } }, '← Back'),
          h('button', { type: 'button', className: 'mh-btn mh-btn-teal', onClick: nextStep }, 'Continue →')));
    } else if (step === 3 && doc) {
      var chosen = docSlots[slot] || { date: '', time: '' };
      wizard = h('div', null, chips,
        h('h3', null, 'Your details · तपाईंको विवरण'),
        h('p', { className: 'bk-sub' }, chosen.date + ' at ' + chosen.time + ' · ' + mode + ' session with ' + doc.name),
        h('div', { className: 'mh-field' },
          h('label', { htmlFor: 'mh-name' }, 'Name ', h('small', '(optional) · नाम (वैकल्पिक)')),
          h('input', { id: 'mh-name', type: 'text', value: form.name, autoComplete: 'name',
            placeholder: 'Anonymous is fine', onChange: function (e) { setK('name', e.target.value); } })),
        h('div', { className: 'mh-field' },
          h('label', { htmlFor: 'mh-phone' }, 'Phone number ', h('span', { style: { color: '#A63A31' } }, '*')),
          h('input', { id: 'mh-phone', type: 'tel', inputMode: 'tel', value: form.phone, autoComplete: 'tel',
            placeholder: 'e.g. 98XXXXXXXX', onChange: function (e) { setK('phone', e.target.value); } }),
          errors.phone ? h('span', { className: 'mh-frm-err' }, errors.phone) : null),
        h('div', { className: 'mh-field' },
          h('label', { htmlFor: 'mh-concern' }, 'Anything you want to share beforehand? ', h('small', '(optional)')),
          h('textarea', { id: 'mh-concern', rows: 3, value: form.concern,
            placeholder: 'A line is enough — you can also just talk about it in the session.',
            onChange: function (e) { setK('concern', e.target.value); } })),
        h('p', { style: { fontSize: '.8rem', fontWeight: 700, color: 'var(--mh-soft)', marginTop: '10px', lineHeight: 1.6 } },
          'Prototype notice: this booking is a simulation. It is stored only in this browser and no real appointment is made.'),
        h('div', { className: 'mh-nav-row' },
          h('button', { type: 'button', className: 'mh-back', onClick: function () { setStep(2); } }, '← Back'),
          h('button', { type: 'button', className: 'mh-btn mh-btn-teal', onClick: nextStep }, 'Confirm booking ✓')));
    } else if (step === 4 && confirmed) {
      wizard = h('div', null, chips,
        h('h3', null, 'Booked — see you then 💚'),
        h('div', { className: 'mh-confirm' },
          h('dl', null,
            h('dt', null, 'Booking ID'), h('dd', null, confirmed.id),
            h('dt', null, 'Counsellor'), h('dd', null, confirmed.emj + ' ' + confirmed.doctor),
            h('dt', null, 'When'), h('dd', null, confirmed.date + ' at ' + confirmed.time),
            h('dt', null, 'How'), h('dd', null, MODE_ICONS[confirmed.mode] + ' ' + confirmed.mode + ' session'))),
        h('div', { className: 'mh-ok', role: 'status' },
          '✓ Saved in this browser · तपाईंको ब्राउजरमा सुरक्षित भयो. It appears in “My appointments” below. If you feel worse before the session, call ', h('b', null, '1166'), ' anytime.'),
        h('div', { className: 'mh-nav-row' },
          h('button', { type: 'button', className: 'mh-btn mh-btn-gold', onClick: function () { setStep(0); setConfirmed(null); } }, 'Book another session')));
    } else {
      wizard = h('div', null, h('span', { className: 'mh-demo-flag' }, '⚠ Demo · doctors are illustrative, not real'));
    }
    /* ================= page composition ================= */
    return h(React.Fragment, null,

      /* ---- self-check ---- */
      h('section', { className: 'mh-sec', id: 'checkin' },
        h('div', { className: 'wrap' },
          h('div', { className: 'mh-kicker' }, 'Gentle check-in · आफैलाई सोध्नुहोस्'),
          h('h2', null, 'How have the last two weeks felt? ', h('span', { className: 'np', lang: 'ne' }, '· आफ्नो अवस्था हेर्नुहोस्')),
          h('p', { className: 'mh-sub' }, 'Slide each question to what fits best. This is not a test and not a diagnosis — just a mirror to help you notice what you have been carrying. Your answers are never saved or sent anywhere.'),
          h('img', { className: 'mh-sec-photo', src: 'assets/photos/mh/checkin.jpg', loading: 'lazy', decoding: 'async', alt: 'A quiet moment of journaling with a cup of tea — writing down how you feel can be the first step' }),
          h('div', { className: 'mh-quiz', role: 'group', 'aria-label': 'Self-check questions' },
            QUESTIONS.map(function (q, i) { return SLIDER(q, i); })),
          h('div', { className: 'mh-quiz-foot' },
            h('button', { type: 'button', className: 'mh-btn mh-btn-teal', disabled: !answered,
              style: answered ? null : { opacity: 0.5, cursor: 'not-allowed' },
              onClick: function () { setChecked(true); } }, 'See my check-in result'),
            answered && checked ? null : h('span', { style: { fontSize: '.84rem', fontWeight: 700, color: 'var(--mh-soft)' } },
              answered ? '' : 'Answer all five to continue · पाँचै प्रश्नको उत्तर दिनुहोस्')),
          result ? h('div', { className: 'mh-result', role: 'status' },
            h('h3', null, result.title),
            h('p', null, result.body),
            h('p', { style: { fontWeight: 800, color: 'var(--mh-deep)' } }, 'This is not a diagnosis · यो निदान होइन.'),
            h('div', { className: 'r-cta' },
              h('a', { className: 'mh-btn mh-btn-teal', href: '#doctors' }, 'Talk to a counsellor'),
              h('a', { className: 'mh-btn mh-btn-ghost', style: { color: 'var(--mh-deep)', borderColor: 'var(--mh-teal)' }, href: 'tel:1166' }, '📞 Call 1166 (free, 24/7)'))) : null,
          h('p', { className: 'mh-quiz-disclaimer' }, 'If you are thinking about harming yourself, please reach out right now — call ', h('b', null, '1166'), ' (free, 24/7, all networks). You deserve support, and support works.'))),

      /* ---- doctors ---- */
      h('section', { className: 'mh-sec alt', id: 'doctors' },
        h('div', { className: 'wrap' },
          h('div', { className: 'mh-kicker' }, 'Online consultation · ऑनलाइन परामर्श'),
          h('h2', null, 'Counsellors you can talk to ', h('span', { className: 'np', lang: 'ne' }, '· परामर्शदाताहरू')),
          h('p', { className: 'mh-sub' }, 'Choose someone who feels right — by language, speciality, or session type. Video, phone, or chat: the choice is yours, and switching later is always allowed.'),
          h('p', { style: { marginTop: '12px' } }, h('span', { className: 'mh-demo-flag' }, '⚠ Demo data · these professionals are illustrative, not real')),
          h('div', { className: 'mh-docs' }, DOCTORS.map(DOC_CARD)),

          /* booking wizard */
          h('div', { className: 'mh-book', id: 'booking' }, wizard))),

      /* ---- my appointments ---- */
      h('section', { className: 'mh-sec', id: 'appointments' },
        h('div', { className: 'wrap' },
          h('div', { className: 'mh-kicker' }, 'Your bookings · तपाईंको समय'),
          h('h2', null, 'My appointments ', h('span', { className: 'np', lang: 'ne' }, '· मेरो परामर्श')),
          storeFailed ?
            h('p', { className: 'mh-sub' }, 'Your browser blocks local storage, so bookings cannot be saved here. Everything else on this page still works.') :
            appts.length ?
              h('div', { className: 'mh-appts' },
                appts.map(function (a) {
                  return h('div', { className: 'mh-appt', key: a.id },
                    h('div', { className: 'mh-doc-ava', 'aria-hidden': 'true' }, a.emj),
                    h('div', { className: 'ap-body' },
                      h('span', { className: 'ap-id' }, a.id),
                      h('div', null, h('b', null, a.emj + ' ' + a.doctor)),
                      h('div', { className: 'ap-meta' },
                        a.date + ' at ' + a.time + ' · ' + MODE_ICONS[a.mode] + ' ' + a.mode + ' session' +
                        (a.name ? ' · for ' + a.name : '')),
                      a.concern ? h('div', { className: 'ap-meta' }, '“' + a.concern + '”') : null),
                    h('button', { type: 'button', className: 'mh-cancel', onClick: function () { cancel(a.id); } },
                      'Cancel · रद्द'));
                })) :
              h('p', { className: 'mh-sub' }, 'No bookings yet. When you book a session above, it will appear here — stored only in this browser.'),
          h('p', { style: { marginTop: '18px', fontSize: '.84rem', fontWeight: 700, color: 'var(--mh-soft)', lineHeight: 1.6 } },
            'In a real deployment, a reminder SMS would be sent before each session and a municipal counsellor roster would fill these slots. This prototype stores data in localStorage only (key ', h('code', null, STORE_KEY), ').')))
    );
  }

  var rootEl = document.getElementById('mh-root');
  if (rootEl) ReactDOM.createRoot(rootEl).render(h(App));
})();
