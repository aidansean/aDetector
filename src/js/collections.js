// These functions are for manipulating lists of particles

var collections      = [] ;
var collection_names = [] ;

function get_collection_by_name(name){
  if(collections[name]) return collections[name] ;
  return null ;
}

function collection_object(name, title, pdgId, both_charges, is_raw_list, daughter_names){
  this.name  = name  ;
  this.title = title ;
  this.pdgId = pdgId ;
  this.merge = false ;
  this.both_charges = both_charges ;
  this.is_raw_list = is_raw_list ;
  
  this.lowers = [] ;
  this.uppers = [] ;
  this.filter = [] ;
  for(var i=0 ; i<variable_names.length ; i++){
    var vname = variable_names[i] ;
    this.lowers[vname] = -1e30 ;
    this.uppers[vname] =  1e30 ;
    this.filter[vname] = false ;
  }
  
  this.list           = [] ;
  this.daughter_names = daughter_names ;
  this.daughter_lists = [] ;
  this.populate_from_daughters = function(){
    this.daughter_lists = [] ;
    for(var i=0 ; i<this.daughter_names.length ; i++){
      this.daughter_lists.push( get_collection_by_name(this.daughter_names[i]).list ) ;
    }
    if(this.merge){
      var results = [] ;
      for(var i=0 ; i<this.daughter_lists.length ; i++){
        for(var j=0 ; j<this.daughter_lists[i].length ; j++){
          var p_in = this.daughter_lists[i][j] ;
          var p = make_particle(0,[0,0,0]) ;
          p.p4_r = new fourVector() ;
          p.p4_0.x = p_in.p4_0.x ;
          p.p4_0.y = p_in.p4_0.y ;
          p.p4_0.z = p_in.p4_0.z ;
          p.p4_0.t = p_in.p4_0.t ;
          p.p4_r.x = p_in.p4_r.x ;
          p.p4_r.y = p_in.p4_r.y ;
          p.p4_r.z = p_in.p4_r.z ;
          p.p4_r.t = p_in.p4_r.t ;
          p.pdgId = this.pdgId ;
          p.id = uid ;
          p.raw_indices = [].concat(p_in.raw_indices) ;
          p.raw_indices.sort() ;
          uid++ ;
          results.push(p) ;
        }
      }
      return results ;
    }
    else{
      this.list = combine_lists_of_particles(this.pdgId, this.daughter_lists) ;
    }
    for(var i=0 ; i<variable_names.length ; i++){
      var vname = variable_names[i] ;
      if(this.filter[vname]) this.list = variables_list[vname].filter_list_of_particles(this.list, this.lowers[vname], this.uppers[vname]) ;
    }
  }
  this.populate_list_from_event = function(event){
    this.list = filter_list_of_particles_by_pdgId(event.particles, this.pdgId, this.both_charges) ;
  }
  
  this.get_variable_array = function(vname){
    var results = [] ;
    for(var i=0 ; i<this.list.length ; i++){ results.push(variables_list[vname].get_value(this.list[i])) ; }
    return results ;
  }
  update_select_fill_histogram_collection(this.name, this.title) ;
}

