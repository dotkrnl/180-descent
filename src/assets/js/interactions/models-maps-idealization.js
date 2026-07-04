(function(){
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var detailSegments = [
    [24, 64, 76, 82, 0.12], [70, 42, 112, 70, 0.18], [118, 62, 178, 42, 0.22],
    [34, 112, 82, 104, 0.16], [78, 142, 132, 132, 0.20], [134, 118, 198, 116, 0.25],
    [44, 186, 96, 160, 0.30], [100, 178, 158, 162, 0.34], [166, 178, 204, 150, 0.38],
    [20, 94, 54, 128, 0.28], [150, 72, 188, 96, 0.32], [54, 30, 66, 78, 0.40],
    [96, 24, 116, 86, 0.45], [148, 26, 152, 88, 0.48], [188, 42, 194, 118, 0.52],
    [28, 148, 78, 184, 0.42], [74, 72, 124, 116, 0.36], [118, 126, 172, 196, 0.50],
    [16, 202, 64, 196, 0.55], [68, 206, 114, 188, 0.58], [132, 206, 200, 188, 0.62],
    [20, 18, 60, 42, 0.64], [72, 16, 112, 32, 0.68], [130, 18, 190, 32, 0.72]
  ];
  var clutterShapes = [
    [24, 24, 9, 5, 0.48], [44, 58, 13, 8, 0.52], [62, 28, 10, 10, 0.55],
    [90, 48, 16, 6, 0.58], [132, 34, 11, 11, 0.60], [164, 52, 14, 8, 0.62],
    [188, 26, 8, 15, 0.64], [28, 96, 16, 8, 0.66], [58, 118, 10, 13, 0.68],
    [86, 96, 15, 10, 0.70], [130, 106, 11, 14, 0.72], [160, 126, 17, 8, 0.74],
    [188, 96, 10, 18, 0.76], [36, 158, 18, 9, 0.78], [74, 168, 12, 12, 0.80],
    [116, 154, 18, 10, 0.82], [150, 170, 12, 15, 0.84], [184, 156, 16, 11, 0.86],
    [20, 196, 13, 10, 0.88], [54, 198, 20, 8, 0.90], [96, 198, 12, 16, 0.92],
    [138, 194, 18, 12, 0.94], [178, 196, 20, 10, 0.96], [202, 168, 9, 20, 0.98]
  ];

  function fidelity(detail){
    return Math.pow(detail, 0.72);
  }

  function usefulness(detail){
    var peak = 0.30;
    var bump = Math.exp(-Math.pow((detail - peak) / 0.26, 2));
    var collapse = 1 - Math.pow(detail, 3.2);
    return clamp(bump * 0.55 + collapse * 0.5, 0, 1);
  }

  function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
  }

  function curvePath(fn){
    var points = [];
    for (var index = 0; index <= 64; index += 1) {
      var detail = index / 64;
      var x = 36 + (316 - 36) * detail;
      var y = 146 - (146 - 22) * fn(detail);
      points.push((index === 0 ? "M" : "L") + x.toFixed(1) + "," + y.toFixed(1));
    }
    return points.join(" ");
  }

  function mountWhenVisible(root, init){
    var controls = null;
    function ensure(){
      if (!controls) controls = init() || {};
    }
    if (!("IntersectionObserver" in window)) {
      ensure();
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
    }, { rootMargin: "120px 0px", threshold: 0.01 });
    observer.observe(root);
  }

  function textSet(locale){
    if (locale === "zh") {
      return {
        labels: [
          [0.12, "极简示意：一个点和一条线"],
          [0.32, "地铁图式示意"],
          [0.55, "可工作的道路图"],
          [0.80, "详细测绘图"],
          [0.97, "近乎照片"],
          [1.01, "疆域本身（一比一）"]
        ],
        verdicts: [
          [0.12, "太简单，无法使用", "你把需要回答问题的东西也抽掉了。理想化必须服务于一个目的，否则它只是在删掉答案。"],
          [0.55, "可用中段", "足够详细，能抓住重要结构；足够简单，能真的使用。工作的模型通常住在这里。"],
          [0.85, "收益递减", "每多加一点细节，只换来一点保真度，却带来更高成本、更少清晰度，以及拟合噪声的风险。"],
          [0.99, "淹没在细节里", "模型忠实到几乎和现实一样难读。你要找的信号被所有你不需要的东西埋住了。"],
          [1.01, "博尔赫斯的一比一地图", "完美准确，也完美无用。和帝国一样大的地图就是帝国本身；它解释不了任何东西，也放不进任何人的手里。"]
        ]
      };
    }
    return {
      labels: [
        [0.12, "bare schematic - a point and a line"],
        [0.32, "subway-style schematic"],
        [0.55, "a working road map"],
        [0.80, "a detailed survey map"],
        [0.97, "near-photographic"],
        [1.01, "the territory itself (1:1)"]
      ],
      verdicts: [
        [0.12, "Too simple to be useful", "You have abstracted away the things the question needed. Idealize for a purpose, or you idealize away the answer."],
        [0.55, "The useful middle", "Detailed enough to be right about what matters, simple enough to actually use. This is where working models live."],
        [0.85, "Diminishing returns set in", "Each added detail buys a sliver more fidelity at a steepening cost in clarity, compute, and the risk of fitting noise."],
        [0.99, "Drowning in detail", "So faithful it is nearly as hard to read as reality itself. The signal you came for is buried in everything you did not need."],
        [1.01, "Borges's 1:1 map", "Perfectly accurate. Perfectly useless. A map the size of the empire is the empire; it explains nothing and fits in no hand."]
      ]
    };
  }

  function choose(list, detail){
    for (var index = 0; index < list.length; index += 1) {
      if (detail < list[index][0]) return list[index];
    }
    return list[list.length - 1];
  }

  function initDial(root){
    var locale = root.getAttribute("data-locale") || "en";
    var copy = textSet(locale);
    var dial = root.querySelector("[data-role='dial']");
    var detailOut = root.querySelector("[data-out='detail']");
    var fidelityOut = root.querySelector("[data-out='fidelity']");
    var usefulnessOut = root.querySelector("[data-out='usefulness']");
    var mapLabel = root.querySelector("[data-out='map-label']");
    var verdictTitle = root.querySelector("[data-out='verdict-title']");
    var verdictBody = root.querySelector("[data-out='verdict-body']");
    var secondaryRoute = root.querySelector("[data-role='secondary-route']");
    var detailLayer = root.querySelector("[data-role='detail']");
    var clutterLayer = root.querySelector("[data-role='clutter']");
    var city = root.querySelector("[data-role='city']");
    var fidelityCurve = root.querySelector("[data-role='fidelity-curve']");
    var usefulnessCurve = root.querySelector("[data-role='usefulness-curve']");
    var markerLine = root.querySelector("[data-role='marker-line']");
    var fidelityDot = root.querySelector("[data-role='fidelity-dot']");
    var usefulnessDot = root.querySelector("[data-role='usefulness-dot']");
    if (!dial || !detailLayer || !clutterLayer) return;

    detailSegments.forEach(function(segment){
      var line = document.createElementNS(NS, "line");
      line.setAttribute("x1", segment[0]);
      line.setAttribute("y1", segment[1]);
      line.setAttribute("x2", segment[2]);
      line.setAttribute("y2", segment[3]);
      line.setAttribute("data-threshold", segment[4]);
      detailLayer.appendChild(line);
    });

    clutterShapes.forEach(function(shape, index){
      var rect = document.createElementNS(NS, "rect");
      rect.setAttribute("x", shape[0]);
      rect.setAttribute("y", shape[1]);
      rect.setAttribute("width", shape[2]);
      rect.setAttribute("height", shape[3]);
      rect.setAttribute("rx", "1.5");
      rect.setAttribute("fill", index % 2 ? "var(--brass)" : "var(--ink-faint)");
      rect.setAttribute("opacity", index % 2 ? ".48" : ".38");
      rect.setAttribute("data-threshold", shape[4]);
      clutterLayer.appendChild(rect);
    });

    if (fidelityCurve) fidelityCurve.setAttribute("d", curvePath(fidelity));
    if (usefulnessCurve) usefulnessCurve.setAttribute("d", curvePath(usefulness));

    function render(){
      var d = Number(dial.value) / 100;
      var f = fidelity(d);
      var u = usefulness(d);
      if (detailOut) detailOut.textContent = String(dial.value) + "%";
      if (fidelityOut) fidelityOut.textContent = f.toFixed(2);
      if (usefulnessOut) usefulnessOut.textContent = u.toFixed(2);
      if (mapLabel) mapLabel.textContent = choose(copy.labels, d)[1];

      var verdict = choose(copy.verdicts, d);
      if (verdictTitle) verdictTitle.textContent = verdict[1];
      if (verdictBody) verdictBody.textContent = verdict[2];

      if (secondaryRoute) secondaryRoute.style.display = d >= 0.12 ? "" : "none";
      detailLayer.setAttribute("opacity", String(clamp(d * 1.5, 0, 1).toFixed(2)));
      Array.prototype.forEach.call(detailLayer.children, function(line){
        line.style.display = d >= Number(line.getAttribute("data-threshold")) ? "" : "none";
      });
      clutterLayer.setAttribute("opacity", d > 0.45 ? String(clamp((d - 0.45) / 0.5, 0, 1).toFixed(2)) : "0");
      Array.prototype.forEach.call(clutterLayer.children, function(rect){
        rect.style.display = d >= Number(rect.getAttribute("data-threshold")) ? "" : "none";
      });
      if (city) city.setAttribute("opacity", d > 0.8 ? String((1 - (d - 0.8) / 0.2 * 0.85).toFixed(2)) : "1");

      var x = 36 + (316 - 36) * d;
      var yF = 146 - (146 - 22) * f;
      var yU = 146 - (146 - 22) * u;
      if (markerLine) {
        markerLine.setAttribute("x1", x.toFixed(1));
        markerLine.setAttribute("x2", x.toFixed(1));
      }
      if (fidelityDot) {
        fidelityDot.setAttribute("cx", x.toFixed(1));
        fidelityDot.setAttribute("cy", yF.toFixed(1));
      }
      if (usefulnessDot) {
        usefulnessDot.setAttribute("cx", x.toFixed(1));
        usefulnessDot.setAttribute("cy", yU.toFixed(1));
      }
    }

    dial.addEventListener("input", render);
    root.querySelectorAll("[data-preset]").forEach(function(button){
      button.addEventListener("click", function(){
        dial.value = button.getAttribute("data-preset") || dial.value;
        render();
      });
    });
    render();
    return {};
  }

  document.querySelectorAll("[data-day10-dial]").forEach(function(root){
    mountWhenVisible(root, function(){ return initDial(root); });
  });
})();
