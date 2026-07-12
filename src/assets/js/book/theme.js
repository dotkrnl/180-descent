(function(){
  "use strict";

  var root = document.documentElement;
  var themeBtn = document.getElementById("themeBtn");
  var themeFavicon = document.getElementById("themeFavicon");
  var colorScheme = document.getElementById("colorScheme");
  var themeColorLight = document.getElementById("themeColorLight");
  var themeColorDark = document.getElementById("themeColorDark");
  var colorSchemeQuery = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
  var themeStorageKey = "180-descent-theme";

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


  function syncTheme(){
    syncThemeButton();
    syncThemeFavicon();
    syncThemeColor();
    syncThemeImages();
  }

  function syncThemeColor(){
    if(!themeColorLight && !themeColorDark){
      return;
    }
    var lightColor = themeColorLight && themeColorLight.getAttribute("data-theme-color");
    var darkColor = themeColorDark && themeColorDark.getAttribute("data-theme-color");
    if(!lightColor || !darkColor){
      return;
    }
    var selectedTheme = root.getAttribute("data-theme") || "auto";
    if(selectedTheme === "auto"){
      if(colorScheme) colorScheme.setAttribute("content", "light dark");
      if(themeColorLight){
        themeColorLight.setAttribute("content", lightColor);
        themeColorLight.setAttribute("media", "(prefers-color-scheme: light)");
      }
      if(themeColorDark){
        themeColorDark.setAttribute("content", darkColor);
        themeColorDark.setAttribute("media", "(prefers-color-scheme: dark)");
      }
      return;
    }
    var selectedMeta = selectedTheme === "dark" ? themeColorDark : themeColorLight;
    var unselectedMeta = selectedTheme === "dark" ? themeColorLight : themeColorDark;
    var selectedColor = selectedTheme === "dark" ? darkColor : lightColor;
    if(colorScheme) colorScheme.setAttribute("content", selectedTheme);
    if(selectedMeta){
      selectedMeta.setAttribute("content", selectedColor);
      selectedMeta.setAttribute("media", "all");
    }
    if(unselectedMeta){
      unselectedMeta.setAttribute("content", selectedColor);
      unselectedMeta.setAttribute("media", "not all");
    }
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


})();
