(function(){
  "use strict";

  var root = document.documentElement;
  var isZh = (root.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;
  var copy = isZh ? {
    expose: "\u25b6 \u63a5\u89e6\u5916\u90e8\u58f0\u97f3",
    reset: "\u21ba \u91cd\u7f6e\u63a5\u89e6",
    bubbleTitle: "\u8ba4\u8bc6\u6c14\u6ce1",
    bubbleBody: "\u5916\u90e8\u58f0\u97f3\u6839\u672c\u4e0d\u5728\u573a\u2014\u2014\u4e0d\u662f\u88ab\u9a73\u5012\uff0c\u53ea\u662f\u7f3a\u5e2d\u3002\u6c14\u6ce1\u5f88\u8106\u5f31\uff1a\u5b83\u53ea\u9760\u7f3a\u4e4f\u63a5\u89e6\u800c\u5b58\u6d3b\u3002",
    poppedTitle: "\u6c14\u6ce1\u88ab\u6233\u7834 \u2713",
    poppedBody: "\u7f3a\u5e2d\u7684\u58f0\u97f3\u5230\u6765\u4e86\u3002\u4f60\u7684\u4fe1\u5ff5\u73b0\u5728\u53ef\u4ee5\u6839\u636e\u5b83\u4eec\u66f4\u65b0\u2014\u2014\u4e00\u4e2a\u597d\u7684\u5916\u90e8\u6765\u6e90\u5c31\u8db3\u4ee5\u6253\u7834\u6c14\u6ce1\u3002\u63a5\u89e6<em>\u6709\u6548</em>\u3002",
    chamberTitle: "\u56de\u58f0\u5ba4",
    chamberBody: "\u5916\u90e8\u58f0\u97f3\u5728\u573a\uff0c\u4f46\u5df2\u88ab\u9884\u5148\u62b9\u9ed1\u2014\u2014\u4f60\u88ab\u8bad\u7ec3\u6210\u63d0\u524d\u4e0d\u4fe1\u4efb\u5b83\u4eec\uff08\u201c\u4ed6\u4eec\u5728\u6492\u8c0e\u201d\uff09\u3002\u56de\u58f0\u5ba4\u5f88\u7a33\u56fa\uff1a\u4e0d\u4fe1\u4efb\u88ab\u5199\u8fdb\u4e86\u7ed3\u6784\u91cc\u3002",
    backfireTitle: "\u63a5\u89e6\u53cd\u566c \u2717",
    backfireBody: "\u4f60\u542c\u5230\u4e86\u53e6\u4e00\u8fb9\u2014\u2014\u800c\u56de\u58f0\u5ba4\u65e9\u5c31\u9884\u8a00\u4ed6\u4eec\u4f1a\u8bef\u5bfc\u4f60\uff0c\u6240\u4ee5\u542c\u89c1\u4ed6\u4eec\u53cd\u800c<em>\u8bc1\u5b9e\u4e86\u8fd9\u4e2a\u6545\u4e8b</em>\u3002\u4e0d\u4fe1\u4efb\u52a0\u6df1\u3002\u8fd9\u5c31\u662f\u4e3a\u4ec0\u4e48\u201c\u76f4\u63a5\u7ed9\u4ed6\u4eec\u770b\u4e8b\u5b9e\u201d\u53ef\u80fd\u8ba9\u56de\u58f0\u5ba4<em>\u66f4\u5f3a</em>\u3002"
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
      node.style.opacity = opacity;
      text.textContent = mark;
      text.setAttribute("fill", markColor || "var(--ink)");
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
          outLinks.style.opacity = "0";
          echoMsg.className = "echo-msg neutral echo-message";
          echoMsg.innerHTML = "<span class=\"ttl\">" + copy.bubbleTitle + "</span>" + copy.bubbleBody;
        } else {
          oNodes.forEach(function(node){ styleOut(node, "color-mix(in srgb,var(--ok) 22%,transparent)", "var(--ok)", "1", "\u2713", "var(--ok)"); });
          outLinks.setAttribute("stroke", "var(--ok)");
          outLinks.style.opacity = "1";
          echoMsg.className = "echo-msg pop echo-message";
          echoMsg.innerHTML = "<span class=\"ttl\">" + copy.poppedTitle + "</span>" + copy.poppedBody;
        }
        return;
      }

      if(!echoExposed){
        oNodes.forEach(function(node){ styleOut(node, "color-mix(in srgb,var(--contested) 16%,transparent)", "var(--contested)", "1", "\u2717", "var(--contested)"); });
        outLinks.style.opacity = "0";
        echoMsg.className = "echo-msg neutral echo-message";
        echoMsg.innerHTML = "<span class=\"ttl\">" + copy.chamberTitle + "</span>" + copy.chamberBody;
      } else {
        oNodes.forEach(function(node){
          styleOut(node, "color-mix(in srgb,var(--contested) 30%,transparent)", "var(--contested)", "1", "\u2717", "var(--contested)");
          var circle = node.querySelector("circle");
          if(circle) circle.setAttribute("stroke-width", "3.2");
        });
        outLinks.setAttribute("stroke", "var(--contested)");
        outLinks.setAttribute("stroke-dasharray", "2 4");
        outLinks.style.opacity = "0.8";
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
