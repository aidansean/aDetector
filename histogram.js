function histogram_object(xaxis, lower, upper, nBins, units){
  this.lower = lower ;
  this.upper = upper ;
  this.nBins = nBins ;
  this.units = units ;
  this.binWidth = (this.upper-this.lower)/this.nBins ;
  this.xaxis = xaxis ;
  this.yaxis = 'events per ' + this.binWidth.toPrecision(2) + ' ' + units ;
  this.bins = [] ;
  this.bin_errors = [] ;
  this.active_bins = [] ;
  for(var i=0 ; i<this.nBins+1 ; i++){
    this.bins.push(0) ;
    this.bin_errors.push(0) ;
    this.active_bins.push(false) ;
  }
  this.fill = function(x,w){
    if(w==null || w==undefined) w = 1 ;
    var bin = Math.floor((x-lower)/this.binWidth) ;
    if(bin<1||bin>this.bins.length) return ;
    this.active_bins[bin] = true ;
    this.bins[bin+1]       += w   ;
    this.bin_errors[bin+1] += w*w ;
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
    plot_space.clear() ;
    c.strokeStyle = 'rgb(0,0,0)' ;
    c.strokeRect(ml,mt,pw,ph) ;
    var bin_max = 1 ;
    var bin_error_max = 1 ;
    for(var i=1 ; i<=nBins ; i++){
      if(this.bins[i]+Math.sqrt(this.bin_errors[i])>bin_max){
        bin_max = this.bins[i]+Math.sqrt(this.bin_errors[i]) ;
        bin_error_max = this.bin_errors[i] ;
      }
    }
    if(bin_max>5e2){
      bin_max *= 1.25 ;
    }
    else{
      bin_max += 2*Math.sqrt(bin_error_max) ;
    }
    
    // Draw the bin contents
    for(var i=1 ; i<=nBins ; i++){
      if(options.indexOf('e')!=-1){
        if(this.bins[i]==0) continue ;
        c.fillStyle   = 'rgb(0,0,0)' ;
        c.strokeStyle = 'rgb(0,0,0)' ;
        if(this.active_bins[i]){
          c.fillStyle   = 'rgb(255,0,0)' ;
          c.strokeStyle = 'rgb(255,0,0)' ;
        }
        var u = ml + pw*(i-0.5)/nBins ;
        var v = ch - mb - ph*this.bins[i]/bin_max ;
        var r = 0.5*pw/nBins ;
        c.beginPath() ;
        c.arc(u, v, r, 0, 2*Math.PI, true) ;
        c.fill() ;
        
        var v_up   = v-ph*Math.sqrt(this.bin_errors[i])/bin_max ;
        var v_down = v+ph*Math.sqrt(this.bin_errors[i])/bin_max ;
        c.beginPath() ;
        c.moveTo(u,v_down) ;
        c.lineTo(u,v_up  ) ;
        c.stroke() ;
      }
      else{
        // Bar chart
        c.fillStyle = 'rgb(0,255,0)' ;
        var u = ml + pw*(i-1)/nBins ;
        var v = ch - mb ;
        var w = pw/nBins ;
        var h = -ph*this.bins[i]/bin_max ;
        c.fillRect(u,v,w,h) ;
      }
    }
    this.draw_axes(plot_space, bin_max) ;
    for(var i=0 ; i<this.nBins+1 ; i++){
      this.active_bins[i] = false ;
    }
  }
  this.draw_axes = function(plot_space, bin_max){
    if(bin_max<10) bin_max = 10 ;
    var ml = plot_space.margin_left   ;
    var mr = plot_space.margin_right  ;
    var mt = plot_space.margin_top    ;
    var mb = plot_space.margin_bottom ;
    var cw = plot_space.w ;
    var ch = plot_space.h ;
    var pw = cw-ml-mr ;
    var ph = ch-mt-mb ;
    var c = plot_space.context ;
    var tick_length = 5 ;
  
    // x-axis
    var x_range = this.upper-this.lower ;
    var x_small_tick = Math.pow(10, Math.floor(Math.log(x_range)/Math.log(10))-1) ;
    var n_small_ticks = x_range/x_small_tick ;
    while(n_small_ticks>8){
      x_small_tick *= 2 ;
      n_small_ticks = Math.floor(x_range/x_small_tick) ;
    }
    var x_tick_start = x_small_tick*(Math.floor(this.lower/x_small_tick)) ;
    var x_tick_end   = x_small_tick*(Math.floor(this.upper/x_small_tick)) ;
    if(x_tick_start<this.lower) x_tick_start += x_small_tick ;
    var v = ch - mb ;
    c.strokeStyle = 'rgb(0,0,0)' ;
    c.font = '10px times' ;
    c.fillStyle = 'rgb(0,0,0)' ;
    c.textAlign = 'center' ;
    for(var x=x_tick_start ; x<=x_tick_end ; x+=x_small_tick){
      var u = ml+pw*this.r_from_x(x) ;
      c.beginPath() ;
      c.moveTo(u,v) ;
      c.lineTo(u,v-tick_length) ;
      c.moveTo(u,mt) ;
      c.lineTo(u,mt+tick_length) ;
      c.stroke() ;
      c.fillText(x, u, v+10) ;
    }
    
    // x-axis title
    c.font = '15px times' ;
    c.textAlign = 'right' ;
    c.fillText(this.xaxis + ' [' + this.units + ']', cw-1.5*mr, ch-0.25*mb) ;
    
    // y-axis
    var y_range = bin_max ;
    var y_small_tick = Math.pow(10, Math.floor(Math.log(y_range)/Math.log(10))-1) ;
    var n_small_ticks = y_range/y_small_tick ;
    while(n_small_ticks>10){
      y_small_tick *= 2 ;
      n_small_ticks = Math.floor(y_range/y_small_tick) ;
    }
    var y_tick_start = y_small_tick*(1 + Math.floor(0)) ;
    var y_tick_end   = y_small_tick*(    Math.floor(bin_max/y_small_tick)) ;
    var u = ml ;
    c.font = '10px times' ;
    c.fillStyle = 'rgb(0,0,0)' ;
    c.textAlign = 'right' ;
    var power = Math.floor(Math.log(bin_max)/Math.log(10)) ;
    for(var y=y_tick_start ; y<=y_tick_end ; y+=y_small_tick){
      var v = ch-mb-ph*y/bin_max ;
      c.beginPath() ;
      c.moveTo(u   ,v) ;
      c.lineTo(u+tick_length,v) ;
      c.moveTo(cw-mr   ,v) ;
      c.lineTo(cw-mr-tick_length,v) ;
      c.stroke() ;
      if(power>2){
        c.fillText(y/Math.pow(10,power).toPrecision(2), u-5, v) ;
      }
      else{
        c.fillText(y, u-5, v) ;
      }
    }
    
    // y-axis unit
    if(power>2){
      c.font = '15px times' ;
      c.fillText('x10', 0.5*ml, mt*1.5) ;
      c.font = '8px times' ;
      c.textAlign = 'left' ;
      c.fillText(power.toPrecision(1), 0.5*ml, mt*1.5-8) ;
    }
    
    // y-axis title
    c.save() ;
    c.translate(0.3*ml, mt*2.5) ;
    c.rotate(-0.5*Math.PI) ;
    c.font = '15px times' ;
    c.textAlign = 'right' ;
    c.fillText(this.yaxis, 0, 0) ;
    c.restore() ;
  }
  this.r_from_x = function(x){ return (x-this.lower)/(this.upper-this.lower) ; }
}

function plot_space_object(){
  this.margin_left   = 50 ;
  this.margin_right  = 10 ;
  this.margin_top    = 10 ;
  this.margin_bottom = 50 ;
  this.canvas = Get('canvas_plot') ;
  this.context = this.canvas.getContext('2d') ;
  this.context.translate(0.5,0.5) ;
  this.w = this.canvas.width ;
  this.h = this.canvas.height ;
  this.clear = function(){
    this.context.fillStyle = 'rgb(255,255,255)' ;
    this.context.fillRect(0,0,this.w,this.h) ;
  }
}
