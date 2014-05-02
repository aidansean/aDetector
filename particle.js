function particle_object(m, q, r0, unstable){
  // Intrinsic properties
  this.q = q ;
  this.m = m ;
  
  // r and p values
  this.r_0  = make_point(r0[0],r0[1],r0[2]) ;
  this.p4_0 = new fourVector() ;
  
  if(unstable){ this.r_decay = make_point(r0[0],r0[1],r0[2]) ; }
  
  var phi_theta = random_phi_theta() ;
  var phi   = phi_theta[0] ;
  var theta = phi_theta[1] ;
  
  this.p = 0 ;
  this.p4_0.x = 0 ;
  this.p4_0.y = 0 ;
  this.p4_0.z = 0 ;
  this.p4_0.t = this.m ;
  
  this.daughters = [] ;
  
  // Detector interaction
  this.tracker_hits = [] ;
  this.ecal_blocks  = [] ;
  this.hcal_blocks  = [] ;
  
  this.add_tracker_hit = function(x, y, z, r, p4){
    // First put the hit in the layer
    var r_tmp = Math.sqrt(x*x+y*y) ;
    var ratio = r_tmp/r ;
    x *= ratio ;
    y *= ratio ;
    this.tracker_hits.push([make_point(x, y, z), p4]) ;
  }
  this.add_ecal_block = function(x, y, z, p4, cell){
    this.ecal_blocks.push([make_point(x, y, z),cell,p4]) ;
  }
  this.add_hcal_block = function(x, y, z, p4, cell){
    this.hcal_blocks.push([make_point(x, y, z),cell,p4]) ;
  }
  
  this.choose_random_decay = function(){
    var rand = Math.random() ;
    var p = 0 ;
    var pdgIds = null ;
    for(var i=0 ; i<this.decays.length ; i++){
      p += this.decays[i][0] ;
      if(rand<p){
        pdgIds = this.decays[i][1] ;
        break ;
      }
    }
    if(this.matter==-1){
      for(var i=0 ; i<pdgIds.length ; i++){
        pdgIds[i] *= -1 ;
      }
    }
    return pdgIds ;
  }
  this.decay_top_level = function(m){
    this.daughters = [] ;
    this.decay_recursive(m) ;
    this.post_decay_V0() ;
    return this.daughters ;
  }
  this.decay_recursive = function(m){
    if(this.pdgId==999){
      for(var i=0 ; i<this.daughters.length ; i++){
        this.daughters[i].decay_recursive(this.daughters[i].m) ;
      }
      this.daughters = multibody_decay(this.pdgId, this.p4_0, this.daughters, 0) ;
      return ;
    }
    if(this.decays.length==0) return [] ;
    var pdgIds = this.choose_random_decay() ;
    if(pdgIds==null) return [] ;
    
    var n_jets = 0 ;
    var n_q    = 0 ;
    var n_qbar = 0 ;
    var jet_indices = [] ;
    var remaining_mass = m ;
    var r0 = this.r_0 ;
    for(var i=0 ; i<pdgIds.length ; i++){
      if(Math.abs(pdgIds[i])>0 && Math.abs(pdgIds[i])<10){
        n_jets++ ;
        jet_indices.push(i) ;
        if(pdgIds[i]>0){
          n_q++ ;
        }
        else{
          n_qbar++ ;
        }
      }
      else{
        var particle = make_particle(pdgIds[i], [r0.x, r0.y, r0.z]) ;
        if(particle){
          particle.mother = this ;
          this.daughters.push(particle) ;
          remaining_mass -= particle.p4_0.m() ;
        }
      }
    }
    var jet_quarks = [] ;
    var jet_m0s    = [] ;
    if(n_jets%2==0){
      // Phew, all balanced jets!
      var n_qq = n_jets/2 ;
      var quark_pairs = [] ;
      for(var i=0 ; i<n_qq ; i++){
        var q = choose_qq_pair(m_ss+100) ;
        quark_pairs.push(q) ;
        quark_pairs.push(q) ;
      }
      for(var i=0 ; i<jet_indices.length ; i++){
        var q1 = pdgIds[jet_indices[i]]
        var q2 = (q1>0) ? -quark_pairs[i] : quark_pairs[i] ;
        jet_quarks.push([ q1 , q2 ]) ;
        jet_m0s.push(quark_pair_mass(q1, q2)) ;
      }
    }
    for(var i=0 ; i<jet_quarks.length ; i++){
      var success = false ;
      while(success==false){
        var jet = new jet_object(jet_quarks[i][0], jet_quarks[i][1], [r0.x, r0.y, r0.z], 0, 0, 0, remaining_mass*0.5) ;
        if(jet.is_valid==true){
          success = true ;
          jet.mother = this ;
          this.daughters.push(jet) ;
          remaining_mass -= jet.p4_0.m() ;
        }
      }
    }
    
    this.daughters = multibody_decay(this.pdgId, this.p4_0, this.daughters, 0) ;
    
    // This bit needs sorting into a heirachy
    for(var i=0 ; i<this.daughters.length ; i++){
      this.daughters[i].decay_recursive(this.daughters[i].m) ;
    }
    return this.daughters ;
  }
  
  this.post_decay_V0 = function(){
    // Recursively go through daughters, look for KS, KL, and Lambda particles
    // Then change their r0 values to take non-zero flight length into account
    recursively_displace(this, 0, 0, 0) ;
  }
  this.normalise_decays = function(){
    if(this.decays.length==0) return ;
    var total = 0 ;
    for(var i=0 ; i<this.decays.length ; i++){
      total += this.decays[i][0] ;
    }
    for(var i=0 ; i<this.decays.length ; i++){
      this.decays[i][0] /= total ;
    }
  }
  this.reconstruct = function(){
    
  }
}

