function detector_object(){
  this.components = [] ;
  this.find_subcomponent = function(x, y, z){
    var r2 = x*x+y*y ;
    var matches = [] ;
    for(var i=0 ; i<this.components.length ; i++){
      var com = this.components[i] ;
      if(Math.abs(z)>0.5*com.z_length) continue ;
      if(r2<com.ri2 || r2>com.ro2) continue ;
      matches.push(find_subcomponent(com,x,y,z)) ;
    }
    return matches ;
  }
  
  this.critical_layers = [] ;
  this.critical_z = -1 ;
  this.assess_critical_layers = function(){
    this.critical_layers.push( [0, null, 'start'] ) ;
    for(var i=0 ; i<this.components.length ; i++){
      var com = this.components[i] ;
      this.critical_layers.push([com.ri2,com,'in' ]) ;
      this.critical_layers.push([com.ro2,com,'out']) ;
      if(0.5*com.z_length>this.critical_z) this.critical_z = 0.5*com.z_length ;
    }
    this.critical_layers.sort(function(a,b){ return a[0] > b[0] ; } ) ;
    var r2 = this.critical_layers[this.critical_layers.length-1][0] ; 
    this.critical_layers.push( [r2*1.2, null, 'end'] ) ;
  }
  
  this.process_particle = function(particle_parent){
    var particle = particle_parent.par ;
    // Propagate particle through detector
    var x = particle.r_0.x ;
    var y = particle.r_0.y ;
    var z = particle.r_0.z ;
    
    // Convert everything to MKS
    var B = B_field ;
    var e = 1.6e-19 ;
    var c = 3e8 ;
    var m = particle.m/(1e6*c*c) ;
    var g = particle.p4_0.g() ;
    var q = particle.q*e ;
    var px = particle.p4_0.px()/(1e6*c) ;
    var py = particle.p4_0.py()/(1e6*c) ;
    var pz = particle.p4_0.pz()/(1e6*c) ;
    
    var vx = px/(m*g) ;
    var vy = py/(m*g) ;
    var vz = pz/(m*g) ;
    var v = Math.sqrt(vx*vx+vy*vy+vz*vz) ;
    //alert(1-v/c) ;
    
    var points = [] ;
    var dt = 1e-10 ;
    
    // Make a path through the detector
    points.push([x,y,z]) ;
    var critical_layer_index = 0 ;
    var stopping_power = 1.0 ;
    var cl = this.critical_layers[0] ;
    var com = null ;
    for(var i=0 ; i<1000 ; i++){
      var r2 = x*x + y*y ;
      if(Math.abs(z)>this.critical_z) break ;
      if(r2>cl[0]){
        cl = this.critical_layers[critical_layer_index]
        if(cl[2]=='end'){ break ; }
        else if(cl[2]=='in'){ com = cl[1] ; }
        else{ com = null ; }
        if(com){
          stopping_power = com.stopping_powers[particle_parent.name] ;
        }
        else{
          stopping_power = 1.0 ;
        }
        critical_layer_index++ ;
      }
           
      // Magnetic field
      if(r2>B_r2) B = 0 ;
      vx += dt*q*vy*B/m ;
      vy -= dt*q*vx*B/m ;
      
      // Stopping power
      vx *= stopping_power ;
      vy *= stopping_power ;
      vz *= stopping_power ;
      x += vx*dt ;
      y += vy*dt ;
      z += vz*dt ;
      points.push([x,y,z]) ;
    }
    particle.path = points ;
    
    // Handle tracker
    var tracker = this.components[1] ; // Fix this later
    var layer_index = 0 ;
    for(var i=0 ; i<points.length-1 ; i++){
      if(Math.abs(points[i][2])>0.5*tracker.z_length) continue ;
      var p1 = points[i+0] ;
      var p2 = points[i+1] ;
      var r2 = Math.pow(tracker.layer_radii[layer_index],2) ;
      if(p1[0]*p1[0]+p1[1]*p1[1]<r2 && p2[0]*p2[0]+p2[1]*p2[1]>r2){
        particle.add_tracker_hit(0.5*(p1[0]+p2[0]), 0.5*(p1[1]+p2[1]), 0.5*(p1[2]+p2[2]), Math.sqrt(r2)) ;
        layer_index++ ;
        if(layer_index==tracker.layer_radii.length) break ;
      }
    }
    
    // Handle ecal
    var ecal = this.components[2] ; // Fix this later
    var layer_index = 0 ;
    for(var i=0 ; i<points.length-1 ; i++){
      if(Math.abs(points[i][2])>0.5*ecal.z_length) continue ;
      var p1 = points[i+0] ;
      var p2 = points[i+1] ;
      var r2 = Math.pow(ecal.layer_radii[layer_index],2) ;
      if(p1[0]*p1[0]+p1[1]*p1[1]<r2 && p2[0]*p2[0]+p2[1]*p2[1]>r2){
        var x = 0.5*(p1[0]+p2[0]) ;
        var y = 0.5*(p1[1]+p2[1]) ;
        var z = 0.5*(p1[2]+p2[2]) ;
        var block = ecal.seek_block(x, y, z) ;
        if(block) particle.add_ecal_block(x, y, z, block) ;
        layer_index++ ;
        if(layer_index==ecal.layer_radii.length) break ;
      }
    }
    
    // Handle hcal
    var hcal = this.components[3] ; // Fix this later
    var layer_index = 0 ;
    for(var i=0 ; i<points.length-1 ; i++){
      if(Math.abs(points[i][2])>0.5*hcal.z_length) continue ;
      var p1 = points[i+0] ;
      var p2 = points[i+1] ;
      var r2 = Math.pow(hcal.layer_radii[layer_index],2) ;
      if(p1[0]*p1[0]+p1[1]*p1[1]<r2 && p2[0]*p2[0]+p2[1]*p2[1]>r2){
        var x = 0.5*(p1[0]+p2[0]) ;
        var y = 0.5*(p1[1]+p2[1]) ;
        var z = 0.5*(p1[2]+p2[2]) ;
        var block = hcal.seek_block(x, y, z) ;
        if(block) particle.add_hcal_cell(x, y, z, block) ;
        layer_index++ ;
        if(layer_index==hcal.layer_radii.length) break ;
      }
    }
  }
}

