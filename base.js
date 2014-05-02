var detector = new detector_object() ;

var histogram = null ;
var plot_space = null ;
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
  
  //histogram = new histogram_object('mass (Kπ)' , 500, 1500, 25, 'MeV') ;
  //histogram = new histogram_object('mass (KK)' , 1000, 1100, 25, 'MeV') ;
  //histogram = new histogram_object('mass (ππγ)' ,   0, 2000, 50, 'MeV') ;
  //histogram = new histogram_object('mass (γγ)' ,   450, 650, 50, 'MeV') ;
  //histogram = new histogram_object('mass (ee)' , 3090, 3100, 50, 'MeV') ;
  histogram = new histogram_object('mass (ππ)' ,   200, 1200, 50, 'MeV') ;
  //histogram = new histogram_object('m(KKπγ)-m(KKπ)' ,   0, 500, 50, 'MeV') ;
  plot_space = new plot_space_object() ;

  // Build detector
  var beampipe = new beampipe_object('beampipe', 20, 1.0, '0,0,0') ;
  var tracker  = new  tracker_object('tracker' , 0.05, 0.5,  6.0, 4, 12,                '150, 50, 50', '255,   0,   0') ;
  var ecal     = new     ecal_object('ecal'    , 0.7 , 1.7,  7.0, 3, 12, 8, 0.01, 0.05, '100,100,255', '  0,   0, 100') ;
  var hcal     = new     hcal_object('hcal'    , 1.8 , 2.8,  8.0, 4, 12, 8, 0.01, 0.05, ' 50,200, 50', '  0, 100,   0') ;
  
  detector.components.push(beampipe) ;
  detector.components.push(tracker ) ;
  detector.components.push(ecal    ) ;
  detector.components.push(hcal    ) ;
  
  detector.triggers.push(new BaBar_trigger_object()) ;
  
  detector.assess_critical_layers() ;
  update_coords() ;
  
  draw_detector([]) ;
  histogram.draw(plot_space, 'e') ;
  heartbeat() ;
  stopwatch() ;
}

function    Get(id  ){ return document.getElementById(id)  ; }
function Create(type){ return document.createElement(type) ; }

function heartbeat(){
  if(counter>stop && stop>0) return ;
  if(!pause){
    Get('pre_info').innerHTML = '' ;
    var mu = 10580 ;
    var gammaStar = virtual_photon_object([0,0,0], mu) ;
    var success = false ;
    var particles = [] ;
    var n_tries = 0 ;
    while(success==false && n_tries<100){
      n_tries++ ;
      gammaStar.decay_top_level(mu) ;
      particles = recursively_add_particles(gammaStar, []) ;
      
      // Check the trigger
      for(var i=0 ; i<detector.triggers.length ; i++){
        if(detector.triggers[i].analyse_particles(particles)){
          success = true ;
          break ;
        }
      }
    }
    if(counter==0) write_particle_info_table(particles) ;
    if(success){
      for(var i=0 ; i<particles.length ; i++){ particles[i].id = i ; }
      var paths = detector.process_particles(particles) ;
      smear_p(particles, 0.02) ;
      var event = new event_container(particles) ;
      
      var pions_plus  = filter_list_of_particles_by_p(event.pions_p(), 10) ;
      var pions_minus = filter_list_of_particles_by_p(event.pions_m(), 10) ;
      var pipi = combine_lists_of_particles(333, [pions_plus,pions_minus]) ;
      for(var i=0 ; i<pipi.length ; i++){ histogram.fill(pipi[i].p4_0.m()) ; }
      
      if(counter%draw_interval==0){
        write_particle_info_table(particles) ;
        draw_detector(paths) ;
      }
      histogram.draw(plot_space, 'e') ;
      if(success) events.push(event) ;
    }
    counter++ ;
    Get('span_nEvents').innerHTML = events.length + ' / ' + counter ;
  }
  if(one_event){
    pause = true ;
    one_event = false ;
  }
  window.setTimeout(heartbeat, delay) ;
}

function stopwatch(){
  if(!pause){
    stopwatch_time += stopwatch_delay ;
    Get('span_stopwatch').innerHTML = stopwatch_time ;
  }
  window.setTimeout(stopwatch, stopwatch_delay) ;
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



