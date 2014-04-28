var n_JPsi = 10000 ;
var pause = false ;

var counter = 0 ;
var stop = -1 ;
var delay = 50 ;

var x0 = -4.0  ;
var y0 =  1.0  ;
var z0 = -5.0 ;
var t0 = -0.25*Math.PI ;
var p0 = -0.05*Math.PI ;
var r0 = new threeVector() ;
r0.x = x0 ; r0.y = y0 ; r0.z = z0 ;

var image_canvas_detector = [] ;
image_canvas_detector['cutaway'     ] = undefined ;
image_canvas_detector['transverse'  ] = undefined ;
image_canvas_detector['longitudinal'] = undefined ;

var B_field = 0.5 ;
var B_r     = 0.6 ;
var B_r2    = B_r*B_r ;

var detector = new detector_object() ;
var histogram = null ;
var ps = null ;

function keyDown(evt){
  var keyDownID = window.event ? event.keyCode : (evt.keyCode != 0 ? evt.keyCode : evt.which) ;
  if(keyDownID==8) evt.preventDefault ;
  switch(keyDownID){
    case 32:
      evt.preventDefault() ;
      pause = !pause ;
  }
}

function start(){
  Get('submit_coords').addEventListener('click', update_coords) ;
  Get('input_x').value = x0 ;
  Get('input_y').value = y0 ;
  Get('input_z').value = z0 ;
  Get('input_t').value = t0*180/Math.PI ;
  Get('input_p').value = p0*180/Math.PI ;
  
  Get('th_particle_color_electron').style.backgroundColor = 'rgb(' + electron_color + ')' ;
  Get('th_particle_color_muon'    ).style.backgroundColor = 'rgb(' + muon_color     + ')' ;
  Get('th_particle_color_photon'  ).style.backgroundColor = 'rgb(' + photon_color   + ')' ;
  Get('th_particle_color_pion'    ).style.backgroundColor = 'rgb(' + pion_color     + ')' ;
  Get('th_particle_color_kaon'    ).style.backgroundColor = 'rgb(' + kaon_color     + ')' ;
  Get('th_particle_color_neutrino').style.backgroundColor = 'rgb(' + neutrino_color + ')' ;
  Get('th_particle_color_generic' ).style.backgroundColor = 'rgb(' + generic_color  + ')' ;
  
  document.addEventListener('keydown', keyDown) ;
  
  histogram = new histogram_object('mass (K pi)', 0, 3000, 100, 'MeV') ;
  ps = new plot_space() ;

  var beampipe = new    beampipe_object('beampipe', 20, 1.0, '0,0,0') ;
  var tracker  = new     tracker_object('tracker' , 0.05, 0.5,  6.0, 4, 12,                 '150, 50, 50', '255,   0,   0') ;
  var ecal     = new calorimeter_object('ecal'    , 0.7 , 1.7,  7.0, 3, 24, 12, 0.01, 0.05, '100,100,255', '  0,   0, 100') ;
  var hcal     = new calorimeter_object('hcal'    , 1.8 , 2.8,  8.0, 4, 12, 12, 0.01, 0.05, ' 50,200, 50', '  0, 100,   0') ;
  
  ecal.stopping_powers['electron'] = 0.8  ;
  hcal.stopping_powers['electron'] = 0.99 ;
  ecal.stopping_powers['photon'  ] = 0.8  ;
  hcal.stopping_powers['photon'  ] = 0.99 ;
  
  ecal.stopping_powers['muon'    ] = 0.99 ;
  hcal.stopping_powers['muon'    ] = 0.99 ;
  ecal.stopping_powers['tau'     ] = 0.99 ;
  hcal.stopping_powers['tau'     ] = 0.99 ;
  
  ecal.stopping_powers['ephemeral_hadron'] = 1.0  ;
  ecal.stopping_powers['neutrino'        ] = 1.0  ;
  ecal.stopping_powers['charged_hadron'  ] = 0.999 ;
  ecal.stopping_powers['neutral_hadron'  ] = 0.999 ;
  
  hcal.stopping_powers['ephemeral_hadron'] = 1.0 ;
  hcal.stopping_powers['neutrino'        ] = 1.0 ;
  hcal.stopping_powers['charged_hadron'  ] = 0.8 ;
  hcal.stopping_powers['neutral_hadron'  ] = 0.8 ;
  
  
  detector.components.push(beampipe) ;
  detector.components.push(tracker ) ;
  detector.components.push(ecal    ) ;
  detector.components.push(hcal    ) ;
  
  detector.assess_critical_layers() ;
  
  heartbeat() ;
}

function Get(id){ return document.getElementById(id) ; }

var JPsi      = Jpsi_object(   [0,0,0]) ;
var pi0       =  pi0_object(   [0,0,0]) ;
var rho0      = rho0_object(   [0,0,0]) ;
var D0        =   D0_object(1, [0,0,0]) ;
var D         =    D_object(1, [0,0,0]) ;
var gammaStar = virtual_photon_object([0,0,0], 3800) ;

function recursively_add_particles(particle, all_particles){
  all_particles.push(particle) ;
  for(var i=0 ; i<particle.daughters.length ; i++){
    recursively_add_particles(particle.daughters[i], all_particles) ;
  }
  return all_particles ;
}


