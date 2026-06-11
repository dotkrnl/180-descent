---
layout: layouts/day.njk
tags: zhDay
locale: zh
day: 2
title: "科学方法与划界"
summary: "休谟、波普尔、库恩、拉卡托斯与复现危机，共同检验科学何以赢得信任。"
block: 知识与推理的根基
slug: scientific-method-and-demarcation
day_path: 002-scientific-method-and-demarcation
source_file: ../day-02-scientific-method-and-demarcation.html
threads:
  - 信息
  - 演化
  - 计算
  - 涌现
permalink: /zh/days/002-scientific-method-and-demarcation/
---
<header class="hero wrap">
<p class="eyebrow">模块一 · 知识与推理的根基 · <span class="daymark">第 02 日 / 180</span></p>
<h1>科学方法<em>与</em>划界</h1>
<p class="sub">太阳四十五亿年来每日东升。那么明日依旧会升起——对吗？</p>

<figure class="hero-sun">
<div class="sunwrap">
<svg viewBox="0 0 280 200" role="img" aria-label="一轮太阳自地平线升起，明日日出之处却悬着一个问号。">
<defs>
<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
<stop offset="0%" stop-color="color-mix(in srgb,var(--accent) 22%,transparent)"></stop>
<stop offset="100%" stop-color="transparent"></stop>
</linearGradient>
<radialGradient id="orb" cx="50%" cy="50%" r="50%">
<stop offset="0%" stop-color="var(--brass)"></stop>
<stop offset="100%" stop-color="color-mix(in srgb,var(--brass) 30%,transparent)"></stop>
</radialGradient>
</defs>
<rect x="0" y="0" width="280" height="150" fill="url(#sky)"></rect>
<!-- past suns, faded -->
<circle cx="40" cy="120" r="13" fill="var(--brass)" opacity="0.18"></circle>
<circle cx="92" cy="98" r="15" fill="var(--brass)" opacity="0.34"></circle>
<circle cx="150" cy="84" r="17" fill="url(#orb)" opacity="0.85"></circle>
<!-- tomorrow: a question -->
<circle cx="222" cy="74" r="20" fill="none" stroke="var(--brass)" stroke-width="1.6" stroke-dasharray="3 5"></circle>
<text x="222" y="82" text-anchor="middle" font-family="Fraunces,serif" font-size="26" font-weight="600" fill="var(--brass)">?</text>
<!-- horizon -->
<line x1="0" y1="150" x2="280" y2="150" stroke="var(--line-strong)" stroke-width="1.5"></line>
<g font-family="IBM Plex Mono,monospace" font-size="8.5" fill="var(--ink-faint)" text-anchor="middle">
<text x="40" y="168">…昨日</text>
<text x="150" y="168">今日</text>
<text x="222" y="168">明日</text>
</g>
</svg>
</div>
<span class="sun-tag">● 每一次过往的日出皆是证据——却对下一次日出证明不了分毫</span>
</figure>

<p class="lede"><span class="drop">若</span>问一个孩子，太阳明天是否会升起，他大概会觉得这个问题很奇怪。当然会升——一向如此。这份笃定仿佛知识最底层的磐石。可若再追问一句<em>为何</em>你相信，你便径直踏上一座断崖——那是 1739 年一位沉默的苏格兰哲人悄悄掘开的，至今无人填平。你唯一的凭据，不过是太阳从前升起过。你是在论证：<em>未来会与过去相似，因为在过去，未来曾与过去相似。</em>请再读一遍。它假设了它试图证明的东西。</p>

<p>这座断崖名为<strong>归纳问题</strong>，整部科学的机器正是从这里启动——并非凯旋，而是从一个缺口开始。今日我们将目睹思想者们耗费两个世纪试图攀援而出：有人放弃证明，转而追逐<em>否证</em>；有人意识到科学其实并不似教科书所言那般整饬；最终，在我们所处的这个时代，科学家以所能想象的最严苛方式向这整桩疑问发起拷问——<strong>让大量已发表发现接受复现检验</strong>，然后冷眼旁观其中一部分拒绝重演。</p>
</header><div class="wrap">

<div class="whereblock">
<p class="label">◆ 我们身处何处</p>
<p>昨日（<a href="/zh/days/001-what-is-knowledge/"><strong>第 1 日</strong></a>）我们追问，<em>单个</em>信念何时堪称知识，并邂逅了盖梯尔那座停走的钟——那是被运气而非关联所拯救的真信念。今日我们将这一忧虑从一颗心灵放大至整个文明尺度的机构：科学如何裁定哪些主张值得被认真纳入讨论？请把昨日的工具留在手边。<a href="/zh/days/001-what-is-knowledge/">第 1 日</a>的<em>信念刻度盘</em>（信念有程度之分，非全有即全无）即将成为回应休谟唯一清醒的回答；而那道能筛去热门发现、并让复现实验悄然收回结论的炒作过滤器，今日将成为整场戏的第三幕。</p>
</div>

<section>
<p class="sec-eyebrow">地上的裂口</p>
<h2>休谟抽去了地基</h2>
<p>1739 年，二十八岁的<strong>大卫·休谟</strong>出版《人性论》——一部问世时备受冷遇的著作，他自嘲它「一问世便胎死腹中」。书中藏着一枚引线极长的炸弹。休谟注意到，我们关于尚未直接经历之事的全部信念——面包明日仍将滋养我们，正如今日；太阳仍将升起——皆倚靠一个隐秘的假设：即<em class="term">自然是齐一的</em>，尚未经历的事物会像过往经验一样运行。</p>
<p>而他指出，这一假设无从辩护。非关逻辑：太阳不升起，并无<em>矛盾</em>可言。诚如休谟以不动声色之精准所言：</p>
<blockquote>太阳明日不会升起，是一个不比他日将升起更不可理解、亦不蕴含更多矛盾的命题。
<span class="src">——休谟，《人类理解研究》，§IV（1748）</span></blockquote>
<p>故齐一性并非逻辑真理。那么，能否以经验为之辩护——「它向来如此，所以是稳妥的赌注」？且看陷阱合拢：这一论证<em>动用</em>了过去预测未来的原则，来<em>证明</em>过去预测未来。它是循环的。人不可能拽着自己的头发离开地面。休谟的结论堪称真正激进，值得不加粉饰地陈述：我们对自己的未来之确信，<strong>毫无理性根据</strong>。我们期待日出，是习惯使然，而非逻辑证明。</p>
<p>这便是科学方法诞生时试图包扎的伤口。若我们永远无法靠堆积证实案例来<em>证明</em>一条普遍定律——再多的白天鹅也无法证明「所有天鹅皆白」——那么科学声称发现自然定律时，究竟在<em>做什么</em>？</p>

