function write_particle_info_table(particles){
  var precision = 4 ;
  var table = Get('table_particle_info') ;
  var tbody = Get('tbody_particle_info') ;
  tbody.innerHTML = '' ;
    
  for(var i=0 ; i<particles.length ; i++){
    var p = particles[i] ;
    var tr    = Create('tr') ;
    tr.add_td = function(className, innerHTML){
      var td = Create('td') ;
      td.innerHTML = innerHTML ;
      td.className = className ;
      if(innerHTML=='NaN') td.className += ' NaN' ;
      tr.appendChild(td) ;
    }
      
    var td = Create('td') ;
    td.innerHTML = '&nbsp;' ;
    td.style.backgroundColor = 'rgb(' + p.color + ')' ;
    tr.appendChild(td) ;
    
    var mother_id = (p.mother==null) ? '-' : p.mother.id ;
    tr.add_td('particle_info', p.id) ;
    tr.add_td('particle_info', p.pdgId) ;
    tr.add_td('particle_info', p.m0      .toPrecision(precision)) ;
    tr.add_td('particle_info', p.m       .toPrecision(precision)) ;
    tr.add_td('particle_info', p.p4_0.x  .toPrecision(precision)) ;
    tr.add_td('particle_info', p.p4_0.y  .toPrecision(precision)) ;
    tr.add_td('particle_info', p.p4_0.z  .toPrecision(precision)) ;
    tr.add_td('particle_info', p.p4_0.t  .toPrecision(precision)) ;
    tr.add_td('particle_info', p.p4_0.m().toPrecision(precision)) ;
    tr.add_td('particle_info', p.p4_r.x  .toPrecision(precision)) ;
    tr.add_td('particle_info', p.p4_r.y  .toPrecision(precision)) ;
    tr.add_td('particle_info', p.p4_r.z  .toPrecision(precision)) ;
    tr.add_td('particle_info', p.p4_r.t  .toPrecision(precision)) ;
    tr.add_td('particle_info', p.p4_r.m().toPrecision(precision)) ;
    tr.add_td('particle_info', p.r_0.x   .toPrecision(precision)) ;
    tr.add_td('particle_info', p.r_0.y   .toPrecision(precision)) ;
    tr.add_td('particle_info', p.r_0.z   .toPrecision(precision)) ;
    tr.add_td('particle_info', mother_id) ;
      
    var td = Create('td') ;
    td.innerHTML = '&nbsp;' ;
    td.style.backgroundColor = 'rgb(' + p.color + ')' ;
    tr.appendChild(td) ;
    tbody.appendChild(tr) ;
  }
}

function stopwatch(){
  if(!pause){
    stopwatch_time += stopwatch_delay ;
    Get('span_stopwatch').innerHTML = stopwatch_time ;
  }
  window.setTimeout(stopwatch, stopwatch_delay) ;
}
