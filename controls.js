function keyDown(evt){
  var keyDownID = window.event ? event.keyCode : (evt.keyCode != 0 ? evt.keyCode : evt.which) ;
  if(keyDownID==8) evt.preventDefault ;
  switch(keyDownID){
    case 32: // Space
      evt.preventDefault() ;
      pause = !pause ;
      one_event = false ;
      break ;
    case 39: // Right
      evt.preventDefault() ;
      pause = false ;
      one_event = true ;
      break ;
  }
}

function update_coords(){
  x0 = parseFloat(Get('input_x').value) ;
  y0 = parseFloat(Get('input_y').value) ;
  z0 = parseFloat(Get('input_z').value) ;
  t0 = parseFloat(Get('input_t').value)*Math.PI/180 ;
  p0 = parseFloat(Get('input_p').value)*Math.PI/180 ;
  r0.x = x0 ; r0.y = y0 ; r0.z = z0 ;
  image_canvas_detector['cutaway'] = undefined ;
  draw_settings['cutaway'].r0 = r0 ;
  draw_settings['cutaway'].t0 = t0 ;
  draw_settings['cutaway'].p0 = p0 ;
}
