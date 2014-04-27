beampipe_object = function(name, zl, line_opacity, rgb){
  this.name = name ;
  this.rgb = rgb ;
  this.z_length = zl ;
  this.polygons = [] ;
  this.cells = [] ;
  this.line_opacity = line_opacity ;
  this.ri2 = 0 ;
  this.ro2 = 0 ;
  
  this.stopping_powers = [] ;
  this.stopping_powers['electron'        ] = 1.0 ;
  this.stopping_powers['photon'          ] = 1.0 ;
  this.stopping_powers['muon'            ] = 1.0 ;
  this.stopping_powers['tau'             ] = 1.0 ;
  this.stopping_powers['neutrino'        ] = 1.0 ;
  this.stopping_powers['ephemeral_hadron'] = 1.0 ;
  this.stopping_powers['charged_hadron'  ] = 1.0 ;
  this.stopping_powers['neutral_hadron'  ] = 1.0 ;
  
  var cell = new component_cell(this.rgb, this.rgb) ;
  var points = [ [0,0,-0.5*this.z_length] , [0,0,0.5*this.z_length] ] ;
  cell.points = points ;
  cell.line_indices = [ [0,1] ] ;
  cell.line_opacity = this.line_opacity ;
  cell.make_shapes() ;
  this.cells.push(cell) ;
}
