// These classes are for any detector components in a cylindrically symmetric detector.

beampipe_object = function(name, zl, line_opacity, rgb){
  this.name = name ;
  this.rgb = rgb ;
  this.z_length = zl ;
  this.polygons = [] ;
  this.cells = [] ;
  this.line_opacity = line_opacity ;
  this.ri2 = 0 ;
  this.ro2 = 0 ;
  this.outer_radius = 0 ;
  this.z_start = -0.5*this.z_length ;
  this.z_end   =  0.5*this.z_length ;
  
  this.stopping_powers = [] ;
  this.stopping_powers['electron'        ] = 0.0 ;
  this.stopping_powers['photon'          ] = 0.0 ;
  this.stopping_powers['muon'            ] = 0.0 ;
  this.stopping_powers['tau'             ] = 0.0 ;
  this.stopping_powers['neutrino'        ] = 0.0 ;
  this.stopping_powers['ephemeral_hadron'] = 0.0 ;
  this.stopping_powers['charged_hadron'  ] = 0.0 ;
  this.stopping_powers['neutral_hadron'  ] = 0.0 ;
  
  var cell = new component_cell(this.rgb, this.rgb) ;
  var points = [ [0,0,-0.5*this.z_length] , [0,0,0.5*this.z_length] ] ;
  cell.points = points ;
  cell.line_indices = [ [0,1] ] ;
  cell.line_opacity = this.line_opacity ;
  cell.make_shapes() ;
  this.cells.push(cell) ;
  this.get_block = function(xyz){
    return null ;
  }
}

function calorimeter_block(points, rgb_plane, rgb_line){
  // A trapezoidal shape, defining the block
  // The natural coordinates are r, phi, z
  this.rgb_plane = rgb_plane ;
  this.rgb_line  = rgb_line  ;
  this.cell = new component_cell(this.rgb_plane, this.rgb_line) ;
  this.cell.points = points ;
  this.cell.polygon_indices = [ [0,1,3,2] , [4,5,7,6] , [0,1,5,4] , [2,3,7,6] , [0,4,6,2] , [1,5,7,3] ] ;
  this.cell.line_indices = [ [0,1] , [1,3] , [3,2] , [2,0] , [4,5] , [5,7] , [7,6] , [6,4] , [0,4] , [1,5] , [3,7] , [6,2] ] ;
  this.cell.make_shapes() ;
}

function tracker_object(name, ri, ro, z_start, z_end, nl, nseg, nsec, padding_xy, padding_z, rgb_plane, rgb_line){
  var tracker = new calorimeter_object(name, 'tracker', ri, ro, z_start, z_end, nl, nseg, nsec, padding_xy, padding_z, rgb_plane, rgb_line) ;
  tracker.stopping_powers['electron'        ] = 0.000 ;
  tracker.stopping_powers['photon'          ] = 0.005 ;
  tracker.stopping_powers['muon'            ] = 0.001 ;
  tracker.stopping_powers['tau'             ] = 0.001 ;
  tracker.stopping_powers['ephemeral_hadron'] = 0.000 ;
  tracker.stopping_powers['neutrino'        ] = 0.000 ;
  tracker.stopping_powers['charged_hadron'  ] = 0.000 ;
  tracker.stopping_powers['neutral_hadron'  ] = 0.004 ;
  return tracker ;
}

function ecal_object(name, ri, ro, z_start, z_end, nl, nseg, nsec, padding_xy, padding_z, rgb_plane, rgb_line){
  var ecal = new calorimeter_object(name, 'ecal', ri, ro, z_start, z_end, nl, nseg, nsec, padding_xy, padding_z, rgb_plane, rgb_line) ;
  ecal.stopping_powers['electron'        ] = 0.025 ;
  ecal.stopping_powers['photon'          ] = 0.033 ;
  ecal.stopping_powers['muon'            ] = 0.001 ;
  ecal.stopping_powers['tau'             ] = 0.001 ;
  ecal.stopping_powers['ephemeral_hadron'] = 0.000 ;
  ecal.stopping_powers['neutrino'        ] = 0.000 ;
  ecal.stopping_powers['charged_hadron'  ] = 0.005 ;
  ecal.stopping_powers['neutral_hadron'  ] = 0.005 ;
  return ecal ;
}

