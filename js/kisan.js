/* ============================================================================
   Kisan Guide — one-concept-at-a-time reader for agriculture.html
   Plain React 18 (UMD via CDN, no build step, no JSX) + optional three.js
   terraced-hills hero visual. CAL / CROPS data preserved verbatim from the
   original page. Loads after React/ReactDOM/three.js <script> tags, before
   js/nav.js (which only touches the static header nav — no overlap).
   ============================================================================ */
(function () {
  'use strict';

  var root = document.getElementById('kisan-root');
  if (!root) return;

  /* Graceful failure if the CDN scripts did not load */
  if (!window.React || !window.ReactDOM) {
    root.innerHTML = '<div class="kisan-fallback" role="alert"><b>The Kisan Guide could not load.</b>' +
      '<span>React did not arrive from the CDN. Check the internet connection and refresh the page.</span></div>';
    return;
  }

  var h = React.createElement;
  var useState = React.useState;
  var useEffect = React.useEffect;
  var useRef = React.useRef;

  var REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var SMOOTH = REDUCE ? 'auto' : 'smooth';

  /* ==========================================================================
     DATA — preserved verbatim from the original page's inline script
     ========================================================================== */

  /* Cropping calendar — month index 0–11 = Baiśākh..Chaitra
     band: [crop, startPlant, endPlant, startHarvest, endHarvest, color] */
  var CAL = [
    ['Paddy (Local)', 5, 7, 9, 10, '#2d6a4f'],
    ['Paddy (Hybrid)', 6, 7, 9, 10, '#1e5631'],
    ['Maize (main)', 8, 9, 2, 3, '#f2a900'],
    ['Millet', 5, 6, 9, 10, '#c1502e'],
    ['Potato (winter)', 10, 11, 1, 3, '#8d6e63'],
    ['Mustard', 9, 10, 1, 2, '#f4c542'],
    ['Upland bean', 6, 7, 9, 10, '#7f1d1d'],
    ['Tomato / chilli', 4, 5, 7, 10, '#d32f2f'],
    ['Leafy greens (winter)', 8, 9, 11, 12, '#388e3c'],
    ['Carrot / radish', 9, 10, 1, 3, '#ef6c00'],
    ['Oranges (woody)', 3, 5, 9, 12, '#fb8c00'],
    ['Sugarcane', 8, 10, 4, 5, '#6a994e']
  ];

  /* Nepali labels added for the farmer reader */
  var CAL_NP = {
    'Paddy (Local)': 'धान',
    'Paddy (Hybrid)': 'धान (हाइब्रिड)',
    'Maize (main)': 'मकै',
    'Millet': 'कोदो',
    'Potato (winter)': 'आलु',
    'Mustard': 'तोरी',
    'Upland bean': 'बोडी',
    'Tomato / chilli': 'गोलभेडा / खुर्सानी',
    'Leafy greens (winter)': 'सागपात',
    'Carrot / radish': 'गाजर / मुला',
    'Oranges (woody)': 'सुन्तला',
    'Sugarcane': 'उखु'
  };

  var MONTHS_FULL = ['Baiśākh', 'Jyeṣṭh', 'Aṣāḍ', 'Śrāwan', 'Bhādra', 'Āświn', 'Kārtik', 'Mangsir', 'Pauṣ', 'Māgh', 'Fālgun', 'Chaitra'];

  /* Priority crops — the six guide fields are verbatim from the original
     CROPS array; np / img / alt were added for the image-led reader. */
  var CROPS = [
    { emj: '🌾', en: 'Rice (Paddy)', np: 'धान',
      role: 'Staple grain of the valley floor',
      plant: 'Chaitra-Baiśākh nursery', harvest: 'Srade', best: 'Kali Gandaki terraces + wards 1–4',
      tip: 'Choose hybrid for yield; save local for taste.',
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Blond_and_green_rice_fields.jpg/960px-Blond_and_green_rice_fields.jpg',
      alt: 'Rice paddy fields climbing the hills' },
    { emj: '🌽', en: 'Maize', np: 'मकै',
      role: 'Main hill staple & animal feed',
      plant: 'Jeth–Aṣāḍ', harvest: 'Bhādra–Kārtik', best: 'Middle hill wards 5–12',
      tip: 'Intercrop with beans & squash for ground cover.',
      img: 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Field_of_Maize_-_geograph.org.uk_-_180486.jpg',
      alt: 'A tall field of maize plants' },
    { emj: '🌿', en: 'Millet', np: 'कोदो',
      role: 'Hardy grain on the steepest slopes',
      plant: 'Aṣāḍ–Śrāwan', harvest: 'Kārtik–Mangsir', best: 'High hill wards 8–12',
      tip: "Grows where rice can't — the food-security crop.",
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Finger_Millet_Field_at_Peddamunagalachedu_Village.jpg/960px-Finger_Millet_Field_at_Peddamunagalachedu_Village.jpg',
      alt: 'A green finger-millet field' },
    { emj: '🥔', en: 'Potato', np: 'आलु',
      role: 'Cash crop with market demand',
      plant: 'Mangsir–Pauṣ', harvest: 'Māgh–Chaitra', best: 'Temperate hill wards',
      tip: 'Certified, disease-free seed pays for itself.',
      img: 'https://upload.wikimedia.org/wikipedia/commons/b/b3/CSIRO_ScienceImage_4062_Potato_plants_on_farm_near_Atherton_QLD.jpg',
      alt: 'Potato plants growing in rows on a farm' },
    { emj: '🍊', en: 'Orange / Citrus', np: 'सुन्तला',
      role: 'The IUDP agro-processing driver',
      plant: 'Chaitra–Jeth', harvest: 'Aswin–Pauṣ', best: 'Wards 5–7 (proposed)',
      tip: 'Targets the agro-processing unit.',
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Mandarin_Oranges_%28Citrus_Reticulata%29.jpg/960px-Mandarin_Oranges_%28Citrus_Reticulata%29.jpg',
      alt: 'Mandarin oranges ripening on the tree' },
    { emj: '🌶️', en: 'Chilli & Tomato', np: 'खुर्सानी र गोलभेडा',
      role: 'High-value market vegetables',
      plant: 'Baiśākh–Jeth', harvest: 'Śrāwan–Kārtik', best: 'Fringe + core wards',
      tip: 'Stake early; trellis the tomato.',
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Dried_Capsicum_annuum-Red_Chilli_Pepper_on_Nanglo.jpg/960px-Dried_Capsicum_annuum-Red_Chilli_Pepper_on_Nanglo.jpg',
      alt: 'Dried red chillies on a woven nanglo plate' },
    { emj: '🥬', en: 'Winter Greens', np: 'सागपात',
      role: 'Mustard, radish, leafy veg',
      plant: 'Bhādra–Kārtik', harvest: 'Mangsir–Māgh', best: 'All wards',
      tip: 'Fast income in the cold months.',
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cf/Brassica_juncea_kz01.jpg/960px-Brassica_juncea_kz01.jpg',
      alt: 'Mustard greens growing in a bed' },
    { emj: '🐄', en: 'Livestock & Fodder', np: 'पशुधन र दाना',
      role: 'Napier + tree fodder, native breeds',
      plant: 'Srade prepare', harvest: 'Round year', best: 'Hill wards',
      tip: 'Manure feeds the soil circle.',
      img: 'assets/photos/field/field_livestock_cattle.jpg',
      alt: 'Cattle at a Baglung hill farm (fieldwork photo)' }
  ];

  var SEASONS = [
    { emj: '🌦️', en: 'Barsha', np: 'वर्षा', mon: 'Aṣāḍ · Śrāwan (Jun–Aug)',
      desc: 'Monsoon. Paddy transplant, maize, millet. Weeding and the biggest water risk.',
      bg: 'var(--moss)', dark: false,
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Green_hill_and_rice_sheaves_scattered_in_a_paddy_field_during_the_monsoon_in_Vang_Vieng_Laos.jpg/960px-Green_hill_and_rice_sheaves_scattered_in_a_paddy_field_during_the_monsoon_in_Vang_Vieng_Laos.jpg' },
    { emj: '🍂', en: 'Sarda', np: 'सरद', mon: 'Bhādra-Kārtik (Sep–Nov)',
      desc: 'Harvest. Main paddy, maize, millet. Second-season vegetables go in.',
      bg: 'var(--moss2)', dark: false,
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Rice_harvesting_by_farmers_in_a_wetland_field%2C_Bangladesh_2026_02.jpg/960px-Rice_harvesting_by_farmers_in_a_wetland_field%2C_Bangladesh_2026_02.jpg' },
    { emj: '❄️', en: 'Hemanta–Śiśir', np: 'हेमन्त–शिशिर', mon: 'Mangsir–Falgun (Dec–Feb)',
      desc: 'Cold. Root & winter greens, potato, mustard. Soil improvement and field repair.',
      bg: 'var(--terracotta)', dark: false,
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Frosty_field_with_sunrise_near_Bolton_-_geograph.org.uk_-_7047087.jpg/960px-Frosty_field_with_sunrise_near_Bolton_-_geograph.org.uk_-_7047087.jpg' },
    { emj: '🌸', en: 'Basanta', np: 'वसन्त', mon: 'Chaitra–Jeth (Mar–May)',
      desc: 'Spring. Summer-vegetable nurseries, maize & pulses, orchard work.',
      bg: 'var(--gold2)', dark: true,
      img: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Bunches-blossom-spring_%28Unsplash%29.jpg/960px-Bunches-blossom-spring_%28Unsplash%29.jpg' }
  ];

  var SOIL = [
    { num: '6–7', unit: 'pH', lab: 'Aim for near-neutral', des: 'Lime acid hill soils; avoid over-liming the sandy terraces.' },
    { num: '3%', unit: 'organic matter min', lab: 'Feed the soil', des: 'Compost, manure or mulch each season — hills lose OM fast.' },
    { num: '4–5″', unit: 'mulch depth', lab: 'Keep the moisture', des: 'Straw or leaves on the bed cut evaporation and weeds.' },
    { num: '1.0–1.5″', unit: 'water / week', lab: 'Even, not flooding', des: 'Mulch + drip beats flooding on the thin Baglung terraces.' }
  ];

  var IPM = [
    { emj: '👁️', t: 'Scout', np: 'हप्ताको चाँढाइ', d: 'Walk the field weekly. Catch the first few bugs before they become a plague.' },
    { emj: '🤲', t: 'Hand pick', np: 'हातले टिप्ने', d: 'Remove egg masses, larvae and infected leaves by hand — the cheapest control.' },
    { emj: '🏺', t: 'Home spray', np: 'घरेलु झोल', d: 'Neem-oil or garlic-chilli-soap spray for aphids, mites and caterpillars.' },
    { emj: '⏸️', t: 'Only if needed', np: 'आवश्यक परे मात्र', d: 'Target the pest, not the field. Follow the label; avoid the wrong pesticide.' }
  ];

  var LIVE = {
    tab: '🐄 Livestock & poultry', emj: '🐄',
    intro: "Livestock turns hill land into cash and dung into fertility. Match the animal to the ward's feed and water reality.",
    img: 'assets/photos/field/field_livestock_cattle.jpg',
    alt: 'Cattle at a hill farm in Baglung (fieldwork photo)',
    items: [
      'Native breeds (Achhami cattle, Khari goat) are hardy to hill conditions',
      'Improve fodder — napier and tree fodder beat stall-poor winter feeding',
      'Vaccinate on schedule; clean the shed fortnightly',
      'Compost the manure — never leave it in the rain'
    ]
  };

  var SEED = {
    tab: '🌾 Saving your own seed', emj: '🌾',
    intro: 'Locally saved seed is free, adapted and the backbone of food security in wards 8–12.',
    img: 'assets/photos/field/field_rice_thresher.jpg',
    alt: 'Rice threshing after the harvest (fieldwork photo)',
    items: [
      'Save from the best, healthiest plants — not the biggest field',
      'Dry fully; store in airtight, rodent-proof vessels with ash or neem',
      'Keep landrace rice, maize, millet and bean varieties alive',
      'Trade seed with neighbours — diversity is resilience'
    ]
  };

  var STATS = [
    ['85%+', 'Households depend on farming'],
    ['7', 'Agro-ecological hill wards'],
    ['6', 'Crop & livestock enterprises'],
    ['2×', 'Value from local seed saving']
  ];

  var CHAPTERS = [
    { n: 1, id: 'seasons', short: 'Farm year', title: 'Four seasons, one rhythm', np: 'चारै ऋतु',
      lede: "Baglung's farming follows the Himalayan seasons. Each season has its own field chores — know the season, know the work." },
    { n: 2, id: 'calendar', short: 'When to plant', title: 'The Baglung cropping calendar', np: 'रोप्ने समय',
      lede: 'Planting and harvest windows for 12 key crops, month by month. Solid band = plant, light band = harvest.' },
    { n: 3, id: 'crops', short: 'Crops', title: '8 priority crops for Baglung', np: 'मुख्य बाली',
      lede: 'The crops the IUDP prioritises for the valley and middle-hill wards — all eight at a glance.' },
    { n: 4, id: 'soil', short: 'Soil & water', title: 'Soil & water first', np: 'माटो र पानी',
      lede: "Before any seed, get the ground and water right. Baglung's slopes drain fast and thin — these numbers keep the soil alive." },
    { n: 5, id: 'pests', short: 'Pest control', title: 'Organic pest & disease control', np: 'कीरा व्यवस्थापन',
      lede: 'Integrated Pest Management (IPM) in four steps — observe first, spray only when needed, prefer home remedies.' },
    { n: 6, id: 'livestock', short: 'Livestock & seed', title: 'Livestock & saving your own seed', np: 'गाईवस्तु र बीउ',
      lede: 'Two habits that keep hill households strong — animals for cash and fertility, seed for free and resilience.' }
  ];

  /* ==========================================================================
     Helpers
     ========================================================================== */

  function colIdx(m) { return ((m % 12) + 12) % 12; }

  function mrange(a, b) {
    var s = colIdx(a), e = colIdx(b);
    return MONTHS_FULL[s] + (s === e ? '' : '–' + MONTHS_FULL[e]);
  }

  /* Inclusive month span -> {left%, width%} on a 12-col track (matches the
     original band maths: bw = e - s; if (bw < 0) bw += 12; width = bw + 1). */
  function bandGeom(s, e) {
    var a = colIdx(s), b = colIdx(e);
    var w = b - a;
    if (w < 0) w += 12;
    w += 1;
    return { left: a * (100 / 12), width: w * (100 / 12) };
  }

  /* Image with graceful emoji/text fallback if the remote file fails */
  function ImgWithFallback(props) {
    var s = useState(false);
    var failed = s[0], setFailed = s[1];
    if (failed) {
      return h('div', { className: 'emj-fallback', role: 'img', 'aria-label': props.alt },
        h('span', { className: 'e', 'aria-hidden': 'true' }, props.emj),
        h('span', { className: 't' }, props.alt));
    }
    return h('img', { src: props.src, alt: props.alt, loading: 'lazy',
      onError: function () { setFailed(true); } });
  }

  /* ==========================================================================
     three.js — lightweight terraced-hills viz for the hero (desktop only).
     Falls back silently (card hidden) if THREE or WebGL is unavailable.
     ========================================================================== */

  function initViz(canvas) {
    if (typeof THREE === 'undefined') return null;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
    } catch (e) { return null; }
    try { renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); } catch (e) {}

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(36, 16 / 9, 0.1, 60);
    camera.position.set(0, 4.6, 8.8);
    camera.lookAt(0, 0.5, 0);

    /* Terraced hills: displaced plane quantised to steps, fading at edges */
    var geo = new THREE.PlaneGeometry(13, 8.5, 52, 34);
    geo.rotateX(-Math.PI / 2);
    var pos = geo.attributes.position;
    var STEP = 0.32;
    for (var i = 0; i < pos.count; i++) {
      var x = pos.getX(i), z = pos.getZ(i);
      var raw = Math.sin(x * 0.5) * 0.9 + Math.cos(z * 0.65 + 1.1) * 0.8 + Math.sin((x + z) * 0.3) * 0.6 + 1.1;
      var terr = Math.round(raw / STEP) * STEP;
      var nx = Math.abs(x) / 6.5, nz = Math.abs(z) / 4.25;
      var edge = Math.max(0, 1 - Math.max(nx * nx, nz * nz));
      pos.setY(i, terr * edge);
    }
    geo.computeVertexNormals();

    var hills = new THREE.Mesh(geo,
      new THREE.MeshStandardMaterial({ color: 0x1C4F3A, roughness: 0.95, metalness: 0, flatShading: true }));
    scene.add(hills);

    var wire = new THREE.Mesh(geo,
      new THREE.MeshBasicMaterial({ color: 0xF2A900, wireframe: true, transparent: true, opacity: 0.13 }));
    wire.position.y = 0.02;
    scene.add(wire);

    scene.add(new THREE.AmbientLight(0xffffff, 0.65));
    var sun = new THREE.DirectionalLight(0xffe3b3, 0.95);
    sun.position.set(5, 7, 4);
    scene.add(sun);

    /* Drifting gold seed specks */
    var N = 90;
    var arr = new Float32Array(N * 3);
    var speed = [];
    for (var j = 0; j < N; j++) {
      arr[j * 3] = (Math.random() * 2 - 1) * 6;
      arr[j * 3 + 1] = 0.4 + Math.random() * 4;
      arr[j * 3 + 2] = (Math.random() * 2 - 1) * 3.6;
      speed.push(0.15 + Math.random() * 0.5);
    }
    var pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    var pts = new THREE.Points(pGeo,
      new THREE.PointsMaterial({ color: 0xF2A900, size: 0.055, transparent: true, opacity: 0.8 }));
    scene.add(pts);

    var running = false, rafId = 0, visible = true;

    function size() {
      var w = canvas.clientWidth || 320, hh = canvas.clientHeight || 280;
      renderer.setSize(w, hh, false);
      camera.aspect = w / hh;
      camera.updateProjectionMatrix();
    }

    function frame(t) {
      rafId = 0;
      if (!running) return;
      hills.rotation.y += 0.0018;
      wire.rotation.y = hills.rotation.y;
      var pa = pGeo.attributes.position;
      for (var k = 0; k < N; k++) {
        var y = pa.getY(k) + speed[k] * 0.008;
        if (y > 4.6) y = 0.4;
        pa.setY(k, y);
        pa.setX(k, pa.getX(k) + Math.sin(t * 0.0004 + k) * 0.0012);
      }
      pa.needsUpdate = true;
      renderer.render(scene, camera);
      if (running && !REDUCE) rafId = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      if (!rafId) rafId = requestAnimationFrame(frame);
    }
    function stop() {
      running = false;
      if (rafId) { cancelAnimationFrame(rafId); rafId = 0; }
    }

    size();
    var ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(size);
      ro.observe(canvas);
    } else {
      window.addEventListener('resize', size);
    }
    var io = new IntersectionObserver(function (en) {
      visible = !!(en && en[0] && en[0].isIntersecting);
      if (visible && !document.hidden) start(); else stop();
    }, { threshold: 0.05 });
    io.observe(canvas);
    function onVis() {
      if (document.hidden) stop();
      else if (visible) start();
    }
    document.addEventListener('visibilitychange', onVis);

    start(); /* renders a single static frame under prefers-reduced-motion */

    return function dispose() {
      stop();
      if (ro) ro.disconnect(); else window.removeEventListener('resize', size);
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      renderer.dispose();
      geo.dispose();
      pGeo.dispose();
    };
  }

  function HeroViz() {
    var ref = useRef(null);
    var s = useState(false);
    var failed = s[0], setFailed = s[1];
    useEffect(function () {
      var cleanup = null, done = false;
      function tryInit() {
        if (done || !ref.current) return;
        if (!window.matchMedia('(min-width:1024px)').matches) return;
        done = true;
        window.removeEventListener('resize', tryInit);
        cleanup = initViz(ref.current);
        if (!cleanup) setFailed(true);
      }
      tryInit();
      if (!done) window.addEventListener('resize', tryInit);
      return function () {
        window.removeEventListener('resize', tryInit);
        if (cleanup) cleanup();
      };
    }, []);
    return h('div', { className: 'kh-viz' + (failed ? ' kh-viz--off' : '') },
      h('div', { className: 'kh-viz-card' },
        h('canvas', { ref: ref, 'aria-hidden': 'true' }),
        h('div', { className: 'kh-viz-cap' }, 'बारी–खेत · ', h('span', { className: 'np' }, 'the terraces of Baglung'))
      )
    );
  }

  /* ==========================================================================
     Sections
     ========================================================================== */

  function Hero() {
    return h('section', {
      className: 'page-hero',
      style: { backgroundImage: "linear-gradient(180deg,rgba(12,16,12,0.42) 0%,rgba(12,16,12,0.82) 100%),url('assets/photos/stock/farmers.jpg')" }
    },
      h('div', { className: 'wrap' },
        h('div', { className: 'kh-grid' },
          h('div', { className: 'kh-copy' },
            h('div', { className: 'crumb' }, h('a', { href: 'index.html' }, 'Home'), ' / Kisan Guide'),
            h('span', {
              className: 'kicker',
              style: { background: 'rgba(242,169,0,0.18)', borderColor: 'rgba(242,169,0,0.35)', color: 'var(--gold)' }
            }, "🌱 A practical guide for Baglung's farmers"),
            h('h1', null, 'Kisan Guide,', h('br'), h('em', null, 'खेतीपाती from the hills.')),
            h('p', { className: 'lede' },
              'Everything the Baglung farmer needs in one place — when to plant, how to manage soil and water, organic pest control, livestock care and saving your own seed. Drawn from the agriculture sector of the IUDP and the ward-level fieldwork, now in short one-step pages.'),
            h('div', { className: 'hero-meta' },
              h('span', { className: 'chip' }, '🗓️ Year-round calendar'),
              h('span', { className: 'chip' }, '🌾 8 priority crops'),
              h('span', { className: 'chip' }, '💧 Soil & water first'),
              h('span', { className: 'chip' }, '🐄 Livestock & seed')
            ),
            h('div', { className: 'kh-actions' },
              h('a', { className: 'btn btn-primary', href: '#reader' }, 'Start the guide ↓'),
              h('a', { className: 'btn btn-ghost', href: '#map-cta' }, 'See the agriculture map')
            )
          ),
          h(HeroViz)
        )
      )
    );
  }

  function StatBar() {
    return h('div', { className: 'statbar', 'aria-label': 'Key stats' },
      h('div', { className: 'wrap' },
        STATS.map(function (st, i) {
          return h('div', { key: i }, h('b', null, st[0]), h('span', null, st[1]));
        })
      )
    );
  }

  /* ----- Chapter 1 · seasons ------------------------------------------------ */

  function StepYear() {
    return h('div', null,
      h('div', { className: 'season-grid' },
        SEASONS.map(function (s, i) {
          return h('div', {
            className: 'season-card' + (s.dark ? ' dark' : ''),
            style: {
              backgroundImage: 'linear-gradient(180deg, rgba(19,23,27,0.12) 0%, rgba(19,23,27,0.40) 42%, rgba(19,23,27,0.82) 76%, rgba(19,23,27,0.94) 100%), url("' + s.img + '")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundColor: s.bg
            }, key: i
          },
            h('span', { className: 'mon' }, s.emj, ' ', s.mon),
            h('b', null, s.en, ' ', h('span', { className: 'npn' }, s.np)),
            h('div', { className: 'desc' }, s.desc),
            h('span', { className: 'photo-credit' }, 'Photo · Wikimedia Commons')
          );
        })
      ),
      h('div', { className: 'note kr-note' },
        h('b', null, 'Elevation rule. '),
        'Higher fields run about two weeks later than the valley terraces — watch your neighbours, then plant.')
    );
  }

  /* ----- Chapter 2 · cropping calendar --------------------------------------- */

  function CalRowD(c, i) {
    var plant = bandGeom(c[1], c[2]);
    var harv = bandGeom(c[3], c[4]);
    return h('div', { className: 'cal-row', key: i },
      h('div', { className: 'cal-lab' },
        c[0],
        h('span', { className: 'npn np' }, CAL_NP[c[0]] || ''),
        h('span', { className: 'rng' }, 'Plant: ' + mrange(c[1], c[2]) + ' · Harvest: ' + mrange(c[3], c[4]))
      ),
      h('div', { className: 'cal-track' },
        h('div', { className: 'grid12' }, MONTHS_FULL.map(function (m, k) { return h('i', { key: k }); })),
        h('div', { className: 'band plant', style: { left: plant.left + '%', width: plant.width + '%', background: c[5] } }),
        h('div', { className: 'band harv', style: { left: harv.left + '%', width: harv.width + '%', background: c[5] } })
      )
    );
  }

  function CalRowM(c, i) {
    return h('div', { className: 'cal-mrow', key: i },
      h('div', { className: 'nm' }, c[0], h('span', { className: 'npn np' }, CAL_NP[c[0]] || '')),
      h('span', { className: 'chip2' },
        h('i', { className: 'dot', style: { background: c[5] }, 'aria-hidden': 'true' }),
        'Plant: ', h('b', null, mrange(c[1], c[2]))),
      h('span', { className: 'chip2' },
        h('i', { className: 'dot dot-h', style: { background: c[5] }, 'aria-hidden': 'true' }),
        'Harvest: ', h('b', null, mrange(c[3], c[4])))
    );
  }

  function StepCalendar() {
    return h('div', null,
      h('div', { className: 'cal-legend' },
        h('span', null, h('i', { className: 'sw', style: { background: 'var(--moss)' }, 'aria-hidden': 'true' }),
          'Plant ', h('span', { className: 'np' }, '(रोपाई)')),
        h('span', null, h('i', { className: 'sw sw-h', style: { background: 'var(--moss)' }, 'aria-hidden': 'true' }),
          'Harvest ', h('span', { className: 'np' }, '(कटाई)'))
      ),
      h('div', { className: 'cal-d' },
        h('div', { className: 'cal-head' },
          h('span', { className: 'lab' }, 'Crop · बाली'),
          h('div', { className: 'm' },
            MONTHS_FULL.map(function (m, k) { return h('span', { key: k }, m.slice(0, 3)); }))
        ),
        CAL.map(CalRowD)
      ),
      h('div', { className: 'cal-m' }, CAL.map(CalRowM)),
      h('p', { className: 'cal-note' },
        'Windows follow the Nepal calendar (Vikram Samvat) names. Shift ±2 weeks with elevation — lower river terraces plant earlier than the high hill wards.')
    );
  }

  /* ----- Chapter 3 · priority crops, all visible --------------------------------- */

  function kv(label, npLabel, value) {
    return h('div', { className: 'kv' },
      h('span', null, label, ' ', h('span', { className: 'np' }, npLabel)),
      h('b', null, value));
  }

  function CropCard(c) {
    return h('div', { className: 'crop-card', key: c.en },
      h('div', { className: 'crop-img' },
        h(ImgWithFallback, { src: c.img, alt: c.alt, emj: c.emj })
      ),
      h('div', { className: 'crop-body' },
        h('h3', null,
          h('span', { className: 'emj', 'aria-hidden': 'true' }, c.emj), ' ',
          c.en, ' ', h('span', { className: 'npn np' }, c.np)),
        h('p', { className: 'role' }, c.role),
        h('div', { className: 'crop-kv' },
          kv('Plant', 'रोपाई', c.plant),
          kv('Harvest', 'कटाई', c.harvest),
          kv('Best in', 'उपयुक्त', c.best)
        ),
        h('div', { className: 'crop-tip' }, h('b', null, 'Tip: '), c.tip),
        h('p', { className: 'crop-credit' },
          c.img.indexOf('upload.wikimedia.org') > -1
            ? 'Photo: Wikimedia Commons (CC-licensed, hotlinked)'
            : 'Photo: Baglung fieldwork, 2025')
      )
    );
  }

  function StepCrops() {
    return h('div', { className: 'crop-grid' }, CROPS.map(CropCard));
  }

  /* ----- Chapter 4 · soil & water --------------------------------------------- */

  function StepSoil() {
    return h('div', null,
      h('div', { className: 'soil-grid' },
        SOIL.map(function (s, i) {
          return h('div', { className: 'soil-tile', key: i },
            h('div', { className: 'num' }, s.num),
            h('div', { className: 'unit' }, s.unit),
            h('div', { className: 'lab' }, s.lab),
            h('div', { className: 'des' }, s.des)
          );
        })
      ),
      h('div', { className: 'note kr-note' },
        h('b', null, 'Slope rule. '),
        'Contour beds across the slope, not down it — this holds the thin soil and turns runoff into infiltration. Upland wards 8–12 benefit most.')
    );
  }

  /* ----- Chapter 5 · organic pest control -------------------------------------- */

  function StepPest() {
    return h('div', { className: 'ipm' },
      IPM.map(function (s, i) {
        return h('div', { className: 'ipm-step', key: i },
          h('div', { className: 'ipm-dot' },
            h('span', { className: 'e', 'aria-hidden': 'true' }, s.emj),
            h('span', { className: 'n' }, 'STEP ' + (i + 1))
          ),
          h('div', { className: 'ipm-txt' },
            h('b', null, (i + 1) + ' · ' + s.t, ' ', h('span', { className: 'npn np' }, s.np)),
            h('p', null, s.d)
          )
        );
      })
    );
  }

  /* ----- Chapter 6 · livestock & seed, both visible --------------------------- */

  function LiveSeedPanel(d) {
    return h('div', { className: 'ls-panel', key: d.tab },
      h('div', { className: 'ls-img' },
        h(ImgWithFallback, { src: d.img, alt: d.alt, emj: d.emj })
      ),
      h('div', { className: 'ls-body' },
        h('h3', { className: 'ls-head' }, d.tab),
        h('p', { className: 'ls-intro' }, d.intro),
        h('ul', null,
          d.items.map(function (it, i) {
            return h('li', { key: i },
              h('span', { className: 'tick', 'aria-hidden': 'true' }, '✓'),
              h('span', null, it));
          })
        )
      )
    );
  }

  function StepLivestock() {
    return h('div', { className: 'ls-grid' },
      LiveSeedPanel(LIVE),
      LiveSeedPanel(SEED)
    );
  }

  /* ==========================================================================
     The single landing page: sticky chapter nav + all sections stacked
     ========================================================================== */

  function SectionBody(chap) {
    switch (chap.n) {
      case 1: return h(StepYear);
      case 2: return h(StepCalendar);
      case 3: return h(StepCrops);
      case 4: return h(StepSoil);
      case 5: return h(StepPest);
      default: return h(StepLivestock);
    }
  }

  function Guide() {
    var as = useState(chapterOfId(window.location.hash));
    var active = as[0], setActive = as[1];

    /* Scrollspy: the section whose top is within ~170px of the viewport top
       (below topbar + sticky chapter nav) is "current". rAF-throttled.
       Works for sections of any height — ratio-based IntersectionObservers
       mis-fire on the 3900px-tall crops section. */
    useEffect(function () {
      var ids = CHAPTERS.map(function (c) { return c.id; });
      var ticking = false;

      function compute() {
        ticking = false;
        var cur = 'seasons', best = -Infinity;
        ids.forEach(function (id) {
          var el = document.getElementById(id);
          if (!el) return;
          var top = el.getBoundingClientRect().top;
          if (top <= 170 && top > best) { best = top; cur = id; }
        });
        setActive(cur);
      }
      function onScroll() {
        if (!ticking) { ticking = true; requestAnimationFrame(compute); }
      }

      /* Deep-link (#seasons..#livestock): the browser tries to scroll before
         React mounts, and images shift layout when they load — so jump once
         on mount rAF and once more after window 'load' settles the height. */
      var m = /^#([a-z]+)$/.exec(window.location.hash || '');
      var onLoad = null;
      if (m) {
        function jump() {
          var t = document.getElementById(m[1]);
          if (t) t.scrollIntoView({ block: 'start' });
        }
        requestAnimationFrame(jump);
        onLoad = jump;
        window.addEventListener('load', onLoad);
      }

      compute();
      window.addEventListener('scroll', onScroll, { passive: true });
      return function () {
        window.removeEventListener('scroll', onScroll);
        if (onLoad) window.removeEventListener('load', onLoad);
      };
    }, []);

    return h('section', { className: 'section section--cream kr', id: 'reader' },
      h('div', { className: 'wrap' },

        /* sticky chapter nav */
        h('div', { className: 'kr-topbar' },
          h('nav', { className: 'kr-chapters', 'aria-label': 'Guide chapters' },
            CHAPTERS.map(function (c) {
              var on = active === c.id;
              return h('a', {
                className: 'kr-chap' + (on ? ' on' : ''),
                key: c.id, href: '#' + c.id,
                'aria-current': on ? 'true' : undefined,
                onClick: function (e) {
                  e.preventDefault();
                  setActive(c.id);
                  var el = document.getElementById(c.id);
                  if (el) el.scrollIntoView({ behavior: SMOOTH, block: 'start' });
                }
              }, h('span', { className: 'n' }, String(c.n)), c.short);
            })
          )
        ),

        /* all six chapters, one after another */
        CHAPTERS.map(function (c) {
          return h('article', {
            className: 'kr-section', id: c.id, key: c.id
          },
            h('span', { className: 'kicker kr-kicker' }, 'Chapter ' + c.n + ' of 6'),
            h('h2', null, c.title, ' ', h('span', { className: 'kr-np np' }, c.np)),
            h('p', { className: 'lede' }, c.lede),
            SectionBody(c)
          );
        })
      )
    );
  }

  function chapterOfId(hash) {
    var m = /^#([a-z]+)$/.exec(hash || '');
    if (!m) return 'seasons';
    for (var i = 0; i < CHAPTERS.length; i++) if (CHAPTERS[i].id === m[1]) return m[1];
    return 'seasons';
  }

  /* ==========================================================================
     Map CTA (kept from the original page, local asset)
     ========================================================================== */

  function MapCTA() {
    return h('section', { className: 'section section--paper mapcta', id: 'map-cta' },
      h('div', { className: 'wrap' },
        h('span', { className: 'kicker kr-kicker' }, 'From the study'),
        h('h2', null, 'Where the plan sees agriculture'),
        h('div', { className: 'split', style: { alignItems: 'center' } },
          h('div', { className: 'sticky' },
            h('figure', null,
              h('img', { src: 'assets/maps/20_agriculture.png', alt: 'Agricultural plantation map', loading: 'lazy' }),
              h('figcaption', null,
                h('b', { className: 'fignum' }, 'Map — Agricultural plantation'),
                ' The ward-level agriculture map from the IUDP, showing where high-value crops and processing cluster.')
            )
          ),
          h('div', { className: 'body' },
            h('h3', null, 'From field notes to farm programmes'),
            h('p', null,
              "The EDP turns this guide's basics into programmes: fruit orchards on the lower terraces, an orange-agro processing unit for wards 5–7, high-value crops ward-by-ward, and market-linked vegetable production in the fringe."),
            h('p', null,
              'Read the wider picture on the ',
              h('a', { href: 'sectors.html', style: { color: 'var(--moss)', fontWeight: 700 } }, 'Sector Plans'),
              ' page and the ward data on ',
              h('a', { href: 'demographics.html', style: { color: 'var(--moss)', fontWeight: 700 } }, 'Demographics'),
              '.'),
            h('a', { className: 'btn btn-dark', href: '#reader', style: { marginTop: '18px' } }, '↑ Back to the guide')
          )
        )
      )
    );
  }

  /* ==========================================================================
     App
     ========================================================================== */

  function App() {
    return h('div', { className: 'kisan-app' },
      h(Hero),
      h(StatBar),
      h(Guide),
      h(MapCTA)
    );
  }

  ReactDOM.createRoot(root).render(h(App));
})();
