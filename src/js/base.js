// Useful greek symbols: μπγ

var detector = new detector_object() ;

// Histogram management
var histograms  = [] ;
var plot_spaces = [] ;
var plot_names  = [] ;

var events     = [] ;
var fill_rules = [] ;

function fill_rule_object(collection_name, variable_name, histogram_name){
  this.collection_name = collection_name ;
  this.variable_name   = variable_name   ;
  this.histogram_name  = histogram_name  ;
  this.fill = function(){
      histograms[this.histogram_name].fill_array(collections[this.collection_name].get_variable_array(this.variable_name)) ;
  }
}

function draw_canvas_new_plot_space(){
  return ;
  var canvas = Get('canvas_new_plot_space') ;
  var context = canvas.getContext('2d') ;
  var w = canvas.width  ;
  var h = canvas.height ;
  var lw = w/8 ;
  context.fillStyle   = 'rgb(225,225,225)' ;
  context.strokeStyle = 'rgb(255,255,255)' ;
  context.fillRect(0,0,w,h) ;
  context.lineWidth = lw ;
  context.lineCap = 'round' ;
  context.moveTo(0.5*w,    lw) ;
  context.lineTo(0.5*w,  h-lw) ;
  context.moveTo(   lw, 0.5*h) ;
  context.lineTo( w-lw, 0.5*h) ;
  context.stroke() ;
}

function start(){
  add_eventListeners() ;
  initialise_coordinates() ;
  
  for(var i=0 ; i<variable_names.length ; i++){ variables_list[variable_names[i]].make_filter_row() ; }
  
  // Build detector
  var xml_detector = loadXMLDoc('xml/detector_babar.xml') ;
  var detector_node = xml_detector.childNodes[0] ;
  if(true){
    detector = detector_from_xml(detector_node) ;
  }
  else{
    detector.components.push(new beampipe_object('beampipe', 20, 1.0, '0,0,0')) ;
    detector.components.push(new  tracker_object('tracker' , 0.05, 0.5, -3.0, 3.0, 6,  1, 12, 0.4 , 0.05, '150,100,150', '200,   0, 200')) ;
    detector.components.push(new     ecal_object('ecal'    , 0.7 , 1.7, -3.0, 3.0, 2, 12,  6, 0.05, 0.05, '100,100,255', '  0,   0, 100')) ;
    detector.components.push(new     ecal_object('ecal_fwd', 0.05, 1.7,  3.0, 4.0, 2,  3,  6, 0.05, 0.05, '100,100,255', '  0,   0, 100')) ;
    detector.components.push(new     hcal_object('hcal'    , 2.0 , 3.0, -4.0, 4.0, 3, 12,  6, 0.09, 0.05, ' 50,200, 50', '  0, 100,   0')) ;
    detector.components.push(new     hcal_object('hcal_fwd', 0.1 , 2.8,  4.1, 4.5, 3,  2,  6, 0.05, 0.05,  '50,200, 50', '  0, 100,   0')) ;
  }
  detector.triggers.push(new BaBar_trigger_object()) ;
  
  detector.initialise() ;
  update_coords() ;
  Get('textarea_detectorXml').innerHTML = print_xml(detector.make_xml_node(),0) ;
  
  draw_detector([]) ;
  
  // Manage reconstruction
  // Base particles
  make_raw_collections() ;
  
  // Sample composite particle
  collection_names.push('phi') ;
  collections['phi'] = new collection_object('phi', '\\(\\phi\\)', 333, true, false, ['raw_kaons_p','raw_kaons_m']) ;
  collections['phi'].lowers['m'] =  750 ;
  collections['phi'].uppers['m'] = 2500 ;
  collections['phi'].filter['m'] = true ;
  
  histograms ['phi'] = new histogram_object('phi', 'mass (KK)',  750,  2500,  35, 'MeV',   '0,100,0') ;
  plot_spaces['phi'] = new plot_space_object('phi') ;
  plot_names.push('phi') ;
  
  plot_spaces['phi'].add_histogram(histograms['phi'], 'f') ;
  plot_spaces['phi'].draw() ;
  plot_spaces['phi'].fill_histogram_table() ;
  
  fill_rules.push(new fill_rule_object('phi', 'm', 'phi')) ;
  
  for(var i=0 ; i<collection_names.length ; i++){
    var coll = collections[collection_names[i]] ;
    if(coll.is_raw_list) continue ;
    add_particle_collection_table(coll) ;
  }
  
  reset_reco_particle_form() ;
  
  Get('input_update_event_display_interval' ).value =  draw_interval ;
  Get('input_update_particle_table_interval').value = table_interval ;
  Get('input_update_histograms_interval'    ).value = plotspace_draw_interval ;
  
  draw_canvas_new_plot_space() ;
  
  window.setTimeout(rerun_mathjax,100) ;
  heartbeat() ;
  stopwatch() ;
}

