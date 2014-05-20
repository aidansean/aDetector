// Useful greek symbols: μπγ

var detector = new detector_object() ;

// Histogram management
var histograms  = [] ;
var plot_spaces = [] ;
var plot_names  = [] ;

var events = [] ;

var fit = null ;

function start(){
  add_eventListeners() ;
  initialise_coordinates() ;
  
  make_raw_collections() ;
  
  collection_names.push('phi'         ) ;
  collection_names.push('rhop'        ) ;
  collection_names.push('K0Star892'   ) ;
  collection_names.push('K0BarStar892') ;
  collection_names.push('phi_tight') ;
  collection_names.push('pi_highP' ) ;
  collection_names.push('Ds'       ) ;
  collection_names.push('Ds_tight' ) ;
  collection_names.push('KS'       ) ;
  
  collections['phi'] = new collection_object('phi', '\\(\\phi\\)', 333, true, false, ['raw_kaons_p','raw_kaons_m']) ;
  collections['phi_tight'   ] = new collection_object('phi_tight', 'Tight \\(\\phi\\)', 333, true, false, ['phi']) ;
  collections['phi_tight'   ].filter_mass = true ;
  collections['phi_tight'   ].mass_lower  = 1000 ;
  collections['phi_tight'   ].mass_upper  = 1050 ;
  collections['pi_highP'    ] = new collection_object('pi_highP', 'High \\(p\\) pions', 211, true, false, ['raw_pions']) ;
  collections['pi_highP'    ].filter_p = true ;
  collections['pi_highP'    ].p_lower  = 1000 ;
  collections['Ds'          ] = new collection_object('Ds'          , '\\(D_s\\)'             ,  431, true, false, ['phi','raw_pions'          ]) ;
  collections['Ds_tight'    ] = new collection_object('Ds_tight'    , '\\(D_s\\) tight'       ,  431, true, false, ['phi_tight','pi_highP'     ]) ;
  collections['KS'          ] = new collection_object('KS'          , '\\(K_S\\)'             ,  310, true, false, ['raw_pions_p','raw_pions_m']) ;
  collections['K0Star892'   ] = new collection_object('K0Star892'   , '\\(K^{*0}(892)\\)'     ,  313, true, false, ['raw_pions_m','raw_kaons_p']) ;
  collections['K0BarStar892'] = new collection_object('K0BarStar892', '\\(anti-K^{*0}(892)\\)', -313, true, false, ['raw_pions_p','raw_kaons_m']) ;
  collections['rhop'        ] = new collection_object('rhop'        , '\\(\\rho^+\\)'         ,  213, true, false, ['raw_pions_p','raw_photons','raw_photons']) ;
  
  histograms['phi'          ] = new histogram_object('phi'         , 'mass (KK)'       ,  950,  1300,  35, 'MeV',   '0,100,0') ;
  histograms['Ds'           ] = new histogram_object('Ds'          , 'mass (KKπ)'      , 1500,  2500,  30, 'MeV',   '0,0,255') ;
  histograms['Ds_tight'     ] = new histogram_object('Ds_tight'    ,'mass (KKπ) tight' , 1500,  2500,  30, 'MeV', '0,100,100') ;
  histograms['q'            ] = new histogram_object('q'           , 'quark pdgId'     ,  0.5,   4.5,   4,    '',   '0,255,0') ;
  histograms['jm'           ] = new histogram_object('jm'          , 'jet mass'        ,    0,  3600,  50, 'MeV',   '255,0,0') ;
  histograms['KS'           ] = new histogram_object('KS'          , 'mass (ππ)'       ,  200,  1300,  44, 'MeV', '200,0,200') ;
  histograms['rhop'         ] = new histogram_object('rhop'        , 'mass (ππ0)'      ,  200,  1300,  44, 'MeV', '200,0,200') ;
  histograms['K0Star892'    ] = new histogram_object('K0Star892'   , 'mass (K+π-)'     ,  500,  1500,  25, 'MeV',  '50,50,50') ;
  histograms['K0BarStar892' ] = new histogram_object('K0BarStar892', 'mass (K-π+)'     ,  500,  1500,  25, 'MeV',  '50,50,50') ;
  
  plot_spaces['phi'         ] = new plot_space_object('phi'         ) ;
  plot_spaces['rhop'        ] = new plot_space_object('rhop'        ) ;
  plot_spaces['Ds'          ] = new plot_space_object('Ds'          ) ;
  plot_spaces['Ds_tight'    ] = new plot_space_object('Ds_tight'    ) ;
  plot_spaces['jm'          ] = new plot_space_object('jm'          ) ;
  plot_spaces['K0Star892'   ] = new plot_space_object('K0Star892'   ) ;
  plot_spaces['K0BarStar892'] = new plot_space_object('K0BarStar892') ;
  plot_spaces['KS'          ] = new plot_space_object('KS'          ) ;
  
  plot_names.push('Ds'          ) ;
  plot_names.push('Ds_tight'    ) ;
  plot_names.push('phi'         ) ;
  plot_names.push('jm'          ) ;
  plot_names.push('rhop'        ) ;
  plot_names.push('K0Star892'   ) ;
  plot_names.push('K0BarStar892') ;
  plot_names.push('KS'          ) ;
  
  // Build detector
  detector.components.push(new beampipe_object('beampipe', 20, 1.0, '0,0,0')) ;
  detector.components.push(new  tracker_object('tracker' , 0.05, 0.5,  -3.0, 3.0, 6,  1,12, 0.4 , 0.05, '150,100,150', '200,   0, 200')) ;
  detector.components.push(new     ecal_object('ecal'    , 0.7 , 1.7,  -3.0, 3.0, 2, 12,  6, 0.05, 0.05, '100,100,255', '  0,   0, 100')) ;
  detector.components.push(new     ecal_object('ecal_fwd', 0.05, 1.7,   3.0, 4.0, 2,  3,  6, 0.05, 0.05, '100,100,255', '  0,   0, 100')) ;
  detector.components.push(new     hcal_object('hcal'    , 2.0 , 3.0,  -4.0, 4.0, 3, 12,  6, 0.09, 0.05, ' 50,200, 50', '  0, 100,   0')) ;
  detector.components.push(new     hcal_object('hcal_fwd', 0.1 , 2.8,   4.1, 4.5, 3,  2,  6, 0.05, 0.05,  '50,200, 50', '  0, 100,   0')) ;
  
  detector.triggers.push(new BaBar_trigger_object()) ;
  
  detector.initialise() ;
  update_coords() ;
  
  draw_detector([]) ;
  for(var i=0 ; i<plot_names.length ; i++){ histograms[plot_names[i]].draw(plot_spaces[plot_names[i]], 'f') ; }
  heartbeat() ;
  stopwatch() ;
  
  for(var i=0 ; i<collection_names.length ; i++){
    var coll = collections[collection_names[i]] ;
    if(coll.is_raw_list) continue ;
    add_particle_collection_table(coll) ;
  }
  
  reset_reco_particle_form() ;
  
  Get('input_update_event_display_interval' ).value =  draw_interval ;
  Get('input_update_particle_table_interval').value = table_interval ;
  
  fit = new analytic_fit_object() ;
  var exp_func   = new exp_fit_object(1e-8,1e-1,1500) ;
  var gauss_func = new gauss_fit_object(1900,2100,0.1,50) ;
  fit.add_pdf(exp_func) ;
  fit.add_pdf(gauss_func) ;
  
  window.setTimeout(rerun_mathjax,100) ;
}

