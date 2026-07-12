(function(){
  "use strict";

  initLessonChrome();

  function initLessonChrome(){
    var lesson = document.querySelector("article.lesson");
    if(!lesson){
      return;
    }

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var headings = initRailToc(lesson);
    initRailDrawer();
    initDepthTracker(lesson, headings);
    if(!reduceMotion){
      initSectionReveals(lesson);
    }
  }

  function initRailToc(lesson){
    var list = lesson.querySelector("[data-rail-toc]");
    var nav = lesson.querySelector("[data-rail-toc-nav]");
    if(!list || !nav){
      return [];
    }

    var sections = lesson.querySelectorAll("section");
    var headings = [];
    var seen = {};
    for(var i = 0; i < sections.length; i++){
      if(sections[i].closest("details.deep-dive")){
        continue;
      }
      var heading = sections[i].querySelector("h2");
      if(!heading || heading.closest("details.deep-dive")){
        continue;
      }
      if(!heading.id){
        var slug = tocSlug(heading.textContent || "") || "section";
        var unique = slug;
        var n = 2;
        while(seen[unique] || document.getElementById(unique)){
          unique = slug + "-" + n;
          n += 1;
        }
        heading.id = unique;
      }
      seen[heading.id] = true;
      headings.push(heading);
    }

    if(headings.length < 2){
      return headings;
    }

    for(var j = 0; j < headings.length; j++){
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = "#" + headings[j].id;
      link.textContent = (headings[j].textContent || "").trim();
      link.setAttribute("data-rail-link", headings[j].id);
      item.appendChild(link);
      list.appendChild(item);
    }
    nav.hidden = false;

    var fab = lesson.querySelector("[data-rail-fab]");
    if(fab){
      fab.hidden = false;
    }

    list.addEventListener("click", function(event){
      var link = event.target.closest ? event.target.closest("a") : null;
      if(link){
        var drawerWasOpen = document.querySelector("[data-lesson-rail][data-open='true']");
        closeRailDrawer();
        if(drawerWasOpen){
          focusRailTarget(link);
        }
      }
    });

    return headings;
  }

  function tocSlug(text){
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]+/gu, "")
      .replace(/-{2,}/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 64);
  }

  function initDepthTracker(lesson, headings){
    var rail = lesson.querySelector("[data-lesson-rail]");
    if(!rail){
      return;
    }
    var readout = rail.querySelector("[data-rail-read]");
    var ticking = false;

    function update(){
      ticking = false;
      var progress = currentReadingProgress();
      rail.style.setProperty("--gauge", progress.toFixed(4));
      if(readout){
        readout.textContent = Math.round(progress * 100) + "%";
      }
      syncActiveTocLink(rail, headings);
    }

    function requestUpdate(){
      if(!ticking){
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    update();
  }

  function syncActiveTocLink(rail, headings){
    if(!headings || headings.length < 2){
      return;
    }
    var threshold = window.innerHeight * 0.38;
    var activeId = "";
    for(var i = 0; i < headings.length; i++){
      if(headings[i].getBoundingClientRect().top <= threshold){
        activeId = headings[i].id;
      }
    }
    var links = rail.querySelectorAll("[data-rail-link]");
    for(var j = 0; j < links.length; j++){
      var isActive = links[j].getAttribute("data-rail-link") === activeId;
      links[j].classList.toggle("is-active", isActive);
      if(isActive){
        links[j].setAttribute("aria-current", "true");
      }else{
        links[j].removeAttribute("aria-current");
      }
    }
  }

  function closeRailDrawer(){
    var rail = document.querySelector("[data-lesson-rail]");
    var fab = document.querySelector("[data-rail-fab]");
    var backdrop = document.querySelector("[data-rail-backdrop]");
    if(rail){
      rail.removeAttribute("data-open");
    }
    if(backdrop){
      backdrop.hidden = true;
    }
    if(fab){
      fab.setAttribute("aria-expanded", "false");
    }
  }

  function focusRailTarget(link){
    var id = link && link.getAttribute("data-rail-link");
    var target = id ? document.getElementById(id) : null;
    if(!target){
      return;
    }

    var addedTabIndex = !target.hasAttribute("tabindex");
    if(addedTabIndex){
      target.setAttribute("tabindex", "-1");
      target.addEventListener("blur", function(){
        target.removeAttribute("tabindex");
      }, { once: true });
    }
    window.setTimeout(function(){
      target.focus({ preventScroll: true });
    }, 0);
  }

  function initRailDrawer(){
    var rail = document.querySelector("[data-lesson-rail]");
    var fab = document.querySelector("[data-rail-fab]");
    var backdrop = document.querySelector("[data-rail-backdrop]");
    if(!rail || !fab){
      return;
    }

    fab.addEventListener("click", function(){
      var open = rail.getAttribute("data-open") === "true";
      if(open){
        closeRailDrawer();
        return;
      }
      rail.setAttribute("data-open", "true");
      fab.setAttribute("aria-expanded", "true");
      if(backdrop){
        backdrop.hidden = false;
      }
    });

    if(backdrop){
      backdrop.addEventListener("click", function(){
        closeRailDrawer();
        fab.focus();
      });
    }

    document.addEventListener("keydown", function(event){
      if(event.key === "Escape" && rail.getAttribute("data-open") === "true"){
        closeRailDrawer();
        fab.focus();
      }
    });

    var persistentRail = window.matchMedia && window.matchMedia("(min-width: 75rem)");
    if(persistentRail && persistentRail.addEventListener){
      persistentRail.addEventListener("change", function(event){
        if(event.matches){
          closeRailDrawer();
        }
      });
    }
  }

  function initSectionReveals(lesson){
    if(!("IntersectionObserver" in window)){
      return;
    }

    var candidates = lesson.querySelectorAll("section");
    var observer = new IntersectionObserver(function(entries){
      for(var i = 0; i < entries.length; i++){
        if(entries[i].isIntersecting){
          entries[i].target.classList.add("rv-in");
          observer.unobserve(entries[i].target);
        }
      }
    }, { threshold: 0.04, rootMargin: "0px 0px -8% 0px" });

    for(var i = 0; i < candidates.length; i++){
      if(candidates[i].closest("details.deep-dive")){
        continue;
      }
      var rect = candidates[i].getBoundingClientRect();
      if(rect.top > window.innerHeight){
        candidates[i].classList.add("rv");
        observer.observe(candidates[i]);
      }
    }
  }

  function currentReadingProgress(){
    return normalizedProgress(window.scrollY / Math.max(1, maxPageScroll()));
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


})();
