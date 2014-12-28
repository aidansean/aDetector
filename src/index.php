<?php
$title   = 'A Detector' ;
$tagline = '"The answers are in the dataset"' ;
$stylesheets = array('css/style.css', 'style.css') ;
$js_scripts  = array() ;
$js_scripts[] = 'js/helper.js' ;
$js_scripts[] = 'js/xml.js' ;
$js_scripts[] = 'js/p4.js' ;
$js_scripts[] = 'js/event.js' ;
$js_scripts[] = 'js/settings.js' ;
$js_scripts[] = 'js/component_cell.js' ;
$js_scripts[] = 'js/collections.js' ;
$js_scripts[] = 'js/filter.js' ;
$js_scripts[] = 'js/controls.js' ;
$js_scripts[] = 'js/detector.js' ;
$js_scripts[] = 'js/detector_component.js' ;
$js_scripts[] = 'js/particle.js' ;
$js_scripts[] = 'js/particle_data.js' ;
$js_scripts[] = 'js/jet.js' ;
$js_scripts[] = 'js/histogram.js' ;
$js_scripts[] = 'js/monitoring.js' ;
$js_scripts[] = 'js/trigger.js' ;
$js_scripts[] = 'js/tracking.js' ;
$js_scripts[] = 'js/base.js' ;
$js_scripts[] = 'js/draw.js' ;
$js_scripts[] = 'js/calibration.js' ;
include($_SERVER['FILE_PREFIX'] . '/_core/preamble.php') ;
?>

