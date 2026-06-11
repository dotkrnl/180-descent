---
layout: layouts/day.njk
tags: zhDay
locale: zh
day: 1
title: "知识是什么？"
summary: "一座停走的时钟揭示了，为何有正当理由的真信念仍不一定构成知识。"
block: 知识与推理的根基
slug: what-is-knowledge
day_path: 001-what-is-knowledge
source_file: ../day-01-what-is-knowledge.html
threads:
  - 信息
  - 计算
  - 涌现
permalink: /zh/days/001-what-is-knowledge/
---
<header class="hero wrap">
<p class="eyebrow">模块一 · 知识与推理的根基 · <span class="daymark">第 01 日 / 180</span></p>
<h1>知识是什么？</h1>
<p class="sub">你看了时钟。你是对的。但这算<em>知道</em>吗？</p>

<figure class="hero-clock">
<div class="clockwrap">
<svg viewBox="0 0 240 240" role="img" aria-label="一座模拟时钟显示 9:12，它已在暗中停走。">
<defs>
<radialGradient id="face" cx="50%" cy="42%" r="70%">
<stop offset="0%" stop-color="var(--raised)"></stop>
<stop offset="100%" stop-color="var(--paper)"></stop>
</radialGradient>
</defs>
<circle cx="120" cy="120" r="108" fill="url(#face)" stroke="var(--line-strong)" stroke-width="2"></circle>
<circle cx="120" cy="120" r="100" fill="none" stroke="var(--line)" stroke-width="1"></circle>
<!-- 刻度 -->
<g id="ticks" stroke="var(--ink-faint)"></g>
<!-- 12 / 3 / 6 / 9 数字 -->
<g fill="var(--ink-soft)" font-family="IBM Plex Mono, monospace" font-size="12" text-anchor="middle">
<text x="120" y="34">12</text>
<text x="208" y="125">3</text>
<text x="120" y="216">6</text>
<text x="33" y="125">9</text>
</g>
<!-- 时针 9:12 (276 度) -->
<line x1="120" y1="120" x2="68.3" y2="114.6" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"></line>
<!-- 分针 12 分 (72 度) -->
<line x1="120" y1="120" x2="194.2" y2="95.9" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round"></line>
<!-- 停走的秒针 -->
<line x1="120" y1="120" x2="150" y2="180" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round"></line>
<circle cx="120" cy="120" r="5.5" fill="var(--ink)"></circle>
<circle cx="120" cy="120" r="2" fill="var(--accent)"></circle>
</svg>
</div>
<span class="stopped-tag">● 已在 12 小时前停走——但就在这一分钟，它恰好正确</span>
</figure>

<p class="lede"><span class="drop">早</span>上九点十二分，你快要迟到了。你匆匆路过时抬头瞥了一眼车站的大钟，读出<strong>9:12</strong>，心想：「还好——还有三分钟富余。」你没错，此刻确实是 9:12。然而，你所信赖的那座钟恰好在十二小时前的凌晨时分便已停在 9:12，从此凝固不动。你只是在它一天中唯一碰巧正确的那一分钟，信任了一台坏掉的仪器。</p>

<p>你的信念是<strong>真的</strong>。它建立在一条完全合理的<strong>理由</strong>之上——时钟就是用来报时的，而你此前已安然无恙地信赖过上千座钟。你发自内心地<strong>相信</strong>它。那么：你<em>知道</em>此刻是 9:12 吗？仔细一问，几乎所有人都会说不知道。某种东西缺失了。但要精确说出缺少的是什么，哲学家们已经争论了六十年；而类似的困惑，如我们将看到的，早在千年前就已出现。</p>
</header><div class="wrap">

<div class="whereblock">
<p class="label">◆ 我们身在何处</p>
<p>这是第一次深入，因此身后尚无来路——日志一片空白。相反，我们今天播下种子。今日引入的这套机制（信念以<em>程度</em>呈现；根据证据更新；心智作为推理引擎）是整个课程赖以支撑的认识论工具箱。留意它将在<a href="/zh/days/002-scientific-method-and-demarcation/"><strong>第 2 日</strong></a>（科学如何判定什么才算数）、<strong>第 4 日</strong>（概率作为部分信念的逻辑）、<strong>第 7 日</strong>（信息）、<strong>第 119 日</strong>（预测性大脑）以及<strong>第 149 日</strong>（著名发现为何经不起复现检验）中重新浮现。我们将贯穿全部 180 天的五条线索——<em>信息、能量、演化、涌现、计算</em>——都在此处悄然首演。</p>
</div>