function hcal_object(name, ri, ro, z_start, z_end, nl, nseg, nsec, padding_xy, padding_z, rgb_plane, rgb_line){
  var hcal = new calorimeter_object(name, 'hcal', ri, ro, z_start, z_end, nl, nseg, nsec, padding_xy, padding_z, rgb_plane, rgb_line) ;
  hcal.stopping_powers['electron'        ] = 0.020 ;
  hcal.stopping_powers['photon'          ] = 0.020 ;
  hcal.stopping_powers['muon'            ] = 0.001 ;
  hcal.stopping_powers['tau'             ] = 0.001 ;
  hcal.stopping_powers['ephemeral_hadron'] = 0.000 ;
  hcal.stopping_powers['neutrino'        ] = 0.000 ;
  hcal.stopping_powers['charged_hadron'  ] = 0.080 ;
  hcal.stopping_powers['neutral_hadron'  ] = 0.080 ;
  return hcal ;
}

// Arguments are:
//   Name, should be unique to each component
//   Type, used mainly for getting the stopping powers etc
//   Inner and outer radii, extent in z direction
//   Number of layers in the r direction
//   Number of segments, in the z direction (Think of this like a caterpillar!)
//   Number of sectors in the phi direction
//   Padding in the r direction and z direction for mostly aesthetic reason, but also to simulate cracks in the detector
//   Colors used for drawing
function calorimeter_object(name, type, ri, ro, z_start, z_end, nl, nseg, nsec, padding_xy, padding_z, rgb_plane, rgb_line){
  this.name         = name ;
  this.type         = type ;
  this.rgb_plane    = rgb_plane ;
  this.rgb_line     = rgb_line  ;
  this.inner_radius = ri ;
  this.outer_radius = ro ;
  this.z_start      = z_start ;
  this.z_end        = z_end ;
  this.z_length     = this.z_end-this.z_start ;
  this.n_layers     = nl ;
  this.n_segments   = nseg ;
  this.n_sectors    = nsec ;
  this.padding_xy   = padding_xy ;
  this.padding_z    = padding_z  ;
  this.spatial_resolution = 0.1 ;
  this.ri2 = pow(this.inner_radius,2) ;
  this.ro2 = pow(this.outer_radius,2) ;
  this.cells = [] ;
  this.blocks = [] ;
  
  this.z_from_index = function(index){
    if(index<0) return null ;
    if(index>=this.n_segments) return null ;
    return this.z_start + (this.z_end-this.z_start)*index/this.n_segments ;
  }
  
  // (u,v,w) are the indices in the (r,phi,z) directions
  this.u_from_r = function(r){
    if(isNaN(r)) return null ;
    if(r<this.inner_radius) return null ;
    if(r>this.outer_radius) return null ;
    var u = floor(this.n_layers*(r-this.inner_radius)/(this.outer_radius-this.inner_radius)) ;
    if(u<0) return null ;
    if(u>=this.n_layers) return null ;
    return u ;
  }
  this.v_from_phi = function(phi){
    phi = (phi+2*pi)%(2*pi) ;
    return floor((phi)/(2*pi)*this.n_sectors) ;
  }
  this.w_from_z = function(z){
    if(z<this.z_start) return null ;
    if(z>this.z_end  ) return null ;
    var w = floor(this.n_segments*(z-this.z_start)/(this.z_end-this.z_start)) ;
    return w ;
  }
  
  // Stopping powers, for electron, muon, tau, photon, neutrino, charged_hardon, neutral_hadron, ephemeral_hadron
  this.stopping_powers = [] ;
  
  // Make polygons for drawing the calorimeter
  this.polygons = [] ;
  var ro = this.outer_radius ;
  var ri = this.inner_radius ;
  for(var u=0 ; u<this.n_layers ; u++){ // position in r
    this.blocks.push([]) ;
    var rho_1  = ri + (ro-ri)*(u+0)/this.n_layers ;
    var rho_2  = ri + (ro-ri)*(u+1)/this.n_layers ;
    var dxy    = rho_2-rho_1 ;
    var rho_1_ = rho_1 + dxy*this.padding_xy ;
    var rho_2_ = rho_2 - dxy*this.padding_xy ;
    for(var v=0 ; v<this.n_sectors ; v++){ // position in phi
      this.blocks[u].push([]) ;
      var phi1 = 2*pi*(v-0.0)/this.n_sectors ;
      var phi2 = 2*pi*(v+1.0)/this.n_sectors ;
      for(var w=0 ; w<this.n_segments ; w++){ // position in z
        var z1 = this.z_start + this.z_length*(w+0)/this.n_segments - this.padding_z ;
        var z2 = this.z_start + this.z_length*(w+1)/this.n_segments + this.padding_z ;
        
        // Assemble all the points
        var x111 = rho_1_*cos(phi1) ; var y111 = rho_1_*sin(phi1) ; var z111 = z1 ;
        var x211 = rho_1_*cos(phi2) ; var y211 = rho_1_*sin(phi2) ; var z211 = z1 ;
        var x121 = rho_1_*cos(phi1) ; var y121 = rho_1_*sin(phi1) ; var z121 = z2 ;
        var x221 = rho_1_*cos(phi2) ; var y221 = rho_1_*sin(phi2) ; var z221 = z2 ;
        var x112 = rho_2_*cos(phi1) ; var y112 = rho_2_*sin(phi1) ; var z112 = z1 ;
        var x212 = rho_2_*cos(phi2) ; var y212 = rho_2_*sin(phi2) ; var z212 = z1 ;
        var x122 = rho_2_*cos(phi1) ; var y122 = rho_2_*sin(phi1) ; var z122 = z2 ;
        var x222 = rho_2_*cos(phi2) ; var y222 = rho_2_*sin(phi2) ; var z222 = z2 ;
        
        var points = [ [x111,y111,z111] , [x211,y211,z211] , [x121,y121,z121] , [x221,y221,z221] , [x112,y112,z112] , [x212,y212,z212] , [x122,y122,z122] , [x222,y222,z222] ] ;
        var calo_block = new calorimeter_block(points, rgb_plane, rgb_line) ;
        
        // Don't forget to store the coordinates!
        // i is a an id unique to the block in this detector component
        calo_block.u = u ;
        calo_block.v = v ;
        calo_block.w = w ;
        calo_block.i = u*this.n_layers + v*this.n_sectors + w ;
        
        // r_center is used for the tracker to find best point for a hit
        calo_block.r_center = 0.5*(rho_1_+rho_2_) ;
        
        // type is used when storing the block in the particle object
        calo_block.type = this.type ;
        this.blocks[u][v].push(calo_block) ;
        this.cells.push(calo_block.cell) ;
      }
    }
  }
  
  // Make getting a block very cheap so we can transform from (x,y,z) to (u,v,w) quickly
  this.get_block = function(xyz){
    var phi = atan2(xyz[1],xyz[0]) ;
    var r = sqrt(xyz[0]*xyz[0]+xyz[1]*xyz[1]) ;
    var u = this.u_from_r(r) ;
    var v = this.v_from_phi(phi) ;
    var w = this.w_from_z(xyz[2]) ;
    if(u==null) return null ;
    if(v==null) return null ;
    if(w==null) return null ;
    return this.blocks[u][v][w] ;
  }
}

