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
      luckState: "有理由、为真、被相信，却仍不是知识",
      luckExpl: "这是一个 <strong>盖梯尔案例</strong>：三条腿都在，但理由失准，事实只是碰巧成立。",
      knowledgeState: "在经典 JTB 观点下，这是知识",
      knowledgeExpl: "信念、事实与理由都成立，且没有运气替裂缝打补丁。",
      notKnowledge: "不是知识",
      missingPrefix: "缺少一条腿：",
      missingSuffix: "。",
      truth: "为真",
      belief: "信念",
      justification: "理由",
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

  document.querySelectorAll(".cm-machine").forEach(function(machine){
    var cmP1 = machine.querySelector(".cm-p1");
    var cmP2 = machine.querySelector(".cm-p2");
    var cmC = machine.querySelector(".cm-c");
    var cmOut = machine.querySelector(".cm-outlet");
    var cmBtns = machine.querySelectorAll(".cm-btn");
    if(!cmP1 || !cmP2 || !cmC || !cmOut || !cmBtns.length) return;

    var cmData = isZh ? {
      skeptic: {
        strike: [],
        who: "怀疑论者",
        html: "你接受了全部三行，因此结论成立：按你自己的标准，你不知道自己有双手，也几乎不知道外部世界的任何事。逻辑上整齐，人的层面却难以承受。"
      },
      moore: {
        strike: ["p1"],
        who: "G. E. 摩尔：「这里有一只手」",
        html: "你拒绝 P1：你坚持自己知道并非缸中之脑，因为你知道自己有双手，也能看见它们。疑虑在于：这可能听起来像坚持立场，而非真正回答。"
      },
      dretske: {
        strike: ["p2"],
        who: "德雷茨克与诺齐克：否定封闭性",
        html: "你拒绝 P2：知识不会自动沿每一个蕴含传递。你只需排除实际相关的错误可能。代价是：封闭性在直觉上非常有力。"
      },
      context: {
        strike: [],
        who: "语境主义：改变标准",
        html: "你拒绝那个隐藏假设：认为「知道」只有一个固定标准。日常谈话与怀疑论研讨室使用的是不同标尺。"
      }
    } : {
      skeptic: {
        strike: [],
        who: "The Skeptic",
        html: "You accepted every line, so the conclusion stands: by your own lights, you don't know you have hands, or much of anything about the external world. Logically tidy, humanly unbearable."
      },
      moore: {
        strike: ["p1"],
        who: 'G. E. Moore: "Here is one hand"',
        html: "You reject P1: you insist you do know you are not a vat-brain, because you know you have hands and can see them. The worry: it can feel like foot-stamping rather than an answer."
      },
      dretske: {
        strike: ["p2"],
        who: "Dretske and Nozick: deny closure",
        html: "You reject P2: knowledge does not automatically pass to every entailment. You only need to rule out the live relevant alternatives. The cost: closure is deeply intuitive."
      },
      context: {
        strike: [],
        who: "Contextualism: change the standard",
        html: "You reject the hidden assumption that 'know' means one fixed thing. Ordinary talk and the skeptic's seminar use different yardsticks."
      }
    };

    function cmClear(){
      [cmP1, cmP2, cmC].forEach(function(el){ el.classList.remove("struck"); });
    }
    function cmRender(key){
      var d = cmData[key] || cmData.skeptic;
      cmClear();
      if(d.strike.indexOf("p1") > -1) cmP1.classList.add("struck");
      if(d.strike.indexOf("p2") > -1) cmP2.classList.add("struck");
      if(d.strike.length > 0 && key !== "context") cmC.classList.add("struck");
      cmBtns.forEach(function(button){
        button.setAttribute("aria-pressed", button.getAttribute("data-exit") === key ? "true" : "false");
      });
      cmOut.innerHTML = '<span class="who">' + d.who + "</span>" + d.html;
    }
    cmBtns.forEach(function(button){
      button.addEventListener("click", function(){ cmRender(button.getAttribute("data-exit")); });
    });
  });

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
        base = "<b>低利害。</b> 这只是一件小事，出错也没什么严重后果。";
      } else if(isZh && s < 55){
        base = "<b>利害上升。</b> 错过存款会很麻烦，但仍可补救。";
      } else if(isZh && s < 80){
        base = "<b>高利害。</b> 一张支票必须在周一前到账，否则会影响抵押贷款。";
      } else if(isZh){
        base = "<b>危急利害。</b> 如果周一前没有存入这张支票，你可能失去房子。";
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
        sdState.innerHTML = isZh ? "✓「是的，我<strong>知道</strong>它周六营业。」" : '✓ "Yeah, I <strong>know</strong> it is open Saturday."';
        sdCtx.textContent = isZh ? "当前标准较低：「S 知道」这句话为真。" : 'Low standard in play: the sentence "S knows" comes out true.';
        sdEnc.textContent = isZh ? "利害关系较低，因此这个真信念足以指导行动，也足以算作知识。" : "Little at stake, so the true belief is action-guiding enough to count as knowledge.";
        sdInv.textContent = isZh ? "你知道，而且一直知道；利害关系还没有让你变得谨慎。" : "You know, and always did; the stakes have not made you cautious yet.";
      } else {
        sdState.className = "vstate no stakes-state";
        sdState.innerHTML = isZh ? "✕「我<strong>最好进去确认一下</strong>。」" : '✕ "I had <strong>better go in and check</strong>."';
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

  document.querySelectorAll(".modal-rings").forEach(function(panel){
    var mrSat = panel.querySelector(".modal-satellites");
    var mrCore = panel.querySelector(".modal-core");
    var mrVerdict = panel.querySelector(".modal-verdict");
    var mrExpl = panel.querySelector(".modal-explainer");
    var mrBtns = panel.querySelectorAll(".mr-btn");
    if(!mrSat || !mrCore || !mrVerdict || !mrExpl || !mrBtns.length) return;

    var ns = "http://www.w3.org/2000/svg";
    var N = 12;
    var cx = 180;
    var cy = 150;
    var R = 92;
    var scenarios = isZh ? {
      know: {
        reds: [],
        safe: true,
        label: "安全：知识",
        expl: "一座正常运行的钟被正确读出。时间略有变化，你仍然会是对的。"
      },
      gettier: {
        reds: [0,1,2,3,4,5,6,7,8,9,10],
        safe: false,
        label: "不安全：真理运气",
        expl: "停走的钟在这里恰好为真，但几乎每一个邻近时刻都会让同一个信念变假。"
      },
      barn: {
        reds: [1,2,4,5,7,8,10,11],
        safe: false,
        label: "不安全：环境运气",
        expl: "你看见了真正的谷仓，但邻近的大多数一瞥都会落在假谷仓外观上。"
      }
    } : {
      know: {
        reds: [],
        safe: true,
        label: "safe: knowledge",
        expl: "A working clock, read correctly. Vary the moment slightly and you are still right."
      },
      gettier: {
        reds: [0,1,2,3,4,5,6,7,8,9,10],
        safe: false,
        label: "unsafe: veritic luck",
        expl: "The stopped clock is true here, but almost every nearby moment would make the same belief false."
      },
      barn: {
        reds: [1,2,4,5,7,8,10,11],
        safe: false,
        label: "unsafe: environmental luck",
        expl: "You see the real barn, but nearby looks would mostly land on facades."
      }
    };

    function drawSatellites(reds){
      while(mrSat.firstChild) mrSat.removeChild(mrSat.firstChild);
      for(var i = 0; i < N; i++){
        var ang = (i / N) * 2 * Math.PI - Math.PI / 2;
        var x = cx + R * Math.cos(ang);
        var y = cy + R * Math.sin(ang);
        var isRed = reds.indexOf(i) > -1;
        var circle = document.createElementNS(ns, "circle");
        circle.setAttribute("cx", x.toFixed(1));
        circle.setAttribute("cy", y.toFixed(1));
        circle.setAttribute("r", "12");
        circle.setAttribute("fill", isRed ? "color-mix(in srgb,var(--contested) 20%,transparent)" : "color-mix(in srgb,var(--ok) 18%,transparent)");
        circle.setAttribute("stroke", isRed ? "var(--contested)" : "var(--ok)");
        circle.setAttribute("stroke-width", "1.8");
        mrSat.appendChild(circle);

        var text = document.createElementNS(ns, "text");
        text.setAttribute("x", x.toFixed(1));
        text.setAttribute("y", (y + 3.5).toFixed(1));
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-family", "IBM Plex Mono, monospace");
        text.setAttribute("font-size", "9");
        text.setAttribute("fill", isRed ? "var(--contested)" : "var(--ok)");
        text.textContent = isRed ? "x" : "✓";
        mrSat.appendChild(text);
      }
    }
    function renderModal(key){
      var d = scenarios[key] || scenarios.know;
      drawSatellites(d.reds);
      mrCore.setAttribute("fill", "color-mix(in srgb,var(--ok) 22%,transparent)");
      mrVerdict.className = "mr-verdict modal-verdict " + (d.safe ? "safe" : "unsafe");
      mrVerdict.textContent = d.label;
      mrExpl.textContent = d.expl;
      mrBtns.forEach(function(button){
        button.setAttribute("aria-pressed", button.getAttribute("data-scn") === key ? "true" : "false");
      });
    }
    mrBtns.forEach(function(button){
      button.addEventListener("click", function(){ renderModal(button.getAttribute("data-scn")); });
    });
    renderModal("know");
  });
})();
