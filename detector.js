function particle_trajectory(path_xyz, path_p, color){
  this.xyz   = path_xyz ;
  this.p     = path_p   ;
  this.color = color    ;
}

function detector_object(){
  this.components = [] ;
  this.triggers   = [] ;
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
  
  this.process_particles = function(particles){
    var trajs = [] ;
    for(var i=0 ; i<particles.length ; i++){
      trajs.push(this.process_particle(particles[i])) ;
    }
    return trajs ;
  }
  this.process_particle = function(particle){
    // Propagate particle through detector
    var x = particle.r_0.x ;
    var y = particle.r_0.y ;
    var z = particle.r_0.z ;
    
    // Convert everything to MKS
    var B = B_field ;
    var e = 1.6e-19 ;
    var c = 3e8 ;
    var c2 = c*c ;
    var m = particle.m*e*1e6/(c*c) ;
    var E = particle.p4_0.E()*e*1e6 ;
    var g = particle.p4_0.g() ;
    var q = particle.q*e ;
    var px = particle.p4_0.px()*e*1e6/c ;
    var py = particle.p4_0.py()*e*1e6/c ;
    var pz = particle.p4_0.pz()*e*1e6/c ;
    var p  = Math.sqrt(px*px+py*py+pz*pz) ;
    var charged = Math.abs(particle.q)>0.5 ;
    var m2c2 = m*m*c*c ;
    
    var vx = c*c*px/E ;
    var vy = c*c*py/E ;
    var vz = c*c*pz/E ;
    var v = Math.sqrt(vx*vx+vy*vy+vz*vz) ;
    var v2 = vx*vx+vy*vy+vz*vz ;
    var g2 = v2/c2 ;
    
    var pMev  = p*c/(1e6*e) ;
    var EMev  = E/(1e6*e) ;
    var pxMev = px*c/(1e6*e) ;
    var pyMev = py*c/(1e6*e) ;
    var pzMev = pz*c/(1e6*e) ;
    
    var points_xyz = [] ;
    var points_p   = [] ;
    var dt = 1e-10 ;
    
    // Make a path through the detector
    //points.push([x,y,z], [px,py,pz,E]) ;
    var critical_layer_index = 0 ;
    var stopping_power = 0.0 ;
    var cl = this.critical_layers[0] ;
    var com = null ;
    var r2_decay = 1e6 ;
    if(particle.r_decay) r2_decay = particle.r_decay.x*particle.r_decay.x + particle.r_decay.y*particle.r_decay.y ;
    
    // Move through detector, step by step
    for(var i=0 ; i<1000 ; i++){
      if(particle.r_decay && particle.q==0){
        points_xyz.push([particle.r_decay.x,particle.r_decay.y,particle.r_decay.z]) ;
        points_p.push([pxMev,pyMev,pzMev,EMev]) ;
        break ;
      }
      var r2 = x*x + y*y ;
      if(r2>r2_decay){
        if(particle.r_decay){
          points_xyz.pop() ;
          points_xyz.push([particle.r_decay.x,particle.r_decay.y,particle.r_decay.z]) ;
          points_p.push([pxMev,pyMev,pzMev,EMev]) ;
        }
        break ;
      }
      if(Math.abs(z)>this.critical_z) break ;
      if(r2>cl[0]){
        cl = this.critical_layers[critical_layer_index]
        if(cl[2]=='end'){ break ; }
        else if(cl[2]=='in'){ com = cl[1] ; }
        else{ com = null ; }
        if(com){
          stopping_power = com.stopping_powers[particle.type] ;
        }
        else{
          stopping_power = 0.0 ;
        }
        critical_layer_index++ ;
      }
           
      // Magnetic field
      if(r2>B_r2) B = -0.0*B_field ;
      var k = q*B/(m*g*c) ;
      vx += (charged) ?  k*vy : 0 ;
      vy += (charged) ? -k*vx : 0 ;
      
      // Stopping power calculation
      // First reduce energy, then adjust p and v accordingly
      if(E<5*e*1e6) break ;
      p = Math.sqrt(E*E/c2-m2c2) ;
      var b = p*c/E ;
      var v = Math.sqrt(vx*vx+vy*vy+vz*vz) ;
      var theta = Math.acos(vz/v) ;
      var phi   = Math.atan2(vy,vx) ;
      var pt = p*Math.sin(theta) ;
      if(pt*c/(e*1e6)<20) break ;
      
      vx = c*Math.sin(theta)*Math.cos(phi) ;
      vy = c*Math.sin(theta)*Math.sin(phi) ;
      vz = c*Math.cos(theta) ;
      
      if(m>e*1e-3){
        vx *= b ;
        vy *= b ;
        vz *= b ;
      }
      x += vx*dt ;
      y += vy*dt ;
      z += vz*dt ;
      
      pMev = p*c/(1e6*e) ;
      EMev = E/(1e6*e) ;
      pxMev = pMev*Math.sin(theta)*Math.cos(phi) ;
      pyMev = pMev*Math.sin(theta)*Math.sin(phi) ;
      pzMev = pMev*Math.cos(theta) ;
      
      points_xyz.push([x,y,z]) ;
      points_p  .push([pxMev,pyMev,pzMev,EMev]) ;
    }
    var traj = new particle_trajectory(points_xyz, points_p, particle.color) ;
    
    // Handle tracker
    var tracker = this.components[1] ; // Fix this later
    var layer_index = 0 ;
    for(var i=0 ; i<points_xyz.length-1 ; i++){
      if(Math.abs(points_xyz[2])>0.5*tracker.z_length) continue ;
      var p1 = points_xyz[i+0] ;
      var p2 = points_xyz[i+1] ;
      var r2 = Math.pow(tracker.layer_radii[layer_index],2) ;
      if(p1[0]*p1[0]+p1[1]*p1[1]<r2 && p2[0]*p2[0]+p2[1]*p2[1]>r2){
        particle.add_tracker_hit(0.5*(p1[0]+p2[0]), 0.5*(p1[1]+p2[1]), 0.5*(p1[2]+p2[2]), Math.sqrt(r2), points_p[i]) ;
        layer_index++ ;
        if(layer_index==tracker.layer_radii.length) break ;
      }
    }
    
    // Handle ecal
    var ecal = this.components[2] ; // Fix this later
    var layer_index = 0 ;
    for(var i=0 ; i<points_xyz.length-1 ; i++){
      if(Math.abs(points_xyz[2])>0.5*ecal.z_length) continue ;
      var p1 = points_xyz[i+0] ;
      var p2 = points_xyz[i+1] ;
      var r2 = Math.pow(ecal.layer_radii[layer_index],2) ;
      if(p1[0]*p1[0]+p1[1]*p1[1]<r2 && p2[0]*p2[0]+p2[1]*p2[1]>r2){
        var x = 0.5*(p1[0]+p2[0]) ;
        var y = 0.5*(p1[1]+p2[1]) ;
        var z = 0.5*(p1[2]+p2[2]) ;
        var block = ecal.seek_block(x, y, z) ;
        if(block) particle.add_ecal_block(x, y, z, points_p[i], block) ;
        layer_index++ ;
        if(layer_index==ecal.layer_radii.length) break ;
      }
    }
    
    // Handle hcal
    var hcal = this.components[3] ; // Fix this later
    var layer_index = 0 ;
    for(var i=0 ; i<points_xyz.length-1 ; i++){
      if(Math.abs(points_xyz[2])>0.5*hcal.z_length) continue ;
      var p1 = points_xyz[i+0] ;
      var p2 = points_xyz[i+1] ;
      var r2 = Math.pow(hcal.layer_radii[layer_index],2) ;
      if(p1[0]*p1[0]+p1[1]*p1[1]<r2 && p2[0]*p2[0]+p2[1]*p2[1]>r2){
        var x = 0.5*(p1[0]+p2[0]) ;
        var y = 0.5*(p1[1]+p2[1]) ;
        var z = 0.5*(p1[2]+p2[2]) ;
        var block = hcal.seek_block(x, y, z) ;
        if(block) particle.add_hcal_block(x, y, z, points_p[i], block) ;
        layer_index++ ;
        if(layer_index==hcal.layer_radii.length) break ;
      }
    }
    return traj ;
  }
}

