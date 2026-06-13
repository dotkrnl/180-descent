(function(){
  "use strict";

  var isZh = (document.documentElement.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;

  function pct(o){
    return o.s / o.n;
  }

  function initSimpson(){
    var root = document.querySelector(".causation-simpson");
    if (!root) return;

    var data = {
      A: { small: { s: 81, n: 87 }, large: { s: 192, n: 263 } },
      B: { small: { s: 234, n: 270 }, large: { s: 55, n: 80 } }
    };
    var poolA = { s: data.A.small.s + data.A.large.s, n: data.A.small.n + data.A.large.n };
    var poolB = { s: data.B.small.s + data.B.large.s, n: data.B.small.n + data.B.large.n };
    var wrap = root.querySelector("#simpWrap");
    var winner = root.querySelector("#simpWinner");
    var bPooled = root.querySelector("#simp-pooled");
    var bSplit = root.querySelector("#simp-split");
    if (!wrap || !winner || !bPooled || !bSplit) return;

    var mode = "pooled";

    function row(label, cls, p, raw){
      var w = (p * 100).toFixed(1);
      return '<div class="barrow">' +
        '<div class="who">' + label + '</div>' +
        '<div class="track"><div class="fill ' + cls + '" style="width:' + w + '%">' +
        '<span class="raw">' + raw + '</span></div>' +
        '<span class="pct">' + w + '%</span></div>' +
        '</div>';
    }

    function render(){
      var html = "";
      if (mode === "pooled") {
        html += row(isZh ? "疗法 A · 汇总" : "A · all", "A", pct(poolA), poolA.s + "/" + poolA.n);
        html += row(isZh ? "疗法 B · 汇总" : "B · all", "B", pct(poolB), poolB.s + "/" + poolB.n);
        wrap.innerHTML = html;
        var aw = pct(poolA);
        var bw = pct(poolB);
        winner.className = "simp-winner B";
        winner.innerHTML = isZh
          ? "汇总数据显示，<b>疗法 B 胜出</b>，胜率 " + (bw * 100).toFixed(1) + "% 对 " + (aw * 100).toFixed(1) + "%。结论看似已定。"
          : "Pooled, <b>Treatment B wins</b> — " + (bw * 100).toFixed(1) + "% vs " + (aw * 100).toFixed(1) + "%. Looks settled.";
      } else {
        html += row(isZh ? "疗法 A · 小结石" : "A · small", "A", pct(data.A.small), data.A.small.s + "/" + data.A.small.n);
        html += row(isZh ? "疗法 B · 小结石" : "B · small", "B", pct(data.B.small), data.B.small.s + "/" + data.B.small.n);
        html += '<div class="bar-gap" aria-hidden="true"></div>';
        html += row(isZh ? "疗法 A · 大结石" : "A · large", "A", pct(data.A.large), data.A.large.s + "/" + data.A.large.n);
        html += row(isZh ? "疗法 B · 大结石" : "B · large", "B", pct(data.B.large), data.B.large.s + "/" + data.B.large.n);
        wrap.innerHTML = html;
        winner.className = "simp-winner A";
        winner.innerHTML = isZh
          ? "按结石大小拆分后，<b>疗法 A 在两组中均胜出</b>。汇总结论发生了反转；混杂因素在于 B 接收了更多易处理的轻症。"
          : "Split by stone size, <b>Treatment A wins both rooms</b>. The pooled verdict reverses; the confounder is B's easier caseload.";
      }
    }

    function setMode(nextMode){
      mode = nextMode;
      bPooled.setAttribute("aria-pressed", mode === "pooled" ? "true" : "false");
      bSplit.setAttribute("aria-pressed", mode === "split" ? "true" : "false");
      render();
    }

    bPooled.addEventListener("click", function(){ setMode("pooled"); });
    bSplit.addEventListener("click", function(){ setMode("split"); });
    render();
  }

  function initLadder(){
    var root = document.querySelector(".causation-ladder");
    if (!root) return;

    var data = isZh
      ? {
        1: { name: "第 1 层 · 关联", expr: "P(Y | X)  —  「观察」", body: "世界以其本然之姿呈现：观察模式、寻找相关、执行回归。绝大多数机器学习皆止步于此。它精于预测，却分不清冰淇淋与夏天。" },
        2: { name: "第 2 层 · 干预", expr: "P(Y | do(X))  —  「行动」", body: "现在你亲手改变世界。强行设定 X 会切断其原有的因果纽带，混杂因素便无法再伪装成效应。从「观察」到「干预」，正是今日的核心跨越。" },
        3: { name: "第 3 层 · 反事实", expr: "P(Y_x | X', Y')  —  「想象」", body: "最高层级：在获知现实结果后，追问一个从未发生过的平行世界。责备、遗憾、解释，皆栖息于此。" }
      }
      : {
        1: { name: "Rung 1 · Association", expr: 'P(Y | X)  —  "seeing"', body: "The world as it presents itself. You observe and find patterns: correlation, regression, most of machine learning. Powerful for prediction, but it can never tell ice cream from summer." },
        2: { name: "Rung 2 · Intervention", expr: 'P(Y | do(X))  —  "doing"', body: "Now you reach in and act. Forcing X severs X from its usual causes, so confounders cannot fake an effect. The leap from 1 to 2 is the whole day." },
        3: { name: "Rung 3 · Counterfactuals", expr: 'P(Y_x | X\', Y\')  —  "imagining"', body: "The highest rung: reasoning about what would have happened in a world that never was, given what actually did. This is where blame, regret, and explanation live." }
      };
    var climber = root.querySelector("#climber");
    var detail = root.querySelector("#rungDetail");
    var buttons = root.querySelectorAll(".rungbtn");
    var rungY = { 1: 200, 2: 128, 3: 56 };
    var lines = {
      1: root.querySelector("#lr1"),
      2: root.querySelector("#lr2"),
      3: root.querySelector("#lr3")
    };
    if (!climber || !detail || !buttons.length || !lines[1] || !lines[2] || !lines[3]) return;

    function setRung(r){
      buttons.forEach(function(button){
        button.setAttribute("aria-pressed", button.getAttribute("data-rung") === String(r) ? "true" : "false");
      });
      climber.setAttribute("cy", rungY[r]);
      Object.keys(lines).forEach(function(key){
        var line = lines[key].querySelector("line");
        var selected = key === String(r);
        line.setAttribute("stroke", selected ? "var(--accent)" : "var(--ink-faint)");
        line.setAttribute("stroke-width", selected ? "8" : "6");
        line.setAttribute("opacity", selected ? "1" : "0.5");
      });
      var d = data[r];
      detail.innerHTML = '<div class="rname">' + d.name + '</div>' +
        '<span class="rexpr">' + d.expr + '</span>' +
        '<p>' + d.body + '</p>';
    }

    buttons.forEach(function(button){
      button.addEventListener("click", function(){
        setRung(button.getAttribute("data-rung"));
      });
    });
    setRung(2);
  }

  function initDoVsSee(){
    var root = document.querySelector(".causation-do-see");
    if (!root) return;

    var rConf = root.querySelector("#rConf");
    var rTrue = root.querySelector("#rTrue");
    var vConf = root.querySelector("#vConf");
    var vTrue = root.querySelector("#vTrue");
    var numSee = root.querySelector("#numSee");
    var numDo = root.querySelector("#numDo");
    var verdict = root.querySelector("#dovsVerdict");
    var vh = root.querySelector("#dovsVH");
    var body = root.querySelector("#dovsBody");
    if (!rConf || !rTrue || !vConf || !vTrue || !numSee || !numDo || !verdict || !vh || !body) return;

    function render(){
      var conf = Number(rConf.value) / 100;
      var tru = Number(rTrue.value) / 100;
      vConf.textContent = conf.toFixed(2);
      vTrue.textContent = tru.toFixed(2);

      var bias = 0.55 * conf * conf + 0.18 * conf;
      if (bias > 0.62) bias = 0.62;
      var seeEst = Math.min(tru + bias, 0.95);
      var doEst = tru;

      numSee.innerHTML = (seeEst >= 0 ? "+" : "") + seeEst.toFixed(2) + "<small>" + (isZh ? "表观效应" : "looks like the effect") + "</small>";
      numDo.innerHTML = (doEst >= 0 ? "+" : "") + doEst.toFixed(2) + "<small>" + (isZh ? "真实效应" : "the real effect") + "</small>";

      var gap = seeEst - doEst;
      if (gap < 0.02) {
        verdict.className = "dovs-verdict match";
        vh.textContent = isZh ? "无混杂：观察 = 干预" : "No confounding — seeing = doing";
        body.innerHTML = isZh
          ? "当隐藏原因关闭时，朴素相关与真实因果效应重合。这是统计分析中有时会撞见的幸运特例。"
          : "With the hidden cause switched off, the naive correlation and the true causal effect coincide. This is the lucky special case.";
      } else {
        verdict.className = "dovs-verdict gap";
        vh.textContent = (isZh ? "混杂偏差 = " : "The confounding gap = ") + gap.toFixed(2);
        body.innerHTML = isZh
          ? "肉眼观察到的关联为 <strong>" + seeEst.toFixed(2) + "</strong>；但真实的因果效应仅为 <strong>" + doEst.toFixed(2) + "</strong>。其中的差额全由「夏季」贡献：一条后门路径成功地伪装成了因果。"
          : "The eyeball sees <strong>" + seeEst.toFixed(2) + "</strong>; the true causal effect is only <strong>" + doEst.toFixed(2) + "</strong>. The difference is pure summer: a backdoor path masquerading as cause.";
      }
    }

    rConf.addEventListener("input", render);
    rTrue.addEventListener("input", render);
    render();
  }

  initSimpson();
  initLadder();
  initDoVsSee();
})();
