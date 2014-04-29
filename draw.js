function draw_polygons(settings, particles, canvas, image_name){
  var r0 = settings.r0 ;
  var t0 = settings.t0 ;
  var p0 = settings.p0 ;
  var mode = settings.mode ;
  var phi_cut = settings.phi_cut ;
  var scale = settings.scale ;

  var context = canvas.getContext('2d') ;
  var cw = canvas.width  ;
  var ch = canvas.height ;
  context.fillStyle = 'rgb(255,255,255)' ;
  context.fillRect(0,0,cw,ch) ;
  
  var particle_polygons = []  ;
  for(var i=0 ; i<particles.length ; i++){
    for(var j=0 ; j<particles[i].path.length-1 ; j++){
      var l = new polygon_object(particles[i].color) ;
      var p = particles[i].path ;
      l.add_point(p[j+0][0], p[j+0][1], p[j+0][2]) ;
      l.add_point(p[j+1][0], p[j+1][1], p[j+1][2]) ;
      l.line_opacity = 1.0 ;
      l.type = 'particle' ;
      particle_polygons.push(l) ;
    }
  }

  var polygons = [] ;
  var lines    = [] ;
  
  if(image_canvas_detector[image_name]){
    context.drawImage(image_canvas_detector[image_name],0,0) ;
  }
  else{
    for(var i=0 ; i<detector.components.length ; i++){
      var com = detector.components[i] ;
      for(var j=0 ; j<com.cells.length ; j++){
        polygons = polygons.concat(com.cells[j].polygons) ;
        lines    =    lines.concat(com.cells[j].lines   ) ;
      }
    }
  }
  
  var shapes = [ polygons , lines , particle_polygons ] ;
  for(var i=0 ; i<shapes.length ; i++){
    for(var j=0 ; j<shapes[i].length ; j++){
      var pol = shapes[i][j] ;
      for(var k=0 ; k<pol.points.length ; k++){
        pol.points[k] = pol.raw_points[k].add(r0,-1) ;
        pol.points[k] = rotate_theta_phi(pol.points[k], t0, p0) ;
      }
    }
    shapes[i].sort( function(a, b){ return get_centroid(b.raw_points)[0] - get_centroid(a.raw_points)[0] ; } ) ;
  }
  
  var cw = context.canvas.width  ;
  var ch = context.canvas.height ;
  
  for(var i=0 ; i<shapes.length ; i++){
    if(i==2){ context.lineWidth = 3 ; }
    else{ context.lineWidth = 1 ; }
    for(var j=0 ; j<shapes[i].length ; j++){
      var pol = shapes[i][j] ;
      var phi = 180*Math.atan2(get_centroid(pol.raw_points)[1], get_centroid(pol.raw_points)[0])/Math.PI ;
      if(Math.abs(phi)>phi_cut && pol.type!='particle') continue ;
      
      context.beginPath() ;
      var opacity = (pol.hot==true) ? 1.0 : 0.5 ;
      context.fillStyle   = 'rgba('+pol.rgb+','+opacity+')' ;
      context.strokeStyle = 'rgba('+pol.rgb+','+pol.line_opacity+')' ;
      if(pol.line_color) context.strokeStyle = pol.line_color ;
    
      var pz0 = (pol.points[0].z==0) ? 1e-6 : Math.abs(pol.points[0].z) ;
      if(mode=='flat') pz0 = scale ;
      var a0 = 0.5*cw*(1+pol.points[0].x/pz0) ;
      var b0 = 0.5*ch*(1-pol.points[0].y/pz0) ;
      context.moveTo(a0,b0) ;
      for(var k=0 ; k<pol.points.length ; k++){
        var pz = (pol.points[k].z==0) ? 1e-6 : Math.abs(pol.points[k].z) ;
        if(mode=='flat') pz = scale ;
        var a = 0.5*cw*(1+pol.points[k].x/pz) ;
        var b = 0.5*ch*(1-pol.points[k].y/pz) ;
        context.lineTo(a,b) ;
      }
      if(i==0){
        if(pol.close) context.closePath(a,b) ;
        context.fill() ;
      }
      else{
        context.stroke() ;
      }
    }
    if(i==1){
      image_canvas_detector[image_name] = new Image() ;
      image_canvas_detector[image_name].src = canvas.toDataURL("image/png") ;
    }
  }
}

function draw_settings_object(r0, t0, p0, mode, phi_cut, scale){
  this.r0 = r0 ;
  this.t0 = t0 ;
  this.p0 = p0 ;
  this.mode = mode ;
  this.phi_cut = phi_cut ;
  this.scale = scale ;
}
var draw_settings = [] ;
draw_settings['cutaway'     ] = new draw_settings_object(                r0,          t0, p0, 'normal', 121, 1) ;
draw_settings['transverse'  ] = new draw_settings_object(make_point(0,0,-5),           0,  0,   'flat', 400, 3) ;
draw_settings['longitudinal'] = new draw_settings_object(make_point(-5,0,0), 0.5*Math.PI,  0,   'flat',  91, 4) ;

function draw_all(particles){
  draw_detector(particles) ;
  histogram.draw(ps, 'e') ;
}

function draw_detector(particles){
  var names = ['cutaway' , 'transverse' , 'longitudinal'] ;
  for(var i=0 ; i<names.length ; i++){
    var canvas  = Get('canvas_detector_'+names[i]) ;
    draw_polygons(draw_settings[names[i]], particles, canvas, names[i]) ;
  }
}

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
  return make_point(cx,cy,cz) ;
}