var mu = 10580 ;
mu = 2500 ;
var gammaStar = virtual_photon_object([0,0,0], mu) ;
function heartbeat(){
  if(counter>stop && stop>0) return ;
  if(!pause){
    // Reset the pre_info in case we need it for debugging
    Get('pre_info').innerHTML = '' ;
    
    // Create an empty list of particles
    var particles = [] ;
    
    // Attempt make a new event
    var success = false ;
    var n_tries = 0 ;
    while(success==false && n_tries<n_trigger_attempts){
      n_tries++ ;
      gammaStar.decay_top_level(mu) ;
      particles = recursively_add_particles(gammaStar, []) ;
      
      // Check the triggers
      for(var i=0 ; i<detector.triggers.length ; i++){
        if(detector.triggers[i].analyse_particles(particles)){
          success = true ;
          break ;
        }
      }
    }
    // Update particles so that they are aware of their indices
    for(var i=0 ; i<particles.length ; i++){
      particles[i].id = i ;
      particles[i].raw_indices = [i] ;
    }
      
    // Write table early to help with debugging
    if(counter%table_interval==0) write_particle_info_table(particles) ;
    if(success){
      // Set all cells to cold
      for(var i=0 ; i<detector.components.length ; i++){
        for(var j=0 ; j<detector.components[i].cells.length ; j++){
          detector.components[i].cells[j].make_hot(false) ;
        }
      }
      
      // Make particle trajectories
      var paths = detector.process_particles(particles) ;
      
      // Reconstruct particles (needs more work!)
      for(var i=0 ; i<particles.length ; i++){ particles[i].reconstruct() ; }
      
      // Create a new event
      var event = new event_container(particles) ;
      
      var reco_particles = [] ;
      for(var i=0 ; i<collection_names.length ; i++){
        var coll = collections[collection_names[i]] ;
        if(coll.is_raw_list){
          coll.populate_list_from_event(event) ;
        }
        else{
          coll.populate_from_daughters() ;
        }
        for(var j=0 ; j<coll.list.length ; j++){
          reco_particles.push(coll.list[j]) ;
        }
      }
      var all_particles = particles.concat(reco_particles) ;
      //write_particle_info_table(all_particles) ;
      
      for(var i=0 ; i<particles.length ; i++){
        if(particles[i].pdgId==999) histograms['jm'].fill(particles[i].p4_0.m()) ;
      }
      if(histograms['Ds_tight'].get_sum()>50){
        fit.perform_fit(histograms['Ds_tight'],counter%5) ;
      }
      
      // Draw everything
      // Do this late, to make debugging easier
      if(counter%draw_interval==0){
        draw_detector(paths) ;
      }
      for(var i=0 ; i<plot_names.length ; i++){
        var n = plot_names[i] ;
        if(n!='jm') histograms[n].fill_array(collections[n].m()) ;
        histograms[n].draw(plot_spaces[n], 'e') ;
      }
      histograms['Ds_tight'].draw(plot_spaces['Ds'], 'se') ;
      if(histograms['Ds_tight'].get_sum()>50){
        fit.draw(plot_spaces['Ds'], histograms['Ds']) ;
        fit.draw(plot_spaces['Ds_tight'], histograms['Ds_tight']) ;
      }
      
      if(success){
        if(record_events){
          events.push(event) ;
          event_index = events.length-1 ;
        }
        Get('span_event_index').innerHTML = event_index ;
      }
      
      // Do this again so we get the reco values as well
      if(counter%table_interval==0) write_particle_info_table(particles) ;
    }
    var y_max = 620 ;
    var n = 1e5 ;
    var w = 150 ;
    var m = 770 ;
    var m_min = 280 ;
    var m_max = 984 ;
    
    counter++ ;
    Get('span_nEvents').innerHTML = events.length + ' / ' + counter ;
  }
  
  // If we're stepping through one event at a time, make sure to pause again after we finish the event
  if(one_event){
    pause = true ;
    one_event = false ;
    Get('submit_pause').value = 'Start!' ;
  }
  
  // Send another heartbeat
  window.setTimeout(heartbeat, delay) ;
}





