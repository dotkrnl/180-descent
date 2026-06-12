(function(){
  "use strict";

  var root = document.documentElement;
  var isZh = (root.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;
  var copy = isZh ? {
    coherentTitle: "\u878d\u8d2f - \u672a\u88ab\u652f\u914d",
    coherentBody: function(sum){
      return "\u4f60\u7684\u7f6e\u4fe1\u5ea6\u603b\u548c\u4e3a <code>" + sum + "</code>\uff0c\u6240\u4ee5\u8fd9\u4e2a\u70b9\u843d\u5728\u76f4\u7ebf\u4e0a\u3002\u6ca1\u6709\u5176\u4ed6\u7f6e\u4fe1\u5ea6\u5728<em>\u6bcf\u4e00\u4e2a</em>\u4e16\u754c\u4e2d\u90fd\u66f4\u63a5\u8fd1\u771f\u7406\u2014\u2014\u4f60\u4e0d\u4f1a\u88ab\u51c6\u786e\u6027\u652f\u914d\u3002\u8fd9\u4e0e\u7b2c 1 \u65e5\u7684\u8377\u5170\u8d4c\u7ed9\u51fa\u540c\u4e00\u88c1\u51b3\uff0c\u53ea\u662f\u6ca1\u6709\u4e0b\u6ce8\u3002";
    },
    coherentCaption: "\u5728\u7ebf\u4e0a\uff1a\u6ca1\u6709\u522b\u7684\u7f6e\u4fe1\u5ea6\u80fd\u5728\u771f\u7406\u4e0a\u51fb\u8d25\u4f60\u3002",
    dominatedTitle: "\u4e0d\u878d\u8d2f - \u88ab\u51c6\u786e\u6027\u652f\u914d",
    dominatedBody: function(sum, dP1, dS1, dP2, dS2){
      return "\u603b\u548c = <code>" + sum + "</code>\uff0c\u504f\u79bb\u76f4\u7ebf\u3002\u7eff\u70b9\uff08\u6700\u8fd1\u7684\u878d\u8d2f\u7f6e\u4fe1\u5ea6\uff09\u5728<strong>\u4e24\u4e2a</strong>\u4e16\u754c\u4e2d\u90fd\u66f4\u63a5\u8fd1\u771f\u7406\uff1a\u5982\u679c S \u4e3a\u771f\uff0c" + dP1 + "&nbsp;\u2192&nbsp;" + dS1 + "\uff1b\u5982\u679c S \u4e3a\u5047\uff0c" + dP2 + "&nbsp;\u2192&nbsp;" + dS2 + "\u3002\u65e0\u8bba\u724c\u600e\u6837\uff0c\u5b83\u90fd\u51fb\u8d25\u4f60\u3002\u8fd9\u79cd\u88ab\u4fdd\u8bc1\u7684\u51c6\u786e\u6027\u635f\u5931\u2014\u2014\u800c\u4e0d\u662f\u91d1\u94b1\u635f\u5931\u2014\u2014\u6b63\u662f\u4e0d\u878d\u8d2f\u4e4b\u6240\u4ee5\u4e0d\u7406\u6027\u7684\u7406\u7531\u3002";
    },
    dominatedCaption: "\u504f\u79bb\u76f4\u7ebf\uff1a\u4e00\u4e2a\u878d\u8d2f\u70b9\uff08\u7eff\u8272\uff09\u79bb\u4e24\u4e2a\u771f\u7406\u89d2\u90fd\u66f4\u8fd1\u3002"
  } : {
    coherentTitle: "Coherent - undominated",
    coherentBody: function(sum){
      return "Your credences sum to <code>" + sum + "</code>, so the point sits on the line. No other credence is closer to the truth in <em>every</em> world \u2014 you can\u2019t be accuracy-dominated. Same verdict as Day 1\u2019s Dutch book, with no bet placed.";
    },
    coherentCaption: "On the line: nothing beats you on truth.",
    dominatedTitle: "Incoherent - accuracy-dominated",
    dominatedBody: function(sum, dP1, dS1, dP2, dS2){
      return "Sum = <code>" + sum + "</code>, off the line. The green point (the nearest coherent credence) is closer to the truth in <strong>both</strong> worlds: if S is true, " + dP1 + "&nbsp;\u2192&nbsp;" + dS1 + "; if S is false, " + dP2 + "&nbsp;\u2192&nbsp;" + dS2 + ". It beats you whatever the card. That guaranteed loss of accuracy \u2014 not any lost money \u2014 is why incoherence is irrational.";
    },
    dominatedCaption: "Off the line: a coherent point (green) is closer to BOTH corners."
  };

  document.querySelectorAll(".accuracy-domination").forEach(function(panel){
    var raS = panel.querySelector(".accuracy-s-range");
    var raN = panel.querySelector(".accuracy-n-range");
    var aS = panel.querySelector(".accuracy-s-value");
    var aN = panel.querySelector(".accuracy-n-value");
    var aLedger = panel.querySelector(".accuracy-ledger");
    var aLh = panel.querySelector(".accuracy-ledger-title");
    var aBody = panel.querySelector(".accuracy-ledger-body");
    var aSnap = panel.querySelector(".accuracy-snap");
    var accP = panel.querySelector(".accuracy-point");
    var accStar = panel.querySelector(".accuracy-star");
    var accConn = panel.querySelector(".accuracy-connector");
    var accCap = panel.querySelector(".accuracy-caption");
    var lp1 = panel.querySelector(".accuracy-point-line-s");
    var lp2 = panel.querySelector(".accuracy-point-line-not");
    var ls1 = panel.querySelector(".accuracy-star-line-s");
    var ls2 = panel.querySelector(".accuracy-star-line-not");
    var accSlines = panel.querySelector(".accuracy-star-lines");
    if(!raS || !raN || !aS || !aN || !aLedger || !aLh || !aBody || !aSnap || !accP || !accStar || !accConn || !accCap || !lp1 || !lp2 || !ls1 || !ls2 || !accSlines) return;

    var PAD = 46;
    var SIDE = 200;
    function x(c){ return PAD + c * SIDE; }
    function y(d){ return PAD + (1 - d) * SIDE; }

    function renderAcc(){
      var c = Number(raS.value) / 100;
      var d = Number(raN.value) / 100;
      aS.textContent = c.toFixed(2);
      aN.textContent = d.toFixed(2);

      var px = x(c);
      var py = y(d);
      accP.setAttribute("cx", px);
      accP.setAttribute("cy", py);
      lp1.setAttribute("x1", px);
      lp1.setAttribute("y1", py);
      lp2.setAttribute("x1", px);
      lp2.setAttribute("y1", py);
      accConn.setAttribute("x1", px);
      accConn.setAttribute("y1", py);

      var cs = (c - d + 1) / 2;
      var ds = (d - c + 1) / 2;
      var sx = x(cs);
      var sy = y(ds);
      var off = Math.abs(c + d - 1);
      var dP1 = Math.hypot(c - 1, d);
      var dP2 = Math.hypot(c, d - 1);
      var dS1 = Math.hypot(cs - 1, ds);
      var dS2 = Math.hypot(cs, ds - 1);

      if(off < 0.005){
        accStar.style.opacity = "0";
        accSlines.style.opacity = "0";
        accConn.setAttribute("x2", px);
        accConn.setAttribute("y2", py);
        aLedger.className = "acc-ledger coherent accuracy-ledger";
        aLh.textContent = copy.coherentTitle;
        aBody.innerHTML = copy.coherentBody((c + d).toFixed(2));
        accCap.textContent = copy.coherentCaption;
        return;
      }

      accStar.setAttribute("cx", sx);
      accStar.setAttribute("cy", sy);
      accStar.style.opacity = "1";
      ls1.setAttribute("x1", sx);
      ls1.setAttribute("y1", sy);
      ls2.setAttribute("x1", sx);
      ls2.setAttribute("y1", sy);
      accSlines.style.opacity = "0.9";
      accConn.setAttribute("x2", sx);
      accConn.setAttribute("y2", sy);
      aLedger.className = "acc-ledger dom accuracy-ledger";
      aLh.textContent = copy.dominatedTitle;
      aBody.innerHTML = copy.dominatedBody((c + d).toFixed(2), dP1.toFixed(2), dS1.toFixed(2), dP2.toFixed(2), dS2.toFixed(2));
      accCap.textContent = copy.dominatedCaption;
    }

    raS.addEventListener("input", renderAcc);
    raN.addEventListener("input", renderAcc);
    aSnap.addEventListener("click", function(){
      raN.value = Math.round(100 - Number(raS.value));
      renderAcc();
    });
    renderAcc();
  });
})();