<div class="aside">
<p class="h">关于黑天鹅的注记</p>
<p>欧洲人曾如此确信所有天鹅皆白，以至于「黑天鹅」成了数个世纪以来的习语，意指<em>不存在之物</em>——好比「太阳从西边出来」。然而 1697 年，荷兰探险家抵达西澳大利亚，发现河湾中满是<strong>黑天鹅</strong>（<em>Cygnus atratus</em>）。百万次确认的目击筑起了一条坚不可摧的定律；珀斯的一只孤鸟便将其击得粉碎。请在心中持守这一不对等——它即将成为今日全篇的枢轴。</p>
</div>
</section>

<section>
<p class="sec-eyebrow">逃遁之路</p>
<h2>波普尔的转身：不再试图证明</h2>
<p>1920 年代的维也纳。年轻的<strong>卡尔·波普尔</strong>身处众多皆欲攫取「科学」之名的知识运动之中：弗洛伊德的精神分析、阿德勒的个体心理学、马克思的历史理论。追随者们如痴如狂。他们环顾四周，满眼皆是<em>证实</em>——每一句口误都印证弗洛伊德，每一次政治旋涡都印证马克思。而波普尔猛然意识到，这恰恰正是它们的<em>病灶</em>所在。</p>
<p>因为解释<em>一切</em>的理论，其实一无所释。若没有任何可想象的观察能够<em>反驳</em>你的理论——若有人救起溺水儿童与有人溺毙儿童，皆能<em>同样</em>被嵌入弗洛伊德的框架——那么你的理论并不勇敢。它是空洞的。它没有排除任何可能结果，故世界无从惊扰它。</p>
<p>请将之与爱因斯坦并观。1915 年，广义相对论作出了一项高风险预言：掠过太阳的星光将弯折特定角度——1.75 角秒，为牛顿预言的两倍。若 1919 年的日食测量结果呈牛顿式，爱因斯坦便将<em>完结</em>。他把理论置于真正的风险之中。<em>那</em>，波普尔说，才是真正的科学之印记。</p>
<p>于是波普尔做了一次哲学上的转身。休谟说得对——你永远无法<em>证实</em>一条普遍定律。很好。那么<strong>停止尝试。</strong>将黑天鹅的不对称性翻转为一门方法：</p>
<blockquote>一种理论之科学地位的标准，在于其可证伪性、可反驳性，或可检验性。
<span class="src">——波普尔，《猜想与反驳》（1963）</span></blockquote>
<p>你无法以任何数量的白天鹅证明「所有天鹅皆白」——但一只<em>单独</em>的黑天鹅便永久否证了它。最终证实做不到；<em class="term">证伪</em>却具决断性。依此观点，科学并非自证据拾级而上、迈向确定性。它提出<strong>大胆的猜想</strong>，继而竭尽全力试图<strong>反驳它们</strong>。那些在我们最猛烈的反驳尝试中幸存的理论，并非<em>被证明</em>——它们只是仍屹立不倒、得到佐证，在下一轮检验之前被临时信任。知识之增长，来自理论在反驳中幸存，而非证实案例的累积。</p>
<p><em class="term">划界标准</em>——科学与伪科学之间的界线——由此干净利落。一项主张的科学性，取决于它<em>是否承担风险</em>：是否排除某些可能结果，作出可被推翻的预言，预先告诉你什么将证明它错误。「经济由阶级斗争支配」没有排除任何明确结果。「光线弯折 1.75 角秒」则排除了 1.74 与 1.76。后者是科学；前者更像一套披着科学外衣的世界观。</p>

<div class="aside">
<p class="h">公允以待弗洛伊德</p>
<p>这是一个利落的故事，波普尔讲得极为出色——或许太出色了。后来的哲人（尤其是 1984 年的阿道夫·格伦鲍姆）辩称波普尔把精神分析刻画得过于简单：弗洛伊德有时确实指明过什么将反驳他（「只有当恐惧症被证明存在于性生活完全正常之处时，我的理论才能被反驳」）。而许多受人敬重的科学——历史学的、进化论的、宇宙学的——同样无法运行对照实验。可证伪性是一束锐利的探照灯。我们将在今日余下的时光里，看着它在边缘处摇曳明灭。</p>
</div>
</section>

<!-- ===================== INTERACTIVE 1 ===================== -->
<div class="panel web-only">
<p class="ptitle">互动 · 运行探照灯</p>
<h4>划界实验室</h4>
<p class="pnote">选择一项主张。我们将以<strong>波普尔</strong>检验之（它是否可证伪？）——继而交由三位使问题复杂化的思想家再审。注意四者相左之频繁。那分歧本身<em>便是</em>科学哲学。</p>

