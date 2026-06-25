(function(){
  "use strict";

  var isZh = (document.documentElement.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function text(en, zh){ return isZh ? zh : en; }
  function cssVar(name){ return getComputedStyle(document.body).getPropertyValue(name).trim(); }

  (function initBoids(){
    var canvas = document.getElementById("boids");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var width = canvas.width;
    var height = canvas.height;
    var count = 180;
    var neighborCount = 7;
    var rules = { sep: true, ali: true, coh: true };
    var orderEl = document.getElementById("b-order");
    var countEl = document.getElementById("b-count");
    if (!orderEl || !countEl) return;
    countEl.textContent = String(count);

    function rand(a, b){ return a + Math.random() * (b - a); }

    var boids = [];
    function spawn(){
      boids = [];
      for (var i = 0; i < count; i++) {
        var angle = rand(0, Math.PI * 2);
        boids.push({ x: rand(0, width), y: rand(0, height), vx: Math.cos(angle) * 2, vy: Math.sin(angle) * 2 });
      }
    }
    spawn();

    var maxVelocity = 3.4;
    var minVelocity = 1.6;
    var separationRadius = 24;

    function step(){
      for (var i = 0; i < count; i++) {
        var boid = boids[i];
        var distances = [];
        for (var j = 0; j < count; j++) {
          if (j === i) continue;
          var dx = boids[j].x - boid.x;
          var dy = boids[j].y - boid.y;
          if (dx > width / 2) dx -= width;
          else if (dx < -width / 2) dx += width;
          if (dy > height / 2) dy -= height;
          else if (dy < -height / 2) dy += height;
          distances.push({ j: j, d2: dx * dx + dy * dy, dx: dx, dy: dy });
        }
        distances.sort(function(a, b){ return a.d2 - b.d2; });

        var k = Math.min(neighborCount, distances.length);
        var ax = 0;
        var ay = 0;
        var avgvx = 0;
        var avgvy = 0;
        var cx = 0;
        var cy = 0;
        var sepx = 0;
        var sepy = 0;
        var used = 0;

        for (var n = 0; n < k; n++) {
          var neighbor = distances[n];
          var other = boids[neighbor.j];
          avgvx += other.vx;
          avgvy += other.vy;
          cx += neighbor.dx;
          cy += neighbor.dy;
          used++;
          if (neighbor.d2 < separationRadius * separationRadius) {
            var d = Math.sqrt(neighbor.d2) || 0.001;
            sepx -= neighbor.dx / d;
            sepy -= neighbor.dy / d;
          }
        }

        if (used > 0) {
          if (rules.ali) {
            avgvx /= used;
            avgvy /= used;
            ax += (avgvx - boid.vx) * 0.05;
            ay += (avgvy - boid.vy) * 0.05;
          }
          if (rules.coh) {
            cx /= used;
            cy /= used;
            ax += cx * 0.0009;
            ay += cy * 0.0009;
          }
        }
        if (rules.sep) {
          ax += sepx * 0.09;
          ay += sepy * 0.09;
        }
        if (!rules.ali && !rules.coh) {
          ax += rand(-0.06, 0.06);
          ay += rand(-0.06, 0.06);
        }

        boid.vx += ax;
        boid.vy += ay;
        var speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy);
        if (speed > maxVelocity) {
          boid.vx = boid.vx / speed * maxVelocity;
          boid.vy = boid.vy / speed * maxVelocity;
        } else if (speed < minVelocity && speed > 0.001) {
          boid.vx = boid.vx / speed * minVelocity;
          boid.vy = boid.vy / speed * minVelocity;
        }
      }

      for (var k = 0; k < count; k++) {
        var point = boids[k];
        point.x += point.vx;
        point.y += point.vy;
        if (point.x < 0) point.x += width;
        else if (point.x >= width) point.x -= width;
        if (point.y < 0) point.y += height;
        else if (point.y >= height) point.y -= height;
      }
    }

    function orderParameter(){
      var sx = 0;
      var sy = 0;
      for (var i = 0; i < count; i++) {
        var speed = Math.sqrt(boids[i].vx * boids[i].vx + boids[i].vy * boids[i].vy) || 0.001;
        sx += boids[i].vx / speed;
        sy += boids[i].vy / speed;
      }
      return Math.sqrt(sx * sx + sy * sy) / count;
    }

    function draw(){
      ctx.clearRect(0, 0, width, height);
      var accent = cssVar("--accent");
      var soft = cssVar("--ink-soft");
      var order = orderParameter();
      orderEl.textContent = order.toFixed(2);

      for (var i = 0; i < count; i++) {
        var boid = boids[i];
        var speed = Math.sqrt(boid.vx * boid.vx + boid.vy * boid.vy) || 0.001;
        var ux = boid.vx / speed;
        var uy = boid.vy / speed;
        var size = 4.6;
        ctx.beginPath();
        ctx.moveTo(boid.x + ux * size * 1.7, boid.y + uy * size * 1.7);
        ctx.lineTo(boid.x - uy * size * 0.8 - ux * size, boid.y + ux * size * 0.8 - uy * size);
        ctx.lineTo(boid.x + uy * size * 0.8 - ux * size, boid.y - ux * size * 0.8 - uy * size);
        ctx.closePath();
        ctx.fillStyle = order > 0.55 ? accent : soft;
        ctx.globalAlpha = 0.55 + order * 0.45;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    var running = true;
    function loop(){
      if (running) step();
      draw();
      requestAnimationFrame(loop);
    }
    if (reduceMotion) {
      for (var warmup = 0; warmup < 200; warmup++) step();
      running = false;
      draw();
    } else {
      loop();
    }

    function setRule(id, key, on){
      var element = document.getElementById(id);
      if (!element) return;
      rules[key] = on;
      element.setAttribute("aria-pressed", on ? "true" : "false");
    }
    function burst(){
      if (!reduceMotion) return;
      for (var i = 0; i < 120; i++) step();
      draw();
    }

    var sep = document.getElementById("r-sep");
    var ali = document.getElementById("r-ali");
    var coh = document.getElementById("r-coh");
    var scatter = document.getElementById("b-scatter");
    var allOn = document.getElementById("b-allon");
    var allOff = document.getElementById("b-alloff");
    var slider = document.getElementById("kn");
    var label = document.getElementById("kval");

    if (sep) sep.addEventListener("click", function(){ setRule("r-sep", "sep", !rules.sep); burst(); });
    if (ali) ali.addEventListener("click", function(){ setRule("r-ali", "ali", !rules.ali); burst(); });
    if (coh) coh.addEventListener("click", function(){ setRule("r-coh", "coh", !rules.coh); burst(); });
    if (scatter) scatter.addEventListener("click", function(){ spawn(); draw(); });
    if (allOn) allOn.addEventListener("click", function(){
      setRule("r-sep", "sep", true);
      setRule("r-ali", "ali", true);
      setRule("r-coh", "coh", true);
      if (reduceMotion) {
        for (var i = 0; i < 200; i++) step();
        draw();
      }
    });
    if (allOff) allOff.addEventListener("click", function(){
      setRule("r-sep", "sep", false);
      setRule("r-ali", "ali", false);
      setRule("r-coh", "coh", false);
      spawn();
      draw();
    });
    if (slider && label) slider.addEventListener("input", function(){
      neighborCount = Number(slider.value);
      label.textContent = String(neighborCount);
    });
  })();

  (function initGameOfLife(){
    var canvas = document.getElementById("gol");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var cell = 5;
    var cols = Math.floor(canvas.width / cell);
    var rows = Math.floor(canvas.height / cell);
    var grid = make();
    var next = make();
    var generation = 0;
    var playing = true;
    var tick = 0;
    var generationEl = document.getElementById("gol-gen");
    var playButton = document.getElementById("gol-play");
    if (!generationEl || !playButton) return;

    function make(){ return new Array(cols * rows).fill(0); }
    function idx(x, y){ return y * cols + x; }
    function clearGrid(){
      for (var i = 0; i < grid.length; i++) grid[i] = 0;
      generation = 0;
    }
    function gun(){
      clearGrid();
      var points = [[1,5],[1,6],[2,5],[2,6],[11,5],[11,6],[11,7],[12,4],[12,8],[13,3],[13,9],[14,3],[14,9],[15,6],[16,4],[16,8],[17,5],[17,6],[17,7],[18,6],[21,3],[21,4],[21,5],[22,3],[22,4],[22,5],[23,2],[23,6],[25,1],[25,2],[25,6],[25,7],[35,3],[35,4],[36,3],[36,4]];
      var ox = 2;
      var oy = 3;
      points.forEach(function(point){
        var x = point[0] + ox;
        var y = point[1] + oy;
        if (x >= 0 && x < cols && y >= 0 && y < rows) grid[idx(x, y)] = 1;
      });
      generation = 0;
    }
    function randomSoup(){
      for (var i = 0; i < grid.length; i++) grid[i] = Math.random() < 0.32 ? 1 : 0;
      generation = 0;
    }
    function stepLife(){
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var neighbors = 0;
          for (var dy = -1; dy <= 1; dy++) {
            for (var dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              var nx = x + dx;
              var ny = y + dy;
              if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[idx(nx, ny)]) neighbors++;
            }
          }
          var alive = grid[idx(x, y)];
          next[idx(x, y)] = (alive && (neighbors === 2 || neighbors === 3)) || (!alive && neighbors === 3) ? 1 : 0;
        }
      }
      var tmp = grid;
      grid = next;
      next = tmp;
      generation++;
    }
    function draw(){
      ctx.fillStyle = cssVar("--paper");
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = cssVar("--accent");
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          if (grid[idx(x, y)]) ctx.fillRect(x * cell + 0.5, y * cell + 0.5, cell - 1, cell - 1);
        }
      }
      generationEl.textContent = String(generation);
    }

    gun();
    draw();

    function loop(){
      if (playing) {
        tick++;
        if (tick % 5 === 0) {
          stepLife();
          draw();
        }
      }
      requestAnimationFrame(loop);
    }
    if (!reduceMotion) loop();
    else playing = false;

    function setPlay(on){
      playing = on;
      playButton.textContent = on ? text("Pause", "暂停") : text("Play", "播放");
    }
    playButton.addEventListener("click", function(){
      setPlay(!playing);
      if (playing && reduceMotion) {
        var id = setInterval(function(){
          if (!playing) {
            clearInterval(id);
            return;
          }
          stepLife();
          draw();
        }, 90);
      }
    });

    var gunButton = document.getElementById("gol-gun");
    var randomButton = document.getElementById("gol-rand");
    var clearButton = document.getElementById("gol-clear");
    if (gunButton) gunButton.addEventListener("click", function(){ gun(); draw(); });
    if (randomButton) randomButton.addEventListener("click", function(){ randomSoup(); draw(); });
    if (clearButton) clearButton.addEventListener("click", function(){ clearGrid(); draw(); });

    function toggleAt(clientX, clientY){
      var rect = canvas.getBoundingClientRect();
      var sx = canvas.width / rect.width;
      var sy = canvas.height / rect.height;
      var x = Math.floor((clientX - rect.left) * sx / cell);
      var y = Math.floor((clientY - rect.top) * sy / cell);
      if (x >= 0 && x < cols && y >= 0 && y < rows) {
        grid[idx(x, y)] ^= 1;
        draw();
      }
    }
    canvas.addEventListener("click", function(event){ toggleAt(event.clientX, event.clientY); });
  })();

  (function initPercolation(){
    var canvas = document.getElementById("perc");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var slider = document.getElementById("perc-p");
    var pValue = document.getElementById("perc-pval");
    var verdict = document.getElementById("perc-verdict");
    var filledEl = document.getElementById("perc-filled");
    var largestEl = document.getElementById("perc-largest");
    if (!ctx || !slider || !pValue || !verdict || !filledEl || !largestEl) return;

    var n = 34;
    var cell = canvas.width / n;
    var p = Number(slider.value) / 100;
    var grid = [];
    var cluster = [];
    var filledCount = 0;
    var largestCluster = 0;
    var spans = false;

    function idx(x, y){ return y * n + x; }
    function setProbability(value){
      p = Math.max(0, Math.min(1, value));
      slider.value = String(Math.round(p * 100));
      pValue.textContent = p.toFixed(2);
    }
    function sample(){
      grid = new Array(n * n);
      cluster = new Array(n * n).fill(0);
      filledCount = 0;
      largestCluster = 0;
      spans = false;
      for (var i = 0; i < grid.length; i++) {
        grid[i] = Math.random() < p ? 1 : 0;
        if (grid[i]) filledCount++;
      }
      analyze();
      draw();
    }
    function analyze(){
      var seen = new Array(n * n).fill(0);
      var queue = [];
      var best = [];
      var spanCluster = [];
      var dirs = [[1,0],[-1,0],[0,1],[0,-1]];
      for (var y = 0; y < n; y++) {
        for (var x = 0; x < n; x++) {
          var start = idx(x, y);
          if (!grid[start] || seen[start]) continue;
          var touchesTop = false;
          var touchesBottom = false;
          var members = [];
          queue.length = 0;
          queue.push(start);
          seen[start] = 1;
          for (var q = 0; q < queue.length; q++) {
            var cur = queue[q];
            var cx = cur % n;
            var cy = Math.floor(cur / n);
            members.push(cur);
            if (cy === 0) touchesTop = true;
            if (cy === n - 1) touchesBottom = true;
            for (var d = 0; d < dirs.length; d++) {
              var nx = cx + dirs[d][0];
              var ny = cy + dirs[d][1];
              if (nx < 0 || nx >= n || ny < 0 || ny >= n) continue;
              var ni = idx(nx, ny);
              if (grid[ni] && !seen[ni]) {
                seen[ni] = 1;
                queue.push(ni);
              }
            }
          }
          if (members.length > best.length) best = members;
          if (touchesTop && touchesBottom && members.length > spanCluster.length) spanCluster = members;
        }
      }
      spans = spanCluster.length > 0;
      largestCluster = best.length;
      var highlight = spans ? spanCluster : best;
      for (var h = 0; h < highlight.length; h++) cluster[highlight[h]] = spans ? 2 : 1;
    }
    function draw(){
      var paper = cssVar("--paper") || "#fff";
      var line = cssVar("--line") || "#ddd";
      var fill = cssVar("--ink-soft") || "#6b7280";
      var accent = cssVar("--accent") || "#178f8a";
      var brass = cssVar("--brass") || "#a66b18";
      ctx.fillStyle = paper;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.strokeStyle = line;
      ctx.lineWidth = 0.55;
      for (var y = 0; y < n; y++) {
        for (var x = 0; x < n; x++) {
          var i = idx(x, y);
          var px = Math.floor(x * cell);
          var py = Math.floor(y * cell);
          if (grid[i]) {
            ctx.fillStyle = cluster[i] === 2 ? accent : (cluster[i] === 1 ? brass : fill);
            ctx.globalAlpha = cluster[i] ? 0.92 : 0.42;
            ctx.fillRect(px + 1, py + 1, Math.ceil(cell) - 2, Math.ceil(cell) - 2);
          }
          ctx.globalAlpha = 1;
          if (cell >= 10) ctx.strokeRect(px + 0.5, py + 0.5, cell, cell);
        }
      }
      if (spans) {
        verdict.textContent = text("SPANS · one connected cluster crosses the grid", "贯穿 · 一个连通簇穿过整个网格");
        verdict.className = "perc-verdict spans";
      } else {
        verdict.textContent = text("NO SPAN · only local islands in this sample", "未贯穿 · 此次抽样只有局部岛屿");
        verdict.className = "perc-verdict no-span";
      }
      filledEl.textContent = String(filledCount);
      largestEl.textContent = String(largestCluster);
      pValue.textContent = p.toFixed(2);
    }

    slider.addEventListener("input", function(){
      setProbability(Number(slider.value) / 100);
      sample();
    });
    var reroll = document.getElementById("perc-reroll");
    var low = document.getElementById("perc-low");
    var critical = document.getElementById("perc-critical");
    var high = document.getElementById("perc-high");
    if (reroll) reroll.addEventListener("click", sample);
    if (low) low.addEventListener("click", function(){ setProbability(0.42); sample(); });
    if (critical) critical.addEventListener("click", function(){ setProbability(0.59); sample(); });
    if (high) high.addEventListener("click", function(){ setProbability(0.72); sample(); });

    setProbability(p);
    sample();
  })();

  (function initCellularAutomata(){
    var canvas = document.getElementById("ca");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var numEl = document.getElementById("ca-num");
    if (!ctx || !numEl) return;

    var cols = 208;
    var cell = canvas.width / cols;
    var rows = Math.floor(canvas.height / cell);
    var rule = 30;
    var randomSeed = false;

    function ruleset(value){
      var out = [];
      for (var i = 0; i < 8; i++) out[i] = (value >> i) & 1;
      return out;
    }
    function run(){
      var table = ruleset(rule);
      ctx.fillStyle = cssVar("--paper");
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = cssVar("--accent");
      var row = new Uint8Array(cols);
      if (randomSeed) {
        for (var i = 0; i < cols; i++) row[i] = Math.random() < 0.5 ? 1 : 0;
      } else {
        row[Math.floor(cols / 2)] = 1;
      }
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          if (row[x]) ctx.fillRect(x * cell, y * cell, Math.ceil(cell), Math.ceil(cell));
        }
        var next = new Uint8Array(cols);
        for (var x2 = 0; x2 < cols; x2++) {
          var left = row[(x2 - 1 + cols) % cols];
          var center = row[x2];
          var right = row[(x2 + 1) % cols];
          next[x2] = table[(left << 2) | (center << 1) | right];
        }
        row = next;
      }
      numEl.textContent = String(rule);
    }

    var buttons = document.querySelectorAll("#ca-pick button");
    buttons.forEach(function(button){
      button.addEventListener("click", function(){
        buttons.forEach(function(other){
          other.classList.remove("sel");
          other.setAttribute("aria-pressed", "false");
        });
        button.classList.add("sel");
        button.setAttribute("aria-pressed", "true");
        rule = Number(button.getAttribute("data-rule")) || 30;
        randomSeed = false;
        run();
      });
    });
    var redraw = document.getElementById("ca-run");
    var seed = document.getElementById("ca-seed");
    if (redraw) redraw.addEventListener("click", function(){ randomSeed = false; run(); });
    if (seed) seed.addEventListener("click", function(){ randomSeed = true; run(); });
    run();
  })();

  (function initRandomBooleanNetwork(){
    var canvas = document.getElementById("nk");
    var trace = document.getElementById("nktrace");
    if (!canvas || !trace) return;
    var ctx = canvas.getContext("2d");
    var tctx = trace.getContext("2d");
    var slider = document.getElementById("kslider");
    var kval = document.getElementById("kval2");
    var regimeEl = document.getElementById("nk-regime");
    var rateEl = document.getElementById("nk-rate");
    if (!ctx || !tctx || !slider || !kval || !regimeEl || !rateEl) return;

    var side = 24;
    var total = side * side;
    var cell = canvas.width / side;
    var K = Number(slider.value) || 2;
    var state = new Uint8Array(total);
    var nextState = new Uint8Array(total);
    var wiring = [];
    var rules = [];
    var history = [];
    var running = true;

    function build(){
      wiring = [];
      rules = [];
      for (var i = 0; i < total; i++) {
        var inputs = [];
        for (var k = 0; k < K; k++) inputs.push(Math.floor(Math.random() * total));
        wiring.push(inputs);
        var table = new Uint8Array(1 << K);
        for (var t = 0; t < table.length; t++) table[t] = Math.random() < 0.5 ? 1 : 0;
        rules.push(table);
      }
      for (var s = 0; s < total; s++) state[s] = Math.random() < 0.5 ? 1 : 0;
      history = [];
    }
    function step(){
      var flips = 0;
      for (var i = 0; i < total; i++) {
        var key = 0;
        for (var k = 0; k < K; k++) key = (key << 1) | state[wiring[i][k]];
        var value = rules[i][key];
        nextState[i] = value;
        if (value !== state[i]) flips++;
      }
      var tmp = state;
      state = nextState;
      nextState = tmp;
      var rate = flips / total;
      history.push(rate);
      if (history.length > trace.width) history.shift();
      return rate;
    }
    function draw(rate){
      ctx.fillStyle = cssVar("--paper");
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      var on = cssVar("--accent");
      var off = cssVar("--line");
      for (var i = 0; i < total; i++) {
        var x = i % side;
        var y = Math.floor(i / side);
        ctx.fillStyle = state[i] ? on : off;
        ctx.globalAlpha = state[i] ? 1 : 0.42;
        ctx.fillRect(x * cell + 0.5, y * cell + 0.5, cell - 1, cell - 1);
      }
      ctx.globalAlpha = 1;

      tctx.fillStyle = cssVar("--paper");
      tctx.fillRect(0, 0, trace.width, trace.height);
      tctx.strokeStyle = cssVar("--line");
      tctx.lineWidth = 1;
      tctx.beginPath();
      tctx.moveTo(0, trace.height - 1);
      tctx.lineTo(trace.width, trace.height - 1);
      tctx.stroke();
      tctx.strokeStyle = cssVar("--accent");
      tctx.lineWidth = 1.6;
      tctx.beginPath();
      for (var h = 0; h < history.length; h++) {
        var yy = trace.height - 1 - history[h] * (trace.height - 7);
        if (h === 0) tctx.moveTo(h, yy);
        else tctx.lineTo(h, yy);
      }
      tctx.stroke();

      var recent = history.slice(-30);
      var avg = recent.reduce(function(a, b){ return a + b; }, 0) / (recent.length || 1);
      var label;
      var color;
      if (avg < 0.02) {
        label = text("frozen / ordered", "冻结／有序");
        color = cssVar("--ok");
      } else if (avg > 0.18) {
        label = text("chaotic", "混沌");
        color = cssVar("--contested");
      } else {
        label = text("near edge of chaos", "接近混沌边缘");
        color = cssVar("--accent");
      }
      regimeEl.textContent = label;
      regimeEl.style.color = color;
      rateEl.textContent = Math.round((rate || 0) * 100) + "%";
    }
    function warmup(){
      for (var i = 0; i < 45; i++) step();
      draw(history[history.length - 1]);
    }
    function loop(ts){
      if (running) {
        if (!loop.last || ts - loop.last > 120) {
          draw(step());
          loop.last = ts;
        }
      }
      requestAnimationFrame(loop);
    }

    build();
    if (reduceMotion) {
      running = false;
      warmup();
    } else {
      requestAnimationFrame(loop);
    }
    slider.addEventListener("input", function(){
      K = Number(slider.value) || 2;
      kval.textContent = String(K);
      build();
      if (reduceMotion) warmup();
    });
    var rewire = document.getElementById("nk-rewire");
    if (rewire) rewire.addEventListener("click", function(){
      build();
      if (reduceMotion) warmup();
    });
  })();
})();