<section>
<p class="sec-eyebrow">模型</p>
<h2>三条腿的凳子</h2>
<p>大约二十三个世纪以来，西方哲学一直随身携带一个关于「知识是什么？」的简明答案。要<em class="term">知道</em>某事为真，你需要同时具备三点：</p>
<p><strong>（1）你相信它</strong>——你无法知道你甚至不认为真的东西。<strong>（2）它是真的</strong>——你不能<em>知道</em>一个假命题；那些说「我就知道地球是平的」的人，只是<em>相信</em>它，自信且错误地相信。<strong>（3）你有正当理由</strong>——因为仅凭运气猜中也不算知识。那个对冷门胜出「就是有种感觉」的赌徒，即便赢了，也并未<em>知道</em>它会赢。</p>
<p>依此观点，知识即<em class="term">有正当理由的真信念</em>——JTB，一条三条腿的凳子。踢掉任何一条腿，它都会倒塌。这一图景通常追溯至柏拉图，他在<em>《泰阿泰德篇》</em>中提出，知识是「带有说明的真判断」。这里有一种美妙的反讽，历史学家们乐此不疲：正是在那篇对话中，苏格拉底随后拆解了这个定义，因此柏拉图可以说从未真正认可过那项以他命名的学说。正如一位学者所言，这就像一位杰出的批评家在摧毁某个传统的瞬间，竟又创造了它。</p>
<p>尽管如此，这一粗略的共识还是维系了下来。凳子看似稳固。然后，一位时年三十五岁的哲学家——据传说，他此前发表不多，又颇有些发表的需要——写了一篇三页论文。</p>
</section>

<section>
<p class="sec-eyebrow">手榴弹</p>
<h2>盖梯尔的三页论文</h2>
<p>1963 年，埃德蒙·盖梯尔在期刊 <em>Analysis</em> 上发表了一篇论文，标题直白得近乎俏皮：<em>《有正当理由的真信念算是知识吗？》</em>。全文仅三页。此后它被引用了<strong>数千</strong>次，并催生了整整几个子领域。现代哲学中，鲜有文献以每字计造成了更大的破坏。</p>
<p>盖梯尔的招数简单得令人崩溃。他构造了一些小故事，其中凳子的三条腿都稳稳在握——信念、为真、正当理由——但你绝不会说那个人<em>知道</em>。以下是他第一个案例的轻度现代化版本：</p>
<blockquote>史密斯与琼斯申请同一份工作。老板告诉史密斯：「琼斯会得到这个职位。」史密斯还闲来无事数了琼斯口袋里的硬币：十枚。于是史密斯形成了一个有充分理由的信念：「得到这份工作的人口袋里有十枚硬币。」</blockquote>
<p>现在出现转折。老板错了（或者改变了主意）：得到工作的是<strong>史密斯</strong>，而非琼斯。而且——史密斯本人完全不知情——他自己的口袋里恰好也有<strong>十枚硬币</strong>。来看他的信念，「得到这份工作的人口袋里有十枚硬币」：它是<strong>真的</strong>（获胜者史密斯确实有十枚硬币），它是<strong>有充分理由的</strong>（绝佳的证据——老板的话，实打实的硬币清点），而且他是真诚地<strong>相信</strong>的。JTB，三条腿齐全。然而史密斯显然并不<em>知道</em>这一点。他追踪的是<em>琼斯</em>，却就错了的人得出了对的答案。</p>
<p>这便是<em class="term">盖梯尔案例</em>的基本结构：你的理由<em>经由一个假命题</em>运行（「琼斯会得到这份工作」），而你的信念又被一桩无关的<em>巧合</em>（「史密斯也有十枚硬币」）碰巧带向真实。理由与事实从未真正相遇。停走的时钟只是同一种结构的更清楚版本：你的理由（那座钟）是坏的，而事实（此刻是 9:12）全凭运气成立。</p>

<div class="aside">
<p class="h">比名字更古老的转折</p>
<p>盖梯尔并非首创。伯特兰·罗素在<em>《人类的知识：其范围与限度》</em>（1948）中就已提出停钟案例。再往前追溯，这个问题堪称古老：大约在<strong>公元&nbsp;770&nbsp;年</strong>，佛教逻辑学家<strong>法称</strong>描述了一位旅人，他看到山丘上仿佛有烟，推断有火，而且确实有火——只不过那「烟」其实是一群昆虫。同一种结构，早了十二个世纪。十四世纪的印度，<strong>甘格沙</strong>为处理此类案例建立了一整套因果知识理论。「盖梯尔问题」是哲学中<em>趋同发现</em>的绝佳实例——那种心灵会独立地一再绊倒的东西，而它本身就在暗示：那里有某种真实的东西。</p>
</div>
</section>

<!-- ===================== INTERACTIVE 1 ===================== -->
<div class="panel web-only">
<p class="ptitle">交互演示 · 搭建与拆毁</p>
<h4>盖梯尔机器</h4>
<p class="pnote">切换三个经典条件。当三者重叠时，图表中央亮起——那便是<em>有正当理由的真信念</em>。然后试着打开红色开关<strong>运气</strong>，看着 JTB 依旧满足，知识却悄然溜走。或者载入一个经典情境。</p>