<div class="lab-grid">
<div class="claimlist" id="claimlist">
<button class="clbtn" data-c="relativity" aria-pressed="true">
<span class="ci">A</span>
<span class="cl"><b>「星光掠过太阳时弯折 1.75″。」</b><span>爱因斯坦，广义相对论</span></span>
</button>
<button class="clbtn" data-c="astrology">
<span class="ci">B</span>
<span class="cl"><b>「水星逆行扰乱通讯。」</b><span>占星术</span></span>
</button>
<button class="clbtn" data-c="marx">
<span class="ci">C</span>
<span class="cl"><b>「历史由阶级斗争驱动。」</b><span>正统马克思主义</span></span>
</button>
<button class="clbtn" data-c="strings">
<span class="ci">D</span>
<span class="cl"><b>「现实由十一维空间中振动的弦构成。」</b><span>弦理论</span></span>
</button>
<button class="clbtn" data-c="evolution">
<span class="ci">E</span>
<span class="cl"><b>「一切生命共享共同祖先。」</b><span>进化生物学</span></span>
</button>
<button class="clbtn" data-c="freud">
<span class="ci">F</span>
<span class="cl"><b>「被压抑的冲突导致神经症。」</b><span>精神分析</span></span>
</button>
</div>

<div class="verdict-card" id="verdictCard">
<!-- filled by JS -->
</div>
</div>
</div>
<div class="format-alt epub-only print-only">
<p class="ptitle">参考表格</p>
<h4>划界实验室</h4>
<table class="alt-table">
<thead><tr><th>主张</th><th>波普尔</th><th>库恩</th><th>拉卡托斯</th><th>群簇视角</th></tr></thead>
<tbody>
<tr><td>星光弯折 1.75 角秒</td><td>科学</td><td>科学</td><td>进步</td><td>强科学画像</td></tr>
<tr><td>水星逆行扰乱通讯</td><td>非科学</td><td>非成熟科学</td><td>退化</td><td>弱画像</td></tr>
<tr><td>阶级斗争驱动历史</td><td>按常用方式往往不可证伪</td><td>视情况而定</td><td>可能退化</td><td>社会科学兼哲学的混合</td></tr>
<tr><td>弦理论</td><td>关键形式尚未可检验</td><td>无决定性检验的常规科学</td><td>开放问题</td><td>鲜活的边界案例</td></tr>
<tr><td>共同祖先</td><td>可证伪</td><td>生物学核心范式</td><td>进步</td><td>强科学画像</td></tr>
</tbody>
</table>
</div>

<section>
<p class="sec-eyebrow">复杂的现实</p>
<h2>库恩：但科学并非那样运行</h2>
<p>波普尔描述了科学<em>应当</em>如何运作。1962 年，一位由物理学家转行的史学家<strong>托马斯·库恩</strong>审视了它<em>实际</em>如何运作——发现了某种更为芜杂，也更具人性的事物。他的著作《科学革命的结构》成为二十世纪被引用最多的学术著作之一，并赋予你一个用过百遍却不知出处的词：<em class="term">范式</em>。</p>
<p>这是库恩的异端。真正工作中的科学家，几乎在全部时间里，<em>并非</em>试图证伪他们的宏大理论。他们在做他所谓<em class="term">常规科学</em>之事：在一个被接受的框架——一个范式——内部解谜，而他们将这范式视为理所当然。一位化学家醒来时并不试图反驳元素周期表；她用它去琢磨一个反应。范式并非被告。它是法庭本身。</p>
<p>而当实验结果异常时？科学家们大多<em>不会</em>像波普尔的故事所要求的那样立刻抛弃理论。他们会暂且把它视为<em class="term">反常</em>——一个留待日后解决的谜题，也许只是自己哪里做错了。理论太过有用，太过多产，不至于因一个顽固的数据点而弃之。问题因此变得更细：类似的防守策略，有时是成熟科学的日常工作，有时又是伪科学的护身符。</p>
<p>只有当反常<em>堆积</em>——当它们变得太多、太核心而无法忽视——领域才滑入<em class="term">危机</em>。而危机之解决，并非通过整洁的反驳，而是通过一场<strong>科学革命</strong>：向新范式的全盘<em>切换</em>。托勒密的圆环让位于开普勒的椭圆；牛顿的绝对空间让位于爱因斯坦的时空。库恩认为这些转变如此彻底，以至于两个范式变为<em class="term">不可通约</em>——「无共同尺度」，因为对立的阵营甚至对关键词汇的含义、哪些问题才重要都无法达成一致。「质量」于牛顿与爱因斯坦意指微妙不同的东西。范式切换不太像赢得一场论证，更像是一次<em>格式塔翻转</em>——鸭子变作兔子，你无法同时看见两者。</p>

<div class="aside">
<p class="h">一个值得破除的迷思</p>
<p>库恩常被挥舞为「科学不过是意见」或「所有范式同等有效」的证据。他<em>憎恶</em>这种解读，并耗费数年反击。他的要点并非科学是非理性的——而是科学理性比那洁净的证伪主义童话所承认的更具<em>共同体特征</em>、更有<em>历史纵深</em>，也更为<em>保守</em>。范式被推翻，是因为对手真正解决了更多谜题。那不是相对主义。只是对人类实际工作的现实主义。</p>
</div>
</section>

