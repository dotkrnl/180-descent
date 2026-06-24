(function(){
  "use strict";

  var isZh = (document.documentElement.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;

  function byPrefix(prefix, suffix) {
    return document.getElementById(prefix + suffix);
  }

  function verdictText(percent) {
    if (isZh) {
      if (percent >= 80) return "稳健领域：此处发表的发现绝大多数真实可靠。";
      if (percent >= 50) return "根基动摇：虽尚在维持，但已有相当比例的「发现」实为噪音。";
      return "情况严峻：此处多数所谓的「发现」实际上并不成立。";
    }
    if (percent >= 80) return "Strong field: most published discoveries here are real.";
    if (percent >= 50) return "Shaky: a large minority of \"discoveries\" are noise.";
    return "Underwater: most published \"discoveries\" here are false.";
  }

  document.querySelectorAll('[id$="brRange"]').forEach(function(baseRate) {
    var prefix = baseRate.id.slice(0, -"brRange".length);
    var power = byPrefix(prefix, "powRange");
    var bias = byPrefix(prefix, "biasRange");
    var brVal = byPrefix(prefix, "brVal");
    var powVal = byPrefix(prefix, "powVal");
    var biasVal = byPrefix(prefix, "biasVal");
    var cTP = byPrefix(prefix, "cTP");
    var cFP = byPrefix(prefix, "cFP");
    var cFN = byPrefix(prefix, "cFN");
    var cTN = byPrefix(prefix, "cTN");
    var segTP = byPrefix(prefix, "segTP");
    var ppvBig = byPrefix(prefix, "ppvBig");
    var ppvCap = byPrefix(prefix, "ppvCap");
    if (!power || !bias || !brVal || !powVal || !biasVal || !cTP || !cFP || !cFN || !cTN || !segTP || !ppvBig || !ppvCap) return;

    function render() {
      var nTrue = Number(baseRate.value);
      var nFalse = 1000 - nTrue;
      var powerRate = Number(power.value) / 100;
      var biasRate = Number(bias.value) / 100;
      var alpha = 0.05;

      brVal.textContent = nTrue;
      powVal.textContent = Math.round(powerRate * 100) + "%";
      biasVal.textContent = biasRate === 0 ? (isZh ? "无" : "none") : "+" + Math.round(biasRate * 100) + "%";

      var truePositive = nTrue * powerRate;
      var falseNegative = nTrue * (1 - powerRate);
      var falsePositive = nFalse * alpha;
      var trueNegative = nFalse * (1 - alpha);
      var reportedTruePositive = truePositive + biasRate * falseNegative;
      var reportedFalsePositive = falsePositive + biasRate * trueNegative;
      var reportedFalseNegative = falseNegative - biasRate * falseNegative;
      var reportedTrueNegative = trueNegative - biasRate * trueNegative;

      cTP.textContent = Math.round(reportedTruePositive);
      cFN.textContent = Math.round(reportedFalseNegative);
      cFP.textContent = Math.round(reportedFalsePositive);
      cTN.textContent = Math.round(reportedTrueNegative);

      var significant = reportedTruePositive + reportedFalsePositive;
      var ppv = significant > 0 ? reportedTruePositive / significant : 0;
      var percent = Math.round(ppv * 100);
      var trueWidth = significant > 0 ? reportedTruePositive / significant * 100 : 0;
      var realN = Math.round(ppv * 100);
      var falseN = 100 - realN;

      segTP.value = trueWidth;
      ppvBig.textContent = percent + "%";
      ppvCap.innerHTML = isZh
        ? '为真。这里每 100 个发表的「发现」中，大约 <span class="hl">' + realN + '</span> 个是真的，<span class="hl">' + falseN + '</span> 个只是披着信号外衣的噪音。<span class="ppv-verdict">' + verdictText(percent) + "</span>"
        : 'real. About <strong>' + realN + '</strong> of every 100 published "discoveries" here are true, and <strong>' + falseN + '</strong> are noise dressed as signal. <span class="ppv-verdict">' + verdictText(percent) + "</span>";
    }

    [baseRate, power, bias].forEach(function(slider) {
      slider.addEventListener("input", render);
    });
    render();
  });
})();
