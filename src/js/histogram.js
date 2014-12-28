function histogram_object(name, xaxis_title, lower, upper, nBins, units, fill_color){
  this.name  = name ;
  this.lower = lower ;
  this.upper = upper ;
  this.nBins = nBins ;
  this.units = units ;
  this.binWidth = (this.upper-this.lower)/this.nBins ;
  this.xaxis_title = xaxis_title ;
  this.fill_color = fill_color ;
  this.yaxis_title = 'entries per ' + this.binWidth.toPrecision(2) + ' ' + units ;
  this.default_color = 'rgb(0,0,0)' ;
  this.locked = false ;
  this.events = 0 ;
    
  this.underflow = 0 ;
  this.overflow  = 0 ;
  this.bins        = [] ;
  this.bin_errors  = [] ;
  this.active_bins = [] ;
  for(var i=0 ; i<=this.nBins ; i++){
    var l = this.lower + (this.upper-this.lower)*(i+0)/this.nBins ;
    var u = this.lower + (this.upper-this.lower)*(i+1)/this.nBins ;
    this.bins.push(new histogram_bin(l, u, 0, 0, i)) ;
  }
  
  this.bin_lower = function(index){ this.bins[index].lower ; }
  this.bin_upper = function(index){ this.bins[index].upper ; }
  this.get_sum = function(){
    var sum = 0 ;
    for(var bin=1 ; bin<this.nBins ; bin++){
      sum += this.bins[bin].value ;
    }
    return sum ;
  }
  
  this.xaxis = new axis_object(this.lower, this.upper, this.nBins, this.xaxis_title, this.units, 'x') ;
  this.yaxis = new axis_object(         0,          1,          0, this.yaxis_title, this.units, 'y') ;
  
  this.update_events = function(){
    this.events += prescale ;
  }
  this.fill_array = function(x){
    for(var i=0 ; i<x.length ; i++){
      this.fill(x[i], 1.0/x.length) ;
    }
  }
  this.fill = function(x,w){
    if(w==null || w==undefined) w = 1 ;
    if(x<=this.lower){
      this.underflow += w ;
      return ;
    }
    if(x>this.upper){
      this.overflow += w ;
      return ;
    }
    if(isNaN(x)) return ;
    var index = floor(this.nBins*(x-this.lower)/(this.upper-this.lower)) ;
    var bin = this.bins[index] ;
    bin.active = true ;
    bin.value += w ;
    bin.error += w*w ;
  }
  this.draw = function(plot_space, options){
    var ml = plot_space.margin_left   ;
    var mr = plot_space.margin_right  ;
    var mt = plot_space.margin_top    ;
    var mb = plot_space.margin_bottom ;
    var cw = plot_space.w ;
    var ch = plot_space.h ;
    var pw = cw-ml-mr ;
    var ph = ch-mt-mb ;
    var xl = plot_space.x_lower ;
    var xu = plot_space.x_upper ;
    var c  = plot_space.context ;
    c.lineWidth = 1 ;
    
    // Clear the plot space if this if the first histogram to be drawn
    if(options.indexOf('s')==-1){
      plot_space.clear() ;
      plot_space.bin_max = this.bin_max ;
    }
    
    var bin_max = 1 ;
    if(options.indexOf('s')==-1){
      var bin_error_max = 1 ;
      for(var i=0 ; i<nBins ; i++){
        var value = this.bins[i].value+sqrt(this.bins[i].error)
        if(value>bin_max){
          bin_max = value ;
          bin_error_max = this.bins[i].error ;
        }
      }
      if(bin_max>5e2){ bin_max *= 1.25 ; }
      else{ bin_max += 2*sqrt(bin_error_max) ; }
      plot_space.bin_max = bin_max ;
    }
    else{ bin_max = plot_space.bin_max ; }
    
    // Draw the bin contents
    c.beginPath() ;
    if(options.indexOf('l')!=-1){ // Line
      c.strokeStyle = this.default_color ;
      c.strokeStyle = 'rgb(' + this.fill_color + ')' ;
      c.lineWidth = 2 ;
      c.moveTo(ml,ch-mb) ;
    }
    for(var i=0 ; i<nBins ; i++){
      if(this.bins[i].lower<xl) continue ;
      if(this.bins[i].upper>xu) continue ;
      var value = this.bins[i].value ;
      var error = this.bins[i].error ;
      var u1 = ml + pw*(i+0.0)/nBins ;
      var u2 = ml + pw*(i+0.5)/nBins ;
      var u3 = ml + pw*(i+1.0)/nBins ;
      
      if(options.indexOf('e')!=-1){ // Error bars
        if(value==0) continue ;
        c.fillStyle   = this.default_color ;
        c.strokeStyle = this.default_color ;
        c.fillStyle   = 'rgb(' + this.fill_color + ')' ;
        c.strokeStyle = 'rgb(' + this.fill_color + ')' ;
        if(this.bins[i].active){ c.fillStyle   = 'rgb(255,255,255)' ; }
        
        var v = ch - mb - ph*value/bin_max ;
        var r = min(0.5*pw/nBins,5) ;
        
        var v_up   = max(mt,v-ph*sqrt(error)/bin_max) ;
        var v_down = max(mt,v+ph*sqrt(error)/bin_max) ;
        c.beginPath() ;
        c.moveTo(u2,v_down) ;
        c.lineTo(u2,v_up  ) ;
        c.stroke() ;
        
        c.beginPath() ;
        c.arc(u2, v, r, 0, 2*pi, true) ;
        c.fill() ;
        c.stroke() ;
      }
      else if(options.indexOf('l')!=-1){ // Line
        var v = max(mt,ch-mb-ph*value/bin_max) ;
        c.lineTo(u1,v) ;
        c.lineTo(u3,v) ;
      }
      else{
        // Bar chart
        c.fillStyle   = this.default_color ;
        c.fillStyle = 'rgb(' + this.fill_color + ')' ;
        var v = ch - mb ;
        var w = pw/nBins ;
        var h = -ph*value/bin_max ;
        c.fillRect(u1,v,w,h) ;
      }
    }
    if(options.indexOf('l')!=-1){
    c.moveTo(cw-mr,ch-mb) ;
      c.stroke() ;
    }
    
    if(options.indexOf('s')==-1){
      // Draw bounding rectangle
      c.lineWidth = 1 ;
      c.strokeStyle = 'rgb(0,0,0)' ;
      c.strokeRect(ml,mt,pw,ph) ;
      
      // Draw the axes
      this.xaxis.draw(plot_space, 0) ;
      this.yaxis.draw(plot_space, bin_max) ;
    }
    for(var i=0 ; i<this.nBins ; i++){ this.bins[i].active = false ; }
  }
  this.update_histogram_roster = function(){
    var id = 'tr_histogram_roster_' + this.name ;
    if(Get(id)) return ;
    var tbody = Get('tbody_histogram_roster') ;
    var tr = Create('tr') ;
    tr.id = id ;
    var td ;
    td = Create('td') ; td.className = 'histogram_roster' ; td.innerHTML = this.name ; tr.appendChild(td) ;
    td = Create('td') ; td.className = 'histogram_roster' ; td.innerHTML = this.xaxis_title ; tr.appendChild(td) ;
    td = Create('td') ; td.className = 'histogram_roster' ; td.innerHTML = this.units ; tr.appendChild(td) ;
    td = Create('td') ; td.className = 'histogram_roster' ; td.innerHTML = this.lower ; tr.appendChild(td) ;
    td = Create('td') ; td.className = 'histogram_roster' ; td.innerHTML = this.upper ; tr.appendChild(td) ;
    td = Create('td') ; td.className = 'histogram_roster' ; td.innerHTML = this.nBins ; tr.appendChild(td) ;
    td = Create('td') ; td.className = 'histogram_roster' ; td.innerHTML = this.fill_color ; tr.appendChild(td) ;
    tbody.appendChild(tr) ;
  }
  this.update_histogram_roster() ;
  update_select_fill_histogram_histogram(this.name) ;
  
  this.make_xml_node = function(){
    var element = xmlDoc.createElement('histogram') ;
    element.setAttribute('name' , this.name ) ;
    element.setAttribute('lower', this.lower) ;
    element.setAttribute('upper', this.upper) ;
    element.setAttribute('nBins', this.nBins) ;
    element.setAttribute('units', this.units) ;
    element.setAttribute('xaxis_title', this.xaxis_title) ;
    element.setAttribute('fill_color' , this.fill_color ) ;
    element.setAttribute('underflow'  , this.underflow  ) ;
    element.setAttribute('overflow'   , this.overflow   ) ;
    
    var bin_list = xmlDoc.createElement('bin_list') ;
    for(var i=0 ; i<this.nBins ; i++){
      var bin_node = this.bins[i].make_xml_node() ;
      bin_list.appendChild(bin_node) ;
    }
    element.appendChild(bin_list) ;
    
    return element ;
  }
}
function histogram_bin(lower, upper, value, error, index){
  this.lower  = lower ;
  this.upper  = upper ;
  this.value  = value ;
  this.error  = error ;
  this.active = false ;
  this.index  = index ;
  this.make_xml_node = function(){
    var element = xmlDoc.createElement('bin') ;
    element.setAttribute('lower', this.lower) ;
    element.setAttribute('upper', this.upper) ;
    element.setAttribute('value', this.value) ;
    element.setAttribute('error', this.error) ;
    element.setAttribute('index', this.index) ;
    return element ;
  }
}
function axis_object(lower, upper, nBins, title, units, coord){
  this.lower = lower ;
  this.upper = upper ;
  this.nBins = nBins ;
  this.title = title ;
  this.units = units ;
  this.coord = coord ; // x or y
  this.range = this.upper - this.lower ;
  this.small_tick_length = 10 ;
  
  this.set_ticks_y = function(range){
    this.range = max(range,1) ;
    var range_power = floor(log(this.range)/log(10)-1) ;
    var small_tick_unit = pow(10, range_power) ;
    this.small_tick_interval = small_tick_unit ;
    var tick_options = [1, 2, 2.5, 5, 10, 20, 25, 50] ;
    for(var i=tick_options.length-1 ; i>=0 ; i--){
      var tick_size = small_tick_unit*tick_options[i] ;
      if(floor(this.range/tick_size)<10) this.small_tick_interval = tick_size ;
    }
    this.small_tick_start  = this.small_tick_interval*ceil (this.lower/this.small_tick_interval) ;
    this.small_tick_end    = this.small_tick_interval*floor(this.range/this.small_tick_interval) ;
  }
  
  this.set_ticks_x = function(){
    // Now find the small tick
    // Allow steps of 0.1, 0.2, 0.25, 0.5, 1.0
    var range_power = floor(log(this.range)/log(10)-1) ;
    var small_tick_unit = pow(10, range_power) ;
    this.small_tick_interval = small_tick_unit ;
    var tick_options = [1, 2, 2.5, 5, 10, 20, 25, 50] ;
    for(var i=tick_options.length-1 ; i>=0 ; i--){
      var tick_size = small_tick_unit*tick_options[i] ;
      if(floor(this.range/tick_size)<10) this.small_tick_interval = tick_size ;
    }
    this.small_tick_start  = this.small_tick_interval*ceil (this.lower/this.small_tick_interval) ;
    this.small_tick_end    = this.small_tick_interval*floor(this.upper/this.small_tick_interval) ;
  }
  if(this.coord=='x') this.set_ticks_x() ;
  if(this.coord=='y') this.set_ticks_y(1) ;
  
  this.draw = function(plot_space, bin_max){
    if(this.coord=='y'){ this.set_ticks_y(bin_max) ; }
    var ml = plot_space.margin_left   ;
    var mr = plot_space.margin_right  ;
    var mt = plot_space.margin_top    ;
    var mb = plot_space.margin_bottom ;
    var cw = plot_space.w ;
    var ch = plot_space.h ;
    var pw = cw-ml-mr ;
    var ph = ch-mt-mb ;
    var c = plot_space.context ;
    c.lineWidth = 1 ;
    
    c.font = '10px times' ;
    c.fillStyle = 'rgb(0,0,0)' ;
    if(this.coord=='x'){
      c.textAlign = 'center' ;
      var v1 = ch-mb ;
      var v2 =    mt ;
      c.beginPath() ;
      c.moveTo(   ml,v) ;
      c.lineTo(cw-ml,v) ;
      for(var x=this.small_tick_start ; x<=this.small_tick_end ; x+=this.small_tick_interval){
        var u = ml+(cw-ml-mr)*(x-this.lower)/this.range ;
        c.moveTo(u, v1                       ) ;
        c.lineTo(u, v1-this.small_tick_length) ;
        c.moveTo(u, v2                       ) ;
        c.lineTo(u, v2+this.small_tick_length) ;
        var x_text = (abs(x)<1) ? x.toPrecision(2) : x ;
        c.fillText(x_text, u, v1+10) ;
      }
      c.stroke() ;
      
      // Now write the title
      c.font = '15px times' ;
      c.textAlign = 'right' ;
      c.fillText(this.title, cw-1.5*mr, ch-0.25*mb) ;
    }
    else{
      c.textAlign = 'right' ;
      var u1 = ml    ;
      var u2 = cw-mr ;
      c.beginPath() ;
      c.moveTo(u,   mt) ;
      c.lineTo(u,ch-mb) ;
      
      var range_power = floor(log(this.range)/log(10)) ;
      for(var y=this.small_tick_start ; y<=this.small_tick_end ; y+=this.small_tick_interval){
        var v = ch-mb-(ch-mt-mb)*(y-this.lower)/this.range ;
        c.moveTo(u1                       , v) ;
        c.lineTo(u1+this.small_tick_length, v) ;
        c.moveTo(u2                       , v) ;
        c.lineTo(u2-this.small_tick_length, v) ;
        if(range_power>2){ c.fillText(y/pow(10,range_power).toPrecision(2), u1-5, v) ; }
        else{ c.fillText(y.toPrecision(2), u1-5, v) ; }
      }
      c.stroke() ;
      
      // Now write the title
      if(range_power>2){
        c.font = '15px times' ;
        c.fillText('x10', 0.5*ml, mt*1.5) ;
        c.font = '8px times' ;
        c.textAlign = 'left' ;
        c.fillText(range_power.toPrecision(1), 0.5*ml, mt*1.5-8) ;
      }
      
      c.save() ;
      c.translate(0.3*ml, mt*2.5) ;
      c.rotate(-0.5*pi) ;
      c.font = '15px times' ;
      c.textAlign = 'right' ;
      c.fillText(this.title, 0, 0) ;
      c.restore() ;
    }
  }
}
function histogram_from_xml(node){
  var name  = node.getAttribute('name') ;
  var lower = node.getAttribute('lower') ;
  var upper = node.getAttribute('upper') ;
  var nBins = node.getAttribute('nBins') ;
  var units = node.getAttribute('units') ;
  var fill_color  = node.getAttribute('fill_color' ) ;
  var xaxis_title = node.getAttribute('xaxis_title') ;
  var h = new histogram_object(name, xaxis_title, lower, upper, nBins, units, fill_color) ;
  h.bins        = get_array_from_xml(node, 'bin_values' ) ;
  h.bin_errors  = get_array_from_xml(node, 'bin_errors' ) ;
  h.active_bins = get_array_from_xml(node, 'active_bins') ;
  
  if(name in histograms) return h ;
  histograms[name] = h ;
  h.update_histogram_roster() ;
  return null ;
}