<div class="gm-grid">
<div>
<div class="switches">
<button class="swbtn" id="sw-b" role="switch" aria-checked="true">
<span class="knob"></span><span class="lab"><b>信念</b><span>你真心持守它</span></span>
</button>
<button class="swbtn" id="sw-t" role="switch" aria-checked="true">
<span class="knob"></span><span class="lab"><b>为真</b><span>事实正是如此</span></span>
</button>
<button class="swbtn" id="sw-j" role="switch" aria-checked="true">
<span class="knob"></span><span class="lab"><b>理由</b><span>你有充分理由</span></span>
</button>
<button class="swbtn luck" id="sw-l" role="switch" aria-checked="false">
<span class="knob"></span><span class="lab"><b>运气（盖梯尔转折）</b><span>理由失准；事实碰巧成立</span></span>
</button>
</div>
<div class="presets">
<p class="h">载入情境</p>
<div class="pbtns">
<button class="pbtn" data-preset="clock">停走的钟</button>
<button class="pbtn" data-preset="coins">史密斯与硬币</button>
<button class="pbtn" data-preset="guess">幸运的猜测</button>
<button class="pbtn" data-preset="false">自信的错误</button>
<button class="pbtn" data-preset="know">平常的认知</button>
</div>
</div>
</div>

<div class="venn-box">
<svg viewBox="0 0 400 330" role="img" aria-label="三个交叠的圆，分别代表信念、为真与理由。">
<defs>
<pattern id="hatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
<rect width="8" height="8" fill="color-mix(in srgb,var(--contested) 18%,transparent)"></rect>
<line x1="0" y1="0" x2="0" y2="8" stroke="var(--contested)" stroke-width="2"></line>
</pattern>
</defs>
<circle id="c-b" cx="200" cy="118" r="92" fill="color-mix(in srgb,var(--accent) 16%,transparent)" stroke="var(--accent)" stroke-width="2"></circle>
<circle id="c-t" cx="150" cy="208" r="92" fill="color-mix(in srgb,var(--accent) 16%,transparent)" stroke="var(--accent)" stroke-width="2"></circle>
<circle id="c-j" cx="250" cy="208" r="92" fill="color-mix(in srgb,var(--accent) 16%,transparent)" stroke="var(--accent)" stroke-width="2"></circle>
<text x="200" y="64" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="13" fill="var(--ink-soft)">信念</text>
<text x="96" y="250" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="13" fill="var(--ink-soft)">为真</text>
<text x="305" y="250" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="13" fill="var(--ink-soft)">理由</text>
<!-- center badge -->
<circle id="center-mark" cx="200" cy="178" r="30" fill="none" stroke="none"></circle>
<text id="center-label" x="200" y="183" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="13" font-weight="600" fill="var(--ink)" opacity="0"></text>
</svg>

<div class="verdict">
<div class="vstate" id="vstate">—</div>
<p class="vexpl" id="vexpl"></p>
<p class="story" id="vstory"></p>
</div>
</div>
</div>
</div>
<div class="format-alt epub-only print-only">
<p class="ptitle">参考表格</p>
<h4>盖梯尔机器</h4>
<p class="pnote">关键案例：</p>
<table class="alt-table">
<thead><tr><th>案例</th><th>信念</th><th>为真</th><th>理由</th><th>运气</th><th>裁决</th></tr></thead>
<tbody>
<tr><td>平常的认知</td><td>是</td><td>是</td><td>是</td><td>否</td><td>在经典 JTB 观点下，这是知识</td></tr>
<tr><td>停走的钟</td><td>是</td><td>是</td><td>是</td><td>是</td><td>非知识：事实只是碰巧成立</td></tr>
<tr><td>幸运的猜测</td><td>是</td><td>是</td><td>否</td><td>是</td><td>非知识：缺乏正当理由</td></tr>
<tr><td>自信的错误</td><td>是</td><td>否</td><td>是</td><td>否</td><td>非知识：命题为假</td></tr>
</tbody>
</table>
</div>

