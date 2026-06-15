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
      dots: root.querySelector("#se-dots"),
      nullCurve: root.querySelector("#se-null-curve"),
      effectCurve: root.querySelector("#se-effect-curve"),
      ci: root.querySelector("#se-ci-line"),
      estimate: root.querySelector("#se-est-dot")
    };
    if (!controls.effect || !controls.n || !controls.noise || !outs.read || !svg.dots || !svg.nullCurve || !svg.effectCurve || !svg.ci || !svg.estimate) return;

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

    function curvePath(mu, sigma, xMin, xMax, xScale, yBase, yAmp){
      var points = [];
      for (var i = 0; i <= 90; i++) {
        var x = xMin + (xMax - xMin) * i / 90;
        var z = (x - mu) / sigma;
        var y = Math.exp(-0.5 * z * z);
        points.push((i ? "L" : "M") + xScale(x).toFixed(1) + "," + (yBase - y * yAmp).toFixed(1));
      }
      return points.join(" ");
    }

    function renderDots(effect, noise, xScale){
      var bins = [0,0,0,0,0,0,0,0,0];
      var rng = makeRng(6206);
      var out = "";
      for (var i = 0; i < 70; i++) {
        var group = i % 2;
        var value = (group ? effect : 0) + (rng() - 0.5) * noise * 2.2 + (rng() - 0.5) * noise;
        var bin = Math.max(0, Math.min(bins.length - 1, Math.floor((value + 2.2) / 4.4 * bins.length)));
        var cx = xScale(value);
        var cy = 168 - bins[bin] * 7;
        bins[bin]++;
        out += '<circle cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="3.2" fill="' + (group ? "var(--accent)" : "var(--ink-faint)") + '" opacity="' + (group ? "0.58" : "0.42") + '"></circle>';
      }
      svg.dots.innerHTML = out;
    }

    function render(){
      var effect = Number(controls.effect.value);
      var n = Number(controls.n.value);
      var noise = Number(controls.noise.value);
      var d = noise > 0 ? effect / noise : 0;
      var se = noise * Math.sqrt(2 / n);
      var z = se > 0 ? Math.abs(effect / se) : 0;
      var p = 2 * (1 - normalCdf(z));
      var lo = effect - 1.96 * se;
      var hi = effect + 1.96 * se;
      var label = importance(d);

      outs.effect.textContent = effect.toFixed(2);
      outs.n.textContent = String(n);
      outs.noise.textContent = noise.toFixed(2);
      outs.p.textContent = pText(p);
      outs.ci.textContent = "[" + num(lo) + ", " + num(hi) + "]";
      outs.d.textContent = d.toFixed(2);
      outs.importance.textContent = label;

      var xMin = -2.2;
      var xMax = 2.2;
      function xScale(x){
        return 34 + (Math.max(xMin, Math.min(xMax, x)) - xMin) / (xMax - xMin) * 352;
      }
      var curveSigma = Math.max(0.35, noise);
      svg.nullCurve.setAttribute("d", curvePath(0, curveSigma, xMin, xMax, xScale, 174, 72));
      svg.effectCurve.setAttribute("d", curvePath(effect, curveSigma, xMin, xMax, xScale, 174, 72));
      svg.ci.setAttribute("x1", xScale(lo).toFixed(1));
      svg.ci.setAttribute("x2", xScale(hi).toFixed(1));
      svg.estimate.setAttribute("cx", xScale(effect).toFixed(1));
      renderDots(effect, noise, xScale);

      var sig = p < 0.05;
      outs.read.innerHTML = isZh
        ? '这个设定给出 <strong>p = ' + pText(p) + '</strong>，Cohen d = <strong>' + d.toFixed(2) + '</strong>（' + label + '）。' + (sig ? '它跨过了 .05 门槛；' : '它没有跨过 .05 门槛；') + '但实际意义要看效应量、区间和研究场景，而不是只看 p 值。'
        : 'This setting gives <strong>p = ' + pText(p) + '</strong> and Cohen d = <strong>' + d.toFixed(2) + '</strong> (' + label + '). It ' + (sig ? 'crosses' : 'does not cross') + ' the .05 line; practical meaning still depends on the effect size, interval, and domain, not the p-value alone.';
    }

    Object.keys(controls).forEach(function(key){
      controls[key].addEventListener("input", render);
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

    var rng = makeRng(12345);
    function seededNormal(){
      var u = 0;
      var v = 0;
      while (u === 0) u = rng();
      while (v === 0) v = rng();
      return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    }

    var data = [];
    for (var i = 0; i < 130; i++) {
      var w = seededNormal();
      var x = 0.55 * w + seededNormal();
      var y = 0.55 * w + 0.05 * x + seededNormal();
      data.push({ x: x, y: y, w: w, grp: i % 5 === 0 ? 1 : 0 });
    }
    data[3].y += 6;
    data[7].x += 5.5;
    data[12].y -= 5.5;
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
        var my = mean(ys);
        var sd = Math.sqrt(variance(ys, my));
        var keep = ys.map(function(value,index){ return { value: value, index: index }; }).filter(function(row){
          return Math.abs((row.value - my) / sd) <= 2.5;
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
      var x0 = 46;
      var x1 = 626;
      var top = 14;
      var plotH = 142;
      var rmax = Math.max(0.25, rows.reduce(function(max,row){ return Math.max(max, Math.abs(row.r)); }, 0));
      function px(index){ return n === 1 ? (x0 + x1) / 2 : x0 + (x1 - x0) * index / (n - 1); }
      function py(r){ return top + plotH / 2 - (r / rmax) * (plotH / 2 - 6); }
      var svg = '<line x1="' + x0 + '" y1="' + py(0).toFixed(1) + '" x2="' + x1 + '" y2="' + py(0).toFixed(1) + '" stroke="var(--line-strong)" stroke-width="1" stroke-dasharray="3 4"></line>';
      svg += '<text x="' + (x0 - 6) + '" y="' + (py(0) + 3).toFixed(1) + '" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="9" fill="var(--ink-faint)">0</text>';
      svg += '<text x="6" y="82" font-family="IBM Plex Mono,monospace" font-size="9" fill="var(--ink-faint)" transform="rotate(-90 12 82)">' + (isZh ? "效应 (r)" : "effect (r)") + '</text>';
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
        svg += '<text x="' + (x0 - 6) + '" y="' + (y + 5) + '" text-anchor="end" font-family="IBM Plex Mono,monospace" font-size="8" fill="var(--ink-faint)">' + choice[1] + '</text>';
        rows.forEach(function(row,index){
          svg += '<circle cx="' + px(index).toFixed(1) + '" cy="' + y + '" r="2.4" fill="' + (row.choices[choice[0]] ? "var(--accent)" : "var(--line-strong)") + '" opacity="' + (cherry && best !== row ? 0.18 : 0.8) + '"></circle>';
        });
      });
      canvas.innerHTML = svg;
      read.innerHTML = isZh
        ? '<span><b>' + n + '</b> 个规范</span><span><b>' + sig + '</b> 个显著 (' + Math.round(sig / n * 100) + '%)</span><span>中位 r = <b>' + med.toFixed(3) + '</b></span>'
        : '<span><b>' + n + '</b> specifications</span><span><b>' + sig + '</b> significant (' + Math.round(sig / n * 100) + '%)</span><span>median r = <b>' + med.toFixed(3) + '</b></span>';
      box.className = "mv-cherry " + (cherry ? "cherry" : "honest");
      if (cherry) {
        heading.textContent = isZh ? "被动机驱使的作者会这样报告" : "What a motivated author reports";
        body.innerHTML = best
          ? (isZh
            ? '「我们发现 X 与 Y 存在显著关联，r = ' + best.r.toFixed(2) + '，p = ' + best.p.toFixed(3) + '。」这是真的，但只对 ' + n + ' 个同样可辩护规范中的一个成立。其他 ' + (n - 1) + ' 个规范不会出现在论文里。'
            : '"We find a significant association between X and Y, r = ' + best.r.toFixed(2) + ', p = ' + best.p.toFixed(3) + '." True, for one of ' + n + ' equally defensible specifications. The other ' + (n - 1) + ' never make the paper.')
          : (isZh ? '即使挑选最漂亮的点也救不了：没有任何单一规范达到 p < .05。' : 'Not even cherry-picking saves it: no single specification reaches p < .05.');
      } else {
        heading.textContent = isZh ? "诚实读法" : "The honest reading";
        body.innerHTML = n === 1
          ? (isZh ? '只有基线规范：r = ' + rows[0].r.toFixed(3) + '，p = ' + rows[0].p.toFixed(3) + '。打开上方选择，看看多元宇宙如何展开。' : 'With no analytic choices enabled there is just the baseline specification: r = ' + rows[0].r.toFixed(3) + ', p = ' + rows[0].p.toFixed(3) + '. Switch on some choices above to grow the multiverse.')
          : (isZh ? '在全部 <strong>' + n + '</strong> 个可辩护规范中，中位 r = <strong>' + med.toFixed(3) + '</strong>，' + sig + ' / ' + n + ' 跨过 p < .05。诚实摘要是整条曲线，不是最漂亮的点。' : 'Across all <strong>' + n + '</strong> defensible specifications, median r = <strong>' + med.toFixed(3) + '</strong>, with ' + sig + ' of ' + n + ' crossing p < .05. The honest summary is the whole curve, not its prettiest point.');
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
  initSpecCurve();
})();
