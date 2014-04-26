var n_JPsi = 10000 ;
var ll_pair = null ;

var counter = 0 ;
var stop = n_JPsi ;
var delay = 1000 ;

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

var B_field = 0.1 ;
var B_r     = 1.05 ;
var B_r2    = B_r*B_r ;

var detector = new detector_object() ;

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
  Get('th_particle_color_generic' ).style.backgroundColor = 'rgb(' + generic_color  + ')' ;

  var beampipe = new    beampipe_object('beampipe', 20, 1.0, '0,0,0') ;
  var tracker  = new     tracker_object('tracker' , 0.05, 0.5,  6.0, 4, 12,                 '150, 50, 50', '255,   0,   0') ;
  var ecal     = new calorimeter_object('ecal'    , 0.7 , 1.7,  7.0, 3, 12, 12, 0.01, 0.05, '100,100,255', '  0,   0, 100') ;
  var hcal     = new calorimeter_object('hcal'    , 1.8 , 2.8,  8.0, 4, 12,  8, 0.01, 0.05, ' 50,200, 50', '  0, 100,   0') ;
  
  ecal.stopping_powers['electron'] = 0.8  ;
  hcal.stopping_powers['electron'] = 0.99 ;
  ecal.stopping_powers['photon'  ] = 0.8  ;
  hcal.stopping_powers['photon'  ] = 0.99 ;
  
  ecal.stopping_powers['muon'    ] = 0.99 ;
  hcal.stopping_powers['muon'    ] = 0.99 ;
  
  ecal.stopping_powers['ephemeral_hadron'] = 1.0  ;
  ecal.stopping_powers['charged_hadron'  ] = 0.999 ;
  ecal.stopping_powers['neutral_hadron'  ] = 0.999 ;
  
  hcal.stopping_powers['ephemeral_hadron'] = 1.0 ;
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

var JPsi = Jpsi_object(   [0,0,0]) ;
var pi0  =  pi0_object(   [0,0,0]) ;
var rho0 = rho0_object(   [0,0,0]) ;
var D0   =   D0_object(1, [0,0,0]) ;
var D    =    D_object(1, [0,0,0]) ;

function heartbeat(){
  counter++ ;
  if(counter>stop) return ;
  //var particles = JPsi.decay_top_level( cauchy(JPsi.m, JPsi.m, JPsi.w) ) ;
  //var particles = pi0.decay_top_level( pi0.m ) ;
  //var particles = D0.deca_top_levely( D0.m ) ;
  var particles = D.decay_top_level( D.m ) ;
  //var particles = rho0.decay( cauchy(rho0.m, rho0.m, rho0.w) ) ;
  for(var i=0 ; i<particles.length ; i++){
    detector.process_particle(particles[i]) ;
  }
  
  //draw_all(context, 'flat') ;
  draw_all(particles) ;
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
