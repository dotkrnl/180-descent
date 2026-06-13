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
    var grid = root.querySelector("#simpGrid");
    var calc = root.querySelector("#simpCalc");
    var winner = root.querySelector("#simpWinner");
    var bPooled = root.querySelector("#simp-pooled");
    var bSplit = root.querySelector("#simp-split");
    if (!grid || !calc || !winner || !bPooled || !bSplit) return;

    var mode = "pooled";

    function group(treatment, size, label){
      var source = size === "all"
        ? { s: data[treatment].small.s + data[treatment].large.s, n: data[treatment].small.n + data[treatment].large.n }
        : data[treatment][size];
      var people = [];
      for (var i = 0; i < source.n; i++) {
        people.push({
          treatment: treatment,
          success: i < source.s,
          label: label
        });
      }
      return { treatment: treatment, size: size, label: label, s: source.s, n: source.n, people: people };
    }

    function pctText(s, n){
      return (s / n * 100).toFixed(1) + "%";
    }

    function calcLine(g){
      var cls = g.treatment === "A" ? "A" : "B";
      return '<div class="simp-line ' + cls + '">' +
        '<span>' + (isZh ? "疗法 " : "Treatment ") + g.treatment + '</span>' +
        '<code>' + g.s + '/' + g.n + ' = ' + pctText(g.s, g.n) + '</code>' +
        '</div>';
    }

    function renderGrid(groups){
      var cols = 35;
      var cell = 4.6;
      var gap = 1.05;
      var y0 = 10;
      var html = "";
      var cursor = 0;
      var boundaries = [];
      groups.forEach(function(g, groupIndex){
        if (groupIndex > 0) boundaries.push(cursor);
        g.people.forEach(function(person){
          var col = cursor % cols;
          var rowIndex = Math.floor(cursor / cols);
          html += '<rect class="simp-dot ' + person.treatment + (person.success ? ' ok' : ' fail') + '" x="' +
            (col * (cell + gap)).toFixed(2) + '" y="' + (y0 + rowIndex * (cell + gap)).toFixed(2) +
            '" width="' + cell + '" height="' + cell + '" rx=".7"></rect>';
          cursor++;
        });
      });
      boundaries.forEach(function(boundary){
        if (boundary % cols === 0) {
          var y = y0 + Math.floor(boundary / cols) * (cell + gap) - gap / 2;
          html += '<line class="simp-rule" x1="0" y1="' + y.toFixed(2) + '" x2="196.7" y2="' + y.toFixed(2) + '"></line>';
        } else {
          var x = (boundary % cols) * (cell + gap) - gap / 2;
          var rowIndex = Math.floor(boundary / cols);
          var y1 = y0 + rowIndex * (cell + gap) - gap / 2;
          html += '<line class="simp-rule" x1="' + x.toFixed(2) + '" y1="' + y1.toFixed(2) + '" x2="' + x.toFixed(2) + '" y2="' + (y1 + cell + gap).toFixed(2) + '"></line>';
        }
      });
      grid.innerHTML = html;
    }

    function render(){
      if (mode === "pooled") {
        var pooledGroups = [
          group("A", "all", isZh ? "疗法 A · 汇总" : "Treatment A · pooled"),
          group("B", "all", isZh ? "疗法 B · 汇总" : "Treatment B · pooled")
        ];
        renderGrid(pooledGroups);
        calc.innerHTML = '<div class="simp-room pooled">' +
          '<p class="simp-room-title">' + (isZh ? "汇总比较：先按疗法分组" : "Pooled comparison: sort by treatment first") + '</p>' +
          calcLine(pooledGroups[0]) + calcLine(pooledGroups[1]) +
          '<p class="simp-room-note">' + (isZh ? "乙组看起来更好，但这里混合了小结石和大结石患者。" : "B looks better, but this mixes small-stone and large-stone patients.") + '</p>' +
          '</div>';
        grid.setAttribute("aria-label", isZh ? "700 名患者按疗法汇总排列，疗法 B 在汇总成功率上更高。" : "Seven hundred patients arranged by pooled treatment groups; Treatment B has the higher pooled success rate.");
        var aw = pct(poolA);
        var bw = pct(poolB);
        winner.className = "simp-winner B";
        winner.innerHTML = isZh
          ? "汇总数据显示，<span class=\"hl\">疗法 B 胜出</span>，胜率 " + (bw * 100).toFixed(1) + "% 对 " + (aw * 100).toFixed(1) + "%。结论看似已定。"
          : "Pooled, <b>Treatment B wins</b> — " + (bw * 100).toFixed(1) + "% vs " + (aw * 100).toFixed(1) + "%. Looks settled.";
      } else {
        var smallA = group("A", "small", isZh ? "疗法 A · 小结石" : "Treatment A · small stones");
        var smallB = group("B", "small", isZh ? "疗法 B · 小结石" : "Treatment B · small stones");
        var largeA = group("A", "large", isZh ? "疗法 A · 大结石" : "Treatment A · large stones");
        var largeB = group("B", "large", isZh ? "疗法 B · 大结石" : "Treatment B · large stones");
        renderGrid([smallA, smallB, largeA, largeB]);
        calc.innerHTML = '<div class="simp-room">' +
          '<p class="simp-room-title">' + (isZh ? "小结石：先固定病例难度" : "Small stones: condition on difficulty") + '</p>' +
          calcLine(smallA) + calcLine(smallB) +
          '</div><div class="simp-room">' +
          '<p class="simp-room-title">' + (isZh ? "大结石：再比较同类病例" : "Large stones: compare like with like") + '</p>' +
          calcLine(largeA) + calcLine(largeB) +
          '</div>';
        grid.setAttribute("aria-label", isZh ? "同一批 700 名患者先按结石大小分层，再在每层内比较疗法；疗法 A 在两层中都更高。" : "The same seven hundred patients arranged first by stone size, then by treatment; Treatment A has the higher success rate in both strata.");
        winner.className = "simp-winner A";
        winner.innerHTML = isZh
          ? "按结石大小拆分后，<span class=\"hl\">疗法 A 在两组中均胜出</span>。汇总结论发生了反转；混杂因素在于 B 接收了更多易处理的轻症。"
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
        1: { name: "第 1 层 · 关联", expr: "<code>P(Y | X)</code>  —  「观察」", body: "世界以其本然之姿呈现：观察模式、寻找相关、执行回归。绝大多数机器学习皆止步于此。它精于预测，却分不清冰淇淋与夏天。" },
        2: { name: "第 2 层 · 干预", expr: "<code>P(Y | do(X))</code>  —  「行动」", body: "现在你亲手改变世界。强行设定 X 会切断其原有的因果纽带，混杂因素便无法再伪装成效应。从「观察」到「干预」，正是今日的核心跨越。" },
        3: { name: "第 3 层 · 反事实", expr: "<code>P(Y<sub>x</sub> | X′, Y′)</code>  —  「想象」", body: "最高层级：在获知现实结果后，追问一个从未发生过的平行世界。这里 <code>Y<sub>x</sub></code> 指把 X 设为 x 的世界里的 Y；X′ 和 Y′ 是已经发生的现实事实。" }
      }
      : {
        1: { name: "Rung 1 · Association", expr: '<code>P(Y | X)</code>  —  "seeing"', body: "The world as it presents itself. You observe and find patterns: correlation, regression, most of machine learning. Powerful for prediction, but it can never tell ice cream from summer." },
        2: { name: "Rung 2 · Intervention", expr: '<code>P(Y | do(X))</code>  —  "doing"', body: "Now you reach in and act. Forcing X severs X from its usual causes, so confounders cannot fake an effect. The leap from 1 to 2 is the whole day." },
        3: { name: "Rung 3 · Counterfactuals", expr: '<code>P(Y<sub>x</sub> | X′, Y′)</code>  —  "imagining"', body: "The highest rung: reasoning about what would have happened in a world that never was, given what actually did. Here <code>Y<sub>x</sub></code> means Y in the world where X is set to x; X′ and Y′ are the actual facts you condition on." }
      };
    var climber = root.querySelector("#climber");
    var detail = root.querySelector("#rungDetail");
    var controls = root.querySelectorAll(".rungbtn, .ladder-rung-hotspot");
    var rungY = { 1: 200, 2: 128, 3: 56 };
    var lines = {
      1: root.querySelector("#lr1"),
      2: root.querySelector("#lr2"),
      3: root.querySelector("#lr3")
    };
    if (!climber || !detail || !controls.length || !lines[1] || !lines[2] || !lines[3]) return;

    function setRung(r){
      controls.forEach(function(control){
        control.setAttribute("aria-pressed", control.getAttribute("data-rung") === String(r) ? "true" : "false");
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

    controls.forEach(function(control){
      control.addEventListener("click", function(){
        setRung(control.getAttribute("data-rung"));
      });
      control.addEventListener("keydown", function(event){
        if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
          event.preventDefault();
          setRung(control.getAttribute("data-rung"));
        }
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
    var equations = root.querySelector("#dovsEquations");
    var verdict = root.querySelector("#dovsVerdict");
    var vh = root.querySelector("#dovsVH");
    var body = root.querySelector("#dovsBody");
    if (!rConf || !rTrue || !vConf || !vTrue || !numSee || !numDo || !equations || !verdict || !vh || !body) return;

    function render(){
      var conf = Number(rConf.value) / 100;
      var tru = Number(rTrue.value) / 100;
      vConf.textContent = conf.toFixed(2);
      vTrue.textContent = tru.toFixed(2);

      var bias = 0.55 * conf * conf + 0.18 * conf;
      if (bias > 0.62) bias = 0.62;
      var seeEst = Math.min(tru + bias, 0.95);
      var doEst = tru;
      var signedTrue = (tru >= 0 ? "+" : "") + tru.toFixed(2);
      var signedBias = (bias >= 0 ? "+" : "") + bias.toFixed(2);
      var signedSee = (seeEst >= 0 ? "+" : "") + seeEst.toFixed(2);
      var signedDo = (doEst >= 0 ? "+" : "") + doEst.toFixed(2);

      numSee.innerHTML = signedSee + "<small>" + (isZh ? "表观效应" : "looks like the effect") + "</small>";
      numDo.innerHTML = signedDo + "<small>" + (isZh ? "直接效应" : "direct effect") + "</small>";
      equations.innerHTML = isZh
        ? '<div class="dovs-eq see"><span class="tag">观察</span><code>直接效应 ' + signedTrue + ' + 夏季偏差 ' + signedBias + ' = ' + signedSee + '</code></div>' +
          '<div class="dovs-eq do"><span class="tag">干预</span><code>直接效应 ' + signedTrue + ' + 已切断后门 +0.00 = ' + signedDo + '</code></div>'
        : '<div class="dovs-eq see"><span class="tag">Seeing</span><code>direct effect ' + signedTrue + ' + summer bias ' + signedBias + ' = ' + signedSee + '</code></div>' +
          '<div class="dovs-eq do"><span class="tag">Doing</span><code>direct effect ' + signedTrue + ' + cut backdoor +0.00 = ' + signedDo + '</code></div>';

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
          ? "肉眼观察到的关联为 <span class=\"hl\">" + seeEst.toFixed(2) + "</span>；但真实的因果效应仅为 <span class=\"hl\">" + doEst.toFixed(2) + "</span>。其中的差额全由「夏季」贡献：一条后门路径成功地伪装成了因果。"
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
