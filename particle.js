function particle_object(m, q, r0, unstable){
  // Intrinsic properties
  this.q = q ;
  this.m = m ;
  
  // r and p values
  this.r_0  = make_point(r0[0],r0[1],r0[2]) ;
  this.p4_0 = new fourVector() ;
  this.p4_r = new fourVector() ;
  
  this.mother = null ;
  this.is_unstable = unstable ;
  if(this.is_unstable){ this.r_decay = make_point(r0[0],r0[1],r0[2]) ; }
  
  var phi_theta = random_phi_theta() ;
  var phi   = phi_theta[0] ;
  var theta = phi_theta[1] ;
  
  this.p = 0 ;
  this.p4_0.x = 0 ;
  this.p4_0.y = 0 ;
  this.p4_0.z = 0 ;
  this.p4_0.t = this.m ;
  
  this.p4_r.x = 0 ;
  this.p4_r.y = 0 ;
  this.p4_r.z = 0 ;
  this.p4_r.t = this.m ;
  
  // Daughter information
  this.daughters = [] ;
  this.raw_indices = [] ;
  
  this.helicity = function(){
    // Return cos(theta_helicity)
    if(this.daughters.length!=2) return 0 ;
    var b = this.p4_r.boostVector() ;
    var p4 = new fourVector() ;
    p4.x = this.daughters[0].p4_r.x ;
    p4.y = this.daughters[0].p4_r.y ;
    p4.z = this.daughters[0].p4_r.z ;
    p4.t = this.daughters[0].p4_r.t ;
    var v = p4.boost(b,-1) ;
    var costH = b.cos_angle_vector(v.p3()) ;
    return abs(costH) ;
  }
  
  // Detector interaction
  this.tracker_blocks = [] ;
  this.ecal_blocks    = [] ;
  this.hcal_blocks    = [] ;
  
  this.add_block = function(xyz, p4, block){
    if(block.type=='tracker') this.add_tracker_block(xyz, p4, block) ;
    if(block.type=='ecal'   ) this.add_ecal_block   (xyz, p4, block) ;
    if(block.type=='hcal'   ) this.add_hcal_block   (xyz, p4, block) ;
  }
  
  this.add_tracker_block = function(xyz, p4, block){
    if(this.q==0) return ;
    this.tracker_blocks.push([xyz,block,p4]) ;
    if(block.cell) block.cell.make_hot(true) ;
  }
  this.add_ecal_block = function(xyz, p4, block){
    if(p4[4]<1) return ;
    this.ecal_blocks.push([xyz,block,p4]) ;
    if(block.cell) block.cell.make_hot(true) ;
  }
  this.add_hcal_block = function(xyz, p4, block){
    if(p4[4]<1) return ;
    this.hcal_blocks.push([xyz,block,p4]) ;
    if(block.cell) block.cell.make_hot(true) ;
  }
  
  this.choose_random_decay = function(){
    var rand = random() ;
    var p = 0 ;
    var pdgIds = null ;
    for(var i=0 ; i<this.decays.length ; i++){
      p += this.decays[i][0] ;
      if(rand<p){
        pdgIds = this.decays[i][1] ;
        break ;
      }
    }
    if(this.matter==-1 && abs(this.pdgId)!=999){
      for(var i=0 ; i<pdgIds.length ; i++){ pdgIds[i] *= -1 ; }
    }
    return pdgIds ;
  }
  this.decay_top_level = function(m){
    this.daughters = [] ;
    this.decay_recursive(m) ;
    this.daughters = multibody_decay(this.pdgId, this.p4_0, this.daughters, 0) ;
    this.post_decay_V0() ;
    return this.daughters ;
  }
  this.decay_recursive = function(m){
    if(this.pdgId==999){
      for(var i=0 ; i<this.daughters.length ; i++){
        this.daughters[i].decay_recursive(this.daughters[i].m) ;
      }
      this.daughters = multibody_decay(this.pdgId, this.p4_0, this.daughters, 0) ;
      var b = this.p4_0.boostVector() ;
      for(var i=0 ; i<this.daughters.length ; i++){ recursively_boost_daughters(this.daughters[i], b) ; }
      return ;
    }
    if(this.decays.length==0) return [] ;
    var pdgIds = this.choose_random_decay() ;
    this.pdgIds = pdgIds ;
    if(pdgIds==null) return [] ;
    
    var n_jets = 0 ;
    var n_q    = 0 ;
    var n_qbar = 0 ;
    var jet_indices = [] ;
    var remaining_mass = m ;
    var r0 = this.r_0 ;
    for(var i=0 ; i<pdgIds.length ; i++){
      if(abs(pdgIds[i])>0 && abs(pdgIds[i])<10){
        n_jets++ ;
        jet_indices.push(i) ;
        if(pdgIds[i]>0){
          n_q++ ;
        }
        else{
          n_qbar++ ;
        }
      }
      else{
        var particle = make_particle(pdgIds[i], [r0.x, r0.y, r0.z]) ;
        if(particle){
          particle.mother = this ;
          this.daughters.push(particle) ;
          remaining_mass -= particle.p4_0.m() ;
        }
      }
    }
    // Bump up the mass by 50MeV if we need to
    if(remaining_mass<0){
      this.m += (50-remaining_mass) ;
      m += (50-remaining_mass) ;
    }
    
    var jet_quarks = [] ;
    var jet_m0s    = [] ;
    if(n_jets%2==0){
      // Phew, all balanced jets!
      var n_qq = n_jets/2 ;
      var quark_pairs = [] ;
      for(var i=0 ; i<n_qq ; i++){
        var q = choose_qq_pair(m_ss+100) ;
        quark_pairs.push(q) ;
        quark_pairs.push(q) ;
      }
      for(var i=0 ; i<jet_indices.length ; i++){
        var q1 = pdgIds[jet_indices[i]]
        var q2 = (q1>0) ? -quark_pairs[i] : quark_pairs[i] ;
        jet_quarks.push([ q1 , q2 ]) ;
        jet_m0s.push(quark_pair_mass(q1, q2)) ;
      }
    }
    for(var i=0 ; i<jet_quarks.length ; i++){
      var success = false ;
      var c = 0 ;
      while(success==false && c<10){
        c++
        var jet = new jet_object(jet_quarks[i][0], jet_quarks[i][1], [r0.x, r0.y, r0.z], 0, 0, 0, remaining_mass*0.75) ;
        if(jet.is_valid==true){
          success = true ;
          jet.mother = this ;
          this.daughters.push(jet) ;
          remaining_mass -= jet.p4_0.m() ;
        }
      }
    }
    
    // This bit needs sorting into a heirachy
    for(var i=0 ; i<this.daughters.length ; i++){
      this.daughters[i].decay_recursive(this.daughters[i].m) ;
    }
    return this.daughters ;
  }
  
  this.post_decay_V0 = function(){
    // Recursively go through daughters, look for KS, KL, and Lambda particles
    // Then change their r0 values to take non-zero flight length into account
    recursively_displace(this, 0, 0, 0) ;
  }
  this.normalise_decays = function(){
    if(this.decays.length==0) return ;
    var total = 0 ;
    for(var i=0 ; i<this.decays.length ; i++){
      total += this.decays[i][0] ;
    }
    for(var i=0 ; i<this.decays.length ; i++){
      this.decays[i][0] /= total ;
    }
  }
  
  this.find_best_tracker_hits = function(){
    // Find the hits closest to the radial center of the tracker cells
    // First find list of unique blocks
    var tracker_indices = [] ;
    for(var i=0 ; i<this.tracker_blocks.length ; i++){
      this.tracker_blocks[i][1].is_best_hit = false ;
      var add = true ;
      for(var j=0 ; j<tracker_indices.length ; j++){
        if(tracker_indices[j]==this.tracker_blocks[i][1].i){
          add = false ;
          break ;
        }
      }
      if(add) tracker_indices.push(this.tracker_blocks[i][1].i) ;
    }
    this.n_tracker_hits = tracker_indices.length ;
    
    // Find the indicies of the best hits
    this.best_tracker_indices = [] ;
    for(var i=0 ; i<tracker_indices.length ; i++){
      var best_dr2 = 1e6 ;
      var best_index = -1 ;
      for(var j=0 ; j<this.tracker_blocks.length ; j++){
        if(this.tracker_blocks[j][1].i!=tracker_indices[i]) continue ;
        var xyz = this.tracker_blocks[i][0] ;
        var r = this.tracker_blocks[j][1].r_center ;
        var dr2 = abs(xyz[0]*xyz[0]+xyz[1]*xyz[1]-r*r) ;
        if(dr2<best_dr2){
          best_dr2 = dr2 ;
          best_index = j ;
        }
      }
      if(best_index>=0){
        this.best_tracker_indices.push(best_index) ;
      }
    }
    
    // Trim out the worse hits
    var updated_tracker_blocks = [] ;
    for(var i=0 ; i<this.best_tracker_indices.length ; i++){
      updated_tracker_blocks.push(this.tracker_blocks[this.best_tracker_indices[i]]) ;
    }
    this.tracker_blocks = updated_tracker_blocks ;
  }
  this.sum_calo_cells = function(blocks){
    // First find list of unique blocks
    var indices = [] ;
    for(var i=0 ; i<blocks.length ; i++){
      var add = true ;
      for(var j=0 ; j<indices.length ; j++){
        if(indices[j]==blocks[i][1].i){
          add = false ;
          break ;
        }
      }
      if(add) indices.push(blocks[i][1].i) ;
    }
    var deposits = [] ;
    for(var i=0 ; i<indices.length ; i++){
      deposits.push(0) ;
      for(var j=0 ; j<blocks.length ; j++){
        var block = blocks[j] ;
        if(block[1].i!=indices[i]) continue ;
        deposits[i] += block[2][4] ;
      }
    }
    return [indices.length,deposits] ;
  }
  this.sum_ecal_cells = function(){
    var results = this.sum_calo_cells(this.ecal_blocks) ;
    this.ecal_block_indices = results[0] ;
    this.ecal_deposits = results[1] ;
    
    // Consolidate blocks
    var updated_ecal_blocks = [] ;
    for(var i=0 ; i<this.ecal_block_indices.length ; i++){
      updated_ecal_blocks.push(this.ecal_blocks[this.ecal_block_indices[i]]) ;
    }
    this.ecal_blocks = updated_ecal_blocks ;
  }
  this.sum_hcal_cells = function(){
    var results = this.sum_calo_cells(this.hcal_blocks) ;
    this.hcal_block_indices = results[0] ;
    this.hcal_deposits = results[1] ;
    
    // Consolidate blocks
    var updated_hcal_blocks = [] ;
    for(var i=0 ; i<this.hcal_block_indices.length ; i++){
      updated_hcal_blocks.push(this.ecal_blocks[this.hcal_block_indices[i]]) ;
    }
    this.hcal_blocks = updated_hcal_blocks ;
  }
  
  this.reconstruct = function(){
    this.p4_r.x = this.p4_0.x ;
    this.p4_r.y = this.p4_0.y ;
    this.p4_r.z = this.p4_0.z ;
    this.p4_r.t = this.p4_0.t ;
    this.find_best_tracker_hits() ;
    this.sum_ecal_cells() ;
    this.sum_hcal_cells() ;    
    this.ecal_energy = 0 ;
    this.hcal_energy = 0 ;
    for(var i=0 ; i<this.ecal_deposits.length ; i++){ this.ecal_energy += this.ecal_deposits[i] ; }
    for(var i=0 ; i<this.hcal_deposits.length ; i++){ this.hcal_energy += this.hcal_deposits[i] ; }
    
    if(this.ecal_deposits.length + this.ecal_deposits.length + this.tracker_blocks.length==0) return ;
    
    this.n_tracker_hits = this.tracker_blocks.length ;
    // Require at least three hits to get a good measure of pT and pz
    // pT is proportional to radius of curvature
    // So make pT resolution proportional to 1/sqrt(n_hits) for n_hits>3
    var pt_reco = this.p4_0.pT() ;
    var pz_reco = this.p4_0.z ;
    if(this.n_tracker_hits>=3 && this.q!=0){
      var  pt_params = get_pt_from_hits(this.tracker_blocks, this.q, B_field, this.p4_0.pT()) ;
      this.pt_hits_mean  = pt_params[0] ;
      this.pt_hits_sigma = pt_params[1] ;
      pt_reco = this.pt_hits_mean + random_gaussian(this.pt_hits_sigma) ;
      pz_reco = this.p4_0.z*pt_reco/this.p4_0.pT() ;
    }
    
    this.px_reco = pt_reco*cos(this.p4_0.phi()) ;
    this.py_reco = pt_reco*sin(this.p4_0.phi()) ;
    this.pz_reco = pz_reco ;
    this.E_reco  = sqrt(this.m*this.m + this.px_reco*this.px_reco + this.py_reco*this.py_reco + this.pz_reco*this.pz_reco) ;
    
    this.p4_r.x = this.px_reco ;
    this.p4_r.y = this.py_reco ;
    this.p4_r.z = this.pz_reco ;
    this.p4_r.t = this. E_reco ;
  }
}

