(function(){
  "use strict";

  var isZh = (document.documentElement.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;

  function mean(values){
    return values.reduce(function(sum,value){ return sum + value; }, 0) / values.length;
  }

  function variance(values, avg){
    return values.reduce(function(sum,value){
      var delta = value - avg;
      return sum + delta * delta;
    }, 0) / Math.max(1, values.length - 1);
  }

  function erf(x){
    var sign = x < 0 ? -1 : 1;
    var a1 = 0.254829592;
    var a2 = -0.284496736;
    var a3 = 1.421413741;
    var a4 = -1.453152027;
    var a5 = 1.061405429;
    var p = 0.3275911;
    x = Math.abs(x);
    var t = 1 / (1 + p * x);
    var y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
    return sign * y;
  }

  function normalCdf(x){
    return 0.5 * (1 + erf(x / Math.SQRT2));
  }

  function gammaln(x){
    var c = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
    var y = x;
    var t = x + 5.5;
    t -= (x + 0.5) * Math.log(t);
    var s = 1.000000000190015;
    for (var j = 0; j < 6; j++) {
      y += 1;
      s += c[j] / y;
    }
    return -t + Math.log(2.5066282746310005 * s / x);
  }

  function betacf(a,b,x){
    var maxIterations = 200;
    var eps = 3e-12;
    var tiny = 1e-300;
    var qab = a + b;
    var qap = a + 1;
    var qam = a - 1;
    var c = 1;
    var d = 1 - qab * x / qap;
    if (Math.abs(d) < tiny) d = tiny;
    d = 1 / d;
    var h = d;
    for (var m = 1; m <= maxIterations; m++) {
      var m2 = 2 * m;
      var aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < tiny) d = tiny;
      c = 1 + aa / c;
      if (Math.abs(c) < tiny) c = tiny;
      d = 1 / d;
      h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < tiny) d = tiny;
      c = 1 + aa / c;
      if (Math.abs(c) < tiny) c = tiny;
      d = 1 / d;
      var del = d * c;
      h *= del;
      if (Math.abs(del - 1) < eps) break;
    }
    return h;
  }

  function betai(a,b,x){
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    var bt = Math.exp(gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) return bt * betacf(a, b, x) / a;
    return 1 - bt * betacf(b, a, 1 - x) / b;
  }

  function studentTCdf(t,df){
    var x = df / (df + t * t);
    var ib = betai(df / 2, 0.5, x);
    return t >= 0 ? 1 - 0.5 * ib : 0.5 * ib;
  }

  function tCritical(df, confidence){
    var tail = 0.5 + Math.max(0.5, Math.min(0.999, confidence)) / 2;
    var lo = 0;
    var hi = 10;
    for (var i = 0; i < 50; i++) {
      var mid = (lo + hi) / 2;
      if (studentTCdf(mid, df) < tail) lo = mid;
      else hi = mid;
    }
    return (lo + hi) / 2;
  }

  function tCritical95(df){
    return tCritical(df, 0.95);
  }

  function tTestP(a,b){
    if (a.length < 3 || b.length < 3) return 1;
    var ma = mean(a);
    var mb = mean(b);
    var va = variance(a, ma);
    var vb = variance(b, mb);
    var se = Math.sqrt(va / a.length + vb / b.length);
    if (!Number.isFinite(se) || se <= 0) return 1;
    var z = Math.abs((ma - mb) / se);
    return 2 * (1 - normalCdf(z));
  }

  function randn(){
    var u = 0;
    var v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }

  function initFactory(){
    var root = document.querySelector(".statistics-factory");
    if (!root) return;

    var switches = Array.from(root.querySelectorAll(".swbtn[role='switch']"));
    var pct = root.querySelector("#fp-pct");
    var fill = root.querySelector("#fp-fill");
    var read = root.querySelector("#fp-read");
    var run = root.querySelector("#fp-run");
    var all = root.querySelector("#fp-all");
    var reset = root.querySelector("#fp-reset");
    if (!switches.length || !pct || !fill || !read || !run || !all || !reset) return;

    var byId = {};
    switches.forEach(function(button){ byId[button.id] = button; });
    var NSIM = 1500;
    var NGRP = 30;

    function isOn(button){
      return button.getAttribute("aria-checked") === "true";
    }

    function setOn(button,value){
      button.setAttribute("aria-checked", value ? "true" : "false");
    }

    function extract(group,dv,cov,n){
      var out = [];
      for (var i = 0; i < Math.min(n, group.length); i++) {
        var row = group[i];
        if (cov === "g0" && row.g !== 0) continue;
        if (cov === "g1" && row.g !== 1) continue;
        out.push(row[dv]);
      }
      return out;
    }

    function paint(rate,nTests){
      var p100 = Math.round(rate * 100);
      pct.textContent = p100 + "%";
      pct.classList.toggle("low", p100 <= 8);
      fill.style.width = Math.min(100, rate / 0.65 * 100) + "%";
      if (nTests === 1) {
        read.innerHTML = isZh
          ? '没有开启技巧。每项研究只做 <span class="fp-tests">1 次检验</span>，一个问题给一个答案。大约 5% 会纯靠偶然越过门槛，这也是系统承诺的错误率。'
          : 'No tricks enabled. <span class="fp-tests">1 test</span> per study, one answer. About 5% cross the line by pure chance; this is the rate the system promises.';
        return;
      }
      var label = p100 < 15
        ? (isZh ? "仍接近诚实" : "still close to honest")
        : p100 < 30
          ? (isZh ? "已经膨胀" : "already inflated")
          : p100 < 48
            ? (isZh ? "严重膨胀" : "badly inflated")
            : (isZh ? "真相已经离场" : "the truth has left the building");
      read.innerHTML = isZh
        ? '现在每项研究运行 <span class="fp-tests">' + nTests + ' 次检验</span>，然后保留最小的 <em>p</em> 值。同一批纯噪声中，假阳性率变成 <strong>' + p100 + '%</strong>：' + label + '。这里没有真实效应；每个「发现」都是分叉路径在起作用。'
        : 'You are now running <span class="fp-tests">' + nTests + ' tests</span> per study and keeping the smallest <em>p</em>. From the <strong>same</strong> pure noise, the false-positive rate is <strong>' + p100 + '%</strong>: ' + label + '. Nothing here is a real effect; every "discovery" is the garden of forking paths at work.';
    }

    function runFactory(){
      var twoDV = isOn(byId["fp-dv"]);
      var stop = isOn(byId["fp-stop"]);
      var cov = isOn(byId["fp-cov"]);
      var drop = isOn(byId["fp-drop"]);
      var dvs = twoDV ? ["y1","y2"] : ["y1"];
      var covs = cov ? ["all","g0","g1"] : ["all"];
      var pairs = drop ? [[0,1],[0,2],[1,2]] : [[0,1]];
      var stops = stop ? [20,30] : [20];
      var nTests = dvs.length * covs.length * pairs.length * stops.length;
      var hits = 0;

      for (var s = 0; s < NSIM; s++) {
        var groups = [[],[],[]];
        for (var g = 0; g < 3; g++) {
          for (var i = 0; i < NGRP; i++) {
            var z = randn();
            groups[g].push({
              y1: z,
              y2: 0.5 * z + 0.8660254 * randn(),
              g: Math.random() < 0.5 ? 0 : 1
            });
          }
        }
        var best = 1;
        dvs.forEach(function(dv){
          covs.forEach(function(covariate){
            pairs.forEach(function(pair){
              stops.forEach(function(n){
                var p = tTestP(extract(groups[pair[0]], dv, covariate, n), extract(groups[pair[1]], dv, covariate, n));
                if (p < best) best = p;
              });
            });
          });
        });
        if (best < 0.05) hits++;
      }
      paint(hits / NSIM, nTests);
    }

    switches.forEach(function(button){
      button.addEventListener("click", function(){
        setOn(button, !isOn(button));
        runFactory();
      });
      button.addEventListener("keydown", function(event){
        if (event.key === " " || event.key === "Enter") {
          event.preventDefault();
          setOn(button, !isOn(button));
          runFactory();
        }
      });
    });
    run.addEventListener("click", runFactory);
    all.addEventListener("click", function(){
      switches.forEach(function(button){ setOn(button, true); });
      runFactory();
    });
    reset.addEventListener("click", function(){
      switches.forEach(function(button){ setOn(button, false); });
      runFactory();
    });
    runFactory();
  }

  function makeRng(seed){
    var s = seed >>> 0;
    return function(){
      s = (1664525 * s + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function initEffectLab(){
    var root = document.querySelector(".statistics-effect-lab");
    if (!root) return;

    var controls = {
      effect: root.querySelector("#se-effect"),
      n: root.querySelector("#se-n"),
      noise: root.querySelector("#se-noise")
    };
    var outs = {
      effect: root.querySelector("#se-effect-out"),
      n: root.querySelector("#se-n-out"),
      noise: root.querySelector("#se-noise-out"),
      p: root.querySelector("#se-p"),
      ci: root.querySelector("#se-ci"),
      d: root.querySelector("#se-d"),
      importance: root.querySelector("#se-importance"),
      read: root.querySelector("#se-read")
    };
    var svg = {
      bars: root.querySelector("#se-bars"),
      curve: root.querySelector("#se-sampling-curve"),
      ticks: root.querySelector("#se-ticks"),
      yTicks: root.querySelector("#se-y-ticks"),
      ci: root.querySelector("#se-ci-line"),
      estimate: root.querySelector("#se-est-dot"),
      width: root.querySelector("#se-width-label")
    };
    if (!controls.effect || !controls.n || !controls.noise || !outs.read || !svg.bars || !svg.curve || !svg.ticks || !svg.yTicks || !svg.ci || !svg.estimate || !svg.width) return;

    function pText(p){
      if (p < 0.001) return "< .001";
      if (p < 0.01) return p.toFixed(3).replace(/^0/, "");
      return p.toFixed(2).replace(/^0/, "");
    }

    function num(value){
      return (value >= 0 ? "" : "-") + Math.abs(value).toFixed(2);
    }

    function importance(d){
      var ad = Math.abs(d);
      if (ad < 0.2) return isZh ? "很小" : "trivial";
      if (ad < 0.5) return isZh ? "小" : "small";
      if (ad < 0.8) return isZh ? "中等" : "medium";
      return isZh ? "大" : "large";
    }

    function seededNormal(rng){
      var u = 0;
      var v = 0;
      while (u === 0) u = rng();
      while (v === 0) v = rng();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    function render(){
      var effect = Number(controls.effect.value);
      var n = Number(controls.n.value);
      var noise = Number(controls.noise.value);
      var d = noise > 0 ? effect / noise : 0;
      var se = noise * Math.sqrt(2 / n);
      var df = Math.max(1, 2 * n - 2);
      var t = se > 0 ? Math.abs(effect / se) : 0;
      var p = 2 * (1 - studentTCdf(t, df));
      var margin = tCritical95(df) * se;
      var lo = effect - margin;
      var hi = effect + margin;
      var label = importance(d);

      outs.effect.textContent = effect.toFixed(2);
      outs.n.textContent = String(n);
      outs.noise.textContent = noise.toFixed(2);
      outs.p.textContent = pText(p);
      outs.ci.textContent = "[" + num(lo) + ", " + num(hi) + "]";
      outs.d.textContent = d.toFixed(2);
      outs.importance.textContent = label;

      var xMin = -3;
      var xMax = 3;
      function xScale(x){
        return 58 + (Math.max(xMin, Math.min(xMax, x)) - xMin) / (xMax - xMin) * 312;
      }
      var tickValues = [-3,-2,-1,0,1,2,3];
      svg.ticks.innerHTML = tickValues.map(function(value){
        var x = xScale(value).toFixed(1);
        return '<line x1="' + x + '" y1="212" x2="' + x + '" y2="228" stroke="var(--line)" stroke-width="1"></line><text x="' + x + '" y="240" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" fill="var(--ink-faint)">' + value + '</text>';
      }).join("");

      var binCount = 72;
      var reps = 420;
      var yMax = 300;
      var bins = new Array(binCount).fill(0);
      var rng = makeRng(6206 + Math.round(effect * 1000) + n * 17 + Math.round(noise * 100));
      for (var sample = 0; sample < reps; sample++) {
        var estimate = effect + seededNormal(rng) * se;
        if (estimate < xMin || estimate > xMax) continue;
        var bin = Math.min(binCount - 1, Math.max(0, Math.floor((estimate - xMin) / (xMax - xMin) * binCount)));
        bins[bin]++;
      }
      var yBase = 220;
      var yTop = 40;
      var xWidth = 312;
      var binW = xWidth / binCount;
      svg.yTicks.innerHTML = [0,100,200,300].map(function(value){
        var y = yBase - value / yMax * (yBase - yTop);
        return '<line x1="54" y1="' + y.toFixed(1) + '" x2="370" y2="' + y.toFixed(1) + '" stroke="var(--line)" stroke-width="1" opacity="' + (value ? "0.7" : "1") + '"></line><text x="48" y="' + (y + 3).toFixed(1) + '" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="9" fill="var(--ink-faint)">' + value + '</text>';
      }).join("");
      svg.bars.innerHTML = bins.map(function(count,index){
        var x = 58 + index * binW + 1;
        var h = Math.min(1, count / yMax) * (yBase - yTop);
        return '<rect x="' + x.toFixed(1) + '" y="' + (yBase - h).toFixed(1) + '" width="' + Math.max(1, binW - 2).toFixed(1) + '" height="' + h.toFixed(1) + '" fill="var(--accent)" opacity="0.22"></rect>';
      }).join("");
      var curve = [];
      var curveSigma = Math.max(se, 0.025);
      for (var point = 0; point <= 120; point++) {
        var xValue = xMin + (xMax - xMin) * point / 120;
        var z = (xValue - effect) / curveSigma;
        var expectedCount = reps * binW / xWidth * (xMax - xMin) / (curveSigma * Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);
        var y = yBase - Math.min(1, expectedCount / yMax) * (yBase - yTop);
        curve.push((point ? "L" : "M") + xScale(xValue).toFixed(1) + "," + y.toFixed(1));
      }
      svg.curve.setAttribute("d", curve.join(" "));

      svg.ci.setAttribute("x1", xScale(lo).toFixed(1));
      svg.ci.setAttribute("x2", xScale(hi).toFixed(1));
      svg.estimate.setAttribute("cx", xScale(effect).toFixed(1));

      var sig = p < 0.05;
      var width = hi - lo;
      svg.ci.setAttribute("stroke", sig ? "var(--accent)" : "var(--brass)");
      svg.estimate.setAttribute("fill", sig ? "var(--accent)" : "var(--brass)");
      svg.width.textContent = isZh ? "95% CI 宽度: " + width.toFixed(2) : "95% CI width: " + width.toFixed(2);
      outs.read.innerHTML = isZh
        ? '这个设定给出 <strong>p = ' + pText(p) + '</strong>，Cohen d = <strong>' + d.toFixed(2) + '</strong>（' + label + '）。x 轴是固定的均值差尺度（-3 到 +3）；y 轴也是固定的分桶频数尺度，所以样本量增加会显示为更窄、更高的估计分布。横条是同一 x 轴上的 95% 置信区间，宽度约为 <strong>' + width.toFixed(2) + '</strong>。噪声变大时分布和区间都会变宽。' + (sig ? '它跨过了 .05 门槛；' : '它没有跨过 .05 门槛；') + '但实际意义要看效应量、区间和研究场景，而不是只看 p 值。'
        : 'This setting gives <strong>p = ' + pText(p) + '</strong> and Cohen d = <strong>' + d.toFixed(2) + '</strong> (' + label + '). The x-axis is a fixed mean-difference scale from -3 to +3; the y-axis is also fixed bucket frequency, so larger sample size shows up as a narrower, taller estimate distribution. The bar is the 95% confidence interval on that same x-axis, about <strong>' + width.toFixed(2) + '</strong> units wide. Higher noise widens both the distribution and the interval. It ' + (sig ? 'crosses' : 'does not cross') + ' the .05 line, but practical meaning still depends on effect size, interval, and domain.';
    }

    Object.keys(controls).forEach(function(key){
      controls[key].addEventListener("input", render);
    });
    render();
  }

  function initCiCoverage(){
    var root = document.querySelector(".statistics-ci-coverage");
    if (!root) return;

    var controls = {
      n: root.querySelector("#ci-n"),
      noise: root.querySelector("#ci-noise"),
      level: root.querySelector("#ci-level")
    };
    var outs = {
      n: root.querySelector("#ci-n-out"),
      noise: root.querySelector("#ci-noise-out"),
      level: root.querySelector("#ci-level-out"),
      covered: root.querySelector("#ci-covered"),
      missed: root.querySelector("#ci-missed"),
      observed: root.querySelector("#ci-observed"),
      width: root.querySelector("#ci-width"),
      read: root.querySelector("#ci-read")
    };
    var plot = root.querySelector("#ci-plot");
    var run = root.querySelector("#ci-run");
    if (!controls.n || !controls.noise || !controls.level || !outs.read || !outs.covered || !outs.missed || !outs.observed || !outs.width || !plot || !run) return;

    var runId = 0;
    var TRUE_MEAN = 0;
    var REPS = 100;

    function normalFrom(rng){
      var u = 0;
      var v = 0;
      while (u === 0) u = rng();
      while (v === 0) v = rng();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    function fmt(value){
      return (value >= 0 ? "" : "-") + Math.abs(value).toFixed(2);
    }

    function makeInterval(rng,n,noise,confidence){
      var values = [];
      for (var i = 0; i < n; i++) values.push(TRUE_MEAN + normalFrom(rng) * noise);
      var avg = mean(values);
      var sd = Math.sqrt(variance(values, avg));
      var margin = tCritical(Math.max(1, n - 1), confidence) * sd / Math.sqrt(n);
      return {
        mean: avg,
        lo: avg - margin,
        hi: avg + margin
      };
    }

    function render(){
      var n = Number(controls.n.value);
      var noise = Number(controls.noise.value);
      var confidence = Number(controls.level.value) / 100;
      var rng = makeRng(80606 + runId * 7919 + n * 37 + Math.round(noise * 100) + Math.round(confidence * 1000));
      var intervals = [];
      for (var i = 0; i < REPS; i++) intervals.push(makeInterval(rng, n, noise, confidence));
      var covered = intervals.filter(function(row){ return row.lo <= TRUE_MEAN && row.hi >= TRUE_MEAN; }).length;
      var missed = REPS - covered;
      var avgWidth = mean(intervals.map(function(row){ return row.hi - row.lo; }));
      var xMin = -4;
      var xMax = 4;
      function xScale(x){ return 48 + (Math.max(xMin, Math.min(xMax, x)) - xMin) / (xMax - xMin) * 584; }
      function yScale(index){ return 28 + index * 2.34; }
      var highlight = (runId * 17 + 11) % REPS;

      var svg = '';
      svg += '<rect x="28" y="18" width="624" height="252" rx="8" fill="var(--paper)" stroke="var(--line)"></rect>';
      [-4,-2,0,2,4].forEach(function(value){
        var tickX = xScale(value).toFixed(1);
        svg += '<line x1="' + tickX + '" y1="22" x2="' + tickX + '" y2="274" stroke="var(--line)" stroke-width="1" opacity="' + (value === 0 ? 0 : 0.75) + '"></line>';
        svg += '<text x="' + tickX + '" y="292" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" fill="var(--ink-faint)">' + value + '</text>';
      });
      svg += '<line x1="' + xScale(TRUE_MEAN).toFixed(1) + '" y1="22" x2="' + xScale(TRUE_MEAN).toFixed(1) + '" y2="274" stroke="var(--ink)" stroke-width="2.5"></line>';
      svg += '<text x="' + xScale(TRUE_MEAN).toFixed(1) + '" y="306" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10" fill="var(--ink-soft)">' + (isZh ? "真实均值 0 · 固定 x 轴" : "true mean 0 · fixed x-axis") + '</text>';
      intervals.forEach(function(row,index){
        var covers = row.lo <= TRUE_MEAN && row.hi >= TRUE_MEAN;
        var isHighlight = index === highlight;
        var y = yScale(index);
        var color = covers ? "var(--ok)" : "var(--contested)";
        svg += '<line x1="' + xScale(row.lo).toFixed(1) + '" y1="' + y.toFixed(1) + '" x2="' + xScale(row.hi).toFixed(1) + '" y2="' + y.toFixed(1) + '" stroke="' + color + '" stroke-width="' + (isHighlight ? 4.5 : 1.5) + '" opacity="' + (isHighlight ? 1 : 0.68) + '" stroke-linecap="round"></line>';
        if (isHighlight) {
          svg += '<circle cx="' + xScale(row.mean).toFixed(1) + '" cy="' + y.toFixed(1) + '" r="5" fill="' + color + '" stroke="var(--paper)" stroke-width="2"></circle>';
        }
      });
      svg += '<text x="48" y="16" font-family="IBM Plex Mono,monospace" font-size="10" fill="var(--ink-faint)">' + (isZh ? "100 次重复样本" : "100 repeated samples") + '</text>';
      svg += '<text x="632" y="16" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10" fill="var(--ink-faint)">' + (isZh ? "绿色=覆盖，红色=漏掉" : "green=covers, red=misses") + '</text>';
      plot.innerHTML = svg;

      var observed = intervals[highlight];
      var obsCovers = observed.lo <= TRUE_MEAN && observed.hi >= TRUE_MEAN;
      outs.n.textContent = String(n);
      outs.noise.textContent = noise.toFixed(2);
      outs.level.textContent = Math.round(confidence * 100) + "%";
      outs.covered.textContent = covered + " / " + REPS;
      outs.missed.textContent = missed + " / " + REPS;
      outs.observed.textContent = obsCovers ? (isZh ? "覆盖" : "covers") : (isZh ? "漏掉" : "misses");
      outs.observed.classList.toggle("miss", !obsCovers);
      outs.width.textContent = avgWidth.toFixed(2);
      outs.read.innerHTML = isZh
        ? '这 100 个区间中，<strong>' + covered + '</strong> 个覆盖真实均值 0，<strong>' + missed + '</strong> 个漏掉。高亮区间为 <strong>[' + fmt(observed.lo) + ', ' + fmt(observed.hi) + ']</strong>，它' + (obsCovers ? '覆盖' : '漏掉') + '真值。x 轴保持固定，因此样本量和噪声会真正显示为区间宽度变化，而不是被图形自动缩放抵消。'
        : 'In these 100 intervals, <strong>' + covered + '</strong> cover the true mean 0 and <strong>' + missed + '</strong> miss it. The highlighted interval is <strong>[' + fmt(observed.lo) + ', ' + fmt(observed.hi) + ']</strong>; it ' + (obsCovers ? 'covers' : 'misses') + ' the truth. The x-axis stays fixed, so sample size and noise visibly change interval width instead of rescaling the plot.';
    }

    Object.keys(controls).forEach(function(key){
      controls[key].addEventListener("input", render);
    });
    run.addEventListener("click", function(){
      runId++;
      render();
    });
    render();
  }

  function initSpecCurve(){
    var root = document.querySelector(".statistics-spec-curve");
    if (!root) return;

    var buttons = {
      trim: root.querySelector("#mv-trim"),
      cov: root.querySelector("#mv-cov"),
      rank: root.querySelector("#mv-rank"),
      sub: root.querySelector("#mv-sub"),
      cherry: root.querySelector("#mv-cherry")
    };
    var canvas = root.querySelector("#mv-canvas");
    var read = root.querySelector("#mv-read");
    var box = root.querySelector("#mv-cherrybox");
    var heading = root.querySelector("#mv-clh");
    var body = root.querySelector("#mv-cbody");
    if (!buttons.trim || !buttons.cov || !buttons.rank || !buttons.sub || !buttons.cherry || !canvas || !read || !box || !heading || !body) return;

    var rng = makeRng(71952);
    function seededNormal(){
      var u = 0;
      var v = 0;
      while (u === 0) u = rng();
      while (v === 0) v = rng();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    var data = [];
    for (var i = 0; i < 100; i++) {
      var w = seededNormal();
      var grp = i % 5 === 0 ? 1 : 0;
      var x = 0.53 * w + seededNormal();
      var y = 0.44 * w + 0.004 * x + seededNormal() * 1.19 + (grp ? 0.69 : 0);
      data.push({ x: x, y: y, w: w, grp: grp });
    }
    data[3].y += 5.5;
    data[7].x += 5.5;
    data[12].y -= 5;
    data[20].x -= 5;

    function pressed(button){
      return button.getAttribute("aria-pressed") === "true";
    }

    function pearson(xs,ys){
      var mx = mean(xs);
      var my = mean(ys);
      var sxy = 0;
      var sx = 0;
      var sy = 0;
      xs.forEach(function(x,i){
        var dx = x - mx;
        var dy = ys[i] - my;
        sxy += dx * dy;
        sx += dx * dx;
        sy += dy * dy;
      });
      if (sx <= 0 || sy <= 0) return { r: 0, p: 1 };
      var r = sxy / Math.sqrt(sx * sy);
      var z = Math.abs(r) * Math.sqrt(Math.max(1, xs.length - 3));
      return { r: r, p: 2 * (1 - normalCdf(z)) };
    }

    function ranks(values){
      return values.map(function(value,index){ return { value: value, index: index }; })
        .sort(function(a,b){ return a.value - b.value; })
        .reduce(function(out,row,index){
          out[row.index] = index + 1;
          return out;
        }, new Array(values.length));
    }

    function residualize(target,predictor){
      var mp = mean(predictor);
      var mt = mean(target);
      var sp = 0;
      var cov = 0;
      target.forEach(function(value,i){
        sp += Math.pow(predictor[i] - mp, 2);
        cov += (predictor[i] - mp) * (value - mt);
      });
      var slope = sp ? cov / sp : 0;
      var intercept = mt - slope * mp;
      return target.map(function(value,i){ return value - (intercept + slope * predictor[i]); });
    }

    function buildSpec(trim,cov,rank,sub){
      var rows = sub ? data.filter(function(row){ return row.grp === 0; }) : data.slice();
      var xs = rows.map(function(row){ return row.x; });
      var ys = rows.map(function(row){ return row.y; });
      var ws = rows.map(function(row){ return row.w; });
      if (trim) {
        var mx = mean(xs);
        var sx = Math.sqrt(variance(xs, mx));
        var my = mean(ys);
        var sy = Math.sqrt(variance(ys, my));
        var keep = xs.map(function(value,index){ return { x: value, y: ys[index], index: index }; }).filter(function(row){
          return Math.abs((row.x - mx) / sx) <= 2.3 && Math.abs((row.y - my) / sy) <= 2.3;
        }).map(function(row){ return row.index; });
        xs = keep.map(function(index){ return xs[index]; });
        ys = keep.map(function(index){ return ys[index]; });
        ws = keep.map(function(index){ return ws[index]; });
      }
      if (cov) {
        xs = residualize(xs, ws);
        ys = residualize(ys, ws);
      }
      if (rank) {
        xs = ranks(xs);
        ys = ranks(ys);
      }
      var result = pearson(xs, ys);
      return { r: result.r, p: result.p, choices: { trim: trim, cov: cov, rank: rank, sub: sub } };
    }

    function median(values){
      var sorted = values.slice().sort(function(a,b){ return a - b; });
      var mid = Math.floor(sorted.length / 2);
      return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    }

    function specs(){
      var trims = pressed(buttons.trim) ? [false,true] : [false];
      var covs = pressed(buttons.cov) ? [false,true] : [false];
      var ranksOpt = pressed(buttons.rank) ? [false,true] : [false];
      var subs = pressed(buttons.sub) ? [false,true] : [false];
      var out = [];
      trims.forEach(function(trim){
        covs.forEach(function(cov){
          ranksOpt.forEach(function(rank){
            subs.forEach(function(sub){
              out.push(buildSpec(trim, cov, rank, sub));
            });
          });
        });
      });
      return out.sort(function(a,b){ return a.r - b.r; });
    }

    function render(){
      var rows = specs();
      var n = rows.length;
      var sig = rows.filter(function(row){ return row.p < 0.05; }).length;
      var med = median(rows.map(function(row){ return row.r; }));
      var cherry = pressed(buttons.cherry);
      var best = rows.filter(function(row){ return row.p < 0.05; }).sort(function(a,b){ return Math.abs(b.r) - Math.abs(a.r); })[0];
      var covRows = rows.filter(function(row){ return row.choices.cov; });
      var covSig = covRows.filter(function(row){ return row.p < 0.05; }).length;
      var x0 = 108;
      var x1 = 426;
      var top = 14;
      var plotH = 142;
      var rmax = Math.max(0.25, rows.reduce(function(max,row){ return Math.max(max, Math.abs(row.r)); }, 0));
      function px(index){ return n === 1 ? (x0 + x1) / 2 : x0 + (x1 - x0) * index / (n - 1); }
      function py(r){ return top + plotH / 2 - (r / rmax) * (plotH / 2 - 6); }
      var svg = '<line x1="' + x0 + '" y1="' + py(0).toFixed(1) + '" x2="' + x1 + '" y2="' + py(0).toFixed(1) + '" stroke="var(--line-strong)" stroke-width="1" stroke-dasharray="3 4"></line>';
      svg += '<text x="' + (x0 - 6) + '" y="' + (py(0) + 3).toFixed(1) + '" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="11" fill="var(--ink-faint)">0</text>';
      svg += '<text x="8" y="82" font-family="IBM Plex Mono,monospace" font-size="11" fill="var(--ink-faint)" transform="rotate(-90 14 82)">' + (isZh ? "效应 (r)" : "effect (r)") + '</text>';
      rows.forEach(function(row,index){
        var isBest = cherry && best === row;
        var dim = cherry && !isBest;
        svg += '<circle cx="' + px(index).toFixed(1) + '" cy="' + py(row.r).toFixed(1) + '" r="' + (isBest ? 6 : 4) + '" fill="' + (row.p < 0.05 ? "var(--accent)" : "var(--ink-faint)") + '" opacity="' + (dim ? 0.18 : row.p < 0.05 ? 0.95 : 0.55) + '"' + (isBest ? ' stroke="var(--contested)" stroke-width="2.5"' : "") + '></circle>';
      });
      [
        ["trim", isZh ? "修剪离群值" : "trim outliers", buttons.trim],
        ["cov", isZh ? "控制 W" : "control W", buttons.cov],
        ["rank", isZh ? "秩转换" : "rank-transform", buttons.rank],
        ["sub", isZh ? "剔除子组" : "drop subgroup", buttons.sub]
      ].filter(function(row){ return pressed(row[2]); }).forEach(function(choice,rowIndex){
        var y = 178 + rowIndex * 13;
        svg += '<text x="' + (x0 - 6) + '" y="' + (y + 5) + '" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="10" fill="var(--ink-faint)">' + choice[1] + '</text>';
        rows.forEach(function(row,index){
          if (row.choices[choice[0]]) {
            svg += '<text x="' + px(index).toFixed(1) + '" y="' + (y + 4) + '" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="12" font-weight="700" fill="var(--accent)" opacity="' + (cherry && best !== row ? 0.18 : 0.9) + '">✓</text>';
          }
        });
      });
      canvas.innerHTML = svg;
      read.innerHTML = (isZh
        ? '<span><b>' + n + '</b> 个规范</span><span><b>' + sig + '</b> 个显著 (' + Math.round(sig / n * 100) + '%)</span><span>中位 r = <b>' + med.toFixed(3) + '</b></span>'
        : '<span><b>' + n + '</b> specifications</span><span><b>' + sig + '</b> significant (' + Math.round(sig / n * 100) + '%)</span><span>median r = <b>' + med.toFixed(3) + '</b></span>') +
        (pressed(buttons.cov)
          ? (isZh ? '<span>控制 W 的规范：<b>' + covSig + '/' + covRows.length + '</b> 显著</span>' : '<span>W-controlled specs: <b>' + covSig + '/' + covRows.length + '</b> significant</span>')
          : '');
      box.className = "mv-cherry " + (cherry ? "cherry" : "honest");
      if (cherry) {
        heading.textContent = isZh ? "被动机驱使的作者会这样报告" : "What a motivated author reports";
        body.innerHTML = n === 1
          ? (isZh ? '现在只有一个基线规范，还没有可供挑选的多元宇宙。先开启一个或多个分析选择，再看「挑选结果」如何改变故事。' : 'With only the baseline specification, there is no multiverse to cherry-pick yet. Turn on one or more analytic choices, then watch how cherry-picking changes the story.')
          : best
          ? (isZh
            ? '「我们发现 X 与 Y 存在显著关联，r = ' + best.r.toFixed(2) + '，p = ' + best.p.toFixed(3) + '。」这是真的，但只对 ' + n + ' 个同样可辩护规范中的一个成立。其他 ' + (n - 1) + ' 个规范不会出现在论文里。' + (pressed(buttons.cov) && !best.choices.cov ? ' 注意：这个被挑中的路径没有控制 W。' : '')
            : '"We find a significant association between X and Y, r = ' + best.r.toFixed(2) + ', p = ' + best.p.toFixed(3) + '." True, for one of ' + n + ' equally defensible specifications. The other ' + (n - 1) + ' never make the paper.' + (pressed(buttons.cov) && !best.choices.cov ? ' Notice that the selected path does not control for W.' : ''))
          : (isZh ? '即使挑选最漂亮的点也救不了：没有任何单一规范达到 p < .05。' : 'Not even cherry-picking saves it: no single specification reaches p < .05.');
      } else {
        heading.textContent = isZh ? "诚实读法" : "The honest reading";
        body.innerHTML = n === 1
          ? (isZh ? '只有基线规范：r = ' + rows[0].r.toFixed(3) + '，p = ' + rows[0].p.toFixed(3) + '。打开上方选择，看看多元宇宙如何展开。' : 'With no analytic choices enabled there is just the baseline specification: r = ' + rows[0].r.toFixed(3) + ', p = ' + rows[0].p.toFixed(3) + '. Switch on some choices above to grow the multiverse.')
          : (isZh ? '在全部 <strong>' + n + '</strong> 个可辩护规范中，中位 r = <strong>' + med.toFixed(3) + '</strong>，' + sig + ' / ' + n + ' 跨过 p < .05。' + (pressed(buttons.cov) ? '控制 W 的规范中有 ' + covSig + ' / ' + covRows.length + ' 个显著。' : '') + '诚实摘要是整条曲线，不是最漂亮的点。' : 'Across all <strong>' + n + '</strong> defensible specifications, median r = <strong>' + med.toFixed(3) + '</strong>, with ' + sig + ' of ' + n + ' crossing p < .05. ' + (pressed(buttons.cov) ? covSig + ' of ' + covRows.length + ' W-controlled specifications cross p < .05. ' : '') + 'The honest summary is the whole curve, not its prettiest point.');
      }
    }

    Object.keys(buttons).forEach(function(key){
      buttons[key].addEventListener("click", function(){
        buttons[key].setAttribute("aria-pressed", pressed(buttons[key]) ? "false" : "true");
        render();
      });
    });
    render();
  }

  initFactory();
  initEffectLab();
  initCiCoverage();
  initSpecCurve();
})();
