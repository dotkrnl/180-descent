(function(){
  "use strict";

  initLiveRegions();
  initKeyboardActivation();
  initTipNotes();

  function initLiveRegions(){
    var selectors = [
      ".vexpl",
      "#sumtxt",
      "#ledger",
      ".cm-outlet",
      ".sd-verdict",
      ".modal-verdict",
      ".accuracy-ledger",
      ".verdict-card",
      ".grue-readout",
      ".ii-verdict",
      ".ii-vexpl",
      ".post-readout",
      ".ev-readout",
      ".ev-verdict"
    ].join(",");
    var regions = document.querySelectorAll(selectors);
    for(var i = 0; i < regions.length; i++){
      if(!regions[i].hasAttribute("aria-live")){
        regions[i].setAttribute("aria-live", "polite");
      }
      if(!regions[i].hasAttribute("aria-atomic")){
        regions[i].setAttribute("aria-atomic", "true");
      }
    }
  }

  function initKeyboardActivation(){
    document.addEventListener("keydown", function(e){
      var el = e.target;
      if(!el || el.tagName === "BUTTON" || el.tagName === "A" || el.tagName === "INPUT") return;
      var role = el.getAttribute("role");
      if(role !== "button" && role !== "switch" && role !== "tab") return;
      if(e.key === " " || e.key === "Enter"){
        e.preventDefault();
        el.click();
      }
    });
  }

  function initTipNotes(){
    var notes = document.querySelectorAll(".tip-note");
    if(!notes.length){
      return;
    }
    var live = document.getElementById("tipNoteLive");
    if(!live){
      live = document.createElement("div");
      live.id = "tipNoteLive";
      live.className = "sr-only";
      live.setAttribute("aria-live", "polite");
      live.setAttribute("aria-atomic", "true");
      document.body.appendChild(live);
    }

    function closeAll(except){
      for(var i = 0; i < notes.length; i++){
        if(notes[i] === except){
          continue;
        }
        notes[i].removeAttribute("data-open");
        notes[i].removeAttribute("data-place");
        notes[i].removeAttribute("data-positioned");
        notes[i].style.removeProperty("--tip-left");
        notes[i].style.removeProperty("--tip-top");
        notes[i].style.removeProperty("--tip-arrow-left");
        var mark = notes[i].querySelector(".tip-note-mark");
        if(mark){
          mark.setAttribute("aria-expanded", "false");
        }
      }
      if(!except && live){
        live.textContent = "";
      }
    }

    function noteText(note){
      if(!note){
        return "";
      }
      var text = note.getAttribute("data-tip-text") || "";
      if(text){
        return text;
      }
      var box = note.querySelector(".tip-note-box");
      return box ? (box.getAttribute("data-tip") || box.textContent || "").trim() : "";
    }

    function alignBox(note){
      if(!note){
        return;
      }

      note.removeAttribute("data-place");
      note.removeAttribute("data-positioned");
      note.style.removeProperty("--tip-left");
      note.style.removeProperty("--tip-top");
      note.style.removeProperty("--tip-arrow-left");
      var box = note.querySelector(".tip-note-box");
      if(!box){
        return;
      }

      var rect = box.getBoundingClientRect();
      var noteRect = note.getBoundingClientRect();
      var mark = note.querySelector(".tip-note-mark");
      var markRect = mark ? mark.getBoundingClientRect() : noteRect;
      var gutter = 12;
      var viewportWidth = document.documentElement ? document.documentElement.clientWidth : 0;
      if(window.visualViewport && window.visualViewport.width){
        viewportWidth = viewportWidth ? Math.min(viewportWidth, window.visualViewport.width) : window.visualViewport.width;
      }
      viewportWidth = viewportWidth || window.innerWidth;
      var viewportHeight = document.documentElement ? document.documentElement.clientHeight : 0;
      if(window.visualViewport && window.visualViewport.height){
        viewportHeight = viewportHeight ? Math.min(viewportHeight, window.visualViewport.height) : window.visualViewport.height;
      }
      viewportHeight = viewportHeight || window.innerHeight;
      var shift = 0;
      if(rect.left < gutter){
        shift = gutter - rect.left;
      }else if(rect.right > viewportWidth - gutter){
        shift = (viewportWidth - gutter) - rect.right;
      }

      var left = rect.left + shift;
      var arrowLeft = (markRect.left + markRect.width / 2) - left;
      arrowLeft = Math.max(14, Math.min(rect.width - 14, arrowLeft));
      var placeBelow = rect.top < 72;
      var top = placeBelow ? markRect.bottom + 8 : markRect.top - rect.height - 8;
      top = Math.max(gutter, Math.min(viewportHeight - rect.height - gutter, top));

      note.style.setProperty("--tip-left", left.toFixed(1) + "px");
      note.style.setProperty("--tip-top", top.toFixed(1) + "px");
      note.style.setProperty("--tip-arrow-left", arrowLeft.toFixed(1) + "px");
      note.setAttribute("data-positioned", "true");

      if(placeBelow){
        note.setAttribute("data-place", "below");
      }
    }

    for(var i = 0; i < notes.length; i++){
      var button = notes[i].querySelector(".tip-note-mark");
      if(!button){
        continue;
      }

      button.addEventListener("click", function(event){
        event.preventDefault();
        event.stopPropagation();

        var note = this.closest(".tip-note");
        var shouldOpen = note && note.getAttribute("data-open") !== "true";
        closeAll(note);
        if(!note){
          return;
        }

        if(shouldOpen){
          note.setAttribute("data-open", "true");
          this.setAttribute("aria-expanded", "true");
          if(live){
            live.textContent = noteText(note);
          }
          alignBox(note);
          window.requestAnimationFrame(function(){
            alignBox(note);
          });
        }else{
          note.removeAttribute("data-open");
          note.removeAttribute("data-place");
          note.removeAttribute("data-positioned");
          note.style.removeProperty("--tip-left");
          note.style.removeProperty("--tip-top");
          note.style.removeProperty("--tip-arrow-left");
          this.setAttribute("aria-expanded", "false");
          if(live){
            live.textContent = "";
          }
        }
      });

      button.addEventListener("mouseenter", function(){
        var note = this.closest(".tip-note");
        if(!note){
          return;
        }
        window.requestAnimationFrame(function(){
          alignBox(note);
        });
      });

      button.addEventListener("focus", function(){
        var note = this.closest(".tip-note");
        if(!note){
          return;
        }
        window.requestAnimationFrame(function(){
          alignBox(note);
        });
      });
    }

    document.addEventListener("click", function(event){
      if(event.target.closest && event.target.closest(".tip-note")){
        return;
      }
      closeAll();
    });

    document.addEventListener("keydown", function(event){
      if(event.key === "Escape"){
        closeAll();
      }
    });

    window.addEventListener("resize", function(){
      closeAll();
    });

    // The opened box is viewport-fixed so it can escape scrolling panels;
    // keep it glued to its anchor by recomputing the coordinates on scroll.
    // Capture phase catches scrolls of inner overflow containers as well.
    var scrollTicking = false;
    document.addEventListener("scroll", function(){
      if(scrollTicking){
        return;
      }
      scrollTicking = true;
      window.requestAnimationFrame(function(){
        scrollTicking = false;
        for(var i = 0; i < notes.length; i++){
          if(notes[i].getAttribute("data-positioned") === "true"){
            alignBox(notes[i]);
          }
        }
      });
    }, { capture: true, passive: true });
  }


})();
