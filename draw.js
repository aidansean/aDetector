function draw_polygons(r0, t0, p0, particles, canvas, mode, image_name, phi_cut, scale){
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
  
  var centroid_z_min =  1e6 ;
  var centroid_z_max = -1e6 ;
  var shapes = [ polygons , lines , particle_polygons ] ;
  for(var i=0 ; i<shapes.length ; i++){
    for(var j=0 ; j<shapes[i].length ; j++){
      var pol = shapes[i][j] ;
      for(var k=0 ; k<pol.points.length ; k++){
        pol.points[k] = pol.raw_points[k].add(r0,-1) ;
        pol.points[k] = rotate_theta_phi(pol.points[k], t0, p0) ;
      }
      var centroid = get_centroid(pol.points) ;
      if(centroid.z<centroid_z_min) centroid_z_min = centroid[2] ;
      if(centroid.z>centroid_z_max) centroid_z_max = centroid[2] ;
    }
    shapes[i].sort( function(a, b){ return get_centroid(a.raw_points)[0] < get_centroid(b.raw_points)[0] ; }) ;
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
      
      //var centroid = get_centroid(pol.points) ;
      //var opacity = (centroid[2]<0) ? 0 : -0.25*Math.log(centroid[2]/(1.0*centroid_z_max),2) ;
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

function draw_all(particles, mode){
  var r0s = [] ;
  r0s['cutaway'     ] = r0 ;
  r0s['transverse'  ] = make_point(0,0,-5) ;
  r0s['longitudinal'] = make_point(-5,0,0) ;
  
  var t0s = [] ;
  t0s['cutaway'     ] = t0 ;
  t0s['transverse'  ] =  0 ;
  t0s['longitudinal'] = 0.5*Math.PI ;
  
  var p0s = [] ;
  p0s['cutaway'     ] = p0 ;
  p0s['transverse'  ] =  0 ;
  p0s['longitudinal'] =  0 ;
  
  var modes = [] ;
  modes['cutaway'     ] = 'normal' ;
  modes['transverse'  ] = 'flat' ;
  modes['longitudinal'] = 'flat' ;
  
  var phi_cuts = [] ;
  phi_cuts['cutaway'     ] = 121 ;
  phi_cuts['transverse'  ] = 400 ;
  phi_cuts['longitudinal'] =  91 ;
  
  var scales = [] ;
  scales['cutaway'     ] = 1 ;
  scales['transverse'  ] = 3 ;
  scales['longitudinal'] = 4 ;

  var names = ['cutaway' , 'transverse' , 'longitudinal'] ;
  for(var i=0 ; i<names.length ; i++){
    var n = names[i] ;
    var canvas  = Get('canvas_detector_'+n) ;
    draw_polygons(r0s[n], t0s[n], p0s[n], particles, canvas, modes[n], n, phi_cuts[n], scales[n]) ;
  }
  histogram.draw(ps, '') ;
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
