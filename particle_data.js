function make_particle(pdgId, r0){
  switch(pdgId){
    // Leptons
    case   11: return new electron_object(-1, r0) ; break ;
    case  -11: return new electron_object( 1, r0) ; break ;
    case   13: return new     muon_object(-1, r0) ; break ;
    case  -13: return new     muon_object( 1, r0) ; break ;
    case   15: return new      tau_object(-1, r0) ; break ;
    case  -15: return new      tau_object( 1, r0) ; break ;
    case   19: return new       nu_object(-1, r0) ; break ;
    case  -19: return new       nu_object( 1, r0) ; break ;
    
    // Bosons
    case  -22:
    case   22: return new   photon_object(    r0) ; break ;
    
    // Light mesons
    case  211: return new       pi_object( 1, r0) ; break ;
    case -211: return new       pi_object(-1, r0) ; break ;
    case -111:
    case  111: return new      pi0_object(    r0) ; break ;
    case -113:
    case  113: return new     rho0_object(    r0) ; break ;
    case  213: return new      rho_object( 1, r0) ; break ;
    case -213: return new      rho_object(-1, r0) ; break ;
    case -221:
    case  221: return new      eta_object(    r0) ; break ;
    case -331:
    case  331: return new     etap_object(    r0) ; break ;
    case -223:
    case  223: return new    omega_object(    r0) ; break ;
    case -333:
    case  333: return new      phi_object(    r0) ; break ;
    
    // Kaons
    case  321: return new        K_object( 1, r0) ; break ;
    case -321: return new        K_object(-1, r0) ; break ;
    case -310:
    case  310: return new       KS_object(    r0) ; break ;
    case -130:
    case  130: return new       KL_object(    r0) ; break ;
    
    case  323: return new     K892_object( 1, r0) ; break ;
    case -323: return new     K892_object(-1, r0) ; break ;
    case  313: return new   K892_0_object( 1, r0) ; break ;
    case -313: return new   K892_0_object(-1, r0) ; break ;
    
    case  311:
    case -311:
      if(random()<0.5){ return new KS_object(r0) ; break ; }
      return new KL_object(r0) ; break ;
    
    // Charmed mesons
    case  411: return new        D_object( 1, r0) ; break ;
    case -411: return new        D_object(-1, r0) ; break ;
    case  421: return new       D0_object( 1, r0) ; break ;
    case -421: return new       D0_object(-1, r0) ; break ;
    case  431: return new       Ds_object( 1, r0) ; break ;
    case -431: return new       Ds_object(-1, r0) ; break ;
    
    case  413: return new    DStar_object( 1, r0) ; break ;
    case -413: return new    DStar_object(-1, r0) ; break ;
    case  423: return new   D0Star_object( 1, r0) ; break ;
    case -423: return new   D0Star_object(-1, r0) ; break ;
    case  433: return new   DsStar_object( 1, r0) ; break ;
    case -433: return new   DsStar_object(-1, r0) ; break ;
    
    // Bottom mesons
    case  511: return new       B0_object( 1, r0) ; break ;
    case -511: return new       B0_object(-1, r0) ; break ;
    case  521: return new        B_object( 1, r0) ; break ;
    case -521: return new        B_object(-1, r0) ; break ;
    case  531: return new       Bs_object( 1, r0) ; break ;
    case -531: return new       Bs_object(-1, r0) ; break ;
    
    // Charmonium
    case -441:
    case  441: return new     etaC_object(    r0) ; break ;
    case -443:
    case  443: return new     Jpsi_object(    r0) ; break ;
    
    // Misc
    case 0: return new virtual_photon_object(r0, 0) ; break ;
    
    default : return null ; break ;
  }
}

//Colors
var generic_color  = '255,255,255' ;
var kaon_color     = '255,  0,255' ;
var pion_color     = '250,250,  0' ;
var photon_color   = '255,100,100' ;
var electron_color = '  0,255,255' ;
var muon_color     = '  0,255,  0' ;
var tau_color      = '200,200,200' ;
var neutrino_color = '  0,  0,  0' ;
var proton_color   = ' 50,100,250' ;

