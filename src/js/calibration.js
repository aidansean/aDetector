// Calibrations work as a function of particle, detector subsystem, and number of hits
// Produce simple calibration histograms:
//  Take the most populated bin as the central value
//  Then smear the by a Gaussian with sigma that contains 68% of the total histogram contents

function calibration_object(){
  this.mean  = 0.5 ;
  this.sigma = 0.1 ;
  this.analyse_histogram = function(h){
    // Find highest bin
    var highest_bin = -1 ;
    var max = -1 ;
    for(var i=0 ; i<h.bins.length ; i++){
      if(h.bins[i]>max){
        max = h.bins[i] ;
        highest_bin = i ;
      }
    }
    // Now integrate around peak to enclose 68% of the contents of the histogram
    var total = h.get_sum() ;
    var sum = 0 ;
    sum += h.bins[highest_bin] ;
    var dbin = 1 ;
    while(sum<0.68*total){
      if(highest_bin-dbin>=0           ) sum += h.bins[highest_bin-dbin] ;
      if(highest_bin+dbin<h.bins.length) sum += h.bins[highest_bin+dbin] ;
    }
    this.mean =  h.lower + (h.upper-h.lower)*(highest_bin)/h.bins.length ;
    this.sigma = h.binWidth*dbin ;
  }
  this.rescale = function(x){
    var r = this.mean + random_gaussian(this.sigma) ;
    var result = 0 ;
    if(r>=0) result = x/r ;
    return result ;
  }
}

var ecal_calibrations = [] ;