function create_histogram(){
  var name  = Get('input_histogram_name'  ).value ;
  var xaxis = Get('input_histogram_xaxis' ).value ;
  var unit  = Get('input_histogram_unit'  ).value ;
  var lower = Get('input_histogram_lower' ).value ;
  var upper = Get('input_histogram_upper' ).value ;
  var nBins = Get('input_histogram_nBins' ).value ;
  var color = Get('input_histogram_colour').value ;
  
  // Validate arguments
  var valid_name = true ;
  for(var i=0 ; i<histograms.length ; i++){
    if(name==histograms[i].name){
      valid_name = false ;
    }
  }
  if(!name.match('([a-zA-Z0-9])')) valid_name = false ;
  if(name.length==0) valid_name = false ;
  if(valid_name==false){
    alert('Sorry, that name is not valid.  You can only use a-z, A-Z, 0-9, and the name must be unique.') ;
    return ;
  }
  
  var valid_lower_upper = true ;
  lower = parseFloat(lower) ;
  upper = parseFloat(upper) ;
  if(isNaN(lower) || isNaN(upper)) valid_lower_upper = false ;
  if(upper<=lower) valid_lower_upper = false ;
  if(valid_lower_upper==false){
    alert('Sorry, the lower and/or upper bound values are not valid.  They must be numbers and lower must be smaller than upper.') ;
    return ;
  }
  
  var valid_nBins = true ;
  nBins = parseInt(nBins) ;
  if(isNaN(nBins)) valid_nBins = false ;
  if(nBins<=0) valid_nBins = false ;
  if(valid_nBins==false){
    alert('Sorry, the number of bins is not valid.  It must be an integer greater than zero.') ;
    return ;
  }
  
  if(color=='') color = 'rgb(0,0,0)' ;
  
  var h = new histogram_object(name, xaxis, lower, upper, nBins, unit, color) ;
  
  histograms[name] = h ;
  h.update_histogram_roster() ;
}
function plot_space_object(suffix){
  this.suffix        = suffix ;
  this.margin_left   = 50 ;
  this.margin_right  = 10 ;
  this.margin_top    = 10 ;
  this.margin_bottom = 50 ;
  
  this.canvas        = null ;
  this.div           = null ;
  this.table         = null ;
  
  this.histograms   = [] ;
  this.draw_options = [] ;
  this.draw_status  = [] ;
  
  this.x_lower = -1e30 ;
  this.x_upper =  1e30 ;
  
  // Create HTML elements to contain the plot space and form
  this.div = Create('div') ;
  this.div.className = 'plot' ;
  this.div.id = 'div_plot_'+suffix ;
  this.div.style.width = '260px' ;
  this.div.style.display = 'inline-block' ;
  Get('plot_space_wrapper').insertBefore(this.div, Get('submit_new_plot_space')) ;
  
  this.canvas = Create('canvas') ;
  this.canvas.id = 'canvas_plot_'+suffix ;
  this.canvas.className = 'plot' ;
  this.canvas.width  = 250 ;
  this.canvas.height = 250 ;
  this.div.appendChild(this.canvas) ;
  
  this.table = Create('table') ;
  this.table.id = 'table_plot_'+suffix ;
  this.table.className = 'plot' ;
  this.div.appendChild(this.table) ;
  
  var thead = Create('thead') ;
  var tr ;
  var th ;
  tr = Create('tr') ;
  
  th = Create('th') ;
  th.innerHTML = 'Show' ;
  th.style.textAlign = 'center' ;
  tr.appendChild(th) ;
  
  th = Create('th') ;
  th.innerHTML = 'Histogram' ;
  th.style.textAlign = 'center' ;
  tr.appendChild(th) ;
  
  th = Create('th') ;
  th.innerHTML = 'Options' ;
  th.style.textAlign = 'center' ;
  tr.appendChild(th) ;
  
  th = Create('th') ;
  th.innerHTML = 'Actions' ;
  th.style.textAlign = 'center' ;
  tr.appendChild(th) ;
  
  thead.appendChild(tr) ;
  this.table.appendChild(thead) ;
  
  tbody = Create('tbody') ;
  tbody.id = 'tbody_plot_' + this.suffix + '_histograms' ;
  this.table.appendChild(tbody) ;
  
  this.context = this.canvas.getContext('2d') ;
  this.context.translate(0.5,0.5) ;
  this.w = this.canvas.width ;
  this.h = this.canvas.height ;
  this.clear = function(){
    this.context.fillStyle = 'rgb(255,255,255)' ;
    this.context.fillRect(0,0,this.w,this.h) ;
  }
  
  this.add_histogram = function(h, options){
    this.histograms.push(h) ;
    this.draw_options.push(options) ;
    this.draw_status.push(true) ;
  }
  
  this.fill_histogram_table = function(){
    var tbody = Get('tbody_plot_' + this.suffix + '_histograms') ;
    var tr ;
    var td ;
    var input ;
    tbody.innerHTML = '' ;
    // One row per existing histogram
    for(var i=0 ; i<this.histograms.length ; i++){
      tr = Create('tr') ;
      
      td = Create('td') ;
      td.className = 'ps_histogram_show' ;
      var input = Create('input') ;
      input.type = 'checkbox' ;
      input.id = 'input_checkbox_draw_' + this.suffix + '_' + i ;
      input.checked = (this.draw_status[i]) ? 'checked' : '' ;
      input.addEventListener('change', checkbox_plot_histogram) ;
      td.appendChild(input) ;
      tr.appendChild(td) ;
      
      td = Create('td') ;
      td.className = 'ps_histogram_name' ;
      td.innerHTML = this.histograms[i].name ;
      tr.appendChild(td) ;
      
      td = Create('td') ;
      td.className = 'ps_histogram_options' ;
      input = Create('input') ;
      input.value = this.draw_options[i] ;
      input.id = 'input_' + this.histograms[i].name + '_draw_options' ;
      input.className = 'draw_options' ;
      td.appendChild(input) ;
      tr.appendChild(td) ;
      
      td = Create('td') ;
      td.className = 'ps_histogram_remove' ;
      
      var icon = Create('img') ;
      icon.src = 'icons/icon_redo.png' ;
      icon.alt = 'Update' ;
      icon.className = 'icon_histogram' ;
      icon.id = 'icon_update_' + this.suffix + '_' + this.histograms[i].name ;
      icon.addEventListener('click', update_plot_space) ;
      td.appendChild(icon) ;
      
      var icon = Create('img') ;
      icon.src = 'icons/icon_remove.png' ;
      icon.alt = 'Remove' ;
      icon.className = 'icon_histogram' ;
      icon.addEventListener('click', remove_histogram_from_plot_space) ;
      icon.id = 'icon_remove_' + this.suffix + '_' + this.histograms[i].name ;
      td.appendChild(icon) ;
      
      var icon = Create('img') ;
      icon.src = 'icons/icon_arrow-up.png' ;
      icon.alt = 'Move up' ;
      icon.className = 'icon_histogram' ;
      icon.addEventListener('click', move_histogram_up_from_plot_space) ;
      icon.id = 'icon_up_' + this.suffix + '_' + this.histograms[i].name ;
      td.appendChild(icon) ;
      
      var icon = Create('img') ;
      icon.src = 'icons/icon_arrow-down.png' ;
      icon.alt = 'Move down' ;
      icon.className = 'icon_histogram' ;
      icon.addEventListener('click', move_histogram_down_from_plot_space) ;
      icon.id = 'icon_down_' + this.suffix + '_' + this.histograms[i].name ;
      td.appendChild(icon) ;
      
      var icon = Create('img') ;
      icon.src = (this.histograms[i].locked) ? 'icons/icon_padlock-closed.png' : 'icons/icon_padlock-open.png' ;
      icon.alt = 'Lock' ;
      icon.className = 'icon_histogram' ;
      icon.addEventListener('click', lock_histogram_from_plot_space) ;
      icon.id = 'icon_lock_' + this.suffix + '_' + this.histograms[i].name ;
      td.appendChild(icon) ;
      
      tr.appendChild(td) ;
      
      tbody.appendChild(tr) ;
    }
    
    // Then a row to add a histogram
    tr = Create('tr') ;
      
    td = Create('td') ;
    td.className = 'ps_histogram_show' ;
    tr.appendChild(td) ;
      
    td = Create('td') ;
    var select = Create('select') ;
    select.className = 'plot_histogram' ;
    select.id = 'select_plot_histogram_' + this.suffix ;
    for(var hName in histograms){
      var add_histogram = true ;
      for(var j=0 ; j<this.histograms.length ; j++){
        if(hName==this.histograms[j].name){
          add_histogram = false ;
          break ;
        }
      }
      if(add_histogram){
        var option = Create('option') ;
        option.innerHTML = hName ;
        option.value     = hName ;
        select.appendChild(option) ;
      }
    }
    td.appendChild(select) ;
    tr.appendChild(td) ;
    
    td = Create('td') ;
    input = Create('input') ;
    input.id = 'input_draw_options' ;
    input.className = 'draw_options' ;
    input.value = 'e' ;
    td.className = 'ps_histogram_options' ;
    td.appendChild(input) ;
    tr.appendChild(td) ;
      
    td = Create('td') ;
    td.className = 'ps_histogram_remove' ;
    var submit = Create('input') ;
    submit.type = 'submit' ;
    submit.value = 'Add' ;
    submit.id = 'submit_addHistogram_' + this.suffix ;
    submit.className = 'plot_submit_histogram' ;
    submit.addEventListener('click', plot_add_histogram) ;
    td.appendChild(submit) ;
    
    tr.appendChild(td) ;
    
    tbody.appendChild(tr) ;
  }
  
  this.draw = function(){
    this.clear() ;
    var first = true ;
    for(var i=0 ; i<this.histograms.length ; i++){
      if(this.draw_status[i]==false) continue ;
      var option = this.draw_options[i] ;
      if(!first) option += 's' ;
      this.x_lower = this.histograms[i].lower ;
      this.x_upper = this.histograms[i].upper ;
      this.histograms[i].draw(this, option) ;
      first = false ;
    }
  }
  this.get_histogram_index = function(hName){
    for(var i=0 ; i<this.histograms.length ; i++){
      if(this.histograms[i].name==hName) return i ;
    }
    return -1 ;
  }
}

