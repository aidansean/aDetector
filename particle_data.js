function KS_object(r0){
  var par = new particle_object(497.6, 0, r0, false) ;
  par.color = kaon_color ;
  par.type = 'neutral_hadron' ;
  par.matter = 0 ;
  par.w = 1e-20 ;
  par.tau = 8.95e-11 ;
  par.pdgId = 310 ;
  par.decays = [
    [1.0,[211,-211]]
  ] ;
  par.normalise_decays() ;
  return par ;
}

function KL_object(r0){
  var par = new particle_object(497.6, 0, r0, false) ;
  par.color = kaon_color ;
  par.type = 'neutral_hadron' ;
  par.matter = 0 ;
  par.w = 1e-20 ;
  par.tau = 5.12e-8 ;
  par.pdgId = 130 ;
  par.decays = [
    [1.0,[211,-211,111]]
  ] ;
  return par ;
}

function K_object(q, r0){
  var par = new particle_object(494.7, q, r0, false) ;
  par.color = kaon_color ;
  par.type = 'charged_hadron' ;
  par.matter = -q ;
  par.w = 1e-20 ;
  par.pdgId = (q==1) ? -321 : 321 ;
  par.decays = [] ;
  par.normalise_decays() ;
  return par;
}

function K892_object(q, r0){
  var par = new particle_object(892, q, r0, false) ;
  par.color = kaon_color ;
  par.type = 'charged_hadron' ;
  par.matter = -q ;
  par.w = 1e-20 ;
  par.pdgId = (q==1) ? -323 : 323 ;
  par.decays = [
    [1, [321,111]]
  ] ;
  par.normalise_decays() ;
  return par;
}

function K892_0_object(q, r0){
  var par = new particle_object(892, 0, r0, false) ;
  par.color = kaon_color ;
  par.type = 'charged_hadron' ;
  par.matter = -q ;
  par.w = 1e-20 ;
  par.pdgId = (q==1) ? -313 : 313 ;
  par.decays = [
    [1, [321,-211]]
  ] ;
  par.normalise_decays() ;
  return par;
}

function D0_object(q, r0){
  var par = new particle_object(1865, 0, r0, true) ;
  par.color = generic_color ;
  par.type = 'neutral_hadron' ;
  par.matter = q ;
  par.w = 1e-20 ;
  par.tau = 4.1e-13 ;
  par.pdgId = (q==1) ? 421 : -421 ;
  par.decays = [ 
    [0.036, [ 321,-11,19]] ,
    [0.022, [ 321,-13,19]] ,
    [0.022, [ 313,-11,19]] ,
    [0.019, [ 313,-13,19]] ,
    [0.039, [-321,211]] ,
    [0.039, [ 310,111]] ,
    [0.10 , [ 130,111]] ,
    [0.028, [ 310,211,-211]] ,
    [0.108, [-321,213]] ,
    [0.011, [-321,211,111]] ,
    [0.081, [-321,211,211,-211]] ,
    [0.081, [-310,211,-211,111]] ,
    [0.042, [-321,211,211,-211,111]]
  ] ;
  par.normalise_decays() ;
  return par ;
}

function D_object(q, r0){
  var par = new particle_object(1869, q, r0, true) ;
  par.color = generic_color ;
  par.type = 'charged_hadron' ;
  par.matter = q ;
  par.w = 1e-20 ;
  par.tau = 1.04e-12 ;
  par.pdgId = (q==1) ? 411 : -411 ;
  par.decays = [ 
    [0.088, [310,-11,19]] ,
    [0.088, [310,-13,19]] ,
    [0.037, [313,-11,19]] ,
    [0.037, [313,-13,19]]  ,
    [0.0147, [ 310,211]] ,
    [0.0147, [ 130,211]] ,
    [0.09  , [-321,211,211]] ,
    [0.07  , [ 310,211,111]] ,
    [0.06  , [-321,211,211,111]] ,
    [0.031 , [ 310,211,211,-211]]
  ] ;
  par.normalise_decays() ;
  return par ;
}

function photon_object(r0){
  var par = new particle_object(0, 0, r0, false) ;
  par.color = photon_color ;
  par.type = 'photon' ;
  par.matter = 0 ;
  par.w = 0 ;
  par.pdgId = 22 ;
  par.decays = [] ;
  par.normalise_decays() ;
  return par ;
}

