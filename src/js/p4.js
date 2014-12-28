function make_point(x,y,z){
  var p = new threeVector() ;
  p.x = x ; p.y = y ; p.z = z ;
  return p ;
}

var c = 3e8 ;

function threeVector(){
  // Euclidean representation
  this.x = 0 ;
  this.y = 0 ;
  this.z = 0 ;
  
  // Supplemental representation
  this.r2    = function(){ return pow(this.x,2) + pow(this.y,2) + pow(this.z,2) ; }
  this.r     = function(){ return sqrt( this.r2() ) ; }
  this.d0    = function(){ return sqrt( pow(this.x,2) + pow(this.y,2) ) ; }
  this.phi   = function(){ return atan2(this.y,this.x) ; }
  this.theta = function(){ return acos(this.z/this.r) ; }
  this.eta   = function(){ return -log(tan(this.theta()*0.5)) ; }
  
  this.add = function(p3_in, dir){
    var d = 1 ;
    if(dir){ d = dir ; }
    var p3_out = new threeVector() ;
    p3_out.x = this.x + d*p3_in.x ;
    p3_out.y = this.y + d*p3_in.y ;
    p3_out.z = this.z + d*p3_in.z ;
    return p3_out ;
  }
  this.multiply = function(a){
    var p3_out = new threeVector() ;
    p3_out.x = this.x*a ;
    p3_out.y = this.y*a ;
    p3_out.z = this.z*a ;
    return p3_out ;
  }
  this.dot = function(p3_in){
    return this.x*p3_in.x + this.y*p3_in.y + this.z*p3_in.z ;
  }
  this.cross = function(p3_in){
    var p3_out = new threeVector() ;
    p3_out.x = this.y*p3_in.z - this.z*p3_in.y ;
    p3_out.y = this.z*p3_in.x - this.x*p3_in.z ;
    p3_out.z = this.x*p3_in.y - this.y*p3_in.x ;
    return p3_out ;
  }
  this.cos_angle_vector = function(p3_in){
    return this.dot(p3_in)/(this.r()*p3_in.r()) ;
  }
  this.angle_vector = function(p3_in){
    return acos(this.dot(p3_in)/(this.r()*p3_in.r())) ;
  }
  this.alert = function(){
    var string = '' ;
    string += 'x  = ' + this.x + '\n' ;
    string += 'y  = ' + this.y + '\n' ;
    string += 'z  = ' + this.z + '\n' ;
    alert(string) ;
  }
}

function fourVector(){
  // Euclidean representation
  this.x = 0 ;
  this.y = 0 ;
  this.z = 0 ;
  this.t = 0 ;
  this.p3_ = new threeVector() ;
  
  // Supplemental representation
  this.r2    = function(){ return pow(this.x,2) + pow(this.y,2) + pow(this.z,2) ; }
  this.r     = function(){ return sqrt( this.r2() ) ; }
  this.phi   = function(){ return atan2(this.y,this.x) ; }
  this.theta = function(){ return acos(this.z/this.r) ; }
  this.eta   = function(){ return -log(tan(this.theta()*0.5)) ; }
  
  this.p3 = function(){
    // Update and return the three vector (rather than making a new three vector)
    this.p3_.x = this.x ;
    this.p3_.y = this.y ;
    this.p3_.z = this.z ;
    return this.p3_ ;
  }
  
  // Momentum-energy-mass representation
  this.px = function(){ return this.x ; }
  this.py = function(){ return this.y ; }
  this.pz = function(){ return this.z ; }
  this.pT = function(){ return sqrt(this.x*this.x+this.y*this.y) ; }
  this.p2 = function(){ return pow(this.px(),2) + pow(this.py(),2) + pow(this.pz(),2) ; }
  this.p  = function(){ return sqrt( this.p2() ) ; }
  this.E  = function(){ return this.t ; }
  this.m2 = function(){ return pow(this.E(),2) - pow(this.p(),2) ; }
  this.m  = function(){
    var m2 = this.m2() ;
    if(m2<0) return -sqrt(-m2) ;
    return sqrt(m2) ;
  }
  this.g  = function(){ return   this.E()/this.m() ; }
  this.b  = function(){ return   this.p()/this.E() ; }
  this.bg = function(){ return   this.p()/this.m() ; }
  this.vx = function(){ return c*this.px()/(this.m()*this.g()) ; }
  this.vy = function(){ return c*this.py()/(this.m()*this.g()) ; }
  this.vz = function(){ return c*this.pz()/(this.m()*this.g()) ; }
  
  this.add = function(p4_in){
    var p4_out = new fourVector() ;
    p4_out.x = this.x + p4_in.x ;
    p4_out.y = this.y + p4_in.y ;
    p4_out.z = this.z + p4_in.z ;
    p4_out.t = this.t + p4_in.t ;
    return p4_out ;
  }
  this.boost = function(boost, dir){
    if(dir){
      if(dir==-1){
        boost.x = -boost.x ;
        boost.y = -boost.y ;
        boost.z = -boost.z ;
      }
    }
    // Inspired by the TLorentzVector method
    var b2 = boost.r2() ;
    var g  = 1.0/sqrt(1-b2) ;
    var g2 = (b2>0) ? (g-1)/b2 : 0 ;
    var bp = boost.dot(this.p3()) ;
    this.x = this.x + g2*bp*boost.x + g*boost.x*this.t ;
    this.y = this.y + g2*bp*boost.y + g*boost.y*this.t ;
    this.z = this.z + g2*bp*boost.z + g*boost.z*this.t ;
    this.t = this.t*g + g*bp ;
    return this ;
  }
  this.boostVector = function(){
    var boost = new threeVector() ;
    boost.x = this.x/this.t ;
    boost.y = this.y/this.t ;
    boost.z = this.z/this.t ;
    return boost ;
  }
  this.alert = function(){
    var string = '' ;
    string += 'r  = ' + this.r()  + '\n' ;
    string += 'x  = ' + this.x    + '\n' ;
    string += 'y  = ' + this.y    + '\n' ;
    string += 'z  = ' + this.z    + '\n' ;
    string += 't  = ' + this.t    + '\n' ;
    string += 'm  = ' + this.m()  + '\n' ;
    string += 'm2 = ' + this.m2() + '\n' ;
    alert(string) ;
  }
}

