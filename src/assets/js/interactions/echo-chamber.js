(function(){
  "use strict";

  var root = document.documentElement;
  var isZh = (root.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;
  var copy = isZh ? {
    expose: "▶ 接触外部声音",
    reset: "↺ 重置接触",
    bubbleTitle: "认知气泡",
    bubbleBody: "外部声音根本不在场——它们并非被反驳，而仅仅是缺席。气泡极其脆弱：它全靠缺乏信息流动而维持存续。",
    poppedTitle: "气泡被戳破 ✓",
    poppedBody: "缺失的声音终于传达。你的信念现在可以根据新证据进行更新——通常一个可靠的外部来源就足以打破气泡。此时，接触「有效」。",
    chamberTitle: "回声室",
    chamberBody: "外部声音虽在场，却已被预先贬低——你被训练去提前质疑它们（如「他们在撒谎」）。回声室极其稳固：这种不信任已被内置于认知结构中。",
    backfireTitle: "接触反噬 ✕",
    backfireBody: "当你听到对立面的声音，回声室早预言了对方会试图误导你，于是这种接触反而「证实了原有的预言」。不信任感随之加深。这就是为何「只管向对方展示事实」往往会让回声室变得更强。"
  } : {
    expose: "\u25b6 Expose to outside voices",
    reset: "\u21ba Reset exposure",
    bubbleTitle: "An epistemic bubble",
    bubbleBody: "Outside voices simply aren\u2019t here \u2014 not refuted, just missing. A bubble is fragile: it survives only on lack of exposure.",
    poppedTitle: "Bubble popped \u2713",
    poppedBody: "The missing voices arrive and connect. Your beliefs can now update on them \u2014 a single good outside source can be enough to break a bubble. Exposure <em>works</em>.",
    chamberTitle: "An echo chamber",
    chamberBody: "Outside voices are present but pre-discredited \u2014 you\u2019ve been trained to distrust them in advance (\u201cthey lie\u201d). A chamber is robust: the distrust is built in.",
    backfireTitle: "Exposure backfires \u2717",
    backfireBody: "You heard the other side \u2014 and the chamber predicted they\u2019d try to mislead you, so hearing them <em>confirms the story</em>. Distrust deepens. This is why \u201cjust show them the facts\u201d can make a chamber <em>stronger</em>."
  };

  document.querySelectorAll(".echo-chamber").forEach(function(panel){
    var echoMode = "bubble";
    var echoExposed = false;
    var echoMsg = panel.querySelector(".echo-message");
    var outLinks = panel.querySelector(".echo-out-links");
    var modeBtns = panel.querySelectorAll("[data-mode]");
    var exposeBtn = panel.querySelector(".echo-expose");
    var oNodes = Array.prototype.slice.call(panel.querySelectorAll(".echo-out-node"));
    if(!echoMsg || !outLinks || !modeBtns.length || !exposeBtn || !oNodes.length) return;

    function styleOut(node, fill, stroke, opacity, mark, markColor){
      var circle = node.querySelector("circle");
      var text = node.querySelector("text");
      if(!circle || !text) return;
      circle.setAttribute("fill", fill);
      circle.setAttribute("stroke", stroke);
      node.classList.toggle("is-muted", opacity !== "1");
      text.textContent = mark;
      text.setAttribute("fill", markColor || "var(--ink)");
    }

    function setOutLinksState(state){
      outLinks.classList.remove("is-hidden", "is-visible", "is-reinforced");
      outLinks.classList.add(state);
    }

    function resetOutsideStroke(){
      oNodes.forEach(function(node){
        var circle = node.querySelector("circle");
        if(circle) circle.setAttribute("stroke-width", "1.8");
      });
      outLinks.setAttribute("stroke-dasharray", "4 4");
    }

    function renderEcho(){
      modeBtns.forEach(function(button){
        button.setAttribute("aria-pressed", button.getAttribute("data-mode") === echoMode ? "true" : "false");
      });
      exposeBtn.textContent = echoExposed ? copy.reset : copy.expose;

      if(echoMode === "bubble"){
        if(!echoExposed){
          oNodes.forEach(function(node){ styleOut(node, "transparent", "var(--line-strong)", "0.3", ""); });
          setOutLinksState("is-hidden");
          echoMsg.className = "echo-msg neutral echo-message";
          echoMsg.innerHTML = "<span class=\"ttl\">" + copy.bubbleTitle + "</span>" + copy.bubbleBody;
        } else {
          oNodes.forEach(function(node){ styleOut(node, "color-mix(in srgb,var(--ok) 22%,var(--paper))", "var(--ok)", "1", "\u2713", "var(--ok)"); });
          outLinks.setAttribute("stroke", "var(--ok)");
          setOutLinksState("is-visible");
          echoMsg.className = "echo-msg pop echo-message";
          echoMsg.innerHTML = "<span class=\"ttl\">" + copy.poppedTitle + "</span>" + copy.poppedBody;
        }
        return;
      }

      if(!echoExposed){
        oNodes.forEach(function(node){ styleOut(node, "color-mix(in srgb,var(--contested) 16%,var(--paper))", "var(--contested)", "1", "\u2717", "var(--contested)"); });
        setOutLinksState("is-hidden");
        echoMsg.className = "echo-msg neutral echo-message";
        echoMsg.innerHTML = "<span class=\"ttl\">" + copy.chamberTitle + "</span>" + copy.chamberBody;
      } else {
        oNodes.forEach(function(node){
          styleOut(node, "color-mix(in srgb,var(--contested) 30%,var(--paper))", "var(--contested)", "1", "\u2717", "var(--contested)");
          var circle = node.querySelector("circle");
          if(circle) circle.setAttribute("stroke-width", "3.2");
        });
        outLinks.setAttribute("stroke", "var(--contested)");
        outLinks.setAttribute("stroke-dasharray", "2 4");
        setOutLinksState("is-reinforced");
        echoMsg.className = "echo-msg reinforce echo-message";
        echoMsg.innerHTML = "<span class=\"ttl\">" + copy.backfireTitle + "</span>" + copy.backfireBody;
      }
    }

    modeBtns.forEach(function(button){
      button.addEventListener("click", function(){
        echoMode = button.getAttribute("data-mode") || "bubble";
        echoExposed = false;
        resetOutsideStroke();
        renderEcho();
      });
    });
    exposeBtn.addEventListener("click", function(){
      echoExposed = !echoExposed;
      if(!echoExposed) resetOutsideStroke();
      renderEcho();
    });
    renderEcho();
  });
})();
