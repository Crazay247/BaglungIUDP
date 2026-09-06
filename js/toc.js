/* Page enhancements: floating "Sections" jump button + panel with scrollspy,
   collapsible provenance notes, and a back-to-top button.
   Loads on every content page.
   Skips self-contained tool apps (agriculture, services, complaints). */
(function () {
  'use strict';

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }
  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function isToolApp() {
    return /agriculture\.html$|services\.html$|complaints\.html$/.test(location.pathname);
  }
  function isContent(el) {
    return !el.closest('footer,header,.search-modal,.crumbs,.toc-fab,.toc-panel,#gl-pop,.back-top,nav');
  }

  /* ── Convert provenance/detail notes into collapsible blocks ───────────── */
  function enhanceNotes() {
    var notes = document.querySelectorAll('.note');
    Array.prototype.forEach.call(notes, function (n) {
      if (n.tagName === 'DETAILS' || n.closest('details')) return;
      var b = n.querySelector('b');
      var label = b ? b.textContent.replace(/[.\u2014:]+\s*$/, '').trim() : 'Detail';
      var d = document.createElement('details');
      d.className = 'note acc';
      var s = document.createElement('summary');
      s.innerHTML = '<span class="acc-label">' + esc(label) + '</span><span class="acc-hint" aria-hidden="true">details</span>';
      d.appendChild(s);
      while (n.firstChild) d.appendChild(n.firstChild);
      n.replaceWith(d);
    });
  }

  /* ── Floating "Sections" button + panel with scrollspy ─────────────────── */
  function slug(text, used) {
    var s = 'sec-' + String(text).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
    var base = s, i = 2;
    while (used[s] || document.getElementById(s)) s = base + '-' + (i++);
    used[s] = true;
    return s;
  }

  function buildTOC() {
    var hs = Array.prototype.filter.call(document.querySelectorAll('h2'), isContent);
    if (hs.length < 3) return null;
    if (!document.querySelector('.page-hero')) return null;
    var used = {};
    hs.forEach(function (h) { if (!h.id) h.id = slug(h.textContent, used); });
    var items = hs.map(function (h) {
      return '<li><a href="#' + h.id + '">' + esc(h.textContent) + '</a></li>';
    }).join('');

    var fab = document.createElement('button');
    fab.className = 'toc-fab';
    fab.type = 'button';
    fab.setAttribute('aria-expanded', 'false');
    fab.setAttribute('aria-controls', 'toc-panel');
    fab.innerHTML = '<span aria-hidden="true">\u2630</span> Sections ' +
      '<span class="toc-fab__count">' + hs.length + '</span>';

    var panel = document.createElement('div');
    panel.className = 'toc-panel';
    panel.id = 'toc-panel';
    panel.setAttribute('hidden', '');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'On this page');
    panel.tabIndex = -1;
    panel.innerHTML = '<div class="toc-panel__head"><span>On this page</span>' +
      '<button type="button" class="toc-panel__close" aria-label="Close sections">\u2715</button></div>' +
      '<ul class="toc-panel__list">' + items + '</ul>';
    document.body.appendChild(fab);
    document.body.appendChild(panel);

    function setOpen(open, refocus) {
      fab.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) {
        panel.removeAttribute('hidden');
        panel.focus({ preventScroll: true });
      } else {
        panel.setAttribute('hidden', '');
        if (refocus !== false) fab.focus({ preventScroll: true });
      }
    }
    fab.addEventListener('click', function () { setOpen(panel.hasAttribute('hidden')); });
    panel.querySelector('.toc-panel__close').addEventListener('click', function () { setOpen(false); });
    panel.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setOpen(false, false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hasAttribute('hidden')) setOpen(false);
    });
    document.addEventListener('click', function (e) {
      if (!panel.hasAttribute('hidden') && !panel.contains(e.target) && !fab.contains(e.target)) setOpen(false, false);
    });

    var links = {};
    panel.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          panel.querySelectorAll('a').forEach(function (a) { a.classList.remove('cur'); });
          var a = links[e.target.id];
          if (a) a.classList.add('cur');
        }
      });
    }, { rootMargin: '-15% 0px -70% 0px' });
    hs.forEach(function (h) { io.observe(h); });
    return fab;
  }

  /* ── Back to top ───────────────────────────────────────────────────────── */
  function backTop() {
    var b = document.createElement('button');
    b.className = 'back-top';
    b.type = 'button';
    b.setAttribute('aria-label', 'Back to top');
    b.innerHTML = '&uarr;';
    b.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    document.body.appendChild(b);
    var t;
    window.addEventListener('scroll', function () {
      if (t) return;
      t = setTimeout(function () {
        t = null;
        b.classList.toggle('show', window.scrollY > 600);
      }, 120);
    }, { passive: true });
  }

  ready(function () {
    var tool = isToolApp();
    if (!tool) {
      enhanceNotes();
      buildTOC();
    }
    backTop();
  });
})();