// An individual cell, the smallest part of a detector components.
// It's a trapezoid
function component_cell(rgb_plane, rgb_line){
  this.rgb_plane = rgb_plane ;
  this.rgb_line  = rgb_line  ;
  this.points          = [] ;
  this.polygons        = [] ;
  this.lines           = [] ;
  this.polygon_indices = [] ;
  this.line_indices    = [] ;
  this.line_opacity    = 0.1 ;
  
  // Used to make the cell hot or cold, for drawing the fancy event displays
  this.make_hot = function(value){
    for(var i=0 ; i<this.polygons.length ; i++){
      this.polygons[i].hot = value ;
    }
  }
  
  //  Assemble all the polygons (including lines)
  this.make_shapes = function(rgb_plane, rgb_line){
    for(var i=0 ; i<this.polygon_indices.length ; i++){
      var p = new polygon_object(this.rgb_plane) ;
      for(var j=0 ; j<this.polygon_indices[i].length ; j++){
        var index = this.polygon_indices[i][j] ;
        p.add_point(this.points[index][0], this.points[index][1], this.points[index][2]) ;
      }
      // Keep track of the parent, just in case we need it later (Is this used anymore?)
      p.parent = this ;
      this.polygons.push(p) ;
    }
    for(var i=0 ; i<this.line_indices.length ; i++){
      var i1 = this.line_indices[i][0] ;
      var i2 = this.line_indices[i][1] ;
      var l = new polygon_object(this.rgb_line) ;
      l.add_point(this.points[i1][0], this.points[i1][1], this.points[i1][2]) ;
      l.add_point(this.points[i2][0], this.points[i2][1], this.points[i2][2]) ;
      l.parent = this ;
      l.line_opacity = this.line_opacity ;
      this.lines.push(l) ;
    }
  }
  // To make the event displays slightly nicer, give the option to turn off some lines
  this.update_line_status = function(){
    var c = centroid(this.points) ;
    for(var i=0 ; i<this.lines.length ; i++){
      var cl = centroid(this.lines[i]) ;
      this.lines.is_visible = (cl.z > c.z+1e-6) ;
    }
  }
}