// Called when user creates a new fill rule for a histogram
function submit_fillHisto(){
  var cName = get_selected_option('select_fill_histogram_collection') ;
  var vName = get_selected_option('select_fill_histogram_quantity'  ) ;
  var hName = get_selected_option('select_fill_histogram_histogram' ) ;
  fill_rules.push(new fill_rule_object(cName, vName, hName)) ;
}

// Called when the user toggles a checkbox, to turn the histogram drawing on/off
function checkbox_plot_histogram(evt){
  var id = evt.target.id ;
  var pName = id.split('_')[3] ;
  var index = id.split('_')[4] ;
  plot_spaces[pName].draw_status[index] = !plot_spaces[pName].draw_status[index] ;
  plot_spaces[pName].draw() ;
}
function update_plot_space(evt){
  var id = evt.target.id ;
  var pName = id.split('_')[2] ;
  var hName = id.split('_')[3] ;
  if(histograms[hName].locked) return ;
  var p = plot_spaces[pName] ;
  var index = p.get_histogram_index(hName) ;
  if(index<0){
    p.fill_histogram_table() ;
    return ;
  }
  var options = Get('input_' + hName + '_draw_options').value ;
  p.draw_options[index] = options ;
  p.draw() ;
}

// Manipulate properties of histogram in a plot space
function remove_histogram_from_plot_space(evt){
  var id = evt.target.id ;
  var pName = id.split('_')[2] ;
  var hName = id.split('_')[3] ;
  if(histograms[hName].locked) return ;
  var p = plot_spaces[pName] ;
  var index = p.get_histogram_index(hName) ;
  if(index<0) return ;
  p.histograms.splice(index,1) ;
  p.fill_histogram_table() ;
  p.draw() ;
}
function move_histogram_up_from_plot_space(evt){
  var id = evt.target.id ;
  var pName = id.split('_')[2] ;
  var hName = id.split('_')[3] ;
  if(histograms[hName].locked) return ;
  
  // Check index, and locked status of (n-1)th histogram
  var p = plot_spaces[pName] ;
  var index = p.get_histogram_index(hName) ;
  if(index<=0) return ;
  if(p.histograms[index-1].locked) return ;
  
  // Now swap the histograms
  var h0 = p.histograms[index-1] ;
  var h1 = p.histograms[index  ] ;
  var d0 = p.draw_options[index-1] ;
  var d1 = p.draw_options[index  ] ;
  var s0 = p.draw_status[index-1] ;
  var s1 = p.draw_status[index  ] ;
  p.histograms[index-1]   = h1 ;
  p.histograms[index  ]   = h0 ;
  p.draw_options[index-1] = d1 ;
  p.draw_options[index  ] = d0 ;
  p.draw_status[index-1]  = s1 ;
  p.draw_status[index  ]  = s0 ;
  p.fill_histogram_table() ;
}
function move_histogram_down_from_plot_space(evt){
  var id = evt.target.id ;
  var pName = id.split('_')[2] ;
  var hName = id.split('_')[3] ;
  if(histograms[hName].locked) return ;
  
  // Check index, and locked status of (n-1)th histogram
  var p = plot_spaces[pName] ;
  var index = p.get_histogram_index(hName) ;
  if(index>=p.histograms.length-1) return ;
  if(p.histograms[index+1].locked) return ;
  
  // Now swap the histograms
  var h0 = p.histograms[index+1] ;
  var h1 = p.histograms[index  ] ;
  var d0 = p.draw_options[index+1] ;
  var d1 = p.draw_options[index  ] ;
  var s0 = p.draw_status[index+1] ;
  var s1 = p.draw_status[index  ] ;
  p.histograms[index+1]   = h1 ;
  p.histograms[index  ]   = h0 ;
  p.draw_options[index+1] = d1 ;
  p.draw_options[index  ] = d0 ;
  p.draw_status[index+1]  = s1 ;
  p.draw_status[index  ]  = s0 ;
  p.fill_histogram_table() ;
}
function lock_histogram_from_plot_space(evt){
  var id = evt.target.id ;
  var pName = id.split('_')[2] ;
  var hName = id.split('_')[3] ;
  
  if(histograms[hName].locked){
    histograms[hName].locked = false ;
  }
  else{
    histograms[hName].locked = true  ;
  }
  var p = plot_spaces[pName] ;
  p.fill_histogram_table() ;
}

