(() => {
  const C = {
    ink: "var(--ink, #172530)",
    faint: "var(--ink-faint, #64747b)",
    line: "var(--line, #cfc4ad)",
    paper: "var(--paper, #f5f3ec)",
    raised: "var(--raised, #fbfaf5)",
    accent: "var(--accent, #1d6f78)",
    deep: "var(--accent-deep, #13525a)",
    brass: "var(--brass, #93651f)",
    ok: "var(--ok, #2a704a)",
    warn: "var(--hint, #b76636)",
    danger: "var(--heat, #a8442d)"
  };
  const T = {
    en: {
      stable:"Calm control — it settles", overshoot:"Overshoot, then settle", hunt:"Hunting — it oscillates", runaway:"Runaway — the gap explodes", unstable:"Unstable — it tears itself apart", calm:"Negative feedback doing its quiet job: the room climbs to 21°C and holds. Sense, compare, correct.", overshootExpl:"It reaches the goal but punches past it first, then eases back. A little delay buys a little overshoot.", oscillate:"The loop is stable but underdamped: lag makes it chase its own tail, swinging above and below 21°C.", break:"Gain × delay is too high. The controller reacts to stale readings, overshoots, then overcorrects the overshoot.", positive:"Positive feedback: every gap from the goal is amplified, not corrected. The smallest deviation feeds on itself.",
      rising:"The faucet beats the drain, so the water keeps rising. The peak comes only after inflow falls below outflow.", peak:"The level peaks after the faucet has already started shutting off. Stock lags flow.", falling:"The drain always wins; the stock falls.", co2Case:"Net inflow wins: the stock ends higher even after the faucet starts closing.", balanceCase:"Balanced over the whole run: the stock starts above zero, swells, then returns near its starting level.", emptyCase:"Drain wins: with the same drain, the smaller faucet cannot replace what leaves, so the stock falls.",
      high:"high", medium:"medium", low:"low", fallingRes:"falling", critical:"critical", tipped:"Tipped — new basin", edge:"On the brink — fold approaching", safe:"Stable — deep basin", resilience:"Resilience falling", hysteresis:"The valley vanished and the ball rolled into the other basin. Drag back: it will not return until the driver moves far the other way.", resGood:"A steep valley: knock the ball and it springs right back. The early-warning signals are quiet.", resWarn:"The basin is flattening. The ball recovers more slowly and wanders further: critical slowing down beginning.", resEdge:"The valley is nearly flat. Recovery is glacial, variance is high, and autocorrelation nears 1.",
      ladder:[
        ["12","Parameters","Taxes, subsidies, constants. Easy to fight over; usually weak."],
        ["11","Buffer sizes","The size of stabilizing stocks relative to flows."],
        ["10","Stock-flow structure","Pipes, roads, inventories, buffers: the physical plumbing."],
        ["9","Delays","Shorten or lengthen lags before they create oscillation."],
        ["8","Balancing loops","Strengthen the loop that corrects drift."],
        ["7","Reinforcing loops","Slow the runaway before it dominates."],
        ["6","Information flows","Give actors the feedback they were missing."],
        ["5","Rules","Change incentives, penalties, boundaries, permissions."],
        ["4","Self-organization","Let the system evolve new structure."],
        ["3","Goals","Change what the system is optimizing for."],
        ["2","Paradigms","Change the worldview from which goals arise."],
        ["1","Transcend paradigms","Hold models lightly enough to replace them."]
      ],
      daisyGood:"mixed daisies hold the plateau", daisyCold:"black daisies warm a dim world", daisyWhite:"white daisies reflect a hot star", daisyHot:"too hot: regulation collapses", daisyDead:"too cold: regulation never starts",
      plateau:"regulating range", rock:"dead rock", withLife:"with daisies", luminosity:"solar luminosity", coldFail:"too dim", hotFail:"too bright", blackWarms:"black warms", whiteCools:"white cools",
      classifier:{fold:["Fold bifurcation","Generic warning rises, then the state jumps to a distant basin."], hopf:["Hopf bifurcation","The warning comes with growing oscillation: the future is a cycle."], trans:["Transcritical bifurcation","Two branches trade stability; one state slides out as another takes over."]},
      sharedWarn:"shared warning: variance and autocorrelation rise", fingerprint:"route fingerprint", foldLand:"jump to new basin", hopfLand:"growing cycle", transLand:"stability exchange",
      evHold:"Uniform vegetation still holds.", evCrash:"Uniform vegetation collapses abruptly.", evPattern:"Patterns trade uniform cover for persistence.", evSparse:"Patterned cover is sparse but alive."
    },
    zh: {
      stable:"稳定控制——逐渐收敛", overshoot:"先超调，再稳定", hunt:"振荡——开始周期变化", runaway:"失稳——偏差扩大", unstable:"不稳定——持续发散", calm:"负反馈正常工作：房间升至 21°C 并维持。过程是感知、比较和修正。", overshootExpl:"系统达到目标前先越过目标，随后逐渐回落。适度延迟会造成超调。", oscillate:"回路仍可能稳定，但阻尼不足：延迟使系统在 21°C 两侧反复振荡。", break:"增益与延迟同时过高。控制器依据滞后读数调整，连续超调并过度修正。", positive:"正反馈放大目标偏差，而不是抵消偏差；很小的偏离也可能持续扩大。",
      rising:"流入量仍高于流出量，因此水位继续上升；只有流入量低于流出量后，水位才达到峰值。", peak:"水位在流入量开始下降之后才达到峰值，说明存量变化滞后于流量。", falling:"流出量持续高于流入量，存量下降。", co2Case:"净流入仍为正：即使排放增长速度下降，存量最终仍高于初始水平。", balanceCase:"总量基本稳定：存量经历变化后回到接近初始水平。", emptyCase:"流出量占优：较小的流入量无法补偿流出量，存量下降。",
      high:"高", medium:"中", low:"低", fallingRes:"下降", critical:"临界", tipped:"已转入另一稳定状态", edge:"接近临界点", safe:"稳定状态", resilience:"恢复力下降", hysteresis:"原稳定状态已经消失，系统进入另一状态；撤回驱动因素也不会立即恢复。", resGood:"恢复力较强：扰动后能够较快回到原状态，预警信号不明显。", resWarn:"恢复力正在下降：系统恢复更慢，方差开始增大，临界慢化出现。", resEdge:"接近临界点：恢复极慢，方差较高，自相关接近 1。",
      ladder:[
        ["12","参数","税率、补贴、常数。容易争吵，通常很弱。"],
        ["11","缓冲大小","稳定性存量相对于流量的大小。"],
        ["10","存量-流量结构","管道、道路、库存、缓冲：物理管路。"],
        ["9","延迟","在时滞制造振荡前缩短或拉长它。"],
        ["8","平衡回路","加强纠偏的回路。"],
        ["7","增强回路","在失控主导前减缓它。"],
        ["6","信息流","把缺失的反馈交给行动者。"],
        ["5","规则","改变激励、惩罚、边界和许可。"],
        ["4","自组织","让系统演化出新结构。"],
        ["3","目标","改变系统正在优化的东西。"],
        ["2","范式","改变目标所来自的世界观。"],
        ["1","超越范式","轻拿模型，随时能替换它们。"]
      ],
      daisyGood:"黑白雏菊共同守住平台", daisyCold:"黑雏菊给暗星增温", daisyWhite:"白雏菊反射过热恒星", daisyHot:"太热：调节崩溃", daisyDead:"太冷：调节无法启动",
      plateau:"调节范围", rock:"裸岩", withLife:"有雏菊", luminosity:"太阳亮度", coldFail:"太暗", hotFail:"太亮", blackWarms:"黑雏菊增温", whiteCools:"白雏菊降温",
      classifier:{fold:["折叠分岔","通用预警上升，随后状态跳入远处盆地。"], hopf:["霍普夫分岔","预警伴随振荡放大：未来是一个周期。"], trans:["跨临界分岔","两条分支交换稳定性；一个状态滑出，另一个接管。"]},
      sharedWarn:"共同预警：方差和自相关上升", fingerprint:"路径指纹", foldLand:"跳入新盆地", hopfLand:"振荡增大", transLand:"稳定性交换",
      evHold:"均匀植被仍能撑住。", evCrash:"均匀植被突然崩溃。", evPattern:"斑图用均匀覆盖换取坚持。", evSparse:"斑图覆盖稀疏，但仍活着。"
    }
  };
  const el = (name, attrs = {}, children = []) => {
    const n = document.createElementNS("http://www.w3.org/2000/svg", name);
    Object.entries(attrs).forEach(([k,v]) => n.setAttribute(k, v));
    children.forEach(c => n.appendChild(c));
    return n;
  };
  const path = pts => pts.map((p,i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
  const clear = svg => { while (svg.firstChild) svg.removeChild(svg.firstChild); };
  const axes = (svg, w, h) => {
    svg.append(el("rect", {x:0,y:0,width:w,height:h,rx:10,fill:C.raised,stroke:C.line}));
    svg.append(el("line", {x1:44,y1:h-34,x2:w-18,y2:h-34,stroke:C.line}));
    svg.append(el("line", {x1:44,y1:18,x2:44,y2:h-34,stroke:C.line}));
  };
  const q = (root, s) => root.querySelector(s);
  const qa = (root, s) => Array.from(root.querySelectorAll(s));
  const setPressed = (buttons, active, attr) => buttons.forEach(b => b.setAttribute("aria-pressed", b.getAttribute(attr) === active ? "true" : "false"));

  function initFeedback(root, lang) {
    let sign = "neg";
    const gain = q(root, "[data-role=gain]"), delay = q(root, "[data-role=delay]"), svg = q(root, "[data-role=plot]");
    const draw = () => {
      const g = Number(gain.value) / 100 * 0.7, d = Math.round(Number(delay.value)), target = 21, ambient = 10, cooling = 0.05, total = 200;
      const data = [];
      let temp = ambient;
      let diverged = false;
      for (let i = 0; i <= total; i++) {
        const seen = data[Math.max(0, i - d)] ?? temp;
        const error = target - seen;
        const heat = sign === "neg" ? g * error : -g * error;
        temp += heat - cooling * (temp - ambient);
        if (!Number.isFinite(temp) || temp > 140 || temp < -80) {
          diverged = true;
          temp = Math.max(-80, Math.min(140, temp));
        }
        data.push(temp);
      }
      const W = 600, H = 270, mL = 44, mR = 14, mT = 18, mB = 28, yMin = 0, yMax = 40;
      const X = i => mL + (i / total) * (W - mL - mR);
      const Y = v => mT + (1 - (Math.max(yMin, Math.min(yMax, v)) - yMin) / (yMax - yMin)) * (H - mT - mB);
      clear(svg);
      svg.append(el("rect", { x: mL, y: mT, width: W - mL - mR, height: H - mT - mB, rx: 8, fill: C.paper, stroke: C.line }));
      [10, 20, 30].forEach(v => {
        svg.append(el("line", { x1: mL, y1: Y(v), x2: W - mR, y2: Y(v), stroke: C.line, "stroke-dasharray": "2 5" }));
        const t = el("text", { x: mL - 6, y: Y(v) + 3, "text-anchor": "end", "font-family": "IBM Plex Mono, monospace", "font-size": "10.5", fill: C.faint });
        t.textContent = `${v}°`;
        svg.append(t);
      });
      svg.append(el("line", { x1: mL, y1: Y(ambient), x2: W - mR, y2: Y(ambient), stroke: C.faint, "stroke-dasharray": "1 4", opacity: ".65" }));
      svg.append(el("line", { x1: mL, y1: Y(target), x2: W - mR, y2: Y(target), stroke: C.brass, "stroke-width": "1.5", "stroke-dasharray": "6 4" }));
      const goal = el("text", { x: W - mR - 2, y: Y(target) - 6, "text-anchor": "end", "font-family": "IBM Plex Mono, monospace", "font-size": "10.5", fill: C.brass });
      goal.textContent = "goal 21°";
      svg.append(goal);
      q(root,"[data-out=gain]").textContent = g.toFixed(2);
      q(root,"[data-out=delay]").textContent = `${d}${lang === "zh" ? " 步" : " steps"}`;
      const recent = data.slice(-80);
      const amp = Math.max(...recent) - Math.min(...recent);
      let crossings = 0, prev = 0;
      recent.forEach(v => {
        const s = Math.sign(v - target);
        if (prev && s && s !== prev) crossings++;
        if (s) prev = s;
      });
      const tt = T[lang];
      const st = sign === "pos"
        ? [tt.runaway, tt.positive, C.danger]
        : diverged || Math.max(...data.map(v => Math.abs(v))) > 80
          ? [tt.unstable, tt.break, C.danger]
          : amp > 1.2 && crossings >= 4
            ? [tt.hunt, tt.oscillate, C.warn]
            : amp > .4
              ? [tt.overshoot, tt.overshootExpl, C.warn]
              : [tt.stable, tt.calm, C.ok];
      svg.append(el("path", { d: path(data.map((v, i) => [X(i), Y(v)])), fill: "none", stroke: st[2], "stroke-width": 2.6, "stroke-linejoin": "round", "stroke-linecap": "round" }));
      const time = el("text", { x: (mL + W - mR) / 2, y: H - 5, "text-anchor": "middle", "font-family": "IBM Plex Mono, monospace", "font-size": "10.5", fill: C.faint });
      time.textContent = lang === "zh" ? "时间 →" : "time →";
      svg.append(time);
      q(root,"[data-out=state]").textContent = st[0];
      q(root,"[data-out=expl]").textContent = st[1];
    };
    qa(root,"[data-sign]").forEach(b => b.addEventListener("click", () => { sign = b.dataset.sign; setPressed(qa(root,"[data-sign]"), sign, "data-sign"); draw(); }));
    qa(root,"[data-preset]").forEach(b => b.addEventListener("click", () => {
      const p = b.dataset.preset; sign = p === "squeal" ? "pos" : "neg"; gain.value = p==="calm"?20:p==="hunt"?55:p==="tear"?88:55; delay.value = p==="calm"?4:p==="hunt"?22:p==="tear"?34:10; setPressed(qa(root,"[data-sign]"), sign, "data-sign"); draw();
    }));
    gain.addEventListener("input", draw); delay.addEventListener("input", draw); draw();
  }

  function initBathtub(root, lang) {
    const inf = q(root,"[data-role=in]"), out = q(root,"[data-role=out]"), flow = q(root,"[data-role=flow]"), level = q(root,"[data-role=level]");
    const presets = {
      co2: { inflow: 80, outflow: 30, start: 0 },
      balance: { inflow: 60, outflow: 30, start: 6 },
      empty: { inflow: 25, outflow: 30, start: 18 }
    };
    root.dataset.preset = root.dataset.preset || "co2";
    root.dataset.startStock = root.dataset.startStock || `${presets.co2.start}`;
    const draw = () => {
      const peak = Number(inf.value) / 10, drain = Number(out.value) / 10;
      const total = 200, peakAt = 100;
      const tri = t => Math.max(0, t <= peakAt ? t / peakAt : (2 * peakAt - t) / peakAt);
      const f = [], lev = [];
      let s = Number(root.dataset.startStock || "0");
      if (!Number.isFinite(s) || s < 0) s = 0;
      for (let i = 0; i <= total; i++) {
        f[i] = peak * tri(i);
      }
      lev[0] = s;
      for (let i = 1; i <= total; i++) {
        const net = ((f[i - 1] + f[i]) / 2) - drain;
        s = Math.max(0, s + net * 0.05);
        lev[i] = s;
      }
      const c1 = drain < peak && drain > 0 ? peakAt * drain / peak : drain <= 0 ? 0 : null;
      const c2 = drain < peak && drain > 0 ? 2 * peakAt - peakAt * drain / peak : drain <= 0 ? total : null;
      const drawFlow = () => {
        const W = 600, H = 150, mL = 40, mR = 14, mT = 14, mB = 22;
        const maxF = Math.max(peak, drain, 1) * 1.12;
        const X = t => mL + (t / total) * (W - mL - mR);
        const Y = v => mT + (1 - v / maxF) * (H - mT - mB);
        const legend = lang === "zh"
          ? ["蓝实线：流入（水龙头）", "棕虚线：流出（排水口）", "浅蓝区：流入 > 流出"]
          : ["solid blue: inflow (faucet)", "dashed brown: outflow (drain)", "pale fill: inflow > outflow"];
        clear(flow);
        flow.append(el("rect", { x: mL, y: mT, width: W - mL - mR, height: H - mT - mB, rx: 7, fill: C.paper, stroke: C.line }));
        if (c1 !== null && c2 !== null && c2 > c1) {
          const shaded = [[X(c1), Y(drain)]];
          for (let t = Math.ceil(c1); t <= Math.floor(c2); t++) shaded.push([X(t), Y(f[t])]);
          shaded.push([X(c2), Y(drain)]);
          flow.append(el("path", { d: `${path(shaded)} Z`, fill: `color-mix(in srgb, ${C.accent} 16%, transparent)` }));
        }
        flow.append(el("path", { d: path(f.map((v, i) => [X(i), Y(v)])), fill: "none", stroke: C.accent, "stroke-width": 2.4, "stroke-linejoin": "round" }));
        flow.append(el("line", { x1: mL, y1: Y(drain), x2: W - mR, y2: Y(drain), stroke: C.brass, "stroke-width": 2, "stroke-dasharray": "6 4" }));
        [c1, c2].forEach(c => {
          if (c !== null && c > 0 && c < total) flow.append(el("line", { x1: X(c), y1: mT, x2: X(c), y2: H - mB, stroke: C.faint, "stroke-dasharray": "2 3", opacity: ".7" }));
        });
        flow.append(el("rect", { x: mL + 8, y: mT + 8, width: W - mL - mR - 16, height: 34, rx: 7, fill: C.raised, stroke: C.line, opacity: ".94" }));
        flow.append(el("line", { x1: mL + 20, y1: mT + 20, x2: mL + 44, y2: mT + 20, stroke: C.accent, "stroke-width": 2.5, "stroke-linecap": "round" }));
        const inflowLegend = el("text", { x: mL + 50, y: mT + 23.5, "font-family": "IBM Plex Mono, monospace", "font-size": "10", fill: C.ink });
        inflowLegend.textContent = legend[0];
        flow.append(inflowLegend);
        const outX = lang === "zh" ? mL + 220 : mL + 242;
        flow.append(el("line", { x1: outX, y1: mT + 20, x2: outX + 24, y2: mT + 20, stroke: C.brass, "stroke-width": 2.1, "stroke-dasharray": "6 4", "stroke-linecap": "round" }));
        const outflowLegend = el("text", { x: outX + 30, y: mT + 23.5, "font-family": "IBM Plex Mono, monospace", "font-size": "10", fill: C.ink });
        outflowLegend.textContent = legend[1];
        flow.append(outflowLegend);
        flow.append(el("rect", { x: mL + 20, y: mT + 29, width: 24, height: 8, rx: 2, fill: `color-mix(in srgb, ${C.accent} 16%, transparent)` }));
        const fillLegend = el("text", { x: mL + 50, y: mT + 37.5, "font-family": "IBM Plex Mono, monospace", "font-size": "10", fill: C.faint });
        fillLegend.textContent = legend[2];
        flow.append(fillLegend);
      };
      const drawLevel = () => {
        const W = 600, H = 168, mL = 40, mR = 14, mT = 16, mB = 24;
        const maxL = Math.max(...lev, 1) * 1.12;
        const X = t => mL + (t / total) * (W - mL - mR);
        const Y = v => mT + (1 - v / maxL) * (H - mT - mB);
        const pk = lev.indexOf(Math.max(...lev));
        clear(level);
        level.append(el("rect", { x: mL, y: mT, width: W - mL - mR, height: H - mT - mB, rx: 7, fill: C.paper, stroke: C.line }));
        level.append(el("path", { d: `${path([[X(0), Y(0)], ...lev.map((v, i) => [X(i), Y(v)]), [X(total), Y(0)]])} Z`, fill: `color-mix(in srgb, ${C.accent} 13%, transparent)` }));
        if (lev[0] > 0) {
          level.append(el("line", { x1: mL, y1: Y(lev[0]), x2: W - mR, y2: Y(lev[0]), stroke: C.brass, "stroke-width": 1.4, "stroke-dasharray": "5 4", opacity: ".75" }));
          const startLabel = el("text", { x: W - mR - 6, y: Math.max(mT + 13, Y(lev[0]) - 5), "text-anchor": "end", "font-family": "IBM Plex Mono, monospace", "font-size": "10", fill: C.brass });
          startLabel.textContent = lang === "zh" ? "起点水位" : "starting level";
          level.append(startLabel);
        }
        level.append(el("path", { d: path(lev.map((v, i) => [X(i), Y(v)])), fill: "none", stroke: C.deep, "stroke-width": 2.8, "stroke-linejoin": "round" }));
        if (pk > 1 && pk < total) {
          level.append(el("line", { x1: X(pk), y1: mT, x2: X(pk), y2: H - mB, stroke: C.faint, "stroke-dasharray": "2 3", opacity: ".7" }));
          level.append(el("circle", { cx: X(pk), cy: Y(lev[pk]), r: 4.8, fill: C.deep }));
          const pt = el("text", { x: Math.min(X(pk) + 8, W - mR - 104), y: Y(lev[pk]) - 7, "font-family": "IBM Plex Mono, monospace", "font-size": "10.5", fill: C.deep });
          pt.textContent = lang === "zh" ? "水位峰值" : "level peaks here";
          level.append(pt);
        }
        const lab = el("text", { x: mL + 4, y: mT + 14, "font-family": "IBM Plex Mono, monospace", "font-size": "10.5", fill: C.deep });
        lab.textContent = lang === "zh" ? "水位（存量）" : "water level (stock)";
        level.append(lab);
        level.append(el("circle", { cx: X(total), cy: Y(lev[total]), r: 4.2, fill: C.deep, stroke: C.raised, "stroke-width": 2 }));
        const endLabel = el("text", { x: W - mR - 8, y: Math.max(mT + 13, Math.min(H - mB - 6, Y(lev[total]) - 7)), "text-anchor": "end", "font-family": "IBM Plex Mono, monospace", "font-size": "10", fill: C.deep });
        endLabel.textContent = lang === "zh" ? "终点" : "end";
        level.append(endLabel);
        const time = el("text", { x: (mL + W - mR) / 2, y: H - 5, "text-anchor": "middle", "font-family": "IBM Plex Mono, monospace", "font-size": "10.5", fill: C.faint });
        time.textContent = lang === "zh" ? "时间 →" : "time →";
        level.append(time);
      };
      drawFlow();
      drawLevel();
      q(root,"[data-out=in]").textContent = peak.toFixed(1);
      q(root,"[data-out=out]").textContent = drain.toFixed(1);
      const tt = T[lang];
      const preset = root.dataset.preset || "";
      q(root,"[data-out=msg]").textContent = preset === "co2"
        ? tt.co2Case
        : preset === "balance"
          ? tt.balanceCase
          : preset === "empty"
            ? tt.emptyCase
            : drain >= peak ? tt.falling : (c2 !== null ? tt.rising : tt.peak);
    };
    qa(root,"[data-preset]").forEach(b => b.addEventListener("click", () => {
      const p=b.dataset.preset;
      const preset = presets[p] || presets.co2;
      inf.value = `${preset.inflow}`;
      out.value = `${preset.outflow}`;
      root.dataset.startStock = `${preset.start}`;
      root.dataset.preset = p;
      draw();
    }));
    inf.addEventListener("input", () => { root.dataset.preset = "custom"; draw(); });
    out.addEventListener("input", () => { root.dataset.preset = "custom"; draw(); });
    draw();
  }

  function initTipping(root, lang) {
    const slider = q(root,"[data-role=driver]"), svg=q(root,"[data-role=plot]");
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tt = T[lang];
    const W = 600, H = 330, mL = 20, mR = 20, mT = 24, mB = 32, xmin = -1.8, xmax = 1.8, Vlo = -1.0, Vhi = 1.1;
    const PX = x => mL + ((x - xmin) / (xmax - xmin)) * (W - mL - mR);
    const PY = v => mT + (1 - (Math.max(Vlo, Math.min(Vhi, v)) - Vlo) / (Vhi - Vlo)) * (H - mT - mB);
    const V = (x, h) => x*x*x*x/4 - x*x/2 - h*x;
    let ballSide = -1, curX = -1, targetX = -1, trail = [], tippedFlash = 0, stopped = false;

    const stableRoots = h => {
      const roots = [];
      const f = x => x*x*x - x - h;
      let px = xmin, prev = f(px);
      for (let x = xmin + .006; x <= xmax; x += .006) {
        const cur = f(x);
        if ((prev < 0 && cur > 0) || (prev > 0 && cur < 0)) {
          let a = px, b = x, fa = prev;
          for (let k = 0; k < 36; k++) {
            const mid = (a + b) / 2, fm = f(mid);
            if ((fa < 0 && fm < 0) || (fa > 0 && fm > 0)) { a = mid; fa = fm; } else { b = mid; }
          }
          roots.push((a + b) / 2);
        }
        prev = cur;
        px = x;
      }
      return roots.filter(r => (3*r*r - 1) > 0);
    };
    const pickBall = h => {
      const roots = stableRoots(h);
      const same = roots.filter(r => ballSide < 0 ? r < 0 : r > 0);
      if (same.length) return { x: same[0], tipped: false };
      if (roots.length) {
        const x = roots[0];
        ballSide = Math.sign(x) || ballSide;
        return { x, tipped: true };
      }
      return { x: 0, tipped: false };
    };
    const metrics = x => {
      const curv = Math.max(.0001, 3*x*x - 1);
      return { curv, variance: 1 / curv, ac: Math.exp(-curv * .9) };
    };
    const status = m => {
      if (tippedFlash > 0) return [tt.tipped, tt.hysteresis, C.danger];
      if (m.curv > .55) return [tt.safe, tt.resGood, C.ok];
      if (m.curv > .18) return [tt.resilience, tt.resWarn, C.warn];
      return [tt.edge, tt.resEdge, C.danger];
    };
    const draw = () => {
      const h = Number(slider.value) / 100;
      const picked = pickBall(h);
      if (picked.tipped) { tippedFlash = 1; trail = []; }
      targetX = picked.x;
      const m = metrics(targetX);
      const spread = Math.min(.55, .04 * Math.sqrt(m.variance));
      if (!reduce) {
        curX += (targetX - curX) * .25;
        curX += (Math.random() - .5) * spread * .3;
        curX = targetX + (curX - targetX) * .85;
        trail.push(curX);
        if (trail.length > 26) trail.shift();
      } else {
        curX = targetX;
      }
      clear(svg);
      svg.append(el("rect", { x: mL, y: mT, width: W - mL - mR, height: H - mT - mB, rx: 8, fill: C.paper, stroke: C.line }));
      const pts = [];
      for (let i = 0; i <= 180; i++) {
        const x = xmin + i * (xmax - xmin) / 180;
        pts.push([PX(x), PY(V(x, h))]);
      }
      svg.append(el("path", { d: path(pts), fill: "none", stroke: C.soft || C.faint, "stroke-width": 2.4, "stroke-linejoin": "round" }));
      trail.forEach((x, i) => {
        svg.append(el("circle", { cx: PX(x), cy: PY(V(x, h)), r: 3, fill: C.danger, opacity: (i / Math.max(1, trail.length) * .42 + .06).toFixed(2) }));
      });
      svg.append(el("circle", { cx: PX(curX), cy: PY(V(curX, h)) - 1, r: 11, fill: tippedFlash > 0 ? C.danger : C.accent, stroke: C.raised, "stroke-width": 3 }));
      const axis = el("text", { x: W / 2, y: H - 8, "text-anchor": "middle", "font-family": "IBM Plex Mono, monospace", "font-size": "10.5", fill: C.faint });
      axis.textContent = lang === "zh" ? "系统状态 →（山谷 = 稳定；山脊 = 不稳定）" : "system state → (valleys = stable; ridge = unstable)";
      svg.append(axis);
      [["state A", -1], ["state B", 1]].forEach(([label, x]) => {
        const t = el("text", { x: PX(x), y: mT + 15, "text-anchor": "middle", "font-family": "IBM Plex Mono, monospace", "font-size": "10.5", fill: C.faint });
        t.textContent = lang === "zh" ? (x < 0 ? "状态 A" : "状态 B") : label;
        svg.append(t);
      });
      q(root,"[data-out=driver]").textContent = `${h >= 0 ? "+" : ""}${h.toFixed(2)}`;
      const resN = Math.max(0, Math.min(1, m.curv / 2));
      q(root,"[data-bar=res]").style.width = `${Math.max(6, resN * 100).toFixed(0)}%`;
      q(root,"[data-bar=res]").style.background = m.curv > .55 ? C.ok : m.curv > .18 ? C.warn : C.danger;
      q(root,"[data-out=res]").textContent = m.curv > .55 ? tt.high : m.curv > .18 ? tt.fallingRes : tt.critical;
      const varN = Math.max(0, Math.min(1, (m.variance - 1) / 12));
      q(root,"[data-bar=var]").style.width = `${Math.max(6, varN * 100).toFixed(0)}%`;
      q(root,"[data-out=var]").textContent = m.variance < 1.6 ? tt.low : m.variance < 4 ? tt.fallingRes : tt.high;
      q(root,"[data-bar=ac]").style.width = `${Math.max(6, m.ac * 100).toFixed(0)}%`;
      q(root,"[data-out=ac]").textContent = m.ac.toFixed(2);
      const st = status(m);
      q(root,"[data-out=state]").textContent = st[0];
      q(root,"[data-out=expl]").textContent = st[1];
      if (tippedFlash > 0) tippedFlash = Math.max(0, tippedFlash - .025);
    };
    const frame = () => {
      if (stopped || !root.isConnected) return;
      draw();
      if (!reduce) requestAnimationFrame(frame);
    };
    qa(root,"[data-preset]").forEach(b => b.addEventListener("click", () => {
      if (b.dataset.preset === "reset") { ballSide = -1; slider.value = -25; curX = -1; trail = []; tippedFlash = 0; }
      if (b.dataset.preset === "edge") { ballSide = -1; slider.value = 38; curX = -.62; trail = []; tippedFlash = 0; }
      if (b.dataset.preset === "safe") { ballSide = -1; slider.value = -34; curX = -1.1; trail = []; tippedFlash = 0; }
      if (reduce) draw();
    }));
    slider.addEventListener("input", () => { if (reduce) draw(); });
    if (reduce) draw(); else requestAnimationFrame(frame);
  }

  function initLeverage(root, lang) {
    const host=q(root,"[data-role=ladder]"), items=T[lang].ladder;
    host.innerHTML="";
    items.forEach((it, idx) => {
      const b=document.createElement("button"); b.className="day9-rung"; b.setAttribute("aria-expanded", idx===0 ? "true":"false");
      b.innerHTML=`<span>${it[0]}</span><strong>${it[1]}</strong><em>${it[2]}</em>`;
      b.addEventListener("click",()=>b.setAttribute("aria-expanded", b.getAttribute("aria-expanded")==="true"?"false":"true"));
      host.appendChild(b);
    });
  }

  function daisy(L) {
    const dead = -22 + L * 44;
    const growth = t => Math.max(0, 1 - Math.pow((t - 22) / 18, 2));
    let black = 0.02, white = 0.02, bare = 0.96, temp = dead;
    for (let k = 0; k < 36; k++) {
      const albedo = black * 0.25 + white * 0.75 + bare * 0.5;
      temp = dead + (0.5 - albedo) * 36;
      const blackLocal = temp + 7.5;
      const whiteLocal = temp - 7.5;
      let nb = growth(blackLocal) * Math.max(0, 1 - Math.max(0, L - 1.42) * 2.2);
      let nw = growth(whiteLocal) * Math.max(0, 1 - Math.max(0, 0.74 - L) * 2.5);
      const total = nb + nw;
      if (total < 0.035) {
        black = 0; white = 0; bare = 1; temp = dead;
        break;
      }
      const cover = Math.min(0.82, 0.2 + total * 0.48);
      black = cover * nb / total;
      white = cover * nw / total;
      bare = Math.max(0, 1 - black - white);
    }
    const albedo = black * 0.25 + white * 0.75 + bare * 0.5;
    const life = black || white ? dead + (0.5 - albedo) * 36 : dead;
    return {dead, life, black, white, bare};
  }
  function initDaisy(root, lang) {
    const slider=q(root,"[data-role=lum]"), svg=q(root,"[data-role=plot]");
    const draw = () => {
      const L=Number(slider.value)/100, d=daisy(L), tt=T[lang];
      clear(svg);
      const W=600,H=330,mL=54,mR=18,mT=20,mB=38,yMin=-8,yMax=54;
      const x = v => mL + (v-.35)/1.35*(W-mL-mR);
      const y = v => mT + (1 - (v-yMin)/(yMax-yMin))*(H-mT-mB);
      const defs = el("defs");
      const warmMarker = el("marker", { id: "day9-daisy-warm-arrow", markerWidth: 7, markerHeight: 7, refX: 6, refY: 3.5, orient: "auto" });
      warmMarker.append(el("path", { d: "M0,0 L7,3.5 L0,7 z", fill: C.warn }));
      const coolMarker = el("marker", { id: "day9-daisy-cool-arrow", markerWidth: 7, markerHeight: 7, refX: 6, refY: 3.5, orient: "auto" });
      coolMarker.append(el("path", { d: "M0,0 L7,3.5 L0,7 z", fill: C.ok }));
      defs.append(warmMarker, coolMarker);
      svg.append(defs);
      svg.append(el("rect",{x:0,y:0,width:W,height:H,rx:10,fill:C.raised,stroke:C.line}));
      svg.append(el("rect",{x:mL,y:mT,width:W-mL-mR,height:H-mT-mB,rx:8,fill:C.paper,stroke:C.line,opacity:.72}));
      svg.append(el("rect",{x:x(.35),y:mT,width:x(.45)-x(.35),height:H-mT-mB,fill:`color-mix(in srgb, ${C.danger} 11%, transparent)`}));
      svg.append(el("rect",{x:x(1.52),y:mT,width:x(1.7)-x(1.52),height:H-mT-mB,fill:`color-mix(in srgb, ${C.danger} 11%, transparent)`}));
      svg.append(el("rect",{x:x(.55),y:y(30),width:x(1.45)-x(.55),height:y(12)-y(30),fill:`color-mix(in srgb, ${C.ok} 15%, transparent)`}));
      [0,15,30,45].forEach(v=>{
        svg.append(el("line",{x1:mL,y1:y(v),x2:W-mR,y2:y(v),stroke:C.line,"stroke-dasharray":"2 5"}));
        const t=el("text",{x:mL-8,y:y(v)+3,"text-anchor":"end","font-family":"IBM Plex Mono, monospace","font-size":"10.5",fill:C.faint}); t.textContent=`${v}°`; svg.append(t);
      });
      svg.append(el("line",{x1:mL,y1:mT,x2:mL,y2:H-mB,stroke:C.line}));
      svg.append(el("line",{x1:mL,y1:H-mB,x2:W-mR,y2:H-mB,stroke:C.line}));
      const xs=[]; for(let i=35;i<=170;i+=2){ const lx=i/100, dd=daisy(lx); xs.push({x:lx,life:dd.life,dead:dd.dead}); }
      svg.append(el("path",{d:path(xs.map(p=>[x(p.x),y(p.dead)])),fill:"none",stroke:C.faint,"stroke-width":2,"stroke-dasharray":"5 5"}));
      svg.append(el("path",{d:path(xs.map(p=>[x(p.x),y(p.life)])),fill:"none",stroke:C.accent,"stroke-width":3.2,"stroke-linecap":"round","stroke-linejoin":"round"}));
      const warm = daisy(.58), cool = daisy(1.34);
      svg.append(el("line",{x1:x(.58),y1:y(warm.dead),x2:x(.58),y2:y(warm.life),stroke:C.warn,"stroke-width":1.8,"marker-end":"url(#day9-daisy-warm-arrow)"}));
      svg.append(el("line",{x1:x(1.34),y1:y(cool.dead),x2:x(1.34),y2:y(cool.life),stroke:C.ok,"stroke-width":1.8,"marker-end":"url(#day9-daisy-cool-arrow)"}));
      svg.append(el("line",{x1:x(L),y1:mT,x2:x(L),y2:H-mB,stroke:C.brass,"stroke-width":1.5,"stroke-dasharray":"4 4"}));
      svg.append(el("circle",{cx:x(L),cy:y(d.life),r:7,fill:C.accent,stroke:C.raised,"stroke-width":2}));
      svg.append(el("circle",{cx:x(L),cy:y(d.dead),r:4,fill:C.faint}));
      const plateau = el("text",{x:x(1),y:y(31)-9,"text-anchor":"middle","font-family":"IBM Plex Mono, monospace","font-size":"10.5",fill:C.ok}); plateau.textContent=tt.plateau; svg.append(plateau);
      const coldFail = el("text",{x:x(.4),y:mT+16,"text-anchor":"middle","font-family":"IBM Plex Mono, monospace","font-size":"10.5",fill:C.danger}); coldFail.textContent=tt.coldFail; svg.append(coldFail);
      const hotFail = el("text",{x:x(1.61),y:mT+16,"text-anchor":"middle","font-family":"IBM Plex Mono, monospace","font-size":"10.5",fill:C.danger}); hotFail.textContent=tt.hotFail; svg.append(hotFail);
      const warmLabel = el("text",{x:x(.62),y:y(8)-8,"font-family":"IBM Plex Mono, monospace","font-size":"10.5",fill:C.warn}); warmLabel.textContent=tt.blackWarms; svg.append(warmLabel);
      const coolLabel = el("text",{x:x(1.16),y:y(35)+3,"font-family":"IBM Plex Mono, monospace","font-size":"10.5",fill:C.ok}); coolLabel.textContent=tt.whiteCools; svg.append(coolLabel);
      const labLife = el("text",{x:x(1.31),y:y(daisy(1.28).life)+15,"text-anchor":"middle","font-family":"IBM Plex Mono, monospace","font-size":"10.5",fill:C.accent}); labLife.textContent=tt.withLife; svg.append(labLife);
      const labRock = el("text",{x:x(1.46),y:y(daisy(1.46).dead)-8,"text-anchor":"middle","font-family":"IBM Plex Mono, monospace","font-size":"10.5",fill:C.faint}); labRock.textContent=tt.rock; svg.append(labRock);
      const axis = el("text",{x:(mL+W-mR)/2,y:H-10,"text-anchor":"middle","font-family":"IBM Plex Mono, monospace","font-size":"10.5",fill:C.faint}); axis.textContent=tt.luminosity; svg.append(axis);
      q(root,"[data-out=lum]").textContent=L.toFixed(2); q(root,"[data-out=life]").textContent=`${d.life.toFixed(1)}°C`; q(root,"[data-out=dead]").textContent=`${d.dead.toFixed(1)}°C`;
      q(root,"[data-seg=black]").style.width=`${d.black*100}%`; q(root,"[data-seg=white]").style.width=`${d.white*100}%`; q(root,"[data-seg=bare]").style.width=`${d.bare*100}%`;
      q(root,"[data-out=state]").textContent = !d.black && !d.white ? (L < .72 ? tt.daisyDead : tt.daisyHot) : d.black > d.white * 1.4 ? tt.daisyCold : d.white > d.black * 1.4 ? tt.daisyWhite : tt.daisyGood;
    };
    qa(root,"[data-preset]").forEach(b=>b.addEventListener("click",()=>{slider.value=b.dataset.preset; draw();}));
    slider.addEventListener("input", draw); draw();
  }

  function initClassifier(root, lang) {
    let mode="fold"; const svg=q(root,"[data-role=plot]");
    const draw=()=> {
      const tt=T[lang], W=600,H=300,mL=48,mR=18,mT=18,mB=32;
      clear(svg);
      svg.append(el("rect",{x:0,y:0,width:W,height:H,rx:10,fill:C.raised,stroke:C.line}));
      svg.append(el("rect",{x:mL,y:mT,width:W-mL-mR,height:H-mT-mB,rx:8,fill:C.paper,stroke:C.line}));
      [0.25,0.5,0.75].forEach(g=>svg.append(el("line",{x1:mL,y1:mT+g*(H-mT-mB),x2:W-mR,y2:mT+g*(H-mT-mB),stroke:C.line,"stroke-dasharray":"2 5"})));
      const X=t=>mL+t*(W-mL-mR), Y=v=>mT+(1-v)*(H-mT-mB);
      const pts=[]; const warn=[];
      for(let i=0;i<150;i++){
        const t=i/149; let v;
        if(mode==="fold") v=.28+t*.23+(t>.73?Math.pow((t-.73)/.27,2)*.38:0);
        else if(mode==="hopf") v=.52+Math.sin(t*46)*(0.025+t*.16);
        else v=.26+t*.48-.08*Math.exp(-t*8);
        pts.push([X(t),Y(v)]);
        warn.push([X(t),Y(.18+Math.pow(t,1.7)*.58)]);
      }
      svg.append(el("path",{d:path(warn),fill:"none",stroke:C.warn,"stroke-width":2,"stroke-dasharray":"4 5",opacity:.82}));
      svg.append(el("path",{d:path(pts),fill:"none",stroke:C.accent,"stroke-width":3.1,"stroke-linecap":"round","stroke-linejoin":"round"}));
      if(mode==="trans"){
        const other=[]; for(let i=0;i<150;i++){ const t=i/149; other.push([X(t),Y(.78-t*.45)]); }
        svg.append(el("path",{d:path(other),fill:"none",stroke:C.faint,"stroke-width":2,"stroke-dasharray":"5 5"}));
      }
      const marker=pts[Math.floor(pts.length*.78)];
      svg.append(el("circle",{cx:marker[0],cy:marker[1],r:6.5,fill:C.accent,stroke:C.raised,"stroke-width":2}));
      const warnLabel=el("text",{x:mL+10,y:H-mB-12,"font-family":"IBM Plex Mono, monospace","font-size":"10.5",fill:C.warn}); warnLabel.textContent=tt.sharedWarn; svg.append(warnLabel);
      const fp=el("text",{x:W-mR-8,y:mT+17,"text-anchor":"end","font-family":"IBM Plex Mono, monospace","font-size":"10.5",fill:C.accent}); fp.textContent=tt.fingerprint; svg.append(fp);
      const landingText = mode==="fold" ? tt.foldLand : mode==="hopf" ? tt.hopfLand : tt.transLand;
      const land=el("text",{x:W-mR-8,y:mT+36,"text-anchor":"end","font-family":"IBM Plex Mono, monospace","font-size":"10.5",fill:C.faint}); land.textContent=landingText; svg.append(land);
      q(root,"[data-bar=var]").style.width=mode==="trans"?"66%":"84%"; q(root,"[data-bar=ac]").style.width=mode==="hopf"?"72%":"90%";
      q(root,"[data-out=var]").textContent=mode==="trans"?T[lang].medium:T[lang].high;
      q(root,"[data-out=ac]").textContent=mode==="hopf"?(lang==="zh"?"相位线索":"phase clue"):"→ 1";
      const c=tt.classifier[mode]; q(root,"[data-out=state]").textContent=c[0]; q(root,"[data-out=expl]").textContent=c[1];
    };
    qa(root,"[data-bc]").forEach(b=>b.addEventListener("click",()=>{mode=b.dataset.bc; setPressed(qa(root,"[data-bc]"),mode,"data-bc"); draw();}));
    draw();
  }

  function initEvasion(root, lang) {
    let patterned=false; const slider=q(root,"[data-role=stress]"), svg=q(root,"[data-role=plot]"), grid=q(root,"[data-role=grid]");
    const paintGrid=(stress)=>{ grid.innerHTML=""; for(let i=0;i<64;i++){ const cell=document.createElement("i"); const r=Math.hypot((i%8)-3.5,Math.floor(i/8)-3.5); const alive=patterned ? (Math.sin(i*2.3+stress*8)+Math.cos(r*2.4)>-.2 && stress<.92) : stress<.58; cell.style.opacity=alive?1:.18; grid.appendChild(cell);} };
    const draw=()=> {
      const s=Number(slider.value)/100; clear(svg); axes(svg,600,300);
      const hom=[], pat=[]; for(let i=0;i<=100;i++){ const x=i/100; hom.push([50+x*520,240-(x<.58?160-95*x:8)]); pat.push([50+x*520,240-(x<.9?150-85*x+18*Math.sin(x*10):10)]); }
      svg.append(el("path",{d:path(hom),fill:"none",stroke:C.danger,"stroke-width":3,"stroke-dasharray": patterned ? "3 5":"0"}));
      svg.append(el("path",{d:path(pat),fill:"none",stroke:C.accent,"stroke-width":3,opacity:patterned?1:.35}));
      svg.append(el("circle",{cx:50+s*520,cy: patterned ? 240-(s<.9?150-85*s+18*Math.sin(s*10):10) : 240-(s<.58?160-95*s:8),r:7,fill:patterned?C.accent:C.danger}));
      q(root,"[data-out=stress]").textContent=s.toFixed(2); paintGrid(s);
      q(root,"[data-out=state]").textContent = patterned ? (s>.82?T[lang].evSparse:T[lang].evPattern) : (s>.58?T[lang].evCrash:T[lang].evHold);
      q(root,"[data-out=expl]").textContent = "";
    };
    qa(root,"[data-ev]").forEach(b=>b.addEventListener("click",()=>{patterned=b.dataset.ev==="on"; setPressed(qa(root,"[data-ev]"),patterned?"on":"off","data-ev"); draw();}));
    slider.addEventListener("input", draw); draw();
  }

  const initRoot = root => {
    if (root.dataset.day9Ready) return;
    root.dataset.day9Ready = "1";
    const kind=root.dataset.day9Kind, lang=root.dataset.locale || "en";
    if (kind==="feedback") initFeedback(root, lang);
    if (kind==="bathtub") initBathtub(root, lang);
    if (kind==="tipping") initTipping(root, lang);
    if (kind==="leverage") initLeverage(root, lang);
    if (kind==="daisyworld") initDaisy(root, lang);
    if (kind==="classifier") initClassifier(root, lang);
    if (kind==="evasion") initEvasion(root, lang);
  };

  const roots = Array.from(document.querySelectorAll("[data-day9-kind]"));
  if (!("IntersectionObserver" in window)) {
    roots.forEach(initRoot);
    return;
  }
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      initRoot(entry.target);
    });
  }, { rootMargin: "160px 0px" });
  roots.forEach(root => {
    if (root.dataset.day9Ready) return;
    observer.observe(root);
  });
})();