<section>
<p class="sec-eyebrow">补丁战</p>
<h2>寻找第四条腿</h2>
<p>面对盖梯尔，最自然的回应是：添上第四条条件，把运气筛除。几十年来，认识论家们孜孜以求——而每一次整洁的修补都撞上一个更刁钻的反例。这几乎成了一场残酷的智力竞赛。</p>
<p><strong>无假前提。</strong>最初的想法是：知识不能经由一个假命题推理得出。史密斯的信念倚赖于「琼斯会得到这份工作」，而这是假的；禁绝它，你便安全了。干净利落——直到阿尔文·戈德曼提出<strong>假谷仓地区</strong>（1976）。你驾车穿过一片区域，那里有人恶作剧，把每一座「谷仓」都做成平板电影布景——除了一座例外。你恰好瞥见了那座真谷仓，心想「那是座谷仓」。你的信念为真、理由充分，且<em>不</em>依赖任何假前提。然而你并不<em>知道</em>那是谷仓：你本可以如此轻易地在百米之外被布景板愚弄。</p>
<p><strong>追踪真相。</strong>那么，也许知识关乎你的信念在<em>邻近的可能世界</em>中如何表现。罗伯特·诺齐克（1981）提出了<em class="term">敏感性</em>：你<em>知道</em>命题<em>p</em>，仅当<em>若 p 为假，你便不会相信它。</em>优雅——却在边缘情形中产出古怪的裁决。欧内斯特·索萨（1999）将其翻转为<em class="term">安全性</em>：在所有邻近的可能展开中，你都不会出错。停走的钟在安全性上惨败（早一分钟或晚一分钟你便错了）；运转正常的钟则通过。假谷仓前的你同样未能通过安全测试。</p>
<p>随后，琳达·扎格泽布斯基（1994）以一种<strong>配方</strong>式的论证给了所有此类修补以致命一击——足以击溃<em>任何</em>同类方案。取一个有正当理由、却仍可能为假的信念（而正当理由既然可错，总允许这种可能）。安排理由失准，使信念为假——再借运气安排，让它终究为真。只要你的第四条条件没有走到要求理由<em>保证</em>为真那一步，运气就总能重新钻回空隙。补丁战或许在结构上便不可能获胜。</p>

<h3>两种退出战场的方式</h3>
<p><strong>宣布知识为原初概念。</strong>蒂莫西·威廉森在<em>Knowledge and Its Limits</em>（2000）中迈出了激进的一步：停止试图用更简单的零件拼凑知识。也许它根本无从分析。在他的<em class="term">知识优先</em>视域中，知道是一种基本的心灵状态——最普遍的<em>事实性</em>状态——而我们应当用知识去解释信念、证据与正当理由，而非反其道而行。你无法把<em>氢</em>或<em>约翰·F·肯尼迪</em>拆解成更简单的概念；也许知识同样是基石。六十年来失败的定义，看起来不再像一个谜题，而更像一条线索。</p>
<p><strong>诉诸能力。</strong>另一条出路是<em class="term">德性认识论</em>（又是索萨）。知识是<em>适切</em>的信念——它之所以为真，是因为认知者具有相应能力，而非凭偶然。想象一位弓箭手。一箭中的，仅当箭矢命中靶心<em>是因为</em>射手瞄准精妙——而非一阵风把劣射吹回了靶心。盖梯尔化的认知者正是那位弓箭手：第一阵风将箭吹离靶心，第二阵风又把它吹了回来。准确，是的。出于能力，不是。<em>适切</em>，不是。索萨说，这便是运气之击不算知识的缘由。</p>
</section>

<section>
<p class="sec-eyebrow">辩论</p>
<h2>信念究竟何以获得正当理由？</h2>
<p>从「这是知识吗？」退后一步，回到那条更谦卑的凳腿：一个信念最初如何获得<em>正当理由</em>？追问任何理由，你都会陷入回溯。现在是 9:12，因为钟这么显示。信赖钟，因为钟是可靠的。相信<em>那一点</em>，又因为……于是你滑向了深渊。古代怀疑论者精准地绘出了陷阱。每一条理由之链，他们论证道，终结于三种令人不安的处所之一——<em class="term">阿格里帕三难困境</em>：它永远<strong>延续</strong>下去，或绕回一个<strong>循环</strong>，或止于某个你干脆宣称的<strong>武断</strong>之点。</p>
<p>三个现代学派各自选择抓住哪一只角——而第四个学派彻底换了话题。</p>
</section>

