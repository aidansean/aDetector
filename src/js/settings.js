var pause     = true ;
var one_event = false ;

var counter =  0 ;
var stop    = -1 ;
var delay   =  5 ;

var n_success = 0 ;
var n_failure = 0 ;

var  draw_interval          = 1000 ;
var table_interval          =    1 ;
var plotspace_draw_interval =   10 ;
var n_trigger_attempts      =   10 ;

var stopwatch_delay = 1000 ;
var stopwatch_time  =    0 ;

// This makes me feel dirty
var pi = Math.PI ;

var x0 = -4.0  ;
var y0 =  1.0  ;
var z0 =  5.0 ;
var t0 =  0.25*pi ;
var p0 = -0.05*pi ;
var r0 = new threeVector() ;
r0.x = x0 ; r0.y = y0 ; r0.z = z0 ;

var n_traj_points_through_detector = 100 ;

var image_canvas_detector = [] ;
image_canvas_detector['cutaway'     ] = undefined ;
image_canvas_detector['transverse'  ] = undefined ;
image_canvas_detector['longitudinal'] = undefined ;

var B_field = 0.05 ;
var B_r     = 0.6 ;
var B_r2    = B_r*B_r ;

var draw_hots = false ;
var cache_detector_views = true ;

var event_index = -1 ;
var record_events = false ;

var particle_collection_select_index = 1 ;
var plot_space_index = 1 ;
