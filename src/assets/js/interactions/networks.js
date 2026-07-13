(function(){
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  function svgElement(name, attrs){
    var element = document.createElementNS(NS, name);
    if (attrs) {
      Object.keys(attrs).forEach(function(key){
        element.setAttribute(key, String(attrs[key]));
      });
    }
    return element;
  }

  function appendText(svg, x, y, value, options){
    var opts = options || {};
    var node = svgElement("text", {
      x: x,
      y: y,
      "text-anchor": opts.anchor || "middle",
      "font-family": opts.font || "IBM Plex Mono, monospace",
      "font-size": opts.size || 11,
      "font-weight": opts.weight || 500,
      fill: opts.fill || "var(--ink-soft)"
    });
    node.textContent = value;
    svg.appendChild(node);
    return node;
  }

  function clearSvg(svg){
    while (svg && svg.firstChild) svg.removeChild(svg.firstChild);
  }

  function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
  }

  function shortenSegment(from, to, startInset, endInset){
    var length = Math.hypot(to.x - from.x, to.y - from.y) || 1;
    var ux = (to.x - from.x) / length;
    var uy = (to.y - from.y) / length;
    return {
      x1: from.x + ux * startInset,
      y1: from.y + uy * startInset,
      x2: to.x - ux * endInset,
      y2: to.y - uy * endInset
    };
  }

  function offsetSegment(segment, offset){
    var length = Math.hypot(segment.x2 - segment.x1, segment.y2 - segment.y1) || 1;
    var px = -(segment.y2 - segment.y1) / length;
    var py = (segment.x2 - segment.x1) / length;
    return {
      x1: segment.x1 + px * offset,
      y1: segment.y1 + py * offset,
      x2: segment.x2 + px * offset,
      y2: segment.y2 + py * offset
    };
  }

  function appendDirectionalMarker(defs, id, color, bar){
    var marker = svgElement("marker", {
      id: id,
      viewBox: "0 0 10 10",
      refX: 7,
      refY: 5,
      markerWidth: 6,
      markerHeight: 6,
      orient: "auto"
    });
    marker.appendChild(bar
      ? svgElement("path", { d: "M7 1 L7 9", fill: "none", stroke: color, "stroke-width": 2.5 })
      : svgElement("path", { d: "M1 1 L9 5 L1 9 Z", fill: color }));
    defs.appendChild(marker);
  }

  function mulberry32(seed){
    return function(){
      seed |= 0;
      seed = seed + 0x6D2B79F5 | 0;
      var value = Math.imul(seed ^ seed >>> 15, 1 | seed);
      value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }

  function setPressed(buttons, active){
    Array.prototype.forEach.call(buttons, function(button){
      button.setAttribute("aria-pressed", button === active ? "true" : "false");
    });
  }

  function localeText(root, english, chinese){
    return root.getAttribute("data-locale") === "zh" ? chinese : english;
  }

  function prefersReducedMotion(){
    return Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function mountWhenVisible(root, init){
    var controls = null;
    function ensure(){
      if (!controls) controls = init(root) || {};
    }
    if (!("IntersectionObserver" in window)) {
      ensure();
      if (controls.start) controls.start();
      return;
    }
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          ensure();
          if (controls.start) controls.start();
        } else if (controls && controls.stop) {
          controls.stop();
        }
      });
    }, { rootMargin: "140px 0px", threshold: 0.01 });
    observer.observe(root);
  }

  function ringPositions(count, cx, cy, radius){
    var positions = [];
    for (var index = 0; index < count; index += 1) {
      var angle = -Math.PI / 2 + index * Math.PI * 2 / count;
      positions.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
    }
    return positions;
  }

  function buildHubGraph(count, seed){
    var rng = mulberry32(seed);
    var edges = [[0, 1], [0, 2], [1, 2]];
    var adjacency = Array.from({ length: count }, function(){ return []; });

    function add(from, to){
      if (from === to || adjacency[from].indexOf(to) >= 0) return false;
      adjacency[from].push(to);
      adjacency[to].push(from);
      edges.push([from, to]);
      return true;
    }

    adjacency[0] = [1, 2];
    adjacency[1] = [0, 2];
    adjacency[2] = [0, 1];
    for (var node = 3; node < count; node += 1) {
      var attempts = 0;
      var added = 0;
      while (added < 2 && attempts < 80) {
        var total = 0;
        for (var prior = 0; prior < node; prior += 1) total += adjacency[prior].length + 1;
        var pick = rng() * total;
        var target = 0;
        for (var candidate = 0; candidate < node; candidate += 1) {
          pick -= adjacency[candidate].length + 1;
          if (pick <= 0) {
            target = candidate;
            break;
          }
        }
        if (add(node, target)) added += 1;
        attempts += 1;
      }
    }
    return { edges: edges, adjacency: adjacency, degree: adjacency.map(function(neighbours){ return neighbours.length; }) };
  }

  function hubPositions(count, width, height, seed){
    var rng = mulberry32(seed);
    var cx = width / 2;
    var cy = height / 2;
    var positions = [];
    for (var index = 0; index < count; index += 1) {
      var age = index / Math.max(1, count - 1);
      var radius = 24 + age * Math.min(width, height) * 0.39 + rng() * 18;
      var angle = index * 2.399963229728653 + rng() * 0.22;
      positions.push({
        x: clamp(cx + Math.cos(angle) * radius, 28, width - 28),
        y: clamp(cy + Math.sin(angle) * radius * 0.76, 28, height - 28)
      });
    }
    return positions;
  }

  function drawEdges(svg, edges, positions, options){
    var opts = options || {};
    edges.forEach(function(edge, index){
      var from = positions[edge[0]];
      var to = positions[edge[1]];
      if (!from || !to) return;
      var line = svgElement("line", {
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y,
        stroke: opts.color ? opts.color(edge, index) : "var(--line-strong)",
        "stroke-width": opts.width ? opts.width(edge, index) : 1.4,
        opacity: opts.opacity ? opts.opacity(edge, index) : 0.72
      });
      svg.appendChild(line);
    });
  }

  function drawNodes(svg, positions, options){
    var opts = options || {};
    positions.forEach(function(position, index){
      var circle = svgElement("circle", {
        cx: position.x,
        cy: position.y,
        r: opts.radius ? opts.radius(index) : 6,
        fill: opts.fill ? opts.fill(index) : "var(--accent)",
        stroke: opts.stroke ? opts.stroke(index) : "var(--raised)",
        "stroke-width": opts.strokeWidth ? opts.strokeWidth(index) : 1.8,
        opacity: opts.opacity ? opts.opacity(index) : 1
      });
      if (opts.className) circle.setAttribute("class", opts.className(index));
      svg.appendChild(circle);
    });
  }

  function initSmallWorld(root){
    var svg = root.querySelector("[data-role='network']");
    var input = root.querySelector("[data-role='rewiring']");
    var valueOut = root.querySelector("[data-out='rewiring']");
    var pathOut = root.querySelector("[data-out='path']");
    var clusteringOut = root.querySelector("[data-out='clustering']");
    var verdict = root.querySelector("[data-out='verdict']");
    var reshuffle = root.querySelector("[data-action='reshuffle']");
    var count = 48;
    var positions = ringPositions(count, 310, 178, 132);
    var seed = 1201;

    function createPlan(planSeed){
      var rng = mulberry32(planSeed);
      var entries = [];
      for (var from = 0; from < count; from += 1) {
        for (var offset = 1; offset <= 2; offset += 1) {
          var candidates = [];
          for (var candidate = 0; candidate < count; candidate += 1) {
            var ringDistance = Math.min((candidate - from + count) % count, (from - candidate + count) % count);
            if (ringDistance > 2) candidates.push(candidate);
          }
          for (var index = candidates.length - 1; index > 0; index -= 1) {
            var swap = Math.floor(rng() * (index + 1));
            var held = candidates[index];
            candidates[index] = candidates[swap];
            candidates[swap] = held;
          }
          entries.push({ threshold: rng(), candidates: candidates });
        }
      }
      return entries;
    }

    var rewirePlan = createPlan(seed);

    function build(probability){
      var adjacency = Array.from({ length: count }, function(){ return []; });
      var edges = [];
      function add(from, to, shortcut){
        if (from === to || adjacency[from].indexOf(to) >= 0) return false;
        adjacency[from].push(to);
        adjacency[to].push(from);
        edges.push({ from: from, to: to, shortcut: shortcut });
        return true;
      }
      for (var from = 0; from < count; from += 1) {
        for (var offset = 1; offset <= 2; offset += 1) {
          add(from, (from + offset) % count, false);
        }
      }
      rewirePlan.map(function(entry, index){ return { entry: entry, index: index }; })
        .filter(function(item){ return item.entry.threshold < probability; })
        .sort(function(a, b){ return a.entry.threshold - b.entry.threshold; })
        .forEach(function(item){
        var edge = edges[item.index];
        var original = edge.to;
        adjacency[edge.from] = adjacency[edge.from].filter(function(node){ return node !== original; });
        adjacency[original] = adjacency[original].filter(function(node){ return node !== edge.from; });
        var target = item.entry.candidates.find(function(candidate){ return adjacency[edge.from].indexOf(candidate) < 0; });
        if (target === undefined) {
          adjacency[edge.from].push(original);
          adjacency[original].push(edge.from);
          return;
        }
        edge.to = target;
        edge.shortcut = edge.to !== original;
        adjacency[edge.from].push(edge.to);
        adjacency[edge.to].push(edge.from);
      });
      return { adjacency: adjacency, edges: edges };
    }

    function meanPath(adjacency){
      var sum = 0;
      var pairs = 0;
      for (var source = 0; source < count; source += 1) {
        var distances = Array(count).fill(-1);
        distances[source] = 0;
        var queue = [source];
        for (var cursor = 0; cursor < queue.length; cursor += 1) {
          var node = queue[cursor];
          adjacency[node].forEach(function(next){
            if (distances[next] < 0) {
              distances[next] = distances[node] + 1;
              queue.push(next);
            }
          });
        }
        for (var target = source + 1; target < count; target += 1) {
          if (distances[target] >= 0) {
            sum += distances[target];
            pairs += 1;
          }
        }
      }
      return pairs ? sum / pairs : 0;
    }

    function clustering(adjacency){
      var total = 0;
      adjacency.forEach(function(neighbours){
        if (neighbours.length < 2) return;
        var links = 0;
        for (var a = 0; a < neighbours.length; a += 1) {
          for (var b = a + 1; b < neighbours.length; b += 1) {
            if (adjacency[neighbours[a]].indexOf(neighbours[b]) >= 0) links += 1;
          }
        }
        total += links / (neighbours.length * (neighbours.length - 1) / 2);
      });
      return total / adjacency.length;
    }

    function render(){
      var probability = Number(input.value) / 100;
      var graph = build(probability);
      clearSvg(svg);
      graph.edges.forEach(function(edge){
        var from = positions[edge.from];
        var to = positions[edge.to];
        svg.appendChild(svgElement("line", {
          x1: from.x,
          y1: from.y,
          x2: to.x,
          y2: to.y,
          stroke: edge.shortcut ? "var(--brass)" : "var(--accent)",
          "stroke-width": edge.shortcut ? 2.4 : 1.35,
          opacity: edge.shortcut ? 0.9 : 0.42
        }));
      });
      drawNodes(svg, positions, { radius: function(){ return 6.2; } });
      var path = meanPath(graph.adjacency);
      var cluster = clustering(graph.adjacency);
      valueOut.textContent = probability.toFixed(2);
      pathOut.textContent = path.toFixed(2);
      clusteringOut.textContent = cluster.toFixed(2);
      if (probability < 0.03) {
        verdict.textContent = localeText(root, "A clustered ring with long routes: a world of villages.", "聚类很高，但路径漫长：这仍是一圈彼此相邻的村庄。");
      } else if (probability < 0.28) {
        verdict.textContent = localeText(root, "The small-world window: paths are short while much of the local clustering survives.", "小世界区间：路径已经很短，而大量本地聚类仍然保留。");
      } else {
        verdict.textContent = localeText(root, "Short routes remain, but the local village structure is being erased.", "路径依然很短，但本地村庄式结构正在被抹去。");
      }
    }

    input.addEventListener("input", render);
    reshuffle.addEventListener("click", function(){
      seed += 97;
      rewirePlan = createPlan(seed);
      render();
    });
    render();
  }

  function initDistribution(root){
    var svg = root.querySelector("[data-role='plot']");
    var distButtons = root.querySelectorAll("[data-dist]");
    var axisButtons = root.querySelectorAll("[data-axis]");
    var overlay = root.querySelector("[data-role='overlay']");
    var verdict = root.querySelector("[data-out='verdict']");
    var distribution = "power";
    var axes = "linear";

    function factorial(value){
      var result = 1;
      for (var index = 2; index <= value; index += 1) result *= index;
      return result;
    }

    function poisson(k){
      var lambda = 7;
      return Math.exp(-lambda) * Math.pow(lambda, k) / factorial(k);
    }

    function power(k){
      return Math.pow(k, -2.35);
    }

    function logNormal(k){
      var sigma = 2.1;
      var mu = -4;
      return Math.exp(-Math.pow(Math.log(k) - mu, 2) / (2 * sigma * sigma)) / (k * sigma * Math.sqrt(2 * Math.PI));
    }

    function series(fn){
      var values = [];
      for (var k = 1; k <= 40; k += 1) values.push({ k: k, p: fn(k) });
      var total = values.reduce(function(sum, point){ return sum + point.p; }, 0);
      return values.map(function(point){ return { k: point.k, p: point.p / total }; });
    }

    function render(){
      clearSvg(svg);
      var left = 62;
      var top = 24;
      var width = 520;
      var height = 276;
      var linearCeiling = 0.75;
      var logFloor = 0.00000001;
      var main = series(distribution === "random" ? poisson : power);
      var lookalike = series(logNormal);
      if (distribution === "random") {
        overlay.checked = false;
        overlay.disabled = true;
      } else {
        overlay.disabled = false;
      }
      svg.appendChild(svgElement("line", { x1: left, y1: top + height, x2: left + width, y2: top + height, stroke: "var(--line-strong)", "stroke-width": 1.5 }));
      svg.appendChild(svgElement("line", { x1: left, y1: top, x2: left, y2: top + height, stroke: "var(--line-strong)", "stroke-width": 1.5 }));
      appendText(svg, left + width / 2, 340, axes === "log" ? localeText(root, "log degree", "log 度数") : localeText(root, "degree k", "度数 k"), { size: 11 });
      appendText(svg, 15, top + height / 2, axes === "log" ? "log P(k)" : "P(k)", { size: 11, anchor: "start" });

      function coordinates(point){
        if (axes === "log") {
          return {
            x: left + Math.log(point.k) / Math.log(40) * width,
            y: top + height - clamp((Math.log(Math.max(point.p, logFloor)) - Math.log(logFloor)) / -Math.log(logFloor), 0, 1) * height
          };
        }
        return {
          x: left + (point.k - 1) / 39 * width,
          y: top + height - clamp(point.p / linearCeiling, 0, 1) * height
        };
      }

      function drawSeries(values, color, dash){
        var path = "";
        values.forEach(function(point, index){
          var xy = coordinates(point);
          path += (index ? " L " : "M ") + xy.x.toFixed(2) + " " + xy.y.toFixed(2);
        });
        var node = svgElement("path", { d: path, fill: "none", stroke: color, "stroke-width": 3, "stroke-linejoin": "round" });
        if (dash) node.setAttribute("stroke-dasharray", dash);
        svg.appendChild(node);
      }

      drawSeries(main, "var(--accent)", "");
      if (overlay.checked) drawSeries(lookalike, "var(--brass)", "8 6");
      [1, 5, 10, 20, 40].forEach(function(k){
        var xy = coordinates({ k: k, p: axes === "log" ? logFloor : 0 });
        appendText(svg, xy.x, top + height + 18, String(k), { size: 10.5, fill: "var(--ink-faint)" });
      });

      if (distribution === "random") {
        verdict.textContent = localeText(root, "Random attachment produces a characteristic scale: most nodes crowd near one typical degree.", "随机连线产生特征尺度：多数节点聚集在一个典型度数附近。");
      } else if (axes === "log" && overlay.checked) {
        verdict.textContent = localeText(root, "The heavy tail looks nearly straight, but the log-normal rival shadows it over much of the visible range. A plot alone cannot settle the model.", "重尾曲线近似直线，但对数正态分布在大部分可见区间紧随其后。仅凭图形无法判定模型。");
      } else if (axes === "log") {
        verdict.textContent = localeText(root, "A power law straightens on log-log axes. That is a diagnostic clue, not a statistical verdict.", "幂律会在双对数坐标上变直。这是诊断线索，不是统计判决。");
      } else {
        verdict.textContent = localeText(root, "Most nodes have few links; a thin tail contains the hubs. Linear axes make that tail easy to miss.", "多数节点连接很少，少数枢纽藏在细长尾部；在线性坐标上，这条尾巴很容易被忽略。");
      }
    }

    Array.prototype.forEach.call(distButtons, function(button){
      button.addEventListener("click", function(){
        distribution = button.getAttribute("data-dist");
        setPressed(distButtons, button);
        render();
      });
    });
    Array.prototype.forEach.call(axisButtons, function(button){
      button.addEventListener("click", function(){
        axes = button.getAttribute("data-axis");
        setPressed(axisButtons, button);
        render();
      });
    });
    overlay.addEventListener("change", render);
    render();
  }

  function initContagion(root){
    var svg = root.querySelector("[data-role='network']");
    var betaInput = root.querySelector("[data-role='beta']");
    var betaOut = root.querySelector("[data-out='beta']");
    var reachedOut = root.querySelector("[data-out='reached']");
    var immunizedOut = root.querySelector("[data-out='immunized']");
    var strategyOut = root.querySelector("[data-out='strategy']");
    var verdict = root.querySelector("[data-out='verdict']");
    var playButton = root.querySelector("[data-action='play']");
    var resetButton = root.querySelector("[data-action='reset']");
    var strategyButtons = root.querySelectorAll("[data-strategy]");
    var nodeCount = 42;
    var graph = buildHubGraph(nodeCount, 1212);
    var positions = hubPositions(nodeCount, 620, 390, 441);
    var state = Array(nodeCount).fill(0);
    var ever = {};
    var strategy = "none";
    var timer = null;
    var running = false;
    var visible = false;
    var randomSeed = 912;
    var protectionCount = Math.max(1, Math.round(nodeCount * 0.12));
    var hubProtected = graph.degree.map(function(degree, index){ return { degree: degree, index: index }; })
      .sort(function(a, b){ return b.degree - a.degree || a.index - b.index; })
      .slice(0, protectionCount)
      .map(function(item){ return item.index; });
    var randomProtected = state.map(function(_, index){ return index; });
    var protectionRng = mulberry32(733);
    for (var shuffleIndex = randomProtected.length - 1; shuffleIndex > 0; shuffleIndex -= 1) {
      var swapIndex = Math.floor(protectionRng() * (shuffleIndex + 1));
      var held = randomProtected[shuffleIndex];
      randomProtected[shuffleIndex] = randomProtected[swapIndex];
      randomProtected[swapIndex] = held;
    }
    randomProtected = randomProtected.slice(0, protectionCount);
    var indexCase = graph.degree.map(function(degree, index){ return { degree: degree, index: index }; })
      .filter(function(item){ return hubProtected.indexOf(item.index) < 0 && randomProtected.indexOf(item.index) < 0; })
      .sort(function(a, b){ return b.degree - a.degree || a.index - b.index; })[0].index;

    function protectedNodes(){
      if (strategy === "hubs") return hubProtected.slice();
      if (strategy === "random") return randomProtected.slice();
      return [];
    }

    function reset(keepStrategy){
      if (timer) window.clearTimeout(timer);
      timer = null;
      running = false;
      state = Array(nodeCount).fill(0);
      ever = {};
      if (!keepStrategy) strategy = "none";
      protectedNodes().forEach(function(index){ state[index] = 3; });
      draw();
    }

    function draw(){
      clearSvg(svg);
      drawEdges(svg, graph.edges, positions, { opacity: function(){ return 0.34; } });
      drawNodes(svg, positions, {
        radius: function(index){ return 5 + Math.min(8, graph.degree[index] * 0.72); },
        fill: function(index){
          return state[index] === 1 ? "var(--contested)" : state[index] === 2 ? "var(--brass)" : state[index] === 3 ? "var(--accent)" : "var(--ink-faint)";
        },
        opacity: function(index){ return state[index] === 0 ? 0.47 : 0.96; }
      });
      var reached = Object.keys(ever).length;
      var protectedCount = state.filter(function(value){ return value === 3; }).length;
      betaOut.textContent = (Number(betaInput.value) / 100).toFixed(2);
      reachedOut.textContent = Math.round(reached / state.length * 100) + "%";
      immunizedOut.textContent = String(protectedCount);
      strategyOut.textContent = strategy === "hubs"
        ? localeText(root, "hubs", "枢纽优先")
        : strategy === "random"
          ? localeText(root, "random", "随机")
          : localeText(root, "none", "无");
      if (!running && reached > 0) {
        verdict.textContent = localeText(root, "Outbreak complete: " + reached + " of " + state.length + " nodes were reached.", "传播结束：共波及 " + reached + " / " + state.length + " 个节点。");
      } else if (!running) {
        verdict.textContent = localeText(root, "Choose a protection strategy or start with no protection, then launch the outbreak.", "可先选择防护策略，也可不做防护，然后开始传播。");
      }
    }

    function seed(){
      state.forEach(function(value, index){ if (value !== 3) state[index] = 0; });
      ever = {};
      state[indexCase] = 1;
      ever[indexCase] = true;
      running = true;
      randomSeed = 912;
      draw();
      if (prefersReducedMotion()) {
        var guard = 0;
        while (running && guard <= state.length) {
          step(true);
          guard += 1;
        }
      } else {
        schedule();
      }
    }

    function schedule(){
      if (!running || !visible || timer) return;
      timer = window.setTimeout(step, 380);
    }

    function step(instant){
      timer = null;
      if (!running) return;
      if (!visible && !instant) return;
      var rng = mulberry32(randomSeed++);
      var beta = Number(betaInput.value) / 100;
      var next = state.slice();
      var newly = 0;
      state.forEach(function(value, index){
        if (value !== 1) return;
        next[index] = 2;
        graph.adjacency[index].forEach(function(neighbour){
          if (state[neighbour] === 0 && rng() < beta) {
            next[neighbour] = 1;
            ever[neighbour] = true;
            newly += 1;
          }
        });
      });
      state = next;
      if (newly === 0 && state.indexOf(1) < 0) running = false;
      draw();
      if (!instant) schedule();
    }

    Array.prototype.forEach.call(strategyButtons, function(button){
      button.addEventListener("click", function(){
        strategy = button.getAttribute("data-strategy");
        setPressed(strategyButtons, button);
        reset(true);
      });
    });
    betaInput.addEventListener("input", draw);
    playButton.addEventListener("click", seed);
    resetButton.addEventListener("click", function(){
      Array.prototype.forEach.call(strategyButtons, function(button){ button.setAttribute("aria-pressed", "false"); });
      reset(false);
    });
    reset(false);
    return {
      start: function(){ visible = true; schedule(); },
      stop: function(){
        visible = false;
        if (timer) window.clearTimeout(timer);
        timer = null;
      }
    };
  }

  function friendshipGraph(){
    var edges = [
      [0,1],[0,2],[0,3],[0,4],[0,5],[1,2],[1,3],[1,6],[1,7],[2,3],
      [2,4],[2,8],[3,5],[3,6],[4,8],[4,9],[5,6],[5,10],[6,7],[6,10],
      [7,10],[7,11],[8,9],[9,11],[10,11]
    ];
    var adjacency = Array.from({ length: 12 }, function(){ return []; });
    edges.forEach(function(edge){ adjacency[edge[0]].push(edge[1]); adjacency[edge[1]].push(edge[0]); });
    return { edges: edges, adjacency: adjacency, degree: adjacency.map(function(neighbours){ return neighbours.length; }) };
  }

  function initFriendship(root){
    var svg = root.querySelector("[data-role='network']");
    var personOut = root.querySelector("[data-out='person']");
    var friendOut = root.querySelector("[data-out='friend']");
    var verdict = root.querySelector("[data-out='verdict']");
    var graph = friendshipGraph();
    var positions = [
      {x:142,y:96},{x:282,y:74},{x:216,y:154},{x:350,y:158},{x:94,y:210},{x:218,y:250},
      {x:382,y:256},{x:502,y:115},{x:78,y:315},{x:192,y:330},{x:382,y:330},{x:520,y:292}
    ];
    var selected = 2;
    var mean = graph.degree.reduce(function(sum, value){ return sum + value; }, 0) / graph.degree.length;
    var friendMean = graph.degree.reduce(function(sum, value){ return sum + value * value; }, 0) /
      graph.degree.reduce(function(sum, value){ return sum + value; }, 0);

    function pick(index){
      selected = index;
      draw();
    }

    function draw(){
      var focusedNode = document.activeElement && document.activeElement.getAttribute("data-node");
      clearSvg(svg);
      drawEdges(svg, graph.edges, positions, {
        color: function(edge){ return edge.indexOf(selected) >= 0 ? "var(--brass)" : "var(--line-strong)"; },
        width: function(edge){ return edge.indexOf(selected) >= 0 ? 2.6 : 1.4; },
        opacity: function(edge){ return edge.indexOf(selected) >= 0 ? 0.9 : 0.48; }
      });
      positions.forEach(function(position, index){
        var friend = graph.adjacency[selected].indexOf(index) >= 0;
        var group = svgElement("g", {
          role: "button",
          tabindex: "0",
          "aria-label": localeText(root, "Person " + (index + 1) + ", " + graph.degree[index] + " friends", "第 " + (index + 1) + " 人，有 " + graph.degree[index] + " 位朋友"),
          "aria-pressed": index === selected ? "true" : "false",
          "data-node": index,
          class: "day12-svg-button"
        });
        group.appendChild(svgElement("circle", {
          cx: position.x,
          cy: position.y,
          r: 10 + graph.degree[index] * 1.35,
          fill: index === selected ? "var(--accent)" : friend ? "var(--brass)" : "var(--ink-faint)",
          stroke: "var(--raised)",
          "stroke-width": index === selected ? 3 : 1.8,
          opacity: index === selected || friend ? 1 : 0.48
        }));
        var number = svgElement("text", {
          x: position.x,
          y: position.y + 4,
          "text-anchor": "middle",
          "font-family": "IBM Plex Mono, monospace",
          "font-size": 10.5,
          "font-weight": 700,
          fill: "var(--raised)"
        });
        number.textContent = String(index + 1);
        group.appendChild(number);
        group.addEventListener("click", function(){ pick(index); });
        group.addEventListener("keydown", function(event){
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            pick(index);
          }
        });
        svg.appendChild(group);
      });
      if (focusedNode !== null) {
        var restoredFocus = svg.querySelector("[data-node='" + focusedNode + "']");
        if (restoredFocus) restoredFocus.focus();
      }
      personOut.textContent = mean.toFixed(2);
      friendOut.textContent = friendMean.toFixed(2);
      var neighbourAverage = graph.adjacency[selected].reduce(function(sum, index){ return sum + graph.degree[index]; }, 0) / graph.adjacency[selected].length;
      verdict.textContent = localeText(
        root,
        "Person " + (selected + 1) + " has " + graph.degree[selected] + " friends; those friends average " + neighbourAverage.toFixed(1) + ". Popular people appear on more friendship lists.",
        "第 " + (selected + 1) + " 人有 " + graph.degree[selected] + " 位朋友；这些朋友平均各有 " + neighbourAverage.toFixed(1) + " 位朋友。连接多的人会出现在更多朋友名单上。"
      );
    }
    draw();
  }

  function components(adjacency, alive){
    var seen = {};
    var groups = [];
    for (var start = 0; start < adjacency.length; start += 1) {
      if (!alive[start] || seen[start]) continue;
      var queue = [start];
      seen[start] = true;
      var group = [];
      for (var cursor = 0; cursor < queue.length; cursor += 1) {
        var node = queue[cursor];
        group.push(node);
        adjacency[node].forEach(function(next){
          if (alive[next] && !seen[next]) {
            seen[next] = true;
            queue.push(next);
          }
        });
      }
      groups.push(group);
    }
    groups.sort(function(a, b){ return b.length - a.length; });
    return groups;
  }

  function initRobustness(root){
    var svg = root.querySelector("[data-role='network']");
    var input = root.querySelector("[data-role='removed']");
    var removedOut = root.querySelector("[data-out='removed']");
    var largestOut = root.querySelector("[data-out='largest']");
    var fragmentsOut = root.querySelector("[data-out='fragments']");
    var verdict = root.querySelector("[data-out='verdict']");
    var buttons = root.querySelectorAll("[data-strategy]");
    var graph = buildHubGraph(42, 137);
    var positions = hubPositions(42, 620, 390, 818);
    var strategy = "random";
    var randomOrder = graph.degree.map(function(_, index){ return index; });
    var rng = mulberry32(902);
    for (var index = randomOrder.length - 1; index > 0; index -= 1) {
      var swap = Math.floor(rng() * (index + 1));
      var tmp = randomOrder[index];
      randomOrder[index] = randomOrder[swap];
      randomOrder[swap] = tmp;
    }
    var hubOrder = graph.degree.map(function(degree, node){ return { degree: degree, node: node }; })
      .sort(function(a, b){ return b.degree - a.degree; }).map(function(item){ return item.node; });

    function render(){
      var fraction = Number(input.value) / 100;
      var removeCount = Math.round(graph.degree.length * fraction);
      var order = strategy === "hubs" ? hubOrder : randomOrder;
      var removed = {};
      order.slice(0, removeCount).forEach(function(node){ removed[node] = true; });
      var alive = graph.degree.map(function(_, node){ return !removed[node]; });
      var groups = components(graph.adjacency, alive);
      var largest = groups[0] || [];
      var inLargest = {};
      largest.forEach(function(node){ inLargest[node] = true; });
      clearSvg(svg);
      drawEdges(svg, graph.edges, positions, {
        color: function(edge){ return inLargest[edge[0]] && inLargest[edge[1]] ? "var(--accent)" : "var(--line-strong)"; },
        width: function(edge){ return inLargest[edge[0]] && inLargest[edge[1]] ? 1.8 : 1.1; },
        opacity: function(edge){ return removed[edge[0]] || removed[edge[1]] ? 0.08 : 0.48; }
      });
      drawNodes(svg, positions, {
        radius: function(node){ return 4.5 + Math.min(7, graph.degree[node] * 0.65); },
        fill: function(node){ return removed[node] ? "var(--line-strong)" : inLargest[node] ? "var(--accent)" : "var(--ink-faint)"; },
        opacity: function(node){ return removed[node] ? 0.22 : inLargest[node] ? 0.95 : 0.62; }
      });
      var largestPercent = Math.round(largest.length / graph.degree.length * 100);
      removedOut.textContent = Math.round(fraction * 100) + "%";
      largestOut.textContent = largestPercent + "%";
      fragmentsOut.textContent = String(groups.length);
      if (removeCount === 0) {
        verdict.textContent = localeText(root, "The network is intact. Move the slider, then compare accident with attack.", "网络完好。移动滑块，再比较随机事故与定向攻击。");
      } else if (strategy === "random" && largestPercent > 55) {
        verdict.textContent = localeText(root, "Random failure mostly removes small nodes; the giant component still holds.", "随机失效多半先移除小节点；巨型连通部分仍维持在一起。");
      } else if (strategy === "hubs" && largestPercent < 45) {
        verdict.textContent = localeText(root, "Targeting hubs has broken the same network into islands.", "优先攻击枢纽已经把同一张网络拆成许多孤岛。");
      } else {
        verdict.textContent = localeText(root, "The largest connected piece is shrinking as more nodes disappear.", "随着更多节点消失，最大连通部分正在收缩。");
      }
    }

    Array.prototype.forEach.call(buttons, function(button){
      button.addEventListener("click", function(){
        strategy = button.getAttribute("data-strategy");
        setPressed(buttons, button);
        render();
      });
    });
    input.addEventListener("input", render);
    render();
  }

  function centralityGraph(){
    var positions = [
      {x:90,y:82},{x:178,y:62},{x:252,y:105},{x:95,y:180},{x:190,y:185},{x:270,y:235},
      {x:350,y:235},{x:430,y:182},{x:522,y:170},{x:370,y:105},{x:458,y:65},{x:550,y:92},
      {x:435,y:300},{x:535,y:285}
    ];
    var edges = [
      [0,1],[0,3],[0,4],[1,2],[1,4],[2,4],[2,5],[3,4],[3,5],[4,5],
      [5,6],
      [6,7],[6,9],[6,12],[7,8],[7,9],[7,12],[8,10],[8,11],[8,13],
      [9,10],[9,12],[10,11],[10,13],[11,13],[12,13]
    ];
    var adjacency = Array.from({ length: positions.length }, function(){ return []; });
    edges.forEach(function(edge){ adjacency[edge[0]].push(edge[1]); adjacency[edge[1]].push(edge[0]); });
    return { positions: positions, edges: edges, adjacency: adjacency };
  }

  function betweenness(adjacency){
    var count = adjacency.length;
    var score = Array(count).fill(0);
    for (var source = 0; source < count; source += 1) {
      var stack = [];
      var predecessors = Array.from({ length: count }, function(){ return []; });
      var paths = Array(count).fill(0);
      var distance = Array(count).fill(-1);
      paths[source] = 1;
      distance[source] = 0;
      var queue = [source];
      for (var cursor = 0; cursor < queue.length; cursor += 1) {
        var node = queue[cursor];
        stack.push(node);
        adjacency[node].forEach(function(next){
          if (distance[next] < 0) {
            distance[next] = distance[node] + 1;
            queue.push(next);
          }
          if (distance[next] === distance[node] + 1) {
            paths[next] += paths[node];
            predecessors[next].push(node);
          }
        });
      }
      var dependency = Array(count).fill(0);
      while (stack.length) {
        var current = stack.pop();
        predecessors[current].forEach(function(previous){
          dependency[previous] += (paths[previous] / paths[current]) * (1 + dependency[current]);
        });
        if (current !== source) score[current] += dependency[current];
      }
    }
    return score.map(function(value){ return value / 2; });
  }

  function eigenvector(adjacency){
    var count = adjacency.length;
    var values = Array(count).fill(1 / Math.sqrt(count));
    for (var iteration = 0; iteration < 60; iteration += 1) {
      var next = Array(count).fill(0);
      adjacency.forEach(function(neighbours, node){
        neighbours.forEach(function(neighbour){ next[node] += values[neighbour]; });
      });
      var norm = Math.sqrt(next.reduce(function(sum, value){ return sum + value * value; }, 0)) || 1;
      values = next.map(function(value){ return value / norm; });
    }
    return values;
  }

  function normalize(values){
    var min = Math.min.apply(null, values);
    var max = Math.max.apply(null, values);
    return values.map(function(value){ return max > min ? (value - min) / (max - min) : 0.5; });
  }

  function initCentrality(root){
    var svg = root.querySelector("[data-role='network']");
    var verdict = root.querySelector("[data-out='verdict']");
    var buttons = root.querySelectorAll("[data-centrality]");
    var graph = centralityGraph();
    var mode = "degree";
    var degree = graph.adjacency.map(function(neighbours){ return neighbours.length; });
    var between = betweenness(graph.adjacency);
    var eigen = eigenvector(graph.adjacency);

    function render(){
      var raw = mode === "degree" ? degree : mode === "betweenness" ? between : eigen;
      var scores = normalize(raw);
      var champion = scores.indexOf(Math.max.apply(null, scores));
      clearSvg(svg);
      drawEdges(svg, graph.edges, graph.positions, { opacity: function(){ return 0.52; } });
      drawNodes(svg, graph.positions, {
        radius: function(node){ return 7 + scores[node] * 13; },
        fill: function(node){ return node === champion ? "var(--brass)" : "var(--accent)"; },
        strokeWidth: function(node){ return node === champion ? 3 : 1.6; }
      });
      appendText(svg, graph.positions[champion].x, graph.positions[champion].y - 24, "★", { size: 19, fill: "var(--brass)" });
      if (mode === "degree") {
        verdict.textContent = localeText(root, "Degree crowns the locally busiest node: importance as raw popularity.", "度数选出本地连接最多的节点：重要性等于直接人脉。");
      } else if (mode === "betweenness") {
        verdict.textContent = localeText(root, "Betweenness moves the crown to the narrow bridge carrying paths between communities.", "介数中心性把王冠移到社区之间的狭窄桥梁：大量最短路径必须经过这里。");
      } else {
        verdict.textContent = localeText(root, "Eigenvector centrality rewards nodes connected to other well-connected nodes—the recursive idea behind PageRank.", "特征向量中心性奖励那些与重要节点相连的节点；PageRank 的递归思想由此而来。");
      }
    }

    Array.prototype.forEach.call(buttons, function(button){
      button.addEventListener("click", function(){
        mode = button.getAttribute("data-centrality");
        setPressed(buttons, button);
        render();
      });
    });
    render();
  }

  function initSynchronization(root){
    var svg = root.querySelector("[data-role='plot']");
    var input = root.querySelector("[data-role='coupling']");
    var couplingOut = root.querySelector("[data-out='coupling']");
    var transitionOut = root.querySelector("[data-out='transition']");
    var widthOut = root.querySelector("[data-out='width']");
    var verdict = root.querySelector("[data-out='verdict']");

    function logistic(value){
      return 1 / (1 + Math.exp(-value));
    }

    function render(){
      var higher = Number(input.value) / 100;
      var left = 62;
      var top = 25;
      var width = 520;
      var height = 275;
      var steepness = 6 + higher * 36;
      var forwardCenter = 0.44 + higher * 0.12;
      var backwardCenter = 0.44 - higher * 0.10;
      clearSvg(svg);
      svg.appendChild(svgElement("line", { x1: left, y1: top + height, x2: left + width, y2: top + height, stroke: "var(--line-strong)", "stroke-width": 1.5 }));
      svg.appendChild(svgElement("line", { x1: left, y1: top, x2: left, y2: top + height, stroke: "var(--line-strong)", "stroke-width": 1.5 }));
      appendText(svg, left + width / 2, 342, localeText(root, "coupling strength", "耦合强度"), { size: 11 });
      appendText(svg, 14, top + height / 2, localeText(root, "synchrony", "同步度"), { size: 11, anchor: "start" });
      if (higher >= 0.65) {
        svg.appendChild(svgElement("rect", {
          x: left + backwardCenter * width,
          y: top,
          width: (forwardCenter - backwardCenter) * width,
          height: height,
          fill: "var(--brass)",
          opacity: 0.08
        }));
        appendText(svg, left + (forwardCenter + backwardCenter) * width / 2, top + 15, localeText(root, "bistable range", "双稳态区"), { size: 10.5 });
      }

      function curve(center, color){
        var path = "";
        if (higher >= 0.65) {
          var lowAtJump = 0.13 + center * 0.16;
          var highAtJump = 0.72 + center * 0.12;
          for (var stepIndex = 0; stepIndex <= 90; stepIndex += 1) {
            var stepX = stepIndex / 90;
            if (stepX >= center) break;
            var lowValue = 0.04 + (lowAtJump - 0.04) * Math.pow(stepX / center, 1.55);
            var lowX = left + stepX * width;
            var lowY = top + height - lowValue * height;
            path += (stepIndex ? " L " : "M ") + lowX.toFixed(2) + " " + lowY.toFixed(2);
          }
          var jumpX = left + center * width;
          path += " L " + jumpX.toFixed(2) + " " + (top + height - lowAtJump * height).toFixed(2);
          path += " L " + jumpX.toFixed(2) + " " + (top + height - highAtJump * height).toFixed(2);
          for (var highIndex = Math.ceil(center * 90); highIndex <= 90; highIndex += 1) {
            var highXValue = highIndex / 90;
            var highValue = highAtJump + (0.96 - highAtJump) * ((highXValue - center) / (1 - center));
            var highX = left + highXValue * width;
            var highY = top + height - highValue * height;
            path += " L " + highX.toFixed(2) + " " + highY.toFixed(2);
          }
        } else {
          for (var index = 0; index <= 90; index += 1) {
            var xValue = index / 90;
            var yValue = logistic(steepness * (xValue - center));
            var x = left + xValue * width;
            var y = top + height - yValue * height;
            path += (index ? " L " : "M ") + x.toFixed(2) + " " + y.toFixed(2);
          }
        }
        svg.appendChild(svgElement("path", { d: path, fill: "none", stroke: color, "stroke-width": 3.2, "stroke-linecap": "round" }));
      }
      curve(forwardCenter, "var(--accent)");
      curve(backwardCenter, "var(--brass)");
      if (higher >= 0.65) {
        appendText(svg, left + forwardCenter * width + 12, top + height * 0.53, "↑", { size: 18, fill: "var(--accent)" });
        appendText(svg, left + backwardCenter * width - 12, top + height * 0.47, "↓", { size: 18, fill: "var(--brass)" });
      }
      couplingOut.textContent = Math.round(higher * 100) + "%";
      widthOut.textContent = (forwardCenter - backwardCenter).toFixed(2);
      if (higher < 0.25) {
        transitionOut.textContent = localeText(root, "continuous", "连续");
        verdict.textContent = localeText(root, "Pairwise-dominated coupling produces a gradual onset; the forward and return paths nearly coincide.", "成对耦合占主导时，同步逐渐出现；增强与减弱耦合的路径几乎重合。");
      } else if (higher < 0.65) {
        transitionOut.textContent = localeText(root, "steepening", "正在变陡");
        verdict.textContent = localeText(root, "The onset steepens and a memory gap opens between locking and unlocking.", "同步转变正在变陡，锁定与解锁之间开始出现记忆间隙。");
      } else {
        transitionOut.textContent = localeText(root, "explosive", "爆发式");
        verdict.textContent = localeText(root, "Higher-order coupling creates a cliff and hysteresis: the state now depends on the direction of travel.", "高阶耦合制造出断崖与迟滞：系统状态开始取决于变化方向。");
      }
    }
    input.addEventListener("input", render);
    render();
  }

  function tippingData(zh){
    return {
      nodes: zh
        ? [
            {name:"格陵兰冰盖",label:["格陵兰"],x:105,y:85,threshold:2},
            {name:"西南极冰盖",label:["西南极"],x:100,y:275,threshold:2},
            {name:"大西洋环流",label:["AMOC"],x:270,y:150,threshold:2},
            {name:"亚马孙",label:["亚马孙"],x:405,y:78,threshold:2},
            {name:"永久冻土",label:["冻土"],x:500,y:185,threshold:2},
            {name:"珊瑚礁",label:["珊瑚"],x:405,y:315,threshold:2},
            {name:"北方森林",label:["北方林"],x:555,y:310,threshold:2}
          ]
        : [
            {name:"Greenland ice sheet",label:["Green","land"],x:105,y:85,threshold:2},
            {name:"West Antarctic ice sheet",label:["W.","Antarc."],x:100,y:275,threshold:2},
            {name:"Atlantic Meridional Overturning Circulation",label:["AMOC"],x:270,y:150,threshold:2},
            {name:"Amazon rainforest",label:["Amazon"],x:405,y:78,threshold:2},
            {name:"Permafrost",label:["Perma","frost"],x:500,y:185,threshold:2},
            {name:"Coral reefs",label:["Coral","reefs"],x:405,y:315,threshold:2},
            {name:"Boreal forest",label:["Boreal","forest"],x:555,y:310,threshold:2}
          ],
      edges: [
        {from:0,to:2,weight:2},{from:1,to:2,weight:1},{from:0,to:1,weight:1},
        {from:2,to:3,weight:2},{from:2,to:0,weight:-1},{from:3,to:4,weight:2},
        {from:4,to:5,weight:2},{from:4,to:6,weight:2},{from:4,to:0,weight:2}
      ]
    };
  }

  function initTipping(root){
    var svg = root.querySelector("[data-role='network']");
    var resetButton = root.querySelector("[data-action='reset']");
    var tippedOut = root.querySelector("[data-out='tipped']");
    var triggerOut = root.querySelector("[data-out='trigger']");
    var verdict = root.querySelector("[data-out='verdict']");
    var data = tippingData(root.getAttribute("data-locale") === "zh");
    var tipped = {};
    var trigger = null;
    var timer = null;
    var visible = false;
    var resolving = false;

    function nextTip(){
      for (var node = 0; node < data.nodes.length; node += 1) {
        if (tipped[node]) continue;
        var pressure = data.edges.filter(function(edge){ return edge.to === node && tipped[edge.from]; })
          .reduce(function(sum, edge){ return sum + edge.weight; }, 0);
        if (pressure >= data.nodes[node].threshold) return node;
      }
      return -1;
    }

    function schedule(){
      if (!resolving || !visible || timer) return;
      timer = window.setTimeout(function(){
        timer = null;
        var node = nextTip();
        if (node < 0) {
          resolving = false;
          draw();
          return;
        }
        tipped[node] = true;
        draw();
        schedule();
      }, 430);
    }

    function activate(index){
      if (timer) window.clearTimeout(timer);
      timer = null;
      tipped = {};
      tipped[index] = true;
      trigger = index;
      resolving = true;
      if (prefersReducedMotion()) {
        var node = nextTip();
        while (node >= 0) {
          tipped[node] = true;
          node = nextTip();
        }
        resolving = false;
        draw();
      } else {
        draw();
        schedule();
      }
    }

    function draw(){
      var focusedNode = document.activeElement && document.activeElement.getAttribute("data-node");
      clearSvg(svg);
      var markerPrefix = "day12-tipping-" + root.getAttribute("data-locale");
      var defs = svgElement("defs");
      appendDirectionalMarker(defs, markerPrefix + "-arrow", "var(--contested)", false);
      appendDirectionalMarker(defs, markerPrefix + "-bar", "var(--ok)", true);
      svg.appendChild(defs);
      data.edges.forEach(function(edge){
        var from = data.nodes[edge.from];
        var to = data.nodes[edge.to];
        var segment = shortenSegment(from, to, 31, 36);
        var reciprocal = data.edges.some(function(other){ return other.from === edge.to && other.to === edge.from; });
        if (reciprocal) segment = offsetSegment(segment, 7);
        var isCurved = edge.from === 4 && edge.to === 0;
        var marker = "url(#" + markerPrefix + (edge.weight > 0 ? "-arrow" : "-bar") + ")";
        var route = isCurved
          ? svgElement("path", {
              d: "M " + segment.x1 + " " + segment.y1 + " Q 315 285 " + segment.x2 + " " + segment.y2,
              fill: "none",
              stroke: edge.weight > 0 ? "var(--contested)" : "var(--ok)",
              "stroke-width": edge.weight > 0 ? 2.2 : 2.8,
              "stroke-dasharray": edge.weight > 0 ? "" : "7 5",
              "marker-end": marker,
              opacity: tipped[edge.from] ? 0.95 : 0.4
            })
          : svgElement("line", {
              x1: segment.x1,
              y1: segment.y1,
              x2: segment.x2,
              y2: segment.y2,
              stroke: edge.weight > 0 ? "var(--contested)" : "var(--ok)",
              "stroke-width": edge.weight > 0 ? 2.2 : 2.8,
              "stroke-dasharray": edge.weight > 0 ? "" : "7 5",
              "marker-end": marker,
              opacity: tipped[edge.from] ? 0.95 : 0.4
            });
        svg.appendChild(route);
        var labelX = isCurved ? 0.25 * segment.x1 + 0.5 * 315 + 0.25 * segment.x2 : (segment.x1 + segment.x2) / 2;
        var labelY = isCurved ? 0.25 * segment.y1 + 0.5 * 285 + 0.25 * segment.y2 : (segment.y1 + segment.y2) / 2;
        appendText(svg, labelX, labelY - 5, edge.weight > 0 ? "+" : "−", {
          size: 13,
          fill: edge.weight > 0 ? "var(--contested)" : "var(--ok)"
        });
      });
      data.nodes.forEach(function(node, index){
        var group = svgElement("g", {
          role: "button",
          tabindex: "0",
          "aria-label": node.name,
          "aria-pressed": tipped[index] ? "true" : "false",
          "data-node": index,
          class: "day12-svg-button"
        });
        group.appendChild(svgElement("circle", {
          cx: node.x,
          cy: node.y,
          r: 29,
          fill: tipped[index] ? "var(--contested)" : "var(--paper)",
          stroke: tipped[index] ? "var(--contested)" : "var(--line-strong)",
          "stroke-width": tipped[index] ? 4 : 2
        }));
        var label = svgElement("text", {
          x: node.x,
          y: node.y - (node.label.length - 1) * 5 + 4,
          "text-anchor": "middle",
          "font-family": "IBM Plex Mono, monospace",
          "font-size": 10.5,
          "font-weight": 600,
          fill: tipped[index] ? "var(--raised)" : "var(--ink)"
        });
        node.label.forEach(function(line, lineIndex){
          var tspan = svgElement("tspan", { x: node.x, dy: lineIndex ? 11 : 0 });
          tspan.textContent = line;
          label.appendChild(tspan);
        });
        group.appendChild(label);
        group.addEventListener("click", function(){ activate(index); });
        group.addEventListener("keydown", function(event){
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            activate(index);
          }
        });
        svg.appendChild(group);
      });
      if (focusedNode !== null) {
        var restoredFocus = svg.querySelector("[data-node='" + focusedNode + "']");
        if (restoredFocus) restoredFocus.focus();
      }
      var count = Object.keys(tipped).length;
      tippedOut.textContent = count + " / 7";
      triggerOut.textContent = trigger === null ? "-" : data.nodes[trigger].name;
      if (trigger === null) {
        verdict.textContent = localeText(root, "Choose one element to test the coupling structure.", "选择一个要素，检验耦合结构如何传递影响。");
      } else if (resolving) {
        verdict.textContent = localeText(root, "The cascade is resolving through the signed network.", "级联正在沿着带正负作用的网络展开。");
      } else if (count === 1) {
        verdict.textContent = localeText(root, "This trigger fizzled in the schematic: no outgoing pressure crossed another threshold.", "在这张示意图里，此触发没有继续扩散：没有后续压力越过另一项阈值。");
      } else {
        verdict.textContent = localeText(root, "One forced transition reached " + (count - 1) + " additional elements. The wiring—not a generic domino metaphor—set the route.", "一次强制转变又带动 " + (count - 1) + " 个要素越过阈值。传播路线由网络连线决定，而非笼统的多米诺比喻。");
      }
    }

    resetButton.addEventListener("click", function(){
      if (timer) window.clearTimeout(timer);
      timer = null;
      tipped = {};
      trigger = null;
      resolving = false;
      draw();
    });
    draw();
    return {
      start: function(){ visible = true; schedule(); },
      stop: function(){
        visible = false;
        if (timer) window.clearTimeout(timer);
        timer = null;
      }
    };
  }

  var initializers = {
    "small-world": initSmallWorld,
    "degree-distribution": initDistribution,
    "contagion": initContagion,
    "friendship-paradox": initFriendship,
    "robustness": initRobustness,
    "centrality": initCentrality,
    "synchronization": initSynchronization,
    "tipping-cascade": initTipping
  };

  Array.prototype.forEach.call(document.querySelectorAll("[data-day12-kind]"), function(root){
    var kind = root.getAttribute("data-day12-kind");
    var init = initializers[kind];
    if (init) mountWhenVisible(root, init);
  });
})();
