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
  initKeyboardActivation();
  initReadingProgress();
  initTipNotes();

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

  function readStoredTheme(){
    var theme = readStorageValue(themeStorageKey);
    return theme === "light" || theme === "dark" ? theme : "";
  }

  function storeTheme(theme){
    writeStorageValue(themeStorageKey, theme);
  }

  function readStorageValue(key){
    try{
      return window.localStorage ? window.localStorage.getItem(key) : null;
    }catch(error){
      return null;
    }
  }

  function writeStorageValue(key, value){
    try{
      if(window.localStorage){
        window.localStorage.setItem(key, value);
      }
      return true;
    }catch(error){
      return false;
    }
  }

  function currentLocale(){
    var lang = root.getAttribute("lang") || "";
    return lang.indexOf("zh") === 0 ? "zh" : "en";
  }

  function readReadingProgress(){
    try{
      var raw = readStorageValue(readingStorageKey);
      var parsed = raw ? JSON.parse(raw) : {};
      return parsed && typeof parsed === "object" ? parsed : {};
    }catch(error){
      return {};
    }
  }

  function storeReadingProgress(progress){
    writeStorageValue(readingStorageKey, JSON.stringify(progress));
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

})();
