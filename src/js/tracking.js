function get_pt_from_hits(hits, q, B, pT){
  // Attempt to reconstruct circles from [x,y] values of hit points
  // Then return the mean and sigma
  var xs = [] ;
  var ys = [] ;
  var spatial_resolution = 5.0e-11 ; // Resolution of about 0.5% in terms of pT
  for(var i=0 ; i<hits.length ; i++){
    var x = hits[i][0][0] ;
    var y = hits[i][0][1] ;
    xs.push(x+random_gaussian(spatial_resolution)) ;
    ys.push(y+random_gaussian(spatial_resolution)) ;
  }
  if(xs.length<4) return -1 ;
  var pts = [] ;
  var e = 1.6e-19 ;
  var c = 3e8 ;
  for(var i=0 ; i<xs.length-2 ; i++){
    break ;
    for(var j=i+1 ; j<xs.length-1 ; j++){
      for(var k=j+1 ; k<xs.length ; k++){
        var params = circle_from_points(xs[i], ys[i], xs[j], ys[j], xs[k], ys[k]) ;
        if(params==null) continue ;
        var pt_mks = params[2]*q*e*B ;
        var pt_MeV = pt_mks*1e4/e ;
        pts.push(pt_MeV) ;
      }
    }
  }
  
  for(var i=0 ; i<xs.length-2 ; i++){
    var params = circle_from_points(xs[i+0], ys[i+0], xs[i+1], ys[i+1], xs[i+2], ys[i+2]) ;
    if(params==null) continue ;
    var pt_mks = params[2]*q*e*B ;
    var pt_MeV = pt_mks*1e4/e ;
    pts.push(pt_MeV) ;
  }
  if(pts.length<1) return -1 ;
  var pt_mean  = 0 ;
  var pt_sigma = 0 ;
  var sx2 = 0 ;
  for(var i=0 ; i<pts.length ; i++){
    pt_mean += pts[i] ;
    sx2     += pts[i]*pts[i] ;
  }
  pt_mean  = abs(pt_mean)/pts.length ;
  pt_sigma = sqrt(sx2/pts.length-pt_mean*pt_mean) ;
  return [pt_mean,pt_sigma] ;
}

function circle_from_points(x1, y1, x2, y2, x3, y3){
  var theta = 0 ;
  
  // First check for coincident points
  var tolerance = 1e-6 ;
  var coincident_points = false ;
  if( (x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) < tolerance*tolerance) coincident_points = true ;
  if( (x1-x3)*(x1-x3) + (y1-y3)*(y1-y3) < tolerance*tolerance) coincident_points = true ;
  if( (x2-x3)*(x2-x3) + (y2-y3)*(y2-y3) < tolerance*tolerance) coincident_points = true ;
  if(coincident_points){
    return null ;
  }
  
  // Second check for infinite gradients (change in y with no change in x)
  var infinite_gradients = true ;
  while(infinite_gradients){
    infinite_gradients = false ;
    if( (x1-x2)*(x1-x2) < tolerance*tolerance) infinite_gradients = true ;
    if( (x2-x3)*(x2-x3) < tolerance*tolerance) infinite_gradients = true ;
    if(infinite_gradients){
      theta = Math.PI*Math.random() ;
      var x1_out = x1*Math.cos(theta) + y1*Math.sin(theta) ;
      var y1_out = y1*Math.cos(theta) - x1*Math.sin(theta) ;
      var x2_out = x2*Math.cos(theta) + y2*Math.sin(theta) ;
      var y2_out = y2*Math.cos(theta) - x2*Math.sin(theta) ;
      var x3_out = x3*Math.cos(theta) + y3*Math.sin(theta) ;
      var y3_out = y3*Math.cos(theta) - x3*Math.sin(theta) ;
      
      x1 = x1_out ; y1 = y1_out ;
      x2 = x2_out ; y2 = y2_out ;
      x3 = x3_out ; y3 = y3_out ;
    }
  }
  
  // Finally check for colinearity
  var m12 = (x2-x1)/(y2-y1) ;
  var m23 = (x3-x2)/(y3-y2) ;
  
  if( (m12-m23)*(m12-m23) < tolerance*tolerance){
    return null ;
  }
  
  function y12_from_x12(x_12){ return (y1+y2)/2 - m12*(x_12 - (x1+x2)/2) ; }
  function y23_from_x23(x_23){ return (y2+y3)/2 - m23*(x_23 - (x2+x3)/2) ; }
  
  var cx  = ( y1-y3 + (x1+x2)*m12 - (x2+x3)*m23 )/(2*(m12-m23)) ;
  var cy  = (y1+y2)/2 - m12*(cx-(x1+x2)/2) ;
  
  // Rotate everything back in case we had to rotate earlier
  var x1_out = x1*Math.cos(-theta) + y1*Math.sin(-theta) ;
  var y1_out = y1*Math.cos(-theta) - x1*Math.sin(-theta) ;
  var x2_out = x2*Math.cos(-theta) + y2*Math.sin(-theta) ;
  var y2_out = y2*Math.cos(-theta) - x2*Math.sin(-theta) ;
  var x3_out = x3*Math.cos(-theta) + y3*Math.sin(-theta) ;
  var y3_out = y3*Math.cos(-theta) - x3*Math.sin(-theta) ;
  var cx_out = cx*Math.cos(-theta) + cy*Math.sin(-theta) ;
  var cy_out = cy*Math.cos(-theta) - cx*Math.sin(-theta) ;
  
  x1 = x1_out ; y1 = y1_out ;
  x2 = x2_out ; y2 = y2_out ;
  x3 = x3_out ; y3 = y3_out ;
  cx = cx_out ; cy = cy_out ;
  
  var rho = Math.sqrt( (cx-x1)*(cx-x1) + (cy-y1)*(cy-y1) ) ;
  return [cx,cy,rho,m12,m23,theta] ;
}