function recursively_decay_daughters(particle){
  if(particle.daughters.length>0){
    for(var i=0 ; i<particle.daughters.length ; i++){
      recursively_decay_daughters(particle.daughters[i]) ;
    }
  }
  else if(particle.decays.length>0){
    particle.decay_top_level(particle.p4_0.m()) ;
  }
  else{
    return ;
  }
}

function recursively_boost_daughters(particle, b){
  for(var i=0 ; i<particle.daughters.length ; i++){
    recursively_boost_daughters(particle.daughters[i], b) ;
    particle.daughters[i].p4_0 = particle.daughters[i].p4_0.boost(b) ;
  }
  return ;
}

function recursively_displace(particle, dx, dy, dz){
  for(var i=0 ; i<particle.daughters.length ; i++){
    var d = particle.daughters[i] ;
    d.r_0.x += dx ;
    d.r_0.y += dy ;
    d.r_0.z += dz ;
    if(d.tau){
      var dt = -d.tau*log(random()) ;
      var bg = d.p4_0.bg() ;
      var c  = 3e8 ;
      var dr = bg*c*dt ;
      if(d.p4_0.r()>0){
        var dx_tmp = dx + dr*d.p4_0.x/d.p4_0.r() ;
        var dy_tmp = dy + dr*d.p4_0.y/d.p4_0.r() ;
        var dz_tmp = dz + dr*d.p4_0.z/d.p4_0.r() ;
        d.r_decay = make_point(d.r_0.x+dx_tmp+dx, d.r_0.y+dy_tmp, d.r_0.z+dz_tmp) ;
      }
     recursively_displace(d, dx_tmp, dy_tmp, dz_tmp) ; 
    }
    else{
      recursively_displace(d, dx, dy, dz) ;
    }
  }
}

