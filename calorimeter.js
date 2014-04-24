function calorimeter_block(points, rgb_plane, rgb_line){
  this.rgb_plane = rgb_plane ;
  this.rgb_line  = rgb_line  ;
  this.cell = new component_cell(this.rgb_plane, this.rgb_line) ;
  this.cell.points = points ;
  this.cell.polygon_indices = [ [0,1,3,2] , [4,5,7,6] , [0,1,5,4] , [2,3,7,6] , [0,4,6,2] , [1,5,7,3] ] ;
  this.cell.line_indices = [ [0,1] , [1,3] , [3,2] , [2,0] , [4,5] , [5,7] , [7,6] , [6,4] , [0,4] , [1,5] , [3,7] , [6,2] ] ;
  this.cell.make_shapes() ;
}

function calorimeter_object(name, ri, ro, zl, nl, nseg, nsec, padding_xy, padding_z, rgb_plane, rgb_line){
  this.name = name ;
  this.rgb_plane = rgb_plane ;
  this.rgb_line  = rgb_line  ;
  this.inner_radius = ri ;
  this.outer_radius = ro ;
  this.z_length     = zl ;
  this.n_layers     = nl ;
  this.n_segments   = nseg ;
  this.n_sectors    = nsec ;
  this.padding_xy   = padding_xy ;
  this.padding_z    = padding_z  ;
  this.spatial_resolution = 0.1 ;
  this.ri2 = Math.pow(this.inner_radius,2) ;
  this.ro2 = Math.pow(this.outer_radius,2) ;
  this.cells = [] ;
  this.blocks = [] ;
  this.layer_radii = [] ;
  
  this.stopping_powers = [] ;
  
  // Make polygons
  this.polygons = [] ;
  var ro = this.outer_radius ;
  var ri = this.inner_radius ;
  for(var k=0 ; k<this.n_layers ; k++){ // position in r
    var rho_1    = ri + (ro-ri)*(k+0)/(this.n_layers) ;
    var rho_2    = ri + (ro-ri)*(k+1)/(this.n_layers) ;
    this.layer_radii.push(0.5*(rho_1+rho_2)) ;
    for(var i=0 ; i<this.n_segments ; i++){ // position in phi
      for(var j=-this.n_sectors/2 ; j<this.n_sectors/2 ; j++){ // position in z
        var lambda_1 = this.z_length*(1+((ro-ri)/ri)*(k+0)/(this.n_layers)) ;
        var lambda_2 = this.z_length*(1+((ro-ri)/ri)*(k+1)/(this.n_layers)) ;
        var phi1     = 2*Math.PI*(i-0.5)/this.n_segments ;
        var phi2     = 2*Math.PI*(i+0.5)/this.n_segments ;
        
        lambda_1 = this.z_length ;
        // Scale thing to get the padding
        var dxy = rho_2-rho_1 ;
        var s1 = 1+this.padding_xy ;
        var s2 = 1-this.padding_xy ;
        var sz1 = (j<0) ? s2 : s1 ;
        var sz2 = (j<0) ? s1 : s2 ;
        var rho_1_ = rho_1 + dxy*this.padding_xy ;
        var rho_2_ = rho_2 - dxy*this.padding_xy ;
        var z1 = (j+0)*lambda_1/this.n_sectors + padding_z*lambda_1/this.n_sectors ;
        var z2 = (j+1)*lambda_1/this.n_sectors - padding_z*lambda_1/this.n_sectors ;
        var x111 = rho_1_*Math.cos(phi1) ; var y111 = rho_1_*Math.sin(phi1) ; var z111 = z1 ;
        var x211 = rho_1_*Math.cos(phi2) ; var y211 = rho_1_*Math.sin(phi2) ; var z211 = z1 ;
        var x121 = rho_1_*Math.cos(phi1) ; var y121 = rho_1_*Math.sin(phi1) ; var z121 = z2 ;
        var x221 = rho_1_*Math.cos(phi2) ; var y221 = rho_1_*Math.sin(phi2) ; var z221 = z2 ;
        var x112 = rho_2_*Math.cos(phi1) ; var y112 = rho_2_*Math.sin(phi1) ; var z112 = z1 ;
        var x212 = rho_2_*Math.cos(phi2) ; var y212 = rho_2_*Math.sin(phi2) ; var z212 = z1 ;
        var x122 = rho_2_*Math.cos(phi1) ; var y122 = rho_2_*Math.sin(phi1) ; var z122 = z2 ;
        var x222 = rho_2_*Math.cos(phi2) ; var y222 = rho_2_*Math.sin(phi2) ; var z222 = z2 ;
        
        var points = [ [x111,y111,z111] , [x211,y211,z211] , [x121,y121,z121] , [x221,y221,z221] , [x112,y112,z112] , [x212,y212,z212] , [x122,y122,z122] , [x222,y222,z222] ] ;
        var calo_block = new calorimeter_block(points, rgb_plane, rgb_line) ;
        this.blocks.push(calo_block) ;
        this.cells.push(calo_block.cell) ;
      }
    }
  }
  this.seek_block = function(x, y, z){
    var best_dr2 = 1e6 ;
    var best_index = -1 ;
    for(var i=0 ; i<this.blocks.length ; i++){
      var c = get_centroid(this.blocks[i].cell.points) ;
      var dr2 = (x-c.x)*(c-c.x) + (y-c.y)*(y-c.y) + (z-c.z)*(z-c.z) ;
      if(dr2<best_dr2){
        best_dr2 = dr2 ;
        best_index = i ;
      }
    }
    if(best_index==-1) return null ;
    return this.blocks[best_index] ;
  }
  
  
}