<section>
<p class="sec-eyebrow">修补</p>
<h2>拉卡托斯：理论并非孤身赴死——以及杜恒–奎因的幽灵</h2>
<p>波普尔说<em>证伪</em>；库恩说<em>科学家并不如此，且也不应急于如此</em>。可有一条道路能兼纳二者——在保持证伪的脊梁的同时承认库恩的历史？<strong>伊姆雷·拉卡托斯</strong>，一位栖身伦敦经济学院的匈牙利流亡者，试图搭建的正是这样一座桥梁。但首先，我们必须会见萦绕整间屋子的幽灵。</p>
<p>它被称为<em class="term">杜恒–奎因论题</em>，一旦看见便无法视而不见。其主张简单却摧枯拉朽：<strong>没有任何假说是被单独检验的。</strong>当你检验「这颗星位于<em>彼处</em>」时，你同时依赖光学、大气模型、望远镜的校准、光如何传播的理论。故当预言失败时，纯逻辑<em>从不</em>告诉你哪一环断裂。或许是假说错了——又或许你的望远镜校准有误。你总可以把责任推给辅助假设，来拯救自己钟爱的理论。波普尔那洁净的「一只黑天鹅便杀死理论」，原来从不曾那般洁净：你可以坚称那黑天鹅不过是一只被涂漆的鹅。</p>
<p>这并非书斋里的琐屑——它是真正发现的引擎。当 1840 年代天王星偏离其牛顿式轨道时，无人宣布牛顿被反驳。他们归咎于一项辅助：必定有一颗<em>隐匿行星</em>在牵引它。他们是对的——<strong>海王星</strong>便是 1846 年以此方式发现的，一场辉煌的正名。受此鼓舞，天文学家们对水星的摇摆使出同一招，预言了另一颗隐匿行星，命名为<strong>祝融星</strong>。他们搜寻了数十年。它并不存在。水星的摇摆是在告诉世人牛顿本人并不完备——而唯有 1915 年的爱因斯坦能道破此点。<em>同样的逻辑招式，相反的结果。</em>那么如何分辨高明的拯救与绝望的遁词？</p>
<p>拉卡托斯的答案重构了科学的单元。不要评判孤立的理论——评判随时间展开的<em class="term">研究纲领</em>。每一纲领皆有一组<strong>受保护的核心命题</strong>（例如「牛顿定律成立」），外裹一层可调辅助假设的<em class="term">保护带</em>。麻烦来临时，你在保护带中吸纳冲击，而非伤及核心。这本身并非问题。关键在于<em>接下来</em>会发生什么：</p>
<ul>
<li>一个<strong>进步</strong>的纲领，其补丁<em>预言了令人惊异的新事实</em>，而这些新事实随后真的出现。「有一颗隐匿行星」预言了海王星在天空中特定位置——而它果然就在那里。这场拯救<em>以新知识偿付了自身</em>。</li>
<li>一个<strong>退化</strong>的纲领，其补丁永远只是<em>事后</em>追补，为每一次失败硬凑借口，却从不预言新的事物。祝融星被无尽地重新安置到恰好无法被看见之处，便是警示的信号。</li>
</ul>
<p>这便是重新绘制的划界线——而且与真实历史契合得多。科学并非单一理论面对单一裁决；它是一个<em>纲领</em>在岁月中赢得或失去其立足之地，衡量的标准是它是否持续告诉我们尚未知晓的事物。</p>
</section>

<section>
<p class="sec-eyebrow">重锤</p>
<h2>费耶阿本德与「那」方法的死亡</h2>
<p>随后，拉卡托斯的友人与论敌<strong>保罗·费耶阿本德</strong>把整个项目推到了极限。在《反对方法》（1975）中，他提出了一项调皮、恼人、却又奇怪地证据充分的论证：翻检伟大科学突破的真实历史，你会发现<em>每一条</em>被提出的方法规则，都在某个关键时刻被<em>某人</em>打破，而正是为了推动进步。伽利略以宣传、修辞伎俩与忽视不便数据的方式推进了哥白尼事业。若他遵从了整饬的方法规则，那场革命或许便会停滞。</p>
<p>他的结论成为科学哲学中最臭名昭著的一句口号：<em class="term">「怎么都行。」</em>但这里有一个几乎人人忽略的关键细节——费耶阿本德并<em>非</em>意指「随心所欲，所有想法平等」。他的意思是，这是一条苦涩的<em>归谬</em>：唯一没有历史反例的方法规则，是一条空泛到允许一切的规则。用他的话来说，这是一位理性主义者终于审视真实科学史后发出的「惊恐的呼喊」。他焚烧的是存在某种大写 M 的方法论可以一劳永逸地定义科学的观念——而非在认可混乱。</p>
<p>1983 年，哲学家<strong>拉里·劳丹</strong>发表了看似葬礼悼词的文字。在那篇著名的论文《划界问题的消亡》中，他论证<em>所有</em>试图画出清晰界线的尝试——包括波普尔的——皆已失败，而「科学」与「伪科学」过于多样，无法共享单一的决定性标记。这些术语，他尖刻地写道，大体只是「承载我们情感评判的空洞辞藻」。两千五百年后，划界问题被宣告死亡。</p>
</section>

<section>
<p class="sec-eyebrow">复活</p>
<h2>为何界线依然重要</h2>
<p>然而——这个问题太有用，不会真的入土为安。2013 年，哲学家<strong>马西莫·皮柳奇与马尔滕·布德里</strong>编纂了一部直言不讳的文集：《伪科学哲学：重新思考划界问题》，向劳丹发起了复兴。他们的论证部分出于实践，且难以挥之而去：在一个疫苗抗拒、气候否认、神迹疗法与智能设计「理论」并存的世界里，分辨科学与其仿品并非闲散的客厅游戏。它关乎生死。</p>
<p>他们的哲学转向是，不再要求某种<em>单一的</em>万能标准，而是将科学视为一个<em class="term">家族相似概念</em>——借用维特根斯坦的术语。并非每一种科学都共享某一特征，而每一种伪科学都缺乏它。取而代之的是一组彼此重叠的特征：可证伪的预言，诚然，但也包括经验证绩、对修正的开放、与既有知识的融贯、对反常的诚实处理，以及典型遁词的缺席（无尽的事后补救、受迫害叙事、对证据的免疫）。没有单根线维系整条绳索；是众多线股的交叠。真正的科学可能在某一标准上薄弱，而在其余标准上强劲。伪科学则通过同时败给整幅图景而暴露自身。</p>
<p>而这便铺垫了今日全篇的点睛之笔。以上的一切——波普尔、库恩、拉卡托斯、诸美德的群簇——皆是<em>哲学</em>，在研讨室中辩论。但在过去十五年间，科学做了一件非凡之事：它以大规模实证的方式，将划界问题转向了<em>自身</em>。它问自己，已发表的诸多发现能否经受住最基本科学要求的考验。</p>
</section>

