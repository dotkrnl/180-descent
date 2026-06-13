(function(){
  "use strict";

  var root = document.documentElement;
  var isZh = (root.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;

  var swB = document.getElementById("sw-b");
  var swT = document.getElementById("sw-t");
  var swJ = document.getElementById("sw-j");
  var swL = document.getElementById("sw-l");
  if(swB && swT && swJ && swL){
    var cB = document.getElementById("c-b");
    var cT = document.getElementById("c-t");
    var cJ = document.getElementById("c-j");
    var centerLabel = document.getElementById("center-label");
    var vstate = document.getElementById("vstate");
    var vexpl = document.getElementById("vexpl");
    var vstory = document.getElementById("vstory");
    var onFill = "color-mix(in srgb,var(--accent) 20%,transparent)";
    var gettierText = isZh ? {
      luckState: "具备理由、为真且被相信，却仍非知识",
      luckExpl: '这是一个 <span class="term">盖梯尔案例</span>：三只脚都在，但理由失准，事实只是凑巧成立。',
      knowledgeState: "经典 JTB 视角下，这被视为知识",
      knowledgeExpl: "信念、事实与理由三者兼备，且没有「运气」在其中作祟。",
      notKnowledge: "非知识",
      missingPrefix: "三脚凳缺了：",
      missingSuffix: "。",
      truth: "为真",
      belief: "信念",
      justification: "理由",
      stories: {
        clock: "停摆的大钟仅在此时此刻碰巧正确。",
        coins: "史密斯赢了且口袋里有十枚硬币，但他赖以判断的证据追踪的是琼斯。",
        guess: "幸运的猜测，因缺乏证成而不能算作知识。",
        false: "证据看起来很充分，但所信之事并非事实。",
        know: "正常运转的钟被准确读取，这是最基础的认知场景。"
      }
    } : {
      luckState: "Justified, true, believed, yet not knowledge",
      luckExpl: "A <strong>Gettier case</strong>: all three legs are in place, but the justification misfires and truth arrives by coincidence.",
      knowledgeState: "Knowledge on the classic JTB view",
      knowledgeExpl: "Belief, truth, and justification all hold, with no luck papering over a gap.",
      notKnowledge: "Not knowledge",
      missingPrefix: "A leg is missing: ",
      missingSuffix: ".",
      truth: "truth",
      belief: "belief",
      justification: "justification",
      stories: {
        clock: "The stopped clock is correct only by coincidence.",
        coins: "Smith gets the job and has ten coins, but his evidence tracked Jones.",
        guess: "A lucky guess lands without justification.",
        false: "The evidence looks good, but the claim is false.",
        know: "A working clock read correctly is the ordinary case."
      }
    };

    function isOn(button){ return button.getAttribute("aria-checked") === "true"; }
    function setSwitch(button, value){ button.setAttribute("aria-checked", value ? "true" : "false"); }
    function paint(circle, on){
      circle.setAttribute("fill", on ? onFill : "transparent");
      circle.setAttribute("stroke", on ? "var(--accent)" : "var(--line-strong)");
      circle.setAttribute("stroke-dasharray", on ? "none" : "4 5");
      circle.setAttribute("opacity", on ? "1" : "0.6");
    }
    function renderGettier(story){
      var b = isOn(swB);
      var t = isOn(swT);
      var j = isOn(swJ);
      var l = isOn(swL);
      paint(cB, b); paint(cT, t); paint(cJ, j);
      if(l && !(b && t && j)){ l = false; setSwitch(swL, false); }
      var jtb = b && t && j;
      if(jtb && !l){
        centerLabel.textContent = "JTB";
        centerLabel.setAttribute("fill", "var(--ok)");
        centerLabel.setAttribute("opacity", "1");
      } else if(jtb && l){
        centerLabel.textContent = "JTB?";
        centerLabel.setAttribute("fill", "var(--contested)");
        centerLabel.setAttribute("opacity", "1");
      } else {
        centerLabel.setAttribute("opacity", "0");
      }
      if(jtb && l){
        vstate.textContent = gettierText.luckState;
        vstate.className = "vstate no";
        vexpl.innerHTML = gettierText.luckExpl;
      } else if(jtb){
        vstate.textContent = gettierText.knowledgeState;
        vstate.className = "vstate know";
        vexpl.innerHTML = gettierText.knowledgeExpl;
      } else {
        var missing = [];
        if(!t) missing.push(gettierText.truth);
        if(!b) missing.push(gettierText.belief);
        if(!j) missing.push(gettierText.justification);
        vstate.textContent = gettierText.notKnowledge;
        vstate.className = "vstate no";
        vexpl.textContent = gettierText.missingPrefix + missing.join(isZh ? "、" : ", ") + gettierText.missingSuffix;
      }
      vstory.textContent = story || "";
    }
    [swB, swT, swJ, swL].forEach(function(button){
      button.addEventListener("click", function(){ setSwitch(button, !isOn(button)); renderGettier(""); });
      button.addEventListener("keydown", function(event){
        if(event.key === " " || event.key === "Enter"){
          event.preventDefault();
          setSwitch(button, !isOn(button));
          renderGettier("");
        }
      });
    });
    var presets = {
      clock:{b:1,t:1,j:1,l:1,s:gettierText.stories.clock},
      coins:{b:1,t:1,j:1,l:1,s:gettierText.stories.coins},
      guess:{b:1,t:1,j:0,l:0,s:gettierText.stories.guess},
      false:{b:1,t:0,j:1,l:0,s:gettierText.stories.false},
      know:{b:1,t:1,j:1,l:0,s:gettierText.stories.know}
    };
    document.querySelectorAll(".pbtn").forEach(function(button){
      button.addEventListener("click", function(){
        var p = presets[button.getAttribute("data-preset")];
        setSwitch(swB, p.b); setSwitch(swT, p.t); setSwitch(swJ, p.j); setSwitch(swL, p.l);
        renderGettier(p.s);
      });
    });
    renderGettier("");
  }
})();
