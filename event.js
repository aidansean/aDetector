function event_container(particles){
  this.particles = particles ;
  this.photons = function(){ return filter_list_of_particles_by_pdgId(this.particles, 22) ; }
}
