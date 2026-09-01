// Shared site JS: nav, dropdowns, mobile menu, scroll progress, reveal animations
(function(){
  // Active nav link highlight (top-level links + brand)
  var path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navlinks a, .navlinks .nav-trigger').forEach(function(a){
    var href = a.getAttribute('data-link');
    if(href && (href === path || (href === 'index.html' && path === ''))) a.classList.add('active');
    if(a.tagName === 'A'){
      var h = a.getAttribute('href');
      if(h && (h === path || (h === 'index.html' && path === ''))) a.classList.add('active');
    }
  });

  // Dropdown open/close
  var items = document.querySelectorAll('.nav-item');
  function closeAll(except){
    items.forEach(function(it){ if(it !== except){ it.classList.remove('open'); var t=it.querySelector('.nav-trigger'); if(t) t.setAttribute('aria-expanded','false'); } });
  }
  items.forEach(function(it){
    var trigger = it.querySelector('.nav-trigger');
    if(!trigger) return;
    trigger.addEventListener('click', function(e){
      e.stopPropagation();
      var isOpen = it.classList.contains('open');
      closeAll();
      if(!isOpen){ it.classList.add('open'); trigger.setAttribute('aria-expanded','true'); }
      // on mobile, opening a dropdown shouldn't close the menu
      else { trigger.setAttribute('aria-expanded','false'); }
    });
    // close on selecting a dropdown link (mobile)
    it.querySelectorAll('.dropdown a').forEach(function(a){
      a.addEventListener('click', function(){
        it.classList.remove('open'); trigger.setAttribute('aria-expanded','false');
      });
    });
  });
  // close dropdowns on outside click
  document.addEventListener('click', function(e){
    if(!e.target.closest('.nav-item')) closeAll();
  });
  // close dropdowns on escape
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape'){ closeAll(); } });

  // Mobile nav toggle
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.navlinks');
  if(toggle && links){
    toggle.addEventListener('click', function(){
      const open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? '✕' : '☰';
    });
    links.querySelectorAll('a, .nav-trigger').forEach(function(a){
      a.addEventListener('click', function(){
        // only collapse menu when clicking a real page link, not the row
        if(a.tagName === 'A'){
          links.classList.remove('open');
          if(toggle){ toggle.setAttribute('aria-expanded','false'); toggle.textContent='☰'; }
        }
      });
    });
  }

  // Scroll progress bar
  var bar = document.getElementById('progress');
  var ticking = false;
  function updateProgress(){
    var h = document.documentElement;
    var max = h.scrollHeight - window.innerHeight;
    var p = max > 0 ? Math.min(1, window.scrollY / max) : 0;
    if(bar) bar.style.setProperty('--p', p);
    ticking = false;
  }
  window.addEventListener('scroll', function(){ if(!ticking){ requestAnimationFrame(updateProgress); ticking=true; } }, {passive:true});
  updateProgress();

  // Reveal on scroll
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){
    document.querySelectorAll('.reveal').forEach(function(el){ el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, {threshold:0.12});
    document.querySelectorAll('.reveal').forEach(function(el){ io.observe(el); });
  }
})();
