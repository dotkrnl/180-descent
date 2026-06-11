(function(){
  "use strict";

  var root = document.documentElement;
  var isZh = (root.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;

  var forms = isZh ? {
    ponens: {
      valid: true,
      lines: ["如果 <span class=\"op\">P</span>，则 <span class=\"op\">Q</span>", "<span class=\"op\">P</span> 为真", "<span class=\"op\">Q</span>"],
      expl: "有效。肯定前件 P，结论 Q 就逃不掉。这是克律西波斯第一条「不可证明式」，也是最古老的命名推理规则之一。"
    },
    tollens: {
      valid: true,
      lines: ["如果 <span class=\"op\">P</span>，则 <span class=\"op\">Q</span>", "<span class=\"op\">Q</span> 为假", "<span class=\"op\">P</span> 为假"],
      expl: "有效。如果 Q 必然随 P 而来，那么 Q 不在场，P 也不能成立。这是否定后件，也是反证法背后的发动机。"
    },
    affirm: {
      valid: false,
      lines: ["如果 <span class=\"op\">P</span>，则 <span class=\"op\">Q</span>", "<span class=\"op\">Q</span> 为真", "<span class=\"op\">P</span>"],
      expl: "无效。Q 可能还有别的原因，所以发现 Q 并不能保证 P。它很诱人，因为结论有时碰巧为真。"
    },
    deny: {
      valid: false,
      lines: ["如果 <span class=\"op\">P</span>，则 <span class=\"op\">Q</span>", "<span class=\"op\">P</span> 为假", "<span class=\"op\">Q</span> 为假"],
      expl: "无效。排除一个充分原因 P，并不等于排除结果 Q 的所有来源。"
    }
  } : {
    ponens: {
      valid: true,
      lines: ["If <span class=\"op\">P</span> then <span class=\"op\">Q</span>", "<span class=\"op\">P</span> is true", "<span class=\"op\">Q</span>"],
      expl: "Valid. Affirm the antecedent (P) and the conclusion (Q) cannot escape. This is Chrysippus's first indemonstrable, the oldest named rule in logic."
    },
    tollens: {
      valid: true,
      lines: ["If <span class=\"op\">P</span> then <span class=\"op\">Q</span>", "<span class=\"op\">Q</span> is false", "<span class=\"op\">P</span> is false"],
      expl: "Valid. If Q must follow from P, then the absence of Q means P could not have held. Deny the consequent, and the antecedent falls. The engine behind every proof by contradiction."
    },
    affirm: {
      valid: false,
      lines: ["If <span class=\"op\">P</span> then <span class=\"op\">Q</span>", "<span class=\"op\">Q</span> is true", "<span class=\"op\">P</span>"],
      expl: "Invalid. Q can have other causes, so finding Q tells you nothing certain about P. Seductive because the conclusion is sometimes true anyway: a true belief reached by a broken argument."
    },
    deny: {
      valid: false,
      lines: ["If <span class=\"op\">P</span> then <span class=\"op\">Q</span>", "<span class=\"op\">P</span> is false", "<span class=\"op\">Q</span> is false"],
      expl: "Invalid. Knocking out one sufficient cause (P) does not knock out the effect (Q), because Q may have other causes. The mirror image of affirming the consequent."
    }
  };

  var examples = isZh ? {
    rain: { P: "正在下雨", Q: "地面是湿的" },
    dog: { P: "这只动物是狗", Q: "它有四条腿" },
    sd: { P: "Joe 住在圣迭戈", Q: "Joe 住在加利福尼亚" }
  } : {
    rain: { P: "it is raining", Q: "the ground is wet" },
    dog: { P: "this animal is a dog", Q: "it has four legs" },
    sd: { P: "Joe lives in San Diego", Q: "Joe lives in California" }
  };

  var curForm = "ponens";
  var curEx = null;
  var argEl = document.getElementById("iiArg");
  var vstateEl = document.getElementById("iiVState");
  var vexplEl = document.getElementById("iiVExpl");
  if(!argEl || !vstateEl || !vexplEl) return;

  function fill(line){
    if(!curEx) return line;
    var e = examples[curEx];
    return line.replace(">P<", ">" + e.P + "<").replace(">Q<", ">" + e.Q + "<");
  }

  function render(){
    var f = forms[curForm];
    var lines = f.lines.map(fill);
    argEl.innerHTML =
      "<div class=\"pr\">" + lines[0] + "</div>" +
      "<div class=\"pr\">" + lines[1] + "</div>" +
      "<hr class=\"rule\">" +
      "<div class=\"cc\">&#8756; " + lines[2] + "</div>";
    if(f.valid){
      vstateEl.textContent = isZh ? "有效形式" : "Valid form";
      vstateEl.className = "ii-vstate good";
    } else {
      vstateEl.textContent = isZh ? "无效：形式谬误" : "Invalid: a fallacy";
      vstateEl.className = "ii-vstate bad";
    }
    var note = f.expl;
    if(curEx && curForm === "affirm" && curEx === "sd"){
      note += isZh ? " 这里：Joe 完全可能住在萨克拉门托。" : " Here: Joe really could be in Sacramento.";
    } else if(curEx && curForm === "deny" && curEx === "rain"){
      note += isZh ? " 这里：洒水器仍然可以把地面弄湿。" : " Here: a sprinkler could still soak the ground.";
    } else if(curEx && curForm === "affirm" && curEx === "dog"){
      note += isZh ? " 这里：猫和马也有四条腿。" : " Here: cats and horses have four legs too.";
    }
    vexplEl.innerHTML = note;
  }

  document.querySelectorAll(".iibtn").forEach(function(button){
    button.addEventListener("click", function(){
      curForm = button.getAttribute("data-form");
      document.querySelectorAll(".iibtn").forEach(function(x){
        x.setAttribute("aria-pressed", x === button ? "true" : "false");
      });
      render();
    });
  });

  document.querySelectorAll(".exbtn").forEach(function(button){
    button.addEventListener("click", function(){
      var key = button.getAttribute("data-ex");
      curEx = curEx === key ? null : key;
      document.querySelectorAll(".exbtn").forEach(function(x){
        var active = x === button && curEx;
        x.style.borderStyle = active ? "solid" : "dashed";
        x.style.color = active ? "var(--ink)" : "";
        x.style.borderColor = active ? "var(--accent)" : "";
      });
      render();
    });
  });

  render();
})();
