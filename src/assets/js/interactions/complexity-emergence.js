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
})();
