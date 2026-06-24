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
    var cellW = 82;
    var cellH = 92;
    var cellStep = 5;
    var dot = 4;
    var layout = {
      A: { x: 40 },
      B: { x: 150 },
      small: { y: 34 },
      large: { y: 150 }
    };

    function group(treatment, size){
      var source = size === "all"
        ? { s: data[treatment].small.s + data[treatment].large.s, n: data[treatment].small.n + data[treatment].large.n }
        : data[treatment][size];
      return { treatment: treatment, size: size, s: source.s, n: source.n };
    }

    function pctText(s, n){
      return (s / n * 100).toFixed(1) + "%";
    }

    function pctClass(s, n){
      return "simp-rate-fill-" + Math.round(s / n * 1000);
    }

    function calcLine(g, win){
      var cls = g.treatment === "A" ? "A" : "B";
      var percent = pctText(g.s, g.n);
      var fail = g.n - g.s;
      return '<div class="simp-line ' + cls + (win ? ' win' : '') + '">' +
        '<span>' + (isZh ? "疗法 " : "Treatment ") + g.treatment + '</span>' +
        '<code>' + g.s + (isZh ? " 有效 / " : " effective / ") + fail + (isZh ? " 无效" : " not effective") + '</code>' +
        '<b class="simp-pct">' + percent + '</b>' +
        '<div class="simp-rate" aria-hidden="true"><i class="' + pctClass(g.s, g.n) + '"></i></div>' +
        '</div>';
    }

    function glyph(treatment, size, success, x, y){
      var cls = 'simp-dot ' + treatment + ' ' + size + (success ? ' ok' : ' fail');
      return '<rect class="' + cls + '" x="' + x.toFixed(2) + '" y="' + y.toFixed(2) +
        '" width="' + dot + '" height="' + dot + '" rx=".45"></rect>';
    }

    function renderCell(treatment, size){
      var g = group(treatment, size);
      var cfg = { x: layout[treatment].x, y: layout[size].y };
      var cols = Math.floor(cellW / cellStep);
      var rows = Math.ceil(g.n / cols);
      var y0 = cfg.y + (cellH - rows * cellStep) / 2;
      var html = '<rect class="simp-cell-bg ' + treatment + ' ' + size + '" x="' + cfg.x + '" y="' + cfg.y +
        '" width="' + cellW + '" height="' + cellH + '" rx="7"></rect>';
      for (var i = 0; i < g.n; i++) {
        var col = i % cols;
        var rowIndex = Math.floor(i / cols);
        var x = cfg.x + 3 + col * cellStep;
        var y = y0 + rowIndex * cellStep;
        html += glyph(treatment, size, i < g.s, x, y);
      }
      return html;
    }

    function focusRect(cls, x, y, w, h, label, lx, ly){
      var text = label
        ? '<text class="simp-overlay-label" x="' + lx + '" y="' + ly + '" text-anchor="middle">' + label + '</text>'
        : '';
      return '<rect class="' + cls + '" x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="8"></rect>' + text;
    }

    function renderGrid(){
      var html = '<text class="simp-axis-label treatment" x="' + (layout.A.x + cellW / 2) + '" y="18" text-anchor="middle">' +
        (isZh ? "疗法 A" : "Treatment A") + '</text>' +
        '<text class="simp-axis-label treatment" x="' + (layout.B.x + cellW / 2) + '" y="18" text-anchor="middle">' +
        (isZh ? "疗法 B" : "Treatment B") + '</text>' +
        '<text class="simp-axis-label row" x="16" y="' + (layout.small.y + cellH / 2 + 4) + '" text-anchor="middle">' +
        (isZh ? "小结石" : "small") + '</text>' +
        '<text class="simp-axis-label row" x="16" y="' + (layout.large.y + cellH / 2 + 4) + '" text-anchor="middle">' +
        (isZh ? "大结石" : "large") + '</text>';
      html += renderCell("A", "small") + renderCell("B", "small") + renderCell("A", "large") + renderCell("B", "large");
      if (mode === "pooled") {
        html += focusRect("simp-focus pooled A", layout.A.x - 5, layout.small.y - 5, cellW + 10, layout.large.y + cellH - layout.small.y + 10, isZh ? "合计 A" : "all A", layout.A.x + cellW / 2, 255);
        html += focusRect("simp-focus pooled B", layout.B.x - 5, layout.small.y - 5, cellW + 10, layout.large.y + cellH - layout.small.y + 10, isZh ? "合计 B" : "all B", layout.B.x + cellW / 2, 255);
      } else {
        html += focusRect("simp-focus split row", layout.A.x - 5, layout.small.y - 5, layout.B.x + cellW - layout.A.x + 10, cellH + 10, isZh ? "只比上排小结石" : "compare top row", 136, layout.small.y + cellH + 17);
        html += focusRect("simp-focus split row", layout.A.x - 5, layout.large.y - 5, layout.B.x + cellW - layout.A.x + 10, cellH + 10, isZh ? "只比下排大结石" : "compare bottom row", 136, layout.large.y + cellH + 17);
      }
      grid.innerHTML = html;
    }

    function room(title, lines, note){
      return '<div class="simp-room">' +
        '<p class="simp-room-title">' + title + '</p>' +
        lines.join("") +
        (note ? '<p class="simp-room-note">' + note + '</p>' : '') +
        '</div>';
    }

    function render(){
      renderGrid();
      if (mode === "pooled") {
        var pooledA = group("A", "all");
        var pooledB = group("B", "all");
        calc.innerHTML = room(
          isZh ? "汇总比较：忽略行，只看疗法" : "Pooled comparison: ignore row, compare treatment",
          [calcLine(pooledA, false), calcLine(pooledB, true)],
          isZh ? "同一张图没有移动任何病例；这里只是把上排和下排一起计数。B 的列里小结石病例更多，因此汇总率被轻症病例抬高。" : "No case moved. This view counts the top and bottom rows together. B has many more small-stone cases, so its pooled rate is lifted by the case mix."
        );
        grid.setAttribute("aria-label", isZh ? "700 名患者固定在同一位置，全部用方块表示；上排是小结石，下排是大结石。汇总视图按疗法 A 和疗法 B 的列比较所有病例。" : "Seven hundred patients stay fixed in place, all drawn as squares; the top row is small stones and the bottom row is large stones. The pooled view compares the Treatment A and Treatment B columns.");
        var aw = pct(poolA);
        var bw = pct(poolB);
        winner.className = "simp-winner B";
        winner.innerHTML = isZh
          ? "汇总数据显示，<span class=\"hl\">疗法 B 的观测成功率更高</span>，为 " + (bw * 100).toFixed(1) + "% 对 " + (aw * 100).toFixed(1) + "%。但注意：上下两排的病例分布并不均衡。"
          : "Pooled, <b>Treatment B has the higher observed success rate</b> — " + (bw * 100).toFixed(1) + "% vs " + (aw * 100).toFixed(1) + "%. But the row mix is not balanced.";
      } else {
        var smallA = group("A", "small");
        var smallB = group("B", "small");
        var largeA = group("A", "large");
        var largeB = group("B", "large");
        calc.innerHTML = room(
          isZh ? "小结石：只比较上排" : "Small stones: compare only top row",
          [calcLine(smallA, true), calcLine(smallB, false)],
          isZh ? "在小结石病例内，A 的观察成功率更高。" : "Within small-stone cases, A has the higher observed success rate."
        ) + room(
          isZh ? "大结石：只比较下排" : "Large stones: compare only bottom row",
          [calcLine(largeA, true), calcLine(largeB, false)],
          isZh ? "在大结石病例内，A 的观察成功率也更高。" : "Within large-stone cases, A also has the higher observed success rate."
        );
        grid.setAttribute("aria-label", isZh ? "700 名患者仍固定在同一位置，全部用方块表示；分层视图在小结石上排和大结石下排内分别比较疗法。" : "The same seven hundred patients stay fixed in place, all drawn as squares; the conditioned view compares treatments within the top small-stone row and the bottom large-stone row.");
        winner.className = "simp-winner A";
        winner.innerHTML = isZh
          ? "按结石大小分层后，<span class=\"hl\">疗法 A 在两类病例中的观察成功率都更高</span>。这说明发生了反转；是否应按此调整取决于因果问题。"
          : "Stratify by stone size and <b>Treatment A has the higher observed rate in both case types</b>. This shows a reversal; whether this is the right adjustment depends on the causal question.";
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
        1: { name: "第 1 层 · 关联", expr: "<code>P(Y | X)</code>  —  「观察」", body: "世界以其本然之姿呈现：观察模式、寻找相关、执行回归。这里问的是服用阿司匹林者与未服用者的头痛改善率有何不同。它精于描述与预测，却不能单独回答干预问题。" },
        2: { name: "第 2 层 · 干预", expr: "<code>P(Y | do(X))</code>  —  「行动」", body: "现在你亲手改变世界。设定 X 的制度会切断其原有的因果纽带，混杂因素便无法再伪装成效应。从「观察」到「干预」，正是今日的核心跨越。" },
        3: { name: "第 3 层 · 反事实", expr: "<code>P(Y<sub>x</sub> | X′, Y′)</code>  —  「想象」", body: "最高层级：在获知现实结果后，追问一个从未发生过的平行世界。这里 <code>Y<sub>x</sub></code> 指把 X 设为 x 的世界里的 Y；X′ 和 Y′ 是已经发生的现实事实。" }
      }
      : {
        1: { name: "Rung 1 · Association", expr: '<code>P(Y | X)</code>  —  "seeing"', body: "The world as it presents itself. You compare headache improvement among people who did and did not take aspirin: correlation, regression, most of machine learning. Powerful for description and prediction, but not by itself an intervention answer." },
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

    var table = root.querySelector("#dovsTable");
    var params = root.querySelector("#dovsParams");
    var presetButtons = root.querySelectorAll("[data-preset]");
    var pRain = 0.45;
    var a = -2.0;
    var c = -2.2;
    var rainWet = 4.1;

    function logistic(x){
      return 1 / (1 + Math.exp(-x));
    }

    function signed(x){
      var rounded = Math.round((x + (x < 0 ? -1e-10 : 1e-10)) * 100) / 100;
      return (rounded >= 0 ? "+" : "") + rounded.toFixed(2);
    }

    function pct1(x){
      return (100 * x).toFixed(1) + "%";
    }

    function model(){
      var conf = Number(rConf.value) / 100;
      var protection = Number(rTrue.value) / 100;
      var b = 4 * conf;
      var d = -3.3 * protection;

      function pS(s){ return s ? pRain : 1 - pRain; }
      function pX(x, s){
        var px = logistic(a + b * s);
        return x ? px : 1 - px;
      }
      function pY(x, s){
        return logistic(c + d * x + rainWet * s);
      }
      function pXMarginal(x){
        return pX(x, 0) * pS(0) + pX(x, 1) * pS(1);
      }
      function pSGivenX(s, x){
        return pX(x, s) * pS(s) / pXMarginal(x);
      }
      function observed(x){
        return pY(x, 0) * pSGivenX(0, x) + pY(x, 1) * pSGivenX(1, x);
      }
      function intervention(x){
        return pY(x, 0) * pS(0) + pY(x, 1) * pS(1);
      }

      var obs0 = observed(0);
      var obs1 = observed(1);
      var do0 = intervention(0);
      var do1 = intervention(1);
      var rows = [
        { x: 1, y: 1, p: pY(1, 0) * pX(1, 0) * pS(0) + pY(1, 1) * pX(1, 1) * pS(1) },
        { x: 1, y: 0, p: (1 - pY(1, 0)) * pX(1, 0) * pS(0) + (1 - pY(1, 1)) * pX(1, 1) * pS(1) },
        { x: 0, y: 1, p: pY(0, 0) * pX(0, 0) * pS(0) + pY(0, 1) * pX(0, 1) * pS(1) },
        { x: 0, y: 0, p: (1 - pY(0, 0)) * pX(0, 0) * pS(0) + (1 - pY(0, 1)) * pX(0, 1) * pS(1) }
      ];
      return {
        conf: conf,
        protection: protection,
        a: a,
        b: b,
        c: c,
        d: d,
        e: rainWet,
        pRain: pRain,
        observedDiff: obs1 - obs0,
        doDiff: do1 - do0,
        adjustedDiff: do1 - do0,
        obs0: obs0,
        obs1: obs1,
        do0: do0,
        do1: do1,
        rows: rows
      };
    }

    function count(p){
      return Math.round(p * 1000);
    }

    function renderTable(m){
      if (!table) return;
      var wetUmbrella = count(m.rows[0].p);
      var dryUmbrella = count(m.rows[1].p);
      var wetNo = count(m.rows[2].p);
      var dryNo = count(m.rows[3].p);
      table.innerHTML =
        '<table class="alt-table"><thead><tr><th>' + (isZh ? "观察表（每 1000 人）" : "Observed table per 1,000") + '</th><th>' +
        (isZh ? "淋湿" : "Wet") + '</th><th>' + (isZh ? "干爽" : "Dry") + '</th><th>' +
        (isZh ? "湿衣概率" : "Risk wet") + '</th></tr></thead><tbody>' +
        '<tr><td>' + (isZh ? "带伞" : "Umbrella") + '</td><td>' + wetUmbrella + '</td><td>' + dryUmbrella + '</td><td>' + pct1(m.obs1) + '</td></tr>' +
        '<tr><td>' + (isZh ? "不带伞" : "No umbrella") + '</td><td>' + wetNo + '</td><td>' + dryNo + '</td><td>' + pct1(m.obs0) + '</td></tr>' +
        '</tbody></table>';
    }

    function renderParams(m){
      if (!params) return;
      params.innerHTML =
        '<table class="alt-table"><thead><tr><th>' + (isZh ? "模型参数" : "Model parameter") + '</th><th>' +
        (isZh ? "当前值" : "Current value") + '</th></tr></thead><tbody>' +
        '<tr><td><code>P(S=1)</code></td><td>' + m.pRain.toFixed(2) + '</td></tr>' +
        '<tr><td><code>a</code></td><td>' + signed(m.a) + '</td></tr>' +
        '<tr><td><code>b</code></td><td>4 × ' + signed(m.conf) + ' = ' + signed(m.b) + '</td></tr>' +
        '<tr><td><code>c</code></td><td>' + signed(m.c) + '</td></tr>' +
        '<tr><td><code>d</code></td><td>-3.3 × ' + m.protection.toFixed(2) + ' = ' + signed(m.d) + '</td></tr>' +
        '<tr><td><code>e</code></td><td>' + signed(m.e) + '</td></tr>' +
        '</tbody></table>';
    }

    function render(){
      var m = model();
      vConf.textContent = "b=" + signed(m.b);
      vTrue.textContent = "d=" + signed(m.d);
      numSee.innerHTML = signed(m.observedDiff) + "<small>" + (isZh ? "观测风险差" : "observed risk difference") + "</small>";
      numDo.innerHTML = signed(m.doDiff) + "<small>" + (isZh ? "干预风险差" : "interventional risk difference") + "</small>";
      renderTable(m);
      renderParams(m);
      equations.innerHTML = isZh
        ? '<div class="dovs-eq see"><span class="tag">观察</span><code>P(Y=1|X=1)-P(Y=1|X=0) = ' + signed(m.observedDiff) + '</code></div>' +
          '<div class="dovs-eq do"><span class="tag">干预</span><code>Σ_s P(Y=1|X=x,S=s)P(S=s): 干预风险差 = ' + signed(m.doDiff) + '</code></div>' +
          '<div class="dovs-eq adj"><span class="tag">调整</span><code>Σ_s [P(Y|X=1,S=s)-P(Y|X=0,S=s)]P(S=s) = ' + signed(m.adjustedDiff) + '</code></div>'
        : '<div class="dovs-eq see"><span class="tag">Seeing</span><code>P(Y=1|X=1)-P(Y=1|X=0) = ' + signed(m.observedDiff) + '</code></div>' +
          '<div class="dovs-eq do"><span class="tag">Doing</span><code>Σ_s P(Y=1|X=x,S=s)P(S=s): interventional risk difference = ' + signed(m.doDiff) + '</code></div>' +
          '<div class="dovs-eq adj"><span class="tag">Adjusted</span><code>Σ_s [P(Y|X=1,S=s)-P(Y|X=0,S=s)]P(S=s) = ' + signed(m.adjustedDiff) + '</code></div>';

      var gap = m.observedDiff - m.doDiff;
      var signReversal = (m.observedDiff > 0 && m.doDiff < 0) || (m.observedDiff < 0 && m.doDiff > 0);
      if (Math.abs(gap) < 0.015) {
        verdict.className = "dovs-verdict match";
        vh.textContent = isZh ? "观察与干预近似重合" : "Seeing and doing nearly coincide";
        body.innerHTML = isZh
          ? "在这个参数组合下，观测风险差和干预风险差数值接近。但这不是因为二者同义，而是因为当前模型让混杂影响很小或相互抵消。"
          : "With these parameters, the observed risk difference and interventional risk difference are numerically close. That does not make them the same kind of quantity; this model just makes the bias small or cancel out.";
      } else if (signReversal) {
        verdict.className = "dovs-verdict gap";
        vh.textContent = isZh ? "符号反转" : "Sign reversal";
        body.innerHTML = isZh
          ? "观察上看，带伞者似乎更容易淋湿；干预上看，给人一把伞会降低淋湿概率。雨改变了两组人的构成。"
          : "Seeing says umbrella users are wetter; doing says giving an umbrella lowers wetness. Rain changed the mix of people in the observed umbrella and no-umbrella groups.";
      } else {
        verdict.className = "dovs-verdict gap";
        vh.textContent = (isZh ? "混杂差距 = " : "Confounding gap = ") + signed(gap);
        body.innerHTML = isZh
          ? "观测风险差为 <span class=\"hl\">" + signed(m.observedDiff) + "</span>，干预风险差为 <span class=\"hl\">" + signed(m.doDiff) + "</span>。二者差距来自开放的后门路径：雨同时影响带伞和淋湿。"
          : "The observed risk difference is <strong>" + signed(m.observedDiff) + "</strong>; the interventional risk difference is <strong>" + signed(m.doDiff) + "</strong>. The gap comes from the open back-door path: rain affects both umbrella use and wet clothes.";
      }
    }

    function setPreset(name){
      var presets = {
        none: { conf: 0, protect: 45 },
        positive: { conf: 70, protect: 35 },
        negative: { conf: -70, protect: 35 },
        reversal: { conf: 90, protect: 50 },
        zero: { conf: 80, protect: 0 }
      };
      var next = presets[name];
      if (!next) return;
      rConf.value = next.conf;
      rTrue.value = next.protect;
      render();
    }

    rConf.addEventListener("input", render);
    rTrue.addEventListener("input", render);
    presetButtons.forEach(function(button){
      button.addEventListener("click", function(){ setPreset(button.getAttribute("data-preset")); });
    });
    render();
  }

  initSimpson();
  initLadder();
  initDoVsSee();
})();
