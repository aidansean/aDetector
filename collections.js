function filter_list_of_particles_by_mass(list, mass_lower, mass_upper){
  var results = [] ;
  for(var i=0 ; i<list.length ; i++){
    var m = list[i].p4_0.m() ;
    if(m>mass_lower && m<mass_upper) results.push(list[i]) ;
  }
  return results ;
}

function filter_list_of_particles_by_p(list, p_lower){
  var results = [] ;
  var p2_lower = p_lower*p_lower ;
  for(var i=0 ; i<list.length ; i++){
    if(list[i].p4_0.p2()>p2_lower) results.push(list[i]) ;
  }
  return results ;
}

function filter_list_of_particles_by_pdgId(list, pdgId, both_charges){
  var results = [] ;
  for(var i=0 ; i<list.length ; i++){
    if(both_charges){
      if(Math.abs(list[i].pdgId)==Math.abs(pdgId)) results.push(list[i]) ;
    }
    else{
      if(list[i].pdgId==pdgId) results.push(list[i]) ;
    }
  }
  return results ;
}

var uid = 1000 ;
function combine_lists_of_particles(pdgId, particle_lists){
  if(particle_lists.length==0){
    return [] ;
  }
  else if(particle_lists.length==1){ // Just reassign the pdgIds
    for(var i=0 ; i<particle_lists[0].length ; i++){
      particle_lists[0][i].pdgId = pdgId ;
    }
    return particle_lists[0] ;
  }
  else{
    var results = particle_lists.pop() ;
    while(current_list = particle_lists.pop()){
      results = combine_two_lists_of_particles(results, current_list) ;
      for(var i=0 ; i<results.length ; i++){
        results[i].pdgId = pdgId ;
      }
    }
    return results ;
  }
}
function combine_two_lists_of_particles(l1, l2){
  var output = [] ;
  for(var i=0 ; i<l1.length ; i++){
    for(var j=0 ; j<l2.length ; j++){
      if(l1[i].id==l2[j].id) continue ;
      var p = make_particle(0,[0,0,0]) ;
      p.p4_0 = l1[i].p4_0.add(l2[j].p4_0) ;
      if(l1[i].pdgId!=0) p.daughters.push(l1[i]) ;
      if(l2[j].pdgId!=0) p.daughters.push(l2[j]) ;
      p.id = uid ;
      uid++ ;
      output.push(p) ;
    }
  }
  return output ;
}

function recursively_add_particles(particle, all_particles){ // Not sure this is used anymore
  all_particles.push(particle) ;
  for(var i=0 ; i<particle.daughters.length ; i++){
    recursively_add_particles(particle.daughters[i], all_particles) ;
  }
  return all_particles ;
}