function make_new_reco_particle(){
  var name  = Get('input_reco_name').value ;
  var title = Get('input_reco_title').value ;
  if(title=='') title = name ;
  var pdgId = parseInt(Get('input_reco_pdgId').value) ;
  if(isNaN(pdgId)) pdgId = 0 ;
  
  // Validate the name
  if(name==''){
    alert('You need to enter a name for this particle collection.') ;
    return ;
  }
  var valid_name = true ;
  for(var i=0 ; i<collection_names.length ; i++){
    if(name==collection_names[i]){
      valid_name = false ;
      alert('That name is already taken.') ;
      return ;
    }
  }
  var n_daughters = 0 ;
  var daughters = [] ;
  var daughter_index = 1 ;
  while(Get('select_reco_particle_daughter_'+daughter_index)){
    daughters.push(Get('select_reco_particle_daughter_'+daughter_index).value) ;
    daughter_index++ ;
  }
  if(!name.match(/^[a-z0-9]+$/i)){
    alert('The name can only contain letters and numbers.') ;
    return ;
  }
  var coll = new collection_object(name, title, pdgId, true, false, daughters) ;
  
  // Now get filter information
  // This can probably be simplified a lot
  coll.lowers = [] ;
  coll.uppers = [] ;
  coll.filter = [] ;
  for(var i=0 ; i<variable_names.length ; i++){
    var vname = variable_names[i] ;
    coll.lowers[vname] = parseFloat(Get('input_reco_' + vname + '_lower').value) ;
    coll.uppers[vname] = parseFloat(Get('input_reco_' + vname + '_upper').value) ;
    coll.filter[vname] = (Get('checkbox_reco_' + vname + '_filter').checked) ;
    if(isNaN(coll.lowers[vname])){ alert('Please enter a valid lower ' + vname + '.') ; return false ; }
    if(isNaN(coll.uppers[vname])){ alert('Please enter a valid upper ' + vname + '.') ; return false ; }
  }
  collection_names.push(name) ;
  if(Get('submit_reco_particle_mergeLists').checked) coll.merge = true ;
  
  collections[name] = coll ;
  
  add_particle_collection_table(coll) ;
  window.setTimeout(rerun_mathjax,100) ;
  reset_reco_particle_form() ;
  
  if(false){
    // Create a histogram and plot space for the mass distribution
    var m_l = max(mass_lower, 0) ;
    var m_u = min(mass_upper, mu) ;
    plot_spaces[name] = new plot_space_object(name) ;
    histograms[name] = new histogram_object(name, 'mass ('+title+')',  m_l,  m_u,  50, 'MeV',   '0,0,0') ;
    histograms[name].draw(plot_spaces[name],'e') ;
    plot_spaces[name].add_histogram(histograms[name], 'e') ;
    plot_spaces[name].fill_histogram_table() ;
    plot_names.push(name) ;
  
    // Update plot spaces to allow the user to plot this histogram on them
    for(var i=0 ; i<plot_names.length ; i++){
      plot_spaces[plot_names[i]].fill_histogram_table() ;
    }
  }
}

