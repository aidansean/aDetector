function draw_polygons(settings, trajs, canvas, image_name){
  if(Get('div_detector_container').style.display=='none') return ; // Save some CPU time

  // Unpack settings from the settings wrapper
  var r0 = settings.r0 ;
  var t0 = settings.t0 ;
  var p0 = settings.p0 ;
  var mode = settings.mode ;
  var phi_cut = settings.phi_cut ;
  var scale = settings.scale ;
  var sort_index = settings.sort_index ;
  
  // Get the context.  Maybe pass the context to the function?
  var context = canvas.getContext('2d') ;
  var cw = canvas.width  ;
  var ch = canvas.height ;
  
  // Clear the canvas
  context.fillStyle = 'rgb(255,255,255)' ;
  context.fillStyle = 'rgb(0,0,0)' ;
  context.fillRect(0,0,cw,ch) ;
  
  // Make polygons from the particles
  // This has to be done for each event, which is CPU intensive
  // Sigh
  var particle_polygons = []  ;
  for(var i=0 ; i<trajs.length ; i++){
    for(var j=0 ; j<trajs[i].xyz.length-1 ; j++){
      var l = new polygon_object(trajs[i].color) ;
      var p = trajs[i].xyz ; ;
      l.add_point(p[j+0][0], p[j+0][1], p[j+0][2]) ;
      l.add_point(p[j+1][0], p[j+1][1], p[j+1][2]) ;
      l.line_opacity = 1.0 ;
      l.type = 'particle' ;
      particle_polygons.push(l) ;
    }
  }

  // Declare the list of lines and polygons, then stuff them into a list of shapes
  var polygons = [] ;
  var lines    = [] ;
  var shapes   = [] ;
  // If we've already rendered this view of the detector, just recycle the bitmap image to save time
  if(image_canvas_detector[image_name]){
    context.drawImage(image_canvas_detector[image_name],0,0) ;
    shapes = [ particle_polygons ] ;
  }
  else{
    // These concats are expensive!  Maybe rework this
    for(var i=0 ; i<detector.components.length ; i++){
      var com = detector.components[i] ;
      for(var j=0 ; j<com.cells.length ; j++){
        polygons = polygons.concat(com.cells[j].polygons) ;
        lines    =    lines.concat(com.cells[j].lines   ) ;
      }
    }
    shapes = [ polygons , lines , particle_polygons ] ;
  }
  
  // Now transform all the points to suit the view of the user
  for(var i=0 ; i<shapes.length ; i++){
    for(var j=0 ; j<shapes[i].length ; j++){
      var pol = shapes[i][j] ;
      for(var k=0 ; k<pol.points.length ; k++){
        pol.points[k] = pol.raw_points[k].add(r0,-1) ;
        pol.points[k] = rotate_theta_phi(pol.points[k], t0, p0) ;
      }
    }
    // Sort by x,y,z coordinates
    // Sort by z to sort by depth
    shapes[i].sort( function(a, b){ return get_centroid(b.raw_points)[sort_index] - get_centroid(a.raw_points)[sort_index] ; } ) ;
  }
  
  // We've sorted the shapes, so time to draw them
  for(var i=0 ; i<shapes.length ; i++){
    if(i==2){ context.lineWidth = 3 ; }
    else{ context.lineWidth = 1 ; }
    for(var j=0 ; j<shapes[i].length ; j++){
      // Get the polygon
      var pol = shapes[i][j] ;
      
      //  For the cutaway view, don't draw shapes in a given range of phi
      // This will probably need to be changed as the user rotates/translates the view
      var phi = 180*atan2(get_centroid(pol.raw_points)[1], get_centroid(pol.raw_points)[0])/pi ;
      if(abs(phi)>phi_cut && pol.type!='particle') continue ;
      
      context.beginPath() ;
      
      // Set the opacity and drawing styles
      // This needs fixing later
      var opacity         = (pol.hot==true && draw_hots) ? 1.0 : 0.25 ;
      context.fillStyle   = (pol.hot==true && draw_hots) ? 'rgba('+'255,0,0'+','+opacity+')' : 'rgba('+pol.rgb+','+opacity+')' ;
      context.strokeStyle = 'rgba('+pol.rgb+','+pol.line_opacity+')' ;
      if(pol.line_color) context.strokeStyle = pol.line_color ;
      
      // Need to move to the first point, so treat it differently to the rest
      // Vanishing point exists in the distance at the center of the canvas
      // Need to change this to allow a different vanishing point in the future
      var pz0 = (pol.points[0].z==0) ? 1e-6 : abs(pol.points[0].z) ;
      if(mode=='flat') pz0 = scale ;
      
      // (a,b) are the coordinates on the canvas
      // z is used to scale (x,y) appropriately
      var a0 = 0.5*cw*(1+pol.points[0].x/pz0) ;
      var b0 = 0.5*ch*(1-pol.points[0].y/pz0) ;
      context.moveTo(a0,b0) ;
      for(var k=0 ; k<pol.points.length ; k++){
        var pz = (pol.points[k].z==0) ? 1e-6 : abs(pol.points[k].z) ;
        if(mode=='flat') pz = scale ;
        var a = 0.5*cw*(1+pol.points[k].x/pz) ;
        var b = 0.5*ch*(1-pol.points[k].y/pz) ;
        context.lineTo(a,b) ;
      }
      if(shapes.length==1){
        // Lines from the detector components
        context.lineWidth = 3 ;
        context.stroke() ;
      }
      else if(i==0){
        // Polygons from the detector components
        if(pol.close) context.closePath(a,b) ;
        context.fill() ;
      }
      else{
        // Lines from the particles
        context.stroke() ;
      }
    }
    if(i==1 && cache_detector_views){
      image_canvas_detector[image_name] = new Image() ;
      image_canvas_detector[image_name].src = canvas.toDataURL("image/png") ;
    }
  }
}

