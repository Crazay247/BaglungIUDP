// Gallery page data + filtering + lightbox
// Chart metadata compiled from 00_CHART_INDEX.md and SDP manifest.
const DEMO_TITLES = {
  "01_population_trend_and_ward_growth.png":"Population trend & ward growth 2011–2036",
  "02_ward_population_2011_2021.png":"Ward population 2011 vs 2021",
  "03_ward_density_2021.png":"Ward density (log scale)",
  "04_age_sex_pyramid_2021.png":"Age–sex pyramid 2021",
  "05_broad_age_groups.png":"Broad age groups vs national",
  "06_population_projection_scenarios.png":"Population projection scenarios",
  "07_households_vs_population.png":"Households vs population — fragmentation",
  "08_household_size_by_ward.png":"Household size by ward",
  "09_female_headed_households.png":"Female-headed households by ward",
  "10_family_structure_by_ward.png":"Nuclear vs extended family by ward",
  "11_caste_composition.png":"Caste composition",
  "12_religion.png":"Religion (94.6% Hindu)",
  "13_mother_tongue.png":"Mother tongue",
  "14_literacy_trend.png":"Literacy trend 2011–21 vs national",
  "15_ward_literacy.png":"Literacy by ward",
  "16_educational_attainment.png":"Educational attainment",
  "17_place_of_birth.png":"Place of birth",
  "18_reasons_in_migration.png":"Reasons for in-migration",
  "19_absent_population_ward.png":"Absent population by ward",
  "20_absent_abroad_reasons.png":"Reasons absent abroad",
  "21_absent_abroad_age.png":"Age at leaving abroad",
  "22_absent_abroad_destination.png":"Destination abroad",
  "23_age_at_marriage_ward.png":"Age at marriage by ward",
  "24_child_marriage_ward.png":"Child marriage by ward",
  "25_widows_single_women.png":"Widows & single women",
  "26_birth_registration.png":"Birth registration by ward",
  "27_child_sex_ratio.png":"Child sex ratio",
  "28_aged_60plus_ward.png":"Aged 60+ by ward",
  "29_old_age_dependency.png":"Old-age dependency",
  "30_disability_prevalence_ward.png":"Disability prevalence by ward",
  "31_disability_type.png":"Disability by type",
  "32_economic_activity.png":"Economic activity",
  "33_reasons_inactivity.png":"Reasons for inactivity",
  "34_employment_industry.png":"Employment by industry",
  "35_norms_vs_present_gaps.png":"Norms vs present gaps (dumbbell)",
  "36_projection_fan_chart.png":"Projection fan chart",
  "37_ward_population_dumbbell.png":"Ward population dumbbell",
  "38_household_size_dumbbell.png":"Household size dumbbell",
  "39_marriage_age_dumbbell.png":"Marriage age dumbbell",
  "40_literacy_slope_chart.png":"Literacy slope chart",
  "41_ward_growth_lollipop.png":"Ward growth lollipop",
  "42_mother_tongue_lollipop.png":"Mother tongue lollipop",
  "43_disability_type_lollipop.png":"Disability type lollipop",
  "44_absent_age_donut.png":"Absent age donut",
  "45_caste_waffle.png":"Caste waffle (each cell = 1%)",
  "46_schools_students_bubble.png":"Schools vs students bubble",
  "47_ward_heatmap.png":"Ward profile heatmap",
  "48_place_of_birth_100stack.png":"Place of birth 100% stacked",
  "49_economic_activity_diverging.png":"Economic activity diverging bars",
  "50_child_sex_ratio_dotplot.png":"Child sex ratio dot plot",
  "51_age_pyramid_2031_overlay.png":"Age pyramid 2021 vs 2031 overlay",
  "52_dependency_trajectory.png":"Dependency trajectory",
  "53_school_age_demand.png":"School-age demand",
  "54_youth_drain_15_34.png":"Youth 15–34 drain",
  "55_household_housing_demand.png":"Household & housing demand",
  "56_ward_ageing_2031.png":"Ward ageing 2031",
  "57_female_headed_hh_counts.png":"Female-headed household counts",
  "58_child_services_demand.png":"Child services demand",
  "59_gap_closure_scorecard.png":"Gap-closure scorecard",
  "60_forward_dashboard.png":"Four-forces dashboard"
};
const DEMO_DESC = {
  "04_age_sex_pyramid_2021.png":"Female-heavy 25–54; sex ratio 86.9 vs national 95.6.",
  "60_forward_dashboard.png":"Ageing + youth drain + fragmentation + urban-core pull — the four forces.",
  "41_ward_growth_lollipop.png":"Core grew; 9 of 14 wards shrank 2011–2021.",
  "47_ward_heatmap.png":"Core leads growth/density/literacy; wards 9–13 lead ageing.",
  "35_norms_vs_present_gaps.png":"Birth registration 62% & internet 47% are the widest gaps.",
  "06_population_projection_scenarios.png":"Four scenarios from the 55,261 base to 2036."
};
const MAP_TITLES = [
  ["01_location_region.png","Location & region"],
  ["02_wards_population.png","Wards & population"],
  ["03_topography.png","Topography (DEM)"],
  ["04_landcover_2021.png","Land cover 2021"],
  ["05_land_suitability.png","Land suitability"],
  ["06_flood_hazard.png","Flood hazard"],
  ["07_landslide_hazard.png","Landslide hazard"],
  ["08_road_network.png","Road network"],
  ["09_social_infrastructure.png","Social infrastructure"],
  ["10_water_resources.png","Water resources"],
  ["11_tourism_assets.png","Tourism assets"],
  ["12_development_concept.png","Development concept"],
  ["13_wards_map.png","Wards map"],
  ["14_settlements.png","Settlements"],
  ["15_slope_aspect.png","Slope & aspect"],
  ["16_temperature.png","Temperature"],
  ["17_fault_lines.png","Fault lines"],
  ["18_electricity.png","Electricity & transmission"],
  ["19_waste_route.png","Solid waste & transit route"],
  ["20_agriculture.png","Agricultural plantation"],
  ["21_animals.png","Animal husbandry"],
  ["22_hospital_buffer.png","Hospital 1km buffer"],
  ["23_school_buffer.png","School buffer radius"],
  ["24_ward_offices.png","Ward offices"],
  ["25_services.png","Services"],
  ["26_flow_accumulation.png","Flow accumulation (hydrology)"]
];
const SDP_TITLES = {
  "c01_pop_trend.png":"Population trend", "c02_ward_pop.png":"Ward population",
  "c03_scenarios.png":"Projection scenarios", "c04_sensitivity_fan.png":"Sensitivity fan",
  "c05_methods.png":"Projection methods", "c06_ward_proj.png":"Ward projections",
  "c07_pyramid.png":"Age–sex pyramid", "c08_broad_age.png":"Broad age groups",
  "c09_dependency.png":"Dependency ratio", "c10_ageing.png":"Ageing trajectory",
  "c11_ward_old_age.png":"Ward old-age share", "c12_pop_hh.png":"Population vs households",
  "c13_hh_size.png":"Household size", "c14_female_headed.png":"Female-headed households",
  "c15_family_type.png":"Family type", "c16_hh_change.png":"Household change",
  "c17_caste.png":"Caste composition", "c18_religion.png":"Religion",
  "c19_language.png":"Language", "c20_literacy.png":"Literacy",
  "c21_ward_literacy.png":"Ward literacy", "c22_attainment.png":"Educational attainment",
  "c23_attendance.png":"School attendance", "c24_schools.png":"Schools & students",
  "c25_school_type.png":"School type", "c26_health_posts.png":"Health posts",
  "c27_dengue.png":"Dengue cases", "c28_absent_abroad.png":"Absent abroad",
  "c29_absent_dest.png":"Absent destination", "c30_absent_reason.png":"Reason for absence",
  "c30b_absent_age.png":"Absent age", "c31_inmigration.png":"In-migration",
  "c32_marriage_age.png":"Marriage age", "c33_child_marriage.png":"Child marriage",
  "c34_widows.png":"Widows & single women", "c35_child_sex_ratio.png":"Child sex ratio",
  "c36_birth_registration.png":"Birth registration", "c37_disability_ward.png":"Disability by ward",
  "c38_disability_type.png":"Disability by type", "c39_activity.png":"Economic activity",
  "c40_inactivity.png":"Reasons for inactivity", "c41_industry.png":"Employment by industry",
  "c42_occupation.png":"Occupation", "c43_agri_nonagri.png":"Agriculture vs non-agriculture",
  "c44_wealth.png":"Wealth distribution", "c45_amenities.png":"Household amenities",
  "c46_crime.png":"Crime records", "c47_suicide.png":"Suicide reports",
  "c48_traffic.png":"Traffic accidents", "c49_norms.png":"Norms gaps",
  "c50_deprivation.png":"Deprivation index", "c51_three_baglungs.png":"Three Baglungs"
};
(function(){
  var grid = document.getElementById('galleryGrid');
  if(!grid) return;
  var activeTab = 'demographic';
  var lb = document.getElementById('lightbox');
  var lbImg = lb ? lb.querySelector('img') : null;
  var lbCap = lb ? lb.querySelector('figcaption') : null;

  function cleanName(f){ return f.replace(/\.png$/,'').replace(/_/g,' '); }
  function esc(s){ return String(s).replace(/[&<>"']/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]; }); }

  function render(){
    var html = '';
    if(activeTab === 'demographic'){
      Object.keys(DEMO_TITLES).forEach(function(f){
        html += '<figure class="card gallery-card reveal in">';
        html += '<button class="gl-img" data-src="assets/charts/demographic/'+encodeURIComponent(f)+'" data-cap="'+esc(DEMO_TITLES[f])+'">';
        html += '<img loading="lazy" src="assets/charts/demographic/'+encodeURIComponent(f)+'" alt="'+esc(DEMO_TITLES[f])+'"></button>';
        html += '<figcaption class="cap"><span class="tagline">Demographic · '+f.slice(0,2)+'</span><b>'+esc(DEMO_TITLES[f])+'</b>';
        if(DEMO_DESC[f]) html += '<p>'+esc(DEMO_DESC[f])+'</p>';
        html += '</figcaption></figure>';
      });
    } else if(activeTab === 'sdp'){
      Object.keys(SDP_TITLES).forEach(function(f){
        html += '<figure class="card gallery-card reveal in">';
        html += '<button class="gl-img" data-src="assets/charts/sdp/'+encodeURIComponent(f)+'" data-cap="'+esc(SDP_TITLES[f])+'">';
        html += '<img loading="lazy" src="assets/charts/sdp/'+encodeURIComponent(f)+'" alt="'+esc(SDP_TITLES[f])+'"></button>';
        html += '<figcaption class="cap"><span class="tagline">SDP · '+f.replace('.png','')+'</span><b>'+esc(SDP_TITLES[f])+'</b></figcaption></figure>';
      });
    } else if(activeTab === 'maps'){
      MAP_TITLES.forEach(function(arr){
        var f = arr[0], t = arr[1];
        html += '<figure class="card gallery-card reveal in">';
        html += '<button class="gl-img" data-src="assets/maps/'+encodeURIComponent(f)+'" data-cap="'+esc(t)+'">';
        html += '<img loading="lazy" src="assets/maps/'+encodeURIComponent(f)+'" alt="'+esc(t)+'"></button>';
        html += '<figcaption class="cap"><span class="tagline">GIS Map</span><b>'+esc(t)+'</b></figcaption></figure>';
      });
    } else if(activeTab === 'july28'){
      var files = window.JULY28_FILES || [];
      files.forEach(function(f){
        html += '<figure class="card gallery-card reveal in">';
        html += '<button class="gl-img" data-src="assets/july28/'+encodeURIComponent(f)+'" data-cap="'+esc(cleanName(f))+'">';
        html += '<img loading="lazy" src="assets/july28/'+encodeURIComponent(f)+'" alt="'+esc(cleanName(f))+'"></button>';
        html += '<figcaption class="cap"><span class="tagline">Print Map</span><b>'+esc(cleanName(f))+'</b></figcaption></figure>';
      });
    }
    grid.innerHTML = html;
    // wire lightbox
    grid.querySelectorAll('.gl-img').forEach(function(btn){
      btn.addEventListener('click', function(){
        lbImg.src = btn.getAttribute('data-src');
        lbCap.textContent = btn.getAttribute('data-cap');
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });
  }

  // tabs
  document.querySelectorAll('.tab[data-tab]').forEach(function(t){
    t.addEventListener('click', function(){
      document.querySelectorAll('.tab[data-tab]').forEach(function(x){ x.classList.remove('active'); });
      t.classList.add('active');
      activeTab = t.getAttribute('data-tab');
      render();
    });
  });

  // lightbox close
  if(lb){
    lb.addEventListener('click', function(e){
      if(e.target === lb || e.target.classList.contains('x') || e.target.tagName === 'FIGCAPTION' || e.target === lbCap){
        lb.classList.remove('open'); document.body.style.overflow='';
      }
    });
  }
  document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && lb){ lb.classList.remove('open'); document.body.style.overflow=''; } });

  render();
})();
