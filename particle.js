//Colors
var generic_color  = '255,255,255' ;
var kaon_color     = '255,  0,255' ;
var pion_color     = '255,100,255' ;
var photon_color   = '255,100,100' ;
var electron_color = '  0,255,255' ;
var muon_color     = '  0,255,  0' ;

function particle_object(m, q, r0){
  // Intrinsic properties
  this.q = q ;
  this.m = m ;
  
  // r and p values
  this.r_0  = make_point(r0[0],r0[1],r0[2]) ;
  this.p4_0 = new fourVector() ;
  
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
  
  this.add_tracker_hit = function(x, y, z, r){
    // First put the hit in the layer
    var r_tmp = Math.sqrt(x*x+y*y) ;
    var ratio = r_tmp/r ;
    x *= ratio ;
    y *= ratio ;
    
    this.tracker_hits.push(make_point(x, y, z)) ;
  }
  this.add_ecal_block = function(x, y, z, cell){
    this.ecal_cells.push([make_point(x, y, z),cell]) ;
  }
  this.add_hcal_block = function(x, y, z, cell){
    this.hcal_cells.push([make_point(x, y, z),cell]) ;
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
    return pdgIds ;
  }
  this.decay_top_level = function(m){
    this.daughters = [] ;
    this.decay_recurisive(m) ;
    this.post_decay_V0() ;
    return this.daughters ;
  }
  this.decay_recurisive = function(m){
    //if(this.pdgId==310) alert(this.decays) ;
    if(this.decays.length==0) return [] ;
    var pdgIds = this.choose_random_decay() ;
    if(pdgIds==null) return ;
    for(var i=0 ; i<pdgIds.length ; i++){
      var r0 = this.r_0 ;
      var particle = make_particle(pdgIds[i], [r0.x, r0.y, r0.z]) ;
      if(particle){
        particle.mother = this ;
        this.daughters.push(particle) ;
      }
    }
    this.daughters = multibody_decay(this.p4_0, this.daughters) ;
    for(var i=0 ; i<this.daughters.length ; i++){
      this.daughters = this.daughters.concat(this.daughters[i].decay_recurisive()) ;
    }
    return this.daughters ;
  }
  
  this.post_decay_V0 = function(){
    // Recursively go through daughters, look for KS, KL, and Lambda particles
    // Then change their r0 values to take non-zero flight length into account
    for(var i=0 ; i<this.daughters.length ; i++){
      var d = this.daughters[i] ;
      var success = false ;
      if(d.pdgId== 310) success = true ;
      if(d.pdgId== 130) success = true ;
      if(d.pdgId==3122) success = true ;
        
      var dt = (success)? -d.tau*Math.log(Math.random()) : 0 ;
      var bg = d.p4_0.bg() ;
      var c  = 3e8 ;
      var dr = bg*c*dt ;
      var dx = dr*d.p4_0.x/d.p4_0.r() ;
      var dy = dr*d.p4_0.y/d.p4_0.r() ;
      var dz = dr*d.p4_0.z/d.p4_0.r() ;
      if(success) d.r_decay = make_point(d.r_0.x+dx, d.r_0.y+dy, d.r_0.z+dz) ;
      d.recursively_displace(dx, dy, dz) ;
    }
  }
  this.recursively_displace = function(dx, dy, dz){
    for(var i=0 ; i<this.daughters.length ; i++){
      this.daughters[i].r_0.x += dx ;
      this.daughters[i].r_0.y += dy ;
      this.daughters[i].r_0.z += dz ;
      this.daughters[i].recursively_displace(dx, dy, dz) ;
    }
  }
}

