(function(){
  "use strict";

  var root = document.documentElement;
  var isZh = (root.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;

  document.querySelectorAll(".modal-rings").forEach(function(panel){
    var mrSat = panel.querySelector(".modal-satellites");
    var mrCore = panel.querySelector(".modal-core");
    var mrVerdict = panel.querySelector(".modal-verdict");
    var mrExpl = panel.querySelector(".modal-explainer");
    var mrBtns = panel.querySelectorAll(".mr-btn");
    if(!mrSat || !mrCore || !mrVerdict || !mrExpl || !mrBtns.length) return;

    var ns = "http://www.w3.org/2000/svg";
    var N = 12;
    var cx = 180;
    var cy = 150;
    var R = 92;
    var scenarios = isZh ? {
      know: {
        reds: [],
        safe: true,
        label: "安全：属于知识",
        expl: "正常运行的钟被准确读出。即便时间微调，你的判断依然能追踪真实。"
      },
      gettier: {
        reds: [0,1,2,3,4,5,6,7,8,9,10],
        safe: false,
        label: "不安全：真理运气",
        expl: "停摆的大钟仅在此时碰巧正确；在绝大多数邻近时刻，这一信念都将导向谬误。"
      },
      barn: {
        reds: [1,2,4,5,7,8,10,11],
        safe: false,
        label: "不安全：环境运气",
        expl: "你确实看到了真谷仓，但由于周遭充斥着布景板，你的成功纯属环境带来的偶然。"
      }
    } : {
      know: {
        reds: [],
        safe: true,
        label: "safe: knowledge",
        expl: "A working clock, read correctly. Vary the moment slightly and you are still right."
      },
      gettier: {
        reds: [0,1,2,3,4,5,6,7,8,9,10],
        safe: false,
        label: "unsafe: veritic luck",
        expl: "The stopped clock is true here, but almost every nearby moment would make the same belief false."
      },
      barn: {
        reds: [1,2,4,5,7,8,10,11],
        safe: false,
        label: "unsafe: environmental luck",
        expl: "You see the real barn, but nearby looks would mostly land on facades."
      }
    };

    function drawSatellites(reds){
      while(mrSat.firstChild) mrSat.removeChild(mrSat.firstChild);
      for(var i = 0; i < N; i++){
        var ang = (i / N) * 2 * Math.PI - Math.PI / 2;
        var x = cx + R * Math.cos(ang);
        var y = cy + R * Math.sin(ang);
        var isRed = reds.indexOf(i) > -1;
        var circle = document.createElementNS(ns, "circle");
        circle.setAttribute("cx", x.toFixed(1));
        circle.setAttribute("cy", y.toFixed(1));
        circle.setAttribute("r", "12");
        circle.setAttribute("fill", isRed ? "color-mix(in srgb,var(--contested) 20%,transparent)" : "color-mix(in srgb,var(--ok) 18%,transparent)");
        circle.setAttribute("stroke", isRed ? "var(--contested)" : "var(--ok)");
        circle.setAttribute("stroke-width", "1.8");
        mrSat.appendChild(circle);

        var text = document.createElementNS(ns, "text");
        text.setAttribute("x", x.toFixed(1));
        text.setAttribute("y", (y + 3.5).toFixed(1));
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-family", "IBM Plex Mono, monospace");
        text.setAttribute("font-size", "9");
        text.setAttribute("fill", isRed ? "var(--contested)" : "var(--ok)");
        text.textContent = isRed ? "x" : "✓";
        mrSat.appendChild(text);
      }
    }
    function renderModal(key){
      var d = scenarios[key] || scenarios.know;
      drawSatellites(d.reds);
      mrCore.setAttribute("fill", "color-mix(in srgb,var(--ok) 22%,transparent)");
      mrVerdict.className = "mr-verdict modal-verdict " + (d.safe ? "safe" : "unsafe");
      mrVerdict.textContent = d.label;
      mrExpl.textContent = d.expl;
      mrBtns.forEach(function(button){
        button.setAttribute("aria-pressed", button.getAttribute("data-scn") === key ? "true" : "false");
      });
    }
    mrBtns.forEach(function(button){
      button.addEventListener("click", function(){ renderModal(button.getAttribute("data-scn")); });
    });
    renderModal("know");
  });
})();