// Try to follow the same order as the PDG

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
  var par = new particle_object(1777, q, r0, false) ;
  par.color = tau_color ;
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

// Mesons
function pi0_object(r0){
  var par = new particle_object(135.0, 0, r0, true) ;
  par.color = generic_color ;
  par.type = 'neutral_hadron' ;
  par.matter = 0 ;
  par.w = 7.2e-6 ;
  par.pdgId = 111 ;
  par.decays = [
    [0.99, [22,22]    ] ,
    [0.01, [11,-11,22]] ,
    [3e-5, [11,-11,11,-11]]
  ] ;
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

function rho_object(q, r0){
  var par = new particle_object(770.0, q, r0, true) ;
  par.color = generic_color ;
  par.type = 'neutral_hadron' ;
  par.matter = q ;
  par.w = 150.0 ;
  par.pdgId = 213 ;
  par.decays = [
    [1.0    , [211,111]] ,
    [0.00045, [211, 22]]
  ] ;
  par.normalise_decays() ;
  //par.m = max(300,inverse_cauchy(random()/(pi*par.w), par.m, par.w)) ;
  //var  E = sqrt(par.m*par.m+par.p4_0.p()*par.p4_0.p()) ;
  //par.p4_0.t = E ;
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
    [1.000  , [211,-211]] ,
    [0.099  , [211,-211,22]] ,
    [0.0003 , [221,22]] ,
    [0.00005, [11,-11]] ,
    [0.00005, [13,-13]] ,
    [0.0001 , [211,-211,111]] ,
  ] ;
  par.normalise_decays() ;
  //par.m = max(300,inverse_cauchy(random()/(pi*par.w), par.m, par.w)) ; // Protect against very low mass values!
  //var  E = sqrt(par.m*par.m+par.p4_0.p()*par.p4_0.p()) ;
  //par.p4_0.t = E ;
  return par ;
}

function eta_object(r0){
  var par = new particle_object(547.9, 0, r0, true) ;
  par.color = generic_color ;
  par.type = 'neutral_hadron' ;
  par.matter = 0 ;
  par.w = 0.001 ;
  par.pdgId = 221 ;
  par.decays = [
    [0.394, [22,22]] ,
    [0.327, [111, 111,111]] ,
    [0.229, [211,-211,111]] ,
    [0.042, [211,-211,22]]  ,
    [0.007, [11,-11,22]] ,
    [0.00002, [11,-11,11,-11]]
  ] ;
  //par.normalise_decays() ;
  //par.m = inverse_cauchy(1.2*random()/(pi*par.w), par.m, par.w) ;
  var  E = sqrt(par.m*par.m+par.p4_0.p()*par.p4_0.p()) ;
  //par.p4_0.t = E ;
  return par ;
}

function etap_object(r0){
  var par = new particle_object(957.8, 0, r0, true) ;
  par.color = generic_color ;
  par.type = 'neutral_hadron' ;
  par.matter = 0 ;
  par.w = 0.2 ;
  par.pdgId = 331 ;
  par.decays = [
    [0.429, [221,211,-211]] ,
    [0.291, [113,22]] ,
    [0.222, [221,111,111]] ,
    [0.028, [223,22]] ,
    [0.022, [22,22]] ,
    [0.002, [211,-211,11,-11]]
  ] ;
  par.normalise_decays() ;
  //par.m = inverse_cauchy(1.2*random()/(pi*par.w), par.m, par.w) ;
  //var  E = sqrt(par.m*par.m+par.p4_0.p()*par.p4_0.p()) ;
  //par.p4_0.t = E ;
  return par ;
}

