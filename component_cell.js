function component_cell(rgb_plane, rgb_line){
  this.rgb_plane = rgb_plane ;
  this.rgb_line  = rgb_line  ;
  this.points          = [] ;
  this.polygons        = [] ;
  this.lines           = [] ;
  this.polygon_indices = [] ;
  this.line_indices    = [] ;
  this.line_opacity    = 0.1 ;
  this.bounding_point1 = new threeVector() ;
  this.bounding_point2 = new threeVector() ;
  this.make_hot = function(value){
    for(var i=0 ; i<this.polygons.length ; i++){
      this.polygons[i].hot = value ;
    }
  }
  this.make_shapes = function(rgb_plane, rgb_line){
    for(var i=0 ; i<this.polygon_indices.length ; i++){
      var p = new polygon_object(this.rgb_plane) ;
      for(var j=0 ; j<this.polygon_indices[i].length ; j++){
        var index = this.polygon_indices[i][j] ;
        p.add_point(this.points[index][0], this.points[index][1], this.points[index][2]) ;
      }
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
    var x_min =  1e6 ; var x_max = -1e6 ;
    var y_min =  1e6 ; var y_max = -1e6 ;
    var z_min =  1e6 ; var z_max = -1e6 ;
    for(var i=0 ; i<this.points.length ; i++){
      x_min = Math.min(x_min, this.points[i][0]) ;
      x_max = Math.max(x_max, this.points[i][0]) ;
      y_min = Math.min(y_min, this.points[i][1]) ;
      y_max = Math.max(y_max, this.points[i][1]) ;
      z_min = Math.min(z_min, this.points[i][2]) ;
      z_max = Math.max(z_max, this.points[i][2]) ;
    }
    this.bounding_point1.x = x_min ; this.bounding_point2.x = x_max ;
    this.bounding_point1.y = y_min ; this.bounding_point2.y = y_max ;
    this.bounding_point1.z = z_min ; this.bounding_point2.z = z_max ;
  }
  this.update_line_status = function(){
    var c = centroid(this.points) ;
    for(var i=0 ; i<this.lines.length ; i++){
      var cl = centroid(this.lines[i]) ;
      this.lines.is_visible = (cl.z > c.z+1e-6) ;
    }
  }
}

function find_subcomponent(component, x,y,z){
  var matches = [] ;
  for(var i=0 ; i<component.cells.length ; i++){
    var bp1 = component.cells[i].bounding_point1 ;
    var bp2 = component.cells[i].bounding_point2 ;
    if(x>=bp1.x && x<=bp2.x && y>=bp1.y && y<=bp2.y && z>=bp1.z && z<=bp2.z){
      matches.push(component.cells[i]) ;
    }
  }
  if(matches.length==0){
    return null ;
  }
  else if(matches.length==1){
    return [component , matches[0]] ;
  }
  else{ // This needs to be updated eventually
    return [component , matches[0]] ;
  }
}
  
