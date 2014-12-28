function particle_trajectory(path_xyz, path_p, color){
  this.xyz   = path_xyz ;
  this.p     = path_p   ;
  this.color = color    ;
}

function detector_from_xml(node){
  var detector = new detector_object() ;
  var component_list_node = null ;
  if(node.nodeName=='component_list'){
    component_list_node = node ;
    alert(node.nodeName) ;
  }
  else{
    for(var i=0 ; i<node.childNodes.length ; i++){
      if(node.childNodes[i].nodeName=='component_list'){
        component_list_node = node.childNodes[i] ;
        break ;
      }
    }
  }
  for(var i=0 ; i<component_list_node.childNodes.length ; i++){
    if(component_list_node.childNodes[i].nodeName=='detector_component'){
      var component = detector_component_from_xml(component_list_node.childNodes[i]) ;
      if(component) detector.components.push(component) ;
    }
  }
  return detector ;
}

function detector_object(){
  this.components = [] ;
  this.triggers   = [] ;
  this.find_subcomponent = function(x, y, z){
    var r2 = x*x+y*y ;
    var matches = [] ;
    for(var i=0 ; i<this.components.length ; i++){
      var com = this.components[i] ;
      if(abs(z)>0.5*com.z_length) continue ;
      if(r2<com.ri2 || r2>com.ro2) continue ;
      matches.push(find_subcomponent(com,x,y,z)) ;
    }
    return matches ;
  }
  
  // Maximal range in r and z for the detector
  this.r_max = -1 ;
  this.z_min =  1 ;
  this.z_max = -1 ;
  this.assess_critical_layers = function(){
    for(var i=0 ; i<this.components.length ; i++){
      var com = this.components[i] ;
      this.z_min = min(this.z_min,com.z_start) ;
      this.z_max = max(this.z_max,com.z_end  ) ;
      this.r_max = max(this.r_max,com.outer_radius) ;
    }
  }
  
  // Call once all parts have been assembled to perform one-off calculations
  this.initialise = function(){
    this.assess_critical_layers() ;
  }
  
  // Pass the list of particles to the detector and return a list of particle trajectories
  this.process_particles = function(particles){
    var trajs = [] ;
    for(var i=0 ; i<particles.length ; i++){
      trajs.push(this.process_particle(particles[i])) ;
    }
    return trajs ;
  }
  this.process_particle = function(particle){
    // Propagate the particle through the detector
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
    var p  = sqrt(px*px+py*py+pz*pz) ;
    var charged = abs(particle.q)>0.5 ;
    var m2c2 = m*m*c*c ;
    
    var vx = c*c*px/E ;
    var vy = c*c*py/E ;
    var vz = c*c*pz/E ;
    var v  = sqrt(vx*vx+vy*vy+vz*vz) ;
    var v2 = vx*vx+vy*vy+vz*vz ;
    var g2 = v2/c2 ;
    
    // And back to MeV for sanity
    var pMev  =  p*c/(1e6*e) ;
    var EMev  =    E/(1e6*e) ;
    var pxMev = px*c/(1e6*e) ;
    var pyMev = py*c/(1e6*e) ;
    var pzMev = pz*c/(1e6*e) ;
    var dEMev = 0 ;
    
    // points_xyz contains the (x,y,z) coordinates of the path of the particle
    // points_p contains the (px,py,pz,E,dE) coordinates, where dE is the energy loss
    var points_xyz = [] ;
    var points_p   = [] ;
    var dt = 1e-10 ;
    
    // Make a path through the detector
    points_xyz.push([x,y,z]) ;
    points_p.push([px,py,pz,E]) ;
    var r2_decay = 1e6 ;
    if(particle.r_decay) r2_decay = particle.r_decay.x*particle.r_decay.x + particle.r_decay.y*particle.r_decay.y ;
    
    if(particle.is_unstable || particle.type=='neutrino'){
      var traj = new particle_trajectory(points_xyz, points_p, particle.color) ;
      return traj ;
    }
    
    // Move through detector, step by step
    for(var i=0 ; i<n_traj_points_through_detector ; i++){
      // For neutral particles that decay, we can just move to the decay point immediately
      // Not completely accurate for KS and KL (due to energy losses), but close enough
      if(particle.r_decay && particle.q==0){
        points_xyz.push([particle.r_decay.x,particle.r_decay.y,particle.r_decay.z]) ;
        points_p.push([pxMev,pyMev,pzMev,EMev]) ;
        break ;
      }
      var r2 = x*x + y*y ;
      // For particles that decay, if we are past the point where they decay, break out to save CPU time
      if(r2>r2_decay){
        if(particle.r_decay){
          points_xyz.pop() ;
          points_xyz.push([particle.r_decay.x,particle.r_decay.y,particle.r_decay.z]) ;
          points_p.push([pxMev,pyMev,pzMev,EMev]) ;
        }
        break ;
      }
      
      // Check to see if we're outside the range of the detector
      // If so, break to save CPU time
      // But first change the position of the final point to make it look more realistic
      if(z <this.z_min){
        var xyz = points_xyz.pop() ;
        xyz[2] = this.z_min ;
        points_xyz.push(xyz) ;
        break ;
      }
      if(z >this.z_max){
        var xyz = points_xyz.pop() ;
        xyz[2] = this.z_max ;
        points_xyz.push(xyz) ;
        break ;
      }
      if(r2>this.r_max*this.r_max){
        var xyz = points_xyz.pop() ;
        var R = sqrt(xyz[0]*xyz[0]+xyz[1]*xyz[1]) ;
        xyz[0] *= this.r_max/R ;
        xyz[1] *= this.r_max/R ;
        points_xyz.push(xyz) ;
        break ;
      }
      
      var xyz = [x,y,z] ;
      var p4 = [pxMev,pyMev,pzMev,EMev,dEMev] ;
      points_xyz.push(xyz) ;
      points_p  .push(p4) ;
      
      // Now look for the appropriate block and get the stopping power for the particle
      var stopping_power = 0 ;
      var block = null ;
      for(var j=0 ; j<this.components.length ; j++){
        var com = this.components[j]
        var block = com.get_block([x,y,z]) ;
        if(block){
          stopping_power = com.stopping_powers[particle.type] ;
          break ;
        }
      }
      
      // Effect of the magnetic field on a charged particle
      if(r2>B_r2) B = -0.0*B_field ;
      var k = q*B/(m*g*c) ;
      vx += (charged) ?  k*vy : 0 ;
      vy += (charged) ? -k*vx : 0 ;
      
      // Stopping power calculation
      // First reduce energy, then adjust p and v accordingly
      var stopping_power_smear = 0.95+0.05*random() ;
      E *= (1-stopping_power*stopping_power_smear) ;
      p = sqrt(E*E/c2-m2c2) ;
      var b = p*c/E ;
      var v = sqrt(vx*vx+vy*vy+vz*vz) ;
      var theta = acos(vz/v) ;
      var phi   = atan2(vy,vx) ;
      var pt    = p*sin(theta) ;
      
      vx = c*sin(theta)*cos(phi) ;
      vy = c*sin(theta)*sin(phi) ;
      vz = c*cos(theta) ;
      
      // If the particle is massive, the speed is less than c
      if(m>e*1e-3){ vx *= b ; vy *= b ; vz *= b ; }
      
      // Update the spatial coordinates
      x += vx*dt ; y += vy*dt ; z += vz*dt ;
      
      // Update the MeV values
      pMev = p*c/(1e6*e) ;
      if(pMev<30) break ;
      var EMevTmp = EMev ;
      EMev = E/(1e6*e) ;
      pxMev = pMev*sin(theta)*cos(phi) ;
      pyMev = pMev*sin(theta)*sin(phi) ;
      pzMev = pMev*cos(theta) ;
      dEMev = EMevTmp - EMev
      
      if(block) particle.add_block(xyz, p4, block) ;
    }
    var traj = new particle_trajectory(points_xyz, points_p, particle.color) ;
    return traj ;
  }
  
  this.make_xml_node = function(){
    var element = xmlDoc.createElement('detector') ;
    var component_list = xmlDoc.createElement('component_list') ;
    for(var i=0 ; i<this.components.length ; i++){
      var component_node = this.components[i].make_xml_node() ;
      component_list.appendChild(component_node) ;
    }
    element.appendChild(component_list) ;
    return element ;
  }
}

