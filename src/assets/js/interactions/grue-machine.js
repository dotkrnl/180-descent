(function(){
  "use strict";

  var isZh = (document.documentElement.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;
  var svgNS = "http://www.w3.org/2000/svg";
  var green = "#2f9e57";
  var blue = "#2f73c4";

  function textSet() {
    return isZh ? {
      tieTitle: "僵局仍在",
      tieBody: '你检查过的每一颗祖母绿都是绿色的；这个事实既支持「全绿」理论，也同等程度地支持「全绿蓝」理论。两个平行世界在你已见的宝石上完全重合；它们仅在 <span class="term">t</span> 之后的阴影区域分岔，而你尚未抵达那里。古德曼的要点在于：无论过往证据多么庞大，它本身都无法指引你该将哪一种规律性投射到未来。',
      brokenTitle: "现实终于打破僵局",
      brokenBody: '此刻你正在检查 <span class="term">t</span> 之后的祖母绿；两个世界终于给出了截然不同、可供检验的预言（绿色 vs. 蓝色）。现实终于可以裁决孰是孰非。但请注意其代价：你必须身处未来。在跨越 <span class="term">t</span> 之前，即便所有证据已在手，绿色与绿蓝之间仍然严格地处于「欠决定」状态。这正是问题的深刻与不安所在。'
    } : {
      tieTitle: "The tie holds",
      tieBody: "Every emerald you've examined is green, and that fact is <em>exactly</em> as good evidence for \"all green\" as for \"all grue.\" The two worlds agree on every gem you've actually seen; they only diverge in the shaded region beyond <strong>t</strong>, which you haven't reached. Goodman's point: no amount of past evidence, however vast, tells you which regularity to carry forward.",
      brokenTitle: "Reality finally breaks the tie",
      brokenBody: "Now you're examining emeralds past <strong>t</strong>, and at last the worlds make <em>different</em>, checkable predictions (green vs. blue). Reality can now decide. But notice what it took: you had to physically cross into the future. <em>Before</em> t, with all your evidence in hand, the choice between green and grue was strictly underdetermined, which was the whole, unsettling point."
    };
  }

  function byPrefix(prefix, suffix) {
    return document.getElementById(prefix + suffix);
  }

  function xFor(value) {
    return 60 + (value / 100) * (600 - 60);
  }

  function yearFor(value) {
    return Math.round(2016 + (value / 100) * (2068 - 2016));
  }

  function gem(cx, cy, fill, solid) {
    var rect = document.createElementNS(svgNS, "rect");
    var size = 15;
    rect.setAttribute("x", cx - size / 2);
    rect.setAttribute("y", cy - size / 2);
    rect.setAttribute("width", size);
    rect.setAttribute("height", size);
    rect.setAttribute("rx", 3);
    rect.setAttribute("transform", "rotate(45 " + cx + " " + cy + ")");
    rect.setAttribute("fill", solid ? fill : "transparent");
    rect.setAttribute("stroke", fill);
    rect.setAttribute("stroke-width", solid ? "1" : "2");
    if (!solid) rect.setAttribute("stroke-dasharray", "2.5 2.5");
    return rect;
  }

  document.querySelectorAll('[id$="grueSvg"]').forEach(function(svg) {
    var prefix = svg.id.slice(0, -"grueSvg".length);
    var greenRow = byPrefix(prefix, "greenRow");
    var grueRow = byPrefix(prefix, "grueRow");
    var nowLine = byPrefix(prefix, "nowLine");
    var nowLabel = byPrefix(prefix, "nowLabel");
    var tLine = byPrefix(prefix, "tLine");
    var tLabel = byPrefix(prefix, "tLabel");
    var divZone = byPrefix(prefix, "divZone");
    var range = byPrefix(prefix, "nowRange");
    var nowVal = byPrefix(prefix, "nowVal");
    var readout = byPrefix(prefix, "grueReadout");
    var readoutTitle = byPrefix(prefix, "grueRH");
    var readoutBody = byPrefix(prefix, "grueRBody");
    if (!greenRow || !grueRow || !nowLine || !nowLabel || !tLine || !tLabel || !divZone || !range || !nowVal || !readout || !readoutTitle || !readoutBody) return;

    var copy = textSet();
    var tTime = 66;
    var gemTimes = [6, 14, 23, 32, 41, 50, 59, 68, 77, 86, 95];
    var tx = xFor(tTime);
    tLine.setAttribute("x1", tx);
    tLine.setAttribute("x2", tx);
    tLabel.setAttribute("x", tx);

    function render() {
      var nowTime = Number(range.value);
      var nx = xFor(nowTime);
      nowLine.setAttribute("x1", nx);
      nowLine.setAttribute("x2", nx);
      nowLabel.setAttribute("x", nx);
      nowVal.textContent = yearFor(nowTime);
      divZone.setAttribute("x", xFor(tTime));
      divZone.setAttribute("width", Math.max(0, 600 - xFor(tTime)));
      divZone.setAttribute("opacity", "0.55");

      greenRow.textContent = "";
      grueRow.textContent = "";
      gemTimes.forEach(function(time) {
        var cx = xFor(time);
        var examined = time <= nowTime;
        greenRow.appendChild(gem(cx, 44, green, examined));
        grueRow.appendChild(gem(cx, 134, time < tTime ? green : blue, examined));
      });

      var pastCutoff = nowTime >= tTime;
      readout.className = "grue-readout " + (pastCutoff ? "broken" : "tie");
      readoutTitle.textContent = pastCutoff ? copy.brokenTitle : copy.tieTitle;
      readoutBody.innerHTML = pastCutoff ? copy.brokenBody : copy.tieBody;
    }

    range.addEventListener("input", render);
    render();
  });
})();
