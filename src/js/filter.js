var variable_names = ['m','E','p','pT','eta','phi','hel','d0','er','hr'] ;

function variable_object(name, title, latex, unit){
  this.name  = name  ;
  this.title = title ;
  this.latex = latex ;
  this.unit  = unit  ;
  this.get_value = function(particle){
    return -999 ;
  }
  this.filter_list_of_particles = function(list, lower, upper){
    var results = [] ;
    for(var i=0 ; i<list.length ; i++){
      var value = this.get_value(list[i]) ;
      if(value>lower && value<upper) results.push(list[i]) ;
    }
    return results ;
  }
  this.make_filter_row = function(){
    var tbody = Get('tbody_reco_particle_filters') ;
    var tr = Create('tr') ;
    var td ;
    var th ;
    var input ;
    
    th = Create('th') ;
    th.innerHTML = this.title + ':' ;
    tr.appendChild(th) ;
    
    td = Create('td') ;
    input = Create('input') ;
    input.id = 'input_reco_' + this.name + '_lower' ;
    input.className = 'input_filter' ;
    input.value = -1e30 ;
    td.appendChild(input) ;
    tr.appendChild(td) ;
    
    td = Create('td') ;
    td.innerHTML = '\\(&lt;' + this.latex + '&lt;\\)' ;
    tr.appendChild(td) ;
    
    td = Create('td') ;
    input = Create('input') ;
    input.id = 'input_reco_' + this.name + '_upper' ;
    input.className = 'input_filter' ;
    input.value = 1e30 ;
    td.appendChild(input) ;
    tr.appendChild(td) ;
    
    td = Create('td') ;
    td.innerHTML = '\\(' + this.unit + '\\)' ;
    tr.appendChild(td) ;
    
    td = Create('td') ;
    input = Create('input') ;
    input.id = 'checkbox_reco_' + this.name + '_filter' ;
    input.type = 'checkbox' ;
    input.selected = 'not_selected' ;
    input.value = 1e30 ;
    td.appendChild(input) ;
    tr.appendChild(td) ;
    
    tbody.appendChild(tr) ;
  }
}

var variables_list = new Array() ;

var v_m = new variable_object('m', 'Mass', 'm', 'MeV') ;
v_m.get_value = function(p){ return p.p4_r.m() ; } ;
variables_list['m'] = v_m ;

var v_E = new variable_object('E', 'Energy', 'E', 'MeV') ;
v_E.get_value = function(p){ return p.p4_r.E() ; } ;
variables_list['E'] = v_E ;

var v_p = new variable_object('p', 'Momentum', 'p', 'MeV') ;
v_p.get_value = function(p){ return p.p4_r.p() ; } ;
variables_list['p'] = v_p ;

var v_pT = new variable_object('pT', 'Transverse momentum', 'p_T', 'MeV') ;
v_pT.get_value = function(p){ return p.p4_r.pT() ; } ;
variables_list['pT'] = v_pT ;

var v_eta = new variable_object('eta', 'Pseudorapidity', '\\eta', '') ;
v_eta.get_value = function(p){ return p.p4_r.eta() ; } ;
variables_list['eta'] = v_eta ;

var v_phi = new variable_object('phi', 'phi', '\\phi', '') ;
v_phi.get_value = function(p){ return p.p4_r.phi() ; } ;
variables_list['phi'] = v_phi ;

var v_hel = new variable_object('hel', 'Helicity', '\\cos\\Theta_H', '') ;
v_hel.get_value = function(p){ return p.helicity() ; } ;
variables_list['hel'] = v_hel ;

var v_d0 = new variable_object('d0', 'Transverse impact', 'd_0', 'm') ;
v_d0.get_value = function(p){ return p.r_0.d0() ; } ;
variables_list['d0'] = v_d0 ;

var v_er = new variable_object('er', 'ecal response', 'E(ecal)/E(true)', '') ;
v_er.get_value = function(p){ return p.ecal_energy/p.p4_0.t ; } ;
variables_list['er'] = v_er ;

var v_hr = new variable_object('hr', 'hcal response', 'E(hcal)/E(true)', '') ;
v_hr.get_value = function(p){ return p.hcal_energy/p.p4_0.t ; } ;
variables_list['hr'] = v_hr ;


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
