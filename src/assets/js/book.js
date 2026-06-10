(function(){
  "use strict";

  var root = document.documentElement;
  var isZh = (root.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;
  var themeBtn = document.getElementById("themeBtn");
  function systemDark(){
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  if(themeBtn){
    themeBtn.addEventListener("click", function(){
      var cur = root.getAttribute("data-theme") || "auto";
      var effective = cur === "auto" ? (systemDark() ? "dark" : "light") : cur;
      root.setAttribute("data-theme", effective === "dark" ? "light" : "dark");
    });
  }

  document.querySelectorAll("#ticks").forEach(function(ticks){
    var ns = "http://www.w3.org/2000/svg";
    for(var i = 0; i < 60; i++){
      var a = i * 6 * Math.PI / 180;
      var major = i % 5 === 0;
      var r1 = major ? 92 : 96;
      var r2 = 100;
      var line = document.createElementNS(ns, "line");
      line.setAttribute("x1", (120 + r1 * Math.sin(a)).toFixed(1));
      line.setAttribute("y1", (120 - r1 * Math.cos(a)).toFixed(1));
      line.setAttribute("x2", (120 + r2 * Math.sin(a)).toFixed(1));
      line.setAttribute("y2", (120 - r2 * Math.cos(a)).toFixed(1));
      line.setAttribute("stroke-width", major ? "2" : "1");
      line.setAttribute("opacity", major ? "0.85" : "0.4");
      ticks.appendChild(line);
    }
  });

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
      luckState: "得到证成、为真、被相信，却仍不是知识",
      luckExpl: "这是一个 <strong>盖梯尔案例</strong>：三条腿都在，但理由失准，事实只是碰巧成立。",
      knowledgeState: "在经典 JTB 观点下，这是知识",
      knowledgeExpl: "信念、事实与证成都成立，且没有运气替裂缝打补丁。",
      notKnowledge: "不是知识",
      missingPrefix: "缺少一条腿：",
      missingSuffix: "。",
      truth: "为真",
      belief: "信念",
      justification: "证成",
      stories: {
        clock: "停走的钟只是碰巧在此刻正确。",
        coins: "史密斯得到工作且有十枚硬币，但他的证据追踪的是琼斯。",
        guess: "幸运的猜测命中，却没有证成。",
        false: "证据看似不错，但命题为假。",
        know: "正常运转的钟被正确读出，这是普通的认知情形。"
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

  var rS = document.getElementById("rS");
  var rN = document.getElementById("rN");
  if(rS && rN){
    var vS = document.getElementById("vS");
    var vN = document.getElementById("vN");
    var segS = document.getElementById("segS");
    var segN = document.getElementById("segN");
    var sumtxt = document.getElementById("sumtxt");
    var ledger = document.getElementById("ledger");
    var ledgerH = document.getElementById("ledgerH");
    var ledgerBody = document.getElementById("ledgerBody");
    var credenceText = isZh ? {
      sum: "总和 = ",
      over: "（过高）",
      under: "（过低）",
      coherent: "融贯",
      coherentBody: "你的置信度之和恰好为 1。没有一组看似公平的赌约能保证让你亏损。",
      dutchBook: "荷兰赌",
      overBody: function(sum){ return "你会为两场恰有一场支付 <code>$1.00</code> 的赌约付出 " + money(sum) + "。你锁定的损失是 <strong>" + money(sum - 1) + "</strong>。"; },
      underBody: function(sum){ return "如果博彩商以 " + money(sum) + " 从你手中买下两场赌约，其中一场必定支付 <code>$1.00</code>。博彩商锁定 <strong>" + money(1 - sum) + "</strong> 的收益。"; }
    } : {
      sum: "sum = ",
      over: " (over)",
      under: " (under)",
      coherent: "Coherent",
      coherentBody: "Your confidences sum to exactly 1. No book of fair-looking bets can guarantee a loss.",
      dutchBook: "Dutch book",
      overBody: function(sum){ return "You would pay " + money(sum) + " for two bets where exactly one pays <code>$1.00</code>. Your locked-in loss is <strong>" + money(sum - 1) + "</strong>."; },
      underBody: function(sum){ return "If the bookie buys both bets from you for " + money(sum) + ", one must pay <code>$1.00</code>. The bookie locks in <strong>" + money(1 - sum) + "</strong>."; }
    };
    function money(x){ return "$" + x.toFixed(2); }
    function renderCredence(){
      var s = Number(rS.value) / 100;
      var n = Number(rN.value) / 100;
      var sum = s + n;
      vS.textContent = s.toFixed(2);
      vN.textContent = n.toFixed(2);
      segS.style.width = (s / 2 * 100) + "%";
      segN.style.width = (n / 2 * 100) + "%";
      if(Math.abs(sum - 1) < 0.005){
        sumtxt.textContent = credenceText.sum + sum.toFixed(2);
        sumtxt.style.color = "var(--ok)";
        ledger.className = "ledger coherent";
        ledgerH.textContent = credenceText.coherent;
        ledgerBody.textContent = credenceText.coherentBody;
        return;
      }
      sumtxt.textContent = credenceText.sum + sum.toFixed(2) + (sum > 1 ? credenceText.over : credenceText.under);
      sumtxt.style.color = "var(--contested)";
      ledger.className = "ledger dutch";
      ledgerH.textContent = credenceText.dutchBook;
      if(sum > 1){
        ledgerBody.innerHTML = credenceText.overBody(sum);
      } else {
        ledgerBody.innerHTML = credenceText.underBody(sum);
      }
    }
    rS.addEventListener("input", renderCredence);
    rN.addEventListener("input", renderCredence);
    var snap = document.getElementById("snapBtn");
    if(snap){
      snap.addEventListener("click", function(){ rN.value = 100 - Number(rS.value); renderCredence(); });
    }
    renderCredence();
  }

  var demarcationData = isZh ? {
    relativity:{claim:"遥远星光掠过太阳边缘时弯折 1.75 角秒。",popper:["sci","可证伪：日食测量本可以杀死它。"],kuhn:["sci","一种新的时空范式，推翻牛顿式假设。"],lakatos:["sci","一个作出新颖确认的进步纲领。"],laudan:["sci","在整组科学美德上都很强。"]},
    astrology:{claim:"水星呈逆行视运动时，通讯与旅行会出问题。",popper:["non","足够有弹性，几乎能容纳任何结果。"],kuhn:["non","没有会从反常中更新的解谜范式。"],lakatos:["non","一个以事后补救为主的退化纲领。"],laudan:["non","在记录、修正与冒险预言上都很弱。"]},
    marx:{claim:"全部人类历史从根本上说都是阶级斗争史。",popper:["non","波普尔的判断：预言失败后被重新解释。"],kuhn:["dep","对信奉者而言近似范式，但过于能吸收反常。"],lakatos:["dep","可以起初进步，后来退化。"],laudan:["dep","有些部分是可检验的社会科学，有些则是历史哲学。"]},
    strings:{claim:"现实的基本构成是约十一维空间中振动的弦。",popper:["dep","数学上丰富，但关键预言尚无法实际检验。"],kuhn:["dep","常规科学仍在进行，却缺少决定性的经验筛选。"],lakatos:["dep","要看这个纲领能否随时间变得进步。"],laudan:["dep","这是活的边界争议，不能用一个词裁决。"]},
    evolution:{claim:"所有生命都来自共同祖先。",popper:["sci","原则上可证伪：前寒武纪兔子将是灾难。"],kuhn:["sci","现代生物学的核心范式。"],lakatos:["sci","跨化石、遗传学与分子生物学的深度进步纲领。"],laudan:["sci","可预测、融贯、自我修正，并得到广泛确认。"]},
    freud:{claim:"神经症状源于被压抑进无意识的冲突。",popper:["non","波普尔的例子：一种能够容纳太多东西的理论。"],kuhn:["dep","存在近似范式的学派，但收敛性较弱。"],lakatos:["non","更像事后解释，而非冒险预言后的确认。"],laudan:["dep","格伦鲍姆认为某些精神分析主张可被反驳，因此边界会变得模糊。"]}
  } : {
    relativity:{claim:"Light from a distant star bends by 1.75 arcseconds as it grazes the sun.",popper:["sci","Falsifiable: the eclipse measurement could have killed it."],kuhn:["sci","A new spacetime paradigm overturning Newtonian assumptions."],lakatos:["sci","A progressive programme with novel confirmations."],laudan:["sci","Strong across the whole cluster of scientific virtues."]},
    astrology:{claim:"Communication and travel go awry when Mercury is in apparent retrograde motion.",popper:["non","Elastic enough to fit almost any outcome."],kuhn:["non","No puzzle-solving paradigm that updates from anomalies."],lakatos:["non","A degenerating programme of after-the-fact rescue."],laudan:["non","Weak across track record, correction, and risky prediction."]},
    marx:{claim:"All human history is fundamentally the history of class struggle.",popper:["non","Popper's case: predictions were reinterpreted after failure."],kuhn:["dep","Paradigm-like for adherents, but too anomaly-absorbing."],lakatos:["dep","Can begin progressive and become degenerating."],laudan:["dep","Some parts are testable social science; others are philosophy of history."]},
    strings:{claim:"The fundamental constituents of reality are vibrating strings in about 11 dimensions.",popper:["dep","Mathematically rich, but key predictions are not yet feasible tests."],kuhn:["dep","Normal science without decisive empirical sorting."],lakatos:["dep","Judge whether the programme becomes progressive over time."],laudan:["dep","A live cluster-profile dispute, not a one-word verdict."]},
    evolution:{claim:"All living organisms share descent from common ancestors.",popper:["sci","Falsifiable in principle: a Precambrian rabbit would be catastrophic."],kuhn:["sci","The central paradigm of modern biology."],lakatos:["sci","A deeply progressive programme across fossils, genetics, and molecular biology."],laudan:["sci","Predictive, coherent, self-correcting, and broadly confirmed."]},
    freud:{claim:"Neurotic symptoms are caused by conflicts repressed into the unconscious.",popper:["non","Popper's example of a theory that could fit too much."],kuhn:["dep","Paradigm-like schools, but weak convergence."],lakatos:["non","More after-the-fact interpretation than risky confirmed prediction."],laudan:["dep","Grunbaum argued some psychoanalytic claims were refutable, so the border blurs."]}
  };
  var verdictCard = document.getElementById("verdictCard");
  if(verdictCard){
    var order = isZh ? [["popper","波普尔"],["kuhn","库恩"],["lakatos","拉卡托斯"],["laudan","劳丹 / 群簇"]] : [["popper","Popper"],["kuhn","Kuhn"],["lakatos","Lakatos"],["laudan","Laudan / cluster"]];
    function tagWord(tag){
      if(isZh) return tag === "sci" ? "科学" : tag === "non" ? "非科学" : "视情况而定";
      return tag === "sci" ? "science" : tag === "non" ? "not science" : "it depends";
    }
    function renderDemarcation(key){
      var d = demarcationData[key];
      var html = '<p class="vc-claim">' + d.claim + "</p>";
      order.forEach(function(item){
        var r = d[item[0]];
        html += '<div class="vc-row"><span class="who">' + item[1] + '</span><span class="ruling"><span class="tag ' + r[0] + '">' + tagWord(r[0]) + "</span>" + r[1] + "</span></div>";
      });
      verdictCard.innerHTML = html;
    }
    document.querySelectorAll(".clbtn").forEach(function(button){
      button.addEventListener("click", function(){
        document.querySelectorAll(".clbtn").forEach(function(x){ x.setAttribute("aria-pressed", "false"); });
        button.setAttribute("aria-pressed", "true");
        renderDemarcation(button.getAttribute("data-c"));
      });
    });
    renderDemarcation("relativity");
  }
})();
