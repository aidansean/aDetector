function tracker_layer(points, rgb_plane, rgb_line){
  this.rgb_plane = rgb_plane ;
  this.rgb_line  = rgb_line  ;
  this.cell = new component_cell(this.rgb_plane, this.rgb_line) ;
  this.cell.points = points ;
  this.cell.polygon_indices = [ [0,1,2,3] ] ;
  this.cell.line_indices = [ [0,1] , [1,2] , [2,3] , [3,0] ] ;
  this.cell.make_shapes() ;
}

function tracker_object(name, ri, ro, zl, nl, n_seg, rgb_plane, rgb_line){
  this.name = name ;
  this.rgb_plane = rgb_plane ;
  this.rgb_line  = rgb_line  ;
  this.n_layers = nl ;
  this.n_segments = n_seg ;
  this.inner_radius = ri ;
  this.outer_radius = ro ;
  this.z_length = zl ;
  this.spatial_resolution = 0.1 ;
  this.p_react = 0.8 ;
  this.ri2 = Math.pow(this.inner_radius,2) ;
  this.ro2 = Math.pow(this.outer_radius,2) ;
  this.cells = [] ;
  this.layers = [] ;
  this.layer_radii = [] ;
  
  this.stopping_powers = [] ;
  this.stopping_powers['electron'] = 0.995 ;
  this.stopping_powers['muon'    ] = 0.995 ;
  
  // Make polygons
  this.polygons = [] ;
  var z1 = -0.5*this.z_length ;
  var z2 =  0.5*this.z_length ;
  for(var i=0 ; i<this.n_layers ; i++){
    var rho = this.inner_radius + (this.outer_radius-this.inner_radius)*i/(this.n_layers-1) ;
    this.layer_radii.push(rho) ;
    for(var j=0 ; j<this.n_segments ; j++){
      var x1 = rho*Math.cos(2*Math.PI*(j-0.5)/this.n_segments) ;
      var y1 = rho*Math.sin(2*Math.PI*(j-0.5)/this.n_segments) ;
      var y2 = rho*Math.sin(2*Math.PI*(j+0.5)/this.n_segments) ;
      var x2 = rho*Math.cos(2*Math.PI*(j+0.5)/this.n_segments) ;
      
      var points = [] ;
      points.push([x1,y1,z1]) ;
      points.push([x2,y2,z1]) ;
      points.push([x2,y2,z2]) ;
      points.push([x1,y1,z2]) ;
      var layer = new tracker_layer(points, this.rgb_plane, this.rgb_line) ;
      this.layers.push(layer) ;
      this.cells.push(layer.cell) ;
    }
  }
  
  this.interact_with_track = function(particle){
    var n_interactions = this.n_layers ;
    var n_hits = 0 ;
    for(var i=0 ; i<n_interactions ; i++){
      if(Math.random()<this.p_react) n_hits++ ;
    }
    var p4_out = new fourVector() ;
    if(n_hits>0){
      var p4 = particle.p4_0 ;
      var rho_uncertainty = this.spatial_resolution/Math.sqrt(n_hits) ;
      var pt_uncertainty = rho_uncertainty/(Math.pow(p4.pT(),2)) ;
      var pz_uncertainty = rho_uncertainty ;
      var pT_reco = p4.pT() + random_gaussian(pt_uncertainty) ;
      var pz_reco = p4.pz() + random_gaussian(pz_uncertainty) ;
      var px_reco = p4.px()*pT_reco/p4.pT() ;
      var py_reco = p4.py()*pT_reco/p4.pT() ;
      var E_reco  = Math.sqrt(Math.pow(particle.m,2) + Math.pow(px_reco,2) + Math.pow(py_reco,2) + Math.pow(pz_reco,2)) ;
      
      p4_out.x = px_reco ;
      p4_out.y = py_reco ;
      p4_out.z = pz_reco ;
      p4_out.t = E_reco  ;
    }
    particle.p4_reco = p4_out ;
  }
  this.draw = function(context, particles, r0, t0, p0, mode){
    // particles
    for(var i=0 ; i<particles.length ; i++){
      var p = particles[i] ;
      var pol = new polygon_object() ;
      var B = B_field ;
      var vx0 = p.p4_reco.px()/p.m ;
      var vy0 = p.p4_reco.py()/p.m ;
      var vx  = vx0 ;
      var vy  = vy0 ;
      var x   = p.r_0.x ;
      var y   = p.r_0.y ;
      var w   = B/p.m ;
      var dt = 1e-6 ;
      var ir2 = Math.pow(this.inner_radius,2) ;
      var or2 = Math.pow(this.outer_radius,2) ;
      for(var j=0 ; j<10000 ; j++){
        var dvx = -dt*vy*p.q*B ;
        var dvy =  dt*vx*p.q*B ;
        vx += dvx ;
        vy += dvy ;
        vx *= 0.9999 ;
        vy *= 0.9999 ;
        x  += dt*vx ;
        y  += dt*vy ;
        z = dt*j*p.p4_reco.pz()/p.m ;
        pol.add_point(x,y,z) ;
        var r2 = x*x + y*y ;
        if(r2>or2) break ;
      }
      pol.line_color = 'rgb(0,0,255)' ;
      pol.close = false ;
      polygons.push(pol) ;
    }
  }
}

function rotate_theta_phi(v, theta, phi){
  var v3_out = new threeVector() ;
  var ct = Math.cos(theta) ;
  var st = Math.sin(theta) ;
  var cp = Math.cos(phi) ;
  var sp = Math.sin(phi) ;
  v3_out.x =  ct*cp*v.x + ct*sp*v.y + st*v.z ;
  v3_out.y = -   sp*v.x +    cp*v.y          ;
  v3_out.z = -st*cp*v.x - st*sp*v.y + ct*v.z ;
  return v3_out ;
}

function random_gaussian(sigma){
  return Math.sqrt( -2*sigma*Math.log(Math.random() ) ) ;
}
