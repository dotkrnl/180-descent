(function(){
  "use strict";

  var isZh = (document.documentElement.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;

  var rounds = isZh ? [
    {
      claim: "“我对手的气候方案毫无价值：他离过两次婚，穿衣也糟糕。”",
      opts: ["人身攻击", "稻草人", "错误两难"],
      answer: 0,
      why: "人身攻击。私生活和穿衣品味不能说明方案本身好坏。要攻击论证，而不是攻击论证者。"
    },
    {
      claim: "“我们要么砍掉整个艺术预算，要么城市就会破产。所以剧院必须关闭。”",
      opts: ["事后归因", "错误两难", "歧义偷换"],
      answer: 1,
      why: "错误两难。它把两个选项说成全部选项，遮住了中间一大批部分措施。"
    },
    {
      claim: "“自从他们装了那个新红绿灯，我的背就一直疼。那个红绿灯正在毁掉我的健康。”",
      opts: ["滑坡论证", "草率概括", "事后归因"],
      answer: 2,
      why: "事后归因。两件事先后发生，不等于第一件造成第二件；这正是第 5 日的因果课要拆开的陷阱。"
    },
    {
      claim: "“这本书当然可靠。第一页就写着里面每句话都是真的。”",
      opts: ["循环论证", "诉诸权威", "没有真正的苏格兰人"],
      answer: 0,
      why: "循环论证。结论“它可靠”已经被前提“它说自己可靠”偷偷预设了，这是第 1 日循环证成的一枚小型样本。"
    },
    {
      claim: "“我这周遇到两个从那座城市来的人，都很粗鲁。显然那里人人都粗鲁。”",
      opts: ["歧义偷换", "草率概括", "滑坡论证"],
      answer: 1,
      why: "草率概括。它从两个样本跳到总体规则；问题不在概括本身，而在跳得太快。"
    }
  ] : [
    {
      claim: "\"My opponent's climate plan is worthless: he's been divorced twice and dresses terribly.\"",
      opts: ["Ad hominem", "Straw man", "False dilemma"],
      answer: 0,
      why: "Ad hominem. His personal life has nothing to do with whether the plan is any good. Attack the argument, not the arguer."
    },
    {
      claim: "\"Either we cut the entire arts budget, or the city goes bankrupt. So the theatre has to close.\"",
      opts: ["Post hoc", "False dilemma", "Equivocation"],
      answer: 1,
      why: "False dilemma. Two options are presented as the only two, when many partial measures sit between them."
    },
    {
      claim: "\"Ever since they installed that new traffic light, my back has been killing me. That light is ruining my health.\"",
      opts: ["Slippery slope", "Hasty generalization", "Post hoc"],
      answer: 2,
      why: "Post hoc ergo propter hoc. Two things happening in sequence does not mean the first caused the second; the trap Day 5 is built to disarm."
    },
    {
      claim: "\"Of course the book is trustworthy. It says right there on page one that everything inside is true.\"",
      opts: ["Begging the question", "Appeal to authority", "No true Scotsman"],
      answer: 0,
      why: "Begging the question. The conclusion is assumed by the premise, a tiny version of Day 1's circular justification."
    },
    {
      claim: "\"I met two rude people from that city this week. Clearly everyone there is rude.\"",
      opts: ["Equivocation", "Hasty generalization", "Slippery slope"],
      answer: 1,
      why: "Hasty generalization. A sweeping rule leaps from a sample of two. The flaw is in the haste, not the generalizing."
    }
  ];

  document.querySelectorAll(".fallacy-spotter").forEach(function(root){
    var claimEl = root.querySelector(".fallacy-claim");
    var optsEl = root.querySelector(".fallacy-options");
    var explainEl = root.querySelector(".fallacy-explain");
    var nextEl = root.querySelector(".fallacy-next");
    var scoreEl = root.querySelector(".fallacy-score");
    if(!claimEl || !optsEl || !explainEl || !nextEl || !scoreEl) return;

    var idx = 0;
    var score = 0;
    var answered = false;

    function scoreText(){
      return isZh
        ? "第 " + (idx + 1) + " / " + rounds.length + " 题 · 得分 " + score
        : "round " + (idx + 1) + " / " + rounds.length + " · score " + score;
    }

    function draw(){
      answered = false;
      var round = rounds[idx];
      claimEl.textContent = round.claim;
      optsEl.innerHTML = "";
      explainEl.textContent = "";
      explainEl.classList.remove("show");
      nextEl.hidden = true;
      nextEl.style.display = "none";
      scoreEl.textContent = scoreText();
      round.opts.forEach(function(opt, i){
        var button = document.createElement("button");
        button.className = "fsbtn";
        button.type = "button";
        button.textContent = opt;
        button.addEventListener("click", function(){ choose(i, button); });
        optsEl.appendChild(button);
      });
    }

    function choose(i, button){
      if(answered) return;
      answered = true;
      var round = rounds[idx];
      var all = optsEl.querySelectorAll(".fsbtn");
      if(i === round.answer){
        button.classList.add("correct");
        score++;
      } else {
        button.classList.add("wrong");
        all[round.answer].classList.add("correct");
      }
      all.forEach(function(item){ item.style.cursor = "default"; });
      explainEl.textContent = round.why;
      explainEl.classList.add("show");
      scoreEl.textContent = scoreText();
      nextEl.textContent = idx < rounds.length - 1
        ? (isZh ? "下一条论证 ->" : "Next argument ->")
        : (isZh ? "重新开始" : "Play again");
      nextEl.hidden = false;
      nextEl.style.display = "inline-block";
    }

    nextEl.addEventListener("click", function(){
      if(idx < rounds.length - 1) idx++;
      else {
        idx = 0;
        score = 0;
      }
      draw();
    });

    draw();
  });
})();