// Simple object to keep track of drawing settings
function draw_settings_object(r0, t0, p0, mode, phi_cut, scale, sort_index){
  this.r0 = r0 ;
  this.t0 = t0 ;
  this.p0 = p0 ;
  this.mode    = mode ;
  this.phi_cut = phi_cut ;
  this.scale   = scale ;
  this.sort_index = sort_index ;
}
var draw_settings = [] ;
draw_settings['cutaway'     ] = new draw_settings_object(                 r0,     t0, p0, 'normal', 119, 1, 0) ;
draw_settings['transverse'  ] = new draw_settings_object(make_point( 0,0, 5),    -pi,  0,   'flat', 400, 3, 2) ;
draw_settings['longitudinal'] = new draw_settings_object(make_point(-5,0,0),  0.5*pi,  0,   'flat', 401, 5, 0) ;

function draw_all(particles){
  draw_detector(particles) ;
  histogram.draw(ps, 'e') ;
}

// Draw all three views of the detector
function draw_detector(paths){
  var names = ['cutaway' , 'transverse' , 'longitudinal'] ;
  for(var i=0 ; i<names.length ; i++){
    var canvas  = Get('canvas_detector_'+names[i]) ;
    draw_polygons(draw_settings[names[i]], paths, canvas, names[i]) ;
    var context = canvas.getContext('2d') ;
    
    // Draw meta info about the event
    context.font = '12px arial , sans-serif' ;
    context.fillStyle = 'rgb(255,255,255)' ; context.fillText('Event #' + (event_index+1), 4, 12) ;
    
    if(names[i]=='cutaway'){
      var y = 36 ;
      var dy = 12 ;
      context.fillStyle = 'rgb('+electron_color+')' ; context.fillText('Electron', 4, y ) ; y+= dy ;
      context.fillStyle = 'rgb('+muon_color    +')' ; context.fillText('Muon'    , 4, y ) ; y+= dy ;
      context.fillStyle = 'rgb('+tau_color     +')' ; context.fillText('Tau'     , 4, y ) ; y+= dy ;
      context.fillStyle = 'rgb('+pion_color    +')' ; context.fillText('Pion'    , 4, y ) ; y+= dy ;
      context.fillStyle = 'rgb('+kaon_color    +')' ; context.fillText('Kaon'    , 4, y ) ; y+= dy ;
      context.fillStyle = 'rgb('+proton_color  +')' ; context.fillText('Proton'  , 4, y ) ; y+= dy ;
      context.fillStyle = 'rgb('+photon_color  +')' ; context.fillText('Photon'  , 4, y ) ; y+= dy ;
    }
  }
}

// Very simple object to keep track of a polygon's properties
function polygon_object(rgb){
  this.rgb = rgb ;
  this.points = [] ;
  this.raw_points = [] ;
  this.close = true ;
  this.line_opacity = 0.1 ;
  this.hot = false ;
  this.add_point = function(x, y, z){
    var v = make_point(x,y,z) ;
    this.points.push(v) ;
    this.raw_points.push(v) ;
  }
}

// Used when sorting polygons from nearest to furthest
function get_centroid(points){
  var cx = 0 ;
  var cy = 0 ;
  var cz = 0 ;
  var n = points.length ;
  for(var i=0 ; i<n ; i++){
    cx += points[i].x ;
    cy += points[i].y ;
    cz += points[i].z ;
  }
  cx /= n ;
  cy /= n ;
  cz /= n ;
  return [cx,cy,cz] ;
}