function recursively_decay_daughters(particle){
  if(particle.daughters.length>0){
    for(var i=0 ; i<particle.daughters.length ; i++){
      recursively_decay_daughters(particle.daughters[i]) ;
    }
  }
  else if(particle.decays.length>0){
    particle.decay_top_level(particle.p4_0.m()) ;
  }
  else{
    return ;
  }
}

function recursively_boost_daughters(particle, b){
  particle.p4_0.boost(b) ;
  for(var i=0 ; i<particle.daughters.length ; i++){
    recursively_boost_daughters(particle.daughters[i], b) ;
  }
  return ;
}

function recursively_displace(particle, dx, dy, dz){
    for(var i=0 ; i<particle.daughters.length ; i++){
      var d = particle.daughters[i] ;
      d.r_0.x += dx ;
      d.r_0.y += dy ;
      d.r_0.z += dz ;
      
      var success = false ;
      var pdgId = Math.abs(d.pdgId) ;
      if(pdgId==  15) success = true ;
      if(pdgId== 310) success = true ;
      if(pdgId== 130) success = true ;
      if(pdgId==3122) success = true ;
      
      if(success){
        var rand = Math.random() ;
        var dt = (success) ? -d.tau*Math.log(rand) : 0 ;
        var bg = d.p4_0.bg() ;
        var c  = 3e8 ;
        var dr = bg*c*dt ;
        var dx = dr*d.p4_0.x/d.p4_0.r() ;
        var dy = dr*d.p4_0.y/d.p4_0.r() ;
        var dz = dr*d.p4_0.z/d.p4_0.r() ;
        d.r_decay = make_point(d.r_0.x+dx, d.r_0.y+dy, d.r_0.z+dz) ;
      }
      recursively_displace(d, dx, dy, dz) ;
  }
}

