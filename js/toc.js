/* Page enhancements: "On this page" section bar with scrollspy, collapsible
   provenance notes, and a back-to-top button. Loads on every content page.
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
    return !el.closest('footer,header,.search-modal,.crumbs,.toc-bar,#gl-pop,.back-top,nav');
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

  /* ── "On this page" bar + scrollspy ────────────────────────────────────── */
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
    var used = {};
    hs.forEach(function (h) { if (!h.id) h.id = slug(h.textContent, used); });
    var items = hs.map(function (h) {
      return '<li><a href="#' + h.id + '">' + esc(h.textContent) + '</a></li>';
    }).join('');
    var bar = document.createElement('details');
    bar.className = 'toc-bar';
    bar.innerHTML = '<summary><span class="toc-bar__label">On this page</span>' +
      '<span class="toc-bar__count">' + hs.length + ' sections</span><span class="toc-bar__caret" aria-hidden="true">▾</span></summary>' +
      '<ul class="toc-bar__list">' + items + '</ul>';
    var hero = document.querySelector('.page-hero');
    if (!hero) return null;
    hero.insertAdjacentElement('afterend', bar);

    var links = {};
    bar.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    bar.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') bar.removeAttribute('open');
    });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          bar.querySelectorAll('a').forEach(function (a) { a.classList.remove('cur'); });
          var a = links[e.target.id];
          if (a) {
            a.classList.add('cur');
            if (bar.hasAttribute('open')) {
              var li = a.closest('li');
              if (li && li.scrollIntoView) li.scrollIntoView({ block: 'nearest' });
            }
          }
        }
      });
    }, { rootMargin: '-15% 0px -70% 0px' });
    hs.forEach(function (h) { io.observe(h); });
    return bar;
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
