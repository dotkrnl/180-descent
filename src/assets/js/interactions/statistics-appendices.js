(function () {
  "use strict";

  var A1 = "appendix-d006-the-deeper-machinery-";
  var A2 = "appendix-d006-the-incoming-wave-";
  var zh = document.documentElement.lang.indexOf("zh") === 0 || location.pathname.indexOf("/zh/") === 0;

  function by(prefix, id) {
    return document.getElementById(prefix + id);
  }

  function fmtPct(x) {
    return Math.round(x * 100) + "%";
  }

  function fmtApproxPct(x) {
    if (x > 0.995 && x < 1) return "\u2248100%";
    return "\u2248" + fmtPct(x);
  }

  function fmtNum(x) {
    return Number(x).toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  function setBar(el, pct) {
    if (el) el.value = Math.max(0, Math.min(100, pct));
  }

  function onInput(prefix, ids, fn) {
    var ok = ids.every(function (id) { return by(prefix, id); });
    if (!ok) return;
    ids.forEach(function (id) { by(prefix, id).addEventListener("input", fn); });
    fn();
  }

  var C = window.DescentCore;
  var betai = C.betai.bind(C);
  var mean = C.mean.bind(C);
  var variance = C.variance.bind(C);
  var randn = C.randn.bind(C);

  function tP(a, b) {
    var na = a.length;
    var nb = b.length;
    var ma = mean(a);
    var mb = mean(b);
    var va = variance(a, ma);
    var vb = variance(b, mb);
    var sp = ((na - 1) * va + (nb - 1) * vb) / (na + nb - 2);
    if (sp <= 0) return 1;
    var t = (ma - mb) / Math.sqrt(sp * (1 / na + 1 / nb));
    var df = na + nb - 2;
    var x = df / (df + t * t);
    return betai(df / 2, 0.5, x);
  }

  function initHistogram() {
    var range = by(A1, "dRange");
    var val = by(A1, "dVal");
    var svg = by(A1, "histCanvas");
    var read = by(A1, "histRead");
    if (!range || !val || !svg || !read) return;

    function run() {
      var d = Number(range.value) / 100;
      val.textContent = d.toFixed(2);
      var nBins = 20;
      var nExp = 4000;
      var nPerGroup = 30;
      var bins = Array.from({ length: nBins }, function () { return 0; });
      var below = 0;
      for (var e = 0; e < nExp; e += 1) {
        var a = [];
        var b = [];
        for (var k = 0; k < nPerGroup; k += 1) {
          a.push(randn());
          b.push(randn() + d);
        }
        var p = tP(a, b);
        bins[Math.min(nBins - 1, Math.floor(p * nBins))] += 1;
        if (p < 0.05) below += 1;
      }
      drawHistogram(svg, bins, below / nExp, d, nExp);
    }

    range.addEventListener("input", run);
    by(A1, "histRun").addEventListener("click", run);
    by(A1, "histNull").addEventListener("click", function () { range.value = 0; run(); });
    by(A1, "histReal").addEventListener("click", function () { range.value = 55; run(); });
    run();
  }

  function drawHistogram(svg, bins, frac, d, nExp) {
    var w = 640;
    var h = 220;
    var padL = 34;
    var padR = 12;
    var padT = 12;
    var padB = 30;
    var pw = w - padL - padR;
    var ph = h - padT - padB;
    var max = Math.max.apply(null, bins.concat([1]));
    var bw = pw / bins.length;
    var uniformY = padT + ph - (nExp / bins.length / max) * ph;
    var out = '<line x1="' + padL + '" y1="' + uniformY.toFixed(1) + '" x2="' + (w - padR) + '" y2="' + uniformY.toFixed(1) + '" stroke="var(--line-strong)" stroke-width="1" stroke-dasharray="3 4"/>';
    out += '<rect x="' + (w - padR - 58) + '" y="' + (uniformY - 18).toFixed(1) + '" width="58" height="16" rx="5" fill="color-mix(in srgb,var(--paper) 92%,transparent)"/>';
    out += '<text x="' + (w - padR - 4) + '" y="' + (uniformY - 6).toFixed(1) + '" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10.5" fill="var(--ink-faint)">' + (zh ? "均匀" : "uniform") + '</text>';
    bins.forEach(function (count, i) {
      var bh = count / max * ph;
      var x = padL + i * bw;
      var y = padT + ph - bh;
      var color = i === 0 ? "var(--contested)" : "var(--ink-faint)";
      var opacity = i === 0 ? "0.88" : "0.32";
      out += '<rect x="' + (x + 1).toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + (bw - 2).toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="1.5" fill="' + color + '" opacity="' + opacity + '"/>';
    });
    var x05 = padL + pw * 0.05;
    out += '<line x1="' + x05.toFixed(1) + '" y1="' + padT + '" x2="' + x05.toFixed(1) + '" y2="' + (padT + ph) + '" stroke="var(--contested)" stroke-width="1.5"/>';
    out += '<rect x="' + (x05 + 5).toFixed(1) + '" y="' + (padT + 3) + '" width="42" height="16" rx="5" fill="color-mix(in srgb,var(--paper) 92%,transparent)"/>';
    out += '<text x="' + (x05 + 10).toFixed(1) + '" y="' + (padT + 15) + '" font-family="IBM Plex Mono,monospace" font-size="10.5" fill="var(--contested)">p&lt;.05</text>';
    out += '<text x="' + padL + '" y="' + (h - 8) + '" font-family="IBM Plex Mono,monospace" font-size="10.5" fill="var(--ink-faint)">p=0</text>';
    out += '<text x="' + (padL + pw * 0.5) + '" y="' + (h - 8) + '" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" fill="var(--ink-faint)">p=0.5</text>';
    out += '<text x="' + (w - padR) + '" y="' + (h - 8) + '" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10.5" fill="var(--ink-faint)">p=1</text>';
    svg.innerHTML = out;
    var pct = Math.round(frac * 100);
    by(A1, "histRead").innerHTML = zh
      ? (d < 0.01
        ? '<span class="hl">这里没有真实效应。</span> 直方图是平的，但仍有 <span class="hl">' + pct + '%</span> 低于 .05。这正是 α 承诺会发生的事。'
        : '真实效应 d=' + d.toFixed(2) + ' 会让分布向左倾斜：<span class="hl">' + pct + '%</span> 跨过 .05。这个比例就是此玩具设定下的检验功效。')
      : (d < 0.01
        ? '<b>Nothing is real here.</b> The histogram is flat, yet <strong>' + pct + '%</strong> still falls below .05. That is alpha doing exactly what it promised.'
        : 'A real effect of d=' + d.toFixed(2) + ' tilts the distribution leftward: <strong>' + pct + '%</strong> clear .05. That share is the study power under this toy setup.');
  }

  function initFalsePositiveRisk() {
    var prior = by(A1, "priorR");
    var power = by(A1, "powerR");
    var grid = by(A1, "ppvGrid");
    if (!prior || !power || !grid) return;
    var cells = [];
    for (var i = 0; i < 100; i += 1) {
      var c = document.createElement("div");
      c.className = "ppv-cell";
      grid.appendChild(c);
      cells.push(c);
    }
    function render() {
      var pr = Number(prior.value) / 100;
      var pw = Number(power.value) / 100;
      by(A1, "priorVal").textContent = Math.round(pr * 100) + "%";
      by(A1, "powerVal").textContent = Math.round(pw * 100) + "%";
      var fp = (1 - pr) * 0.05;
      var tp = pr * pw;
      var fpr = fp / (fp + tp);
      var nFalse = Math.round(fpr * 100);
      by(A1, "fprBig").textContent = nFalse + "%";
      cells.forEach(function (cell, idx) {
        cell.className = "ppv-cell " + (idx < nFalse ? "fp" : "tp");
      });
      by(A1, "fprRead").innerHTML = zh
        ? '在这些设定下，显著发现中有 <span class="hl">' + nFalse + '%</span> 是假警报。Alpha 并不是错误发现率，也不是后验概率。'
        : 'With these settings, <strong>' + nFalse + '%</strong> of significant findings are false alarms. Alpha is not the false-discovery rate.';
    }
    prior.addEventListener("input", render);
    power.addEventListener("input", render);
    render();
  }

  function pFromSlider(v) {
    var hi = Math.log10(0.5);
    var lo = Math.log10(0.0005);
    return Math.pow(10, hi + (lo - hi) * (v / 100));
  }

  function initSValue() {
    var range = by(A1, "pRange");
    if (!range) return;
    function render() {
      var p = pFromSlider(Number(range.value));
      var s = -Math.log2(p);
      by(A1, "pShow").textContent = p >= 0.001 ? p.toFixed(3) : p.toExponential(1);
      by(A1, "sBig").textContent = s.toFixed(1);
      var lo = Math.floor(s);
      var hi = Math.ceil(s);
      by(A1, "coinTxt").textContent = lo === hi ? String(lo) : lo + "-" + hi;
      var n = Math.max(0, Math.min(14, Math.round(s)));
      by(A1, "coinRow").innerHTML = Array.from({ length: n }, function () { return '<span class="coin">' + (zh ? "正" : "H") + '</span>'; }).join("");
      by(A1, "sRead").innerHTML = zh
        ? 'S 值把这个 p 值转换为 <span class="hl">' + s.toFixed(1) + ' 比特</span> 的惊异度，用来描述数据与受检模型的不相容程度。在 p=.05 时，这只相当于大约连续四五次正面。'
        : '<strong>' + s.toFixed(1) + ' bits</strong> of surprise against the tested model. At p=.05, that is only about four or five heads in a row.';
    }
    range.addEventListener("input", render);
    render();
  }

  function initFilters() {
    document.querySelectorAll(".filterbar").forEach(function (bar) {
      var details = bar.closest("details");
      if (!details) return;
      var cards = details.querySelectorAll(".appendix-card[data-tier]");
      bar.querySelectorAll("[data-filter]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var filter = btn.getAttribute("data-filter");
          bar.querySelectorAll("[data-filter]").forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
          cards.forEach(function (card) {
            card.classList.toggle("hide", filter !== "all" && card.getAttribute("data-tier") !== filter);
          });
        });
      });
    });
  }

  function initPeek() {
    onInput(A2, ["peekAlpha", "peekLooks"], function () {
      var alpha = Number(by(A2, "peekAlpha").value) / 100;
      var looks = Number(by(A2, "peekLooks").value);
      by(A2, "peekAlphaVal").textContent = alpha.toFixed(2);
      by(A2, "peekLooksVal").textContent = looks;
      var fixed = 1 - Math.pow(1 - alpha, looks);
      setBar(by(A2, "peekFixedBar"), fixed * 100);
      setBar(by(A2, "peekAnyBar"), alpha * 100);
      by(A2, "peekFixedPct").textContent = fmtPct(fixed);
      by(A2, "peekAnyPct").textContent = fmtPct(alpha);
      by(A2, "peekRead").innerHTML = zh
        ? '查看 <span class="hl">' + looks + '</span> 次、alpha 为 <span class="hl">' + alpha.toFixed(2) + '</span> 时，简单重复查看模型下的假阳性风险约为 <span class="hl">' + fmtPct(fixed) + '</span>。'
        : 'With <b>' + looks + '</b> looks at alpha <b>' + alpha.toFixed(2) + '</b>, the simple repeated-look false-positive risk is about <b>' + fmtPct(fixed) + '</b>.';
    });
  }

  function initConformal() {
    onInput(A2, ["confAlpha", "confSkill", "confShift"], function () {
      var alpha = Number(by(A2, "confAlpha").value) / 100;
      var skill = Number(by(A2, "confSkill").value) / 100;
      var shift = Number(by(A2, "confShift").value) / 100;
      var target = 1 - alpha;
      var stress = Math.max(0.45, target - (shift * 0.22) * (1.05 - skill));
      var size = Math.min(1, 0.18 + (target - 0.7) * 0.9 + (1 - skill) * 0.58 + shift * 0.35);
      by(A2, "confAlphaVal").textContent = alpha.toFixed(2);
      by(A2, "confSkillVal").textContent = skill.toFixed(2);
      by(A2, "confShiftVal").textContent = shift.toFixed(2);
      setBar(by(A2, "confTargetBar"), target * 100);
      setBar(by(A2, "confStressBar"), stress * 100);
      setBar(by(A2, "confSizeBar"), size * 100);
      by(A2, "confTargetPct").textContent = fmtPct(target);
      by(A2, "confStressPct").textContent = fmtPct(stress);
      by(A2, "confSizePct").textContent = fmtPct(size);
      by(A2, "confRead").innerHTML = zh
        ? '目标覆盖率是 <span class="hl">' + fmtPct(target) + '</span>。实际代价是集合大小；真正的风险在于校准数据是否仍与部署环境匹配。'
        : 'Target coverage is <b>' + fmtPct(target) + '</b>. The useful cost is set size; the real risk is whether calibration still matches deployment.';
    });
  }

  function initPpi() {
    onInput(A2, ["ppiN", "ppiU", "ppiR", "ppiBias"], function () {
      var n = Number(by(A2, "ppiN").value);
      var u = Number(by(A2, "ppiU").value);
      var r = Number(by(A2, "ppiR").value) / 100;
      var bias = Number(by(A2, "ppiBias").value) / 100;
      by(A2, "ppiNVal").textContent = fmtNum(n);
      by(A2, "ppiUVal").textContent = fmtNum(u);
      by(A2, "ppiRVal").textContent = r.toFixed(2);
      by(A2, "ppiBiasVal").textContent = bias.toFixed(2);
      var classW = 1 / Math.sqrt(n);
      var reduction = Math.max(0.035, 1 - 0.92 * r * r * (u / (u + n)));
      var ppiW = classW * Math.sqrt(reduction);
      var naiveW = 1 / Math.sqrt(u) * 1.8;
      band(by(A2, "ciClass"), Math.min(94, classW * 360), 50);
      band(by(A2, "ciPpi"), Math.min(94, ppiW * 360), 50);
      band(by(A2, "ciNaive"), Math.min(94, naiveW * 360), 50 + bias * 34);
      by(A2, "ppiRead").innerHTML = zh
        ? '只有当预测确实携带信息时，PPI 才会缩窄仅靠标注数据得到的区间。偏差校正项负责防止低成本预测变成统计上的一厢情愿。'
        : 'PPI shrinks the labeled-only interval only when predictions are informative. The rectifier is what keeps cheap predictions from becoming statistical wishful thinking.';
    });
  }

  function band(el, pct, center) {
    if (!el) return;
    var width = Math.max(0, Math.min(100, pct));
    var x = Math.max(0, Math.min(100 - width, center - width / 2));
    el.setAttribute("x", x.toFixed(2));
    el.setAttribute("width", width.toFixed(2));
  }

  function initPaths() {
    onInput(A2, ["pathPrompt", "pathModel", "pathOutcome", "pathClean"], function () {
      var prompts = Number(by(A2, "pathPrompt").value);
      var models = Number(by(A2, "pathModel").value);
      var outcomes = Number(by(A2, "pathOutcome").value);
      var clean = Number(by(A2, "pathClean").value);
      var k = prompts * models * outcomes * clean;
      var risk = 1 - Math.pow(0.95, k);
      by(A2, "pathPromptVal").textContent = prompts;
      by(A2, "pathModelVal").textContent = models;
      by(A2, "pathOutcomeVal").textContent = outcomes;
      by(A2, "pathCleanVal").textContent = clean;
      by(A2, "pathK").textContent = fmtNum(k);
      setBar(by(A2, "pathRiskBar"), risk * 100);
      by(A2, "pathRiskPct").textContent = fmtApproxPct(risk);
      by(A2, "pathsRead").innerHTML = zh
        ? '这个设定会产生 <span class="hl">' + fmtNum(k) + '</span> 条看似合理的分析路径。在纯噪声且 alpha 为 .05 时，名义显著路径的期望数量是 <span class="hl">' + (k * 0.05).toFixed(1) + '</span>；在独立性近似下，至少出现一次假阳性的概率为 <span class="hl">' + fmtApproxPct(risk) + '</span>。'
        : 'This setup creates <b>' + fmtNum(k) + '</b> plausible analysis paths. With pure noise and alpha .05, the expected number of nominally significant paths is <b>' + (k * 0.05).toFixed(1) + '</b>; under the independence approximation, the chance of at least one false positive is <b>' + fmtApproxPct(risk) + '</b>.';
    });
  }

  function initBenchmark() {
    onInput(A2, ["benchSkill", "benchContam", "benchSub"], function () {
      var skill = Number(by(A2, "benchSkill").value);
      var contam = Number(by(A2, "benchContam").value);
      var sub = Number(by(A2, "benchSub").value);
      var inflation = contam * 0.2 + Math.log(sub) / Math.log(200) * 7;
      var publicScore = Math.min(99, skill + inflation);
      var hidden = Math.max(0, Math.min(99, skill - Math.max(0, contam - 45) * 0.03));
      var gap = Math.max(0, publicScore - hidden);
      by(A2, "benchSkillVal").textContent = skill + "%";
      by(A2, "benchContamVal").textContent = contam + "%";
      by(A2, "benchSubVal").textContent = sub;
      setBar(by(A2, "benchHiddenBar"), hidden);
      setBar(by(A2, "benchPublicBar"), publicScore);
      setBar(by(A2, "benchGapBar"), gap * 2.5);
      by(A2, "benchHiddenPct").textContent = Math.round(hidden) + "%";
      by(A2, "benchPublicPct").textContent = Math.round(publicScore) + "%";
      by(A2, "benchGapPct").textContent = Math.round(gap) + "%";
      by(A2, "benchRead").innerHTML = zh
        ? '公开榜单显示 <span class="hl">' + Math.round(publicScore) + '%</span>，而隐藏测试集仍接近 <span class="hl">' + Math.round(hidden) + '%</span>。请把排行榜名次当作带噪声的估计。'
        : 'The public board reads <b>' + Math.round(publicScore) + '%</b>, while the hidden holdout stays near <b>' + Math.round(hidden) + '%</b>. Treat leaderboard rank like a noisy estimate.';
    });
  }

  initHistogram();
  initFalsePositiveRisk();
  initSValue();
  initFilters();
  initPeek();
  initConformal();
  initPpi();
  initPaths();
  initBenchmark();
})();