// Called when a histogram is added to a plot space
function plot_add_histogram(evt){
  var id = evt.target.id ;
  var pName = id.split('_')[2] ;
  var s = Get('select_plot_histogram_'+pName) ;
  var hName = s.value ;
  if(hName=='') return ;
  var options = Get('input_draw_options').value ;
  var p = plot_spaces[pName] ;
  p.add_histogram(histograms[hName], options) ;
  p.draw() ;
  p.fill_histogram_table() ;
}

// Called whenever a new plot space is requested
function create_plotSpace(evt){
  var div = Get('plot_space_wrapper') ;
  var submit = evt.target ;
  var suffix = plot_space_index ;
  var pName = 'ps' + suffix ;
  var plot_space = new plot_space_object(pName) ;
  plot_space.fill_histogram_table() ;
  plot_space_index++ ;
  plot_spaces[pName] = plot_space ;
  plot_names.push(pName) ;
}

// Updates the select element for the fill histogram element when a new histogram is added
function update_select_fill_histogram_histogram(name){ // Awful function name!
  var select = Get('select_fill_histogram_histogram') ;
  var option = Create('option') ;
  option.value     = name ;
  option.innerHTML = name ;
  select.appendChild(option) ;
}

// Fits to distributions
function analytic_fit_object(){
  this.pdfs  = [] ;
  this.norms = [] ;
  this.chi2 = 1e6 ;
  this.add_pdf = function(pdf){
    this.pdfs.push(pdf) ;
    this.norms.push(1.0) ;
  }
  this.perform_fit = function(h, par_index){
    var integral = h.get_sum() ;
    if(integral<50) return false ;
    var n = 1000 ;
    var best_i = -1 ;
    for(var i=0 ; i<n ; i++){
      switch(par_index){
        case 0: this.norms[1] = integral*i/n ; break ;
        case 1: this.norms[0] = integral*i/n ; break ;
        case 2: this.pdfs[0].set_par(0, i/n) ; break ;
        case 3: this.pdfs[1].set_par(0, i/n) ; break ;
        case 4: this.pdfs[1].set_par(1, i/n) ; break ;
      }
      var chi2 = this.get_chi2(h) ;
      if(chi2<this.chi2) best_i = i ;
      switch(par_index){
        case 0: this.norms[1] = integral*best_i/n ; break ;
        case 1: this.norms[0] = integral*best_i/n ; break ;
        case 2: this.pdfs[0].set_par(0, best_i/n) ; break ;
        case 3: this.pdfs[1].set_par(0, best_i/n) ; break ;
        case 4: this.pdfs[1].set_par(1, best_i/n) ; break ;
      }
      return true ;
    }
  }
  this.get_chi2 = function(h){
    var chi2 = 0 ;
    for(var bin=0 ; bin<h.nBins ; bin++){
      if(!h.bins[bin]) continue ;
      var x = h.lower + (h.upper-h.lower)*bin/h.bins.length ;
      var dN = h.bins[bin]-this.eval(x) ;
      var bin_error = (h.bin_errors[bin]<1e-3) ? 1 : h.bin_errors[bin] ;
      var residual = dN/bin_error ;
      chi2 += pow(residual,2) ;
    }
    return chi2 ;
  }
  this.eval = function(x){
    var sum = 0 ;
    for(var i=0 ; i<this.pdfs.length ; i++){
      sum += this.norms[i]*this.pdfs[i].evaluate(x) ;
    }
    return sum ;
  }
  this.draw = function(plot_space, histo){
    var ml = plot_space.margin_left   ;
    var mr = plot_space.margin_right  ;
    var mt = plot_space.margin_top    ;
    var mb = plot_space.margin_bottom ;
    var cw = plot_space.w ;
    var ch = plot_space.h ;
    var pw = cw-ml-mr ;
    var ph = ch-mt-mb ;
    var c = plot_space.context ;
    
    c.lineWidth = 2 ;
    c.strokeStyle = 'rgb(255,0,0)' ;
    c.beginPath() ;
    for(var i=0 ; i<1000 ; i++){
      var x = histo.lower + (histo.upper-histo.lower)*i/1000 ;
      var u = ml + pw*(x-histo.lower)/(histo.upper-histo.lower) ;
      var y = this.eval(x) ;
      var v = ch - mb - ph*y/plot_space.bin_max ;
      if(i==0){
        c.moveTo(u,v) ;
      }
      else{
        c.lineTo(u,v) ;
      }
    }
    c.stroke() ;
  }
}
function abs_fit_object(pars){
  this.pars_d = [] ;
  this.pars   = [] ;
  this.pars_u = [] ;
  for(var i=0 ; i<pars.length ; i++){
    this.pars_d.push(pars[i][0]) ;
    this.pars  .push(0.5*(pars[i][0]+pars[i][1])) ;
    this.pars_u.push(pars[i][1]) ;
  }
  this.set_par = function(index, fraction){
    this.pars[index] = this.pars_d[index] + (this.pars_u[index]-this.pars_d[index])*fraction ;
  }
}
function exp_fit_object(k_d,k_u,x0){
  var expo = new abs_fit_object([[k_d,k_u]]) ;
  expo.x0 = x0 ;
  expo.evaluate = function(x){
    return exp(-this.pars[0]*(x-this.x0)) ;
  }
  return expo ;
}
function gauss_fit_object(mean_d, mean_u, sigma_d, sigma_u){
  var gaus = new abs_fit_object([[mean_d,mean_u],[sigma_d,sigma_u]]) ;
  gaus.evaluate = function(x){
    return exp(-pow(x-this.pars[0],2)/(2*pow(this.pars[1],2))) ;
  }
  return gaus ;
}
