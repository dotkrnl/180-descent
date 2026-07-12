(function(){
  "use strict";

  initSyllabusMap();

  function initSyllabusMap(){
    var map = document.querySelector("[data-syllabus-map]");
    if(!map){
      return;
    }

    var buttons = map.querySelectorAll("[data-map-block]");
    var status = map.querySelector("[data-map-status]");
    var defaultStatus = status ? status.textContent : "";

    function clearFocus(){
      map.removeAttribute("data-focused");
      for(var i = 0; i < buttons.length; i++){
        buttons[i].setAttribute("aria-pressed", "false");
      }
      if(status){
        status.textContent = defaultStatus;
      }
    }

    function focusBlock(button){
      var id = button.getAttribute("data-map-block") || "";
      var target = document.getElementById("block-" + id);
      map.setAttribute("data-focused", id);
      for(var i = 0; i < buttons.length; i++){
        var active = buttons[i] === button;
        buttons[i].setAttribute("aria-pressed", active ? "true" : "false");
      }
      if(status){
        var label = button.querySelector(".map-block-title");
        var summary = button.querySelector(".map-block-summary");
        status.textContent = label
          ? label.textContent + (summary && summary.textContent ? " — " + summary.textContent : "")
          : defaultStatus;
      }
      if(target){
        var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
      }
    }

    for(var i = 0; i < buttons.length; i++){
      buttons[i].addEventListener("click", function(){
        focusBlock(this);
      });
    }
    map.addEventListener("keydown", function(event){
      if(event.key === "Escape"){
        clearFocus();
      }
    });
  }


})();