<section class="frontier">
<p class="sec-eyebrow">前沿 · 2026</p>
<h2>复现危机：划界在现实检验中</h2>
<p>若有一条几乎人人认同的标准——波普尔、库恩、你的高中老师——那便是<strong>可复现</strong>。真正的结果，当别人照着程序再做一遍时，应当再次出现。它不是侥幸、捏造或风尚。于是在 2010 年代，科学家们做了一件显而易见、令人不安、却从未被系统做过的事：他们取来成堆的已发表、经同行评议、备受赞誉的发现，逐一尝试复现。</p>

<div class="claim">
<div class="ctop">
<span class="cnum">结果 01</span>
<span class="chip ok" data-print="established"><i></i>核心数字 · 已确立</span>
<span class="chip hint" data-print="contested"><i></i>其含义 · 有争议</span>
</div>
<h3>震动心理学的一声枪响</h3>
<p>里程碑是<strong>开放科学合作组织的《估计心理科学的可复现性》</strong>（<em>Science</em>，2015 年 8 月 28 日）——约 270 位研究者，在布莱恩·诺塞克领导下，复现了三本顶尖心理学期刊上的<strong>100</strong>项研究，并与原作者合作确保方法无误。结果在该领域引发爆炸。但唯一最重要的教训却藏于明处：<strong>并不存在单一的「复现率」。</strong>该论文报告了数个，而它们讲述着不同的故事。请看。</p>

<div class="oscviz" id="oscviz" aria-hidden="false">
<div class="oscrow">
<div class="lab"><b>97%</b> 的<em>原始</em>研究报告了统计显著效应</div>
<div class="bartrack"><div class="barfill orig" data-w="97"></div></div>
<div class="pct">97%</div>
</div>
<div class="oscrow">
<div class="lab"><b>36%</b> 的<em>复现实验</em>再次达到显著性 <span style="color:var(--contested)">← 那个著名而惊人的数字</span></div>
<div class="bartrack"><div class="barfill rep" data-w="36"></div></div>
<div class="pct">36%</div>
</div>
<div class="oscrow">
<div class="lab"><b>47%</b> 的原始效应落在复现实验的 95% 置信区间内</div>
<div class="bartrack"><div class="barfill mid" data-w="47"></div></div>
<div class="pct">47%</div>
</div>
<div class="oscrow">
<div class="lab"><b>39%</b> 被复现团队<em>主观判定</em>为已复现</div>
<div class="bartrack"><div class="barfill mid" data-w="39"></div></div>
<div class="pct">39%</div>
</div>
<div class="oscrow">
<div class="lab"><b>≈50%</b> —— 复现实验的效应量平均约为原始大小的<em>一半</em></div>
<div class="bartrack"><div class="barfill rep" data-w="50"></div></div>
<div class="pct">~50%</div>
</div>
</div>
<p style="font-size:.92em;color:var(--ink-soft);margin-top:1rem;">每当你听见「只有三分之一的心理学是真实的」，便是有人抓起了<em>36%</em> 而丢弃了其余。更谨慎的概括更微妙，也更有意思：许多原始效应也许<strong>真实但被夸大</strong>——大约为首次报告的一半强度，且往往因复现实验功效不足而未能检出。<span style="color:var(--accent-deep);font-weight:500;">[核心数字已确立；解释仍有争议]</span></p>

<p>而作者拒绝让任何人——乐观者或唱衰者——过度解读。他们自己的结论是一篇校准的小杰作，也是对<a href="/zh/days/001-what-is-knowledge/"><strong>第 1 日</strong></a>教训的直接回响：基于错误理由而持有的真信念，并不等于知识：</p>
<blockquote>我们已确立为真实的效应，有多少？零。而我们已确立为虚假的效应，有多少？零。
<span class="src">——开放科学合作组织，Science（2015）</span></blockquote>
<p>请记住杜恒–奎因的幽灵，一次失败的复现实验并不<em>在逻辑上</em>反驳原始研究——条件总有差异。而这正是批评者发难之处。<strong>Gilbert, King, Pettigrew &amp; Wilson</strong>（<em>Science</em>，2016 年 3 月）认为该项目自身的复现实验统计功效不足，且经校正后，「数据与相反结论一致」——也就是复现情况可能相当好。原团队回应，乐观与悲观的解读皆未得到充分支持。<span style="color:var(--hint);font-weight:500;">[有争议]</span> ——<em>解读</em>确属悬而未决，即便这一广泛问题如今已被广泛接受为真实存在。</p>
</div>

<div class="claim">
<div class="ctop">
<span class="cnum">结果 02</span>
<span class="chip ok" data-print="established"><i></i>非心理学独有 · 已确立</span>
</div>
<h3>这并非一个领域的难堪</h3>
<p>那种条件反射式的辩护——「软科学嘛，还能指望什么」——随着同样的实验在其他领域展开并返回同样令人沮丧的范围而崩塌。危机是广泛的。以下是经核实的锚定数字；每次请注意度量标准，因为如我们刚见，度量标准<em>就是</em>故事本身。</p>

