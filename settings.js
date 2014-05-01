var pause = true ;

var counter = 0 ;
var stop =  -1 ;
var delay =  2 ;
var draw_interval = 25 ;

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

var B_field = 0.05 ;
var B_r     = 0.6 ;
var B_r2    = B_r*B_r ;