<!-- ===================== VISUAL 2 ===================== -->
<div class="panel tri">
<p class="ptitle">图示 · 回溯难题</p>
<h4>阿格里帕三难困境——三种糟糕的终点，四种逃逸之路</h4>
<p class="pnote">你的信念为何有正当理由？对「……那又为何？」的每一个诚实回答，终将撞上三面高墙之一。</p>
<div class="regress-map print-hide" role="img" aria-label="一条理由链最终走向无穷回溯、循环或武断止步。">
<div class="regress-chain">
<div class="rnode strong"><b>信念</b><span>「现在是 9:12」</span></div>
<div class="rstep" aria-hidden="true">-></div>
<div class="rnode"><b>理由</b><span>「那座钟这么显示」</span></div>
<div class="rstep" aria-hidden="true">-></div>
<div class="rnode"><b>更深的理由</b><span>「那座钟可靠」</span></div>
</div>
<div class="regress-outcomes">
<article class="routcome"><span>∞</span><b>无穷回溯</b><p>每一个理由都继续要求另一个理由。</p></article>
<article class="routcome"><span>↻</span><b>循环</b><p>理由链绕回已经用过的主张。</p></article>
<article class="routcome"><span>▮</span><b>武断止步</b><p>理由链停在某个不再追问的基本承诺上。</p></article>
</div>
</div>
<div class="tri-print epub-only print-only">
<p><strong>推理链条：</strong>信念： 「现在是 9:12」 → 因为「那座钟」 → 因为「……那又为何？」</p>
<ol>
<li><strong>无穷回溯：</strong>每一个理由都需要另一个理由，永无止境。</li>
<li><strong>循环：</strong>链条绕回自身，回到已经用过的某一点。</li>
<li><strong>武断止步：</strong>链条干脆停在某处基本承诺上，不再追问。</li>
</ol>
</div>
<div class="tri-key">
<div class="k"><b>基础主义</b> —— 接受第三种不适：有些信念是<em>基本的</em>，无需进一步支撑（原初经验、简单逻辑）。链条就此停住，却非武断。</div>
<div class="k"><b>融贯主义</b> —— 拥抱循环，却使之成为一种美德：没有信念孤立存在；一个信念是否有正当理由，取决于它与整个信念网络契合得有多好。（这是<em>系统思维</em>的先声，第 9 日。）</div>
<div class="k"><b>无穷主义</b> —— 勇敢的少数派：接受正当理由是一条永无尽头的理由之链，从不触底。</div>
<div class="k"><b>可靠主义</b> —— 改换问题。一个信念只要由<em>可靠的过程</em>产生——良好的视觉、健全的记忆——就算有正当理由，无论你是否能背诵出一套辩护。这是<em>外在主义</em>：正当理由可以是你认知机制的事实，而非你头脑中的故事。</div>
</div>
</div>

<section>
<p>内在与外在的分裂，其重要性远超表象。<strong>内在主义者</strong>主张，正当理由必须是你经由反思即可触及的东西——「从内部」可得的理由。<strong>外在主义者</strong>（可靠主义的大本营）则认为，重要的是你的信念事实上以趋向真理的方式产生，无论你是否能够触及。请将这一张力存于心中：这正是旧日的扶手椅问题与关于大脑如何真正形成信念的新科学正面相撞之处。</p>
</section>

<section class="frontier">
<p class="sec-eyebrow">前沿 · 2026</p>
<h2>三条活跃前沿——以及炒作过滤器</h2>
<p>本课程的每一天都在研究前沿收束，每一项主张都标注着它能承载多少重量。知识正处在一个迷人的交汇点上：哲学家、心理学家与神经科学家正从不同方向环绕着同一组问题。</p>

<div class="claim">
<div class="ctop">
<span class="cnum">前沿 01</span>
<span class="chip bad" data-print="superseded"><i></i>原初主张 · 已被取代</span>
<span class="chip ok" data-print="established"><i></i>复现研究 · 已确立</span>
</div>
<h3>「知识」直觉是普世的——抑或仅仅是西方的？</h3>
<p>当整个学科的运行逻辑是「若仔细追问，几乎所有人都会说不」时，一个自然的忧虑是：<em>哪些</em>人？2001 年，<em class="term">实验哲学</em>的开山之作——Weinberg、Nichols 与 Stich——报告称盖梯尔直觉因文化而异，据说东亚参与者更愿意将「知识」的头衔授予那位幸运的认知者。若属实，这将是一枚重磅炸弹：哲学赖以运作的直觉咨询法，看起来竟是褊狭的。</p>
<p>这枚炸弹没能经受住复现检验。在<strong>「Gettier Across Cultures」</strong>（<em>Noûs</em>, 2017）中，Machery、Stich、Rose 及其同事以近乎逐字转录的案例测试了巴西、印度、日本与美国——却发现了<em>相反的</em>结果：在<strong>每一组</strong>人群中，人们都坚决拒绝将盖梯尔化的信念称为知识。另一项独立复现（Kim & Yuan）甚至以更大的东亚样本也未能复现最初的文化差异。当前最可信的解读是，可能存在一个<strong>普世的核心「民间认识论」</strong>，它本能地排斥基于运气的认知。更深层的教训，我们将在<strong>第 149 日</strong>以工业规模遇见：最耸动的发现，往往正是被审慎的复现悄然收回的那一个。</p>
</div>

