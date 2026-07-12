(function(){
  "use strict";

  var root = document.documentElement;
  var readingStorageKey = "180-descent-reading-progress";
  var readingResumeHash = "#continue";
  var readingNearEndRatio = 0.9;
  var readingSaveTimer = 0;

  initReadingProgress();

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
    var saved = progress[locale];
    if(isValidReadingRecord(saved)){
      var savedDay = Number(saved.day) || 0;
      if(savedDay > record.day){
        return;
      }
      if(savedDay === record.day){
        record.progress = Math.max(normalizedProgress(saved.progress), record.progress);
      }
    }
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
      });
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

  function readStorageValue(key){
    try{
      return window.localStorage ? window.localStorage.getItem(key) : null;
    }catch{
      return null;
    }
  }

  function writeStorageValue(key, value){
    try{
      if(window.localStorage){
        window.localStorage.setItem(key, value);
      }
      return true;
    }catch{
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
    }catch{
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
    }catch{
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
    }catch{
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
