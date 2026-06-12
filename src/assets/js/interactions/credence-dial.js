(function(){
  "use strict";

  var root = document.documentElement;
  var isZh = (root.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;

  var rS = document.getElementById("rS");
  var rN = document.getElementById("rN");
  if(rS && rN){
    var vS = document.getElementById("vS");
    var vN = document.getElementById("vN");
    var segS = document.getElementById("segS");
    var segN = document.getElementById("segN");
    var sumtxt = document.getElementById("sumtxt");
    var ledger = document.getElementById("ledger");
    var ledgerH = document.getElementById("ledgerH");
    var ledgerBody = document.getElementById("ledgerBody");
    var credenceText = isZh ? {
      sum: "总和 = ",
      over: "（过高）",
      under: "（过低）",
      coherent: "融贯",
      coherentBody: "你的置信度之和恰好为 1。没有一组看似公平的赌约能保证让你亏损。",
      dutchBook: "荷兰赌",
      overBody: function(sum){ return "你会为两场恰有一场支付 <code>$1.00</code> 的赌约付出 " + money(sum) + "。你将会损失 <strong>" + money(sum - 1) + "</strong>。"; },
      underBody: function(sum){ return "如果博彩商以 " + money(sum) + " 从你手中买下两场赌约，其中一场必定支付 <code>$1.00</code>。博彩商锁定 <strong>" + money(1 - sum) + "</strong> 的收益。"; }
    } : {
      sum: "sum = ",
      over: " (over)",
      under: " (under)",
      coherent: "Coherent",
      coherentBody: "Your confidences sum to exactly 1. No book of fair-looking bets can guarantee a loss.",
      dutchBook: "Dutch book",
      overBody: function(sum){ return "You would pay " + money(sum) + " for two bets where exactly one pays <code>$1.00</code>. Your locked-in loss is <strong>" + money(sum - 1) + "</strong>."; },
      underBody: function(sum){ return "If the bookie buys both bets from you for " + money(sum) + ", one must pay <code>$1.00</code>. The bookie locks in <strong>" + money(1 - sum) + "</strong>."; }
    };
    function money(x){ return "$" + x.toFixed(2); }
    function renderCredence(){
      var s = Number(rS.value) / 100;
      var n = Number(rN.value) / 100;
      var sum = s + n;
      vS.textContent = s.toFixed(2);
      vN.textContent = n.toFixed(2);
      segS.style.width = (s / 2 * 100) + "%";
      segN.style.width = (n / 2 * 100) + "%";
      if(Math.abs(sum - 1) < 0.005){
        sumtxt.textContent = credenceText.sum + sum.toFixed(2);
        sumtxt.style.color = "var(--ok)";
        ledger.className = "ledger coherent";
        ledgerH.textContent = credenceText.coherent;
        ledgerBody.textContent = credenceText.coherentBody;
        return;
      }
      sumtxt.textContent = credenceText.sum + sum.toFixed(2) + (sum > 1 ? credenceText.over : credenceText.under);
      sumtxt.style.color = "var(--contested)";
      ledger.className = "ledger dutch";
      ledgerH.textContent = credenceText.dutchBook;
      if(sum > 1){
        ledgerBody.innerHTML = credenceText.overBody(sum);
      } else {
        ledgerBody.innerHTML = credenceText.underBody(sum);
      }
    }
    rS.addEventListener("input", renderCredence);
    rN.addEventListener("input", renderCredence);
    var snap = document.getElementById("snapBtn");
    if(snap){
      snap.addEventListener("click", function(){ rN.value = 100 - Number(rS.value); renderCredence(); });
    }
    renderCredence();
  }
})();
