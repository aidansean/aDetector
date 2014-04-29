

var detector = new detector_object() ;

var histogram = null ;
var ps = null ;
var events = [] ;


function start(){
  document.addEventListener('keydown', keyDown) ;
  
  Get('submit_coords').addEventListener('click', update_coords) ;
  Get('input_x').value = x0 ;
  Get('input_y').value = y0 ;
  Get('input_z').value = z0 ;
  Get('input_t').value = t0*180/Math.PI ;
  Get('input_p').value = p0*180/Math.PI ;
  
  Get('th_particle_color_electron').style.backgroundColor = 'rgb(' + electron_color + ')' ;
  Get('th_particle_color_muon'    ).style.backgroundColor = 'rgb(' + muon_color     + ')' ;
  Get('th_particle_color_tau'     ).style.backgroundColor = 'rgb(' + tau_color      + ')' ;
  Get('th_particle_color_photon'  ).style.backgroundColor = 'rgb(' + photon_color   + ')' ;
  Get('th_particle_color_pion'    ).style.backgroundColor = 'rgb(' + pion_color     + ')' ;
  Get('th_particle_color_kaon'    ).style.backgroundColor = 'rgb(' + kaon_color     + ')' ;
  Get('th_particle_color_neutrino').style.backgroundColor = 'rgb(' + neutrino_color + ')' ;
  Get('th_particle_color_generic' ).style.backgroundColor = 'rgb(' + generic_color  + ')' ;
  
  histogram = new histogram_object('mass (Kππ)', 750, 3000, 50, 'MeV') ;
  histogram = new histogram_object('mass (Kπ)' , 500, 3000, 50, 'MeV') ;
  //histogram = new histogram_object('mass (ππ)' , 250, 1500, 50, 'MeV') ;
  //histogram = new histogram_object('mass (eμ)' , 100, 2600, 50, 'MeV') ;
  //histogram = new histogram_object('mass (KK)' , 800, 1800, 50, 'MeV') ;
  //histogram = new histogram_object('mass (γγ)' ,   0, 1200, 50, 'MeV') ;
  //histogram = new histogram_object('mass (ππγ)' ,   0, 2000, 50, 'MeV') ;
  ps = new plot_space() ;

  // Build detector
  var beampipe = new beampipe_object('beampipe', 20, 1.0, '0,0,0') ;
  var tracker  = new  tracker_object('tracker' , 0.05, 0.5,  6.0, 4, 12,                '150, 50, 50', '255,   0,   0') ;
  var ecal     = new     ecal_object('ecal'    , 0.7 , 1.7,  7.0, 3, 12, 3, 0.01, 0.05, '100,100,255', '  0,   0, 100') ;
  var hcal     = new     hcal_object('hcal'    , 1.8 , 2.8,  8.0, 4, 12, 3, 0.01, 0.05, ' 50,200, 50', '  0, 100,   0') ;
  
  detector.components.push(beampipe) ;
  detector.components.push(tracker ) ;
  detector.components.push(ecal    ) ;
  detector.components.push(hcal    ) ;
  
  //detector.triggers.push(new e_mu_trigger_object()) ;
  //detector.triggers.push(new mu_trigger_object()) ;
  //detector.triggers.push(new gg_trigger_object()) ;
  detector.triggers.push(new K_pi_trigger_object()) ;
  detector.triggers.push(new K_K_trigger_object()) ;
  
  detector.assess_critical_layers() ;
  update_coords() ;
  
  heartbeat() ;
}

function    Get(id  ){ return document.getElementById(id)  ; }
function Create(type){ return document.createElement(type) ; }

var gammaStar = virtual_photon_object([0,0,0], 4000) ;