// Manipulating the DOM
function remove_reco_particle_collection_tr(){
  var tr = Get('tr_reco_particle_daughter_' + (particle_collection_select_index-1)) ;
  if(tr==null) return ;
  particle_collection_select_index-- ;
  tr.parentNode.removeChild(tr) ;
}
function add_reco_particle_collection_tr(){
  var tbody = Get('tbody_reco_particle_daughters') ;
  var tr = Create('tr') ;
  tr.id = 'tr_reco_particle_daughter_' + particle_collection_select_index ;
  var th = Create('th') ;
  th.innerHTML = 'Input list ' + particle_collection_select_index + ':' ;
  tr.appendChild(th) ;
  var td = Create('td') ;
  td.appendChild(make_particle_collection_select(particle_collection_select_index)) ;
  tr.appendChild(td) ;
  tbody.appendChild(tr) ;
  particle_collection_select_index++ ;
  rerun_mathjax() ;
}
function make_particle_collection_select(index){
   var select = Create('select') ;
   select.id = 'select_reco_particle_daughter_'+index ;
   for(var i=0 ; i<collection_names.length ; i++){
     var option = Create('option') ;
     option.value     = collection_names[i] ;
     option.innerHTML = collections[collection_names[i]].title ;
     select.appendChild(option) ;
   }
   return select ;
}
function reset_reco_particle_form(){
  Get('tbody_reco_particle_daughters').innerHTML = '' ;
  Get('input_reco_name' ).value = '' ;
  Get('input_reco_title').value = '' ;
  Get('input_reco_pdgId').value = '' ;
  
  for(var i=0 ; i<variable_names.length ; i++){
    if(!Get('input_reco_'    + variable_names[i] + '_lower')) continue ;
    Get('input_reco_'    + variable_names[i] + '_lower').value = -1e30 ;
    Get('input_reco_'    + variable_names[i] + '_upper').value =  1e30 ;
    Get('checkbox_reco_' + variable_names[i] + '_filter').checked = false ;
  }
  particle_collection_select_index = 1 ;
  add_reco_particle_collection_tr() ;
}
function add_particle_collection_table(collection){
  var table = Create('table') ;
  table.className = 'particle_list' ;
  table.id = 'table_particle_list_' + collection.title ;
  var thead = Create('thead') ;
  var tr    = Create('tr') ;
  var th    = Create('th') ;
  var td ;
  th.colSpan = 2 ;
  th.className = 'particle_list_header' ;
  th.innerHTML = collection.title ;
  tr.appendChild(th) ;
  thead.appendChild(tr) ;
  table.appendChild(thead) ;
  
  var tbody = Create('tbody') ;
  tr = Create('tr') ;
  th = Create('th') ;
  th.innerHTML = 'PDG id' ;
  th.className = 'particle_list' ;
  tr.appendChild(th) ;
  td = Create('td') ;
  td.innerHTML = collection.pdgId ;
  td.className = 'particle_list' ;
  tr.appendChild(td) ;
  tbody.appendChild(tr) ;
  
  for(var i=0 ; i<collection.daughter_names.length ; i++){
    tr = Create('tr') ;
    th = Create('th') ;
    th.innerHTML = 'Daughter '+(i+1) ;
    th.className = 'particle_list' ;
    tr.appendChild(th) ;
    td = Create('td') ;
    td.innerHTML = collections[collection.daughter_names[i]].title ;
    td.className = 'particle_list' ;
    tr.appendChild(td) ;
    tbody.appendChild(tr) ;
  }
  
  var filtered = false ;
  for(var i=0 ; i<variable_names.length ; i++){
    if(collection.filter[variable_names[i]]){
      filtered = true ;
      break ;
    }
  }
  
  if(filtered){
    tr = Create('tr') ;
    th = Create('th') ;
    th.colSpan = 2 ;
    th.className = 'particle_list_header' ;
    th.innerHTML = 'Filters' ;
    tr.appendChild(th) ;
    tbody.appendChild(tr) ;
    for(var i=0 ; i<variable_names.length ; i++){
      var vname = variable_names[i] ;
      if(collection.filter[vname]){
        tbody.appendChild(make_particle_table_row('Lower '+vname , collection.lowers[vname])) ;
        tbody.appendChild(make_particle_table_row('Upper '+vname , collection.uppers[vname])) ;
      }
    }
  }
  
  table.appendChild(tbody) ;
  Get('div_particle_lists').appendChild(table) ;
}
function make_particle_table_row(th_content, td_content){
  var tr = Create('tr') ;
  var th = Create('th') ;
  var td = Create('td') ;
  th.className = 'particle_list' ;
  td.className = 'particle_list' ;
  th.innerHTML = th_content ;
  td.innerHTML = td_content ;
  tr.appendChild(th) ;
  tr.appendChild(td) ;
  return tr ;
}

function update_select_fill_histogram_collection(name, title){ // Awful function name!
  var select = Get('select_fill_histogram_collection') ;
  var option = Create('option') ;
  option.value     = name ;
  option.innerHTML = title ;
  select.appendChild(option) ;
}

// A unique id to keep track of particles being added to lists, to make sure we don't use the same particle twice when making composites.  Not sure if this works properly!
function make_raw_collections(){
  var charged_particles = [] ;
  // Name and pdgId of positively charged particles
  charged_particles.push(['pions'    , '\\(\\pi',  211]) ;
  charged_particles.push(['kaons'    , '\\(K'   ,  321]) ;
  charged_particles.push(['electrons', '\\(e'   ,  -11]) ;
  charged_particles.push(['muons'    , '\\(\\mu',  -13]) ;
  charged_particles.push(['protons'  , '\\(p'   , 2212]) ;

  var raw_collection_info = [] ;
  for(var i=0 ; i<charged_particles.length ; i++){
    var cp = charged_particles[i] ;
    raw_collection_info.push(['raw_'+cp[0]     , cp[1]+'^\\pm\\)',  cp[2],  true]) ;
    raw_collection_info.push(['raw_'+cp[0]+'_p', cp[1]+'^+\\)'   ,  cp[2], false]) ;
    raw_collection_info.push(['raw_'+cp[0]+'_m', cp[1]+'^-\\)'   , -cp[2], false]) ;
  }
  raw_collection_info.push(['raw_photons', '\\(\\gamma\\)', 22, true]) ;
  
  for(var i=0 ; i<raw_collection_info.length ; i++){
    var coll = raw_collection_info[i] ;
    collection_names.push(coll[0]) ;
    collections[coll[0]] = new collection_object(coll[0], coll[1], coll[2], coll[3], true, []) ;
  }
}

