// Site search overlay — powered by window.SITE_INDEX (see gen-search-index.js)
(function(){
  var modal = document.getElementById('searchModal');
  var openBtn = document.getElementById('searchOpen');
  var input = document.getElementById('searchInput');
  var list = document.getElementById('searchResults');
  var none = document.getElementById('searchNone');
  var closeBtn = document.getElementById('searchClose');
  var cur = -1;
  var rows = [];

  if(!modal || !input) return;

  function openSearch(){
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    cur = -1;
    input.focus();
    render('');
  }
  function closeSearch(){
    modal.hidden = true;
    document.body.style.overflow = '';
    input.value = '';
    render('');
    if(openBtn) openBtn.focus();
  }

  function norm(s){ return (s||'').toLowerCase(); }
  function esc(s){ return s.replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; }); }

  function render(q){
    var index = window.SITE_INDEX || [];
    var qq = norm(q).trim();
    list.innerHTML = '';
    rows = [];
    if(none) none.hidden = true;
    if(qq.length === 0){
      if(none) none.hidden = false;
      if(none) none.textContent = 'Type to search across the plan — e.g. “ward”, “birth”, “cable” · "उदाहरण: वडा, सेवा, योजना"';
      return;
    }
    var terms = qq.split(/\s+/).filter(function(t){ return t.length > 0; });
    var scored = [];
    (index || []).forEach(function(e){
      var words = e.w || [];
      var hay = norm(e.t + ' ' + e.d + ' ' + e.k + ' ' + (e.h || []).join(' ') + ' ' + words.join(' '));
      var titleHit = 0, headHit = 0;
      var matchedAll = terms.every(function(t){
        var has = hay.indexOf(t) >= 0;
        if(has && norm(e.t).indexOf(t) >= 0) titleHit++;
        return has;
      });
      if(matchedAll){
        (e.h || []).forEach(function(hh){ if(norm(hh).indexOf(qq) >= 0) headHit++; });
        scored.push({ e:e, titleHit:titleHit, headHit:headHit, wordHit:0 });
      }
    });
    scored.sort(function(a,b){
      if(a.headHit !== b.headHit) return b.headHit - a.headHit;
      if(a.titleHit !== b.titleHit) return b.titleHit - a.titleHit;
      return a.e.u < b.e.u ? -1 : 1;
    });
    scored = scored.slice(0, 10);

    if(scored.length === 0){
      if(none) none.hidden = false;
      if(none) none.textContent = 'No matches for “' + esc(q) + '” — try “ward”, “birth”, “cable”, “hydropower” · "पुनः प्रयास गर्नुहोस्"';
      return;
    }

    scored.forEach(function(r, i){
      var e = r.e; 
      var li = document.createElement('li');
      var a = document.createElement('a');
      a.href = e.u;
      var title = esc(e.t);
      var qr = new RegExp('(' + terms.map(esc).join('|') + ')', 'i');
      title = title.replace(qr, '<span class="hit">$1</span>');
      var desc = esc(e.d || e.k || '');
      if(desc.length > 130) desc = desc.slice(0, 130) + '…';
      a.innerHTML = '<span class="sm-title">' + title + '</span><span class="sm-desc">' + desc + '</span>';
      li.appendChild(a);
      a.addEventListener('mouseenter', function(){ setCur(i); });
      list.appendChild(li);
      rows.push(li);
    });
  }

  function setCur(i){
    rows.forEach(function(r, k){ r.firstChild.classList.toggle('sm-cur', k === i); });
    cur = i;
    if(cur >= 0 && rows[cur]) rows[cur].scrollIntoView({ block:'nearest' });
  }

  if(openBtn) openBtn.addEventListener('click', openSearch);
  if(closeBtn) closeBtn.addEventListener('click', closeSearch);
  modal.addEventListener('mousedown', function(e){ if(e.target === modal) closeSearch(); });
  document.addEventListener('keydown', function(e){
    if((e.ctrlKey || e.metaKey) && norm(e.key) === 'k'){ e.preventDefault(); modal.hidden ? openSearch() : closeSearch(); return; }
    if(e.key === 'Escape' && !modal.hidden) closeSearch();
    if(modal.hidden) return;
    if(e.key === 'ArrowDown'){ e.preventDefault(); setCur(Math.min(cur + 1, rows.length - 1)); }
    else if(e.key === 'ArrowUp'){ e.preventDefault(); setCur(Math.max(cur - 1, 0)); }
    else if(e.key === 'Enter'){ if(cur >= 0 && rows[cur]){ window.location.href = rows[cur].firstChild.getAttribute('href'); } }
  });
  if(input) input.addEventListener('input', function(){ cur = -1; render(input.value); });
})();