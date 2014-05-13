function BaBar_trigger_object(){
  this.analyse_particles = function(particles){ return true ; } // A very efficient trigger!
}

function gg_trigger_object(){
  this.analyse_particles = function(particles){
    var n_g = 0 ;
    for(var i=0 ; i<particles.length ; i++){
      if(abs(particles[i].pdgId)==22) n_g++ ;
    }
    return (n_g==2) ;
  }
}

function mu_trigger_object(){
  this.analyse_particles = function(particles){
    for(var i=0 ; i<particles.length ; i++){
      if(abs(particles[i].pdgId)==13) return true ;
    }
    return false ;
  }
}

function mu_mu_trigger_object(){
  this.analyse_particles = function(particles){
    var n_mu_p = 0 ;
    var n_mu_m = 0 ;
    for(var i=0 ; i<particles.length ; i++){
      if(particles[i].pdgId== 13) n_mu_m++ ;
      if(particles[i].pdgId==-13) n_mu_p++ ;
    }
    return (n_mu_m>0 && n_mu_p>0) ;
  }
}

function e_e_trigger_object(){
  this.analyse_particles = function(particles){
    var n_e_p = 0 ;
    var n_e_m = 0 ;
    for(var i=0 ; i<particles.length ; i++){
      if(particles[i].pdgId== 11) n_e_m++ ;
      if(particles[i].pdgId==-11) n_e_p++ ;
    }
    return (n_e_m>0 && n_e_p>0) ;
  }
}

function e_mu_trigger_object(){
  this.analyse_particles = function(particles){
    var has_e  = false ;
    var has_mu = false ;
    for(var i=0 ; i<particles.length ; i++){
      if(abs(particles[i].pdgId)==11) has_e  = true ;
      if(abs(particles[i].pdgId)==13) has_mu = true ;
    }
    return (has_e && has_mu) ;
  }
}

function e_OR_mu_trigger_object(){
  this.analyse_particles = function(particles){
    for(var i=0 ; i<particles.length ; i++){
      if(abs(particles[i].pdgId)==11) return true ;
      if(abs(particles[i].pdgId)==13) return true ;
    }
    return false ;
  }
}

function K_pi_trigger_object(){
  this.analyse_particles = function(particles){
    var has_K  = false ;
    var has_pi = false ;
    for(var i=0 ; i<particles.length ; i++){
      if(abs(particles[i].pdgId)==321 && particles[i].p4_0.p()>50) has_K  = true ;
      if(abs(particles[i].pdgId)==211 && particles[i].p4_0.p()>50) has_pi = true ;
    }
    return (has_K && has_pi) ;
  }
}

function K_K_trigger_object(){
  this.analyse_particles = function(particles){
    var has_Kp = false ;
    var has_Km = false ;
    for(var i=0 ; i<particles.length ; i++){
      if(particles[i].pdgId== 321 && particles[i].p4_0.p()>50) has_Kp  = true ;
      if(particles[i].pdgId==-321 && particles[i].p4_0.p()>50) has_Km = true ;
    }
    return (has_Kp && has_Km) ;
  }
}

function K_K_mu_trigger_object(){
  this.analyse_particles = function(particles){
    var has_Kp = false ;
    var has_Km = false ;
    var has_mu = false ;
    for(var i=0 ; i<particles.length ; i++){
      var pdgId = particles[i].pdgId ;
      if(pdgId== 321 && particles[i].p4_0.p()>250) has_Kp = true ;
      if(pdgId==-321 && particles[i].p4_0.p()>250) has_Km = true ;
      if(abs(pdgId)==13) has_mu = true ;
    }
    return (has_Kp && has_Km && has_mu) ;
  }
}