function multibody_decay(pdgId, p4, daughters, depth){
  if(daughters.length==0) return [] ;
  
  if(daughters.length==1){
    var m2 = daughters[0].p4_0.m2() ;
    var p2 = p4.x*p4.x+p4.y*p4.y+p4.z*p4.z ;
    var E  = Math.sqrt(m2+p2) ;
    daughters[0].p4_0.x = p4.x ;
    daughters[0].p4_0.y = p4.y ;
    daughters[0].p4_0.z = p4.z ;
    daughters[0].p4_0.t = E ;
    return daughters ;
  }
  
  // Sort daughters randomly
  var daughters_with_indices = [] ;
  for(var i=0 ; i<daughters.length ; i++){ daughters_with_indices.push([Math.random(),daughters[i]]) ; }
  daughters_with_indices.sort(function(a,b){ return a[0] < b[0] ; }) ;
  for(var i=0 ; i<daughters.length ; i++){ daughters[i] = daughters_with_indices[i][1] ; }
  
  var bv = p4.boostVector() ;
  var m = p4.m() ;
  var d = daughters.pop() ;
  
  // Choose a random momentum for the first daughter
  var mbar = 0 ;
  if(!d.p4_0) alert(pdgId + ' ' + d.pdgId) ;
  for(var i=0 ; i<daughters.length ; i++){
    if(!daughters[i].p4_0) alert(pdgId + ' ' + daughters[i].pdgId + ' = ' + daughters[i].pdgId) ;
    mbar += daughters[i].p4_0.m() ;
  }
  var mi = d.p4_0.m() ;
  var pmax = momentum_two_body_decay(m, mi, mbar) ;
  var p = (daughters.length==1) ? pmax : 0.9*Math.random()*pmax ;
  
  // Make the three vectors and boost the first daughter in one direction, and the rest in the other
  var p3 = random_threeVector(p) ;
  var Ei = Math.sqrt(d.m*d.m+p*p) ;
  d.p4_0.x = p3[0] ;
  d.p4_0.y = p3[1] ;
  d.p4_0.z = p3[2] ;
  d.p4_0.t = Ei ;
  var mu = Math.sqrt(Math.pow(p4.m()-Ei,2)-p*p) ;
  var Ebar = Math.sqrt(mu*mu+p*p) ;
  
  var p4_out = new fourVector() ;
  p4_out.x = -p3[0] ;
  p4_out.y = -p3[1] ;
  p4_out.z = -p3[2] ;
  p4_out.t = Math.sqrt(mu*mu+p*p) ;
  
  daughters = multibody_decay(-1, p4_out, daughters, depth+1) ;
  daughters.push(d) ;
  
  for(var i=0 ; i<daughters.length ; i++){
    daughters[i].p4_0 = daughters[i].p4_0.boost(bv) ;
  }
  return daughters ;
}

function m_from_particles(particles){
  var p4 = new fourVector() ;
  for(var i=0 ; i<particles.length ; i++){
    p4.x += particles.p4_0.x ;
    p4.y += particles.p4_0.y ;
    p4.z += particles.p4_0.z ;
    p4.t += particles.p4_0.t ;
  }
  return p4.m() ;
}

function random_boost(b){
  var phi_theta = random_phi_theta() ;
  var phi   = phi_theta[0] ;
  var theta = phi_theta[1] ;
  var p = b ;
  var E = 1 ;
  var p4 = new fourVector() ;
  p4.x = p*Math.sin(theta)*Math.cos(phi) ;
  p4.y = p*Math.sin(theta)*Math.sin(phi) ;
  p4.z = p*Math.cos(theta) ;
  p4.t = E ;
  var boost = p4.boostVector() ;
  return boost ;
}

function cauchy(x, m, w){
  return w/(Math.PI*(Math.pow(x-m,2)+w*w)) ;
}
function inverse_cauchy(y, m, w){
  var d = w/(Math.PI*y) - w*w ;
  if(d<0) d = -d ;
  var dm = Math.sqrt(d) ;
  if(Math.random()<0.5) dm = -dm ;
  return m + dm ;
}

function random_phi_theta(){
  var phi   = Math.random()*Math.PI*2 ;
  var theta = Math.acos(-1+2*Math.random()) ;
  return [phi,theta] ;
}
