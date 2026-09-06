/* Glossary tooltips — auto-links planning jargon on every content page to a
   plain-language definition (data/glossary.json). Tap-friendly, keyboard
   accessible, no dependencies. Terms are linked at most a few times per page
   so text stays readable. */
(function () {
  'use strict';

  var MAX_PER_TERM = 3;
  var MAX_TOTAL = 60;
  var SKIP = 'footer,header,.search-modal,.crumbs,.toc-bar,#gl-pop,.back-top,nav,script,style,button,a,h1,h2,h3,h4,code,kbd,select,option,label,[data-no-glossary]';

  var TERMS = null;
  var pop = null;
  var popBtn = null;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function ensurePop() {
    if (pop) return;
    pop = document.createElement('div');
    pop.id = 'gl-pop';
    pop.setAttribute('role', 'dialog');
    pop.setAttribute('aria-label', 'Glossary definition');
    pop.hidden = true;
    document.body.appendChild(pop);
    document.addEventListener('click', function (e) {
      if (!pop.hidden && !e.target.closest('#gl-pop') && !e.target.closest('.gl')) hide();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !pop.hidden) hide();
    });
    window.addEventListener('scroll', function () { if (!pop.hidden) hide(); }, { passive: true });
  }

  function show(btn) {
    ensurePop();
    var t = TERMS.byid[btn.getAttribute('data-term')];
    if (!t) return;
    pop.innerHTML = '<b>' + esc(t.display) + '</b><span class="gl-x" aria-hidden="true">✕</span><p>' + esc(t.en) + '</p>';
    pop.hidden = false;
    if (popBtn && popBtn !== btn) popBtn.setAttribute('aria-expanded', 'false');
    popBtn = btn;
    btn.setAttribute('aria-expanded', 'true');
    var mobile = window.matchMedia('(max-width:640px)').matches;
    if (mobile) return; /* CSS pins it as a bottom sheet */
    var r = btn.getBoundingClientRect();
    var w = Math.min(320, window.innerWidth - 24);
    var left = Math.min(Math.max(12, r.left + r.width / 2 - w / 2), window.innerWidth - w - 12);
    pop.style.left = left + 'px';
    pop.style.top = '';
    pop.style.width = w + 'px';
    pop.style.right = 'auto';
    pop.style.bottom = 'auto';
    /* measure then place above or below */
    var ph = pop.offsetHeight;
    var below = r.bottom + 10;
    if (below + ph < window.innerHeight - 12) pop.style.top = below + 'px';
    else pop.style.top = Math.max(12, r.top - ph - 10) + 'px';
  }

  function hide() {
    if (!pop) return;
    pop.hidden = true;
    if (popBtn) popBtn.setAttribute('aria-expanded', 'false');
    popBtn = null;
  }

  function linkTerms() {
    var total = 0;
    TERMS.list.forEach(function (t) {
      t.count = 0;
      t.re = new RegExp('\\b(' + t.matches.map(function (m) {
        return m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }).join('|') + ')\\b', 'gi');
      t.display = t.matches.reduce(function (a, b) { return b.length > a.length ? b : a; }, '');
    });

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (node) {
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        var el = node.parentElement;
        if (!el || el.closest(SKIP) || el.classList.contains('gl')) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach(function (node) {
      if (total >= MAX_TOTAL) return;
      var txt = node.nodeValue;
      /* find which terms hit this node */
      var hits = null;
      TERMS.list.forEach(function (t) {
        if (t.count >= MAX_PER_TERM) return;
        t.re.lastIndex = 0;
        if (t.re.test(txt)) { (hits = hits || []).push(t); t.re.lastIndex = 0; }
      });
      if (!hits) return;
      /* combined replace: build regex over all matching variants */
      var variants = [];
      hits.forEach(function (t) { t.matches.forEach(function (m) { variants.push(m); }); });
      var re = new RegExp('\\b(' + variants.map(function (m) {
        return m.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      }).join('|') + ')\\b', 'gi');
      var frag = document.createDocumentFragment();
      var last = 0, m, made = 0;
      while ((m = re.exec(txt)) !== null && total < MAX_TOTAL) {
        var term = null;
        for (var i = 0; i < hits.length; i++) {
          var tt = hits[i];
          for (var j = 0; j < tt.matches.length; j++) {
            if (tt.matches[j].toLowerCase() === m[0].toLowerCase()) { term = tt; break; }
          }
          if (term) break;
        }
        if (!term || term.count >= MAX_PER_TERM) continue;
        frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'gl';
        b.setAttribute('data-term', term.id);
        b.setAttribute('aria-expanded', 'false');
        b.setAttribute('aria-label', 'Definition: ' + term.display);
        b.textContent = m[0];
        frag.appendChild(b);
        term.count++; total++; made++;
        last = m.index + m[0].length;
        if (re.lastIndex === m.index) re.lastIndex++;
      }
      if (!made) return;
      frag.appendChild(document.createTextNode(txt.slice(last)));
      node.parentNode.replaceChild(frag, node);
    });
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('.gl');
    if (!btn) return;
    e.preventDefault();
    if (popBtn === btn && !pop.hidden) hide(); else show(btn);
  });

  function init() {
    if (TERMS) return;
    fetch('data/glossary.json').then(function (r) { return r.json(); }).then(function (j) {
      if (!j || !j.terms || !j.terms.length) return;
      TERMS = { list: j.terms.slice().sort(function (a, b) {
        return b.matches.reduce(function (x, y) { return Math.max(x, y.length); }, 0) - a.matches.reduce(function (x, y) { return Math.max(x, y.length); }, 0);
      }), byid: {} };
      j.terms.forEach(function (t) { TERMS.byid[t.id] = t; });
      linkTerms();
    }).catch(function () { /* glossary is optional enhancement */ });
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
