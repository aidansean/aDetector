<?php
include_once($_SERVER['FILE_PREFIX']."/project_list/project_object.php") ;
$github_uri   = "https://github.com/aidansean/aDetector" ;
$blogpost_uri = "http://aidansean.com/projects/?tag=aDetector" ;
$project = new project_object("aDetector", "aDetector", "https://github.com/aidansean/aDetector", "http://aidansean.com/projects/?tag=aDetector", "/~aidanrandle-conde/aidansean/advent2012/images/project.jpg", "/~aidanrandle-conde/aidansean/advent2012/images/project_bw.jpg", "One of the projets I have wanted to develop for a long time is a browser based particle physics experiment simulator.  Such a project would generate events using Monte Carlo methods and simuate their interactions with the detector.  This was made partly as an educational aid, partly as a challenge to myself, and partly because at the time I was feeling some frustration with the lack of real analysis in my job.  As expected for a Javascript based CPU intensive appplication, this reaches the limits of what is possible with current technology quite rapidly.", "", "") ;
?>