<div class="claim">
<div class="ctop">
<span class="cnum">前沿 02</span>
<span class="chip ok" data-print="established"><i></i>规范性框架 · 已确立</span>
<span class="chip hint" data-print="contested"><i></i>「取代信念」 · 尚有争议</span>
</div>
<h3>以刻度盘而非开关来度量信念：贝叶斯认识论</h3>
<p>也许全有或全无的信念图景从一开始就是错的。<em class="term">贝叶斯认识论</em>主张，你真正的认识论状态是<em class="term">置信度</em>——从 0 到 1 的连续信心刻度。理性化随后只需要两条规则：你的置信度必须服从概率法则（<em>融贯性</em>），且你必须随着证据到来以<em>条件化</em>方式修正它们。</p>
<p>为何应当服从？<strong>荷兰赌定理</strong>（Ramsey, 1926; de Finetti, 1937）提供了一个惊人具体的答案：如果你的置信度违背概率法则，一位精明的博彩商便能提供一组你各自视为公平的赌约，但它们合在一起将<em>无论发生什么都保证你输钱</em>。不融贯的信心不仅是凌乱——它是可被利用的。下方的刻度盘让你亲身体会陷阱如何收紧。仍属<em>争议</em>的是，分级的置信度究竟是<em>取代</em>了日常的是/否信念，还是仅仅与之并置。（彩票悖论在此咬人：你有 99.9% 的把握自己的彩票会输——但你真的<em>相信</em>它会输吗？）我们将在<strong>第 4 日</strong>正式拾起这条线索。</p>
</div>
</section>

<!-- ===================== INTERACTIVE 3 ===================== -->
<div class="panel web-only">
<p class="ptitle">交互演示 · 感受陷阱</p>
<h4>置信度刻度盘与荷兰赌</h4>
<p class="pnote">设定你对下一张牌为<strong>红色</strong>（S）以及<strong>非红色</strong>（¬S）的置信度。两者之和应当恰好为 1。将它们推离一致，看着博彩商将你的不融贯转化为稳赚不赔的利润——以你的损失为代价。</p>

<div class="cred-controls">
<div class="slider-row">
<label>对 S 的置信度——「下一张牌是红色」 <span class="val" id="vS">0.50</span></label>
<input type="range" id="rS" min="0" max="100" value="50" aria-label="对 S 的置信度">
</div>
<div class="slider-row">
<label>对 ¬S 的置信度——「下一张牌不是红色」 <span class="val" id="vN">0.50</span></label>
<input type="range" id="rN" min="0" max="100" value="50" aria-label="对 ¬S 的置信度">
</div>

<div>
<div class="sumbar" id="sumbar" aria-hidden="true">
<div class="seg s" id="segS" style="width:50%"></div>
<div class="seg n" id="segN" style="width:50%"></div>
<div class="one-line"></div>
</div>
<div class="sum-readout"><span>0</span><span id="sumtxt">总和 = 1.00 ✓</span><span>2</span></div>
</div>

<div class="ledger coherent" id="ledger">
<p class="lh" id="ledgerH">融贯</p>
<p id="ledgerBody" style="margin:0;">你的置信度之和为 1。没有一套看起来公平的赌约能保证让你亏损。这是概率对一个理性心灵提出的最低要求。</p>
</div>
<button class="snap" id="snapBtn">↳ 将 ¬S 对齐至 1 − S（恢复融贯）</button>
</div>
</div>
<div class="format-alt epub-only print-only">
<p class="ptitle">参考表格</p>
<h4>置信度刻度盘与荷兰赌</h4>
<p>若你对<em>S</em>的置信度与对<em>非-S</em>的置信度之和为 1.00，则这对置信度是融贯的。若总和大于 1.00，你会为两场不可能同时获胜的赌约过度付费。若总和小于 1.00，博彩商可以反向购买赌约，依然保证获利。</p>
<table class="alt-table">
<thead><tr><th>对 S 的置信度</th><th>对 非-S 的置信度</th><th>总和</th><th>结果</th></tr></thead>
<tbody>
<tr><td>0.50</td><td>0.50</td><td class="num">1.00</td><td>融贯</td></tr>
<tr><td>0.70</td><td>0.60</td><td class="num">1.30</td><td>若你同时购买两场 1 美元赌约，必定损失 0.30</td></tr>
<tr><td>0.30</td><td>0.40</td><td class="num">0.70</td><td>若博彩商同时从你手中购入两场赌约，必定损失 0.30</td></tr>
</tbody>
</table>
</div>

