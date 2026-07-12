(function(){
  "use strict";

  var isZh = (document.documentElement.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function text(en, zh){ return isZh ? zh : en; }
  function cssVar(name){ return getComputedStyle(document.body).getPropertyValue(name).trim(); }

  function mountWhenVisible(selector, init){
    var target = document.querySelector(selector);
    if (!target) return;
    var controls = null;
    var visible = false;
    function ensure(){
      if (!controls) controls = init() || {};
    }
    function setVisible(next){
      if (visible === next) return;
      visible = next;
      if (next) {
        ensure();
        if (controls.start) controls.start();
      } else if (controls && controls.stop) {
        controls.stop();
      }
    }
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    var observer = new IntersectionObserver(function(entries){
      for (var i = 0; i < entries.length; i++) {
        if (entries[i].target === target) setVisible(entries[i].isIntersecting && entries[i].intersectionRatio > 0);
      }
    }, { rootMargin: "120px 0px", threshold: 0.01 });
    observer.observe(target);
  }

  mountWhenVisible("#boids", function initBoids(){
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

    var animating = false;
    function loop(){
      if (!animating) return;
      step();
      draw();
      requestAnimationFrame(loop);
    }
    function start(){
      if (reduceMotion || animating) return;
      animating = true;
      requestAnimationFrame(loop);
    }
    function stop(){ animating = false; }
    if (reduceMotion) {
      for (var warmup = 0; warmup < 200; warmup++) step();
      draw();
    } else {
      draw();
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
    return { start: start, stop: stop };
  });

  mountWhenVisible("#gol", function initGameOfLife(){
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
    var cellStatus = document.getElementById("gol-cell-status");
    var playButton = document.getElementById("gol-play");
    if (!generationEl || !playButton) return;
    var cursorX = Math.floor(cols / 2);
    var cursorY = Math.floor(rows / 2);

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
      if (document.activeElement === canvas) {
        ctx.save();
        ctx.strokeStyle = cssVar("--brass") || cssVar("--ink");
        ctx.lineWidth = 1.5;
        ctx.strokeRect(cursorX * cell + 0.75, cursorY * cell + 0.75, cell - 1.5, cell - 1.5);
        ctx.restore();
      }
      generationEl.textContent = String(generation);
    }

    function announceCell(){
      if (!cellStatus) return;
      var alive = !!grid[idx(cursorX, cursorY)];
      cellStatus.textContent = text(
        "Row " + (cursorY + 1) + ", column " + (cursorX + 1) + ": " + (alive ? "alive" : "dead") + " cell.",
        "第 " + (cursorY + 1) + " 行，第 " + (cursorX + 1) + " 列：" + (alive ? "活" : "死") + "细胞。"
      );
    }

    function toggleCell(x, y){
      if (x < 0 || x >= cols || y < 0 || y >= rows) return false;
      grid[idx(x, y)] ^= 1;
      draw();
      return true;
    }

    gun();
    draw();

    var animating = false;
    function loop(){
      if (!animating) return;
      if (playing) {
        tick++;
        if (tick % 5 === 0) {
          stepLife();
          draw();
        }
      }
      requestAnimationFrame(loop);
    }
    function start(){
      if (reduceMotion || animating) return;
      animating = true;
      requestAnimationFrame(loop);
    }
    function stop(){ animating = false; }
    if (reduceMotion) playing = false;

    function setPlay(on){
      playing = on;
      playButton.textContent = on ? text("Pause", "暂停") : text("Play", "播放");
      playButton.setAttribute("aria-label", on
        ? text("Pause the Game of Life", "暂停生命游戏")
        : text("Resume the Game of Life", "继续生命游戏"));
    }
    setPlay(playing);
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
        cursorX = x;
        cursorY = y;
        toggleCell(x, y);
        announceCell();
      }
    }
    canvas.addEventListener("click", function(event){ toggleAt(event.clientX, event.clientY); });
    canvas.addEventListener("focus", function(){ draw(); announceCell(); });
    canvas.addEventListener("blur", draw);
    canvas.addEventListener("keydown", function(event){
      var handled = true;
      if (event.key === "ArrowLeft") cursorX = Math.max(0, cursorX - 1);
      else if (event.key === "ArrowRight") cursorX = Math.min(cols - 1, cursorX + 1);
      else if (event.key === "ArrowUp") cursorY = Math.max(0, cursorY - 1);
      else if (event.key === "ArrowDown") cursorY = Math.min(rows - 1, cursorY + 1);
      else if (event.key === " " || event.key === "Enter" || event.key === "Spacebar") toggleCell(cursorX, cursorY);
      else handled = false;

      if (!handled) return;
      event.preventDefault();
      draw();
      announceCell();
    });
    return { start: start, stop: stop };
  });

  mountWhenVisible("#perc", function initPercolation(){
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
  });

  mountWhenVisible("#ca", function initCellularAutomata(){
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
  });

  mountWhenVisible("#nk", function initRandomBooleanNetwork(){
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
    var animating = false;

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
      if (!animating) return;
      if (!loop.last || ts - loop.last > 120) {
        draw(step());
        loop.last = ts;
      }
      requestAnimationFrame(loop);
    }
    function start(){
      if (reduceMotion || animating) return;
      animating = true;
      requestAnimationFrame(loop);
    }
    function stop(){ animating = false; }

    build();
    if (reduceMotion) {
      warmup();
    } else {
      draw(0);
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
      else draw(0);
    });
    return { start: start, stop: stop };
  });

  mountWhenVisible("#nonrecip", function initNonreciprocalPursuit(){
    var canvas = document.getElementById("nonrecip");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var slider = document.getElementById("nrslider");
    var valEl = document.getElementById("nrval");
    var reset = document.getElementById("nr-reset");
    var speedEl = document.getElementById("nr-speed");
    var stateEl = document.getElementById("nr-state");
    if (!ctx || !slider || !valEl || !reset || !speedEl || !stateEl) return;

    var width = canvas.width;
    var height = canvas.height;
    var strength = Number(slider.value) / 100;
    var count = 140;
    var particles = [];
    var animating = false;
    var smoothSpeed = 0;
    function rand(a, b){ return a + Math.random() * (b - a); }
    function spawn(){
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({ x: rand(0, width), y: rand(0, height), vx: rand(-0.5, 0.5), vy: rand(-0.5, 0.5), type: i % 2 });
      }
    }
    function step(){
      var radius = 46;
      var radius2 = radius * radius;
      for (var i = 0; i < count; i++) {
        var a = particles[i];
        var fx = 0;
        var fy = 0;
        for (var j = 0; j < count; j++) {
          if (j === i) continue;
          var b = particles[j];
          var dx = b.x - a.x;
          var dy = b.y - a.y;
          if (dx > width / 2) dx -= width;
          else if (dx < -width / 2) dx += width;
          if (dy > height / 2) dy -= height;
          else if (dy < -height / 2) dy += height;
          var d2 = dx * dx + dy * dy;
          if (d2 > radius2 || d2 < 0.01) continue;
          var d = Math.sqrt(d2);
          var ux = dx / d;
          var uy = dy / d;
          if (d < 13) {
            fx -= ux * 1.1 * (13 - d) / 13;
            fy -= uy * 1.1 * (13 - d) / 13;
          }
          var sign;
          if (a.type === b.type) {
            sign = 0.35;
          } else {
            var symmetric = 0.35;
            var asymmetric = a.type === 0 ? 1.4 : -1.4;
            sign = (1 - strength) * symmetric + strength * asymmetric;
          }
          var weight = (radius - d) / radius;
          fx += ux * sign * 0.07 * weight;
          fy += uy * sign * 0.07 * weight;
        }
        var damping = 0.62 + 0.32 * strength;
        a.vx = (a.vx + fx) * damping;
        a.vy = (a.vy + fy) * damping;
        var sp = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
        if (sp > 2.4) {
          a.vx = a.vx / sp * 2.4;
          a.vy = a.vy / sp * 2.4;
        }
      }
      var totalSpeed = 0;
      for (var k = 0; k < count; k++) {
        var p = particles[k];
        p.x += p.vx;
        p.y += p.vy;
        totalSpeed += Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (p.x < 0) p.x += width;
        else if (p.x >= width) p.x -= width;
        if (p.y < 0) p.y += height;
        else if (p.y >= height) p.y -= height;
      }
      return totalSpeed / count;
    }
    function draw(speed){
      ctx.fillStyle = cssVar("--paper");
      ctx.fillRect(0, 0, width, height);
      var teal = cssVar("--accent");
      var amber = cssVar("--brass");
      for (var i = 0; i < count; i++) {
        var p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4.2, 0, Math.PI * 2);
        ctx.fillStyle = p.type === 0 ? teal : amber;
        ctx.globalAlpha = 0.86;
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      smoothSpeed = smoothSpeed * 0.9 + (speed || 0) * 0.1;
      speedEl.textContent = smoothSpeed.toFixed(2);
      if (strength < 0.2) {
        stateEl.textContent = text("static clusters", "静态团簇");
        stateEl.style.color = cssVar("--ok");
      } else if (strength < 0.55) {
        stateEl.textContent = text("restless drift", "缓慢漂移");
        stateEl.style.color = cssVar("--hint");
      } else {
        stateEl.textContent = text("travelling clusters", "运动团簇");
        stateEl.style.color = cssVar("--accent");
      }
    }
    function loop(){
      if (!animating) return;
      draw(step());
      requestAnimationFrame(loop);
    }
    function start(){
      if (reduceMotion || animating) return;
      animating = true;
      requestAnimationFrame(loop);
    }
    function stop(){ animating = false; }
    function warm(){
      for (var i = 0; i < 120; i++) step();
      draw(0);
    }
    spawn();
    if (reduceMotion) warm();
    else draw(0);
    slider.addEventListener("input", function(){
      strength = Number(slider.value) / 100;
      valEl.textContent = strength.toFixed(2);
      if (reduceMotion) warm();
    });
    reset.addEventListener("click", function(){ spawn(); draw(0); });
    return { start: start, stop: stop };
  });

  mountWhenVisible("#plm", function initPhysicalLearningMachine(){
    var canvas = document.getElementById("plm");
    var trace = document.getElementById("plmtrace");
    if (!canvas || !trace) return;
    var ctx = canvas.getContext("2d");
    var tctx = trace.getContext("2d");
    var train = document.getElementById("plm-train");
    var reset = document.getElementById("plm-reset");
    var errEl = document.getElementById("plm-err");
    var stepEl = document.getElementById("plm-step");
    if (!ctx || !tctx || !train || !reset || !errEl || !stepEl) return;

    var side = 22;
    var cell = canvas.width / side;
    var values = [];
    var target = [];
    var history = [];
    var stepCount = 0;
    var training = false;
    var animating = false;
    var last = 0;
    function idx(x, y){ return y * side + x; }
    function buildTarget(){
      target = new Float32Array(side * side);
      for (var y = 0; y < side; y++) {
        for (var x = 0; x < side; x++) {
          target[idx(x, y)] = 0.5 + 0.5 * Math.sin(x / side * Math.PI * 1.5) * Math.cos(y / side * Math.PI * 1.2);
        }
      }
    }
    function scramble(){
      values = new Float32Array(side * side);
      for (var i = 0; i < values.length; i++) values[i] = Math.random();
      for (var y = 0; y < side; y++) {
        for (var x = 0; x < side; x++) {
          if (x === 0 || y === 0 || x === side - 1 || y === side - 1) values[idx(x, y)] = target[idx(x, y)];
        }
      }
      history = [];
      stepCount = 0;
    }
    function relax(){
      var next = values.slice();
      for (var y = 1; y < side - 1; y++) {
        for (var x = 1; x < side - 1; x++) {
          var i = idx(x, y);
          var avg = (values[idx(x - 1, y)] + values[idx(x + 1, y)] + values[idx(x, y - 1)] + values[idx(x, y + 1)]) / 4;
          var goal = 0.85 * avg + 0.15 * target[i];
          next[i] = values[i] + 0.14 * (goal - values[i]);
        }
      }
      values = next;
      stepCount++;
    }
    function error(){
      var total = 0;
      for (var i = 0; i < values.length; i++) {
        var d = values[i] - target[i];
        total += d * d;
      }
      return Math.sqrt(total / values.length);
    }
    function draw(){
      ctx.fillStyle = cssVar("--paper");
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = cssVar("--accent");
      for (var y = 0; y < side; y++) {
        for (var x = 0; x < side; x++) {
          ctx.globalAlpha = Math.max(0.06, Math.min(1, values[idx(x, y)]));
          ctx.fillRect(x * cell + 0.5, y * cell + 0.5, cell - 1, cell - 1);
        }
      }
      ctx.globalAlpha = 1;
      var e = error();
      history.push(e);
      if (history.length > trace.width) history.shift();
      tctx.fillStyle = cssVar("--paper");
      tctx.fillRect(0, 0, trace.width, trace.height);
      tctx.strokeStyle = cssVar("--line");
      tctx.beginPath();
      tctx.moveTo(0, trace.height - 1);
      tctx.lineTo(trace.width, trace.height - 1);
      tctx.stroke();
      tctx.strokeStyle = cssVar("--accent");
      tctx.lineWidth = 1.8;
      tctx.beginPath();
      for (var h = 0; h < history.length; h++) {
        var yy = trace.height - 2 - Math.min(history[h], 0.55) / 0.55 * (trace.height - 6);
        if (h === 0) tctx.moveTo(h, yy);
        else tctx.lineTo(h, yy);
      }
      tctx.stroke();
      errEl.textContent = e.toFixed(3);
      stepEl.textContent = String(stepCount);
    }
    function loop(ts){
      if (!animating) return;
      if (training && ts - last > 33) {
        relax();
        relax();
        draw();
        last = ts;
        if (error() < 0.025) {
          training = false;
          train.textContent = text("Learned", "已学会");
        }
      }
      requestAnimationFrame(loop);
    }
    function start(){
      if (reduceMotion || animating) return;
      animating = true;
      requestAnimationFrame(loop);
    }
    function stop(){ animating = false; }
    buildTarget();
    scramble();
    draw();
    train.addEventListener("click", function(){
      if (reduceMotion) {
        for (var i = 0; i < 600; i++) relax();
        draw();
        train.textContent = text("Learned", "已学会");
        return;
      }
      training = !training;
      train.textContent = training ? text("Pause", "暂停") : text("Train", "训练");
    });
    reset.addEventListener("click", function(){
      scramble();
      training = false;
      train.textContent = text("Train", "训练");
      draw();
    });
    return { start: start, stop: stop };
  });

  mountWhenVisible("#grokcanvas", function initGrokkingCurve(){
    var canvas = document.getElementById("grokcanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var play = document.getElementById("grok-play");
    var slider = document.getElementById("grok-slider");
    var delayEl = document.getElementById("grok-delay");
    var phaseEl = document.getElementById("grok-phase");
    if (!ctx || !play || !slider || !delayEl || !phaseEl) return;

    var width = canvas.width;
    var height = canvas.height;
    var delay = Number(slider.value) / 100;
    var t = 0;
    var playing = true;
    var animating = false;
    var last = 0;
    var pad = { l: 54, r: 18, t: 24, b: 40 };
    function trainAcc(x){ return 1 / (1 + Math.exp(-(x - 0.06) * 60)); }
    function testAcc(x){
      var center = 0.25 + delay * 0.6;
      return 1 / (1 + Math.exp(-(x - center) * 70));
    }
    function px(x){ return pad.l + x * (width - pad.l - pad.r); }
    function py(v){ return height - pad.b - v * (height - pad.t - pad.b); }
    function draw(){
      ctx.fillStyle = cssVar("--paper");
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = cssVar("--line-strong");
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(pad.l, pad.t - 4);
      ctx.lineTo(pad.l, height - pad.b);
      ctx.lineTo(width - pad.r, height - pad.b);
      ctx.stroke();
      ctx.fillStyle = cssVar("--ink-faint");
      ctx.font = "11px IBM Plex Mono, monospace";
      ctx.textAlign = "right";
      [0, 0.5, 1].forEach(function(v){
        var y = py(v);
        ctx.strokeStyle = cssVar("--line");
        ctx.beginPath();
        ctx.moveTo(pad.l, y);
        ctx.lineTo(width - pad.r, y);
        ctx.stroke();
        ctx.fillText(Math.round(v * 100) + "%", pad.l - 8, y + 4);
      });
      ctx.textAlign = "center";
      ctx.fillText(text("training time ->", "训练时间 ->"), (pad.l + width - pad.r) / 2, height - 10);
      function curve(fn, color){
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        var first = true;
        for (var i = 0; i <= 240; i++) {
          var x = i / 240;
          if (x > t) break;
          var X = px(x);
          var Y = py(fn(x));
          if (first) {
            ctx.moveTo(X, Y);
            first = false;
          } else {
            ctx.lineTo(X, Y);
          }
        }
        ctx.stroke();
      }
      curve(trainAcc, cssVar("--brass"));
      curve(testAcc, cssVar("--accent"));
      ctx.font = "12px IBM Plex Mono, monospace";
      ctx.textAlign = "left";
      ctx.fillStyle = cssVar("--brass");
      ctx.fillText(text("train", "训练"), px(0.54), pad.t + 6);
      ctx.fillStyle = cssVar("--accent");
      ctx.fillText(text("test", "测试"), px(0.54), pad.t + 24);
      var center = 0.25 + delay * 0.6;
      if (t < 0.12) {
        phaseEl.textContent = text("memorizing", "记忆中");
        phaseEl.style.color = cssVar("--brass");
      } else if (t < center - 0.04) {
        phaseEl.textContent = text("plateau", "平台期");
        phaseEl.style.color = cssVar("--ink-soft");
      } else if (t < center + 0.08) {
        phaseEl.textContent = text("grokking", "突然泛化");
        phaseEl.style.color = cssVar("--accent");
      } else {
        phaseEl.textContent = text("generalized", "已泛化");
        phaseEl.style.color = cssVar("--ok");
      }
    }
    function loop(ts){
      if (!animating) return;
      if (playing && ts - last > 16) {
        t += 0.004;
        last = ts;
        if (t >= 1) {
          t = 1;
          playing = false;
        }
        draw();
      }
      requestAnimationFrame(loop);
    }
    function start(){
      if (reduceMotion || animating) return;
      animating = true;
      requestAnimationFrame(loop);
    }
    function stop(){ animating = false; }
    if (reduceMotion) t = 1;
    draw();
    play.addEventListener("click", function(){
      t = 0;
      playing = true;
      draw();
    });
    slider.addEventListener("input", function(){
      delay = Number(slider.value) / 100;
      delayEl.textContent = delay < 0.34 ? text("short", "短") : delay < 0.67 ? text("medium", "中") : text("long", "长");
      draw();
    });
    return { start: start, stop: stop };
  });

  mountWhenVisible("#hu", function initHyperuniformPointFields(){
    var canvas = document.getElementById("hu");
    var bar = document.getElementById("hubar");
    if (!canvas || !bar) return;
    var ctx = canvas.getContext("2d");
    var bctx = bar.getContext("2d");
    var modeEl = document.getElementById("hu-mode");
    var varEl = document.getElementById("hu-var");
    if (!ctx || !bctx || !modeEl || !varEl) return;
    var width = canvas.width;
    var height = canvas.height;
    var mode = "hyper";
    var points = [];
    function gen(){
      points = [];
      var n = 12;
      var gap = width / n;
      if (mode === "random") {
        for (var i = 0; i < n * n; i++) points.push({ x: Math.random() * width, y: Math.random() * height });
      } else {
        for (var y = 0; y < n; y++) {
          for (var x = 0; x < n; x++) {
            var jitter = mode === "hyper" ? gap * 0.42 : 2;
            points.push({ x: gap * (x + 0.5) + (Math.random() - 0.5) * 2 * jitter, y: gap * (y + 0.5) + (Math.random() - 0.5) * 2 * jitter });
          }
        }
      }
    }
    function draw(){
      ctx.fillStyle = cssVar("--paper");
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = mode === "hyper" ? cssVar("--accent") : cssVar("--ink-soft");
      for (var i = 0; i < points.length; i++) {
        ctx.beginPath();
        ctx.arc(points[i].x, points[i].y, 3.4, 0, Math.PI * 2);
        ctx.fill();
      }
      var radius = width * 0.22;
      var counts = [];
      for (var t = 0; t < 40; t++) {
        var cx = Math.random() * (width - 2 * radius) + radius;
        var cy = Math.random() * (height - 2 * radius) + radius;
        var count = 0;
        for (var p = 0; p < points.length; p++) {
          var dx = points[p].x - cx;
          var dy = points[p].y - cy;
          if (dx * dx + dy * dy < radius * radius) count++;
        }
        counts.push(count);
      }
      var mean = counts.reduce(function(a, b){ return a + b; }, 0) / counts.length;
      var variance = counts.reduce(function(a, b){ return a + (b - mean) * (b - mean); }, 0) / counts.length;
      var index = mean > 0 ? variance / mean : 0;
      bctx.fillStyle = cssVar("--paper");
      bctx.fillRect(0, 0, bar.width, bar.height);
      var frac = Math.min(index / 1.2, 1);
      bctx.fillStyle = index < 0.45 ? cssVar("--ok") : index < 0.8 ? cssVar("--hint") : cssVar("--contested");
      bctx.fillRect(10, bar.height / 2 - 14, (bar.width - 20) * frac, 28);
      bctx.strokeStyle = cssVar("--line-strong");
      bctx.strokeRect(10, bar.height / 2 - 14, bar.width - 20, 28);
      bctx.fillStyle = cssVar("--ink-faint");
      bctx.font = "10px IBM Plex Mono, monospace";
      bctx.textAlign = "left";
      bctx.fillText(text("low fluctuation", "低涨落"), 10, bar.height - 6);
      bctx.textAlign = "right";
      bctx.fillText(text("high fluctuation", "高涨落"), bar.width - 10, bar.height - 6);
      varEl.textContent = index.toFixed(2);
      modeEl.textContent = mode === "hyper" ? text("hyperuniform", "超均匀") : mode === "random" ? text("random", "随机") : text("crystal", "晶体");
    }
    gen();
    draw();
    document.querySelectorAll("#hu-pick button").forEach(function(button){
      button.addEventListener("click", function(){
        document.querySelectorAll("#hu-pick button").forEach(function(other){
          other.classList.remove("sel");
          other.setAttribute("aria-pressed", "false");
        });
        button.classList.add("sel");
        button.setAttribute("aria-pressed", "true");
        mode = button.getAttribute("data-mode") || "hyper";
        gen();
        draw();
      });
    });
  });
})();
