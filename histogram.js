function histogram_object(xaxis_title, lower, upper, nBins, units, fill_color){
  this.lower = lower ;
  this.upper = upper ;
  this.nBins = nBins ;
  this.units = units ;
  this.binWidth = (this.upper-this.lower)/this.nBins ;
  this.xaxis_title = xaxis_title ;
  this.fill_color = fill_color ;
  this.yaxis_title = 'entries per ' + this.binWidth.toPrecision(2) + ' ' + units ;
  
  this.underflow = 0 ;
  this.overflow  = 0 ;
  this.bins        = [] ;
  this.bin_errors  = [] ;
  this.active_bins = [] ;
  for(var i=0 ; i<=this.nBins ; i++){
    this.bins.push(0) ;
    this.bin_errors.push(0) ;
    this.active_bins.push(false) ;
  }
  
  this.get_sum = function(){
    var sum = 0 ;
    for(var bin=1 ; bin<this.nBins ; bin++){
      sum += this.bins[bin] ;
    }
    return sum ;
  }
  
  this.xaxis = new axis_object(this.lower, this.upper, this.nBins, this.xaxis_title, this.units, 'x') ;
  this.yaxis = new axis_object(         0,          1,          0, this.yaxis_title, this.units, 'y') ;
  
  this.fill_array = function(x){
    for(var i=0 ; i<x.length ; i++){
      this.fill(x[i], 1.0/x.length) ;
    }
  }
  this.fill = function(x,w){
    if(w==null || w==undefined) w = 1 ;
    if(x<this.lower){
      this.underflow += w ;
      return ;
    }
    if(x>this.upper){
      this.overflow += w ;
      return ;
    }
    var bin = floor(this.nBins*(x-this.lower)/(this.upper-this.lower)) ;
    this.active_bins[bin]  = true ;
    this.bins       [bin] += w    ;
    this.bin_errors [bin] += w*w  ;
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
    var c = plot_space.context ;
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
        if(this.bins[i]+sqrt(this.bin_errors[i])>bin_max){
          bin_max = this.bins[i]+sqrt(this.bin_errors[i]) ;
          bin_error_max = this.bin_errors[i] ;
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
      c.strokeStyle = 'rgb(' + this.fill_color + ')' ;
      c.lineWidth = 2 ;
      c.moveTo(ml,ch-mb) ;
    }
    for(var bin=0 ; bin<nBins ; bin++){
      var value = this.bins[bin] ;
      var error = this.bin_errors[bin] ;
      var u1 = ml + pw*(bin+0.0)/nBins ;
      var u2 = ml + pw*(bin+0.5)/nBins ;
      var u3 = ml + pw*(bin+1.0)/nBins ;
      
      if(options.indexOf('e')!=-1){ // Error bars
        if(value==0) continue ;
        c.fillStyle   = 'rgb(' + this.fill_color + ')' ;
        c.strokeStyle = 'rgb(' + this.fill_color + ')' ;
        if(this.active_bins[bin]){ c.fillStyle   = 'rgb(255,255,255)' ; }
        
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
    for(var i=0 ; i<this.nBins ; i++){ this.active_bins[i] = false ; }
  }
  this.r_from_x = function(x){ return (x-this.lower)/(this.upper-this.lower) ; }
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
        c.fillText(x, u, v1+10) ;
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
        else{ c.fillText(y, u1-5, v) ; }
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

function plot_space_object(suffix){
  this.suffix        = suffix ;
  this.margin_left   = 50 ;
  this.margin_right  = 10 ;
  this.margin_top    = 10 ;
  this.margin_bottom = 50 ;
  
  this.canvas        = null ;
  if(Get('canvas_plot'+suffix)){
    this.canvas = Get('canvas_plot_'+suffix) ;
  }
  else{
    this.canvas = Create('canvas') ;
    this.canvas.id = 'canvas_plot_'+suffix ;
    this.canvas.width  = 250 ;
    this.canvas.height = 250 ;
    Get('histogram_wrapper').appendChild(this.canvas) ;
  }
  
  this.context = this.canvas.getContext('2d') ;
  this.context.translate(0.5,0.5) ;
  this.w = this.canvas.width ;
  this.h = this.canvas.height ;
  this.clear = function(){
    this.context.fillStyle = 'rgb(255,255,255)' ;
    this.context.fillRect(0,0,this.w,this.h) ;
  }
}

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