function multibody_decay(pdgId, p4, daughters, depth){
  if(daughters.length==0) return [] ;
  
  if(daughters.length==1){
    var d = daughters[0] ;
    if(d.pdgId!=999){ d.m = random_simple_truncated_cauchy(d.m, d.w, 0, p4.m()) ; }
    var p2 = p4.x*p4.x+p4.y*p4.y+p4.z*p4.z ;
    var E  = sqrt(d.m*d.m+p2) ;
    d.p4_0.x = p4.x ;
    d.p4_0.y = p4.y ;
    d.p4_0.z = p4.z ;
    d.p4_0.t = E ;
    daughters[0] = d ;
    return daughters ;
  }
  
  // Sort daughters randomly
  var daughters_with_indices = [] ;
  for(var i=0 ; i<daughters.length ; i++){ daughters_with_indices.push([random(),daughters[i]]) ; }
  daughters_with_indices.sort(function(a,b){ return a[0] < b[0] ; }) ;
  for(var i=0 ; i<daughters.length ; i++){ daughters[i] = daughters_with_indices[i][1] ; }
  
  var bv = p4.boostVector() ;
  var m = p4.m() ;
  var d = daughters.pop() ;
  
  // Choose a random momentum for the first daughter
  var mbar = 0 ;
  for(var i=0 ; i<daughters.length ; i++){
    mbar += daughters[i].p4_0.m() ;
  }
  
  // Choose a random mass based on the truncated Cauchy distribution to conserve p4
  // Leave enough energy for the daughters and siblings
  var m_min = 0 ;
  for(var i=0 ; i<d.daughters.length ; i++){
    m_min += d.daughters[i].m ;
  }
  var m_max = (m-mbar) ;
  var mi = d.m ;
  if(d.w>1) mi = random_simple_truncated_cauchy(d.m, d.w, m_min, m_max) ;
  d.m = mi ;
  d.p4_0.t = sqrt(d.p4_0.p2()+mi*mi) ;
  
  //var mi = d.p4_0.m() ;
  var pmax = momentum_two_body_decay(m, mi, mbar) ;
  var p = (daughters.length==1) ? pmax : 0.9*random()*pmax ;
  
  // Make the three vectors and boost the first daughter in one direction, and the rest in the other
  var p3 = random_threeVector(p) ;
  var Ei = sqrt(d.m*d.m+p*p) ;
  d.p4_0.x = p3[0] ;
  d.p4_0.y = p3[1] ;
  d.p4_0.z = p3[2] ;
  d.p4_0.t = Ei ;
  var mu = sqrt(abs(pow(p4.m()-Ei,2)-p*p)) ;
  var Ebar = sqrt(mu*mu+p*p) ;
  
  var p4_out = new fourVector() ;
  p4_out.x = -p3[0] ;
  p4_out.y = -p3[1] ;
  p4_out.z = -p3[2] ;
  p4_out.t = sqrt(mu*mu+p*p) ;
  
  daughters = multibody_decay(-1, p4_out, daughters, depth+1) ;
  daughters.push(d) ;
  
  for(var i=0 ; i<daughters.length ; i++){
    daughters[i].p4_0 = daughters[i].p4_0.boost(bv) ;
    multibody_decay(daughters[i].pdgId, daughters[i].p4_0, daughters[i].daughters, depth+1) ;
  }
  return daughters ;
}

function m_from_particles(particles){
  var x = 0 ;
  var y = 0 ; 
  var z = 0 ;
  var t = 0 ;
  for(var i=0 ; i<particles.length ; i++){
    x += particles.p4_0.x ;
    y += particles.p4_0.y ;
    z += particles.p4_0.z ;
    t += particles.p4_0.t ;
  }
  var m2 = t*t-x*x-y*y-z*z ;
  if(m2>0) return sqrt(m2) ;
  return sqrt(-m2) ;
}

function smear_p(particles, value){
  for(var i=0 ; i<particles.length ; i++){
    var rx = value*log(random()) ;
    var ry = value*log(random()) ;
    var rz = value*log(random()) ;
    if(random()<0.5) rx *= -1 ;
    if(random()<0.5) ry *= -1 ;
    if(random()<0.5) rz *= -1 ;
    particles[i].p4_0.x *= 1+rx ;
    particles[i].p4_0.y *= 1+ry ;
    particles[i].p4_0.z *= 1+rz ;
  }
}