<table class="reptable">
<thead>
<tr><th>项目与发表处</th><th>复现对象</th><th class="num">已复现*</th><th>效应量缩减</th></tr>
</thead>
<tbody>
<tr>
<td class="metric"><b>心理学</b><br><span style="color:var(--ink-faint);font-size:.85em;">OSC, <em>Science</em> 2015</span></td>
<td class="metric">100 项研究，3 本顶尖期刊</td>
<td class="num">36%</td>
<td class="metric">约为原始的 ~50%</td>
</tr>
<tr>
<td class="metric"><b>癌症生物学</b><br><span style="color:var(--ink-faint);font-size:.85em;">Errington et al., <em>eLife</em> 2021</span></td>
<td class="metric">计划复现 193 项实验——仅约 50 项得以<em>尝试</em></td>
<td class="num">~46%†</td>
<td class="metric">约缩小 85%</td>
</tr>
<tr>
<td class="metric"><b>实验经济学</b><br><span style="color:var(--ink-faint);font-size:.85em;">Camerer et al., <em>Science</em> 2016</span></td>
<td class="metric">18 项实验室实验（AER, QJE）</td>
<td class="num">61%</td>
<td class="metric">约为原始的 ~66%</td>
</tr>
<tr>
<td class="metric"><b>社会科学</b><br><span style="color:var(--ink-faint);font-size:.85em;">Camerer et al., <em>Nat. Hum. Behav.</em> 2018</span></td>
<td class="metric"><em>Nature</em> 与 <em>Science</em> 中的 21 项实验</td>
<td class="num">62%</td>
<td class="metric">约为原始的 ~50%</td>
</tr>
<tr>
<td class="metric"><b>临床前肿瘤学</b><br><span style="color:var(--ink-faint);font-size:.85em;">Begley &amp; Ellis, <em>Nature</em> 2012</span></td>
<td class="metric">53 篇「里程碑」论文（安进）</td>
<td class="num">11%</td>
<td class="metric">——（53 篇中仅 6 篇被确认）</td>
</tr>
</tbody>
</table>
<p style="font-size:.78em;color:var(--ink-faint);margin-top:.7rem;">*「已复现」= 同方向显著效应，最严格的一般度量。†癌症生物学数字为得以完成的实验之中；引人注目的是，193 项原始实验中<strong>无一</strong>能仅凭发表的方法复现，且仅有 2% 可获得原始数据。<span style="color:var(--accent-deep);">[已确立]</span></p>

<p>最深的信号甚至不是失败率——而是<em>癌症生物学团队</em>发现他们<strong>无法弄清原始科学家究竟做了什么。</strong>方法部分过于单薄，无从遵循；原作者往往不愿分享方案或数据。一项你连<em>尝试</em>复现都做不到的发现，并非未通过波普尔的检验——它拒绝接受检验。而一项背景调查使不安具体化：当<em>Nature</em>于 2016 年调查<strong>1,576 位科学家</strong>时，超过<strong>70%</strong> 表示他们曾尝试复现<em>他人</em>的实验却遭失败，超过<strong>一半</strong>未能复现<em>自己</em>的实验。<span style="color:var(--accent-deep);font-weight:500;">[已确立]</span> ——尽管请注意这是意见数据，是科学家们<em>相信</em>什么，而非测得的比率。</p>
</div>

<div class="claim">
<div class="ctop">
<span class="cnum">结果 03</span>
<span class="chip ok" data-print="established"><i></i>未能复现的名例 · 已确立</span>
<span class="chip hint" data-print="contested"><i></i>「完全死亡」 · 有争议</span>
</div>
<h3>那些未能复现的著名发现——以及公开改口的科学家们</h3>
<p>抽象的概括不会刺痛人；具名的失败案例才会。一连串曾被称颂、TED 演讲级著名的效应，在高功效、研究预登记的复现实验中折戟——而令人瞩目的是，在最清楚的案例中，一位<em>原作者</em>公开改变了主意：</p>
<ul>
<li><strong>权力姿势。</strong>2010 年的发现称，以神奇女侠式站姿站立两分钟可提升睾酮与风险承受意愿（一场被观看数千万次的 TED 演讲）在 2015 年一项规模大得多的复现实验中，于每一项生理指标上失败。随后，原论文的第一作者<strong>达娜·卡尼</strong>做了一件罕见而可敬的事——她公开否定了自己最著名的成果：「我不相信『权力姿势』效应是真实的。」 <span style="color:var(--accent-deep);font-weight:500;">[已确立]</span></li>
<li><strong>自我损耗。</strong>意志力是一种随使用而耗竭的有限燃料这一主导理论，在<em>23 间实验室</em>（<em>N</em> = 2,141，2016 年）中得到检验。合并后的效应在统计上与<em>零</em>无法区分（<em>d</em> = 0.04）。该领域的一位领军研究者迈克尔·因兹利希特写道，原先的理论根基正在动摇。<span style="color:var(--accent-deep);font-weight:500;">[已确立]</span> 标准效应未能复现；某种微小效应是否尚存仍在争论。</li>
<li><strong>社会启动。</strong>那项经典主张——阅读关于老年的词汇会使你离开实验室时走得更慢——在 2012 年的独立复现实验中失败。它震动了整个领域，以至于诺贝尔奖得主<strong>丹尼尔·卡尼曼</strong>发出公开信，警告启动效应研究者，他们的领域已成为「对心理学研究诚信之怀疑的典型代表」。<span style="color:var(--accent-deep);font-weight:500;">[已确立]</span> 针对这个具体案例。</li>
<li><strong>斯坦福监狱实验</strong>（1971）——或许是心理学史上最著名的「研究」——被档案研究（Le Texier，<em>American Psychologist</em>，2019 年）揭示更接近于<em>摆拍的戏剧</em>：狱卒被诱导向残忍，结果被耸人听闻化。它与其说是一次复现失败，不如说是划界问题中的警示案例——一项或许从来不是实验的演示。<span style="color:var(--hint);font-weight:500;">[有争议]</span> ——津巴多生前反驳了这些批评；是否应将其从教科书中剔除仍在争执。</li>
</ul>
</div>

<div class="claim">
<div class="ctop">
<span class="cnum">转折</span>
<span class="chip ok" data-print="optimistic"><i></i>自我修正 · 乐观的解读</span>
</div>
<h3>这是科学的失败——还是科学在运作？</h3>
<p>换个角度看，整场危机也可以是一个充满希望的故事，而非一桩丑闻。上述每一个数字都来自<em>科学家以科学审视科学</em>——使用研究预登记、高功效、公开共享的方法来揭露并丢弃那些站不住脚的主张。那是<strong>波普尔的反驳之刃，终于向内翻转。</strong>危机并非划界标准错误的证据，而是它们<em>正在运作</em>的证据，痛苦地、公开地运作着。</p>
<p>而且它触动了真正的改革。<em class="term">研究预登记</em>——在看见数据之前陈述你的假设与分析——关上了那扇夸大效应的暗门（p 值操纵）；<strong>注册式报告</strong>，即期刊在结果出现之前仅依据<em>方法</em>接受研究，如今已被 300 余家期刊采纳。有人提议将「显著」阈值从<em>p</em> &lt; 0.05 收紧至<em>p</em> &lt; 0.005，而开放数据与多实验室联盟的文化已成常规。该领域正视休谟留下的缺口，看见运气与偏见多么轻易地伪造知识——正是<a href="/zh/days/001-what-is-knowledge/"><strong>第 1 日</strong></a>盖梯尔忧虑在工业规模上的重现——并开始重建其工具。我们将在<strong>第 149 日</strong>再次完整遇见这场改革运动。</p>
</div>
</section>

