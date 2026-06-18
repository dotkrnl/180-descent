(function(){
  "use strict";

  var isZh = (document.documentElement.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;

  function text(en,zh){
    return isZh ? zh : en;
  }

  function initQuestionTree(){
    var group = document.getElementById("qtree");
    if (!group) return;
    var ns = "http://www.w3.org/2000/svg";
    var cols = [
      { x: 40, n: 16 },
      { x: 160, n: 8 },
      { x: 280, n: 4 },
      { x: 400, n: 2 },
      { x: 486, n: 1 }
    ];
    var top = 42;
    var bottom = 196;
    function ys(n){
      var values = [];
      for (var i = 0; i < n; i++) {
        values.push(top + (bottom - top) * (n === 1 ? 0.5 : i / (n - 1)));
      }
      return values;
    }
    for (var c = 0; c < cols.length - 1; c++) {
      var from = ys(cols[c].n);
      var to = ys(cols[c + 1].n);
      for (var j = 0; j < to.length; j++) {
        [2 * j, 2 * j + 1].forEach(function(k){
          if (k >= from.length) return;
          var line = document.createElementNS(ns, "line");
          line.setAttribute("x1", cols[c].x);
          line.setAttribute("y1", from[k].toFixed(1));
          line.setAttribute("x2", cols[c + 1].x);
          line.setAttribute("y2", to[j].toFixed(1));
          line.setAttribute("stroke", "var(--line-strong)");
          line.setAttribute("stroke-width", "1");
          line.setAttribute("opacity", c === cols.length - 2 ? "0.9" : "0.45");
          group.appendChild(line);
        });
      }
    }
    cols.forEach(function(col,colIndex){
      ys(col.n).forEach(function(yPos){
        var circle = document.createElementNS(ns, "circle");
        var isAnswer = colIndex === cols.length - 1;
        circle.setAttribute("cx", col.x);
        circle.setAttribute("cy", yPos.toFixed(1));
        circle.setAttribute("r", isAnswer ? "6" : "3.4");
        circle.setAttribute("fill", isAnswer ? "var(--brass)" : (colIndex === 0 ? "var(--accent)" : "color-mix(in srgb,var(--accent) 55%,transparent)"));
        if (isAnswer) {
          circle.setAttribute("stroke", "var(--raised)");
          circle.setAttribute("stroke-width", "2");
        }
        group.appendChild(circle);
      });
    });
  }

  function initEntropyDial(){
    var root = document.querySelector(".information-entropy");
    if (!root) return;

    var slider = root.querySelector("#pSlider");
    var pLabel = root.querySelector("#pLabel");
    var hVal = root.querySelector("#hVal");
    var pHeads = root.querySelector("#pH");
    var pTails = root.querySelector("#pT");
    var sHeads = root.querySelector("#sH");
    var sTails = root.querySelector("#sT");
    var barHeads = root.querySelector("#barH");
    var barTails = root.querySelector("#barT");
    var verdict = root.querySelector("#entVerdict");
    var curve = root.querySelector("#entCurve");
    var dot = root.querySelector("#entDot");
    var guide = root.querySelector("#entGuide");
    if (!slider || !pLabel || !hVal || !pHeads || !pTails || !sHeads || !sTails || !barHeads || !barTails || !verdict || !curve || !dot || !guide) return;

    function entropy2(p){
      if (p <= 0 || p >= 1) return 0;
      return -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
    }

    function x(p){
      return 40 + 300 * p;
    }

    function y(h){
      return 210 - 180 * h;
    }

    function barWidth(surprise){
      var width = Math.min(100, (surprise / 6.7) * 100);
      return Math.max(2, width);
    }

    var points = [];
    for (var i = 0; i <= 200; i++) {
      var p = i / 200;
      points.push(x(p).toFixed(1) + "," + y(entropy2(p)).toFixed(1));
    }
    curve.setAttribute("points", points.join(" "));

    function render(){
      var p = Number(slider.value) / 100;
      var q = 1 - p;
      var h = entropy2(p);
      var surpriseHeads = p > 0 ? -Math.log2(p) : 0;
      var surpriseTails = q > 0 ? -Math.log2(q) : 0;
      var px = x(p);
      var py = y(h);

      pLabel.textContent = p.toFixed(2);
      hVal.textContent = h.toFixed(2);
      pHeads.textContent = p.toFixed(2);
      pTails.textContent = q.toFixed(2);
      sHeads.textContent = surpriseHeads.toFixed(2);
      sTails.textContent = surpriseTails.toFixed(2);
      barHeads.style.width = barWidth(surpriseHeads) + "%";
      barTails.style.width = barWidth(surpriseTails) + "%";
      dot.setAttribute("cx", px.toFixed(1));
      dot.setAttribute("cy", py.toFixed(1));
      guide.setAttribute("x1", px.toFixed(1));
      guide.setAttribute("x2", px.toFixed(1));
      guide.setAttribute("y2", py.toFixed(1));

      if (Math.abs(p - 0.5) < 0.02) {
        verdict.textContent = text(
          "A fair coin: every flip is a real question with no shortcut. To send 1,000 flips you need 1,000 bits; there is nothing to compress.",
          "公平硬币：每次投掷都是一道没有捷径的真实问题。发送 1,000 次投掷需要 1,000 个比特，几乎无从压缩。"
        );
      } else if (h > 0.7) {
        verdict.textContent = text(
          "Still close to balanced. Most flips carry real news, but a smart code could already shave a little off because the common face needs fewer bits.",
          "仍接近平衡。多数投掷都带来真实消息，但聪明的编码已经能略微省下一点，因为常见面需要更短的码字。"
        );
      } else if (h > 0.25) {
        verdict.textContent = text(
          "Now it is lopsided. The common outcome is cheap, the rare one expensive. A good code spends short codewords on the common face: Huffman's rule.",
          "现在已经偏斜。常见结果很便宜，稀有结果很昂贵。好的编码会把短码字留给常见面：这正是霍夫曼规则。"
        );
      } else if (h > 0.03) {
        verdict.textContent = text(
          "Almost predictable. Each flip carries only a sliver of a bit; 1,000 flips could be squeezed into a few dozen bits.",
          "几乎可以预测。每次投掷只携带一小片比特；1,000 次投掷可以压缩到几十个比特。"
        );
      } else {
        verdict.textContent = text(
          "Effectively certain. The outcome is no surprise, so it carries almost no information at all.",
          "实际上已经确定。结果毫不意外，因此几乎不携带信息。"
        );
      }
    }

    slider.addEventListener("input", render);
    root.querySelectorAll(".pbtn[data-p]").forEach(function(button){
      button.addEventListener("click", function(){
        slider.value = button.getAttribute("data-p");
        render();
      });
    });
    render();
  }

  function initLandauerMachine(){
    var root = document.querySelector(".landauer-machine");
    if (!root) return;

    var path = root.querySelector("#wellPath");
    var ball = root.querySelector("#bitBall");
    var label = root.querySelector("#ballLbl");
    var puffs = root.querySelector("#heatPuffs");
    var stepButton = root.querySelector("#lmStep");
    var copyButton = root.querySelector("#lmCopy");
    var resetButton = root.querySelector("#lmReset");
    var stateEl = root.querySelector("#lmState");
    var heatEl = root.querySelector("#lmHeat");
    var caption = root.querySelector("#lmCaption");
    if (!path || !ball || !label || !puffs || !stepButton || !copyButton || !resetButton || !stateEl || !heatEl || !caption) return;

    var doubleWell = "M20,40 C90,40 70,150 130,150 C175,150 165,70 220,70 C275,70 265,150 310,150 C370,150 350,40 420,40";
    var singleWell = "M20,40 C120,40 150,150 220,150 C290,150 320,40 420,40";
    var tiltedWell = "M20,30 C120,40 140,120 220,140 C300,158 330,150 420,165";
    var floor = 2.8;
    var stage = 0;
    var heat = 0;

    var captions = [
      text("<b>Stage 0 - a bit at rest.</b> The ball sits in the right well: this memory holds a 1. Press <b>Next step</b> to begin erasing it to 0.","「阶段 0 — 静止的比特」小球停在右侧的势阱中：此存储状态为 1。两个势阱代表两个可能的取值，它们之间的壁障维持着比特的稳定。按「下一步」开始把它擦除为 0。"),
      text("<b>Stage 1 - lower the wall.</b> The old value is no longer protected. Lowering a barrier can in principle be done gently, with no minimum energy cost.","「阶段 1 — 降下壁障」旧值不再受保护。原则上，降下势垒可以做得足够缓慢温和，不存在任何最低能耗。"),
      text("<b>Stage 2 - tilt the world left.</b> The ball is driven toward 0, pushing against thermal jostling. This is where heat begins to leak out.","「阶段 2 — 整个地貌向左倾斜」小球被推向 0，并顶住热涨落；热量正是在这里开始泄出。"),
      text("<b>Stage 3 - raise the wall, release the tilt.</b> The bit reads 0 regardless of whether it started as 0 or 1. Two possible pasts have been crushed into one present.","「阶段 3 — 升起壁障，撤去倾斜」无论它起初是 0 还是 1，现在都读作 0。两个可能的过去被压成了一个现在。"),
      text("<b>Done - one bit erased.</b> Heat dissipated has reached the Landauer floor, kT ln 2 ~= 2.8 zJ at room temperature.","「完成 — 一个比特已被擦除」散失的热量触及兰道尔底限：室温下 kT ln 2 ≈ 2.8 zJ。")
    ];

    function setBall(cx,cy){
      ball.setAttribute("cx", cx);
      ball.setAttribute("cy", cy);
      label.setAttribute("x", cx);
      label.setAttribute("y", cy + 4);
    }

    function showPuffs(show){
      puffs.setAttribute("opacity", show ? "1" : "0");
    }

    function drawPuffs(){
      var ns = "http://www.w3.org/2000/svg";
      puffs.innerHTML = "";
      for (var i = 0; i < 3; i++) {
        var circle = document.createElementNS(ns, "circle");
        circle.setAttribute("cx", 120 + i * 16);
        circle.setAttribute("cy", 60 - i * 14);
        circle.setAttribute("r", 6 - i * 1.4);
        circle.setAttribute("fill", "var(--heat)");
        circle.setAttribute("opacity", (0.5 - i * 0.12).toFixed(2));
        puffs.appendChild(circle);
      }
      var heatLabel = document.createElementNS(ns, "text");
      heatLabel.setAttribute("x", 172);
      heatLabel.setAttribute("y", 40);
      heatLabel.setAttribute("font-family", "IBM Plex Mono,monospace");
      heatLabel.setAttribute("font-size", "10");
      heatLabel.setAttribute("fill", "var(--heat)");
      heatLabel.textContent = text("heat up", "热量上升");
      puffs.appendChild(heatLabel);
    }

    function update(){
      stateEl.textContent = stage >= 3 ? "bit = 0" : "bit = 1";
      heatEl.textContent = heat.toFixed(1);
      caption.innerHTML = captions[stage];
      stepButton.disabled = stage >= 4;
      stepButton.textContent = stage >= 4 ? text("Erased", "已擦除") : text("Next step", "下一步");
    }

    function step(){
      stage += 1;
      if (stage === 1) {
        path.setAttribute("d", singleWell);
        setBall(330, 150);
        showPuffs(false);
      } else if (stage === 2) {
        path.setAttribute("d", tiltedWell);
        setBall(230, 138);
        heat = 1.3;
        showPuffs(true);
      } else if (stage === 3) {
        path.setAttribute("d", doubleWell);
        setBall(70, 138);
        label.textContent = "0";
        heat = 2.4;
        showPuffs(true);
      } else if (stage === 4) {
        heat = floor;
        showPuffs(true);
      }
      update();
    }

    stepButton.addEventListener("click", step);
    copyButton.addEventListener("click", function(){
      caption.innerHTML = text(
        "<b>Copying is free.</b> Writing this bit into a fresh blank register adds a distinction rather than destroying one, so it is logically reversible in principle. Landauer's toll is charged on erasure.",
        "「复制是免费的」把这个比特写进一个空白寄存器，是在增加一个区分，而不是毁掉一个区分，因此原则上逻辑可逆。兰道尔的过路费，只收在擦除这一步。"
      );
    });
    resetButton.addEventListener("click", function(){
      stage = 0;
      heat = 0;
      path.setAttribute("d", doubleWell);
      label.textContent = "1";
      setBall(370, 138);
      showPuffs(false);
      update();
    });

    drawPuffs();
    update();
  }

  initQuestionTree();
  initEntropyDial();
  initLandauerMachine();
})();
