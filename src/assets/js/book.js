(function(){
  "use strict";

  var root = document.documentElement;
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
        vstate.textContent = "Justified, true, believed, yet not knowledge";
        vstate.className = "vstate no";
        vexpl.innerHTML = "A <strong>Gettier case</strong>: all three legs are in place, but the justification misfires and truth arrives by coincidence.";
      } else if(jtb){
        vstate.textContent = "Knowledge on the classic JTB view";
        vstate.className = "vstate know";
        vexpl.innerHTML = "Belief, truth, and justification all hold, with no luck papering over a gap.";
      } else {
        var missing = [];
        if(!t) missing.push("truth");
        if(!b) missing.push("belief");
        if(!j) missing.push("justification");
        vstate.textContent = "Not knowledge";
        vstate.className = "vstate no";
        vexpl.textContent = "A leg is missing: " + missing.join(", ") + ".";
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
      clock:{b:1,t:1,j:1,l:1,s:"The stopped clock is correct only by coincidence."},
      coins:{b:1,t:1,j:1,l:1,s:"Smith gets the job and has ten coins, but his evidence tracked Jones."},
      guess:{b:1,t:1,j:0,l:0,s:"A lucky guess lands without justification."},
      false:{b:1,t:0,j:1,l:0,s:"The evidence looks good, but the claim is false."},
      know:{b:1,t:1,j:1,l:0,s:"A working clock read correctly is the ordinary case."}
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
        sumtxt.textContent = "sum = " + sum.toFixed(2);
        sumtxt.style.color = "var(--ok)";
        ledger.className = "ledger coherent";
        ledgerH.textContent = "Coherent";
        ledgerBody.textContent = "Your confidences sum to exactly 1. No book of fair-looking bets can guarantee a loss.";
        return;
      }
      sumtxt.textContent = "sum = " + sum.toFixed(2) + (sum > 1 ? " (over)" : " (under)");
      sumtxt.style.color = "var(--contested)";
      ledger.className = "ledger dutch";
      ledgerH.textContent = "Dutch book";
      if(sum > 1){
        ledgerBody.innerHTML = "You would pay " + money(sum) + " for two bets where exactly one pays <code>$1.00</code>. Your locked-in loss is <strong>" + money(sum - 1) + "</strong>.";
      } else {
        ledgerBody.innerHTML = "If the bookie buys both bets from you for " + money(sum) + ", one must pay <code>$1.00</code>. The bookie locks in <strong>" + money(1 - sum) + "</strong>.";
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

  var demarcationData = {
    relativity:{claim:"Light from a distant star bends by 1.75 arcseconds as it grazes the sun.",popper:["sci","Falsifiable: the eclipse measurement could have killed it."],kuhn:["sci","A new spacetime paradigm overturning Newtonian assumptions."],lakatos:["sci","A progressive programme with novel confirmations."],laudan:["sci","Strong across the whole cluster of scientific virtues."]},
    astrology:{claim:"Communication and travel go awry when Mercury is in apparent retrograde motion.",popper:["non","Elastic enough to fit almost any outcome."],kuhn:["non","No puzzle-solving paradigm that updates from anomalies."],lakatos:["non","A degenerating programme of after-the-fact rescue."],laudan:["non","Weak across track record, correction, and risky prediction."]},
    marx:{claim:"All human history is fundamentally the history of class struggle.",popper:["non","Popper's case: predictions were reinterpreted after failure."],kuhn:["dep","Paradigm-like for adherents, but too anomaly-absorbing."],lakatos:["dep","Can begin progressive and become degenerating."],laudan:["dep","Some parts are testable social science; others are philosophy of history."]},
    strings:{claim:"The fundamental constituents of reality are vibrating strings in about 11 dimensions.",popper:["dep","Mathematically rich, but key predictions are not yet feasible tests."],kuhn:["dep","Normal science without decisive empirical sorting."],lakatos:["dep","Judge whether the programme becomes progressive over time."],laudan:["dep","A live cluster-profile dispute, not a one-word verdict."]},
    evolution:{claim:"All living organisms share descent from common ancestors.",popper:["sci","Falsifiable in principle: a Precambrian rabbit would be catastrophic."],kuhn:["sci","The central paradigm of modern biology."],lakatos:["sci","A deeply progressive programme across fossils, genetics, and molecular biology."],laudan:["sci","Predictive, coherent, self-correcting, and broadly confirmed."]},
    freud:{claim:"Neurotic symptoms are caused by conflicts repressed into the unconscious.",popper:["non","Popper's example of a theory that could fit too much."],kuhn:["dep","Paradigm-like schools, but weak convergence."],lakatos:["non","More after-the-fact interpretation than risky confirmed prediction."],laudan:["dep","Grunbaum argued some psychoanalytic claims were refutable, so the border blurs."]}
  };
  var verdictCard = document.getElementById("verdictCard");
  if(verdictCard){
    var order = [["popper","Popper"],["kuhn","Kuhn"],["lakatos","Lakatos"],["laudan","Laudan / cluster"]];
    function tagWord(tag){ return tag === "sci" ? "science" : tag === "non" ? "not science" : "it depends"; }
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

