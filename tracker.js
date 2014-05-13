function tracker_layer(points, rgb_plane, rgb_line){
  this.rgb_plane = rgb_plane ;
  this.rgb_line  = rgb_line  ;
  this.cell = new component_cell(this.rgb_plane, this.rgb_line) ;
  this.cell.points = points ;
  this.cell.polygon_indices = [ [0,1,2,3] ] ;
  this.cell.line_indices = [ [0,1] , [1,2] , [2,3] , [3,0] ] ;
  this.cell.make_shapes() ;
}

function tracker_object(name, ri, ro, z_start, z_end, nl, n_sec, rgb_plane, rgb_line){
  this.name         = name ;
  this.rgb_plane    = rgb_plane ;
  this.rgb_line     = rgb_line  ;
  this.n_layers     = nl ;
  this.n_sectors    = n_sec ;
  this.inner_radius = ri ;
  this.outer_radius = ro ;
  this.z_start      = z_start ;
  this.z_end        = z_end ;
  this.z_length     = this.z_end-this.z_start ;
  this.ri2          = pow(this.inner_radius,2) ;
  this.ro2          = pow(this.outer_radius,2) ;
  this.cells        = [] ;
  this.layers       = [] ;
  this.layer_radii  = [] ;
  
  this.stopping_powers = [] ;
  this.stopping_powers['electron'        ] =    0 ;
  this.stopping_powers['photon'          ] =    0 ;
  this.stopping_powers['muon'            ] = 1e-3 ;
  this.stopping_powers['tau'             ] = 1e-3 ;
  this.stopping_powers['neutrino'        ] =    0 ;
  this.stopping_powers['ephemeral_hadron'] =    0 ;
  this.stopping_powers['charged_hadron'  ] = 1e-3 ;
  this.stopping_powers['neutral_hadron'  ] = 1e-3 ;
  
  // Make polygons
  this.polygons = [] ;
  var z1 = this.z_start ;
  var z2 = this.z_end   ;
  for(var i=0 ; i<this.n_layers ; i++){
    var rho = this.inner_radius + (this.outer_radius-this.inner_radius)*i/(this.n_layers-1) ;
    this.layer_radii.push(rho) ;
    for(var j=0 ; j<this.n_sectors ; j++){
      var x1 = rho*cos(2*pi*(j-0.0)/this.n_sectors) ;
      var y1 = rho*sin(2*pi*(j-0.0)/this.n_sectors) ;
      var y2 = rho*sin(2*pi*(j+1.0)/this.n_sectors) ;
      var x2 = rho*cos(2*pi*(j+1.0)/this.n_sectors) ;
      
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
  this.get_block = function(xyz){
    
  }
}
