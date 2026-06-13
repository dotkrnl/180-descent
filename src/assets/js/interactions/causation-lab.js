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

    function calcLine(g, win){
      var cls = g.treatment === "A" ? "A" : "B";
      var percent = pctText(g.s, g.n);
      var fail = g.n - g.s;
      return '<div class="simp-line ' + cls + (win ? ' win' : '') + '">' +
        '<span>' + (isZh ? "疗法 " : "Treatment ") + g.treatment + '</span>' +
        '<code>' + g.s + (isZh ? " 有效 / " : " effective / ") + fail + (isZh ? " 无效" : " not effective") + '</code>' +
        '<b class="simp-pct">' + percent + '</b>' +
        '<div class="simp-rate" aria-hidden="true"><i style="width:' + percent + '"></i></div>' +
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
          isZh ? "同一张图没有移动任何病例；这里只是把上排和下排一起计数。B 的列里小结石病例更多，因此汇总率被轻症病例抬高。" : "No case moved. This view counts the top and bottom rows together. B has many more easy small-stone cases, so its pooled rate is flattered."
        );
        grid.setAttribute("aria-label", isZh ? "700 名患者固定在同一位置，全部用方块表示；上排是小结石，下排是大结石。汇总视图按疗法 A 和疗法 B 的列比较所有病例。" : "Seven hundred patients stay fixed in place, all drawn as squares; the top row is small stones and the bottom row is large stones. The pooled view compares the Treatment A and Treatment B columns.");
        var aw = pct(poolA);
        var bw = pct(poolB);
        winner.className = "simp-winner B";
        winner.innerHTML = isZh
          ? "汇总数据显示，<span class=\"hl\">疗法 B 胜出</span>，胜率 " + (bw * 100).toFixed(1) + "% 对 " + (aw * 100).toFixed(1) + "%。但注意：上下两排的病例分布并不均衡。"
          : "Pooled, <b>Treatment B wins</b> — " + (bw * 100).toFixed(1) + "% vs " + (aw * 100).toFixed(1) + "%. But the row mix is not balanced.";
      } else {
        var smallA = group("A", "small");
        var smallB = group("B", "small");
        var largeA = group("A", "large");
        var largeB = group("B", "large");
        calc.innerHTML = room(
          isZh ? "小结石：只比较上排" : "Small stones: compare only top row",
          [calcLine(smallA, true), calcLine(smallB, false)],
          isZh ? "固定病例类型后，A 在小结石中更高。" : "Holding case type fixed, A is higher among small stones."
        ) + room(
          isZh ? "大结石：只比较下排" : "Large stones: compare only bottom row",
          [calcLine(largeA, true), calcLine(largeB, false)],
          isZh ? "固定病例类型后，A 在大结石中也更高。" : "Holding case type fixed, A is also higher among large stones."
        );
        grid.setAttribute("aria-label", isZh ? "700 名患者仍固定在同一位置，全部用方块表示；分层视图在小结石上排和大结石下排内分别比较疗法。" : "The same seven hundred patients stay fixed in place, all drawn as squares; the conditioned view compares treatments within the top small-stone row and the bottom large-stone row.");
        winner.className = "simp-winner A";
        winner.innerHTML = isZh
          ? "按结石大小条件化后，<span class=\"hl\">疗法 A 在两类病例中均胜出</span>。汇总结论反转，因为 B 接收了更多容易处理的小结石病例。"
          : "Condition on stone size and <b>Treatment A wins both case types</b>. The pooled verdict reverses because B received more easy small-stone cases.";
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
