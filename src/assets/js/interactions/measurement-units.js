(function(){
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  function one(root, selector){ return root.querySelector(selector); }
  function all(root, selector){ return Array.prototype.slice.call(root.querySelectorAll(selector)); }
  function zh(root){ return root.getAttribute("data-locale") === "zh"; }
  function local(root, english, chinese){ return zh(root) ? chinese : english; }
  function clear(node){ while (node && node.firstChild) node.removeChild(node.firstChild); }
  function clamp(value, min, max){ return Math.max(min, Math.min(max, value)); }

  function element(name, attrs){
    var node = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(function(key){ node.setAttribute(key, String(attrs[key])); });
    return node;
  }

  function append(parent, name, attrs){
    var node = element(name, attrs);
    parent.appendChild(node);
    return node;
  }

  function label(parent, x, y, value, options){
    var opts = options || {};
    var node = append(parent, "text", {
      x: x,
      y: y,
      "text-anchor": opts.anchor || "middle",
      "font-family": opts.font || "IBM Plex Mono, monospace",
      "font-size": opts.size || 11,
      "font-weight": opts.weight || 500,
      fill: opts.fill || "var(--ink-soft)"
    });
    node.textContent = value;
    return node;
  }

  function setPressed(buttons, active){
    buttons.forEach(function(button){ button.setAttribute("aria-pressed", button === active ? "true" : "false"); });
  }

  function mountWhenVisible(root, initializer){
    var controls = null;
    function ensure(){ if (!controls) controls = initializer(root) || {}; }
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

  function initLedger(root){
    var entries = [
      {
        unit: "m", nameEn: "Speed of light, c", nameZh: "光速 c", pre: true, post: true,
        preEn: "299 792 458 m/s — exact since 1983", preZh: "299 792 458 m/s——自 1983 年起为精确值",
        postEn: "299 792 458 m/s — still exact", postZh: "299 792 458 m/s——仍为精确值"
      },
      {
        unit: "s", nameEn: "Caesium frequency, ΔνCs", nameZh: "铯频率 ΔνCs", pre: true, post: true,
        preEn: "9 192 631 770 Hz — exact since 1967", preZh: "9 192 631 770 Hz——自 1967 年起为精确值",
        postEn: "9 192 631 770 Hz — still exact", postZh: "9 192 631 770 Hz——仍为精确值"
      },
      {
        unit: "cd", nameEn: "Luminous efficacy, Kcd", nameZh: "发光效能 Kcd", pre: true, post: true,
        preEn: "683 lm/W — exact since 1979", preZh: "683 lm/W——自 1979 年起为精确值",
        postEn: "683 lm/W — still exact", postZh: "683 lm/W——仍为精确值"
      },
      {
        unit: "kg", nameEn: "Planck constant, h", nameZh: "普朗克常数 h", pre: false, post: true, moved: true,
        preEn: "6.626 070 040(81)×10⁻³⁴ J·s — measured; uᵣ 1.2×10⁻⁸", preZh: "6.626 070 040(81)×10⁻³⁴ J·s——测得值；uᵣ 1.2×10⁻⁸",
        postEn: "6.626 070 15×10⁻³⁴ J·s — exact", postZh: "6.626 070 15×10⁻³⁴ J·s——精确值"
      },
      {
        unit: "kg", nameEn: "Mass of Le Grand K", nameZh: "国际千克原器的质量", pre: true, post: false, moved: true,
        preEn: "1 kg, exactly, by definition", preZh: "按定义恰为 1 kg",
        postEn: "1 kg ± about 10 µg — now measurable", postZh: "1 kg ± 约 10 µg——如今可以测量"
      },
      {
        unit: "A", nameEn: "Elementary charge, e", nameZh: "元电荷 e", pre: false, post: true, moved: true,
        preEn: "1.602 176 6208(98)×10⁻¹⁹ C — measured; uᵣ 6.1×10⁻⁹", preZh: "1.602 176 6208(98)×10⁻¹⁹ C——测得值；uᵣ 6.1×10⁻⁹",
        postEn: "1.602 176 634×10⁻¹⁹ C — exact", postZh: "1.602 176 634×10⁻¹⁹ C——精确值"
      },
      {
        unit: "A", nameEn: "Vacuum permeability, μ₀", nameZh: "真空磁导率 μ₀", pre: true, post: false, moved: true,
        preEn: "4π×10⁻⁷ N/A² — exact", preZh: "4π×10⁻⁷ N/A²——精确值",
        postEn: "1.256 637 061 27(20)×10⁻⁶ N/A² — measured; uᵣ 1.6×10⁻¹⁰", postZh: "1.256 637 061 27(20)×10⁻⁶ N/A²——测得值；uᵣ 1.6×10⁻¹⁰"
      },
      {
        unit: "K", nameEn: "Boltzmann constant, k", nameZh: "玻尔兹曼常数 k", pre: false, post: true, moved: true,
        preEn: "1.380 648 52(79)×10⁻²³ J/K — measured; uᵣ 5.7×10⁻⁷", preZh: "1.380 648 52(79)×10⁻²³ J/K——测得值；uᵣ 5.7×10⁻⁷",
        postEn: "1.380 649×10⁻²³ J/K — exact", postZh: "1.380 649×10⁻²³ J/K——精确值"
      },
      {
        unit: "K", nameEn: "Triple point of water", nameZh: "水的三相点", pre: true, post: false, moved: true,
        preEn: "273.16 K — exact", preZh: "273.16 K——精确值",
        postEn: "273.1600 K ± 0.0001 K — measured", postZh: "273.1600 K ± 0.0001 K——测得值"
      },
      {
        unit: "mol", nameEn: "Avogadro constant, NA", nameZh: "阿伏伽德罗常数 NA", pre: false, post: true, moved: true,
        preEn: "6.022 140 857(74)×10²³ mol⁻¹ — measured; uᵣ 1.2×10⁻⁸", preZh: "6.022 140 857(74)×10²³ mol⁻¹——测得值；uᵣ 1.2×10⁻⁸",
        postEn: "6.022 140 76×10²³ mol⁻¹ — exact", postZh: "6.022 140 76×10²³ mol⁻¹——精确值"
      },
      {
        unit: "mol", nameEn: "Molar mass of carbon-12", nameZh: "碳-12 的摩尔质量", pre: true, post: false, moved: true,
        preEn: "12 g/mol — exact", preZh: "12 g/mol——精确值",
        postEn: "12.000 000 0126(37) g/mol — measured; uᵣ 3.1×10⁻¹⁰", postZh: "12.000 000 0126(37) g/mol——测得值；uᵣ 3.1×10⁻¹⁰"
      }
    ];
    var exactList = one(root, '[data-role="exact-list"]');
    var measuredList = one(root, '[data-role="measured-list"]');
    var exactCount = one(root, '[data-out="exact-count"]');
    var measuredCount = one(root, '[data-out="measured-count"]');
    var verdictTitle = one(root, '[data-out="verdict-title"]');
    var verdictText = one(root, '[data-out="verdict-text"]');
    var buttons = all(root, "[data-era]");
    var era = "pre";

    function makeItem(entry){
      var item = document.createElement("article");
      item.className = "day13-ledger-item" + (entry.moved ? " is-moved" : "");
      var heading = document.createElement("h5");
      heading.textContent = zh(root) ? entry.nameZh : entry.nameEn;
      var badge = document.createElement("span");
      badge.className = "day13-unit-badge";
      badge.textContent = entry.unit;
      heading.appendChild(badge);
      var value = document.createElement("p");
      value.textContent = entry[era + (zh(root) ? "Zh" : "En")];
      item.appendChild(heading);
      item.appendChild(value);
      return item;
    }

    function render(){
      clear(exactList);
      clear(measuredList);
      var exact = 0;
      var measured = 0;
      entries.forEach(function(entry){
        if (entry[era]) {
          exactList.appendChild(makeItem(entry));
          exact += 1;
        } else {
          measuredList.appendChild(makeItem(entry));
          measured += 1;
        }
      });
      exactCount.textContent = String(exact);
      measuredCount.textContent = String(measured);
      setPressed(buttons, buttons.filter(function(button){ return button.getAttribute("data-era") === era; })[0]);
      if (era === "pre") {
        verdictTitle.textContent = local(root, "Before the reform", "改革之前");
        verdictText.textContent = local(root,
          "Mass, current, temperature, and amount of substance were exact because their physical anchors were definitions. The corresponding constants h, e, k, and NA therefore had to be measured against them.",
          "质量、电流、温度和物质的量之所以精确，是因为实物或实验情形本身就是定义；相应的 h、e、k 与 NA 则必须通过测量获得。"
        );
      } else {
        verdictTitle.textContent = local(root, "After the reform — the counts do not change", "改革之后——数量没有改变");
        verdictText.textContent = local(root,
          "Still seven exact and four uncertain. Four constants became exact; four former anchors became measurable quantities with uncertainty. The reform placed uncertainty where it causes less systemic risk.",
          "仍是七项精确、四项带有不确定度。四个常数成为精确值，四个旧锚点则成为可测且带有不确定度的量。改革把不确定度放到了系统风险更低的位置。"
        );
      }
    }

    buttons.forEach(function(button){
      button.addEventListener("click", function(){ era = button.getAttribute("data-era"); render(); });
    });
    render();
  }

  function initKibble(root){
    var svg = one(root, '[data-role="diagram"]');
    var buttons = all(root, "[data-mode]");
    var equationWeigh = one(root, '[data-role="equation-weigh"]');
    var equationVelocity = one(root, '[data-role="equation-velocity"]');
    var verdict = one(root, '[data-out="verdict"]');
    var mode = "weighing";

    function draw(){
      var weighing = mode === "weighing";
      clear(svg);
      append(svg, "rect", { x: 1, y: 1, width: 658, height: 338, rx: 13, fill: "var(--paper)", stroke: "var(--line-strong)", "stroke-width": 2 });
      append(svg, "line", { x1: 165, y1: 72, x2: 495, y2: 72, stroke: "var(--ink)", "stroke-width": 4, "stroke-linecap": "round" });
      append(svg, "polygon", { points: "330,80 315,108 345,108", fill: "var(--ink-faint)" });
      append(svg, "circle", { cx: 330, cy: 72, r: 6, fill: "var(--ink)" });
      label(svg, 330, 128, local(root, "pivot", "支点"), { size: 10.5, fill: "var(--ink-faint)" });

      append(svg, "rect", { x: 112, y: 154, width: 32, height: 122, rx: 3, fill: "var(--raised)", stroke: "var(--line-strong)", "stroke-width": 2 });
      append(svg, "rect", { x: 188, y: 154, width: 32, height: 122, rx: 3, fill: "var(--raised)", stroke: "var(--line-strong)", "stroke-width": 2 });
      append(svg, "rect", { x: 112, y: 274, width: 108, height: 18, rx: 3, fill: "var(--raised)", stroke: "var(--line-strong)", "stroke-width": 2 });
      label(svg, 128, 147, "N", { size: 11, fill: "var(--ink-faint)" });
      label(svg, 204, 147, "S", { size: 11, fill: "var(--ink-faint)" });
      [178, 240].forEach(function(y){
        append(svg, "line", { x1: 149, y1: y, x2: 183, y2: y, stroke: "var(--brass)", "stroke-width": 2 });
        append(svg, "polygon", { points: "183," + y + " 175," + (y - 4) + " 175," + (y + 4), fill: "var(--brass)" });
      });
      label(svg, 166, 311, local(root, "field B (unknown)", "磁场 B（未知）"), { size: 10.5, fill: "var(--brass)" });

      var coilY = weighing ? 204 : 182;
      append(svg, "line", { x1: 166, y1: 72, x2: 166, y2: coilY, stroke: "var(--ink-soft)", "stroke-width": 2 });
      append(svg, "rect", { x: 146, y: coilY, width: 40, height: 24, rx: 4, fill: "var(--raised)", stroke: "var(--accent)", "stroke-width": 3 });
      [154, 160, 166, 172, 178].forEach(function(x){ append(svg, "line", { x1: x, y1: coilY, x2: x, y2: coilY + 24, stroke: "var(--accent)", "stroke-width": 1 }); });
      label(svg, 166, coilY + 43, local(root, "coil · length L", "线圈 · 长度 L"), { size: 10.5, fill: "var(--accent)" });

      append(svg, "line", { x1: 492, y1: 72, x2: 492, y2: 164, stroke: "var(--ink-soft)", "stroke-width": 2 });
      append(svg, "rect", { x: 450, y: 164, width: 84, height: 66, rx: 8, fill: "var(--raised)", stroke: "var(--line-strong)", "stroke-width": 2, opacity: weighing ? 1 : 0.22 });
      label(svg, 492, 192, "1 kg", { size: 19, weight: 700, fill: "var(--ink)" });
      label(svg, 492, 214, local(root, "test mass", "待测质量"), { size: 10.5, fill: "var(--ink-faint)" });

      if (weighing) {
        append(svg, "line", { x1: 218, y1: 222, x2: 218, y2: 174, stroke: "var(--accent)", "stroke-width": 3 });
        append(svg, "polygon", { points: "218,164 212,177 224,177", fill: "var(--accent)" });
        label(svg, 240, 184, "BLI", { anchor: "start", size: 13, weight: 700, fill: "var(--accent)" });
        append(svg, "line", { x1: 554, y1: 175, x2: 554, y2: 224, stroke: "var(--contested)", "stroke-width": 3 });
        append(svg, "polygon", { points: "554,234 548,221 560,221", fill: "var(--contested)" });
        label(svg, 570, 216, "mg", { anchor: "start", size: 13, weight: 700, fill: "var(--contested)" });
        label(svg, 330, 306, local(root, "electromagnetic force balances weight", "电磁力与重力平衡"), { size: 12, fill: "var(--ink-soft)" });
        verdict.textContent = local(root,
          "Weighing mode gives mg = BLI, but B and L are too difficult to determine accurately enough on their own.",
          "称量模式给出 mg = BLI，但单独测定 B 与 L 无法达到所需准确度。"
        );
      } else {
        append(svg, "line", { x1: 234, y1: 225, x2: 234, y2: 167, stroke: "var(--contested)", "stroke-width": 3 });
        append(svg, "polygon", { points: "234,157 228,170 240,170", fill: "var(--contested)" });
        label(svg, 252, 171, local(root, "move at v", "以速度 v 移动"), { anchor: "start", size: 12, weight: 700, fill: "var(--contested)" });
        append(svg, "path", { d: "M145 235 Q105 252 82 224", fill: "none", stroke: "var(--accent)", "stroke-width": 2.5 });
        label(svg, 80, 211, local(root, "induced U", "感应电压 U"), { size: 11, fill: "var(--accent)" });
        label(svg, 330, 306, local(root, "the same BL appears in the induced voltage", "同一个 BL 出现在感应电压中"), { size: 12, fill: "var(--ink-soft)" });
        verdict.textContent = local(root,
          "Velocity mode gives U = BLv. Divide the two mode equations and BL cancels: mgv = UI, linking mechanical power to electrical power.",
          "速度模式给出 U = BLv。联立两个模式的方程后，BL 被消去：mgv = UI，机械功率由此与电功率相连。"
        );
      }
      equationWeigh.classList.toggle("is-active", weighing);
      equationVelocity.classList.toggle("is-active", !weighing);
      setPressed(buttons, buttons.filter(function(button){ return button.getAttribute("data-mode") === mode; })[0]);
    }

    buttons.forEach(function(button){ button.addEventListener("click", function(){ mode = button.getAttribute("data-mode"); draw(); }); });
    draw();
  }

  function initAlpha(root){
    var svg = one(root, '[data-role="plot"]');
    var button = one(root, '[data-action="audit"]');
    var title = one(root, '[data-out="verdict-title"]');
    var text = one(root, '[data-out="verdict-text"]');
    var audited = false;
    var rows = [
      { en: "Optical clocks (Yb⁺)", zh: "光学钟（Yb⁺）", noteEn: "26-month laboratory baseline", noteZh: "26 个月实验室基线", x: 286, value: "1.8 ± 2.5×10⁻¹⁹ / yr" },
      { en: "Oklo natural reactor", zh: "奥克洛天然反应堆", noteEn: "1.8 billion years", noteZh: "18 亿年基线", x: 407, value: "≤ 5×10⁻¹⁷ / yr" },
      { en: "Quasars — modern null", zh: "类星体——现代零结果", noteEn: "about 10 billion years", noteZh: "约 100 亿年基线", x: 432, value: "0.3 ± 1.4 ppm" },
      { en: "Quasars — 2011 dipole", zh: "类星体——2011 年偶极", noteEn: "roughly 300 systems · Keck + VLT", noteZh: "约 300 个系统 · Keck + VLT", x: 465, value: "amplitude ≈ 0.97×10⁻⁵" },
      { en: "CMB (Planck)", zh: "宇宙微波背景（Planck）", noteEn: "13.8 billion years", noteZh: "138 亿年基线", x: 612, value: "(3.6 ± 3.7)×10⁻³" }
    ];

    function draw(){
      clear(svg);
      append(svg, "rect", { x: 1, y: 1, width: 658, height: 408, rx: 13, fill: "var(--paper)", stroke: "var(--line-strong)", "stroke-width": 2 });
      var axisY = 350;
      append(svg, "line", { x1: 214, y1: axisY, x2: 640, y2: axisY, stroke: "var(--ink-faint)", "stroke-width": 1.5 });
      var powers = ["10⁻²⁰", "10⁻¹⁹", "10⁻¹⁸", "10⁻¹⁷", "10⁻¹⁶", "10⁻¹⁵", "10⁻¹⁴", "10⁻¹³", "10⁻¹²"];
      for (var tick = 0; tick <= 8; tick += 1) {
        var x = 214 + tick * 53.25;
        append(svg, "line", { x1: x, y1: axisY, x2: x, y2: axisY + 6, stroke: "var(--ink-faint)", "stroke-width": 1 });
        label(svg, x, axisY + 20, powers[tick], { size: 10.5, fill: "var(--ink-faint)" });
      }
      label(svg, 427, 394, local(root, "allowed |α̇/α| per year · logarithmic scale", "允许的 |α̇/α| 年漂移率 · 对数尺度"), { size: 10.5, fill: "var(--ink-soft)" });
      label(svg, 214, 378, local(root, "← zero drift", "← 零漂移"), { anchor: "start", size: 10.5, fill: "var(--ok)" });

      rows.forEach(function(row, index){
        var y = 62 + index * 56;
        var rowName = zh(root) ? row.zh : row.en;
        var rowNote = zh(root) ? row.noteZh : row.noteEn;
        if (index === 3 && audited) {
          rowName = local(root, "Quasars — dipole audited", "类星体——经审计的偶极");
          rowNote = local(root, "after the 2015 spectrograph audit", "经 2015 年光谱仪审计");
        }
        label(svg, 12, y, rowName, { anchor: "start", size: 10.5, weight: 600, fill: "var(--ink)" });
        label(svg, 12, y + 14, rowNote, { anchor: "start", size: 10.5, fill: "var(--ink-faint)" });
        if (index !== 3) {
          append(svg, "rect", { x: 214, y: y - 1, width: row.x - 214, height: 10, rx: 3, fill: "var(--accent)", opacity: 0.35, stroke: "var(--accent)", "stroke-width": 1.5 });
          append(svg, "line", { x1: row.x, y1: y - 7, x2: row.x, y2: y + 15, stroke: "var(--accent)", "stroke-width": 2 });
        }
        if (index === 3 && !audited) {
          append(svg, "polygon", { points: "465," + (y - 7) + " 473," + (y + 1) + " 465," + (y + 9) + " 457," + (y + 1), fill: "var(--contested)" });
          label(svg, 482, y + 5, row.value + " (≈4σ)", { anchor: "start", size: 10.5, fill: "var(--contested)" });
        } else if (index === 3 && audited) {
          append(svg, "rect", { x: 438, y: y - 12, width: 40, height: 30, rx: 3, fill: "var(--ink-faint)", opacity: 0.12, stroke: "var(--ink-faint)", "stroke-dasharray": "3 3" });
          append(svg, "polygon", { points: "465," + (y - 7) + " 473," + (y + 1) + " 465," + (y + 9) + " 457," + (y + 1), fill: "var(--contested)", opacity: 0.28 });
          label(svg, 484, y - 9, local(root, "distortion comparable to claim", "畸变与所宣称信号相当"), { anchor: "start", size: 10.5, fill: "var(--ink-faint)" });
          label(svg, 484, y + 9, local(root, "claim not established", "该主张未获确立"), { anchor: "start", size: 10.5, fill: "var(--contested)" });
        } else {
          label(svg, clamp(row.x + 9, 300, 625), y + 6, row.value, { anchor: row.x > 560 ? "end" : "start", size: 10.5, fill: "var(--accent)" });
        }
      });

      button.setAttribute("aria-pressed", audited ? "true" : "false");
      button.textContent = audited
        ? local(root, "Show it as originally published", "恢复 2011 年原始发表状态")
        : local(root, "Apply the 2015 systematics audit", "应用 2015 年系统误差审计");
      if (audited) {
        title.textContent = local(root, "After the 2015 instrument audit", "2015 年仪器审计之后");
        text.textContent = local(root,
          "Supercalibration revealed long-range wavelength distortions in both spectrographs, comparable in size to the claimed signal and absent from the original error budget. The audit means this historical claim is not established; the separate modern row shows null results from better-calibrated instruments.",
          "超级校准在两台光谱仪中都发现了长程波长畸变，其量级与所宣称的信号相当，却未进入原始误差预算。审计说明这项历史主张未获确立；上方独立的现代观测行展示校准更充分的仪器所得的零结果。"
        );
        one(root, '[data-role="verdict"]').classList.add("is-contested");
        one(root, '[data-role="verdict"]').classList.remove("is-ok");
      } else {
        title.textContent = local(root, "As published in 2011", "2011 年发表时的结论");
        text.textContent = local(root,
          "The reported spatial dipole had an amplitude near 0.97×10⁻⁵ and a significance near four sigma. Within the published error budget, it looked like a detection.",
          "报告的空间偶极振幅约为 0.97×10⁻⁵，显著性接近 4σ。按照论文当时的误差预算，它看起来像一次探测。"
        );
        one(root, '[data-role="verdict"]').classList.add("is-contested");
        one(root, '[data-role="verdict"]').classList.remove("is-ok");
      }
    }

    button.addEventListener("click", function(){ audited = !audited; draw(); });
    draw();
  }

  function initLineage(root){
    var data = {
      metre: {
        verdictEn: "The digits 299 792 458 preserve the measured value of light in the previous metre. That metre inherited the krypton wavelength, the prototype bar, and ultimately the Delambre–Méchain meridian survey.",
        verdictZh: "299 792 458 这组数字保存了光在旧米制下的测量值。旧米又继承自氪波长、米原器，最终追溯到德朗布尔—梅尚子午线测量。",
        layers: [
          ["1983 — today", "c ≡ 299 792 458 m/s, exactly", "The measured value was frozen so the new metre matched the old one.", "absorb"],
          ["1960", "1 650 763.73 krypton-86 wavelengths", "Chosen to match the 1889 prototype bar."],
          ["1889", "International Prototype Metre", "Platinum-iridium bar, copied from the Mètre des Archives."],
          ["1799", "Mètre des Archives", "Cut from the Delambre–Méchain survey."],
          ["1792–98 · BEDROCK", "Dunkirk–Barcelona meridian survey", "The inherited geodetic mismatch remains inside today's metre.", "fossil"]
        ],
        layersZh: [
          ["1983 年至今", "c ≡ 299 792 458 m/s，精确值", "冻结当时的测量值，使新米与旧米连续。", "absorb"],
          ["1960 年", "1 650 763.73 个氪-86 波长", "数值用来匹配 1889 年米原器。"],
          ["1889 年", "国际米原器", "铂铱合金标尺，复制自档案米。"],
          ["1799 年", "档案米", "依据德朗布尔—梅尚测量制作。"],
          ["1792–1798 年 · 基岩", "敦刻尔克—巴塞罗那子午线测量", "当年的大地测量偏差仍埋在今天的米中。", "fossil"]
        ]
      },
      kilogram: {
        verdictEn: "The digits of h preserve continuity with Le Grand K, which was made to match the Kilogramme des Archives, which was intended to match a cubic decimetre of water.",
        verdictZh: "h 的数字保持了与国际千克原器的连续性；原器复制自档案千克，而档案千克原本要等于一立方分米水的质量。",
        layers: [
          ["2019", "h ≡ 6.626 070 15×10⁻³⁴ J·s, exactly", "The measured value was frozen so the new kilogram matched Le Grand K.", "absorb"],
          ["1889", "Le Grand K", "Platinum-iridium cylinder made to match the Kilogramme des Archives."],
          ["1799", "Kilogramme des Archives", "A platinum cylinder representing a cubic decimetre of water."],
          ["1793–99 · BEDROCK", "Water weighed near 4 °C", "A revolutionary-era bucket remains inside the digits of h.", "fossil"]
        ],
        layersZh: [
          ["2019 年", "h ≡ 6.626 070 15×10⁻³⁴ J·s，精确值", "冻结测量值，使新千克与国际千克原器连续。", "absorb"],
          ["1889 年", "国际千克原器", "按档案千克制作的铂铱合金圆柱。"],
          ["1799 年", "档案千克", "代表一立方分米水质量的铂圆柱。"],
          ["1793–1799 年 · 基岩", "在约 4 °C 下称量水", "革命时期的一桶水仍埋在 h 的数字中。", "fossil"]
        ]
      },
      second: {
        verdictEn: "The caesium number came from a 1958 comparison with Ephemeris Time: 9 192 631 770 ± 20 cycles. In 1967 the error bar was discarded and the central value became exact.",
        verdictZh: "铯频率数值来自 1958 年与历书时的比较：9 192 631 770 ± 20 周。1967 年，误差条被舍弃，中心值成为精确值。",
        layers: [
          ["1967 — today", "ΔνCs ≡ 9 192 631 770 Hz, exactly", "The ±20-cycle measurement uncertainty below was absorbed into the definition.", "absorb"],
          ["1958", "Caesium frequency measured", "9 192 631 770 ± 20 cycles against Ephemeris Time."],
          ["1960", "Ephemeris second", "A fraction of the computed tropical year 1900."],
          ["1954–58 · BEDROCK", "Moon photographs and Newcomb's solar tables", "The atomic second inherited an astronomical timescale.", "fossil"]
        ],
        layersZh: [
          ["1967 年至今", "ΔνCs ≡ 9 192 631 770 Hz，精确值", "下层测量中的 ±20 周不确定度被吸收到定义中。", "absorb"],
          ["1958 年", "测量铯频率", "相对于历书时得到 9 192 631 770 ± 20 周。"],
          ["1960 年", "历书秒", "计算得到的 1900 年回归年的一个分数。"],
          ["1954–1958 年 · 基岩", "月球照片与纽康太阳表", "原子秒继承了一套天文时间尺度。", "fossil"]
        ]
      }
    };
    var container = one(root, '[data-role="strata"]');
    var verdict = one(root, '[data-out="verdict"]');
    var buttons = all(root, "[data-unit]");
    var unit = "metre";

    function render(){
      var selected = data[unit];
      var layers = zh(root) ? selected.layersZh : selected.layers;
      clear(container);
      layers.forEach(function(layer, index){
        var article = document.createElement("article");
        article.className = "day13-stratum " + (layer[3] || "");
        var year = document.createElement("p");
        year.className = "day13-stratum-year";
        year.textContent = layer[0];
        var heading = document.createElement("h4");
        heading.textContent = layer[1];
        var note = document.createElement("p");
        note.textContent = layer[2];
        article.appendChild(year);
        article.appendChild(heading);
        article.appendChild(note);
        container.appendChild(article);
        if (index < layers.length - 1) {
          var inherits = document.createElement("p");
          inherits.className = "day13-inherits";
          inherits.textContent = local(root, "↓ inherits its value from ↓", "↓ 数值继承自 ↓");
          container.appendChild(inherits);
        }
      });
      verdict.textContent = zh(root) ? selected.verdictZh : selected.verdictEn;
      setPressed(buttons, buttons.filter(function(button){ return button.getAttribute("data-unit") === unit; })[0]);
    }

    buttons.forEach(function(button){ button.addEventListener("click", function(){ unit = button.getAttribute("data-unit"); render(); }); });
    render();
  }

  function initQuantumHall(root){
    var RK = 25812.8074593045;
    var range = one(root, '[data-role="disorder"]');
    var output = one(root, '[data-out="disorder"]');
    var svg = one(root, '[data-role="plot"]');
    var title = one(root, '[data-out="verdict-title"]');
    var text = one(root, '[data-out="verdict-text"]');
    var readout = one(root, '[data-role="verdict"]');
    var BMIN = 1;
    var BMAX = 10;
    var RMAX = 27500;
    function xFor(field){ return 70 + (field - BMIN) / (BMAX - BMIN) * 555; }
    function yFor(resistance){ return 330 - resistance / RMAX * 285; }

    function hallResistance(field, disorder){
      var index = Math.max(1, Math.round(BMAX / field));
      var center = BMAX / index;
      var plateau = RK / index;
      var lowerCenter = BMAX / (index + 1);
      var lowerHalf = (center - lowerCenter) / 2;
      var upperHalf = index === 1 ? 999 : (BMAX / (index - 1) - center) / 2;
      var width = (field >= center ? upperHalf : lowerHalf) * disorder;
      if (Math.abs(field - center) <= width) return plateau;
      if (field > center) {
        var upperIndex = index - 1;
        if (upperIndex < 1) return plateau;
        var upperCenter = BMAX / upperIndex;
        var upperWidth = disorder * (upperCenter - center) / 2;
        var start = center + width;
        var end = upperCenter - upperWidth;
        if (end <= start) return field < (center + upperCenter) / 2 ? plateau : RK / upperIndex;
        return plateau + (field - start) / (end - start) * (RK / upperIndex - plateau);
      }
      var lowerIndex = index + 1;
      var lowerWidth = disorder * (center - lowerCenter) / 2;
      var startLower = lowerCenter + lowerWidth;
      var endLower = center - width;
      if (endLower <= startLower) return field < (lowerCenter + center) / 2 ? RK / lowerIndex : plateau;
      return RK / lowerIndex + (field - startLower) / (endLower - startLower) * (plateau - RK / lowerIndex);
    }

    function draw(){
      var disorder = Number(range.value) / 100;
      output.textContent = range.value + "%";
      range.setAttribute("aria-valuetext", range.value + "%");
      clear(svg);
      append(svg, "rect", { x: 1, y: 1, width: 658, height: 398, rx: 13, fill: "var(--paper)", stroke: "var(--line-strong)", "stroke-width": 2 });
      for (var index = 1; index <= 6; index += 1) {
        var guideY = yFor(RK / index);
        append(svg, "line", { x1: 70, y1: guideY, x2: 625, y2: guideY, stroke: "var(--line)", "stroke-width": 1, "stroke-dasharray": "3 4" });
        label(svg, 634, guideY + 3, "i=" + index, { anchor: "start", size: 10.5, fill: "var(--ink-faint)" });
      }
      append(svg, "line", { x1: 70, y1: 330, x2: 625, y2: 330, stroke: "var(--ink-faint)", "stroke-width": 1.5 });
      append(svg, "line", { x1: 70, y1: 40, x2: 70, y2: 330, stroke: "var(--ink-faint)", "stroke-width": 1.5 });
      label(svg, 350, 370, local(root, "magnetic field B →", "磁场 B →"), { size: 10.5, fill: "var(--ink-soft)" });
      var yAxis = label(svg, 23, 185, local(root, "Hall resistance R", "霍尔电阻 R"), { size: 10.5, fill: "var(--ink-soft)" });
      yAxis.setAttribute("transform", "rotate(-90 23 185)");
      append(svg, "line", { x1: 70, y1: 303, x2: 625, y2: 58, stroke: "var(--ink-faint)", "stroke-width": 1.5, "stroke-dasharray": "5 5", opacity: 0.7 });
      label(svg, 560, 82, local(root, "classical", "经典预测"), { size: 10.5, fill: "var(--ink-faint)" });
      var points = [];
      for (var sample = 0; sample <= 520; sample += 1) {
        var field = BMIN + (BMAX - BMIN) * sample / 520;
        points.push(xFor(field).toFixed(1) + "," + yFor(hallResistance(field, disorder * 0.98)).toFixed(1));
      }
      append(svg, "path", { d: "M" + points.join(" L"), fill: "none", stroke: "var(--accent)", "stroke-width": 3, "stroke-linejoin": "round" });

      readout.className = "day13-readout";
      if (disorder < 0.08) {
        readout.classList.add("is-contested");
        title.textContent = local(root, "Too clean — no usable plateaux", "过于纯净——没有可用平台");
        text.textContent = local(root,
          "With almost no disorder, exact quantization occurs only at extremely narrow field values. There is no stable shelf on which to make a resistance measurement.",
          "无序接近于零时，精确量子化只出现在极窄的磁场范围内，没有可供稳定测量电阻的平台。"
        );
      } else if (disorder < 0.35) {
        title.textContent = local(root, "Narrow plateaux — correct but fragile", "平台狭窄——数值正确但不稳定");
        text.textContent = local(root,
          "The shelves exist, but a small field drift can leave one. Their heights remain fixed at R = RK/i.",
          "平台已经出现，但磁场稍有漂移就可能离开平台；平台高度仍固定为 R = RK/i。"
        );
      } else {
        readout.classList.add("is-ok");
        title.textContent = local(root, "Wide, flat, usable plateaux", "宽阔、平坦、可用的平台");
        text.textContent = local(root,
          "Disorder widens each shelf without changing its height. At i = 2, RK/2 = 12 906.403 729 65 Ω in different materials and laboratories.",
          "无序拓宽了每个平台，却不改变其高度。i = 2 时，不同材料、不同实验室得到的 RK/2 都是 12 906.403 729 65 Ω。"
        );
      }
    }

    range.addEventListener("input", draw);
    draw();
  }

  function initAccuracy(root){
    var biasRange = one(root, '[data-role="bias"]');
    var scatterRange = one(root, '[data-role="scatter"]');
    var biasOutput = one(root, '[data-out="bias"]');
    var scatterOutput = one(root, '[data-out="scatter"]');
    var svg = one(root, '[data-role="target"]');
    var title = one(root, '[data-out="verdict-title"]');
    var text = one(root, '[data-out="verdict-text"]');
    var readout = one(root, '[data-role="verdict"]');
    var seeds = [];
    var state = 42;
    function random(){ state = (state * 9301 + 49297) % 233280; return state / 233280; }
    for (var index = 0; index < 14; index += 1) {
      var u = Math.max(0.000001, random());
      var v = random();
      var radius = Math.sqrt(-2 * Math.log(u));
      var angle = 2 * Math.PI * v;
      seeds.push([radius * Math.cos(angle), radius * Math.sin(angle)]);
    }

    function level(value){
      if (value < 0.25) return local(root, "low", "低");
      if (value < 0.6) return local(root, "moderate", "中等");
      return local(root, "high", "高");
    }

    function draw(){
      var bias = Number(biasRange.value) / 100;
      var scatter = Number(scatterRange.value) / 100;
      var biasLevel = level(bias);
      var scatterLevel = level(scatter);
      biasOutput.textContent = biasLevel;
      scatterOutput.textContent = scatterLevel;
      biasRange.setAttribute("aria-valuetext", biasLevel);
      scatterRange.setAttribute("aria-valuetext", scatterLevel);
      clear(svg);
      append(svg, "rect", { x: 1, y: 1, width: 318, height: 318, rx: 13, fill: "var(--paper)", stroke: "var(--line-strong)", "stroke-width": 2 });
      [132, 100, 68, 35].forEach(function(radiusValue, ringIndex){
        append(svg, "circle", { cx: 160, cy: 156, r: radiusValue, fill: ringIndex === 3 ? "var(--ok)" : "none", opacity: ringIndex === 3 ? 0.1 : 1, stroke: ringIndex > 1 ? "var(--line-strong)" : "var(--line)", "stroke-width": 1.5 });
      });
      append(svg, "line", { x1: 160, y1: 16, x2: 160, y2: 296, stroke: "var(--line)", "stroke-width": 0.8, "stroke-dasharray": "3 5" });
      append(svg, "line", { x1: 20, y1: 156, x2: 300, y2: 156, stroke: "var(--line)", "stroke-width": 0.8, "stroke-dasharray": "3 5" });
      append(svg, "circle", { cx: 160, cy: 156, r: 4.5, fill: "var(--ok)" });
      var meanX = 160 - bias * 72;
      var meanY = 156 - bias * 46;
      var sigma = 4 + scatter * 44;
      seeds.forEach(function(seed){
        append(svg, "circle", {
          cx: clamp(meanX + seed[0] * sigma, 18, 302).toFixed(1),
          cy: clamp(meanY + seed[1] * sigma, 18, 294).toFixed(1),
          r: 4.5,
          fill: "var(--accent)",
          opacity: 0.72,
          stroke: "var(--accent)",
          "stroke-width": 1
        });
      });
      append(svg, "circle", { cx: meanX, cy: meanY, r: 8, fill: "none", stroke: "var(--contested)", "stroke-width": 2 });
      append(svg, "line", { x1: meanX - 7, y1: meanY, x2: meanX + 7, y2: meanY, stroke: "var(--contested)", "stroke-width": 1.5 });
      append(svg, "line", { x1: meanX, y1: meanY - 7, x2: meanX, y2: meanY + 7, stroke: "var(--contested)", "stroke-width": 1.5 });
      label(svg, 160, 307, local(root, "green = reference value · red = mean", "绿色 = 参考值 · 红色 = 均值"), { size: 10.5, fill: "var(--ink-faint)" });

      var correct = bias < 0.25;
      var precise = scatter < 0.25;
      readout.className = "day13-readout";
      if (correct && precise) {
        readout.classList.add("is-ok");
        title.textContent = local(root, "Accurate — high trueness and precision", "准确——测量正确度与精密度都高");
        text.textContent = local(root, "The cluster is tight and centered on the reference value.", "测量结果聚集紧密，且均值位于参考值上。");
      } else if (correct) {
        title.textContent = local(root, "High trueness, low precision", "测量正确度高，精密度低");
        text.textContent = local(root, "The mean is near the reference value, but individual measurements scatter. Repetition can reduce this random contribution.", "均值接近参考值，但单次测量散布很大；增加重复次数可以降低这部分随机影响。");
      } else if (precise) {
        readout.classList.add("is-contested");
        title.textContent = local(root, "High precision, low trueness — the dangerous quadrant", "精密度高、测量正确度低——最危险的象限");
        text.textContent = local(root, "More repetitions only narrow the interval around the biased answer. Detecting this failure requires an external reference or instrument audit.", "增加重复次数只会让区间更紧地围绕有偏答案。发现这种失效需要外部参考或仪器审计。");
      } else {
        readout.classList.add("is-contested");
        title.textContent = local(root, "Low trueness and low precision", "测量正确度与精密度都低");
        text.textContent = local(root, "The results are both biased and widely scattered.", "测量结果既有明显偏差，也高度分散。");
      }
    }

    biasRange.addEventListener("input", draw);
    scatterRange.addEventListener("input", draw);
    draw();
  }

  function initReadiness(root){
    var rungs = [
      {
        titleEn: "Antihydrogen falls down", titleZh: "反氢向下坠落", source: "ALPHA-g · Nature 621:716 · 2023", status: "ok", badgeEn: "measured", badgeZh: "已测量",
        headingEn: "Established attraction; still a 25% test", headingZh: "已确立引力方向；精度仍只有约 25%",
        bodyEn: "Demonstrated: antihydrogen is gravitationally attracted. Not demonstrated: equality with ordinary matter's acceleration. The result leaves many orders of magnitude between this test and matter-only equivalence-principle tests.",
        bodyZh: "已演示：反氢受到向下的引力。尚未演示：其加速度与普通物质相等。该测量与仅使用普通物质的等效原理检验之间仍相差许多个数量级。"
      },
      {
        titleEn: "Weak equivalence holds to 10⁻¹⁵", titleZh: "弱等效原理通过 10⁻¹⁵ 量级检验", source: "MICROSCOPE · PRL 129:121102 · 2022", status: "ok", badgeEn: "measured", badgeZh: "已测量",
        headingEn: "Established orbital test", headingZh: "已确立的轨道实验检验",
        bodyEn: "Titanium and platinum test masses free-fell in orbit for 2.5 years. Their Eötvös ratio was consistent with zero at the 10⁻¹⁵ level, with a same-composition control pair.",
        bodyZh: "钛与铂试验质量在轨道上自由落体 2.5 年；厄缶比在 10⁻¹⁵ 量级与零相容，并设置了同成分对照组。"
      },
      {
        titleEn: "Electron EDM below 4.1×10⁻³⁰ e·cm", titleZh: "电子电偶极矩低于 4.1×10⁻³⁰ e·cm", source: "JILA HfF⁺ · Science 381:46 · 2023", status: "ok", badgeEn: "measured", badgeZh: "已测量",
        headingEn: "Established bound; energy framing is model-dependent", headingZh: "约束已确立；能标解读依赖模型",
        bodyEn: "The direct result is a 90%-confidence upper bound consistent with zero. Claims that it probes a particular multi-TeV scale require assumptions about couplings and cancellations.",
        bodyZh: "直接结果是在 90% 置信水平下得到与零相容的上限。把它解释为探测某一多 TeV 能标，需要关于耦合与抵消的额外假设。"
      },
      {
        titleEn: "A clock made from Ar¹³⁺", titleZh: "用 Ar¹³⁺ 制成的钟", source: "PTB · Nature 611:43 · 2022", status: "ok", badgeEn: "built", badgeZh: "已建成",
        headingEn: "Clock demonstrated; new-physics payoff projected", headingZh: "钟已演示；新物理回报仍属预期",
        bodyEn: "The first highly charged-ion optical clock reached 2.2×10⁻¹⁷ systematic uncertainty. Its greater sensitivity to α variation is well motivated, but it has not yet set a competitive bound.",
        bodyZh: "首台高电荷离子光学钟达到 2.2×10⁻¹⁷ 的系统不确定度。它对 α 变化更敏感有充分理论依据，但尚未给出有竞争力的约束。"
      },
      {
        titleEn: "Optical clocks run at sea", titleZh: "光学钟在海上运行", source: "Vector Atomic · Nature 628:736 · 2024", status: "ok", badgeEn: "deployed", badgeZh: "已部署",
        headingEn: "Rugged deployment demonstrated", headingZh: "耐环境部署已经演示",
        bodyEn: "Three 35-litre iodine clocks ran aboard a naval ship for 20 days with less than 300 ps of timing error per day. The advance is ruggedness, not record precision.",
        bodyZh: "三台 35 升碘钟在军舰上连续运行 20 天，每日计时误差低于 300 ps。这里的进展是耐环境能力，而非精密度纪录。"
      },
      {
        titleEn: "Separated references constrain dark matter", titleZh: "时空分离的频率参考约束暗物质", source: "PTB + Queensland · PRL 134:031001 · 2025", status: "ok", badgeEn: "measured", badgeZh: "已测量",
        headingEn: "Method established; result is a null", headingZh: "方法已确立；结果为零",
        bodyEn: "A 2,220 km comparison of cavity-stabilized lasers, plus a separate GPS atomic-clock dataset, opened the first sensitivity to scalar dark matter coupling only to electrons in the stated mass range. No dark matter was detected.",
        bodyZh: "相距 2,220 千米的腔稳激光比较，加上另一组 GPS 原子钟数据，首次在相应质量范围内对仅耦合电子的标量暗物质获得灵敏度。实验没有探测到暗物质。"
      },
      {
        titleEn: "A nuclear clock constrains the strong force", titleZh: "核钟约束强相互作用", source: "²²⁹Th · preprint · 2026", status: "hint", badgeEn: "preprint", badgeZh: "预印本",
        headingEn: "Promising method with theoretical uncertainty", headingZh: "方法有前景，理论不确定度仍大",
        bodyEn: "A closed-loop thorium clock was used to constrain ultralight fields. The experimental method is substantial, but inferred coupling limits inherit a large uncertainty in the nuclear sensitivity coefficient.",
        bodyZh: "闭环钍核钟已用于约束超轻场。实验方法取得实质进展，但推断出的耦合上限继承了核灵敏度系数中的较大不确定度。"
      },
      {
        titleEn: "Detect a single graviton", titleZh: "探测单个引力子", source: "Tobar et al. · Nat. Commun. 15:7229 · 2024", status: "bad", badgeEn: "proposal", badgeZh: "提案",
        headingEn: "A feasibility argument, not a detection", headingZh: "可行性论证，并非探测结果",
        bodyEn: "The paper proposes a massive quantum resonator cross-correlated with gravitational-wave observatories. The apparatus has not been built, and quantized absorption alone may not establish a quantized gravitational field.",
        bodyZh: "论文提出用大型量子谐振器与引力波天文台做互相关。装置尚未建成，而且量子化吸收本身未必足以确立引力场已经量子化。"
      }
    ];
    var ladder = one(root, '[data-role="ladder"]');
    var detailTitle = one(root, '[data-out="detail-title"]');
    var detailBody = one(root, '[data-out="detail-body"]');
    var buttons = [];

    function select(index){
      buttons.forEach(function(button, buttonIndex){ button.setAttribute("aria-pressed", buttonIndex === index ? "true" : "false"); });
      detailTitle.textContent = zh(root) ? rungs[index].headingZh : rungs[index].headingEn;
      detailBody.textContent = zh(root) ? rungs[index].bodyZh : rungs[index].bodyEn;
    }

    rungs.forEach(function(rung, index){
      var item = document.createElement("div");
      item.className = "day13-rung-wrap";
      item.setAttribute("role", "listitem");
      var button = document.createElement("button");
      button.type = "button";
      button.className = "day13-rung";
      button.setAttribute("aria-pressed", "false");
      var number = document.createElement("span");
      number.className = "day13-rung-number";
      number.textContent = String(index + 1).padStart(2, "0");
      var body = document.createElement("span");
      body.className = "day13-rung-body";
      var heading = document.createElement("strong");
      heading.textContent = zh(root) ? rung.titleZh : rung.titleEn;
      var source = document.createElement("small");
      source.textContent = rung.source;
      body.appendChild(heading);
      body.appendChild(source);
      var badge = document.createElement("span");
      badge.className = "day13-rung-badge is-" + rung.status;
      badge.textContent = zh(root) ? rung.badgeZh : rung.badgeEn;
      button.appendChild(number);
      button.appendChild(body);
      button.appendChild(badge);
      button.addEventListener("click", function(){ select(index); });
      item.appendChild(button);
      ladder.appendChild(item);
      buttons.push(button);
    });
    select(0);
  }

  function initDarkMatter(root){
    var svg = one(root, '[data-role="wave"]');
    var range = one(root, '[data-role="separation"]');
    var output = one(root, '[data-out="separation"]');
    var buttons = all(root, "[data-wave]");
    var title = one(root, '[data-out="verdict-title"]');
    var text = one(root, '[data-out="verdict-text"]');
    var readout = one(root, '[data-role="verdict"]');
    var mode = "long";
    var anchorX = 150;
    var amplitude = 68;
    function wavelength(){ return mode === "long" ? 900 : 300; }
    function field(x){ return 150 - amplitude * Math.sin(2 * Math.PI / wavelength() * (x - 40) + 0.6); }

    function draw(){
      var fraction = Number(range.value) / 100;
      var otherX = anchorX + fraction * 450;
      var kilometres = Math.round(fraction * 4933.333333 / 10) * 10;
      var formatted = kilometres.toLocaleString(zh(root) ? "zh-CN" : "en-US") + " km";
      output.textContent = formatted;
      range.setAttribute("aria-valuetext", formatted);
      clear(svg);
      append(svg, "rect", { x: 1, y: 1, width: 658, height: 308, rx: 13, fill: "var(--paper)", stroke: "var(--line-strong)", "stroke-width": 2 });
      append(svg, "line", { x1: 40, y1: 150, x2: 630, y2: 150, stroke: "var(--line)", "stroke-width": 1, "stroke-dasharray": "3 5" });
      var points = [];
      for (var x = 40; x <= 630; x += 4) points.push(x + "," + field(x).toFixed(1));
      append(svg, "path", { d: "M" + points.join(" L"), fill: "none", stroke: "var(--brass)", "stroke-width": 2.5, opacity: 0.9 });
      label(svg, 45, 34, local(root, "scalar field φ(x,t) shifts frequency references", "标量场 φ(x,t) 使频率参考移动"), { anchor: "start", size: 10.5, fill: "var(--brass)" });
      var firstY = field(anchorX);
      var secondY = field(otherX);
      append(svg, "line", { x1: anchorX, y1: 264, x2: anchorX, y2: firstY, stroke: "var(--accent)", "stroke-width": 1.5, "stroke-dasharray": "2 3" });
      append(svg, "circle", { cx: anchorX, cy: firstY, r: 7, fill: "var(--accent)" });
      label(svg, anchorX, 285, local(root, "reference A", "参考 A"), { size: 10.5, fill: "var(--accent)" });
      append(svg, "line", { x1: otherX, y1: 264, x2: otherX, y2: secondY, stroke: "var(--contested)", "stroke-width": 1.5, "stroke-dasharray": "2 3" });
      append(svg, "circle", { cx: otherX, cy: secondY, r: 7, fill: "var(--contested)" });
      label(svg, otherX, 285, local(root, "reference B", "参考 B"), { size: 10.5, fill: "var(--contested)" });
      append(svg, "line", { x1: anchorX, y1: firstY, x2: otherX, y2: secondY, stroke: "var(--ok)", "stroke-width": 3, opacity: Math.abs(firstY - secondY) < 3 ? 0.35 : 1 });
      var difference = Math.abs(firstY - secondY) / amplitude;
      var phaseCycles = (otherX - anchorX) / wavelength();
      var samePhase = Math.abs(phaseCycles - Math.round(phaseCycles)) < 0.000001;
      var nearCancellation = Math.abs(firstY - secondY) < 3;
      label(svg, (anchorX + otherX) / 2, Math.min(firstY, secondY) - 14, "Δφ = " + difference.toFixed(2), { size: 10.5, weight: 700, fill: "var(--ok)" });
      setPressed(buttons, buttons.filter(function(button){ return button.getAttribute("data-wave") === mode; })[0]);

      readout.className = "day13-readout";
      if (samePhase) {
        readout.classList.add("is-contested");
        title.textContent = local(root, "Blind spot — the differential signal is zero", "盲点——差分信号为零");
        text.textContent = local(root,
          "The references sample the same phase and have the same response in this schematic. Their common shift cancels from the comparison even if the field itself is strong; unlike references can retain sensitivity to some couplings.",
          "示意图中的两个参考在同一相位取样且响应相同，因此共同频移会在比较中抵消，即使场本身很强也不可见；响应不同的参考仍可能对某些耦合保持灵敏度。"
        );
      } else if (nearCancellation) {
        readout.classList.add("is-contested");
        title.textContent = local(root, "Near cancellation — not a structural blind spot", "近似抵消——并非结构性盲点");
        text.textContent = local(root,
          "The instantaneous field values are nearly equal, but the references are not co-located at the same phase. A time series or a larger baseline can still reveal a differential response; one snapshot cannot distinguish a small phase offset from a waveform crossing.",
          "此刻的场值几乎相同，但两个参考并非同址同相位。时间序列或更长基线仍可揭示差分响应；单帧快照无法区分微小相位差与波形交点。"
        );
      } else {
        readout.classList.add("is-ok");
        title.textContent = local(root, "Potential differential signal — separation is the apparatus", "可能出现差分信号——距离就是装置");
        text.textContent = local(root,
          "The references can now sample different phases, so common-mode cancellation can break. In this schematic, a shorter wavelength can reach a large phase difference over a shorter baseline.",
          "两个参考现在可能取样不同相位，因此共同模式抵消可能被打破。在这幅示意图中，较短波长可以在较短基线上达到较大相位差。"
        );
      }
    }

    buttons.forEach(function(button){ button.addEventListener("click", function(){ mode = button.getAttribute("data-wave"); draw(); }); });
    range.addEventListener("input", draw);
    draw();
  }

  var initializers = {
    "uncertainty-ledger": initLedger,
    "kibble-balance": initKibble,
    "alpha-drift": initAlpha,
    "lineage": initLineage,
    "quantum-hall": initQuantumHall,
    "accuracy-target": initAccuracy,
    "readiness-ladder": initReadiness,
    "dark-matter-wave": initDarkMatter
  };

  Array.prototype.forEach.call(document.querySelectorAll("[data-day13-kind]"), function(root){
    var kind = root.getAttribute("data-day13-kind");
    var initializer = initializers[kind];
    if (initializer) mountWhenVisible(root, initializer);
  });
})();