function heartbeat(){
  counter++ ;
  if(counter>stop && stop>0) return ;
  if(!pause){
    Get('pre_info').innerHTML = '' ;
    //var particles = JPsi.decay_top_level(cauchy(JPsi.m, JPsi.m, JPsi.w)) ;
    //var particles = pi0.decay_top_level(pi0.m) ;
    //var particles = D0.deca_top_levely(D0.m) ;
    //var particles = D.decay_top_level(D.m) ;
    //var particles = rho0.decay_top_level(cauchy(rho0.m, rho0.m, rho0.w)) ;
    var mother_particles = gammaStar.decay_top_level(3800) ;
    var particles = recursively_add_particles(gammaStar, []) ;
    var pdgIds = [] ;
    for(var i=0 ; i<particles.length ; i++){ pdgIds.push(particles[i].pdgId) ; }
    
    for(var i=0 ; i<particles.length ; i++){
      detector.process_particle(particles[i]) ;
    }
  
    var kaons   = [] ;
    var pions   = [] ;
    var photons = [] ;
    for(var i=0 ; i<particles.length ; i++){
      if(Math.abs(particles[i].pdgId)==321)   kaons.push(particles[i]) ;
      if(Math.abs(particles[i].pdgId)==211)   pions.push(particles[i]) ;
      if(Math.abs(particles[i].pdgId)==22 ) photons.push(particles[i]) ;
    }
    
    /*
    for(var i=0 ; i<photons.length ; i++){
      //if(photons[i].p4_0.pT()<50) continue ;
      for(var j=i+1 ; j<photons.length ; j++){
        //if(photons[j].p4_0.pT()<50) continue ;
        var r1 = Math.log(Math.random()) ;
        if(Math.random()<0.5) r1 = -r1 ;
        var r2 = Math.log(Math.random()) ;
        if(Math.random()<0.5) r2 = -r2 ;
        var s = 0.1 ;
        photons[i].p4_0.x *= (1+s*r1) ;
        photons[i].p4_0.y *= (1+s*r1) ;
        photons[i].p4_0.z *= (1+s*r1) ;
        photons[j].p4_0.x *= (1+s*r2) ;
        photons[j].p4_0.y *= (1+s*r2) ;
        photons[j].p4_0.z *= (1+s*r2) ;
        var pi0_p4 = photons[i].p4_0.add(photons[j].p4_0) ;
        histogram.fill(pi0_p4.m()) ;
      }
    }
    */
  
  
    for(var i=0 ; i<kaons.length ; i++){
      if(kaons[i].p4_0.pT()<50) continue ;
      for(var j=0 ; j<pions.length ; j++){
        if(pions[j].p4_0.pT()<50) continue ;
        if(kaons[i].q==pions[j].q) continue ;
        var r1 = Math.log(Math.random()) ;
        if(Math.random()<0.5) r1 = -r1 ;
        var r2 = Math.log(Math.random()) ;
        if(Math.random()<0.5) r2 = -r2 ;
        var s = 0.1 ;
        kaons[i].p4_0.x *= (1+s*r1) ;
        kaons[i].p4_0.y *= (1+s*r1) ;
        kaons[i].p4_0.z *= (1+s*r1) ;
        pions[j].p4_0.x *= (1+s*r2) ;
        pions[j].p4_0.y *= (1+s*r2) ;
        pions[j].p4_0.z *= (1+s*r2) ;
        var kstar_p4 = kaons[i].p4_0.add(pions[j].p4_0) ;
        histogram.fill(kstar_p4.m()) ;
      }
    }
    
    /*
    for(var i=0 ; i<pions.length ; i++){
      if(pions[i].p4_0.pT()<50) continue ;
      for(var j=0 ; j<pions.length ; j++){
        if(pions[j].p4_0.pT()<50) continue ;
        if(pions[i].q==pions[j].q) continue ;
        var r1 = Math.log(Math.random()) ;
        if(Math.random()<0.5) r1 = -r1 ;
        var r2 = Math.log(Math.random()) ;
        if(Math.random()<0.5) r2 = -r2 ;
        var s = 0.1 ;
        pions[i].p4_0.x *= (1+s*r1) ;
        pions[i].p4_0.y *= (1+s*r1) ;
        pions[i].p4_0.z *= (1+s*r1) ;
        pions[j].p4_0.x *= (1+s*r2) ;
        pions[j].p4_0.y *= (1+s*r2) ;
        pions[j].p4_0.z *= (1+s*r2) ;
        var kstar_p4 = pions[i].p4_0.add(pions[j].p4_0) ;
        histogram.fill(kstar_p4.m()) ;
      }
    }
    */
    Get('span_nEvents').innerHTML = counter ;
    draw_all(particles) ;
    
    var string = '\n\n' ;
    for(var i=0 ; i<particles.length ; i++){
      string += '\n' + particles[i].pdgId ;
    }
    Get('pre_info').innerHTML += string ;
  
  }
  window.setTimeout(heartbeat, delay) ;
}

function update_coords(){
  x0 = parseFloat(Get('input_x').value) ;
  y0 = parseFloat(Get('input_y').value) ;
  z0 = parseFloat(Get('input_z').value) ;
  t0 = parseFloat(Get('input_t').value)*Math.PI/180 ;
  p0 = parseFloat(Get('input_p').value)*Math.PI/180 ;
  r0.x = x0 ; r0.y = y0 ; r0.z = z0 ;
  image_canvas_detector['cutaway'     ] = undefined ;
}
