(function(){
  "use strict";

  var root = document.documentElement;
  var isZh = (root.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;

  document.querySelectorAll(".stakes-dial").forEach(function(panel){
    var rStakes = panel.querySelector(".stakes-range");
    var sdVal = panel.querySelector(".stakes-value");
    var sdCase = panel.querySelector(".stakes-case");
    var sdErr = panel.querySelector(".stakes-error");
    var sdState = panel.querySelector(".stakes-state");
    var sdCtx = panel.querySelector(".stakes-contextualism");
    var sdEnc = panel.querySelector(".stakes-encroachment");
    var sdInv = panel.querySelector(".stakes-invariantism");
    if(!rStakes || !sdVal || !sdCase || !sdErr || !sdState || !sdCtx || !sdEnc || !sdInv) return;

    function stakesWord(s){
      if(isZh){
        if(s < 25) return "低";
        if(s < 55) return "上升中";
        if(s < 80) return "高";
        return "危急";
      }
      if(s < 25) return "low";
      if(s < 55) return "rising";
      if(s < 80) return "high";
      return "critical";
    }
    function caseText(s, err){
      var base;
      if(isZh && s < 25){
        base = '<span class="hl">低利害。</span> 这只是一件小事，出错也没什么严重后果。';
      } else if(isZh && s < 55){
        base = '<span class="hl">利害上升。</span> 错过存款会很麻烦，但仍可补救。';
      } else if(isZh && s < 80){
        base = '<span class="hl">高利害。</span> 一张支票必须在周一前到账，否则会影响抵押贷款。';
      } else if(isZh){
        base = '<span class="hl">危急利害。</span> 如果周一前没有存入这张支票，你可能失去房子。';
      } else if(s < 25){
        base = "<b>Low stakes.</b> It is a small errand. Nothing much rides on it.";
      } else if(s < 55){
        base = "<b>Stakes rising.</b> Missing the deposit would be annoying, but recoverable.";
      } else if(s < 80){
        base = "<b>High stakes.</b> A check must clear by Monday to cover the mortgage.";
      } else {
        base = "<b>Critical stakes.</b> If this deposit is not in by Monday, you could lose the house.";
      }
      if(isZh && err){
        base += ' <span style="color:var(--contested)">而你的配偶补充：「但银行确实有时会改变周末营业时间。」</span>';
      } else if(err){
        base += ' <span style="color:var(--contested)">And your spouse adds: "but banks do sometimes change their weekend hours."</span>';
      }
      return base;
    }
    function renderStakes(){
      var s = Number(rStakes.value);
      var err = sdErr.getAttribute("aria-checked") === "true";
      var threshold = err ? 32 : 68;
      var knows = s < threshold;
      sdVal.textContent = stakesWord(s);
      sdCase.innerHTML = caseText(s, err);
      if(knows){
        sdState.className = "vstate know stakes-state";
        sdState.innerHTML = isZh
          ? '✓「是的，我<span class="hl">知道</span>它周六营业。」'
          : '✓ "Yeah, I <strong>know</strong> it is open Saturday."';
        sdCtx.textContent = isZh ? "当前标准较低：「S 知道」这句话为真。" : 'Low standard in play: the sentence "S knows" comes out true.';
        sdEnc.textContent = isZh ? "利害关系较低，因此这个真信念足以指导行动，也足以算作知识。" : "Little at stake, so the true belief is action-guiding enough to count as knowledge.";
        sdInv.textContent = isZh ? "你知道，而且一直知道；利害关系还没有让你变得谨慎。" : "You know, and always did; the stakes have not made you cautious yet.";
      } else {
        sdState.className = "vstate no stakes-state";
        sdState.innerHTML = isZh
          ? '✕「我<span class="hl">最好进去确认一下</span>。」'
          : '✕ "I had <strong>better go in and check</strong>."';
        sdCtx.textContent = isZh ? "提高的利害或注意力抬高了标准。同样的证据，门槛更严。" : "Raised stakes or attention lift the standard. Same evidence, stricter bar.";
        sdEnc.textContent = isZh ? "利害关系已经侵入：同样的证据不再足以构成知识。" : "What is at stake has encroached: the same evidence no longer suffices to know.";
        sdInv.textContent = isZh ? "「知道」这个词从未移动；两个反应中必有一个是错的。" : 'The word "knows" never moved; one of the two reactions is simply mistaken.';
      }
    }
    rStakes.addEventListener("input", renderStakes);
    sdErr.addEventListener("click", function(){
      sdErr.setAttribute("aria-checked", sdErr.getAttribute("aria-checked") === "true" ? "false" : "true");
      renderStakes();
    });
    renderStakes();
  });
})();
