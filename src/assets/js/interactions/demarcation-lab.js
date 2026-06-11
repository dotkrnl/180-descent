(function(){
  "use strict";

  var root = document.documentElement;
  var isZh = (root.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;

  var demarcationData = isZh ? {
    relativity:{claim:"遥远星光掠过太阳边缘时弯折 1.75 角秒。",popper:["sci","可证伪：日食测量本可以杀死它。"],kuhn:["sci","一种新的时空范式，推翻牛顿式假设。"],lakatos:["sci","一个作出新颖确认的进步纲领。"],laudan:["sci","在整组科学美德上都很强。"]},
    astrology:{claim:"水星呈逆行视运动时，通讯与旅行会出问题。",popper:["non","足够有弹性，几乎能容纳任何结果。"],kuhn:["non","没有会从反常中更新的解谜范式。"],lakatos:["non","一个以事后补救为主的退化纲领。"],laudan:["non","在记录、修正与冒险预言上都很弱。"]},
    marx:{claim:"全部人类历史从根本上说都是阶级斗争史。",popper:["non","波普尔的判断：预言失败后被重新解释。"],kuhn:["dep","对信奉者而言近似范式，但过于能吸收反常。"],lakatos:["dep","可以起初进步，后来退化。"],laudan:["dep","有些部分是可检验的社会科学，有些则是历史哲学。"]},
    strings:{claim:"现实的基本构成是约十一维空间中振动的弦。",popper:["dep","数学上丰富，但关键预言尚无法实际检验。"],kuhn:["dep","常规科学仍在进行，却缺少决定性的经验筛选。"],lakatos:["dep","要看这个纲领能否随时间变得进步。"],laudan:["dep","这是活的边界争议，不能用一个词裁决。"]},
    evolution:{claim:"所有生命都来自共同祖先。",popper:["sci","原则上可证伪：前寒武纪兔子将是灾难。"],kuhn:["sci","现代生物学的核心范式。"],lakatos:["sci","跨化石、遗传学与分子生物学的深度进步纲领。"],laudan:["sci","可预测、融贯、自我修正，并得到广泛确认。"]},
    freud:{claim:"神经症状源于被压抑进无意识的冲突。",popper:["non","波普尔的例子：一种能够容纳太多东西的理论。"],kuhn:["dep","存在近似范式的学派，但收敛性较弱。"],lakatos:["non","更像事后解释，而非冒险预言后的确认。"],laudan:["dep","格伦鲍姆认为某些精神分析主张可被反驳，因此边界会变得模糊。"]}
  } : {
    relativity:{claim:"Light from a distant star bends by 1.75 arcseconds as it grazes the sun.",popper:["sci","Falsifiable: the eclipse measurement could have killed it."],kuhn:["sci","A new spacetime paradigm overturning Newtonian assumptions."],lakatos:["sci","A progressive programme with novel confirmations."],laudan:["sci","Strong across the whole cluster of scientific virtues."]},
    astrology:{claim:"Communication and travel go awry when Mercury is in apparent retrograde motion.",popper:["non","Elastic enough to fit almost any outcome."],kuhn:["non","No puzzle-solving paradigm that updates from anomalies."],lakatos:["non","A degenerating programme of after-the-fact rescue."],laudan:["non","Weak across track record, correction, and risky prediction."]},
    marx:{claim:"All human history is fundamentally the history of class struggle.",popper:["non","Popper's case: predictions were reinterpreted after failure."],kuhn:["dep","Paradigm-like for adherents, but too anomaly-absorbing."],lakatos:["dep","Can begin progressive and become degenerating."],laudan:["dep","Some parts are testable social science; others are philosophy of history."]},
    strings:{claim:"The fundamental constituents of reality are vibrating strings in about 11 dimensions.",popper:["dep","Mathematically rich, but key predictions are not yet feasible tests."],kuhn:["dep","Normal science without decisive empirical sorting."],lakatos:["dep","Judge whether the programme becomes progressive over time."],laudan:["dep","A live cluster-profile dispute, not a one-word verdict."]},
    evolution:{claim:"All living organisms share descent from common ancestors.",popper:["sci","Falsifiable in principle: a Precambrian rabbit would be catastrophic."],kuhn:["sci","The central paradigm of modern biology."],lakatos:["sci","A deeply progressive programme across fossils, genetics, and molecular biology."],laudan:["sci","Predictive, coherent, self-correcting, and broadly confirmed."]},
    freud:{claim:"Neurotic symptoms are caused by conflicts repressed into the unconscious.",popper:["non","Popper's example of a theory that could fit too much."],kuhn:["dep","Paradigm-like schools, but weak convergence."],lakatos:["non","More after-the-fact interpretation than risky confirmed prediction."],laudan:["dep","Grunbaum argued some psychoanalytic claims were refutable, so the border blurs."]}
  };
  var verdictCard = document.getElementById("verdictCard");
  if(verdictCard){
    var order = isZh ? [["popper","波普尔"],["kuhn","库恩"],["lakatos","拉卡托斯"],["laudan","劳丹 / 群簇"]] : [["popper","Popper"],["kuhn","Kuhn"],["lakatos","Lakatos"],["laudan","Laudan / cluster"]];
    function tagWord(tag){
      if(isZh) return tag === "sci" ? "科学" : tag === "non" ? "非科学" : "视情况而定";
      return tag === "sci" ? "science" : tag === "non" ? "not science" : "it depends";
    }
    function renderDemarcation(key){
      var d = demarcationData[key];
      var html = '<p class="vc-claim">' + d.claim + "</p>";
      order.forEach(function(item){
        var r = d[item[0]];
        html += '<div class="vc-row"><span class="who">' + item[1] + '</span><span class="ruling"><span class="tag ' + r[0] + '">' + tagWord(r[0]) + "</span>" + r[1] + "</span></div>";
      });
      verdictCard.innerHTML = html;
    }
    document.querySelectorAll(".clbtn").forEach(function(button){
      button.addEventListener("click", function(){
        document.querySelectorAll(".clbtn").forEach(function(x){ x.setAttribute("aria-pressed", "false"); });
        button.setAttribute("aria-pressed", "true");
        renderDemarcation(button.getAttribute("data-c"));
      });
    });
    renderDemarcation("relativity");
  }
})();