<section>
<p class="sec-eyebrow">悬而未决的问题</p>
<h2>何谓真正尚未落定</h2>
<p>两千五百年过去，「何为科学？」这一问题的审慎回答仍留下几条没有系紧的线：</p>
<ul>
<li><strong>是否存在任何单一的划界标准</strong>——还是劳丹赢了，留下的只有维特根斯坦式的、重叠的诸美德家族，而无总纲？</li>
<li><strong>杜恒–奎因问题能在多大程度上被驯服？</strong>若一次失败的检验从不从逻辑上定罪于假说，高功效、研究预登记的复现实验如何真正缩减腾挪空间——它们能否将之彻底关闭？</li>
<li><strong>那些根本无法运行实验的科学又该如何</strong>——宇宙学、进化生物学、弦理论？若一种理论在整整一代人的时间里无法作出可检验的预言（<strong>第 48 日</strong>的量子引力难题隐约浮现），它是科学、尚待检验的理论，还是数学？</li>
<li><strong>复现的底线在哪里？</strong>社会科学中 62% 的复现率——面对复杂的人类行为，这算失败、合理水平，还是在「复现」定义本身达成一致之前无从判断？</li>
<li><strong>而那个将萦绕整门课程的问题：</strong>若即便经同行评议、备受赞誉的发现也被夸大了半数之多，那么<em>你</em>——在阅读任何一项自信的断言时，包括本页上的——该如何设定你的信念刻度？（请用第 4 日和第 6 日的工具来回答。）</li>
</ul>
</section>

<div class="recap">
<p class="h">◆ 一日三句话</p>
<dl>
<div><dt>核心洞见</dt><dd>休谟指出，你永远无法以堆积证实来证明一条普遍定律，故科学转而提出大胆的、可证伪的猜想并竭力试图<em>反驳</em>它们——但真实的科学比那条洁净规则更复杂（库恩、拉卡托斯、费耶阿本德），而现代复现危机正是那场辩论最终以硬数字接受检验。</dd></div>
<div><dt>最佳类比</dt><dd>黑天鹅：百万只白天鹅无法证明「所有天鹅皆白」，但澳大利亚的一只黑天鹅便永久否证了它——最终证实做不到，证伪却可一锤定音。</dd></div>
<div><dt>活的争议</dt><dd>是否存在单一界线划分科学与伪科学（波普尔的可证伪性 vs 劳丹的「消亡」），以及复现数字<em>究竟意味着什么</em>——是破碎科学的丑闻，还是科学按设计运作的健康、公开的自我修正。</dd></div>
</dl>
<p class="threads"><b>今日线索 ›</b> 信息（复现实验作为检验一项主张承载真实信号抑或噪音的试金石）· 演化（在波普尔那里，知识像选择过程一样增长——经反驳而幸存的猜想，预告<strong>第 74 日</strong>）· 计算与涌现（轻触——科学作为一个分布式的、自我修正的寻错系统，能完成任何单个心智无法完成的事）。</p>
</div>

<div class="tomorrow">
<p class="h">明日 <span class="arrow">→</span> 第 03 日</p>
<h3>逻辑与有效推理</h3>
<p>今日我们频频倚仗「有效」、「由此推出」、「矛盾」等词——但使论证真正成立<em>的</em>规则究竟是什么？明日我们将深入逻辑本身：演绎（能保真，却不能凭空增加新信息）、归纳（休谟留下的伤口）与溯因（像侦探一样选择最佳解释）。我们将遇见日常欺骗我们的谬误，追问逻辑是<em>被发现</em>的还是<em>被发明</em>的，并抵达前沿——在那里，机器如今检验着人类无法完全容纳于头脑中的证明。这是此前所有讨论赖以成立的逻辑底座。</p>
</div>

<hr class="div">

