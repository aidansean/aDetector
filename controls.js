function initialise_coordinates(){
  Get('input_x').value = x0 ;
  Get('input_y').value = y0 ;
  Get('input_z').value = z0 ;
  Get('input_t').value = t0*180/pi ;
  Get('input_p').value = p0*180/pi ;
}

// Keyboard interactions
function keyDown(evt){
  var keyDownID = window.event ? event.keyCode : (evt.keyCode != 0 ? evt.keyCode : evt.which) ;
  if(keyDownID==8) evt.preventDefault ;
  switch(keyDownID){
    case 13: // Enter
      evt.preventDefault() ;
      step_one_event() ;
      break ;
    //case 32: // Space
    //  evt.preventDefault() ;
    //  toggle_pause() ;
    //  break ;
    case 37: // Left
      evt.preventDefault() ;
      previous_event() ;
      break ;
    case 39: // Right
      evt.preventDefault() ;
      next_event() ;
      break ;
  }
}

// Move forward and backward in the event store
function previous_event(){
  event_index = max(0,event_index-1) ;
  if(event_index>=events.length) return ;
  var particles = events[event_index].particles ;
  var paths = detector.process_particles(particles) ;
  draw_detector(paths) ;
  write_particle_info_table(particles) ;
  Get('span_event_index').innerHTML = event_index ;
}
function next_event(){
  event_index = min(events.length-1,event_index+1) ;
  if(event_index<0) return ;
  var particles = events[event_index].particles ;
  var paths = detector.process_particles(particles) ;
  draw_detector(paths) ;
  write_particle_info_table(particles) ;
  Get('span_event_index').innerHTML = event_index ;
}

// Not as trivial as it sounds!
function toggle_pause(){
  if(pause){ Get('submit_pause').value = 'Pause'  ; }
  else{      Get('submit_pause').value = 'Start!' ; }
  pause = !pause ;
  one_event = false ;
}
function step_one_event(){
  pause = false ;
  one_event = true ;
}

function update_coords(){
  // Don't forget to change radians to degrees
  x0 = parseFloat(Get('input_x').value) ;
  y0 = parseFloat(Get('input_y').value) ;
  z0 = parseFloat(Get('input_z').value) ;
  t0 = parseFloat(Get('input_t').value)*pi/180 ;
  p0 = parseFloat(Get('input_p').value)*pi/180 ;
  r0.x = x0 ; r0.y = y0 ; r0.z = z0 ;
  
  // Need to render the detector views again, so update those settings
  image_canvas_detector['cutaway'] = undefined ;
  draw_settings['cutaway'].r0 = r0 ;
  draw_settings['cutaway'].t0 = t0 ;
  draw_settings['cutaway'].p0 = p0 ;
}

function add_eventListeners(){
  document.addEventListener('keydown', keyDown) ;
  Get('submit_coords'  ).addEventListener('click', update_coords  ) ;
  Get('submit_pause'   ).addEventListener('click', toggle_pause   ) ;
  Get('submit_stepOne' ).addEventListener('click', step_one_event ) ;
  Get('submit_previous').addEventListener('click', previous_event ) ;
  Get('submit_next'    ).addEventListener('click', next_event     ) ;
  
  Get('submit_reco_particle_create'    ).addEventListener('click', make_new_reco_particle) ;
  Get('submit_reco_particle_addList'   ).addEventListener('click', add_reco_particle_collection_tr) ;
  Get('submit_reco_particle_removeList').addEventListener('click', remove_reco_particle_collection_tr) ;
}


