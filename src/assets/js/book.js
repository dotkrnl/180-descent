(function(){
  "use strict";

  var root = document.documentElement;
  var themeBtn = document.getElementById("themeBtn");
  var themeStorageKey = "180-descent-theme";
  var readingStorageKey = "180-descent-reading-progress";
  var readingResumeHash = "#continue";
  var readingNearEndRatio = 0.9;
  var readingSaveTimer = 0;

  var storedTheme = readStoredTheme();
  if(storedTheme){
    root.setAttribute("data-theme", storedTheme);
  }

  function systemDark(){
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }

  if(themeBtn){
    themeBtn.addEventListener("click", function(){
      var cur = root.getAttribute("data-theme") || "auto";
      var effective = cur === "auto" ? (systemDark() ? "dark" : "light") : cur;
      var next = effective === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      storeTheme(next);
    });
  }

  initReadingProgress();
  initCodexRefiner();

  function initReadingProgress(){
    var lesson = document.querySelector("[data-reading-progress]");
    if(lesson){
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
      url: lesson.getAttribute("data-reading-url") || window.location.pathname,
      label: lesson.getAttribute("data-reading-label") || "",
      title: lesson.getAttribute("data-reading-title") || "",
      summary: lesson.getAttribute("data-reading-summary") || "",
      progress: currentReadingProgress(),
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
    if(!isValidReadingRecord(saved) || normalizePath(saved.url) !== window.location.pathname){
      return false;
    }

    var progress = normalizedProgress(saved.progress);
    if(progress <= 0){
      return false;
    }

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
      href: saved.progress > 0 ? saved.url + readingResumeHash : saved.url,
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
    try{
      return new URL(url, window.location.origin).pathname;
    }catch(error){
      return String(url || "").split("#")[0].split("?")[0];
    }
  }

  function isValidReadingRecord(record){
    return !!(
      record &&
      record.day > 0 &&
      typeof record.url === "string" &&
      /^\/(?:zh\/)?days\/[0-9]{3}-[a-z0-9-]+\/$/.test(record.url) &&
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
