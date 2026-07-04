(function(){
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  function mountWhenVisible(root, init){
    var initialized = false;
    function ensure(){
      if (!initialized) {
        initialized = true;
        init(root);
      }
    }
    if (!("IntersectionObserver" in window)) {
      ensure();
      return;
    }
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          ensure();
          observer.disconnect();
        }
      });
    }, { rootMargin: "120px 0px", threshold: 0.01 });
    observer.observe(root);
  }

  function setPressed(buttons, active){
    Array.prototype.forEach.call(buttons, function(button){
      button.setAttribute("aria-pressed", button === active ? "true" : "false");
    });
  }

  function copyFor(locale){
    if (locale === "zh") {
      return {
        linda: {
          feelA: '"银行出纳员" 与琳达的相似度',
          feelB: '"银行出纳员 + 女权" 与琳达的相似度',
          low: "低",
          high: "高",
          logicA: "P(A) - 琳达是银行出纳员",
          logicB: "P(B) - 两者同时成立",
          larger: "更大",
          subset: "≤ P(A)",
          vivid: "B · 且女权",
          vivid2: "生动的匹配",
          true1: "B ⊂ A",
          true2: "不能超过 A",
          idleTitle: "先在上方选择一个答案",
          idleBody: "两条柱显示两副镜片各自报告的结果。在相似性镜片下，B 可以压过 A；在逻辑镜片下，B 永远不能超过 A，因为 B 活在 A 里面。",
          wrongTitle: "你感到了合取谬误。",
          wrongBody: "你并不孤单：多数人，甚至受过概率训练的人，都会选择 B。切到逻辑镜片，原因就无法回避：女权银行出纳员是银行出纳员的子集，所以 B 不能比 A 更可能。",
          rightTitle: "逻辑上密不透风，即使直觉还在拉扯。",
          rightBody: "A 是安全答案。每一位女权银行出纳员已经被计算在银行出纳员之中，所以 A 至少和 B 一样可能。"
        },
        freq: {
          probabilityFrame: function(rate){
            return "概率格式：一种疾病影响 " + (rate * 100).toFixed(1) + "% 的女性。检测能抓住 90% 的病例，但也会把 9% 的健康者误报为阳性。一位女性检测阳性。她真正患病的概率是多少？多数人会冲口说 80-90%。现在切换格式，直接数。";
          },
          frequencyFrame: function(k){
            return "自然频率格式：在 1,000 名女性中，" + k.sick + " 人患病，其中 " + k.tp + " 人检测阳性。在 " + k.healthy + " 名健康女性中，" + k.fp + " 人也检测阳性。所以总共有 " + k.posTotal + " 人检测阳性，但真正患病的只有 " + k.tp + " 人。";
          },
          note: function(k, oneIn){
            if (k.tp <= 0) return "在这个基础率下几乎没有真病例，所以阳性几乎全是假警报。";
            return "大约是 " + oneIn + " 人里 1 人；在疾病还很罕见时，阳性检测通常仍意味着健康。";
          }
        },
        scissors: {
          oneTitle: "不理性：它忽略了大部分信息。",
          oneBody: "只用概率论这把尺子审视心智刀刃时，一个扔掉几乎全部数据的规则看起来像坏掉了。这就是经典实验给出偏差判决的方式。",
          bothTitle: "聪明：它利用了世界的结构。",
          bothBody: "两片刀刃一起合上。凝视启发式忽略速度和轨迹，是因为在飞球的真实环境中，保持凝视角不变就能把你带到落点，廉价、可靠、及时。"
        }
      };
    }
    return {
      linda: {
        feelA: '"Bank teller" resembles Linda',
        feelB: '"Bank teller + feminist" resembles Linda',
        low: "low",
        high: "high",
        logicA: "P(A) - probability Linda is a bank teller",
        logicB: "P(B) - probability she is both",
        larger: "larger",
        subset: "≤ P(A)",
        vivid: "B · & feminist",
        vivid2: "the vivid fit",
        true1: "B ⊂ A",
        true2: "can never exceed A",
        idleTitle: "Pick an option above",
        idleBody: "The two bars show what each lens reports. Under resemblance, B can outscore A. Under logic, B can never exceed A, because B lives inside A.",
        wrongTitle: "You felt the conjunction fallacy.",
        wrongBody: "You are in excellent company: most people, including trained statisticians, choose B. Flip to the logic lens and the reason it is wrong is unavoidable: feminist bank tellers are a subset of bank tellers, so B cannot be more probable than A.",
        rightTitle: "Logically airtight, even though intuition tugs the other way.",
        rightBody: "A is the safe answer: every feminist bank teller is already counted among the bank tellers, so A must be at least as probable as B."
      },
      freq: {
        probabilityFrame: function(rate){
          return "Probability format: a disease affects " + (rate * 100).toFixed(1) + "% of women. The test catches it 90% of the time but also flags 9% of healthy women. A woman tests positive. What is the chance she is sick? Most people blurt out something near 80-90%. Now switch formats and count.";
        },
        frequencyFrame: function(k){
          return "Natural-frequency format: of 1,000 women, " + k.sick + " have the disease, and " + k.tp + " of them test positive. Of the " + k.healthy + " healthy women, " + k.fp + " also test positive. So " + k.posTotal + " women test positive in all, but only " + k.tp + " are truly sick.";
        },
        note: function(k, oneIn){
          if (k.tp <= 0) return "At this base rate almost no true cases exist, so almost every positive is a false alarm.";
          return "That is about 1 in " + oneIn + "; a positive test still usually means healthy until the disease is common.";
        }
      },
      scissors: {
        oneTitle: "Irrational: it ignores most of the information.",
        oneBody: "Against logic alone, a rule that throws away nearly all the data looks broken. Judging only the mind blade against probability theory is how the classic experiments reach their verdict of bias.",
        bothTitle: "Smart: it exploits the structure of the world.",
        bothBody: "Now both blades engage. The gaze heuristic ignores velocity and trajectory because, in the actual environment of flying balls, holding the gaze angle constant delivers you to the landing spot reliably, cheaply, and in real time."
      }
    };
  }

  function initLinda(root){
    var locale = root.getAttribute("data-locale") || "en";
    var text = copyFor(locale).linda;
    var choice = null;
    var lens = "feel";
    var choiceButtons = root.querySelectorAll("[data-choice]");
    var lensButtons = root.querySelectorAll("[data-lens]");
    var labelA = root.querySelector("[data-out='label-a']");
    var labelB = root.querySelector("[data-out='label-b']");
    var valueA = root.querySelector("[data-out='value-a']");
    var valueB = root.querySelector("[data-out='value-b']");
    var fillA = root.querySelector("[data-out='fill-a']");
    var fillB = root.querySelector("[data-out='fill-b']");
    var subset = root.querySelector("[data-role='subset']");
    var dot = root.querySelector("[data-role='linda-dot']");
    var smallLabel = root.querySelector("[data-role='small-label']");
    var smallLabel2 = root.querySelector("[data-role='small-label-2']");
    var verdictTitle = root.querySelector("[data-out='verdict-title']");
    var verdictBody = root.querySelector("[data-out='verdict-body']");

    function render(){
      Array.prototype.forEach.call(lensButtons, function(button){
        button.setAttribute("aria-pressed", button.getAttribute("data-lens") === lens ? "true" : "false");
      });
      if (lens === "feel") {
        if (labelA) labelA.textContent = text.feelA;
        if (labelB) labelB.textContent = text.feelB;
        if (valueA) valueA.textContent = text.low;
        if (valueB) valueB.textContent = text.high;
        if (fillA) fillA.style.width = "22%";
        if (fillB) fillB.style.width = "88%";
        if (subset) subset.setAttribute("opacity", "1");
        if (dot) dot.setAttribute("opacity", "1");
        if (smallLabel) smallLabel.textContent = text.vivid;
        if (smallLabel2) smallLabel2.textContent = text.vivid2;
      } else {
        if (labelA) labelA.textContent = text.logicA;
        if (labelB) labelB.textContent = text.logicB;
        if (valueA) valueA.textContent = text.larger;
        if (valueB) valueB.textContent = text.subset;
        if (fillA) fillA.style.width = "70%";
        if (fillB) fillB.style.width = "24%";
        if (subset) subset.setAttribute("opacity", "0.86");
        if (dot) dot.setAttribute("opacity", "0.35");
        if (smallLabel) smallLabel.textContent = text.true1;
        if (smallLabel2) smallLabel2.textContent = text.true2;
      }

      root.classList.remove("is-correct", "is-wrong");
      if (choice === "B") {
        root.classList.add("is-wrong");
        if (verdictTitle) verdictTitle.textContent = text.wrongTitle;
        if (verdictBody) verdictBody.textContent = text.wrongBody;
      } else if (choice === "A") {
        root.classList.add("is-correct");
        if (verdictTitle) verdictTitle.textContent = text.rightTitle;
        if (verdictBody) verdictBody.textContent = text.rightBody;
      } else {
        if (verdictTitle) verdictTitle.textContent = text.idleTitle;
        if (verdictBody) verdictBody.textContent = text.idleBody;
      }
    }

    Array.prototype.forEach.call(choiceButtons, function(button){
      button.addEventListener("click", function(){
        choice = button.getAttribute("data-choice");
        setPressed(choiceButtons, button);
        render();
      });
    });
    Array.prototype.forEach.call(lensButtons, function(button){
      button.addEventListener("click", function(){
        lens = button.getAttribute("data-lens") || lens;
        render();
      });
    });
    render();
  }

  function fmtPct(value){
    return value >= 0.1 ? Math.round(value * 100) + "%" : (value * 100).toFixed(1) + "%";
  }

  function initFrequency(root){
    var locale = root.getAttribute("data-locale") || "en";
    var text = copyFor(locale).freq;
    var format = "prob";
    var buttons = root.querySelectorAll("[data-format]");
    var frame = root.querySelector("[data-out='frame']");
    var gridWrap = root.querySelector("[data-role='grid-wrap']");
    var grid = root.querySelector("[data-role='grid']");
    var slider = root.querySelector("[data-role='base-rate']");
    var baseOut = root.querySelector("[data-out='base-rate']");
    var ppvOut = root.querySelector("[data-out='ppv']");
    var ppvNote = root.querySelector("[data-out='ppv-note']");
    var cells = [];
    var N = 1000;
    var cols = 40;
    var rows = 25;
    var sensitivity = 0.9;
    var falsePositiveRate = 0.09;

    if (grid) {
      var cellW = 400 / cols;
      var cellH = 260 / rows;
      for (var row = 0; row < rows; row += 1) {
        for (var col = 0; col < cols; col += 1) {
          var rect = document.createElementNS(NS, "rect");
          rect.setAttribute("x", (col * cellW + 0.6).toFixed(2));
          rect.setAttribute("y", (row * cellH + 0.6).toFixed(2));
          rect.setAttribute("width", (cellW - 1.2).toFixed(2));
          rect.setAttribute("height", (cellH - 1.2).toFixed(2));
          rect.setAttribute("rx", "1.4");
          grid.appendChild(rect);
          cells.push(rect);
        }
      }
    }

    function compute(rate){
      var sick = Math.round(N * rate);
      var tp = Math.round(sick * sensitivity);
      var fn = sick - tp;
      var healthy = N - sick;
      var fp = Math.round(healthy * falsePositiveRate);
      var tn = healthy - fp;
      var posTotal = tp + fp;
      var ppv = posTotal > 0 ? tp / posTotal : 0;
      return { sick: sick, tp: tp, fn: fn, healthy: healthy, fp: fp, tn: tn, posTotal: posTotal, ppv: ppv };
    }

    function paint(k){
      var index = 0;
      var n;
      for (n = 0; n < k.tp; n += 1) cells[index++].setAttribute("fill", "var(--accent)");
      for (n = 0; n < k.fn; n += 1) cells[index++].setAttribute("fill", "color-mix(in srgb,var(--contested) 70%,transparent)");
      for (n = 0; n < k.fp; n += 1) cells[index++].setAttribute("fill", "var(--brass)");
      for (; index < cells.length; index += 1) cells[index].setAttribute("fill", "color-mix(in srgb,var(--ink-faint) 26%,transparent)");
    }

    function render(){
      var rate = Number(slider ? slider.value : 10) / 1000;
      var k = compute(rate);
      var oneIn = k.tp > 0 ? Math.max(1, Math.round(k.posTotal / k.tp)) : 0;
      paint(k);
      if (baseOut) baseOut.textContent = (rate * 100).toFixed(1) + "%";
      if (ppvOut) ppvOut.textContent = "≈ " + fmtPct(k.ppv);
      if (ppvNote) ppvNote.textContent = text.note(k, oneIn);

      Array.prototype.forEach.call(buttons, function(button){
        button.setAttribute("aria-pressed", button.getAttribute("data-format") === format ? "true" : "false");
      });
      if (gridWrap) gridWrap.hidden = format !== "freq";
      if (frame) frame.textContent = format === "freq" ? text.frequencyFrame(k) : text.probabilityFrame(rate);
    }

    Array.prototype.forEach.call(buttons, function(button){
      button.addEventListener("click", function(){
        format = button.getAttribute("data-format") || format;
        render();
      });
    });
    if (slider) slider.addEventListener("input", render);
    render();
  }

  function initScissors(root){
    var locale = root.getAttribute("data-locale") || "en";
    var text = copyFor(locale).scissors;
    var buttons = root.querySelectorAll("[data-blade]");
    var mind = root.querySelector("[data-role='mind']");
    var environment = root.querySelector("[data-role='environment']");
    var verdictTitle = root.querySelector("[data-out='verdict-title']");
    var verdictBody = root.querySelector("[data-out='verdict-body']");

    function render(mode, active){
      if (active) setPressed(buttons, active);
      root.classList.toggle("is-both", mode === "both");
      if (mind) mind.setAttribute("opacity", "0.95");
      if (environment) environment.setAttribute("opacity", mode === "both" ? "0.95" : "0.16");
      if (verdictTitle) verdictTitle.textContent = mode === "both" ? text.bothTitle : text.oneTitle;
      if (verdictBody) verdictBody.textContent = mode === "both" ? text.bothBody : text.oneBody;
    }

    Array.prototype.forEach.call(buttons, function(button){
      button.addEventListener("click", function(){
        render(button.getAttribute("data-blade") || "one", button);
      });
    });
    render("one", null);
  }

  document.querySelectorAll("[data-day11-linda]").forEach(function(root){
    mountWhenVisible(root, initLinda);
  });
  document.querySelectorAll("[data-day11-frequency]").forEach(function(root){
    mountWhenVisible(root, initFrequency);
  });
  document.querySelectorAll("[data-day11-scissors]").forEach(function(root){
    mountWhenVisible(root, initScissors);
  });
})();