<!--<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js' ;-->

  <table id="table_tab_selector">
    <tbody>
      <tr>
        <td id="td_tab_selection_detector"  class="tab_selection tab_selection_depressed">Detector view</td>
        <td id="td_tab_selection_reco"      class="tab_selection tab_selection_depressed">Reconstruction</td>
        <td id="td_tab_selection_histogram" class="tab_selection tab_selection_depressed">Histograms</td>
        <td id="td_tab_selection_workspace" class="tab_selection tab_selection_depressed">Workspace</td>
        <td id="td_tab_selection_particle"  class="tab_selection tab_selection_depressed">Particles</td>
      </tr>
    <tbody>
  </table>
  
  <div id="div_detector_container">
    <div class="tab">
      <div class="tab_row">
        <div class="tab_cell">
          <canvas id="canvas_detector_cutaway" width="500" height="460"></canvas><br />
        </div>
        <div class="tab_cell">
          <canvas id="canvas_detector_transverse" width="250" height="250"></canvas><br />
          <canvas id="canvas_detector_longitudinal" width="250" height="200"></canvas><br />  
        </div>
      </div>
    </div>
  </div>
  
  <div class="tab">
    <div class="tab_row">
      <div class="tab_cell">
        <p class="center">x: <input type="text" id="input_x"/> y: <input type="text" id="input_y"/> z: <input type="text" id="input_z"/>
          &theta;: <input type="text" id="input_t"/> &phi;: <input type="text" id="input_p"/><input type="submit" id="submit_coords" value="Change view"/>
        </p>
        <table>
          <tbody>
            <tr>
              <td>Update event display every </td>
              <td><input id="input_update_event_display_interval" type="text" value=""/> events <input id="submit_update_event_display_interval" type="submit" value="Change"/></td>
            </tr>
            <tr>
              <td>Update particle table every </td>
              <td><input id="input_update_particle_table_interval" type="text" value=""/> events <input id="submit_update_particle_table_interval" type="submit" value="Change"/></td>
            </tr>
            <tr>
              <td>Update histograms every </td>
              <td><input id="input_update_histograms_interval" type="text" value=""/> events <input id="submit_update_histograms_interval" type="submit" value="Change"/></td>
            </tr>
          </table>
        </table>
          Save events:
          <select id="select_save_events">
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
          <input id="submit_update_save_events" type="submit" value="Change"/><br />
        </p>
        <p>
          <input id="submit_pause"    type="submit" value="Start!"/> <input id="submit_stepOne" type="submit" value="Add 1 event"/>
          <input id="submit_previous" type="submit" value="Previous event"/> <input id="submit_next" type="submit" value="Next event"/>
        </p>
      </div>
      <div class="tab_cell">
        <p class="center">
          <span id="span_nEvents">0</span> events <br />
          <span id="span_stopwatch">0</span> \(ms\) <br />
          Current event number: <span id="span_event_index">-</span><br />
          Successes: <span id="span_event_success">-</span><br />
          Failures:  <span id="span_event_failure">-</span><br />
        </p>
      </div>
    </div>
  </div>
  </div>
  
  <div id="div_samples_container">
    <h3>Samples</h3>
    <select>
      <option value="data_ee">Data (\(e^+e^-\))</option>
      <option value="data_pp">Data (\(pp\))</option>
      <option value="data_pbarp">Data (\(p\bar{p}\))</option>
      <option value="data_ep">Data (\(e^-p\))</option>
      <option value="MC_eegamma">\(ee\gamma\) (MC: \(ee\) calibiration)</option>
      <option value="MC_mumugamma">\(\mu\mu\gamma\) (MC: \(\mu\mu\) calibiration)</option>
      <option value="MC_pbarpgamma">\(p\bar{p}\gamma\) (MC: \(p\bar{p}\) calibiration)</option>
      <option value="MC_KKgamma">\(KK\gamma\) (MC: \(KK\) calibiration)</option>
      <option value="MC_pipigamma">\(\pi\pi\gamma\) (MC: \(\gamma\gamma\) calibiration)</option>
    </select>
    <select>
      <option>\(4  ~\mathrm{GeV}\)</option>
      <option>\(7  ~\mathrm{TeV}\)</option>
      <option>\(8  ~\mathrm{TeV}\)</option>
      <option>\(13 ~\mathrm{TeV}\)</option>
      <option>\(14 ~\mathrm{TeV}\)</option>
    </select>
    Boost: \(\beta\) = <input type="text" id="input_boost" style="width:50px" value="0"/>
    <input type="submit" value="Change">
    <div id="sample_wrapper" class="center"></div>
  </div>
  
  <div id="div_histogram_container">
    <h3>Histograms</h3>
    <div id="histogram_wrapper" class="center"></div>
  
    <table id="table_histogram_first" class="reco_particle">
      <tbody>
        <tr><th class="histogram_heading" colspan="3">Create histogram</th></tr>
        <tr>
          <th>Name:</th>
          <td><input id="input_histogram_name" type="text" value=""/></td>
          <td>(Unique, only letters and numbers)</td>
        </tr>
        <tr>
          <th>x-axis tite:</th>
          <td><input id="input_histogram_xaxis" type="text" value=""/></td>
          <td>(Optional, LaTeX supported)</td>
        </tr>
        <tr>
          <th>Unit:</th>
          <td><input id="input_histogram_unit" type="text" value=""/></td>
          <td>(Optional)</td>
        </tr>
        <tr>
          <th>Lower bound:</th>
          <td><input id="input_histogram_lower" type="text" value=""/></td>
          <td>(Required)</td>
        </tr>
        <tr>
          <th>Upper bound:</th>
          <td><input id="input_histogram_upper" type="text" value=""/></td>
          <td>(Required)</td>
        </tr>
        <tr>
          <th>Number of bins:</th>
          <td><input id="input_histogram_nBins" type="text" value=""/></td>
          <td>(Required)</td>
        </tr>
        <tr>
          <th>Colour:</th>
          <td><input id="input_histogram_colour" type="text" value=""/></td>
          <td>(Optional, default is black)</td>
        </tr>
        <tr>
          <td class="center" colspan="3"><input id="submit_histogram_create" type="submit" value="Create histogram!"/></td>
        </tr>
      </tbody>
    </table>
    
    <table id="table_histogram_roster">
      <thead>
        <tr>
          <th class="histogram_roster">Name</th>
          <th class="histogram_roster">\(x\) axis title</th>
          <th class="histogram_roster">Unit</th>
          <th class="histogram_roster">\(x_{low}\)</th>
          <th class="histogram_roster">\(x_{high}\)</th>
          <th class="histogram_roster">Bins</th>
          <th class="histogram_roster">Colour</th>
        </tr>
      </thead>
    <tbody id="tbody_histogram_roster"></tbody>
  </table>
  </div>
  
  <div id="div_reco_container">
  <h3>Reconstruction</h3>
  <div class="tab">
    <div class="tab_row">
      <div class="tab_cell">
        <div id="div_user_reco_wrapper">
          <h3>New particle</h3>
          <table id="reco_particle_first" class="reco_particle">
            <tbody>
              <tr><th class="reco_particle_heading" colspan="3">Main info</th></tr>
              <tr>
                <th>Name:</th>
                <td><input id="input_reco_name" type="text" value=""/></td>
                <td>(Unique, only letters and numbers)</td>
              </tr>
              <tr>
                <th>Title:</th>
                <td><input id="input_reco_title" type="text" value=""/></td>
                <td>(Optional, LaTeX supported)</td>
              </tr>
              <tr>
                <th>PDG id:</th>
                <td><input id="input_reco_pdgId" type="text" value=""/></td>
                <td>(Optional)</td>
              </tr>
            </tbody>
          </table>
          <table class="reco_particle">
            <tbody>
              <tr><th class="reco_particle_heading" colspan="3">Daughters</th></tr>
              <tr>
                <th></th>
                <td>
                  <input id="submit_reco_particle_addList" type="submit" value="Add new daughter"/>
                  <input id="submit_reco_particle_removeList" type="submit" value="Remove last daughter"/>
                </td>
                <td></td>
              </tr>
            </tbody>
            <tbody id="tbody_reco_particle_daughters"></tbody>
            <tbody>
              <tr>
                <th></th>
                <td>
                  <input id="submit_reco_particle_mergeLists" type="checkbox" selected="not_selected"/>
                  Merge lists
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>
          <table class="reco_particle">
            <tbody><tr><th class="reco_particle_heading" colspan="6">Filters</th></tr></tbody>
            <tbody id="tbody_reco_particle_filters"></tbody>
          </table>
          <table class="reco_particle">
            <tbody>
              <tr><th class="reco_particle_heading" colspan="3">Create list</th></tr>
              <tr><td class="center"><input id="submit_reco_particle_create" type="submit" value="Create list!"/></td></tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="tab_cell">
        <div id="div_particle_lists">
          <h3>Particle lists</h3>
        </div>
      </div>
    </div>
  </div>
  </div>
  
  <div id="div_workspace_container">
  <h3>Workspace</h3>
  <div id="plot_space_wrapper" class="center">
    <canvas id="canvas_new_plot_space" width="50px" height="50px"></canvas>
  </div>
  <table id="table_new_fill_histogram">
    <thead>
      <tr>
        <th class="th_new_fill_histogram">Fill histogram</th>
        <th class="th_new_fill_histogram">with quantity</th>
        <th class="th_new_fill_histogram">from collection</th>
        <th class="th_new_fill_histogram"></th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          <select id="select_fill_histogram_histogram">
          </select>
        </td>
        <td>
          <select id="select_fill_histogram_quantity">
            <option value="m">mass</option>
            <option value="E">energy</option>
            <option value="p">momentum</option>
            <option value="pT">transverse momentum</option>
            <option value="eta">pseudorapidity</option>
            <option value="hel">helicity</option>
            <option value="d0">transverse impact</option>
            <option value="er">ecal response</option>
            <option value="hr">hcal response</option>
          </select>
        </td>
        <td>
          <select id="select_fill_histogram_collection">
          </select>
        </td>
        <td>
          <input type="submit" id="submit_fill_histogram" value="Go!"/>
        </td>
      </tr>
    </tbody>
    <tbody id="tbody_fill_histogram">
    </tbody>
  </table>
  </div>
  
  <pre id="pre_info"></pre>
  <hr class="clearboth"/>
  
  <div id="div_particle_container">
    <table id="table_particle_info">
      <thead>
        <tr>
          <th></th>
          <th class="particle_info">id</th>
          <th class="particle_info">pdgId</th>
          <th class="particle_info">\(m_{pole}\)</th>
          <th class="particle_info">\(m_0\)</th>
          <th class="particle_info">\(p_x\)</th>
          <th class="particle_info">\(p_y\)</th>
          <th class="particle_info">\(p_z\)</th>
          <th class="particle_info">\(E\)</th>
          <th class="particle_info">\(m\)</th>
          <th class="particle_info">\(p_x^r\)</th>
          <th class="particle_info">\(p_y^r\)</th>
          <th class="particle_info">\(p_z^r\)</th>
          <th class="particle_info">\(E^r\)</th>
          <th class="particle_info">\(m^r\)</th>
          <th class="particle_info">\(x_0\)</th>
          <th class="particle_info">\(y_0\)</th>
          <th class="particle_info">\(z_0\)</th>
          <th class="particle_info">mother</th>
          <th></th>
        </tr>
      </thead>
    <tbody id="tbody_particle_info"></tbody>
  </table>
  </div>
  
  <hr class="clearboth"/>
  <h3>XML output</h3>
  <div>
    Detector components:<br />
    <textarea id="textarea_detectorXml" rows="20" cols="90"></textarea>
  </div>
<?php foot() ; ?>

