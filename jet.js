var m_qq = []    ; m_qq[0] = 300 ;
var m_uu =   300 ; m_qq[1] = m_uu ;
var m_dd =   300 ; m_qq[2] = m_dd ;
var m_ss =  1200 ; m_qq[3] = m_ss ;
var m_cc =  3800 ; m_qq[4] = m_cc ;
var m_bb = 11000 ; m_qq[5] = m_bb ;

function quark_pair_mass(q1, q2){
  var nb = 0 ;
  var nc = 0 
  var ns = 0 ;
  q1 = Math.abs(q1) ;
  q2 = Math.abs(q2) ;
  var q_q = [q1,q2] ;
  for(var i=0 ; i<q_q.length ; i++){
    switch(Math.abs(q_q[i])){
      case 0: case 1: case 2: break ;
      case 3: ns++ ; break ;
      case 4: nc++ ; break ;
      case 5: nb++ ; break ;
    }
  }
  var m0 = 300 ;
  if     (nb==2         ){ m0 += 9000 ; }
  else if(nb==1 && nc==1){ m0 += 6400 ; }
  else if(nb==1 && ns==1){ m0 += 5400 ; }
  else if(nc==2         ){ m0 += 3100 ; }
  else if(nc==1 && ns==1){ m0 += 2000 ; }
  else if(nc==1         ){ m0 += 1900 ; }
  else if(ns==2         ){ m0 += 1100 ; }
  else if(ns==1         ){ m0 +=  500 ; }
  return m0 ;
}

function choose_qq_pair(m){
  m = 0.75*m ; // Give the partons some breathing space
  if(m<m_uu) return 0 ;
  else if(m<m_ss){
    return (Math.random()<0.5) ? 1 : 2 ;
  }
  else if(m<m_cc){
    var p = 0 ;
    var p_uu = 1/m_uu ; p += p_uu ;
    var p_dd = 1/m_dd ; p += p_dd ;
    var p_ss = 1/m_ss ; p += p_ss ;
    var r = Math.random()*p ;
    if(r<m_uu     ) return 1 ;
    if(r<m_uu+m_dd) return 2 ;
    return 3 ;
  }
  else if(m<m_bb){
    var p = 0 ;
    var p_uu = 1/m_uu ; p += p_uu ;
    var p_dd = 1/m_dd ; p += p_dd ;
    var p_ss = 1/m_ss ; p += p_ss ;
    var p_cc = 1/m_ss ; p += p_cc ;
    var r = Math.random()*p ;
    if(r<p_uu          ) return 1 ;
    if(r<p_uu+p_dd     ) return 2 ;
    if(r<p_uu+p_dd+p_ss) return 3 ;
    return 4 ;
  }
  else{
    var p = 0 ;
    var p_uu = 1/m_uu ; p += p_uu ;
    var p_dd = 1/m_dd ; p += p_dd ;
    var p_ss = 1/m_ss ; p += p_ss ;
    var p_cc = 1/m_cc ; p += p_cc ;
    var p_bb = 1/m_bb ; p += p_bb ;
    var r = Math.random()*p ;
    if(r<p_uu               ) return 1 ;
    if(r<p_uu+p_dd          ) return 2 ;
    if(r<p_uu+p_dd+p_ss     ) return 3 ;
    if(r<p_uu+p_dd+p_ss+p_cc) return 4 ;
    return 5 ;
  }
}

function jet_object(q1, q2, r0, pt, eta, phi, m_max){
  var qa = (Math.max(Math.abs(q1)>Math.abs(q2))) ? q1 : q2 ;
  var qb = (Math.max(Math.abs(q1)>Math.abs(q2))) ? q2 : q1 ;
  q1 = qa ;
  q2 = qb ;
  
  var m0 = quark_pair_mass(q1, q2) ;
  var mu = 1500 ; // Some mass scale thing
  var m = m_max*1.5 ;
  while(m>m_max){ m = m0 - mu*Math.log(Math.random()) ; }
  var par = new particle_object(m, 0, r0, true) ;
  par.pdgId = 999 ;
  par.q1 = q1 ;
  par.q2 = q2 ;
  
  var quarks  = [] ;
  var hadrons = [] ;
  par.decays  = [] ;
  quarks.push(par.q1) ;
  var remaining_mass = par.p4_0.m() ;
  
  while(true){
    var qq = choose_qq_pair(remaining_mass) ;
    if(qq==0) break ;
    quarks.push(-qq) ;
    quarks.push( qq) ;
    var dm = m_qq[qq] ;
    remaining_mass -= dm ;
    if(remaining_mass<5000){
      if(Math.random()>remaining_mass/5000) break ;
    }
  }
  quarks.push(-par.q2) ;
  for(var i=0 ; i<quarks.length ; i+=2){
    var q1 = Math.abs(quarks[i+0]) ;
    var q2 = Math.abs(quarks[i+1]) ;
    var qa = Math.max(q1,q2) ;
    var qb = Math.min(q1,q2) ;
    var spin = (Math.random()<0.2) ? 1 : 0 ;
    var pdgId = 100*qa + 10*qb + 2*spin + 1 ;
    pdgId *= (qa==q1 && qb==q2) ? 1 : -1 ;
    hadrons.push(pdgId) ;
  }
  if(quarks.length<2 || hadrons.length==0){
    par.is_valid = false ;
    return ;
  }
  par.daughters = [] ;
  var m_total = 0 ;
  for(var i=0 ; i<hadrons.length ; i++){
    var dau = make_particle(hadrons[i], r0) ;
    if(dau==null) continue ; // Bail out when we can't find a particle
    par.daughters.push(dau) ;
    m_total += dau.p4_0.m() ;
  }
  if(m_total>0.8*par.m){
    par.is_valid = false ;
    return par ;
  }
  par.is_valid = true ;
  var px = pt*Math.cos(phi) ;
  var py = pt*Math.sin(phi) ;
  var pz = 0.5*pt*(Math.exp(eta)-Math.exp(-eta)) ;
  var E  = Math.sqrt(px*px+py*py+pz*pz+par.m*par.m) ;
  
  par.p4_0.x = px ;
  par.p4_0.y = py ;
  par.p4_0.z = pz ;
  par.p4_0.t = E  ;
  //par.daughters = multibody_decay(pdgId, par.p4_0, par.daughters, 0) ;
  return par ;
}