var uid = 1000 ;
function combine_lists_of_particles(pdgId, particle_lists){
  if(particle_lists.length==0){
    return [] ;
  }
  else if(particle_lists.length==1){
    var results = [] ;
    for(var i=0 ; i<particle_lists[0].length ; i++){
      var p_in = particle_lists[0][i] ;
      var p = make_particle(0,[0,0,0]) ;
      p.p4_r = new fourVector() ;
      p.p4_0.x = p_in.p4_0.x ;
      p.p4_0.y = p_in.p4_0.y ;
      p.p4_0.z = p_in.p4_0.z ;
      p.p4_0.t = p_in.p4_0.t ;
      p.p4_r.x = p_in.p4_r.x ;
      p.p4_r.y = p_in.p4_r.y ;
      p.p4_r.z = p_in.p4_r.z ;
      p.p4_r.t = p_in.p4_r.t ;
      p.pdgId = pdgId ;
      p.id = uid ;
      p.raw_indices = [].concat(p_in.raw_indices) ;
      p.raw_indices.sort() ;
      uid++ ;
      results.push(p) ;
    }
    results = remove_duplicates_from_list(results) ;
    return results ;
  }
  else{
    var results = particle_lists.pop() ;
    while(current_list = particle_lists.pop()){
      results = combine_two_lists_of_particles(results, current_list) ;
    }
    for(var i=0 ; i<results.length ; i++){ results[i].pdgId = pdgId ; }
    return results ;
  }
}
function combine_two_lists_of_particles(l1, l2){
  var output = [] ;
  for(var i=0 ; i<l1.length ; i++){
    for(var j=0 ; j<l2.length ; j++){
      if(l1[i].id==l2[j].id) continue ;
      var match_raw = true ;
      for(var k=0 ; k<l1[i].raw_indices.length ; k++){
        for(var m=0 ; m<l2[j].raw_indices.length ; m++){
          if(l1[i].raw_indices[k]!=l2[j].raw_indices[m]){
            match_raw = false ;
            break ;
          }
          if(match_raw) break ;
        }
      }
      if(match_raw) continue ;
      var p = make_particle(0,[0,0,0]) ;
      p.p4_0 = l1[i].p4_0.add(l2[j].p4_0) ;
      p.p4_r = l1[i].p4_r.add(l2[j].p4_r) ;
      if(l1[i].pdgId!=0) p.daughters.push(l1[i]) ;
      if(l2[j].pdgId!=0) p.daughters.push(l2[j]) ;
      p.id = uid ;
      p.raw_indices = l1[i].raw_indices.concat(l2[j].raw_indices) ;
      p.raw_indices.sort() ;
      uid++ ;
      output.push(p) ;
    }
  }
  output = remove_duplicates_from_list(output) ;
  return output ;
}

function remove_duplicates_from_list(list){
  for(var i=0 ; i<list.length-1 ; i++){
    for(var j=list.length-1 ; j>=0 ; j--){
      var match_raw = true ;
      for(var k=0 ; k<list[i].raw_indices.length ; k++){
        if(list[i].raw_indices!=list[j].raw_indices){
          match_raw = false ;
          break ;
        }
      }
      if(match_raw) list.splice(j,1) ;
    }
  }
  return list ;
}

function recursively_add_particles(particle, all_particles){
  all_particles.push(particle) ;
  for(var i=0 ; i<particle.daughters.length ; i++){
    recursively_add_particles(particle.daughters[i], all_particles) ;
  }
  return all_particles ;
}
