(function(){
  "use strict";

  var root = document.documentElement;
  var isZh = (root.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;

  document.querySelectorAll(".cm-machine").forEach(function(machine){
    var cmP1 = machine.querySelector(".cm-p1");
    var cmP2 = machine.querySelector(".cm-p2");
    var cmC = machine.querySelector(".cm-c");
    var cmOut = machine.querySelector(".cm-outlet");
    var cmBtns = machine.querySelectorAll(".cm-btn");
    if(!cmP1 || !cmP2 || !cmC || !cmOut || !cmBtns.length) return;

    var cmData = isZh ? {
      skeptic: {
        strike: [],
        who: "怀疑论者",
        html: "你接受了全部三行，因此结论成立：按你自己的标准，你不知道自己有双手，也几乎不知道外部世界的任何事。逻辑上整齐，人的层面却难以承受。"
      },
      moore: {
        strike: ["p1"],
        who: "G. E. 摩尔：「这里有一只手」",
        html: "你拒绝 P1：你坚持自己知道并非缸中之脑，因为你知道自己有双手，也能看见它们。疑虑在于：这可能听起来像坚持立场，而非真正回答。"
      },
      dretske: {
        strike: ["p2"],
        who: "德雷茨克与诺齐克：否定封闭性",
        html: "你拒绝 P2：知识不会自动沿每一个蕴含传递。你只需排除实际相关的错误可能。代价是：封闭性在直觉上非常有力。"
      },
      context: {
        strike: [],
        who: "语境主义：改变标准",
        html: "你拒绝那个隐藏假设：认为「知道」只有一个固定标准。日常谈话与怀疑论研讨室使用的是不同标尺。"
      }
    } : {
      skeptic: {
        strike: [],
        who: "The Skeptic",
        html: "You accepted every line, so the conclusion stands: by your own lights, you don't know you have hands, or much of anything about the external world. Logically tidy, humanly unbearable."
      },
      moore: {
        strike: ["p1"],
        who: 'G. E. Moore: "Here is one hand"',
        html: "You reject P1: you insist you do know you are not a vat-brain, because you know you have hands and can see them. The worry: it can feel like foot-stamping rather than an answer."
      },
      dretske: {
        strike: ["p2"],
        who: "Dretske and Nozick: deny closure",
        html: "You reject P2: knowledge does not automatically pass to every entailment. You only need to rule out the live relevant alternatives. The cost: closure is deeply intuitive."
      },
      context: {
        strike: [],
        who: "Contextualism: change the standard",
        html: "You reject the hidden assumption that 'know' means one fixed thing. Ordinary talk and the skeptic's seminar use different yardsticks."
      }
    };

    function cmClear(){
      [cmP1, cmP2, cmC].forEach(function(el){ el.classList.remove("struck"); });
    }
    function cmRender(key){
      var d = cmData[key] || cmData.skeptic;
      cmClear();
      if(d.strike.indexOf("p1") > -1) cmP1.classList.add("struck");
      if(d.strike.indexOf("p2") > -1) cmP2.classList.add("struck");
      if(d.strike.length > 0 && key !== "context") cmC.classList.add("struck");
      cmBtns.forEach(function(button){
        button.setAttribute("aria-pressed", button.getAttribute("data-exit") === key ? "true" : "false");
      });
      cmOut.innerHTML = '<span class="who">' + d.who + "</span>" + d.html;
    }
    cmBtns.forEach(function(button){
      button.addEventListener("click", function(){ cmRender(button.getAttribute("data-exit")); });
    });
  });
})();