function momentum_two_body_decay(M, m1, m2){
  return sqrt((M*M-(m1+m2)*(m1+m2))*(M*M-(m1-m2)*(m1-m2)))/(2*M) ;
}

function random_threeVector(p){
  var phi_theta = random_phi_theta() ;
  var phi   = phi_theta[0] ;
  var theta = phi_theta[1] ;
  
  var px = p*sin(theta)*cos(phi) ;
  var py = p*sin(theta)*sin(phi) ;
  var pz = p*cos(theta) ;
  return[px,py,pz] ;
}

function rotate_theta_phi(v, theta, phi){
  var v3_out = new threeVector() ;
  var ct = cos(theta) ;
  var st = sin(theta) ;
  var cp = cos(phi) ;
  var sp = sin(phi) ;
  v3_out.x =  ct*cp*v.x + ct*sp*v.y + st*v.z ;
  v3_out.y = -   sp*v.x +    cp*v.y          ;
  v3_out.z = -st*cp*v.x - st*sp*v.y + ct*v.z ;
  return v3_out ;
}

function random_gaussian(sigma){
  return sqrt( -2*sigma*log(random() ) ) ;
}

function random_boost(b){
  var phi_theta = random_phi_theta() ;
  var phi   = phi_theta[0] ;
  var theta = phi_theta[1] ;
  var p = b ;
  var E = 1 ;
  var p4 = new fourVector() ;
  p4.x = p*sin(theta)*cos(phi) ;
  p4.y = p*sin(theta)*sin(phi) ;
  p4.z = p*cos(theta) ;
  p4.t = E ;
  var boost = p4.boostVector() ;
  return boost ;
}

function cauchy(x, m, w){
  return w*w/((x-m)*(x-m)+w*w) ;
}
function inverse_cauchy(y, m, w){
  var d = w/(pi*y) - w*w ;
  if(d<0) d = -d ;
  var dm = sqrt(d) ;
  if(random()<0.5) dm = -dm ;
  return m + dm ;
}

function random_phi_theta(){
  var phi   = random()*pi*2 ;
  var theta = acos(-1+2*random()) ;
  return [phi,theta] ;
}

function random_simple_truncated_cauchy(m, w, x_min, x_max){
  if(w<1e-3) return m ;
  var y_x_min = atan((x_min-m)/w) ;
  var y_x_max = atan((x_max-m)/w) ;
  var y_min = min(y_x_min,y_x_max) ;
  var y_max = max(y_x_min,y_x_max) ;
  var y = y_min + random()*(y_max-y_min) ;
  var x = m + w*tan(y) ;
  return x ;
}
function integral_Cauchy(x, m, w){ return atan((x-m)/w) ; }
