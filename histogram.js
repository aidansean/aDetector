function histogram_object(xaxis, lower, upper, nBins, units){
  this.xaxis = xaxis ;
  this.lower = lower ;
  this.upper = upper ;
  this.nBins = nBins ;
  this.units = units ;
  this.binWidth = (this.upper-this.lower)/this.nBins ;
  this.bins = [] ;
  for(var i=0 ; i<this.nBins+1 ; i++){
    this.bins.push(0) ;
  }
  this.fill = function(x){
    var bin = Math.floor((x-lower)/this.binWidth) ;
    this.bins[bin+1]++ ;
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
    for(var i=1 ; i<=nBins ; i++){
      if(this.bins[i]>bin_max) bin_max = this.bins[i] ;
    }
    bin_max*=1.25 ;
    c.fillStyle = 'rgb(0,255,0)' ;
    for(var i=1 ; i<=nBins ; i++){
      var x = ml + pw*(i-1)/nBins ;
      var y = ch - mb ;
      var w = pw/nBins ;
      var h = -ph*this.bins[i]/bin_max ;
      c.fillRect(x,y,w,h) ;
      c.beginPath() ;
      c.moveTo(x,y) ;
      c.lineTo(x,y-10) ;
      if(i%5==0) c.stroke() ;
    }
    c.font = '20px times' ;
    c.textAlign = 'center' ;
    c.fillStyle = 'rgb(0,0,0)' ;
    c.fillText(xaxis, ml+0.5*pw, ch-0.25*mb) ;
    
    c.font = '10px times' ;
    for(var x=100*Math.floor(this.lower/100) ; x<this.upper+1 ; x+=400){
      var r = this.r_from_x(x) ;
      var u = ml + r*pw ;
      var v = ch - 0.75*mb ;
      c.fillText(x, u, v) ;
    }
  }
  this.r_from_x = function(x){
    return (x-this.lower)/(this.upper-this.lower) ;
  }
}

function plot_space(){
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