function omega_object(r0){
  var par = new particle_object(782.7, 0, r0, true) ;
  par.color = generic_color ;
  par.type = 'neutral_hadron' ;
  par.matter = 0 ;
  par.w = 8.5 ;
  par.pdgId = 223 ;
  par.decays = [
    [0.892, [211,-211,111]] ,
    [0.083, [111,22]] ,
    [0.015, [211,-211]]
  ] ;
  par.normalise_decays() ;
  //par.m = inverse_cauchy(1.2*random()/(pi*par.w), par.m, par.w) ;
  //var  E = sqrt(par.m*par.m+par.p4_0.p()*par.p4_0.p()) ;
  //par.p4_0.t = E ;
  return par ;
}

function phi_object(r0){
  var par = new particle_object(1020.0, 0, r0, true) ;
  par.color = generic_color ;
  par.type = 'neutral_hadron' ;
  par.matter = 0 ;
  par.w = 4.3 ;
  par.pdgId = 333 ;
  par.decays = [
    [0.489, [321,-321]] ,
    [0.342, [130,310]] ,
    [0.153, [211,-211,111]] ,
    [0.013, [221,22]]
  ] ;
  par.normalise_decays() ;
  //par.m = max(1000,inverse_cauchy(1.2*random()/(pi*par.w), par.m, par.w)) ;
  //var  E = sqrt(par.m*par.m+par.p4_0.p()*par.p4_0.p()) ;
  //par.p4_0.t = E ;
  return par ;
}

// Kaons
function K_object(q, r0){
  var par = new particle_object(494.7, q, r0, false) ;
  par.color = kaon_color ;
  par.type = 'charged_hadron' ;
  par.matter = -q ;
  par.w = 1e-20 ;
  par.pdgId = (q==1) ? 321 : -321 ;
  par.decays = [] ;
  par.normalise_decays() ;
  return par;
}

function KS_object(r0){
  var par = new particle_object(497.6, 0, r0, false) ;
  par.color = kaon_color ;
  par.type = 'neutral_hadron' ;
  par.matter = 0 ;
  par.w = 1e-20 ;
  par.tau = 8.95e-11 ;
  par.pdgId = 310 ;
  par.decays = [
    [0.307,[111, 111]] ,
    [0.692,[211,-211]] ,
    [0.002,[211,-211,22]]
  ] ;
  par.normalise_decays() ;
  return par ;
}

function KL_object(r0){
  var par = new particle_object(497.6, 0, r0, false) ;
  par.color = generic_color ;
  par.type = 'neutral_hadron' ;
  par.matter = 0 ;
  par.w = 1e-20 ;
  par.tau = 5.12e-8 ;
  par.pdgId = 130 ;
  par.decays = [
    [0.406*0.5,[ 211, 11,-19]] ,
    [0.406*0.5,[-211,-11, 19]] ,
    [0.270*0.5,[ 211, 13,-19]] ,
    [0.270*0.5,[-211,-13, 19]] ,
    [0.002*0.5,[ 211, 11,-19,22]] ,
    [0.002*0.5,[-211,-11, 19,22]] ,
    [0.003*0.5,[ 211, 13,-19,22]] ,
    [0.003*0.5,[-211,-13, 19,22]] ,
    [0.195,[111, 111,111]] ,
    [0.125,[211,-211,111]] ,
    [0.002,[211,-211]]
  ] ;
  return par ;
}

function K892_object(q, r0){
  var par = new particle_object(892, q, r0, true) ;
  par.color = kaon_color ;
  par.type = 'charged_hadron' ;
  par.matter = -q ;
  par.w = 50.8*0.5 ;
  par.pdgId = (q==1) ? 323 : -323 ;
  par.decays = [
    [0.50, [321,111]] ,
    [0.50, [311,211]] ,
    [0.01, [321,22]]
  ] ;
  par.normalise_decays() ;
  //par.m = max(650,inverse_cauchy(random()/(pi*par.w), par.m, par.w)) ;
  //par.m = min(1100,par.m) ;
  //var  E = sqrt(par.m*par.m+par.p4_0.p()*par.p4_0.p()) ;
  //par.p4_0.t = E ;
  return par;
}

