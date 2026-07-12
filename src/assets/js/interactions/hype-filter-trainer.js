(function(){
  "use strict";

  var isZh = (document.documentElement.getAttribute("lang") || "").toLowerCase().indexOf("zh") === 0;
  var labels = isZh
    ? { ok: "已确立", hint: "有希望", bad: "炒作", correct: "判断正确", better: "更好的判断是", claim: "第", of: " / ", score: "得分", next: "下一条 ->", again: "重新开始" }
    : { ok: "Established", hint: "Promising", bad: "Hype", correct: "correct", better: "the better call is", claim: "Claim", of: " of ", score: "score", next: "Next claim ->", again: "Play again" };

  var claims = isZh ? [
    {
      text: "“一个开源 320 亿参数模型在 miniF2F 奥赛基准上接近 90%，且每个证明都由 Lean 内核检查。”",
      answer: "ok",
      why: "已确立。开源权重与可复核性很重要；更关键的是，Lean 会逐步检查证明，所以正确性不取决于相信模型本身。保留的小星号是：百分比背后通常有很大的采样预算。"
    },
    {
      text: "“GPT-5 解决了 10 个此前无人解决的 Erdős 问题。”（2025 年 10 月的公开说法）",
      answer: "bad",
      why: "炒作。数据库维护者 Thomas Bloom 称这种说法是“严重误述”：这些问题已由人类在多年以前解决，AI 找到了现有论文。很强的文献检索，不是新的数学发现。"
    },
    {
      text: "“FunSearch 在 8 维 cap set 问题上找到了比既有记录更大的构造，改进了停滞约 20 年的下界。”",
      answer: "ok",
      why: "已确立。这一结果发表于 Nature，构造本身可直接核查。但要保留细节：它是搜索，不是理解；模型甚至没有被告知问题本身，而且成功率并不高。"
    },
    {
      text: "“OpenAI 报告 o3 在 180 道题的 FrontierMath_11-26-24 上取得 25.2%。”（2024 年 12 月）",
      answer: "ok",
      why: "就这项有版本和日期的历史主张而言，它已确立。它并不等同于 o3 在所有 FrontierMath 版本上的能力；正式发布版模型、其他难度层级或不同推理预算下的成绩不能直接与它比较。"
    },
    {
      text: "“Erdős 问题 #728 由 AI 大体自主解决，结果未见于既有文献，并已用 Lean 核查。”（Tao，2026 年 1 月）",
      answer: "hint",
      why: "有希望。它确实新鲜且经过形式化检查；但 Tao 也强调它属于“低垂果实”，过程中有人类反馈，附近也有相关旧结果。真实、早期、不能过度包装。"
    },
    {
      text: "“大型语言模型无法进行真正逻辑推理；它们只是在复制模式，改写文字题后的崩溃已经证明了这一点。”",
      answer: "hint",
      why: "陷阱卡。更稳妥的读法是有力但仍有争议，而非定案。GSM-Symbolic 的脆弱性发现是真实的，但从它跳到普遍否定推理能力，仍然太强。"
    },
    {
      text: "“模型写出的 chain-of-thought 是它实际如何得到答案的忠实窗口。”",
      answer: "bad",
      why: "炒作，而且应该淘汰。Anthropic 2025 年的工作发现忠实度可低至约 25%-39%：模型会使用提示而不承认，然后事后合理化。解释可能只是装饰。"
    }
  ] : [
    {
      text: "\"An open-source 32-billion-parameter model scores around 90% on the miniF2F olympiad benchmark, with every proof checked by Lean's kernel.\"",
      answer: "ok",
      why: "Established. It is open-weights and reproducible, and Lean verifies each proof, so correctness does not depend on trusting the model. The asterisk is the large sampling budget behind the percentage."
    },
    {
      text: "\"GPT-5 solved 10 previously unsolved Erdos problems.\" (as announced, October 2025)",
      answer: "bad",
      why: "Hype. The public claim was challenged as a dramatic misrepresentation: the problems had been solved years earlier by humans, and the AI found existing papers. Superb literature search, not new mathematics."
    },
    {
      text: "\"FunSearch discovered a cap set in dimension 8 larger than any previously known, improving a bound that had been stuck for 20 years.\"",
      answer: "ok",
      why: "Established. Published in Nature, and the construction is directly verifiable. Keep the nuance: it was search, not understanding, and it succeeded in only a small fraction of runs."
    },
    {
      text: "\"OpenAI reported 25.2% for o3 on the 180-question FrontierMath_11-26-24.\" (December 2024)",
      answer: "ok",
      why: "Established as a versioned, dated historical claim. It is not a versionless estimate of o3's ability: results for the released model, other tiers, or different inference budgets are not directly comparable."
    },
    {
      text: "\"Erdos problem #728 was solved more or less autonomously by AI, with the result not found in existing literature, and formally checked in Lean.\" (Tao, January 2026)",
      answer: "hint",
      why: "Promising. This one is genuinely new and verified, but it is still early, involved human feedback, and was described as low-hanging fruit rather than a general breakthrough."
    },
    {
      text: "\"Large language models cannot perform genuine logical reasoning; they only replicate patterns, as proven by their collapse on altered word problems.\"",
      answer: "hint",
      why: "Best read as promising-but-contested, not settled. The GSM-Symbolic fragility is real, but the sweeping conclusion is disputed."
    },
    {
      text: "\"A model's written chain-of-thought is a faithful window into how it actually reached its answer.\"",
      answer: "bad",
      why: "Hype. Anthropic's 2025 work found low faithfulness: models often use a hint without admitting it and rationalize afterward. We verify results rather than trust narrations."
    }
  ];

  document.querySelectorAll(".hype-filter-trainer").forEach(function(root){
    var tagEl = root.querySelector(".hype-tag");
    var claimEl = root.querySelector(".hype-claim");
    var explainEl = root.querySelector(".hype-explain");
    var nextEl = root.querySelector(".hype-next");
    var scoreEl = root.querySelector(".hype-score");
    var btns = root.querySelectorAll(".hype-choice");
    if(!tagEl || !claimEl || !explainEl || !nextEl || !scoreEl || !btns.length) return;

    var chosenClass = { ok: "chosen-ok", hint: "chosen-hint", bad: "chosen-bad" };
    var idx = 0;
    var score = 0;
    var answered = false;

    function draw(){
      answered = false;
      var claim = claims[idx];
      tagEl.textContent = isZh ? (labels.claim + " " + (idx + 1) + labels.of + claims.length + " 条") : (labels.claim + " " + (idx + 1) + labels.of + claims.length);
      claimEl.textContent = claim.text;
      explainEl.textContent = "";
      nextEl.hidden = true;
      scoreEl.textContent = labels.score + " " + score + " / " + claims.length;
      btns.forEach(function(button){
        button.classList.remove("chosen-ok", "chosen-hint", "chosen-bad", "dim");
        button.disabled = false;
      });
    }

    function choose(pick){
      if(answered) return;
      answered = true;
      var claim = claims[idx];
      var correct = pick === claim.answer;
      if(correct) score++;
      btns.forEach(function(button){
        button.disabled = true;
        var bp = button.getAttribute("data-pick");
        if(bp === claim.answer) button.classList.add(chosenClass[claim.answer]);
        else button.classList.add("dim");
      });
      var verdict = correct
        ? (isZh ? "✓ 你选了" + labels[pick] + "，判断正确。" : "✓ you said " + labels[pick] + ": correct. ")
        : (isZh ? "✗ 你选了" + labels[pick] + "；更好的判断是" + labels[claim.answer] + "。" : "✗ you said " + labels[pick] + "; the better call is " + labels[claim.answer] + ". ");
      explainEl.innerHTML = '<span class="hf-verdict ' + (correct ? "right" : "wrong") + '">' + verdict + "</span>" + claim.why;
      scoreEl.textContent = labels.score + " " + score + " / " + claims.length;
      nextEl.textContent = idx < claims.length - 1 ? labels.next : labels.again;
      nextEl.hidden = false;
    }

    btns.forEach(function(button){
      button.addEventListener("click", function(){ choose(button.getAttribute("data-pick")); });
    });
    nextEl.addEventListener("click", function(){
      if(idx < claims.length - 1) idx++;
      else {
        idx = 0;
        score = 0;
      }
      draw();
    });

    draw();
  });
})();
