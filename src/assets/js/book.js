(function(){
  "use strict";

  var root = document.documentElement;
  var themeBtn = document.getElementById("themeBtn");

  function systemDark(){
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  if(themeBtn){
    themeBtn.addEventListener("click", function(){
      var cur = root.getAttribute("data-theme") || "auto";
      var effective = cur === "auto" ? (systemDark() ? "dark" : "light") : cur;
      root.setAttribute("data-theme", effective === "dark" ? "light" : "dark");
    });
  }

  initCodexRefiner();

  function initCodexRefiner(){
    if(!isLocalPreview() || !window.fetch){
      return;
    }

    var main = document.getElementById("content");
    if(!main){
      return;
    }

    fetch("/__codex/refine-description", {
      method: "GET",
      cache: "no-store"
    }).then(function(response){
      if(response.ok){
        mountCodexRefiner(main);
      }
    }).catch(function(){
      // The static site can also be served on localhost; keep the tool hidden there.
    });
  }

  function mountCodexRefiner(main){
    var activeRange = null;
    var activeText = "";
    var running = false;
    var panelPointerDown = false;
    var selectionTimer = 0;
    var supportsHighlights = window.CSS && CSS.highlights && window.Highlight;

    var panel = document.createElement("form");
    panel.className = "codex-refiner";
    panel.hidden = true;
    panel.setAttribute("aria-live", "polite");
    panel.innerHTML = [
      '<button class="codex-refiner-close" type="button" aria-label="Close">x</button>',
      '<div class="codex-refiner-preview" data-role="preview"></div>',
      '<input class="codex-refiner-reason" data-role="reason" type="text" maxlength="1000" placeholder="Reason (optional)" autocomplete="off">',
      '<div class="codex-refiner-actions">',
      '<button class="codex-refiner-submit" data-role="submit" type="submit">Ask Codex</button>',
      '<span class="codex-refiner-status" data-role="status"></span>',
      '</div>'
    ].join("");
    document.body.appendChild(panel);

    var preview = panel.querySelector('[data-role="preview"]');
    var reason = panel.querySelector('[data-role="reason"]');
    var submit = panel.querySelector('[data-role="submit"]');
    var status = panel.querySelector('[data-role="status"]');
    var close = panel.querySelector(".codex-refiner-close");

    document.addEventListener("selectionchange", function(){
      if(running || panelPointerDown || panel.contains(document.activeElement)){
        return;
      }

      window.clearTimeout(selectionTimer);
      selectionTimer = window.setTimeout(readSelection, 80);
    });

    document.addEventListener("pointerdown", function(event){
      if(panel.contains(event.target)){
        panelPointerDown = true;
        return;
      }

      if(!main.contains(event.target)){
        hidePanel();
      }
    }, true);

    document.addEventListener("pointerup", function(){
      window.setTimeout(function(){
        panelPointerDown = false;
      }, 0);
    }, true);

    window.addEventListener("scroll", repositionPanel, { passive: true });
    window.addEventListener("resize", repositionPanel);

    close.addEventListener("click", function(){
      hidePanel();
    });

    panel.addEventListener("submit", function(event){
      event.preventDefault();
      refineSelection();
    });

    function readSelection(){
      var selection = window.getSelection();
      if(!selection || selection.rangeCount === 0 || selection.isCollapsed){
        hidePanel();
        return;
      }

      var range = selection.getRangeAt(0);
      if(!isAllowedRange(range)){
        hidePanel();
        return;
      }

      var text = selection.toString().trim();
      if(text.length < 3 || text.length > 4000){
        hidePanel();
        return;
      }

      activeRange = range.cloneRange();
      activeText = text;
      preview.textContent = compactText(text, 220);
      status.textContent = "";
      panel.dataset.state = "ready";
      submit.disabled = false;
      panel.hidden = false;
      setHighlight("codex-refiner-selection", activeRange);
      clearHighlight("codex-refiner-running");
      repositionPanel();
    }

    function isAllowedRange(range){
      var node = range.commonAncestorContainer;
      var element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      if(!element || !main.contains(element)){
        return false;
      }

      return !element.closest(".codex-refiner,script,style,textarea,input,button,select,pre,code,.print-only,.epub-only");
    }

    async function refineSelection(){
      if(running || !activeRange || !activeText){
        return;
      }

      running = true;
      submit.disabled = true;
      panel.dataset.state = "running";
      status.textContent = "Running";
      clearHighlight("codex-refiner-selection");
      setHighlight("codex-refiner-running", activeRange);

      try{
        var response = await fetch("/__codex/refine-description", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: activeText,
            reason: reason.value.trim(),
            pagePath: window.location.pathname
          })
        });

        var payload = await response.json().catch(function(){
          return {};
        });

        if(!response.ok){
          throw new Error(payload.error || "Codex could not refine this selection.");
        }

        var refined = String(payload.text || "").trim();
        if(!refined){
          throw new Error("Codex returned an empty refinement.");
        }

        applyRefinement(refined);
        panel.dataset.state = "done";
        status.textContent = "Saved";
        window.setTimeout(hidePanel, 1100);
      }catch(error){
        panel.dataset.state = "error";
        status.textContent = error.message || "Failed";
        clearHighlight("codex-refiner-running");
        setHighlight("codex-refiner-selection", activeRange);
        submit.disabled = false;
      }finally{
        running = false;
      }
    }

    function applyRefinement(refined){
      var range = activeRange.cloneRange();
      var mark = document.createElement("span");
      mark.className = "codex-refiner-result";
      mark.textContent = refined;

      range.deleteContents();
      range.insertNode(mark);
      clearHighlight("codex-refiner-running");
      window.getSelection().removeAllRanges();

      window.requestAnimationFrame(function(){
        mark.classList.add("is-visible");
        mark.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });

      window.setTimeout(function(){
        var textNode = document.createTextNode(mark.textContent);
        mark.replaceWith(textNode);
        main.normalize();
      }, 2600);
    }

    function repositionPanel(){
      if(panel.hidden || !activeRange){
        return;
      }

      var rect = rangeRect(activeRange);
      if(!rect){
        return;
      }

      var margin = 12;
      var width = Math.min(360, window.innerWidth - margin * 2);
      var left = rect.left + rect.width / 2 - width / 2;
      left = Math.max(margin, Math.min(left, window.innerWidth - width - margin));

      panel.style.width = width + "px";
      panel.style.left = left + "px";
      var maxTop = Math.max(margin, window.innerHeight - panel.offsetHeight - margin);
      var top = Math.min(rect.bottom + 12, maxTop);

      if(rect.bottom + panel.offsetHeight + margin * 2 > window.innerHeight && rect.top > panel.offsetHeight + margin * 2){
        top = Math.max(margin, rect.top - panel.offsetHeight - 12);
      }

      panel.style.top = top + "px";
    }

    function rangeRect(range){
      var rect = range.getBoundingClientRect();
      if(rect && (rect.width || rect.height)){
        return rect;
      }

      var rects = range.getClientRects();
      return rects.length ? rects[0] : null;
    }

    function hidePanel(){
      if(running){
        return;
      }

      panel.hidden = true;
      panel.dataset.state = "idle";
      status.textContent = "";
      submit.disabled = false;
      activeRange = null;
      activeText = "";
      clearHighlight("codex-refiner-selection");
      clearHighlight("codex-refiner-running");
    }

    function setHighlight(name, range){
      if(!supportsHighlights || !range){
        return;
      }

      CSS.highlights.delete(name);
      CSS.highlights.set(name, new Highlight(range));
    }

    function clearHighlight(name){
      if(supportsHighlights){
        CSS.highlights.delete(name);
      }
    }
  }

  function isLocalPreview(){
    var host = window.location.hostname;
    return host === "localhost" || host === "127.0.0.1" || host === "::1";
  }

  function compactText(text, max){
    var normalized = String(text || "").replace(/\s+/g, " ").trim();
    if(normalized.length <= max){
      return normalized;
    }
    return normalized.slice(0, max - 1).trim() + "...";
  }
})();