function multibody_decay(p4, daughters){
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
  for(var i=0 ; i<daughters.length ; i++){
    daughters_with_indices.push([Math.random(),daughters[i]]) ;
  }
  daughters_with_indices.sort(function(a,b){ return a[0] < b[0] ; }) ;
  var bv = p4.boostVector() ;
  for(var i=0 ; i<daughters.length ; i++){
    daughters[i] = daughters_with_indices[i][1] ;
  }
  
  var m = p4.m() ;
  var d = daughters.pop() ;
  
  // Choose a random momentum for the first daughter
  var mbar = 0 ;
  for(var i=0 ; i<daughters.length ; i++){ mbar += daughters[i].p4_0.m() ; }
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
  daughters = multibody_decay(p4_out, daughters) ;
  daughters.push(d) ;
  
  var px = 0 ;
  var py = 0 ;
  var pz = 0 ;
  var E  = 0 ;
  for(var i=0 ; i<daughters.length ; i++){
    daughters[i].p4_0 = daughters[i].p4_0.boost(bv) ;
    px += daughters[i].p4_0.x ;
    py += daughters[i].p4_0.y ;
    pz += daughters[i].p4_0.z ;
    E  += daughters[i].p4_0.t ;
  }
  var m = Math.sqrt(E*E-px*px-py*py-pz*pz) ;
  return daughters ;
}

function make_particle(pdgId, r0){
  switch(pdgId){
    // Leptons
    case   11: return new electron_object(-1, r0) ; break ;
    case  -11: return new electron_object( 1, r0) ; break ;
    case   13: return new     muon_object(-1, r0) ; break ;
    case  -13: return new     muon_object( 1, r0) ; break ;
    
    // Bosons
    case   22: return new   photon_object(    r0) ; break ;
    
    // Light mesons
    case  211: return new       pi_object( 1, r0) ; break ;
    case -211: return new       pi_object(-1, r0) ; break ;
    case  111: return new      pi0_object(    r0) ; break ;
    case  113: return new     rho0_object(    r0) ; break ;
    
    // Kaons
    case  321: return new        K_object(-1, r0) ; break ;
    case -321: return new        K_object( 1, r0) ; break ;
    case  310: return new       KS_object(    r0) ; break ;
    case  130: return new       KL_object(    r0) ; break ;
    
    // Charmed mesons
    case  421: return new       D0_object( 1, r0) ; break ;
    case -421: return new       D0_object(-1, r0) ; break ;
    case  411: return new        D_object( 1, r0) ; break ;
    case -411: return new        D_object(-1, r0) ; break ;
    
    // Charmonium
    case  443: return new     JPsi_object(    r0) ; break ;
    default : return null ; break ;
  }
}

function KS_object(r0){
  var par = new particle_object(497.6, 0, r0) ;
  par.color = kaon_color ;
  par.type = 'neutral_hadron' ;
  par.w = 1e-20 ;
  par.tau = 8.95e-11 ;
  par.pdgId = 310 ;
  par.decays = [
    [1.0,[211,-211]]
  ] ;
  return par ;
}

function KL_object(r0){
  var par = new particle_object(497.6, 0, r0) ;
  par.color = kaon_color ;
  par.type = 'neutral_hadron' ;
  par.w = 1e-20 ;
  par.tau = 5.12e-8 ;
  par.pdgId = 130 ;
  par.decays = [
    [1.0,[211,-211,111]]
  ] ;
  return par ;
}

function K_object(q, r0){
  var par = new particle_object(494.7, q, r0) ;
  par.color = kaon_color ;
  par.type = 'charged_hadron' ;
  par.w = 1e-20 ;
  par.pdgId = (q==1) ? -321 : 321 ;
  par.decays = [] ;
  return par;
}

function D0_object(q, r0){
  var par = new particle_object(1865, 0, r0) ;
  par.color = generic_color ;
  par.type = 'neutral_hadron' ;
  par.w = 1e-20 ;
  par.pdgId = (q==1) ? 421 : -421 ;
  par.decays = [ 
    [1.5, [321,-211]]
  ] ;
  return par ;
}

function D_object(q, r0){
  var par = new particle_object(1869, q, r0) ;
  par.color = generic_color ;
  par.type = 'charged_hadron' ;
  par.w = 1e-20 ;
  par.pdgId = (q==1) ? 411 : -411 ;
  par.decays = [ 
    [1.5, [310,211]] ,
    [0.5, [321,-211,211]] ,
    [0.5, [321,-211,211,111]]
  ] ;
  return par ;
}

function photon_object(r0){
  var par = new particle_object(0, 0, r0) ;
  par.color = photon_color ;
  par.type = 'photon' ;
  par.w = 0 ;
  par.pdgId = 22 ;
  par.decays = [] ;
  return par ;
}

