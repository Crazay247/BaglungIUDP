const BOUNDS = {
  dem: [[28.1838889,83.535],[28.3172222,83.6747222]],
  landcover: [[28.1813288,83.5320222],[28.3196582,83.6777501]],
  suitability: [[28.1804696,83.5306853],[28.320699,83.6787208]],
  flood: [[28.18047,83.5306853],[28.320699,83.6787203]],
  landslide: [[28.18047,83.5306853],[28.320699,83.6787203]],
  hillshade: [[28.1838889,83.535],[28.3172222,83.6747222]],
};
const CENTER = [28.251, 83.605];
const OVERLAYS = {
  dem:{url:'assets/overlays/dem_relief.png',bounds:BOUNDS.dem,opacity:0.72},
  hillshade:{url:'assets/overlays/hillshade.png',bounds:BOUNDS.hillshade,opacity:0.55},
  landcover:{url:'assets/overlays/landcover.png',bounds:BOUNDS.landcover,opacity:0.68},
  suitability:{url:'assets/overlays/suitability.png',bounds:BOUNDS.suitability,opacity:0.68},
  flood:{url:'assets/overlays/flood.png',bounds:BOUNDS.flood,opacity:0.62},
  landslide:{url:'assets/overlays/landslide.png',bounds:BOUNDS.landslide,opacity:0.62},
};
let map, baseLayers={}, imageLayers={}, vectorLayers={}, wardLayer, wardData;
let highlightedWard=null;
const RM = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const state = {base:'osm', overlays:{dem:false,hillshade:false,landcover:false,suitability:false,flood:false,landslide:false}, vectors:{wards:true,boundary:true,roads:false,rivers:false,hospitals:false,schools:false,ward_offices:false}};
function wardColor(pop){
  if(pop>=5759) return '#7f1d1d';
  if(pop>=3648) return '#c1502e';
  if(pop>=3221) return '#e07a3f';
  if(pop>=2397) return '#f2a900';
  return '#ffe9a6';
}
function roadStyle(f){
  const cat=(f.properties.road_category||'').toLowerCase();
  let color='#9e9e9e', weight=1.6;
  if(cat.includes('primary')){color='#c1121f'; weight=3.2}
  else if(cat.includes('secondary')){color='#e11a6e'; weight=2.6}
  else if(cat.includes('tertiary')){color='#f2a900'; weight=2.2}
  else if(cat.includes('residential')){color='#6b7280'; weight=1.9}
  else if(cat.includes('track')){color='#a68b5b'; weight=1.6}
  else if(cat.includes('pedestrian')){color='#9aa0a6'; weight=1.2}
  const surf=(f.properties.surface_class||'');
  const dash = surf==='Not Blacktopped' ? '6 6' : null;
  return {color,weight,opacity:0.95,dashArray:dash};
}
async function initMap(){
  map = L.map('map',{center:CENTER,zoom:13,zoomControl:false,attributionControl:true,dragging:false,scrollWheelZoom:false,doubleClickZoom:false,boxZoom:false,keyboard:false,tap:false,touchZoom:false});
  L.control.zoom({position:'bottomright'}).addTo(map);
  L.control.scale({position:'bottomleft',metric:true,imperial:false}).addTo(map);
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap'}).addTo(map);
  const esri = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',{attribution:'Esri'});
  const carto = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',{attribution:'&copy; CARTO'});
  baseLayers={osm,esri,carto};
  map.createPane('overlayPane'); map.getPane('overlayPane').style.zIndex=350;
  map.createPane('vectorPane'); map.getPane('vectorPane').style.zIndex=400;
  // image overlays
  for(const k of Object.keys(OVERLAYS)){
    const o=OVERLAYS[k];
    imageLayers[k]=L.imageOverlay(o.url,o.bounds,{opacity:o.opacity,pane:'overlayPane',interactive:false});
  }
  // fetch light vectors first (don't block on roads 1MB)
  const [wards, hosp, schools, woff, boundary, rivers] = await Promise.all([
    fetch('assets/data/wards.geojson').then(r=>r.json()),
    fetch('assets/data/hospitals.geojson').then(r=>r.json()),
    fetch('assets/data/schools.geojson').then(r=>r.json()),
    fetch('assets/data/ward_offices.geojson').then(r=>r.json()),
    fetch('assets/data/boundary.geojson').then(r=>r.json()),
    fetch('assets/data/rivers.geojson').then(r=>r.json()).catch(()=>({type:'FeatureCollection',features:[]}))
  ]);
  wardData=wards;
  // boundary
  vectorLayers.boundary = L.geoJSON(boundary,{pane:'vectorPane',style:{color:'#1c4f3a',weight:2.2,fill:false,opacity:0.9,lineCap:'round'}}).addTo(map);
  // wards choropleth
  wardLayer = L.geoJSON(wards,{
    pane:'vectorPane',
    style:f=>({fillColor:wardColor(f.properties.POPULATION),fillOpacity:0.62,color:'#fff',weight:1,opacity:0.9}),
    onEachFeature:(f,layer)=>{
      const p=f.properties;
      layer.bindPopup(`<b>Ward ${p.WARD}</b><br>Population: ${p.POPULATION?.toLocaleString()||'â€”'}<br>${p.PALIKA||''}`);
      layer.on('mouseover',()=>{
        if(String(p.WARD)===String(highlightedWard)) return;
        layer.setStyle({weight:2,fillOpacity:0.78});
      });
      layer.on('mouseout',()=>{
        if(String(p.WARD)===String(highlightedWard)) return;
        wardLayer.resetStyle(layer);
      });
      layer.on('click',()=> { map.fitBounds(layer.getBounds(),{padding:[20,20]}); highlightWard(p.WARD); layer.openPopup(); });
    }
  }).addTo(map);
  vectorLayers.wards=wardLayer;
  // rivers (add before roads so roads are on top)
  vectorLayers.rivers = L.geoJSON(rivers,{pane:'vectorPane',style:{color:'#0ea5e9',weight:2,opacity:0.8}});
  // hospitals/schools/ward_offices â€” add schools first, hospitals on top to avoid cover (qa m13)
  const schoolIcon = L.divIcon({className:'',html:`<div style="width:10px;height:10px;background:#1c4f3a;border:2px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.2)"></div>`,iconSize:[10,10],iconAnchor:[5,5]});
  vectorLayers.schools = L.geoJSON(schools,{pane:'vectorPane',pointToLayer:(f,latlng)=> L.marker(latlng,{icon:schoolIcon}),onEachFeature:(f,l)=> l.bindPopup(`<b>${f.properties.name||'School'}</b><br>${f.properties.location||''}`)});
  const hospIcon = (c='#c1121f')=> L.divIcon({className:'',html:`<div style="width:14px;height:14px;background:${c};border:2px solid #fff;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.25)"></div>`,iconSize:[14,14],iconAnchor:[7,7]});
  vectorLayers.hospitals = L.geoJSON(hosp,{pane:'vectorPane',pointToLayer:(f,latlng)=> L.marker(latlng,{icon:hospIcon(),zIndexOffset:100}),onEachFeature:(f,l)=> l.bindPopup(`<b>${f.properties.name||'Hospital'}</b><br>${f.properties.operator||''}<br><span style="opacity:.7">${f.properties.healthcare||''}</span>`)});
  const woffIcon = L.divIcon({className:'',html:`<div style="width:12px;height:12px;background:#f2a900;border:2px solid #fff;transform:rotate(45deg);box-shadow:0 2px 8px rgba(0,0,0,0.2)"></div>`,iconSize:[12,12],iconAnchor:[6,6]});
  vectorLayers.ward_offices = L.geoJSON(woff,{pane:'vectorPane',pointToLayer:(f,latlng)=> L.marker(latlng,{icon:woffIcon}),onEachFeature:(f,l)=> l.bindPopup(`<b>${f.properties.name||'Ward Office'}</b><br>Ward ${f.properties.ward_no||''}`)});
  // lazy load roads (1MB) after initial paint
  fetch('assets/data/roads.geojson').then(r=>r.json()).then(roads=>{
    vectorLayers.roads = L.geoJSON(roads,{pane:'vectorPane',style:roadStyle,onEachFeature:(f,l)=>{
      const p=f.properties;
      l.bindPopup(`<b>${p.road_category||'Road'}</b><br>${p.name||''}<br>Ward ${p.WARD||'â€”'} Â· ${(p.length_km||0).toFixed(2)} km<br>Surface: ${p.surface_class||'â€”'}`);
    }});
    // if transport scene is active, show immediately
    if(state.vectors.roads && !map.hasLayer(vectorLayers.roads)) vectorLayers.roads.addTo(map);
  }).catch(()=>{});
  // populate ward select
  const sel=document.getElementById('wardSelect');
  if(sel){
    [...wards.features].sort((a,b)=>a.properties.WARD-b.properties.WARD).forEach(f=>{
      const o=document.createElement('option'); o.value=f.properties.WARD; o.textContent=`Ward ${f.properties.WARD} â€” ${f.properties.POPULATION?.toLocaleString()} ppl`; sel.appendChild(o);
    });
    sel.addEventListener('change',e=>{
      const w=e.target.value;
      if(!w) return;
      const lyr = wardLayer.getLayers().find(l=> String(l.feature.properties.WARD)===String(w));
      if(lyr){ map.fitBounds(lyr.getBounds(),{padding:[24,24]}); lyr.openPopup(); highlightWard(w); }
    });
  }
  wireControls();
  buildLegend();
  applyScene('overview');
  // chapter rail
  buildChapterRail();
}
function wireControls(){
  document.querySelectorAll('[data-base]').forEach(r=>r.addEventListener('change',e=>{
    const v=e.target.value;
    Object.values(baseLayers).forEach(l=>{ if(map.hasLayer(l)) map.removeLayer(l); });
    baseLayers[v].addTo(map);
    state.base=v;
  }));
  document.querySelectorAll('[data-overlay]').forEach(cb=>cb.addEventListener('change',e=>{
    const k=e.target.getAttribute('data-overlay'); state.overlays[k]=e.target.checked;
    const lyr=imageLayers[k];
    if(!lyr) return;
    if(e.target.checked){
      lyr.setOpacity(0); lyr.addTo(map);
      requestAnimationFrame(()=> lyr.setOpacity(OVERLAYS[k].opacity));
    } else {
      lyr.setOpacity(0);
      setTimeout(()=>{ if(map.hasLayer(lyr) && !state.overlays[k]) map.removeLayer(lyr); }, 220);
    }
    buildLegend();
  }));
  document.querySelectorAll('[data-vector]').forEach(cb=>cb.addEventListener('change',e=>{
    const k=e.target.getAttribute('data-vector'); state.vectors[k]=e.target.checked;
    const lyr=vectorLayers[k];
    if(!lyr) return;
    if(e.target.checked) lyr.addTo(map); else if(map.hasLayer(lyr)) map.removeLayer(lyr);
  }));
  const op=document.getElementById('opacity');
  if(op) op.addEventListener('input',e=>{
    const v=parseFloat(e.target.value);
    Object.values(imageLayers).forEach(l=> l.setOpacity(v));
    document.getElementById('opVal').textContent=Math.round(v*100)+'%';
  });
  // drawer: hidden by default â€” single trigger, no overlap
  const ctrlPanel=document.getElementById('controlsPanel');
  const ctrlTrigger=document.getElementById('ctrlTrigger');
  const legendEl=document.getElementById('legend');
  const legendTrigger=document.getElementById('legendTrigger');
  const legendClose=document.getElementById('legendClose');
  if(ctrlTrigger && ctrlPanel){
    ctrlPanel.classList.remove('open');
    ctrlTrigger.textContent='âš™ Layers';
    ctrlTrigger.setAttribute('aria-expanded','false');
    ctrlTrigger.addEventListener('click',()=>{
      const willOpen = !ctrlPanel.classList.contains('open');
      ctrlPanel.classList.toggle('open', willOpen);
      ctrlTrigger.textContent = willOpen ? 'âœ• Close' : 'âš™ Layers';
      ctrlTrigger.setAttribute('aria-expanded', String(willOpen));
      if(willOpen) legendEl?.classList.remove('open');
      setTimeout(()=> map.invalidateSize(), 360);
    });
    ctrlPanel.addEventListener('transitionend',()=> map.invalidateSize());
  }
  if(legendTrigger && legendEl){
    legendTrigger?.addEventListener('click',()=>{
      const willOpen = !legendEl.classList.contains('open');
      legendEl.classList.toggle('open', willOpen);
      if(willOpen) ctrlPanel?.classList.remove('open');
      if(willOpen) ctrlTrigger.textContent='âš™ Layers';
    });
    legendClose?.addEventListener('click',()=>{
      const isMob = window.matchMedia('(max-width:768px)').matches;
      if(isMob){
        legendEl.classList.remove('open');
      } else {
        const hidden = legendEl.style.display==='none';
        legendEl.style.display = hidden ? 'block' : 'none';
        legendClose.textContent = hidden ? 'âˆ’' : '+';
      }
    });
  }
}
function highlightWard(w){
  highlightedWard = String(w);
  wardLayer.eachLayer(l=>{
    const is = String(l.feature.properties.WARD)===String(w);
    l.setStyle({weight:is?3:1,fillOpacity:is?0.82:0.62,color:is?'#1c4f3a':'#fff'});
  });
}
function buildLegend(){
  const el=document.getElementById('legendBody');
  if(!el) return;
  const active = Object.entries(state.overlays).filter(([k,v])=>v).map(([k])=>k);
  let html='';
  if(active.includes('dem')) html+=`<div class="row"><span class="sw" style="background:linear-gradient(90deg,#2e7d32,#ffea00,#c1121f)"></span> DEM 645â€“2679 m (terrain tint)</div>`;
  if(active.includes('landcover')) html+=`<div class="row"><span class="sw" style="background:#006400"></span> Tree (10)</div><div class="row"><span class="sw" style="background:#ffbb22"></span> Shrub (20)</div><div class="row"><span class="sw" style="background:#ffff4c"></span> Grass (30)</div><div class="row"><span class="sw" style="background:#f096ff"></span> Cropland (40)</div><div class="row"><span class="sw" style="background:#fa0000"></span> Built (50)</div><div class="row"><span class="sw" style="background:#0064c8"></span> Water (80)</div>`;
  if(active.includes('suitability')) html+=`<div class="row"><span class="sw" style="background:#8c8c8c"></span> 0 Constrained</div><div class="row"><span class="sw" style="background:#c1502e"></span> 1 Very low</div><div class="row"><span class="sw" style="background:#f2a900"></span> 3 Moderate</div><div class="row"><span class="sw" style="background:#1c8a4d"></span> 5 Very high</div>`;
  if(active.includes('flood')||active.includes('landslide')) html+=`<div class="row"><span class="sw" style="background:linear-gradient(90deg,#fff8ef,#ffd166,#ef476f,#7f1d1d)"></span> Risk low â†’ high</div>`;
  if(!html) html=`<div class="row"><span class="sw" style="background:#f2a900"></span> Ward pop: 1 875â€“9 829</div><div class="row"><span class="sw" style="background:#c1121f"></span> Primary road</div><div class="row"><span class="sw" style="background:#1c4f3a"></span> School / Hospital (tap)</div>`;
  el.innerHTML=html;
  // auto show/hide legend based on need
  const legendEl=document.getElementById('legend');
  if(legendEl && window.matchMedia('(max-width:768px)').matches){
    // on mobile keep collapsed unless gradient legend needed
    if(active.includes('dem')||active.includes('landcover')||active.includes('suitability')||active.includes('flood')||active.includes('landslide')){
      // keep as is (user can open)
    }
  }
}
const SCENES={
  overview:{overlays:{},vectors:{wards:true,boundary:true,roads:false,rivers:false,hospitals:false,schools:false,ward_offices:false},zoom:13},
  terrain:{overlays:{hillshade:true,dem:true},vectors:{wards:false,boundary:true,rivers:true},zoom:13},
  wards:{overlays:{},vectors:{wards:true,boundary:true},zoom:13},
  transport:{overlays:{},vectors:{wards:true,roads:true,boundary:true},zoom:13},
  landcover:{overlays:{landcover:true},vectors:{boundary:true},zoom:13},
  hazard:{overlays:{flood:true,landslide:false},vectors:{boundary:true},zoom:13},
  suitability:{overlays:{suitability:true},vectors:{boundary:true,wards:true},zoom:13},
  services:{overlays:{},vectors:{wards:true,hospitals:true,schools:true,ward_offices:true,boundary:true},zoom:13},
};
function applyScene(id){
  const s=SCENES[id]; if(!s) return;
  // overlays with crossfade
  for(const k of Object.keys(OVERLAYS)){
    const want=!!s.overlays[k];
    const cb=document.querySelector(`[data-overlay="${k}"]`);
    if(cb) cb.checked=want;
    if(state.overlays[k]===want) continue;
    state.overlays[k]=want;
    const lyr=imageLayers[k];
    if(!lyr) continue;
    if(want){
      lyr.setOpacity(0); if(!map.hasLayer(lyr)) lyr.addTo(map);
      requestAnimationFrame(()=> lyr.setOpacity(OVERLAYS[k].opacity));
    } else {
      lyr.setOpacity(0);
      setTimeout(()=>{ if(!state.overlays[k] && map.hasLayer(lyr)) map.removeLayer(lyr); }, 220);
    }
  }
  for(const k of Object.keys(vectorLayers)){
    const want = s.vectors[k]!==undefined ? s.vectors[k] : state.vectors[k];
    const cb=document.querySelector(`[data-vector="${k}"]`);
    if(cb) cb.checked=want;
    state.vectors[k]=want;
    const lyr=vectorLayers[k];
    if(!lyr) continue;
    if(want){ if(!map.hasLayer(lyr)) lyr.addTo(map); } else { if(map.hasLayer(lyr)) map.removeLayer(lyr); }
  }
  const dur = RM ? 0 : 1.1;
  if(s.zoom) map.flyTo(CENTER,s.zoom,{duration:dur});
  buildLegend();
  document.querySelectorAll('.panel').forEach(p=>p.classList.toggle('active',p.id===`sec-${id}`));
  // chapter rail
  document.querySelectorAll('.chapter-rail i').forEach((el,i)=>{
    const pid = document.querySelectorAll('.panel')[i]?.id?.replace('sec-','');
    el.classList.toggle('active', pid===id);
  });
}
function buildChapterRail(){
  const rail=document.getElementById('chapterRail');
  if(!rail) return;
  document.querySelectorAll('.panel').forEach((p,idx)=>{
    const dot=document.createElement('i');
    dot.title=p.querySelector('h2')?.textContent||'';
    dot.style.setProperty('--i', idx);
    dot.addEventListener('click',()=> p.scrollIntoView({behavior: RM?'auto':'smooth', block:'center'}));
    rail.appendChild(dot);
  });
}
function initObserver(){
  const panels=document.querySelectorAll('.panel');
  panels.forEach((p,i)=> p.style.setProperty('--i', i));
  const io=new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      const isIn = e.isIntersecting;
      e.target.classList.toggle('in-view', isIn);
      if(isIn){
        const id=e.target.id.replace('sec-','');
        applyScene(id);
      }
    });
  },{root:null,rootMargin:'-40% 0px -40% 0px',threshold:0});
  panels.forEach(p=>io.observe(p));
  // ensure first panel visible on load
  requestAnimationFrame(()=> panels[0]?.classList.add('in-view'));
}
function initProgress(){
  const bar=document.getElementById('progress');
  if(!bar) return;
  let ticking=false;
  const update=()=>{
    const h=document.documentElement;
    const max = h.scrollHeight - window.innerHeight;
    const p = max>0 ? Math.min(1, window.scrollY / max) : 0;
    bar.style.setProperty('--p', p);
    ticking=false;
  };
  window.addEventListener('scroll',()=>{
    if(!ticking){ requestAnimationFrame(update); ticking=true; }
  }, {passive:true});
  update();
}
document.addEventListener('DOMContentLoaded', async ()=>{
  await initMap();
  initObserver();
  initProgress();
  // hazard toggle helper
  document.getElementById('hazardToggle')?.addEventListener('click',()=>{
    const f=document.querySelector('[data-overlay="flood"]');
    const l=document.querySelector('[data-overlay="landslide"]');
    const showFlood = !f.checked;
    f.checked=showFlood; l.checked=!showFlood;
    f.dispatchEvent(new Event('change')); l.dispatchEvent(new Event('change'));
    buildLegend();
  });
  // fullscreen button
  const fsBtn=document.getElementById('fsBtn');
  if(fsBtn){
    fsBtn.addEventListener('click',()=>{
      const el=document.getElementById('map');
      if(!document.fullscreenElement){ el.requestFullscreen?.(); } else { document.exitFullscreen?.(); }
    });
    document.addEventListener('fullscreenchange',()=>{
      setTimeout(()=> map.invalidateSize(), 200);
      fsBtn.textContent = document.fullscreenElement ? 'âœ• Exit' : 'â›¶ Fullscreen';
      fsBtn.setAttribute('aria-label', document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen');
    });
  }
  // invalidate on resize debounced
  let rT;
  window.addEventListener('resize',()=>{
    clearTimeout(rT);
    rT=setTimeout(()=> map.invalidateSize(), 150);
  });
});