<section class="frontier">
<div class="claim">
<div class="ctop">
<span class="cnum">前沿 03</span>
<span class="chip hint" data-print="promising"><i></i>预测编码 · 前景可期</span>
<span class="chip bad" data-print="contested"><i></i>宏大「自由能」理论 · 争议重重</span>
</div>
<h3>信念从何而来？作为预测机器的大脑</h3>
<p>哲学追问信念凭什么有正当理由；神经科学如今追问一团组织如何形成一个信念。一个快速成长的纲领回答：大脑并非被动吸纳世界的海绵——它是一台不知疲倦的<em class="term">预测机器</em>。依<em class="term">预测加工</em>观点（Andy Clark, <em>Behavioral and Brain Sciences</em>, 2013; Jakob Hohwy, 2013），大脑不断生成周遭环境的模型，预测它期望接收的感觉信号，并仅将<em>预测误差</em>——意外——向上传递。感知由此成为大脑持续运转的最佳猜测，被误差约束；用 Anil Seth 那令人难忘的话来说，一场「受控的幻觉」。信念更新开始看起来像是<strong>神经元中实现的贝叶斯推理</strong>——即所谓的「贝叶斯大脑」，将前沿 02 与生物硬件联结起来。</p>
<p>Karl Friston 以<em class="term">自由能原理</em>（<em>Nature Reviews Neuroscience</em>, 2010）将这一观念推向极致：生命系统之所以能持存，恰恰在于最小化一个量——「自由能」，也就是信息论意义上与<em>惊讶</em>相邻的量——它将感知、行动乃至生物自组织编织进同一框架。诚实的标签在此处至关重要。预测编码确实解释了真实的感知现象，是一个严肃而多产的研究纲领——<strong>前景可期</strong>。但<em>宏大的</em>自由能原理，作为统摄心灵与生命的单一法则，被广泛批评为过于笼统而难以<em>证伪</em>——更接近一个框架而非经检验的理论，因而<strong>争议重重</strong>。我们将在感知（<strong>第 119 日</strong>）与意识（<strong>第 123–126 日</strong>）中重返它——并且已然注意到，它的「自由能」与我们将在<strong>第 33 日和第 83–85 日</strong>遇见的热力学如何遥相呼应。<em>信息、能量、计算、涌现</em>——我们五条线索中的四条，被编织进神经元安静的运算之中。</p>
</div>
</section>

<section>
<p class="sec-eyebrow">悬而未决的问题</p>
<h2>真正尚未落定</h2>
<p>六十年过去，对「知识是什么？」的诚实回答里，仍有一长串没有定论的问题：</p>
<ul>
<li><strong>知识究竟可否被分析？</strong>还是威廉森说得对，它是基石——一个我们用之去解释其他事物、而非从中派生出来的原初概念？</li>
<li><strong>内在还是外在？</strong>正当理由是否要求你能经由反思触及的理由，抑或只需那些倾向于产出真理的认知机制？</li>
<li><strong>一种货币还是两种？</strong>理性信念在根本上是分级的（置信度）、全有或全无的，抑或二者以某种方式调和？</li>
<li><strong>是否真的存在一种普世的人类认识论</strong>——若有，是否是<em>演化</em>植入了那种「基于运气的认知不算数」的本能？（留待<strong>第 74 日</strong>的线索。）</li>
<li><strong>大脑<em>字面意义上</em>就是贝叶斯的吗</strong>，还是说「大脑在做推理」仅仅是一种从外部描述它的有用方式？</li>
<li><strong>而那个将萦绕人工智能部分的问题：</strong>当像起草这一页的系统输出一个为真且证据充分的断言时，它是否<em>知道</em>任何东西——抑或它是终极的盖梯尔案例，正确的原因与事实毫无关联？（<strong>第 138–145 日</strong>。）</li>
</ul>
</section>

<div class="recap">
<p class="h">◆ 一日三句话</p>
<dl>
<div><dt>核心洞见</dt><dd>两千三百年来，知识看上去就像有正当理由的真信念——直到盖梯尔用三页论文证明，你可以三者俱备却仍不算知道，因为你的理由与事实可能只是因运气相遇，而非真正相连。</dd></div>
<div><dt>最佳隐喻</dt><dd>那座一天只对两次的停钟——以及那位弓箭手，箭被吹离靶心，又被吹回正中：准确，却不<em>适切</em>。</dd></div>
<div><dt>悬置争议</dt><dd>修补方案是否为第四条件（以及是哪一个）；知识是否是不可分析的基石；「信念」是否应当让位于分级的贝叶斯置信度——而「大脑是一台预测机器」这一断言，正构成一条真正的科学前沿。</dd></div>
</dl>
<p class="threads"><b>今日线索 ›</b> 信息（置信度与贝叶斯大脑）· 能量（Friston 的自由能）· 计算（心灵作为推理引擎）——并轻触涌现与演化。</p>
</div>

<div class="tomorrow">
<p class="h">明日 <span class="arrow">→</span> 第 02 日</p>
<h3><a href="/zh/days/002-scientific-method-and-demarcation/">科学方法与划界问题</a></h3>
<p>今天我们追问，单个信念何时算得上知识。明天我们将问题放大至一整座机构：科学如何裁定哪些断言值得被认真纳入讨论？波普尔要求真正的理论必须<em>可证伪</em>，库恩的范式转移，拉卡托斯的研究纲领——以及现代复现危机，作为划界线在现实检验中的试炼。带上今日校准好的直觉；你会用得着。</p>
</div>

<hr class="div">

