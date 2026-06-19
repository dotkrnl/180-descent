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
    var calculation = root.querySelector("#entCalc");
    var verdict = root.querySelector("#entVerdict");
    var curve = root.querySelector("#entCurve");
    var dot = root.querySelector("#entDot");
    var guide = root.querySelector("#entGuide");
    if (!slider || !pLabel || !hVal || !pHeads || !pTails || !sHeads || !sTails || !barHeads || !barTails || !calculation || !verdict || !curve || !dot || !guide) return;

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
      calculation.textContent = text(
        "H = " + p.toFixed(2) + "×" + surpriseHeads.toFixed(2) + " + " + q.toFixed(2) + "×" + surpriseTails.toFixed(2) + " = " + h.toFixed(2) + " bits/flip.",
        "H = " + p.toFixed(2) + "×" + surpriseHeads.toFixed(2) + " + " + q.toFixed(2) + "×" + surpriseTails.toFixed(2) + " = " + h.toFixed(2) + " 比特/投掷。"
      );
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
    var biasedWell = "M20,42 C80,58 82,160 150,160 C220,160 250,105 320,72 C370,48 395,36 420,30";
    var floor = 2.8;
    var stage = 0;
    var heat = 0;
    var ballPos = {
      right: [310, 137],
      merged: [220, 137],
      biasedLeft: [150, 147],
      left: [130, 137]
    };

    var captions = [
      text("<b>Stage 0 - a bit at rest.</b> The ball sits in the right well: this memory holds a 1. Press <b>Next step</b> to begin erasing it to 0.","「阶段 0 — 静止的比特」小球停在右侧的势阱中：此存储状态为 1。两个势阱代表两个可能的取值，它们之间的壁障维持着比特的稳定。按「下一步」开始把它擦除为 0。"),
      text("<b>Stage 1 - lower the wall.</b> The old value is no longer protected. Lowering a barrier can in principle be done gently, with no minimum energy cost.","「阶段 1 — 降下壁障」旧值不再受保护。原则上，降下势垒可以做得足够缓慢温和，不存在任何最低能耗。"),
      text("<b>Stage 2 - bias the landscape toward 0.</b> The left well is made energetically favorable, so either possible starting state is driven toward the reset value. In an irreversible reset, the work put in is dissipated as heat.","「阶段 2 — 将地貌偏置向 0」左侧势阱在能量上变得更有利，因此任一起始状态都会被推向重置值。在不可逆重置中，输入的功会以热量形式耗散。"),
      text("<b>Stage 3 - raise the wall and remove the bias.</b> The bit reads 0 regardless of whether it started as 0 or 1. Releasing the bias does not recover the erased distinction; two possible pasts have been crushed into one present.","「阶段 3 — 升起壁障并撤去偏置」无论它起初是 0 还是 1，现在都读作 0。撤去偏置并不会恢复被擦除的区分；两个可能的过去已经被压成了一个现在。"),
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
      heatLabel.setAttribute("font-size", "10.5");
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
        setBall(ballPos.merged[0], ballPos.merged[1]);
        showPuffs(false);
      } else if (stage === 2) {
        path.setAttribute("d", biasedWell);
        setBall(ballPos.biasedLeft[0], ballPos.biasedLeft[1]);
        heat = 1.3;
        showPuffs(true);
      } else if (stage === 3) {
        path.setAttribute("d", doubleWell);
        setBall(ballPos.left[0], ballPos.left[1]);
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
      setBall(ballPos.right[0], ballPos.right[1]);
      showPuffs(false);
      update();
    });

    drawPuffs();
    update();
  }

  function initAppendixMutualInformation(){
    var root = document.querySelector(".appendix-mutual-information");
    if (!root) return;

    var slider = root.querySelector("[id$='aSlider']");
    var label = root.querySelector("[id$='aLbl']");
    var circleX = root.querySelector("[id$='cX']");
    var circleY = root.querySelector("[id$='cY']");
    var labelX = root.querySelector("[id$='lblX']");
    var labelY = root.querySelector("[id$='lblY']");
    var labelI = root.querySelector("[id$='lblI']");
    var miValue = root.querySelector("[id$='miVal']");
    var conditional = root.querySelector("[id$='hcond']");
    var caption = root.querySelector("[id$='miCap']");
    if (!slider || !label || !circleX || !circleY || !labelX || !labelY || !labelI || !miValue || !conditional || !caption) return;

    var radius = 86;
    var midpoint = 180;

    function entropyBinary(p){
      if (p <= 0 || p >= 1) return 0;
      return -(p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
    }

    function render(){
      var agreement = Number(slider.value) / 100;
      var hConditional = entropyBinary(agreement);
      var mutualInformation = 1 - hConditional;
      var distance = 2 * radius * (1 - mutualInformation);
      var x = midpoint - distance / 2;
      var y = midpoint + distance / 2;

      label.textContent = agreement.toFixed(2);
      miValue.textContent = mutualInformation.toFixed(2);
      conditional.textContent = hConditional.toFixed(2);
      circleX.setAttribute("cx", x.toFixed(1));
      circleY.setAttribute("cx", y.toFixed(1));
      labelX.setAttribute("x", (x - 40).toFixed(1));
      labelY.setAttribute("x", (y + 40).toFixed(1));
      labelI.setAttribute("opacity", mutualInformation > 0.08 ? "1" : "0");

      if (mutualInformation < 0.02) {
        caption.textContent = text(
          "Independent. The coins ignore each other; learning X leaves all of Y's uncertainty intact. The channel carries nothing.",
          "相互独立。两枚硬币互不理会；知道 X 之后，Y 的不确定性仍然完整保留。这个信道没有携带信息。"
        );
      } else if (mutualInformation < 0.4) {
        caption.textContent = text(
          "Loosely linked. X now whispers about Y: a little surprise is removed, and a little shared overlap appears.",
          "联系很弱。X 现在只是在低声提示 Y：一点惊奇被消除，一点共享重叠开始出现。"
        );
      } else if (mutualInformation < 0.9) {
        caption.textContent = text(
          "Strongly correlated. Most of Y's uncertainty collapses once you know X; the overlap is now most of each circle.",
          "强相关。知道 X 之后，Y 的大部分不确定性都会塌缩；重叠部分已经占据两个圆的大半。"
        );
      } else if (mutualInformation < 0.999) {
        caption.textContent = text(
          "Almost a perfect wire. Knowing X tells you nearly everything about Y; only a sliver of independent surprise survives.",
          "几乎是一根完美导线。知道 X 几乎就知道了 Y 的全部；只剩一丝独立惊奇还存活。"
        );
      } else {
        caption.textContent = text(
          "Identical. X and Y are the same coin. Knowing one tells you the other with certainty; I(X;Y) equals the full 1 bit.",
          "完全相同。X 与 Y 是同一枚硬币。知道一个就能确定另一个；I(X;Y) 等于完整的 1 比特。"
        );
      }
    }

    slider.addEventListener("input", render);
    render();
  }

  function initAppendixHammingCube(){
    var root = document.querySelector(".appendix-hamming-cube");
    if (!root) return;

    var edges = root.querySelector("[id$='hamEdges']");
    var vertices = root.querySelector("[id$='hamVerts']");
    var readout = root.querySelector("[id$='hamRead']");
    if (!edges || !vertices || !readout) return;

    var ns = "http://www.w3.org/2000/svg";
    var nodes = [];
    var ring = null;

    function position(b0,b1,b2){
      return { x: 80 + b0 * 135 + b2 * 60, y: 205 - b1 * 135 - b2 * 60 };
    }

    function ones(value){
      return (value & 1) + ((value >> 1) & 1) + ((value >> 2) & 1);
    }

    function decode(value){
      return ones(value) >= 2 ? 7 : 0;
    }

    function codeword(value){
      return value === 0 ? "000" : "111";
    }

    function vertexRadius(value){
      return value === 0 || value === 7 ? 18 : 16;
    }

    function addSvg(name){
      return document.createElementNS(ns, name);
    }

    for (var value = 0; value < 8; value++) {
      var b0 = value & 1;
      var b1 = (value >> 1) & 1;
      var b2 = (value >> 2) & 1;
      var pos = position(b0, b1, b2);
      nodes.push({ value: value, x: pos.x, y: pos.y, label: "" + b2 + b1 + b0 });
    }

    for (var i = 0; i < 8; i++) {
      for (var j = i + 1; j < 8; j++) {
        var diff = i ^ j;
        if (diff === 1 || diff === 2 || diff === 4) {
          var dx = nodes[j].x - nodes[i].x;
          var dy = nodes[j].y - nodes[i].y;
          var distance = Math.sqrt(dx * dx + dy * dy) || 1;
          var startOffset = vertexRadius(nodes[i].value) + 2;
          var endOffset = vertexRadius(nodes[j].value) + 2;
          var line = addSvg("line");
          line.setAttribute("x1", (nodes[i].x + dx / distance * startOffset).toFixed(1));
          line.setAttribute("y1", (nodes[i].y + dy / distance * startOffset).toFixed(1));
          line.setAttribute("x2", (nodes[j].x - dx / distance * endOffset).toFixed(1));
          line.setAttribute("y2", (nodes[j].y - dy / distance * endOffset).toFixed(1));
          edges.appendChild(line);
        }
      }
    }

    function select(node){
      if (ring) ring.remove();
      var decoded = decode(node.value);
      var distance = ones(node.value ^ decoded);
      var decodedWord = codeword(decoded);
      ring = addSvg("circle");
      ring.setAttribute("cx", node.x);
      ring.setAttribute("cy", node.y);
      ring.setAttribute("r", node.value === 0 || node.value === 7 ? "24" : "22");
      ring.setAttribute("fill", "none");
      ring.setAttribute("stroke", decoded === 0 ? "var(--accent)" : "var(--brass)");
      ring.setAttribute("stroke-width", "2.5");
      ring.setAttribute("stroke-dasharray", "3 3");
      vertices.appendChild(ring);

      if (node.value === 0 || node.value === 7) {
        readout.innerHTML = text(
          "<b>Received <code>" + node.label + "</code>: already a valid codeword.</b> No error to correct; it decodes to itself.",
          "<b>收到 <code>" + node.label + "</code>：它已经是有效码字。</b>无需纠错；它解码为自身。"
        );
      } else {
        readout.innerHTML = text(
          "<b>Received <code>" + node.label + "</code>: not a valid codeword.</b> It is " + distance + " flip" + (distance > 1 ? "s" : "") + " from <code>" + decodedWord + "</code>, so majority vote decodes it to <code>" + decodedWord + "</code>.",
          "<b>收到 <code>" + node.label + "</code>：它不是有效码字。</b>它距离 <code>" + decodedWord + "</code> 为 " + distance + " 次翻转，因此多数表决把它解码为 <code>" + decodedWord + "</code>。"
        );
      }
    }

    nodes.forEach(function(node){
      var group = addSvg("g");
      var circle = addSvg("circle");
      var label = addSvg("text");
      var decoded = decode(node.value);
      var fill = node.value === 0 || node.value === 7
        ? "var(--accent)"
        : (decoded === 0 ? "color-mix(in srgb,var(--accent) 38%,transparent)" : "color-mix(in srgb,var(--brass) 55%,transparent)");

      circle.setAttribute("class", "vx");
      circle.setAttribute("cx", node.x);
      circle.setAttribute("cy", node.y);
      circle.setAttribute("r", vertexRadius(node.value));
      circle.setAttribute("fill", fill);
      circle.setAttribute("stroke", "var(--raised)");
      circle.setAttribute("stroke-width", "2.5");
      label.setAttribute("x", node.x);
      label.setAttribute("y", node.y + 4);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("font-family", "IBM Plex Mono,monospace");
      label.setAttribute("font-size", "11");
      label.setAttribute("font-weight", "600");
      label.setAttribute("fill", node.value === 0 || node.value === 7 ? "#fff" : "var(--ink)");
      label.setAttribute("pointer-events", "none");
      label.textContent = node.label;
      group.setAttribute("role", "button");
      group.setAttribute("tabindex", "0");
      group.setAttribute("aria-label", text("Decode received word " + node.label, "解码收到的码字 " + node.label));
      group.appendChild(circle);
      group.appendChild(label);
      group.addEventListener("click", function(){ select(node); });
      group.addEventListener("keydown", function(event){
        if (event.key === "Enter" || event.key === " " || event.key === "Spacebar") {
          event.preventDefault();
          select(node);
        }
      });
      vertices.appendChild(group);
    });
  }

  initQuestionTree();
  initEntropyDial();
  initLandauerMachine();
  initAppendixMutualInformation();
  initAppendixHammingCube();
})();
