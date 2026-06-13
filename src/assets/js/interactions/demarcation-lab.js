(function(){
  "use strict";

  var root = document.documentElement;
  var isZh = (root.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;

  var demarcationData = isZh ? {
    relativity:{claim:"星光掠过太阳边缘时弯折 1.75 角秒。",popper:["sci","可证伪：1919 年的日食观测本可以宣判其死刑。"],kuhn:["sci","成功确立了时空新范式，替代了牛顿力学。"],lakatos:["sci","由于作出了惊人的新颖预言并获证实，是典型的进步纲领。"],laudan:["sci","在整组科学美德（经验表现、融贯性等）上表现极强。"]},
    astrology:{claim:"水星逆行期间，通讯与旅行易出故障。",popper:["non","具有极大的弹性，几乎能将任何结果解读为证实。"],kuhn:["non","缺乏能够从反常中学习并持续解谜的成熟范式。"],lakatos:["non","主要依靠事后修补来解释失败，属于退化纲领。"],laudan:["non","在实证记录、修正机制与预测能力上均显疲软。"]},
    marx:{claim:"人类历史的本质是阶级斗争史。",popper:["non","波普尔的经典案例：预言失败后往往被追溯性地重新诠释。"],kuhn:["dep","对信奉者而言具备范式特征，但吸收反常的能力过强。"],lakatos:["dep","早期具备一定的进步性，后期则显现出明显的退化特征。"],laudan:["dep","部分属于可检验的社会科学主张，部分则属于不可证伪的历史哲学。"]},
    strings:{claim:"现实的基本单元是十一维空间中振动的弦。",popper:["dep","数学结构极其精妙，但关键预言目前仍无法进行实证检验。"],kuhn:["dep","常规科学活动正在密集开展，但仍缺少决定性的经验判准。"],lakatos:["dep","有待观察该纲领能否随时间演进给出新颖的经验内容。"],laudan:["dep","属于鲜活的边界案例，难以简单地一语断之。"]},
    evolution:{claim:"所有生命都拥有共同的祖先。",popper:["sci","原则上可证伪：若发现「寒武纪前的兔子」化石将是灭顶之灾。"],kuhn:["sci","现代生物学的核心范式，界定了所有研究问题的方向。"],lakatos:["sci","一个在化石、遗传与分子生物学领域持续产出新知识的深度进步纲领。"],laudan:["sci","可预测、高度融贯、具备自我修正能力且得到了极其广泛的确认。"]},
    freud:{claim:"神经症症状源于被压抑的无意识冲突。",popper:["non","波普尔的例子：一个由于能解释太多而无法被驳倒的理论。"],kuhn:["dep","虽有类似范式的学派，但在经验层面的收敛性很差。"],lakatos:["non","表现出更多的事后补救特质，而非对冒险预言的成功确证。"],laudan:["dep","格伦鲍姆指出，其部分主张实际上是可以被证伪的，划界在此变得模糊。"]}
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