<section class="sources">
<p class="sec-eyebrow">来源</p>
<h2>来源与延伸阅读</h2>
<ol>
<li>Gettier, E. L. (1963). "Is Justified True Belief Knowledge?" <em>Analysis</em> 23(6): 121–123. <span class="meta">doi:10.1093/analys/23.6.121.</span> <a href="https://doi.org/10.1093/analys/23.6.121">doi.org/10.1093/analys/23.6.121</a></li>
<li>Ichikawa, J. J. &amp; Steup, M. "The Analysis of Knowledge." <em>Stanford Encyclopedia of Philosophy</em> (rev. 2018). <a href="https://plato.stanford.edu/entries/knowledge-analysis/">plato.stanford.edu/entries/knowledge-analysis</a> <span class="meta">—— JTB、盖梯尔案例、安全性/敏感性，以及知识优先转向。</span></li>
<li>"Gettier problem." <em>Wikipedia</em> (accessed 2026). <a href="https://en.wikipedia.org/wiki/Gettier_problem">en.wikipedia.org/wiki/Gettier_problem</a> <span class="meta">—— Russell（1948）、法称（约公元 770 年）与甘格沙（14 世纪）的先例。</span></li>
<li>Russell, B. (1948). <em>Human Knowledge: Its Scope and Limits.</em> London: Allen &amp; Unwin. <span class="meta">—— 停钟案例（第 ~170–171 页）。</span></li>
<li>Goldman, A. (1976). "Discrimination and Perceptual Knowledge." <em>Journal of Philosophy</em> 73(20): 771–791. <span class="meta">—— 假谷仓案例；可靠主义。</span></li>
<li>Nozick, R. (1981). <em>Philosophical Explanations.</em> Harvard University Press. <span class="meta">—— 真相追踪 / 敏感性。</span></li>
<li>Sosa, E. (1999). "How to Defeat Opposition to Moore." <em>Philosophical Perspectives</em> 13: 141–153. <span class="meta">—— 安全性条件。</span> 参见 Sosa (2007), <em>A Virtue Epistemology</em>（适切信念）。</li>
<li>Zagzebski, L. (1994). "The Inescapability of Gettier Problems." <em>The Philosophical Quarterly</em> 44(174): 65–73. <span class="meta">—— 击溃任何排除运气的修补方案的配方。</span></li>
<li>Williamson, T. (2000). <em>Knowledge and Its Limits.</em> Oxford University Press. <a href="https://en.wikipedia.org/wiki/Knowledge_and_Its_Limits">overview</a> <span class="meta">—— 知识优先认识论；知识作为最普遍的事实性心灵状态。</span></li>
<li>Weinberg, J. M., Nichols, S. &amp; Stich, S. (2001). "Normativity and Epistemic Intuitions." <em>Philosophical Topics</em> 29(1–2): 429–460. <span class="meta">—— 奠基性的跨文化实验哲学研究（后来受到争议）。</span></li>
<li>Machery, E., Stich, S., Rose, D., Chatterjee, A., Karasawa, K., Struchiner, N., Sirker, S., Usui, N. &amp; Hashimoto, T. (2017). "Gettier Across Cultures." <em>Noûs</em> 51(3): 645–664. <span class="meta">doi:10.1111/nous.12110.</span> <a href="https://doi.org/10.1111/nous.12110">doi.org/10.1111/nous.12110</a></li>
<li>Kim, M. &amp; Yuan, Y. (2015). "No cross-cultural differences in the Gettier car case intuition: A replication study of Weinberg et al. 2001." <em>Episteme</em>. <a href="https://philpapers.org/rec/KIMNCD">philpapers.org/rec/KIMNCD</a></li>
<li>Weisberg, J. "Bayesian Epistemology." <em>Stanford Encyclopedia of Philosophy.</em> <a href="https://plato.stanford.edu/entries/epistemology-bayesian/">plato.stanford.edu/entries/epistemology-bayesian</a> <span class="meta">—— 置信度、条件化，以及荷兰赌论证（Ramsey 1926; de Finetti 1937）。</span></li>
<li>Clark, A. (2013). "Whatever next? Predictive brains, situated agents, and the future of cognitive science." <em>Behavioral and Brain Sciences</em> 36(3): 181–204. 参见 Clark, <em>Surfing Uncertainty</em> (OUP, 2016)。</li>
<li>Friston, K. (2010). "The free-energy principle: a unified brain theory?" <em>Nature Reviews Neuroscience</em> 11(2): 127–138. <span class="meta">doi:10.1038/nrn2787.</span> <a href="https://doi.org/10.1038/nrn2787">doi.org/10.1038/nrn2787</a></li>
<li>Hohwy, J. (2013). <em>The Predictive Mind.</em> Oxford University Press.</li>
</ol>
</section>

<p class="endcap">第 01 日终 · <span class="gleam">还有 179 日等待深入</span></p>

</div>