<section class="sources">
<p class="sec-eyebrow">来源</p>
<h2>来源与延伸阅读</h2>
<ol>
<li>Hume, D. (1739–40). <em>A Treatise of Human Nature</em>, Book I, Part iii. And (1748) <em>An Enquiry Concerning Human Understanding</em>, §IV–V. <span class="meta">——归纳问题；日出段落。见</span> <a href="https://plato.stanford.edu/entries/induction-problem/">Stanford Encyclopedia of Philosophy, "The Problem of Induction"</a> <span class="meta">（修订版 2018）。</span></li>
<li>Popper, K. (1959). <em>The Logic of Scientific Discovery</em> (orig. <em>Logik der Forschung</em>, 1934). And (1963) <em>Conjectures and Refutations: The Growth of Scientific Knowledge.</em> Routledge. <span class="meta">——可证伪性；爱因斯坦 vs 弗洛伊德/阿德勒/马克思。见</span> <a href="https://plato.stanford.edu/entries/popper/">SEP, "Karl Popper"</a><span class="meta">。</span></li>
<li>Kuhn, T. S. (1962; 2nd ed. 1970). <em>The Structure of Scientific Revolutions.</em> University of Chicago Press. <span class="meta">——常规科学、范式、反常、危机、革命、不可通约性。见</span> <a href="https://plato.stanford.edu/entries/thomas-kuhn/">SEP, "Thomas Kuhn"</a><span class="meta">。</span></li>
<li>Lakatos, I. (1970). "Falsification and the Methodology of Scientific Research Programmes," in Lakatos &amp; Musgrave (eds.), <em>Criticism and the Growth of Knowledge.</em> Collected in <em>Philosophical Papers, Vol. 1</em> (Cambridge UP, 1978). <span class="meta">——受保护的核心命题、保护带、进步与退化纲领。</span></li>
<li>Feyerabend, P. (1975). <em>Against Method: Outline of an Anarchistic Theory of Knowledge.</em> New Left Books. <span class="meta">——认识论无政府主义；「怎么都行」作为归谬。见</span> <a href="https://plato.stanford.edu/entries/feyerabend/">SEP, "Paul Feyerabend"</a><span class="meta">。</span></li>
<li>Duhem, P. (1906). <em>The Aim and Structure of Physical Theory.</em> And Quine, W. V. O. (1951). "Two Dogmas of Empiricism," <em>The Philosophical Review</em> 60(1): 20–43. <span class="meta">——不充分决定 / 整体确证论。见</span> <a href="https://plato.stanford.edu/entries/scientific-underdetermination/">SEP, "Underdetermination of Scientific Theory"</a><span class="meta">。</span></li>
<li>Laudan, L. (1983). "The Demise of the Demarcation Problem," in Cohen &amp; Laudan (eds.), <em>Physics, Philosophy and Psychoanalysis.</em> Reidel, pp. 111–127.</li>
<li>Pigliucci, M. &amp; Boudry, M. (eds.) (2013). <em>Philosophy of Pseudoscience: Reconsidering the Demarcation Problem.</em> University of Chicago Press. <a href="https://press.uchicago.edu/ucp/books/book/chicago/P/bo15996988.html">press.uchicago.edu</a> <span class="meta">——复兴；科学作为家族相似 / 群簇概念。</span></li>
<li>Open Science Collaboration (2015). "Estimating the reproducibility of psychological science." <em>Science</em> 349(6251): aac4716. <span class="meta">doi:10.1126/science.aac4716。</span> <a href="https://www.science.org/doi/10.1126/science.aac4716">science.org</a> <span class="meta">——97% / 36% / 47% / 39% / ~50%。</span></li>
<li>Gilbert, D. T., King, G., Pettigrew, S. &amp; Wilson, T. D. (2016). "Comment on 'Estimating the reproducibility of psychological science.'" <em>Science</em> 351(6277): 1037. <span class="meta">——批评；</span> <a href="https://www.science.org/doi/10.1126/science.aad9163">OSC 回应</a> <span class="meta">（Anderson et al.，同期）。</span></li>
<li>Errington, T. M. et al. (2021). "Investigating the replicability of preclinical cancer biology." <em>eLife</em> 10: e71601 (Reproducibility Project: Cancer Biology). <span class="meta">——193 项中约 50 项实验被尝试；效应约缩小 85%；方法/数据大多无法获得。</span></li>
<li>Camerer, C. F. et al. (2016). "Evaluating replicability of laboratory experiments in economics." <em>Science</em> 351(6280): 1433–1436. <span class="meta">doi:10.1126/science.aaf0918</span> <span class="meta">——18 项中 11 项（61%）。</span></li>
<li>Camerer, C. F. et al. (2018). "Evaluating the replicability of social science experiments in Nature and Science between 2010 and 2015." <em>Nature Human Behaviour</em> 2: 637–644. <span class="meta">——21 项中 13 项（62%）。</span></li>
<li>Klein, R. A. et al. (2018). "Many Labs 2: Investigating variation in replicability across samples and settings." <em>Advances in Methods and Practices in Psychological Science</em> 1(4): 443–490. <span class="meta">——28 项中 15 项（54%）；场景未能解释失败。</span></li>
<li>Begley, C. G. &amp; Ellis, L. M. (2012). "Raise standards for preclinical cancer research." <em>Nature</em> 483: 531–533. <span class="meta">doi:10.1038/483531a</span> <span class="meta">——53 项中 6 项（11%）里程碑论文被确认（安进）。</span></li>
<li>Baker, M. (2016). "1,500 scientists lift the lid on reproducibility." <em>Nature</em> 533: 452–454. <span class="meta">doi:10.1038/533452a</span> <span class="meta">——&gt;70% 未能复现他人结果；&gt;50% 未能复现自己的结果。</span></li>
<li>Hagger, M. S. et al. (2016). "A multilab preregistered replication of the ego-depletion effect." <em>Perspectives on Psychological Science</em> 11(4): 546–573. <span class="meta">——23 间实验室；d = 0.04。</span></li>
<li>Ranehill, E. et al. (2015). "Assessing the robustness of power posing." <em>Psychological Science</em> 26(5): 653–656. And Carney, D. R. (2016), 公开声明否定权力姿势效应。见 <a href="https://en.wikipedia.org/wiki/Power_posing">概述</a><span class="meta">。</span></li>
<li>Le Texier, T. (2019). "Debunking the Stanford Prison Experiment." <em>American Psychologist</em> 74(7): 823–839. <span class="meta">doi:10.1037/amp0000401。</span> <a href="https://pubmed.ncbi.nlm.nih.gov/31380664/">pubmed</a></li>
<li>Ioannidis, J. P. A. (2005). "Why most published research findings are false." <em>PLoS Medicine</em> 2(8): e124. <span class="meta">——奠基性（且基于模型，故细节上有争议）论文。</span></li>
<li>Benjamin, D. J. et al. (2018). "Redefine statistical significance." <em>Nature Human Behaviour</em> 2: 6–10. <span class="meta">doi:10.1038/s41562-017-0189-z</span> <span class="meta">——p &lt; 0.005 提案（及 Amrhein &amp; Greenland「移除而非重新定义」的反驳）。</span></li>
<li>Chambers, C. D. (2013). "Registered Reports: A new publishing initiative at Cortex." <em>Cortex</em> 49(3): 609–610. And Chambers &amp; Tzavella (2022), <em>Nature Human Behaviour</em> 6: 29–42 <span class="meta">——注册式报告如今已有 300 余家期刊采纳。</span></li>
</ol>
</section>

<p class="endcap">第 02 日终 · <span class="gleam">还有 178 日等待深入</span></p>

</div>
