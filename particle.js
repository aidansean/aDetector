function particle_object(E, q, m){
  // Intrinsic properties
  this.m = m ;
  this.q = q ;
  
  // r and p values
  this.r_0  = make_point(0,0,0) ;
  this.p4_0 = new fourVector() ;
  
  var phi_theta = random_phi_theta() ;
  var phi   = phi_theta[0] ;
  var theta = phi_theta[1] ;
  
  this.p = Math.sqrt(E*E - this.m*this.m) ;
  this.p4_0.x = this.p*Math.sin(theta)*Math.cos(phi) ;
  this.p4_0.y = this.p*Math.sin(theta)*Math.sin(phi) ;
  this.p4_0.z = this.p*Math.cos(theta) ;
  this.p4_0.t = E ;
  
  // Detector interaction
  this.tracker_hits = [] ;
  this.ecal_blocks  = [] ;
  this.hcal_blocks  = [] ;
  
  this.make_complement = function(){
    var par = new particle_object(this.p4_0.t, -this.q, this.m) ;
    par.p4_0.x = -this.p4_0.x ;
    par.p4_0.y = -this.p4_0.y ;
    par.p4_0.z = -this.p4_0.z ;
    return par ;
  }
  
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
}

function electron_object(E,q){
  this.name = 'electron' ;
  this.m = 0.511 ;
  this.w = 1e-20 ;
  this.par = new particle_object(E, q, this.m) ;
  this.decays = [] ;
}

function muon_object(E,q){
  this.name = 'muon' ;
  this.m = 105.7 ;
  this.w = 1e-20 ;
  this.par = new particle_object(E, q, this.m) ;
  this.decays = [] ;
}

function Jpsi_object(){
  this.m  = 3097 ;
  this.w  = 0.093 ;
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
      l_plus  = new electron_object(0.5*m,  1) ;
      l_minus = new electron_object(0.5*m, -1) ;
    }
    else{
      l_plus  = new muon_object(0.5*m,  1) ;
      l_minus = new muon_object(0.5*m, -1) ;
    }
    l_minus.par = l_plus.par.make_complement() ;
    
    var beta = 0.9*Math.random() ;
    var boost = random_boost(beta) ;
    l_plus.par.p4_0  = l_plus.par .p4_0.boost(boost) ;
    l_minus.par.p4_0 = l_minus.par.p4_0.boost(boost) ;
    return [l_plus,l_minus] ;
  }
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
      if(false){
        var x = lower + (upper-lower)*Math.random() ;
        var y = y_max*Math.random() ;
        if(y<cauchy(x,this.m,this.w)){
          this.masses.push(x) ;
          counter++ ;
        }
      }
      else{
        var m = inverse_cauchy(Math.random()/(Math.PI*this.w), this.m, this.w) ;
        if(!isNaN(m)){
          counter++ ;
          this.masses.push(m) ;
        }
      }
    }
  }
  this.make_ll_pair = function(m){
    var l_plus  = null ;
    var l_minus = null ;
    if(Math.random()<0.5){
      l_plus  = new electron_object(0.5*m,  1) ;
      l_minus = new electron_object(0.5*m, -1) ;
    }
    else{
      l_plus  = new muon_object(0.5*m,  1) ;
      l_minus = new muon_object(0.5*m, -1) ;
    }
    l_minus.par = l_plus.par.make_complement() ;
    
    var phi_theta = random_phi_theta() ;
    var phi   = phi_theta[0] ;
    var theta = phi_theta[1] ;
    var p  = -3*Math.log(Math.random()) ;
    var p4 = new fourVector() ;
    p4.x = p*Math.sin(theta)*Math.cos(phi) ;
    p4.y = p*Math.sin(theta)*Math.sin(phi) ;
    p4.z = p*Math.cos(theta) ;
    var boost = p4.boostVector() ;
    l_plus.par.p4_0.boost(boost) ;
    l_minus.par.p4_0.boost(boost) ;
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
