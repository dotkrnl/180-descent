(function(){
  "use strict";

  var isZh = (document.documentElement.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;

  function id(name){
    return document.getElementById(name);
  }

  function rint(n){
    return Math.floor(Math.random() * n);
  }

  function pct(wins, plays){
    return plays === 0 ? (isZh ? "— 胜率" : "— wins") : (Math.round(1000 * wins / plays) / 10) + "%" + (isZh ? " 胜率" : " wins");
  }

  function initMontyHall(){
    var doors = [id("door0"), id("door1"), id("door2")];
    var say = id("mhSay");
    var choiceBtns = id("mhChoiceBtns");
    var nextWrap = id("mhNextWrap");
    var btnStay = id("btnStay");
    var btnSwitch = id("btnSwitch");
    var btnNext = id("btnNext");
    var btnAuto = id("btnAuto");
    var btnReset = id("btnReset");
    var stayWinsEl = id("stayWins");
    var stayPlaysEl = id("stayPlays");
    var stayPctEl = id("stayPct");
    var switchWinsEl = id("switchWins");
    var switchPlaysEl = id("switchPlays");
    var switchPctEl = id("switchPct");

    if (doors.some(function(door){ return !door; }) || !say || !choiceBtns || !nextWrap || !btnStay || !btnSwitch || !btnNext || !btnAuto || !btnReset) return;
    if (!stayWinsEl || !stayPlaysEl || !stayPctEl || !switchWinsEl || !switchPlaysEl || !switchPctEl) return;

    var stats = { stayW: 0, stayP: 0, switchW: 0, switchP: 0 };
    var state = { car: -1, pick: -1, opened: -1, other: -1, phase: "pick" };

    function clearPrizes(){
      doors.forEach(function(door){
        var holder = door.querySelector(".prizeholder");
        if (holder) holder.innerHTML = "";
        door.classList.remove("picked", "revealed", "win");
        var panel = door.querySelector(".door-panel");
        if (panel) panel.setAttribute("fill", "var(--accent-deep)");
      });
    }

    function showPrize(index, kind){
      var holder = doors[index].querySelector(".prizeholder");
      if (holder) {
        holder.innerHTML = '<text x="45" y="86" text-anchor="middle" font-size="30">' + (kind === "car" ? "🚗" : "🐐") + "</text>";
      }
      var panel = doors[index].querySelector(".door-panel");
      if (panel) panel.setAttribute("fill", "var(--paper)");
      doors[index].classList.add("revealed");
    }

    function updateTally(){
      stayWinsEl.textContent = stats.stayW;
      stayPlaysEl.textContent = stats.stayP;
      stayPctEl.textContent = pct(stats.stayW, stats.stayP);
      switchWinsEl.textContent = stats.switchW;
      switchPlaysEl.textContent = stats.switchP;
      switchPctEl.textContent = pct(stats.switchW, stats.switchP);
    }

    function newRound(){
      clearPrizes();
      state.car = rint(3);
      state.pick = -1;
      state.opened = -1;
      state.other = -1;
      state.phase = "pick";
      say.innerHTML = isZh ? "<b>选一扇门</b>开始。" : "<b>Pick a door</b> to begin.";
      choiceBtns.style.display = "none";
      nextWrap.style.display = "none";
    }

    function hostOpens(){
      var options = [];
      for (var i = 0; i < 3; i++) {
        if (i !== state.pick && i !== state.car) options.push(i);
      }
      state.opened = options[rint(options.length)];
      for (var j = 0; j < 3; j++) {
        if (j !== state.pick && j !== state.opened) state.other = j;
      }
      showPrize(state.opened, "goat");
      doors[state.pick].classList.add("picked");
      state.phase = "choose";
      say.innerHTML = isZh
        ? "你选了<b>" + (state.pick + 1) + " 号门</b>。主持人打开<b>" + (state.opened + 1) + " 号门</b>——是一只山羊。现在：<b>坚守</b> " + (state.pick + 1) + " 号门，还是<b>换到</b> " + (state.other + 1) + " 号门？"
        : "You picked <b>Door " + (state.pick + 1) + "</b>. The host opens <b>Door " + (state.opened + 1) + "</b> — a goat. Now: <b>stay</b> on " + (state.pick + 1) + ", or <b>switch</b> to " + (state.other + 1) + "?";
      choiceBtns.style.display = "flex";
    }

    function resolve(switched){
      var finalPick = switched ? state.other : state.pick;
      var won = finalPick === state.car;
      for (var i = 0; i < 3; i++) {
        if (i !== state.opened) showPrize(i, i === state.car ? "car" : "goat");
      }
      doors[finalPick].classList.add("win");
      if (switched) {
        stats.switchP++;
        if (won) stats.switchW++;
      } else {
        stats.stayP++;
        if (won) stats.stayW++;
      }
      updateTally();
      say.innerHTML = isZh
        ? "你<b>" + (switched ? "换到" : "坚守") + " " + (finalPick + 1) + " 号门</b>，" +
          (won ? '<b class="win-text">赢得了汽车。</b>' : '<b class="lose-text">得到了山羊。</b>') +
          " " + (switched ? "换门是 2/3 策略。" : "坚守是 1/3 策略。")
        : "You <b>" + (switched ? "switched to" : "stayed on") + " Door " + (finalPick + 1) + "</b> and " +
          (won ? '<b class="win-text">won the car.</b>' : '<b class="lose-text">got a goat.</b>') +
          " " + (switched ? "Switching is the 2/3 play." : "Staying is the 1/3 play.");
      choiceBtns.style.display = "none";
      nextWrap.style.display = "flex";
      state.phase = "done";
    }

    doors.forEach(function(door, index){
      door.addEventListener("click", function(){
        if (state.phase !== "pick") return;
        state.pick = index;
        hostOpens();
      });
    });

    btnStay.addEventListener("click", function(){
      if (state.phase === "choose") resolve(false);
    });
    btnSwitch.addEventListener("click", function(){
      if (state.phase === "choose") resolve(true);
    });
    btnNext.addEventListener("click", newRound);
    btnAuto.addEventListener("click", function(){
      for (var k = 0; k < 1000; k++) {
        var car = rint(3);
        var pick = rint(3);
        stats.stayP++;
        stats.switchP++;
        if (pick === car) stats.stayW++;
        else stats.switchW++;
      }
      updateTally();
      say.innerHTML = isZh
        ? "已自动运行 <b>1000 场配对游戏</b>。坚守约 <b>33%</b>；换门约 <b>67%</b>。"
        : "Ran <b>1,000 paired games</b>. Staying lands near <b>33%</b>; switching near <b>67%</b>.";
    });
    btnReset.addEventListener("click", function(){
      stats = { stayW: 0, stayP: 0, switchW: 0, switchP: 0 };
      updateTally();
      newRound();
    });

    updateTally();
    newRound();
  }

  function initBayes(){
    var rPrev = id("rPrev");
    var rSens = id("rSens");
    var rFpr = id("rFpr");
    var vPrev = id("vPrev");
    var vSens = id("vSens");
    var vFpr = id("vFpr");
    var postNum = id("postNum");
    var postExpl = id("postExpl");
    var grid = id("iconGrid");
    if (!rPrev || !rSens || !rFpr || !vPrev || !vSens || !vFpr || !postNum || !postExpl || !grid) return;

    var cols = 40;
    var rows = 25;
    var total = cols * rows;
    var dots = [];
    var svgNS = "http://www.w3.org/2000/svg";
    grid.innerHTML = "";
    for (var i = 0; i < total; i++) {
      var row = Math.floor(i / cols);
      var col = i % cols;
      var cell = 200 / cols;
      var rect = document.createElementNS(svgNS, "rect");
      rect.setAttribute("x", (col * cell + 0.6).toFixed(2));
      rect.setAttribute("y", (row * cell + 0.6).toFixed(2));
      rect.setAttribute("width", (cell - 1.2).toFixed(2));
      rect.setAttribute("height", (cell - 1.2).toFixed(2));
      rect.setAttribute("rx", "0.8");
      grid.appendChild(rect);
      dots.push(rect);
    }

    function render(){
      var prevalence = Number(rPrev.value) / 1000;
      var sensitivity = Number(rSens.value) / 100;
      var falsePositiveRate = Number(rFpr.value) / 100;
      var truePositiveRate = prevalence * sensitivity;
      var falsePositiveShare = (1 - prevalence) * falsePositiveRate;
      var posterior = truePositiveRate + falsePositiveShare > 0 ? truePositiveRate / (truePositiveRate + falsePositiveShare) : 0;
      var sickCount = Math.round(prevalence * total);
      var truePositiveCount = Math.min(sickCount, Math.round(truePositiveRate * total));
      var falsePositiveCount = Math.min(total - sickCount, Math.round(falsePositiveShare * total));
      var positives = truePositiveCount + falsePositiveCount;

      vPrev.textContent = (prevalence * 100).toFixed(1) + "%";
      vSens.textContent = Math.round(sensitivity * 100) + "%";
      vFpr.textContent = Math.round(falsePositiveRate * 100) + "%";
      postNum.textContent = (posterior * 100).toFixed(1) + "%";
      postExpl.innerHTML = isZh
        ? "1000 人中，约有 <code>" + sickCount + "</code> 人患病。测试能检出其中 <code>" + truePositiveCount + "</code> 人，但也会把 <code>" + falsePositiveCount + "</code> 个健康人误判阳性。在全部 <b>" + positives + " 个阳性</b>中，<code>" + truePositiveCount + "</code> 人确实患病 → <b>" + (posterior * 100).toFixed(1) + "%</b>。"
        : "Of 1,000 people, about <code>" + sickCount + "</code> are sick. The test flags <code>" + truePositiveCount + "</code> of them but also <code>" + falsePositiveCount + "</code> healthy people. Among <b>all " + positives + " positives</b>, <code>" + truePositiveCount + "</code> are truly sick → <b>" + (posterior * 100).toFixed(1) + "%</b>.";

      dots.forEach(function(dot, index){
        if (index < truePositiveCount) dot.setAttribute("fill", "var(--ok)");
        else if (index < truePositiveCount + falsePositiveCount) dot.setAttribute("fill", "var(--contested)");
        else dot.setAttribute("fill", "var(--line-strong)");
      });
    }

    [rPrev, rSens, rFpr].forEach(function(slider){
      slider.addEventListener("input", render);
    });
    render();
  }

  function initEValue(){
    var rBias = id("rBias");
    var vBias = id("vBias");
    var btnFlip = id("btnFlip");
    var btnEvReset = id("btnEvReset");
    var evWealthEl = id("evWealth");
    var evFlipsEl = id("evFlips");
    var evHeadsEl = id("evHeads");
    var evLine = id("evLine");
    var evVerdict = id("evVerdict");
    var evVerdictTxt = id("evVerdictTxt");
    var evVerdictSub = id("evVerdictSub");
    if (!rBias || !vBias || !btnFlip || !btnEvReset || !evWealthEl || !evFlipsEl || !evHeadsEl || !evLine || !evVerdict || !evVerdictTxt || !evVerdictSub) return;

    var alt = 0.6;
    var ev;

    function wy(wealth){
      var logWealth = Math.log(Math.max(wealth, 0.0001)) / Math.LN10;
      var y = 188 + (logWealth - (-1.301)) * (60 - 188) / (1.301 - (-1.301));
      return Math.max(14, Math.min(196, y));
    }

    function redraw(){
      var x0 = 44;
      var x1 = 468;
      var points = ev.hist.map(function(wealth, index){
        var x = ev.hist.length <= 1 ? x0 : x0 + (x1 - x0) * index / (ev.hist.length - 1);
        return x.toFixed(1) + "," + wy(wealth).toFixed(1);
      });
      evLine.setAttribute("points", points.join(" "));
      evLine.setAttribute("stroke", ev.rejected ? "var(--ok)" : "var(--accent)");
    }

    function render(){
      ev.wealth = 0.5 * (ev.up + ev.down);
      evWealthEl.textContent = ev.wealth.toFixed(2);
      evFlipsEl.textContent = ev.flips;
      evHeadsEl.textContent = ev.heads + (isZh ? " 次正面" : " heads");
      if (ev.wealth >= 20) {
        ev.rejected = true;
        evVerdict.classList.add("reject");
        evVerdictTxt.textContent = isZh ? "拒绝原假设" : "reject null";
        evVerdictSub.textContent = isZh ? "财富 ≥ 20（显著性水平 0.05）" : "wealth >= 20 (level 0.05)";
      } else {
        evVerdict.classList.remove("reject");
        evVerdictTxt.textContent = isZh ? "收集中…" : "collecting...";
        evVerdictSub.textContent = isZh ? "需要财富 ≥ 20" : "need wealth >= 20";
      }
      redraw();
    }

    function reset(){
      ev = { up: 1, down: 1, wealth: 1, flips: 0, heads: 0, hist: [1], rejected: false };
      render();
    }

    function flipOnce(){
      var p = Number(rBias.value) / 100;
      var heads = Math.random() < p;
      if (heads) {
        ev.heads++;
        ev.up *= 2 * alt;
        ev.down *= 2 * (1 - alt);
      } else {
        ev.up *= 2 * (1 - alt);
        ev.down *= 2 * alt;
      }
      ev.flips++;
      ev.wealth = 0.5 * (ev.up + ev.down);
      ev.hist.push(ev.wealth);
      if (ev.hist.length > 400) ev.hist.shift();
    }

    rBias.addEventListener("input", function(){
      vBias.textContent = (Number(rBias.value) / 100).toFixed(2);
    });
    btnFlip.addEventListener("click", function(){
      for (var i = 0; i < 25; i++) flipOnce();
      render();
    });
    btnEvReset.addEventListener("click", reset);
    vBias.textContent = (Number(rBias.value) / 100).toFixed(2);
    reset();
  }

  initMontyHall();
  initBayes();
  initEValue();
})();
