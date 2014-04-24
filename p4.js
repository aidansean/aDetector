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
  this.r2 = function(){ return Math.pow(this.x,2) + Math.pow(this.y,2) + Math.pow(this.z,2) ; }
  this.r  = function(){ return Math.sqrt( this.r2() ) ; }
  this.phi   = function(){ return Math.atan2(this.y,this.x) ; }
  this.theta = function(){ return Math.acos(this.z/this.r) ; }
  this.eta   = function(){ return -Math.log(Math.tan(this.theta()*0.5)) ; }
  
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
  this.angle_vector = function(p3_in){
    return Math.acos(this.dot(p3_in)/(this.r()*p3_in.r())) ;
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
  this.r2 = function(){ return Math.pow(this.x,2) + Math.pow(this.y,2) + Math.pow(this.z,2) ; }
  this.r  = function(){ return Math.sqrt( this.r2() ) ; }
  this.phi   = function(){ return Math.atan2(this.y,this.x) ; }
  this.theta = function(){ return Math.acos(this.z/this.r) ; }
  this.eta   = function(){ return -Math.log(Math.tan(this.theta()*0.5)) ; }
  
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
  this.pT = function(){ return Math.sqrt(this.x*this.x+this.y*this.y) ; }
  this.p  = function(){ return Math.sqrt( Math.pow(this.px(),2) + Math.pow(this.py(),2) + Math.pow(this.pz(),2) ) ; }
  this.E  = function(){ return this.t ; }
  this.m2 = function(){ return Math.pow(this.E(),2) - Math.pow(this.p(),2) ; }
  this.m  = function(){
    var m2 = this.m2() ;
    if(m2<0) return -Math.sqrt(-m2) ;
    return Math.sqrt(m2) ;
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
    var p4_out = new fourVector() ;
    var b2 = boost.r2() ;
    var g  = 1.0/Math.sqrt(1-b2) ;
    var g2 = (b2>0) ? (g-1)/b2 : 0 ;
    var bp = boost.dot(this.p3()) ;
    p4_out.x = this.x + g2*bp*boost.x + g*boost.x*this.t ;
    p4_out.y = this.y + g2*bp*boost.y + g*boost.y*this.t ;
    p4_out.z = this.z + g2*bp*boost.z + g*boost.z*this.t ;
    p4_out.t = this.t*g + g*bp ;
    return p4_out ;
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
    string += 'x  = ' + this.x + '\n' ;
    string += 'y  = ' + this.y + '\n' ;
    string += 'z  = ' + this.z + '\n' ;
    string += 't  = ' + this.t + '\n' ;
    string += 'm2 = ' + this.m2() + '\n' ;
    alert(string) ;
  }
}


