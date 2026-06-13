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
        html += row(isZh ? "A · 全部" : "A · all", "A", pct(poolA), poolA.s + "/" + poolA.n);
        html += row(isZh ? "B · 全部" : "B · all", "B", pct(poolB), poolB.s + "/" + poolB.n);
        wrap.innerHTML = html;
        var aw = pct(poolA);
        var bw = pct(poolB);
        winner.className = "simp-winner B";
        winner.innerHTML = isZh
          ? "合并来看，<b>治疗 B 胜出</b>，" + (bw * 100).toFixed(1) + "% 对 " + (aw * 100).toFixed(1) + "%。结论看似已定。"
          : "Pooled, <b>Treatment B wins</b> — " + (bw * 100).toFixed(1) + "% vs " + (aw * 100).toFixed(1) + "%. Looks settled.";
      } else {
        html += row(isZh ? "A · 小结石" : "A · small", "A", pct(data.A.small), data.A.small.s + "/" + data.A.small.n);
        html += row(isZh ? "B · 小结石" : "B · small", "B", pct(data.B.small), data.B.small.s + "/" + data.B.small.n);
        html += '<div class="bar-gap" aria-hidden="true"></div>';
        html += row(isZh ? "A · 大结石" : "A · large", "A", pct(data.A.large), data.A.large.s + "/" + data.A.large.n);
        html += row(isZh ? "B · 大结石" : "B · large", "B", pct(data.B.large), data.B.large.s + "/" + data.B.large.n);
        wrap.innerHTML = html;
        winner.className = "simp-winner A";
        winner.innerHTML = isZh
          ? "按结石大小分开，<b>治疗 A 在两组都胜出</b>。合并结论反转了；混杂因素是 B 接到的轻症更多。"
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
        1: { name: "第 1 阶 · 关联", expr: "P(Y | X)  —  「看见」", body: "世界以它自身的样子呈现给你：观察、找模式、做相关、做回归，大多数机器学习都在这里。它很会预测，却分不清冰淇淋和夏天。" },
        2: { name: "第 2 阶 · 干预", expr: "P(Y | do(X))  —  「去做」", body: "现在你伸手改变世界。强行设定 X 会切断 X 原本的原因，混杂因素就不能伪装成效果。第 1 阶到第 2 阶，就是今天的核心跨越。" },
        3: { name: "第 3 阶 · 反事实", expr: "P(Y_x | X', Y')  —  「想象」", body: "最高一阶：在知道现实发生了什么之后，追问另一个从未发生的世界。责备、遗憾、解释，很多都住在这里。" }
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

      numSee.innerHTML = (seeEst >= 0 ? "+" : "") + seeEst.toFixed(2) + "<small>" + (isZh ? "看起来像效果" : "looks like the effect") + "</small>";
      numDo.innerHTML = (doEst >= 0 ? "+" : "") + doEst.toFixed(2) + "<small>" + (isZh ? "真实效果" : "the real effect") + "</small>";

      var gap = seeEst - doEst;
      if (gap < 0.02) {
        verdict.className = "dovs-verdict match";
        vh.textContent = isZh ? "没有混杂：看见 = 去做" : "No confounding — seeing = doing";
        body.innerHTML = isZh
          ? "隐藏原因关闭时，朴素相关和真实因果效果重合。这是统计分析偶尔得到的幸运特例。"
          : "With the hidden cause switched off, the naive correlation and the true causal effect coincide. This is the lucky special case.";
      } else {
        verdict.className = "dovs-verdict gap";
        vh.textContent = (isZh ? "混杂差距 = " : "The confounding gap = ") + gap.toFixed(2);
        body.innerHTML = isZh
          ? "眼睛看到 <strong>" + seeEst.toFixed(2) + "</strong>；真实因果效果只有 <strong>" + doEst.toFixed(2) + "</strong>。差额全是夏天：一条后门路径伪装成了原因。"
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
