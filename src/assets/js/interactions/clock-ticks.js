(function(){
  "use strict";

  document.querySelectorAll("#ticks").forEach(function(ticks){
    if (ticks.children.length) return;
    var ns = "http://www.w3.org/2000/svg";
    for(var i = 0; i < 60; i++){
      var a = i * 6 * Math.PI / 180;
      var major = i % 5 === 0;
      var r1 = major ? 92 : 96;
      var r2 = 100;
      var line = document.createElementNS(ns, "line");
      line.setAttribute("x1", (120 + r1 * Math.sin(a)).toFixed(1));
      line.setAttribute("y1", (120 - r1 * Math.cos(a)).toFixed(1));
      line.setAttribute("x2", (120 + r2 * Math.sin(a)).toFixed(1));
      line.setAttribute("y2", (120 - r2 * Math.cos(a)).toFixed(1));
      line.setAttribute("stroke-width", major ? "2" : "1");
      line.setAttribute("opacity", major ? "0.85" : "0.4");
      ticks.appendChild(line);
    }
  });
})();
