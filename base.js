var n_JPsi = 10000 ;
var ll_pair = null ;

var counter = 0 ;
var stop = n_JPsi ;
var delay = 200 ;

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

var JPsi   = new Jpsi_object() ;
var ZBoson = new ZBoson_object() ;

var B_field = 1e3 ;
var B_r     = 1.4 ;
var B_r2    = B_r*B_r ;

var detector = new detector_object() ;

function start(){
  Get('submit_coords').addEventListener('click', update_coords) ;
  Get('input_x').value = x0 ;
  Get('input_y').value = y0 ;
  Get('input_z').value = z0 ;
  Get('input_t').value = t0*180/Math.PI ;
  Get('input_p').value = p0*180/Math.PI ;

  var beampipe = new    beampipe_object('beampipe', 20, 1.0, '0,0,0') ;
  var tracker  = new     tracker_object('tracker' , 0.25, 1.3,  6.0, 4, 12,                 '100,  0,  0', '255,   0,   0') ;
  var ecal     = new calorimeter_object('ecal'    , 1.5 , 2.0,  7.0, 3, 12,  8, 0.01, 0.05, '100,100,255', '  0,   0, 100') ;
  var hcal     = new calorimeter_object('hcal'    , 2.2 , 3.5,  8.0, 4, 12,  8, 0.01, 0.05, ' 50,255, 50', '  0, 100,   0') ;
  
  ecal.stopping_powers['electron'] = 0.8  ;
  hcal.stopping_powers['electron'] = 0.99 ;
  
  ecal.stopping_powers['muon'    ] = 0.99 ;
  hcal.stopping_powers['muon'    ] = 0.99 ;
  
  detector.components.push(beampipe) ;
  detector.components.push(tracker ) ;
  detector.components.push(ecal    ) ;
  detector.components.push(hcal    ) ;
  
  detector.assess_critical_layers() ;
  
  var matches = detector.find_subcomponent(2.5, 2.0, 0.5) ;
  var result = matches[0][1] ;
  for(var i=0 ; i<result.polygons.length ; i++){
    //result.polygons[i].hot = true ;
  }
  
  JPsi  .make_random_masses(n_JPsi, 3080,  3120) ;
  ZBoson.make_random_masses(n_JPsi, 80e3, 100e3) ;  
  heartbeat() ;
}

function Get(id){ return document.getElementById(id) ; }

function heartbeat(){
  counter++ ;
  if(counter>stop) return ;
  
  ll_pair = JPsi.make_ll_pair( JPsi.masses[0] ) ;
  detector.process_particle(ll_pair[0]) ;
  detector.process_particle(ll_pair[1]) ;
  
  //draw_all(context, 'flat') ;
  draw_all(ll_pair) ;
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