function pi_object(q, r0){
  var par = new particle_object(139.6, q, r0, false) ;
  par.color = pion_color ;
  par.type = 'charged_hadron' ;
  par.matter = q ;
  par.w = 1e-20 ;
  par.pdgId = (q==1) ? 211 : -211 ;
  par.decays = [] ;
  return par ;
}

function pi0_object(r0){
  var par = new particle_object(135.0, 0, r0, true) ;
  par.color = generic_color ;
  par.type = 'neutral_hadron' ;
  par.matter = 0 ;
  par.w = 1e-20 ;
  par.pdgId = 111 ;
  par.decays = [
    [0.99, [22,22]    ] ,
    [0.01, [11,-11,22]]
  ] ;
  par.normalise_decays() ;
  return par ;
}

function rho_object(q, r0){
  var par = new particle_object(770.0, q, r0, true) ;
  par.color = generic_color ;
  par.type = 'neutral_hadron' ;
  par.matter = q ;
  par.w = 150.0 ;
  par.pdgId = 113 ;
  par.decays = [
    [1.0, [211,111]]
  ] ;
  par.normalise_decays() ;
  return par ;
}

function rho0_object(r0){
  var par = new particle_object(770.0, 0, r0, true) ;
  par.color = generic_color ;
  par.type = 'neutral_hadron' ;
  par.matter = 0 ;
  par.w = 150.0 ;
  par.pdgId = 113 ;
  par.decays = [
    [1.0, [211,-211]]
  ] ;
  par.normalise_decays() ;
  return par ;
}

function electron_object(q, r0){
  var par = new particle_object(0.511, q, r0, false) ;
  par.color = electron_color ;
  par.type = 'electron' ;
  par.matter = -q ;
  par.w = 1e-20 ;
  par.pdgId = (q==1) ? -11 : 11 ;
  par.decays = [] ;
  par.normalise_decays() ;
  return par ;
}

function muon_object(q, r0){
  var par = new particle_object(105.7, q, r0, false) ;
  par.color = muon_color ;
  par.type = 'muon' ;
  par.matter = -q ;
  par.w = 1e-20 ;
  par.pdgId = (q==1) ? -13 : 13 ;
  par.decays = [] ;
  par.normalise_decays() ;
  return par ;
}

function tau_object(q, r0){
  var par = new particle_object(105.7, q, r0, false) ;
  par.color = muon_color ;
  par.type = 'tau' ;
  par.matter = -q ;
  par.w = 1e-20 ;
  par.tau = 2.91e-13 ;
  par.pdgId = (q==1) ? -15 : 15 ;
  par.decays = [
  [0.174, [11, 19, -19]] ,
  [0.178, [13, 19, -19]] ,
  [0.108, [211, -19]] ,
  [0.007, [321, -19]] ,
  [0.255, [213, -19]] ,
  [0.093, [211, 111, 111, -19]] ,
  [0.090, [211, 211, -211, -19]] ,
  [0.045, [211, 211, -211, 111, -19]]
  ] ;
  par.normalise_decays() ;
  return par ;
}

function virtual_photon_object(r0, m){
  var par = new particle_object(m, 0, r0, true) ;
  par.color = generic_color ;
  par.type = 'photon' ;
  par.matter = 0 ;
  par.w = 1e-20 ;
  par.pdgId = 0 ;
  par.decays = [
  [0.25, [421, -421]] ,
  [0.25, [411, -411]] ,
  [0.25, [15,   -15]] ,
  [0.25, [13,   -13]] 
  ] ;
  par.normalise_decays() ;
  return par ;
}

function nu_object(q, r0){
  var par = new particle_object(1e-6, 0, r0, false) ;
  par.color = neutrino_color ;
  par.type = 'neutrino' ;
  par.matter = q ;
  par.w = 1e-20 ;
  par.pdgId = (q==1) ? 19 : -19 ;
  par.decays = [] ;
  return par ;
}


function Jpsi_object(r0){
  var par = new particle_object(3097, 0, r0, true) ;
  par.color = generic_color ;
  par.type = 'ephemeral_hadron' ;
  par.m0 = 3097 ;
  par.w  = 0.093 ;
  par.matter = 0 ;
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
  par.normalise_decays() ;
  return par ;
}
