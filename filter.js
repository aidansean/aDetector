var filter_names = ['mass','p','pt','E','eta','hel','d0'] ;

function filter_list_of_particles_by_mass(list, mass_lower, mass_upper){
  var results = [] ;
  for(var i=0 ; i<list.length ; i++){
    var m = list[i].p4_r.m() ;
    if(m>mass_lower && m<mass_upper) results.push(list[i]) ;
  }
  return results ;
}

function filter_list_of_particles_by_E(list, E_lower, E_upper){
  var results = [] ;
  for(var i=0 ; i<list.length ; i++){
    if(list[i].p4_r.E()>E_lower && list[i].p4_r.E()<E_upper) results.push(list[i]) ;
  }
  return results ;
}

function filter_list_of_particles_by_p(list, p_lower, p_upper){
  var results = [] ;
  var p2_lower = p_lower*p_lower ;
  var p2_upper = p_upper*p_upper ;
  for(var i=0 ; i<list.length ; i++){
    var p2 = list[i].p4_r.p2() ;
    if(p2>p2_lower && p2<p2_upper) results.push(list[i]) ;
  }
  return results ;
}

function filter_list_of_particles_by_pT(list, pT_lower, pT_upper){
  var results = [] ;
  for(var i=0 ; i<list.length ; i++){
    var pt = list[i].p4_r.pT() ; 
    if(pt>pT_lower && pt<pT_upper) results.push(list[i]) ;
  }
  return results ;
}

function filter_list_of_particles_by_eta(list, eta_lower, eta_upper){
  var results = [] ;
  for(var i=0 ; i<list.length ; i++){
    var eta = list[i].p4_r.eta() ; 
    if(eta>eta_lower && eta<eta_upper) results.push(list[i]) ;
  }
  return results ;
}

function filter_list_of_particles_by_d0(list, d0_lower, d0_upper){
  var results = [] ;
  for(var i=0 ; i<list.length ; i++){
    var d0 = list[i].r_0.d0() ; 
    if(d0>d0_lower && d0<d0_upper) results.push(list[i]) ;
  }
  return results ;
}

function filter_list_of_particles_by_hel(list, hel_lower, hel_upper){
  var results = [] ;
  for(var i=0 ; i<list.length ; i++){
    if(list[i].daughters.length!=2){ // For n body decay, ignore the helicity cut
      results.push(list[i]) ;
    }
    else{
      var hel = list[i].helicity() ; 
      if(hel>hel_lower && hel<hel_upper) results.push(list[i]) ;
    }
  }
  return results ;
}

function filter_list_of_particles_by_pdgId(list, pdgId, both_charges){
  var results = [] ;
  for(var i=0 ; i<list.length ; i++){
    if(both_charges){
      if(abs(list[i].pdgId)==abs(pdgId)) results.push(list[i]) ;
    }
    else{
      if(list[i].pdgId==pdgId) results.push(list[i]) ;
    }
  }
  return results ;
}
