function event_container(particles){
  this.particles = particles ;
  
  // Access particles
  this.photons     = function(){ return filter_list_of_particles_by_pdgId(this.particles,  22,  true) ; }
  this.electrons   = function(){ return filter_list_of_particles_by_pdgId(this.particles,  11,  true) ; }
  this.electrons_p = function(){ return filter_list_of_particles_by_pdgId(this.particles, -11, false) ; }
  this.electrons_m = function(){ return filter_list_of_particles_by_pdgId(this.particles,  11, false) ; }
  this.muons       = function(){ return filter_list_of_particles_by_pdgId(this.particles,  13,  true) ; }
  this.muons_p     = function(){ return filter_list_of_particles_by_pdgId(this.particles, -13, false) ; }
  this.muons_m     = function(){ return filter_list_of_particles_by_pdgId(this.particles,  13, false) ; }
  this.pions       = function(){ return filter_list_of_particles_by_pdgId(this.particles, 211,  true) ; }
  this.pions_p     = function(){ return filter_list_of_particles_by_pdgId(this.particles, 211, false) ; }
  this.pions_m     = function(){ return filter_list_of_particles_by_pdgId(this.particles,-211, false) ; }
  this.kaons       = function(){ return filter_list_of_particles_by_pdgId(this.particles, 321,  true) ; }
  this.kaons_p     = function(){ return filter_list_of_particles_by_pdgId(this.particles, 321, false) ; }
  this.kaons_m     = function(){ return filter_list_of_particles_by_pdgId(this.particles,-321, false) ; }
  
  
  this.draw = function(){
    var ecal = detector.components[2] ;
    for(var i=0 ; i<ecal.cells.length ; i++){
      ecal.cells[i].make_hot(false) ;
    }
    for(var i=0 ; i<this.particles.length ; i++){
      var p = this.particles[i] ;
      for(var j=0 ; j<p.ecal_blocks.length ; j++){
        var e = p.ecal_blocks[j] ;
        var index = ecal.seek_block(e[0].x, e[0].y, e[0].z) ;
        if(index!=-1) ecal.cells[index].make_hot(true) ;
      }
    }
    draw_detector(this.particles) ; 
  }
}