function K892_0_object(q, r0){
  var par = new particle_object(892, 0, r0, true) ;
  par.color = kaon_color ;
  par.type = 'charged_hadron' ;
  par.matter = q ;
  par.w = 26.2*0.05 ;
  par.pdgId = (q==1) ? 313 : -313 ;
  par.decays = [
    [0.5, [321,-211]] ,
    [0.5, [311, 111]]
  ] ;
  par.normalise_decays() ;
  //par.m = max(650,inverse_cauchy(random()/(pi*par.w), par.m, par.w)) ;
  //par.m = min(1100,par.m) ;
  //var  E = sqrt(par.m*par.m+par.p4_0.p()*par.p4_0.p()) ;
  //par.p4_0.t = E ;
  return par;
}

// Charm mesons
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

function D0_object(q, r0){
  var par = new particle_object(1865, 0, r0, true) ;
  par.color = generic_color ;
  par.type = 'neutral_hadron' ;
  par.matter = q ;
  par.w = 1e-20 ;
  par.tau = 4.1e-13 ;
  par.pdgId = (q==1) ? 421 : -421 ;
  par.decays = [ 
    [0.036, [-321,-11,19]] ,
    [0.022, [-321,-13,19]] ,
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

function DStar_object(q, r0){
  var par = new particle_object(2007, q, r0, true) ;
  par.color = generic_color ;
  par.type = 'charged_hadron' ;
  par.matter = q ;
  par.w = 2.3 ;
  par.pdgId = (q==1) ? 413 : -413 ;
  par.decays = [ 
    [0.619, [411,111]] ,
    [0.381, [411,22]] ,
  ] ;
  par.normalise_decays() ;
  return par ;
}

function D0Star_object(q, r0){
  var par = new particle_object(2010, 0, r0, true) ;
  par.color = generic_color ;
  par.type = 'neutral_hadron' ;
  par.matter = q ;
  par.w = 0.096 ;
  par.pdgId = (q==1) ? 423 : -423 ;
  par.decays = [ 
    [0.677, [411,211]] ,
    [0.307, [421,111]] ,
    [0.016, [421,22]]
  ] ;
  par.normalise_decays() ;
  return par ;
}

function Ds_object(q, r0){
  var par = new particle_object(1969, q, r0, true) ;
  par.color = generic_color ;
  par.type = 'charged_hadron' ;
  par.matter = q ;
  par.w = 1e-20 ;
  par.tau = 5.0e-13 ;
  par.pdgId = (q==1) ? 431 : -431 ;
  par.decays = [ 
    [0.006, [-13,19]] ,
    [0.054, [-15,19]] ,
    [0.025, [333,-11,19]] ,
    [0.025, [333,-13,19]] ,
    [0.027, [221,-11,19]] ,
    [0.010, [331,-11,19]] ,
    [0.027, [221,-13,19]] ,
    [0.010, [331,-13,19]] ,
    [0.010, [311,-13,19]] ,
    [0.010, [313,-13,19]] ,
    [0.015, [310,321]] ,
    [0.045, [333,211]] ,
    [0.054, [323,-311]] ,
    [0.084, [333,213]] ,
    [0.072, [-313,323]] ,
    [0.010, [321,310,211,-211]] ,
    [0.009, [321,-321,211,-211,211]]
  ] ;
  par.normalise_decays() ;
  return par ;
}

function DsStar_object(q, r0){
  var par = new particle_object(2112, q, r0, true) ;
  par.color = generic_color ;
  par.type = 'charged_hadron' ;
  par.matter = q ;
  par.w = 1.9 ;
  par.pdgId = (q==1) ? 433 : -433 ;
  par.decays = [ 
    [0.942, [431,22]] ,
    [0.058, [431,111]]
  ] ;
  par.normalise_decays() ;
  return par ;
}

// Bottom mesons
function B_object(q, r0){
  var par = new particle_object(5279, q, r0, true) ;
  par.color = generic_color ;
  par.type = 'charged_hadron' ;
  par.matter = q ;
  par.w = 1e-20 ;
  par.tau = 1.64e-12 ;
  par.pdgId = (q==1) ? -521 : 521 ;
  par.decays = [ 
    [0.022, [-421,-11,19]] ,
    [0.022, [-421,-13,19]] ,
    [0.008, [-421,-15,19]] ,
    [0.057, [-423,-11,19]] ,
    [0.057, [-423,-13,19]] ,
    [0.019, [-423,-15,19]] ,
    [0.002, [-411,211,-11,19]] ,
    [0.002, [-411,211,-13,19]] ,
    [0.0001,[-15,19]] ,
    [0.005, [-421,211]] ,
    [0.013, [-421,213]] ,
    [0.006, [-421,211,211,-211]] ,
    [0.006, [-421,223,-211]] ,
    [0.001, [-411,221,211]] ,
    [0.005, [-423,211]] ,
    [0.005, [-423,223,211]] ,
    [0.010, [-423,213]] ,
    [0.002, [-423,321,313]] ,
    [0.010, [-423,221,221,-211]] ,
    [0.018, [-423,221,221,-211,111]] ,
    [0.006, [-423,221,221,211,-211,-211]] ,
    [0.003, [-413,211,221,221,-211]] ,
    [0.010, [-423,431]] ,
    [0.008, [-421,433]] ,
    [0.008, [-423,431]] ,
    [0.017, [-423,433]] ,
    [0.002, [-423,411,311]] ,
    [0.004, [-421,433,311]] ,
    [0.009, [-423,433,311]] ,
    [0.001, [-421,421,-321]] ,
    [0.002, [-423,421,-321]] ,
    [0.011, [-421,423,-321]] ,
    [0.001, [-413,413,-321]] ,
    [0.001, [441,323]] ,
    [0.001, [443,-321]] ,
    [0.001, [443,-323]]
  ] ;
  par.normalise_decays() ;
  return par ;
}

function B0_object(q, r0){
  var par = new particle_object(5280, q, r0, true) ;
  par.color = generic_color ;
  par.type = 'charged_hadron' ;
  par.matter = q ;
  par.w = 1e-20 ;
  par.tau = 5.0e-13 ;
  par.pdgId = (q==1) ? 511 : -511 ;
  par.decays = [ 
    [0.022, [-411,-11,19]] ,
    [0.022, [-411,-13,19]] ,
    [0.010, [-411,-15,19]] ,
    [0.049, [-413,-11,19]] ,
    [0.049, [-413,-13,19]] ,
    [0.018, [-413,-15,19]] ,
    [0.049, [-421,-211,-11,19]] ,
    [0.049, [-421,-211,-13,19]] ,
    [0.003, [-411,211]] ,
    [0.008, [-411,213]] ,
    [0.003, [-411,221,211]] ,
    [0.004, [-411,211,221,-211]] ,
    [0.001, [-411,211,113]] ,
    [0.006, [-413,211,113]] ,
    [0.003, [-413,221,211]] ,
    [0.007, [-411,431]] ,
    [0.008, [-413,431]] ,
    [0.007, [-411,433]] ,
    [0.018, [-413,433]] ,
    [0.001, [-411,421,321]] ,
    [0.004, [-411,423,321]] ,
    [0.003, [-413,421,321]] ,
    [0.001, [-413,423,321]] ,
    [0.003, [-411,413,311]] ,
    [0.003, [-413,411,311]] ,
    [0.008, [-413,413,311]] ,
    [0.002, [-423,423,311]] ,
    [0.001, [443,313]] ,
    [0.001, [443,311,211,-211]]
  ] ;
  par.normalise_decays() ;
  return par ;
}

function Bs_object(q, r0){
  var par = new particle_object(1969, q, r0, true) ;
  par.color = generic_color ;
  par.type = 'charged_hadron' ;
  par.matter = q ;
  par.w = 1e-20 ;
  par.tau = 5.0e-13 ;
  par.pdgId = (q==1) ? 531 : -531 ;
  par.decays = [ 
    [0.006, [-13,19]] ,
    [0.054, [-15,19]] ,
    [0.025, [333,-11,19]] ,
    [0.025, [333,-13,19]] ,
    [0.027, [221,-11,19]] ,
    [0.010, [331,-11,19]] ,
    [0.027, [221,-13,19]] ,
    [0.010, [331,-13,19]] ,
    [0.010, [311,-13,19]] ,
    [0.010, [313,-13,19]] ,
    [0.015, [310,321]] ,
    [0.045, [333,211]] ,
    [0.054, [323,311]] ,
    [0.084, [333,213]] ,
    [0.072, [313,323]] ,
    [0.010, [321,310,211-211]] ,
    [0.009, [321,-321,211,-211,211]]
  ] ;
  par.decays = [ [0.045, [333,211]] ] ;
  par.normalise_decays() ;
  return par ;
}

function Bc_object(q, r0){
  var par = new particle_object(1969, q, r0, true) ;
  par.color = generic_color ;
  par.type = 'charged_hadron' ;
  par.matter = q ;
  par.w = 1e-20 ;
  par.tau = 5.0e-13 ;
  par.pdgId = (q==1) ? 541 : -541 ;
  par.decays = [ 
    [0.006, [-13,19]] 
  ] ;
  par.decays = [ [0.045, [333,211]] ] ;
  par.normalise_decays() ;
  return par ;
}




// Quarkonia
function etaC_object(r0){
  var par = new particle_object(2983, 0, r0, true) ;
  par.color = generic_color ;
  par.type = 'ephemeral_hadron' ;
  par.m0 = 2983 ;
  par.w  = 32.0 ;
  par.matter = 0 ;
  par.y0 = cauchy(this.m, this.m, this.w) ;
  par.pdgId = 441 ;
  par.decays = [
    [0.041, [331,211,-211]] ,
    [0.009, [213,-213]] ,
    [0.009, [113,-113]] ,
    [0.010, [ 313, 321, 211]] ,
    [0.010, [-313,-321,-211]] ,
    [0.011, [-313,-313,211,-211]]
  ] ;
  par.normalise_decays() ;
  par.m = inverse_cauchy(random()/(pi*par.w), par.m, par.w) ;
  var  E = sqrt(par.m*par.m+par.p4_0.p()*par.p4_0.p()) ;
  par.p4_0.t = E ;
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
  par.decays = [
    [0.059, [11,-11]] ,
    [0.059, [13,-13]] ,
    [0.009, [11,-11,22]] ,
    [0.009, [13,-13,22]] ,
    
  ] ;
  par.normalise_decays() ;
  par.m = inverse_cauchy(random()/(pi*par.w), par.m, par.w) ;
  var  E = sqrt(par.m*par.m+par.p4_0.p()*par.p4_0.p()) ;
  par.p4_0.t = E ;
  return par ;
}

// Mother particle
function virtual_photon_object(r0, m){
  var par = new particle_object(m, 0, r0, true) ;
  par.color = generic_color ;
  par.type = 'photon' ;
  par.matter = 0 ;
  par.w = 1e-20 ;
  par.pdgId = 0 ;
  par.decays = [ // BaBar physics book values
    //[1.04*0.5  , [511, -511]] ,
    //[1.04*0.5  , [521, -521]] ,
    //[0.94      , [ 15,  -15]] ,
    //[0.01      , [ 11,  -11, 22]] ,
    //[0.01      , [ 13,  -13, 22]] ,
    //[1.30      , [  4,   -4]] ,
    [0.35      , [  3,   -3]] ,
    [1.39      , [  2,   -2]] ,
    [0.35      , [  1,   -1]] 
    //[0.1       , [443,   22]] // Arbitrary value for lulz
    //[0.1       , [313, -313]] // Arbitrary value for lulz
  ] ;
  par.normalise_decays() ;
  return par ;
}