function pi_object(q, r0){
  var par = new particle_object(139.6, q, r0) ;
  par.color = pion_color ;
  par.type = 'charged_hadron' ;
  par.w = 1e-20 ;
  par.pdgId = (q==1) ? 211 : -211 ;
  par.decays = [] ;
  return par ;
}

function pi0_object(r0){
  var par = new particle_object(135.0, 0, r0) ;
  par.color = generic_color ;
  par.type = 'neutral_hadron' ;
  par.w = 1e-20 ;
  par.pdgId = 111 ;
  par.decays = [
    //[1.01, [11,-11,22]] ,
    [0.99, [22,22]    ] ,
    [0.01, [11,-11,22]]
  ] ;
  return par ;
}

function rho0_object(r0){
  var par = new particle_object(770.0, 0, r0) ;
  par.color = generic_color ;
  par.type = 'neutral_hadron' ;
  par.w = 150.0 ;
  par.pdgId = 113 ;
  par.decays = [
    [1.5, [211,-211]]
  ] ;
  return par ;
}

function electron_object(q, r0){
  var par = new particle_object(0.511, q, r0) ;
  par.color = electron_color ;
  par.type = 'electron' ;
  par.w = 1e-20 ;
  par.pdgId = (q==1) ? -11 : 11 ;
  par.decays = [] ;
  return par ;
}

function muon_object(q, r0){
  var par = new particle_object(105.7, q, r0) ;
  par.color = muon_color ;
  par.type = 'muon' ;
  par.w = 1e-20 ;
  par.pdgId = (q==1) ? -13 : 13 ;
  par.decays = [] ;
  return par ;
}

function Jpsi_object(r0){
  var par = new particle_object(3097, 0, r0) ;
  par.color = generic_color ;
  par.type = 'ephemeral_hadron' ;
  par.m0 = 3097 ;
  par.w  = 0.093 ;
  par.y0 = cauchy(this.m, this.m, this.w) ;
  par.pdgId = 443 ;
  par.make_random_masses = function(n, lower, upper){
    this.masses = [] ;
    var counter = 0 ;
    var y_max = cauchy(this.m, this.m, this.w) ;
    while(counter<n){
      var m = inverse_cauchy(Math.random()/(Math.PI*this.w), this.m, this.w) ;
      if(!isNaN(m)){
        counter++ ;
        this.masses.push(m) ;
      }
    }
  }
  par.decays = [
    [0.5, [11,-11]] ,
    [0.5, [13,-13]]
  ] ;
  return par ;
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

function ZBoson_object(){
  this.m  = 91.2e0 ;
  this.w  = 2.5e0 ;
  this.y0 = cauchy(this.m, this.m, this.w) ;
  this.make_random_masses = function(n, lower, upper){
    this.masses = [] ;
    var counter = 0 ;
    var y_max = cauchy(this.m, this.m, this.w) ;
    while(counter<n){
      var m = inverse_cauchy(Math.random()/(Math.PI*this.w), this.m, this.w) ;
      if(!isNaN(m)){
        counter++ ;
        this.masses.push(m) ;
      }
    }
  }
  this.make_ll_pair = function(m){
    var l_plus  = null ;
    var l_minus = null ;
    if(Math.random()<0.5){
      l_plus  = new electron_object( 1) ;
      l_minus = new electron_object(-1) ;
    }
    else{
      l_plus  = new muon_object( 1) ;
      l_minus = new muon_object(-1) ;
    }
    var p = momentum_two_body_decay(m, l_plus.m, l_minus.m) ;
    var pxyz = random_threeVector(p) ;
    l_plus.p4_0.x = pxyz[0] ; l_minus.p4_0.x = -pxyz[0] ;
    l_plus.p4_0.y = pxyz[1] ; l_minus.p4_0.y = -pxyz[1] ;
    l_plus.p4_0.z = pxyz[2] ; l_minus.p4_0.z = -pxyz[2] ;
    
    var beta = 0.9*Math.random() ;
    var boost = random_boost(beta) ;
    l_plus.p4_0  = l_plus.par .p4_0.boost(boost) ;
    l_minus.p4_0 = l_minus.p4_0.boost(boost) ;
    return [l_plus,l_minus] ;
  }
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
