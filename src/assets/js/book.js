(function(){
  "use strict";

  var root = document.documentElement;
  var themeBtn = document.getElementById("themeBtn");
  var themeFavicon = document.getElementById("themeFavicon");
  var colorSchemeQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var themeStorageKey = "180-descent-theme";
  var readingStorageKey = "180-descent-reading-progress";
  var readingResumeHash = "#continue";
  var readingNearEndRatio = 0.9;
  var readingSaveTimer = 0;

  var storedTheme = readStoredTheme();
  if(storedTheme){
    root.setAttribute("data-theme", storedTheme);
  }
  syncTheme();

  function systemDark(){
    return colorSchemeQuery && colorSchemeQuery.matches;
  }

  function effectiveTheme(){
    var cur = root.getAttribute("data-theme") || "auto";
    return cur === "auto" ? (systemDark() ? "dark" : "light") : cur;
  }

  if(themeBtn){
    themeBtn.addEventListener("click", function(){
      var cur = root.getAttribute("data-theme") || "auto";
      var next = effectiveTheme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      storeTheme(next);
      syncTheme();
    });
  }
  if(colorSchemeQuery){
    var syncOnSystemChange = function(){
      if((root.getAttribute("data-theme") || "auto") === "auto"){
        syncTheme();
      }
    };
    if(colorSchemeQuery.addEventListener){
      colorSchemeQuery.addEventListener("change", syncOnSystemChange);
    }else if(colorSchemeQuery.addListener){
      colorSchemeQuery.addListener(syncOnSystemChange);
    }
  }

  initLiveRegions();
  initReadingProgress();
  initTipNotes();
  initCodexRefiner();

  function syncTheme(){
    syncThemeButton();
    syncThemeFavicon();
    syncThemeImages();
  }

  function syncThemeButton(){
    if(!themeBtn){
      return;
    }
    var effective = effectiveTheme();
    var label = effective === "dark"
      ? themeBtn.getAttribute("data-label-light")
      : themeBtn.getAttribute("data-label-dark");
    if(label){
      themeBtn.setAttribute("aria-label", label);
      themeBtn.setAttribute("title", label);
    }
    themeBtn.setAttribute("aria-pressed", effective === "dark" ? "true" : "false");
  }

  function syncThemeFavicon(){
    if(!themeFavicon){
      return;
    }
    var nextHref = themeFavicon.getAttribute(effectiveTheme() === "dark" ? "data-dark-href" : "data-light-href");
    if(nextHref && themeFavicon.getAttribute("href") !== nextHref){
      themeFavicon.setAttribute("href", nextHref);
    }
  }

  function syncThemeImages(){
    var themedImages = document.querySelectorAll("img[data-light-src][data-dark-src]");
    var useDark = effectiveTheme() === "dark";
    for(var i = 0; i < themedImages.length; i++){
      var img = themedImages[i];
      var nextSrc = img.getAttribute(useDark ? "data-dark-src" : "data-light-src");
      if(nextSrc && img.getAttribute("src") !== nextSrc){
        img.setAttribute("src", nextSrc);
      }
    }
  }

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
        notes[i].removeAttribute("data-align");
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

      note.removeAttribute("data-align");
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
          note.removeAttribute("data-align");
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
  }

  function initReadingProgress(){
    var lesson = document.querySelector("[data-reading-progress]");
    if(lesson){
      restoreSavedAppendicesForCurrentLesson(lesson);
      var didResume = resumeSavedPosition(lesson);
      window.setTimeout(function(){
        rememberCurrentLesson(lesson);
      }, didResume ? 700 : 0);
      startReadingTracker(lesson);
    }

    hydrateReadingCard();
  }

  function startReadingTracker(lesson){
    if(!lesson){
      return;
    }

    window.addEventListener("scroll", function(){
      scheduleReadingProgressSave(lesson);
    }, { passive: true });

    window.addEventListener("resize", function(){
      scheduleReadingProgressSave(lesson);
    });

    var appendices = lesson.querySelectorAll("details.deep-dive[id]");
    for(var i = 0; i < appendices.length; i++){
      appendices[i].addEventListener("toggle", function(){
        scheduleReadingProgressSave(lesson);
      });
    }

    document.addEventListener("visibilitychange", function(){
      if(document.visibilityState === "hidden"){
        rememberCurrentLesson(lesson);
      }
    });

    window.addEventListener("pagehide", function(){
      rememberCurrentLesson(lesson);
    });
  }

  function scheduleReadingProgressSave(lesson){
    if(readingSaveTimer){
      return;
    }

    readingSaveTimer = window.setTimeout(function(){
      readingSaveTimer = 0;
      rememberCurrentLesson(lesson);
    }, 400);
  }

  function rememberCurrentLesson(lesson){
    var locale = lesson.getAttribute("data-reading-locale") || currentLocale();
    var record = {
      day: Number(lesson.getAttribute("data-reading-day")) || 0,
      url: currentLessonPath(lesson),
      label: lesson.getAttribute("data-reading-label") || "",
      title: lesson.getAttribute("data-reading-title") || "",
      summary: lesson.getAttribute("data-reading-summary") || "",
      progress: currentReadingProgress(),
      expandedAppendices: currentExpandedAppendices(lesson),
      updatedAt: new Date().toISOString()
    };

    if(!isValidReadingRecord(record)){
      return;
    }

    var progress = readReadingProgress();
    progress[locale] = record;
    storeReadingProgress(progress);
  }

  function hydrateReadingCard(){
    var card = document.querySelector("[data-reading-card]");
    if(!card){
      return;
    }

    var locale = card.getAttribute("data-reading-locale") || currentLocale();
    var saved = readReadingProgress()[locale];
    var days = readPublishedDays(locale);
    var target = readingCardTarget(saved, days);
    if(!target){
      return;
    }

    var link = card.querySelector("[data-reading-link]");
    if(!link){
      return;
    }

    link.setAttribute("href", target.href);
    link.textContent = target.label;

    var kicker = card.querySelector("[data-reading-kicker]");
    if(kicker){
      kicker.textContent = card.getAttribute("data-reading-continue-kicker") || kicker.textContent;
    }

    var summary = card.querySelector("[data-reading-summary]");
    if(summary && target.summary){
      summary.textContent = target.summary;
    }

    card.classList.add("has-reading-progress");
  }

  function resumeSavedPosition(lesson){
    if(window.location.hash !== readingResumeHash){
      return false;
    }

    var locale = lesson.getAttribute("data-reading-locale") || currentLocale();
    var saved = readReadingProgress()[locale];
    if(!isValidReadingRecord(saved) || normalizePath(saved.url) !== currentLessonPath(lesson)){
      return false;
    }

    var progress = normalizedProgress(saved.progress);
    if(progress <= 0){
      return false;
    }

    restoreExpandedAppendices(lesson, saved.expandedAppendices);
    jumpToReadingProgress(progress);
    window.requestAnimationFrame(function(){
      jumpToReadingProgress(progress);
    });

    if(document.fonts && document.fonts.ready){
      document.fonts.ready.then(function(){
        window.requestAnimationFrame(function(){
          jumpToReadingProgress(progress);
        });
      }).catch(function(){});
    }

    window.addEventListener("load", function(){
      window.requestAnimationFrame(function(){
        jumpToReadingProgress(progress);
      });
    }, { once: true });

    return true;
  }

  function restoreSavedAppendicesForCurrentLesson(lesson){
    if(!lesson){
      return false;
    }

    var locale = lesson.getAttribute("data-reading-locale") || currentLocale();
    var saved = readReadingProgress()[locale];
    if(!isValidReadingRecord(saved) || normalizePath(saved.url) !== currentLessonPath(lesson)){
      return false;
    }

    restoreExpandedAppendices(lesson, saved.expandedAppendices);
    return true;
  }

  function initCodexRefiner(){
    if(!isLocalPreview() || !window.fetch){
      return;
    }

    if(!document.getElementById("content")){
      return;
    }

    fetch("/__codex/refine-description", {
      method: "GET",
      cache: "no-store"
    }).then(function(response){
      if(response.ok){
        mountCodexRefiner();
      }
    }).catch(function(){
      // The static site can also be served on localhost; keep the tool hidden there.
    });
  }

  function mountCodexRefiner(){
    if(window.__codexRefinerMounted){
      return;
    }
    window.__codexRefinerMounted = true;

    var activeRange = null;
    var activeText = "";
    var activeContext = null;
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

      var main = currentMain();
      if(!main || !main.contains(event.target)){
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

      ensurePanel();
      var range = selection.getRangeAt(0);
      if(!isAllowedRange(range)){
        hidePanel();
        return;
      }

      var text = selection.toString().trim();
      if(!text){
        hidePanel();
        return;
      }

      activeRange = range.cloneRange();
      activeText = text;
      activeContext = selectionContext(activeRange);
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
      var main = currentMain();
      var node = range.commonAncestorContainer;
      var element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      if(!main || !element || !main.contains(element)){
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
            context: activeContext,
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
        var main = currentMain();
        if(main){
          main.normalize();
        }
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
      activeContext = null;
      clearHighlight("codex-refiner-selection");
      clearHighlight("codex-refiner-running");
    }

    function currentMain(){
      return document.getElementById("content");
    }

    function ensurePanel(){
      if(!document.body.contains(panel)){
        document.body.appendChild(panel);
      }
    }

    function selectionContext(range){
      var main = currentMain();
      var block = closestBlock(range);
      return {
        before: rangeTextBefore(main, range, 2200),
        after: rangeTextAfter(main, range, 2200),
        block: block ? compactText(block.textContent, 5000) : ""
      };
    }

    function closestBlock(range){
      var node = range.commonAncestorContainer;
      var element = node.nodeType === Node.ELEMENT_NODE ? node : node.parentElement;
      return element ? element.closest("p,li,blockquote,dd,dt,h1,h2,h3,h4,article,section") : null;
    }

    function rangeTextBefore(rootNode, range, limit){
      if(!rootNode){
        return "";
      }

      try{
        var before = document.createRange();
        before.selectNodeContents(rootNode);
        before.setEnd(range.startContainer, range.startOffset);
        return compactStart(before.toString(), limit);
      }catch(error){
        return "";
      }
    }

    function rangeTextAfter(rootNode, range, limit){
      if(!rootNode){
        return "";
      }

      try{
        var after = document.createRange();
        after.selectNodeContents(rootNode);
        after.setStart(range.endContainer, range.endOffset);
        return compactText(after.toString(), limit);
      }catch(error){
        return "";
      }
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

  function readStoredTheme(){
    try{
      var theme = window.localStorage && window.localStorage.getItem(themeStorageKey);
      return theme === "light" || theme === "dark" ? theme : "";
    }catch(error){
      return "";
    }
  }

  function storeTheme(theme){
    try{
      if(window.localStorage){
        window.localStorage.setItem(themeStorageKey, theme);
      }
    }catch(error){}
  }

  function currentLocale(){
    var lang = root.getAttribute("lang") || "";
    return lang.indexOf("zh") === 0 ? "zh" : "en";
  }

  function readReadingProgress(){
    try{
      var raw = window.localStorage && window.localStorage.getItem(readingStorageKey);
      var parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    }catch(error){
      return {};
    }
  }

  function storeReadingProgress(progress){
    try{
      if(window.localStorage){
        window.localStorage.setItem(readingStorageKey, JSON.stringify(progress));
      }
    }catch(error){}
  }

  function readPublishedDays(locale){
    var script = document.querySelector('[data-reading-days][data-reading-locale="' + locale + '"]');
    if(!script){
      return [];
    }

    try{
      var days = JSON.parse(script.textContent || "[]");
      if(!Array.isArray(days)){
        return [];
      }

      return days.filter(isValidReadingRecord).sort(function(a, b){
        return Number(a.day) - Number(b.day);
      });
    }catch(error){
      return [];
    }
  }

  function readingCardTarget(saved, days){
    if(!isValidReadingRecord(saved)){
      return null;
    }

    if(isNearEnd(saved.progress)){
      var next = nextPublishedDay(saved, days);
      if(next){
        return {
          href: next.url,
          label: next.label,
          summary: next.summary || saved.summary || ""
        };
      }
    }

    return {
      href: normalizedSavedUrl(saved) + (saved.progress > 0 ? readingResumeHash : ""),
      label: saved.label,
      summary: saved.summary || ""
    };
  }

  function nextPublishedDay(saved, days){
    var savedDay = Number(saved.day) || 0;
    for(var i = 0; i < days.length; i++){
      if(Number(days[i].day) > savedDay){
        return days[i];
      }
    }
    return null;
  }

  function currentReadingProgress(){
    return normalizedProgress(window.scrollY / Math.max(1, maxPageScroll()));
  }

  function currentExpandedAppendices(lesson){
    var expanded = [];
    var appendices = lesson.querySelectorAll("details.deep-dive[id]");
    for(var i = 0; i < appendices.length; i++){
      if(appendices[i].open){
        expanded.push(appendices[i].id);
      }
    }
    return expanded;
  }

  function restoreExpandedAppendices(lesson, expanded){
    if(!Array.isArray(expanded) || !expanded.length){
      return;
    }

    var expandedById = {};
    for(var i = 0; i < expanded.length; i++){
      if(typeof expanded[i] === "string" && expanded[i]){
        expandedById[expanded[i]] = true;
      }
    }

    var appendices = lesson.querySelectorAll("details.deep-dive[id]");
    for(var j = 0; j < appendices.length; j++){
      if(expandedById[appendices[j].id]){
        appendices[j].open = true;
      }
    }
  }

  function jumpToReadingProgress(progress){
    var top = Math.round(maxPageScroll() * normalizedProgress(progress));
    window.scrollTo(0, top);
  }

  function maxPageScroll(){
    var doc = document.documentElement;
    var body = document.body;
    var height = Math.max(
      doc ? doc.scrollHeight : 0,
      body ? body.scrollHeight : 0,
      doc ? doc.offsetHeight : 0,
      body ? body.offsetHeight : 0
    );
    return Math.max(0, height - window.innerHeight);
  }

  function normalizedProgress(value){
    var n = Number(value);
    if(!isFinite(n)){
      return 0;
    }
    return Math.max(0, Math.min(1, n));
  }

  function isNearEnd(progress){
    return normalizedProgress(progress) >= readingNearEndRatio;
  }

  function normalizePath(url){
    var path = "";
    try{
      path = new URL(url, window.location.origin).pathname;
    }catch(error){
      path = String(url || "").split("#")[0].split("?")[0];
    }

    path = "/" + String(path || "").replace(/^\/+/, "");
    path = path.replace(/\/{2,}/g, "/");
    if(/^\/(?:zh\/)?days\/[0-9]{3}-[a-z0-9-]+$/.test(path)){
      path += "/";
    }
    return path;
  }

  function currentLessonPath(lesson){
    return normalizePath(
      lesson && lesson.getAttribute("data-reading-url")
        ? lesson.getAttribute("data-reading-url")
        : window.location.pathname
    );
  }

  function normalizedSavedUrl(record){
    return normalizePath(record && record.url);
  }

  function isValidReadingRecord(record){
    return !!(
      record &&
      record.day > 0 &&
      typeof record.url === "string" &&
      /^\/(?:zh\/)?days\/[0-9]{3}-[a-z0-9-]+\/$/.test(normalizedSavedUrl(record)) &&
      typeof record.label === "string" &&
      record.label
    );
  }

  function compactText(text, max){
    var normalized = String(text || "").replace(/\s+/g, " ").trim();
    if(normalized.length <= max){
      return normalized;
    }
    return normalized.slice(0, max - 1).trim() + "...";
  }

  function compactStart(text, max){
    var normalized = String(text || "").replace(/\s+/g, " ").trim();
    if(normalized.length <= max){
      return normalized;
    }
    return "..." + normalized.slice(normalized.length - max + 3).trim();
  }
})();
