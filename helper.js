// Simple functions to save some characters

function    Get(id  ){ return document.getElementById(id)  ; }
function Create(type){ return document.createElement(type) ; }

function     abs(x){ return Math.abs(x)     ; }
function     cos(x){ return Math.cos(x)     ; }
function     exp(x){ return Math.exp(x)     ; }
function     log(x){ return Math.log(x)     ; }
function     sin(x){ return Math.sin(x)     ; }
function     tan(x){ return Math.tan(x)     ; }
function    acos(x){ return Math.acos(x)    ; }
function    atan(x){ return Math.atan(x)    ; }
function    ceil(x){ return Math.ceil(x)    ; }
function    sqrt(x){ return Math.sqrt(x)    ; }
function   min(x,y){ return Math.min(x,y)   ; }
function   max(x,y){ return Math.max(x,y)   ; }
function   random(){ return Math.random()   ; }
function   floor(x){ return Math.floor(x)   ; }
function   pow(x,n){ return Math.pow(x,n)   ; }
function atan2(y,x){ return Math.atan2(y,x) ; }

function rerun_mathjax(){ var MathJax = null ; if(MathJax) MathJax.Hub.Queue(['Typeset',MathJax.Hub]) ; }