function heartbeat(){
  if(counter>stop && stop>0) return ;
  if(!pause){
    Get('pre_info').innerHTML = '' ;
    
    var success = false ;
    var particles = [] ;
    var n_tries = 0 ;
    while(success==false && n_tries<10){
      n_tries++ ;
      gammaStar.decay_top_level(3800) ;
      particles = recursively_add_particles(gammaStar, []) ;
      for(var i=0 ; i<detector.triggers.length ; i++){
        if(detector.triggers[i].analyse_particles(particles)){
          success = true ;
          break ;
        }
      }
    }
    if(success) events.push(new event_container(gammaStar)) ;
    
    for(var i=0 ; i<particles.length ; i++){ particles[i].id = i ; }
    for(var i=0 ; i<particles.length ; i++){ detector.process_particle(particles[i]) ; }
    
    Get('span_nEvents').innerHTML = events.length ;
    
    
    smear_p(particles, 0.05) ;
    var photons  = filter_list_of_particles_by_pdgId(particles, 22) ;
    
    var electrons_plus  = filter_list_of_particles_by_pdgId(particles, -11) ;
    var electrons_minus = filter_list_of_particles_by_pdgId(particles,  11) ;
    var muons_plus      = filter_list_of_particles_by_pdgId(particles, -13) ;
    var muons_minus     = filter_list_of_particles_by_pdgId(particles,  13) ;
    
    var kaons_plus  = filter_list_of_particles_by_pdgId(particles, -321) ;
    var kaons_minus = filter_list_of_particles_by_pdgId(particles,  321) ;
    var pions_plus  = filter_list_of_particles_by_pdgId(particles,  211) ;
    var pions_minus = filter_list_of_particles_by_pdgId(particles, -211) ;
    
    //var D_mesons = combine_lists_of_particles(411, [kaons_plus,pions_minus,pions_minus]) ;
    //for(var i=0 ; i<D_mesons.length ; i++){ histogram.fill(D_mesons[i].p4_0.m()) ; }
    
    var pipi  = combine_lists_of_particles(113, [pions_plus,pions_minus]) ;
    var pipig = combine_lists_of_particles(113, [pions_plus,pions_minus,photons]) ;
    var Kpi   = combine_lists_of_particles(113, [kaons_plus,pions_minus]) ;
    var KK    = combine_lists_of_particles(113, [kaons_plus,kaons_minus]) ;
    var gg    = combine_lists_of_particles(111, [photons,photons]) ;
    //for(var i=0 ; i<pipi.length ; i++){ histogram.fill(pipi[i].p4_0.m()) ; }
    //for(var i=0 ; i<pipig.length ; i++){ histogram.fill(pipig[i].p4_0.m()) ; }
    for(var i=0 ; i<Kpi.length ; i++){ histogram.fill(Kpi[i].p4_0.m()) ; }
    //for(var i=0 ; i<KK.length ; i++){ histogram.fill(KK[i].p4_0.m()) ; }
    //for(var i=0 ; i<gg.length ; i++){ histogram.fill(gg[i].p4_0.m()) ; }
    
    var emu1 = combine_lists_of_particles(0, [electrons_plus,muons_minus]) ;
    var emu2 = combine_lists_of_particles(0, [muons_plus,electrons_minus]) ;
    //for(var i=0 ; i<emu1.length ; i++){ histogram.fill(emu1[i].p4_0.m()) ; }
    //for(var i=0 ; i<emu2.length ; i++){ histogram.fill(emu2[i].p4_0.m()) ; }
    
    if(counter%draw_interval==0){
      write_particle_info_table(particles) ;
      draw_detector(particles) ;
    }
    histogram.draw(ps, 'e') ;
    counter++ ;
  }
  window.setTimeout(heartbeat, delay) ;
}

function write_particle_info_table(particles){
  var precision = 3 ;
  var table = Get('table_particle_info') ;
  var tbody = Get('tbody_particle_info') ;
  tbody.innerHTML = '' ;
    
  for(var i=0 ; i<particles.length ; i++){
    var p = particles[i] ;
    var tr    = Create('tr') ;
    tr.add_td = function(className, innerHTML){
      var td = Create('td') ;
      td.innerHTML = innerHTML ;
      td.className = className ;
      tr.appendChild(td) ;
    }
      
    var td = Create('td') ;
    td.innerHTML = '&nbsp;' ;
    td.style.backgroundColor = 'rgb(' + p.color + ')' ;
    tr.appendChild(td) ;
      
    tr.add_td('particle_info', i) ;
    tr.add_td('particle_info', p.pdgId) ;
    tr.add_td('particle_info', p.p4_0.x  .toPrecision(precision)) ;
    tr.add_td('particle_info', p.p4_0.y  .toPrecision(precision)) ;
    tr.add_td('particle_info', p.p4_0.z  .toPrecision(precision)) ;
    tr.add_td('particle_info', p.p4_0.t  .toPrecision(precision)) ;
    tr.add_td('particle_info', p.p4_0.m().toPrecision(precision)) ;
    tr.add_td('particle_info', p.r_0.x   .toPrecision(precision)) ;
    tr.add_td('particle_info', p.r_0.y   .toPrecision(precision)) ;
    tr.add_td('particle_info', p.r_0.z   .toPrecision(precision)) ;
      
    var td = Create('td') ;
    td.innerHTML = '&nbsp;' ;
    td.style.backgroundColor = 'rgb(' + p.color + ')' ;
    tr.appendChild(td) ;
    tbody.appendChild(tr) ;
  }
}

function smear_p(particles, value){
  for(var i=0 ; i<particles.length ; i++){
    var rx = value*Math.log(Math.random()) ;
    var ry = value*Math.log(Math.random()) ;
    var rz = value*Math.log(Math.random()) ;
    if(Math.random()<0.5) rx *= -1 ;
    if(Math.random()<0.5) ry *= -1 ;
    if(Math.random()<0.5) rz *= -1 ;
    particles[i].p4_0.x *= 1+rx ;
    particles[i].p4_0.y *= 1+ry ;
    particles[i].p4_0.z *= 1+rz ;
  }
}