var mu = 10580 ;
//mu = 4000 ;
var gammaStar = virtual_photon_object([0,0,0], mu) ;
//gammaStar = collision_particle([0,0,0], mu) ;
function heartbeat(){
  if(counter>stop && stop>0) return ;
  if(!pause){
    // Reset the pre_info in case we need it for debugging
    Get('pre_info').innerHTML = '' ;
    
    // Create an empty list of particles
    var particles = [] ;
    
    // Attempt make a new event
    var success = false ;
    var n_tries = 0 ;
    while(success==false && n_tries<n_trigger_attempts){
      n_tries++ ;
      gammaStar.decay_top_level(mu) ;
      particles = recursively_add_particles(gammaStar, []) ;
      
      // Check the triggers
      for(var i=0 ; i<detector.triggers.length ; i++){
        if(detector.triggers[i].analyse_particles(particles)){
          success = true ;
          break ;
        }
      }
    }
    // Update particles so that they are aware of their indices
    for(var i=0 ; i<particles.length ; i++){
      particles[i].id = i ;
      particles[i].raw_indices = [i] ;
    }
      
    // Write table early to help with debugging
    //if(counter%table_interval==0) write_particle_info_table(particles) ;
    if(success){
      n_success++ ;
      // Set all cells to cold
      for(var i=0 ; i<detector.components.length ; i++){
        for(var j=0 ; j<detector.components[i].cells.length ; j++){
          detector.components[i].cells[j].make_hot(false) ;
        }
      }
      
      // Make particle trajectories
      var paths = detector.process_particles(particles) ;
      
      // Reconstruct particles (needs more work!)
      for(var i=0 ; i<particles.length ; i++){ particles[i].reconstruct() ; }
      
      // Create a new event
      var event = new event_container(particles) ;
      
      var reco_particles = [] ;
      for(var i=0 ; i<collection_names.length ; i++){
        var coll = collections[collection_names[i]] ;
        if(coll.is_raw_list){
          coll.populate_list_from_event(event) ;
        }
        else{
          coll.populate_from_daughters() ;
        }
        for(var j=0 ; j<coll.list.length ; j++){
          reco_particles.push(coll.list[j]) ;
        }
      }
      var all_particles = particles.concat(reco_particles) ;
      //write_particle_info_table(all_particles) ;
      
      // Fill histograms
      for(var i=0 ; i<fill_rules.length ; i++){
        fill_rules[i].fill() ;
      }
      
      // Draw everything
      // Do this late, to make debugging easier
      if((counter%draw_interval)==0){
        draw_detector(paths) ;
      }
      if((counter%plotspace_draw_interval)==0){
        for(var i=0 ; i<plot_names.length ; i++){
          if(plot_spaces[plot_names[i]]){
            plot_spaces[plot_names[i]].draw() ;
          }
        }
      }
      
      if(success){
        if(record_events){
          events.push(event) ;
          event_index = events.length-1 ;
        }
        Get('span_event_index').innerHTML = event_index ;
      }
      
      // Do this again so we get the reco values as well
      if(counter%table_interval==0) write_particle_info_table(particles) ;
    }
    else{
      n_failure++ ;
    }
    
    counter++ ;
    Get('span_nEvents').innerHTML = events.length + ' / ' + counter ;
    Get('span_event_success').innerHTML = n_success ;
    Get('span_event_failure').innerHTML = n_failure ;
  }
  
  // If we're stepping through one event at a time, make sure to pause again after we finish the event
  if(one_event){
    pause = true ;
    one_event = false ;
    Get('submit_pause').value = 'Start!' ;
  }
  
  // Send another heartbeat
  window.setTimeout(heartbeat, delay) ;
}





