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
<p>盖梯尔并非首创。伯特兰·罗素在<em>《人类的知识：其范围与限度》</em>（1948）中就已提出停钟案例。再往前追溯，这个问题堪称古老：大约在<strong>公元&nbsp;770&nbsp;年</strong>，佛教逻辑学家<strong>法上</strong>（Dharmottara）描述了一位旅人，他看到山丘上仿佛有烟，推断有火，而且确实有火——只不过那「烟」其实是一群昆虫。同一种结构，早了十二个世纪。十四世纪的印度，<strong>甘格沙</strong>为处理此类案例建立了一整套因果知识理论。「盖梯尔问题」是哲学中<em>趋同发现</em>的绝佳实例——那种心灵会独立地一再绊倒的东西，而它本身就在暗示：那里有某种真实的东西。</p>
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
<span class="chip bad" data-print="已取代"><i></i>原初主张 · 已被取代</span>
<span class="chip ok" data-print="已确立"><i></i>复现研究 · 已确立</span>
</div>
<h3>「知识」直觉是普世的——抑或仅仅是西方的？</h3>
<p>当整个学科的运行逻辑是「若仔细追问，几乎所有人都会说不」时，一个自然的忧虑是：<em>哪些</em>人？2001 年，<em class="term">实验哲学</em>的开山之作——温伯格、尼科尔斯与斯蒂奇——报告称盖梯尔直觉因文化而异，据说东亚参与者更愿意将「知识」的头衔授予那位幸运的认知者。若属实，这将是一枚重磅炸弹：哲学赖以运作的直觉咨询法，看起来竟是褊狭的。</p>
<p>这枚炸弹没能经受住复现检验。在<strong>「Gettier Across Cultures」</strong>（<em>Noûs</em>, 2017）中，马谢里、斯蒂奇、罗斯及其同事以近乎逐字转录的案例测试了巴西、印度、日本与美国——却发现了<em>相反的</em>结果：在<strong>每一组</strong>人群中，人们都坚决拒绝将盖梯尔化的信念称为知识。另一项独立复现（金与袁）甚至以更大的东亚样本也未能复现最初的文化差异。当前最可信的解读是，可能存在一个<strong>普世的核心「民间认识论」</strong>，它本能地排斥基于运气的认知。更深层的教训，我们将在<strong>第 149 日</strong>以工业规模遇见：最耸动的发现，往往正是被审慎的复现悄然收回的那一个。</p>
</div>

<div class="claim">
<div class="ctop">
<span class="cnum">前沿 02</span>
<span class="chip ok" data-print="已确立"><i></i>规范性框架 · 已确立</span>
<span class="chip hint" data-print="有争议"><i></i>「取代信念」 · 尚有争议</span>
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
<span class="chip hint" data-print="前景可期"><i></i>预测编码 · 前景可期</span>
<span class="chip bad" data-print="有争议"><i></i>宏大「自由能」理论 · 争议重重</span>
</div>
<h3>信念从何而来？作为预测机器的大脑</h3>
<p>哲学追问信念凭什么有正当理由；神经科学如今追问一团组织如何形成一个信念。一个快速成长的纲领回答：大脑并非被动吸纳世界的海绵——它是一台不知疲倦的<em class="term">预测机器</em>。依<em class="term">预测加工</em>观点（安迪·克拉克，<em>Behavioral and Brain Sciences</em>, 2013；雅各布·霍维，2013），大脑不断生成周遭环境的模型，预测它期望接收的感觉信号，并仅将<em>预测误差</em>——意外——向上传递。感知由此成为大脑持续运转的最佳猜测，被误差约束；用阿尼尔·塞思那令人难忘的话来说，一场「受控的幻觉」。信念更新开始看起来像是<strong>神经元中实现的贝叶斯推理</strong>——即所谓的「贝叶斯大脑」，将前沿 02 与生物硬件联结起来。</p>
<p>卡尔·弗里斯顿以<em class="term">自由能原理</em>（<em>Nature Reviews Neuroscience</em>, 2010）将这一观念推向极致：生命系统之所以能持存，恰恰在于最小化一个量——「自由能」，也就是信息论意义上与<em>惊讶</em>相邻的量——它将感知、行动乃至生物自组织编织进同一框架。先把标签贴准，在此处至关重要。预测编码确实解释了真实的感知现象，是一个严肃而多产的研究纲领——<strong>前景可期</strong>。但<em>宏大的</em>自由能原理，作为统摄心灵与生命的单一法则，被广泛批评为过于笼统而难以<em>证伪</em>——更接近一个框架而非经检验的理论，因而<strong>争议重重</strong>。我们将在感知（<strong>第 119 日</strong>）与意识（<strong>第 123–126 日</strong>）中重返它——并且已然注意到，它的「自由能」与我们将在<strong>第 33 日和第 83–85 日</strong>遇见的热力学如何遥相呼应。<em>信息、能量、计算、涌现</em>——我们五条线索中的四条，被编织进神经元安静的运算之中。</p>
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


<!-- deep-dive:start -->
<details class="deep-dive" id="rest-of-the-map">
<summary>
<span class="ptitle">专题深入附录</span>
<span class="deep-dive-title">地图的其余部分</span>
<span class="deep-dive-sub">我们在正文里只停留于一个信念、一个临近正午的时刻。这片领域远比一座时钟广阔。</span>
</summary>
<div class="deep-dive-body">
<p class="lede"><span class="drop">正</span>文的任务很紧凑：取一个信念——<em>现在是 9:12</em>——然后追问它算不算知识。要做到这一点，它悄然倚靠在一摞从未检视的假设之上，并且径直走过整片学科疆域，连头也不点。认知是否要求<em>确定性</em>？那个宣称你<em>什么都不知道</em>的怀疑论者，真的能被回应吗？「知道」这个词从一句话到下一句，真的能保持不动吗？为什么知识比完成同样工作的真信念更<em>有价值</em>？还有那些与事实无关的认知呢——知道如何游泳、认识一张面孔、熟悉一座城市？本附录将走完那张地图的其余部分。这里不重复正文，而是沿着正文的边缘继续展开。</p>
<div class="continues">
<p class="label">↩ 紧接自</p>
<p><strong>第 1 日 — 什么是知识？</strong> 在那里，我们搭好了三条腿的凳子（有正当理由的真信念），看着盖梯尔用三页纸踹掉一条腿，游览了失败的「第四条件」补丁，绘制了阿格里帕三难困境，并在三处前沿停下：「知识」的跨文化直觉测试、贝叶斯置信度，以及预测性大脑。把那天的两幅图像揣进口袋——<em>停走的钟</em>（因运气而正确，而非关联）和那位<em>弓箭手</em>，他的箭被吹偏，又落回靶心（命中，但并非出于能力）。二者都将在下文以不同面目再度登场。</p>
</div>
<div class="roadmap">
<p class="h">◇ 我们跳过的七个房间</p>
<ol>
<li><b>盖梯尔之下的暗门</b>——支撑盖梯尔案例的两个隐含假设，以及那条将你抛入怀疑论的逃生舱口（确定性）。</li>
<li><b>门口的怀疑论者</b>——梦境、恶魔、缸中之脑，以及 2020 年代的模拟升级。</li>
<li><b>「知道」在滑动标尺上</b>——银行案例：相同的证据，不同的利害关系，相反的裁决。</li>
<li><b>我们真正追逐的运气</b>——反运气认识论，它终于解释了补丁战争<em>为何</em>发生。</li>
<li><b>为何认知胜过正确</b>——《美诺篇》里的那条路，与知识的价值。</li>
<li><b>我们忽略的认知类型</b>——技艺之知，以及亲知之知。</li>
<li><b>你所知的一切，几乎皆由他人告知</b>——证言、分歧，与认识论不正义。</li>
</ol>
</div>
<section>
<p class="sec-eyebrow"><span class="n">§1</span> 机关</p>
<h2>每个盖梯尔案例之下的两扇暗门</h2>
<p>在探索新房间之前，请先低头。盖梯尔那三页纸之所以有杀伤力，是因为地板内嵌了两扇暗门——两个如此自然的假设，正文从未在其上驻足。一旦命名它们，整幅地貌便会重组。</p>
<p><strong>暗门一：正当理由可能出错。</strong> 传统图景允许你基于正当理由相信某事，而结果却为<em>假</em>。史密斯有充分的理由相信「琼斯会得到这份工作」——老板这么说了——而它是假的。如果正当理由必须<em>保证</em>真理，那一步便不可能发生，案例甚至无法启动。<strong>暗门二：封闭性。</strong> 人们假定正当理由（以及知识）可以跨越<em class="term">蕴含</em>传递：如果你对相信某事拥有正当理由，那么你对其明显蕴含之物也拥有正当理由。史密斯从「琼斯会得到它（并且有十枚硬币）」推出较弱的「获胜者有十枚硬币」——一个有效的推论——并将他的正当理由一路携带。敲掉任何一块木板，盖梯尔案例都会烟消云散。</p>
<p>这给了我们一条诱人的出路。把暗门一猛地关上：坚持真正的知识需要<em class="term">不会出错的</em>正当理由——使错误在字面上不可能的理由。再也不会有盖梯尔案例。这是<em class="term">不可错论</em>的梦想，它非常古老。笛卡尔在 1641 年寻找一个连恶魔也无法伪造的单一信念，并找到了唯一一个即使在假设有一位全能欺骗者欺骗你关于其他一切的情况下仍能存活的信念：<em>我思，故我在</em>。你不可能被骗去错误地相信自己存在，因为欺骗需要一个你来承受欺骗。</p>
<p>麻烦在于恶魔出门时带走的东西。如果知识要求那种确定性，那么你就不知道你有双手，不知道太阳会升起，不知道桌对面的人是你的朋友而非仿生人——因为足够巧妙的欺骗可以伪造其中任何一项。选择确定性，代价就是<strong>怀疑论</strong>：门槛被设得如此之高，几乎无一能越过。彼得·昂格尔在 <em>Ignorance</em>（1975）中论证的正是这一点——严格使用的「知道」几乎不适用于任何事物，正如严格而言「平坦」不适用于任何真实表面。因此，不可错论并未消解问题；它只是用一个小谜题（某个奇怪的幸运信念）换来一个更大的谜题（你几乎一无所知）。这正是我们打开下一扇门的信号，那位怀疑论者已经在那里敲门了。</p>

<div class="aside">
<p class="h">盖梯尔的另一个案例，一口气说完</p>
<p>正文使用了硬币案例。盖梯尔的<em>第二个</em>案例更赤裸地展示了暗门二。史密斯凭借充分证据相信「琼斯拥有一辆 Ford」。由此他有效地推出「琼斯拥有一辆 Ford，<em>或者</em>布朗在巴塞罗那」——一个他有理由相信的析取命题，因为其中一个分支为真即可使整个命题为真。但琼斯终究没有 Ford……而布朗，纯属侥幸，<em>确实</em>在巴塞罗那。这个析取命题为真、有正当理由、被相信——且显然不是知识。封闭性携带了正当理由；运气提供了真理。结构相同，只是包装更复杂。</p>
</div>
</section>
<section>
<p class="sec-eyebrow"><span class="n">§2</span> 最大的遗漏</p>
<h2>门口的怀疑论者</h2>
<p>西方认识论有一位反复出现、拒绝离开的房客：那个宣称你对自己的心灵之外的世界<em>一无所知</em>的形象。正文把那扇门紧闭。打开它，因为每一种现代知识理论都部分地建立在应对门外所立之物的基础上。</p>
<p>怀疑论者的工具是思想实验，其残忍程度逐级攀升。首先是<strong>梦</strong>：此刻，你怎么知道你没有在睡觉？梦境从内部感觉完全真实；你以前就被骗过。（道家庄子，约公元前 300 年，梦见自己化为蝴蝶，醒来时不确定自己是一个梦见了蝴蝶的人，还是一只此刻正在梦见人的蝴蝶——佛教论师法上在正文中重新揭开的正是同一道伤口，再次证明心灵独立地一再绊倒于此。）笛卡尔把设想推进到一位一心要在一切事上欺骗你的<strong>邪恶恶魔</strong>。二十世纪换成了新的想象装置：你可能是一只<em class="term">缸中之脑</em>，神经连接到一台计算机，它向你输送的正是你此刻正在拥有的体验（希拉里·普特南，<em>Reason, Truth and History</em>, 1981）。你无法从内部分辨。难题正在于此。</p>
<p>展开来说，怀疑论者的论证干净利落得残酷——而且它运转的正是来自 §1 的封闭性原则：</p>
<blockquote>(1) 你并不<em>知道</em>自己不是一只被输送手部体验的、没有手的缸中之脑。<br>(2) 如果你知道你有双手，那么（既然有双手蕴含不是无手的缸中之脑）你也就知道自己不是那样的缸中之脑。<br>(3) 所以你不知道你有双手。</blockquote>
<p>每一行看起来都合理；合在一起，它们似乎证明你对外部世界一无所知。下面的交互面板让你尝试每一种出路——并发现每一条「出路」都是一个有名字的哲学立场，只是各有代价。</p>
</section>
<div class="panel web-only cm-machine">
<p class="ptitle">交互 · 选择你的出路</p>
<h4>怀疑论者的三段论——四扇出口之门</h4>
<p class="pnote">下面的论证是有效的：如果你接受所有三行，你就是怀疑论者。因此你必须拒绝某一点。每一次拒绝都是真实的招式，有真实的捍卫者——以及真实的代价。选择其一，看看你与谁为伍。</p>

<div class="cm-arg" id="appendix-d001-cmArg">
<div class="cm-line cm-p1" id="appendix-d001-cmP1"><span class="pn">P1</span><span class="pt">你并不<strong>知道</strong>自己不是一只无手的缸中之脑（一个无法分辨的伪造）。</span></div>
<div class="cm-line cm-p2" id="appendix-d001-cmP2"><span class="pn">P2</span><span class="pt"><strong>封闭性：</strong>如果你知道你有双手，你就知道自己不是那样的缸中之脑。</span></div>
<div class="cm-line concl cm-c" id="appendix-d001-cmC"><span class="pn">∴</span><span class="pt">所以你<strong>不知道</strong>自己有双手。</span></div>
</div>

<div class="cm-exits">
<p class="h">你拒绝哪一行？</p>
<div class="cm-btns">
<button class="cm-btn" data-exit="skeptic">接受全部三点</button>
<button class="cm-btn" data-exit="moore">拒绝 P1</button>
<button class="cm-btn" data-exit="dretske">拒绝 P2（否定封闭性）</button>
<button class="cm-btn" data-exit="context">重新定义「知道」</button>
</div>
</div>

<div class="cm-out cm-outlet" id="appendix-d001-cmOut">
<span class="who">选择一扇门……</span>
      每个选项都会使你所拒绝的那行变暗，并告诉你落到了何处。
</div>
</div>
<div class="format-alt epub-only print-only">
<p class="ptitle">印刷版</p>
<h4>怀疑论者的三段论：四种出路</h4>
<table class="alt-table">
<thead><tr><th>招式</th><th>拒绝的行</th><th>代表性观点</th><th>代价</th></tr></thead>
<tbody>
<tr><td>接受全部三点</td><td>无</td><td>怀疑论</td><td>你不知道你有双手，对外部世界也所知甚少。</td></tr>
<tr><td>拒绝 P1</td><td>你不知道自己不是缸中之脑</td><td>摩尔的常识回应</td><td>可能感觉像是在坚持而非解释。</td></tr>
<tr><td>拒绝 P2</td><td>封闭性</td><td>德雷茨克 / 诺齐克的相关替代项理论</td><td>封闭性在直觉上根深蒂固，在其他地方也很有用。</td></tr>
<tr><td>改变标准</td><td>「知道」的固定含义</td><td>语境主义</td><td>怀疑论者在研讨室里获胜；普通说话者在日常生活中获胜。</td></tr>
</tbody>
</table>
</div>
<section>
<p>这些回应需要完整命名。<strong>G. E. 摩尔</strong>（1939）只是将论证反向运行：<em>我更确信这里有一只手</em>（举起它）<em>胜过怀疑论者提供的任何精巧前提</em>——因此，如果那些前提蕴含我不知道这一点，问题就在前提。大胆，却很难反驳。<strong>弗雷德·德雷茨克</strong>（1970）与<strong>罗伯特·诺齐克</strong>（1981）采取了更精细的路线：<em>否定封闭性。</em> 在德雷茨克的<em class="term">相关替代项</em>观点看来，要知道某事，你只需排除你犯错方式中<em>相关的</em>那些，而非每一种怪异的可能。在动物园里，你知道那动物是斑马——你已经排除了「它是马」、「它是山羊」——尽管你尚未排除「它是一头被巧妙漆成斑马样子的骡子」，因为在这一语境中，那不是实际需要认真对待的可能。知识不会自动沿每一个蕴含传递。代价不小：封闭性是直觉性的，放弃它会牵动其他地方。<strong>语境主义</strong>（我们下一节）提供了折中方案：也许怀疑论者和摩尔<em>都</em>是对的，因为「知道」在怀疑论者的研讨室里意味着比普通生活中更严格的东西。</p>

<h3>2020 年代的升级：我们是否身处模拟之中？</h3>
<p>缸中之脑在当代换了一种形式。<strong>尼克·博斯特罗姆</strong>的<strong>模拟论证</strong>（<em>Philosophical Quarterly</em>, 2003）提出了一个审慎的概率性论证：以下三件事至少有一件为真——文明几乎从未达到运行祖先模拟的技术；或者它们达到了但选择不运行；或者<em>我们几乎肯定生活在其中一个之中</em>。<strong>大卫·查默斯</strong>在 <strong>Reality+</strong>（2022）中迈出了下一步，接受了大多数人不愿接受的结论：他论证我们<em>无法知道</em>自己没有被模拟，并应当赋予这一可能性真实的概率——但这<strong>并非一场灾难</strong>，因为<em>「虚拟现实是真正的现实。」</em> 在他所谓的<em class="term">模拟实在论</em>看来，一棵模拟的树是一个真正的数字对象，而非幻觉；如果你一直生活在一个完美的模拟中，你的信念「那是一棵树」是<em>真的</em>，只不过是以硅的形式实现。怀疑论者假定虚假的世界意味着虚假的信念；查默斯否认这种联系。</p>
<p>在继续之前，先把两个标签贴准。模拟<em>假说</em>——即我们事实上被模拟了——就其现状而言，是<strong>不可检验的形而上学，而非科学</strong>：不存在公认的观察能够证实或反驳它，这使它落在了我们明日将画出的分界线的错误一侧。<span class="chip bad" data-print="不可证伪"><i></i>模拟假说 · 不可证伪</span> 尽管如此，其<em>哲学</em>回报是真实的：它锐化了我们甚至以「真实」和「知道」意指什么。还有一个著名回应把论证往相反方向推进。普特南论证「我是一只缸中之脑」是<strong>自我驳斥的</strong>：你的词语之所以有意义，仅在于你的因果历史，因此一个终身缸中之脑的词语「缸」不可能指涉真正的缸（它从未与真正的缸发生过因果联系）——这意味着，如果你<em>是</em>一只缸中之脑，你的句子「我是一只缸中之脑」将得出<em>假</em>的结论。这是否成立仍在争论中，而这正是为什么这条线索径直撞向 AI 板块：当一个仅接受文本训练的系统输出「巴黎在法国」时，它<em>知道</em>这一点吗——还是说它是所有缸中之脑中最纯粹的一个，其词语从未触碰过世界？将这个问题留到<strong>第 138–145 日</strong>。</p>
</section>
<section>
<p class="sec-eyebrow"><span class="n">§3</span> 移动的目标</p>
<h2>「知道」在滑动标尺上</h2>
<p>这里有一种正文从未考虑过的可能性：或许六十年追寻「知道」的完美定义的失败，是因为这个词从未指向一个固定标准。来看<strong>基思·德罗斯</strong>（<em>Philosophy and Phenomenological Research</em>, 1992）提出的一对案例，它们催生了上千篇论文——<strong>银行案例</strong>。</p>
<p>那是周五。你开车经过银行，看到周六排起长队，决定明天再来。你的配偶问它周六是否开门。<em>低利害</em>版本：没什么大不了的；你说：「是的，我知道它周六开门——我两个周六前还来过的。」那听起来是真的。你知道。<em>高利害</em>版本：有一张支票<em>必须</em>在周一前存入，否则你的抵押贷款会跳票、你会失去房子，而你的配偶合理地指出，银行确实会改变营业时间。现在，完全相同的句子——「我知道它周六开门」——在你口中凝结了。「嗯……我最好还是进去确认一下。」同一个人，同样的记忆，同样的证据，同一天。只有利害关系（以及是否有人提出了出错的可能性）改变了。然而知识似乎来了又去。下面的拨盘让你在两者之间滑动，并观察它为什么会改变。</p>
</section>
<div class="panel web-only stakes-dial">
<p class="ptitle">交互 · 相同证据，变化裁决</p>
<h4>银行案例——利害关系拨盘</h4>
<p class="pnote">你的证据是固定的：<em>「我两个周六前在这家银行，而且它在营业。」</em> 世界或你的视力没有任何变化。滑动利害关系；可选地让你的配偶提出出错的可能性。观察「我知道」如何变成「我最好确认一下」——并阅读三个对立阵营如何解释这完全相同的转变。</p>

<div class="sd-case stakes-case" id="appendix-d001-sdCase">…</div>

<div class="slider-row">
<label>正确与否牵涉多大利害 <span class="val stakes-value" id="appendix-d001-sdVal">低</span></label>
<input type="range" id="appendix-d001-rStakes" min="0" max="100" value="15" aria-label="利害关系" class="stakes-range">
</div>

<button class="errtoggle stakes-error" id="appendix-d001-sdErr" role="switch" aria-checked="false">
<span class="knob"></span>
<span class="lab">配偶提出出错的可能性 <span>「……但银行<em>确实</em>有时会改变营业时间。」</span></span>
</button>

<div class="sd-verdict">
<div class="vstate know stakes-state" id="appendix-d001-sdState">—</div>
<div class="sd-readings">
<div class="r"><b>语境主义</b><span id="appendix-d001-sdCtx" class="stakes-contextualism"></span></div>
<div class="r"><b>实践侵入</b><span id="appendix-d001-sdEnc" class="stakes-encroachment"></span></div>
<div class="r"><b>不变主义</b><span id="appendix-d001-sdInv" class="stakes-invariantism"></span></div>
</div>
</div>
</div>
<div class="format-alt epub-only print-only">
<p class="ptitle">印刷版</p>
<h4>银行案例：利害关系表</h4>
<table class="alt-table">
<thead><tr><th>案例</th><th>证据</th><th>利害关系</th><th>自然裁决</th><th>测试什么</th></tr></thead>
<tbody>
<tr><td>低利害</td><td>你两个周六前去过那里。</td><td>一件小事。</td><td>「我知道它在营业。」</td><td>普通标准容易达到。</td></tr>
<tr><td>高利害</td><td>同样的记忆。</td><td>抵押贷款截止日期。</td><td>「我最好确认一下。」</td><td>实际利害是否影响知识。</td></tr>
<tr><td>提出出错可能</td><td>同样的记忆加上一个活跃的怀疑。</td><td>任何严重后果。</td><td>知识声称被削弱。</td><td>语境改变的是词语还是认知者的状态。</td></tr>
</tbody>
</table>
</div>
<section>
<p>三个阵营，对同一数据的三种诊断。<strong>语境主义</strong>（德罗斯；大卫·刘易斯，"Elusive Knowledge," 1996；斯图尔特·科恩，1988）将转变定位在<em>词语</em>上：「知道」就像「高」或「这里」一样——对语境敏感。提高利害关系或提及错误，会提升一个信念必须达到的标准，才能使「S 知道」这句话为真。两种话语在各自的交谈中都是正确的。怀疑论者在研讨室里甚至也是对的——他只是把标准抬到了天际。<strong>实践侵入</strong>（杰森·斯坦利，<em>Knowledge and Practical Interests</em>, 2005；范特尔与麦格拉思；约翰·霍桑，<em>Knowledge and Lotteries</em>, 2004）将转变定位在<em>认知者</em>身上：<em>你</em>知道什么真正取决于<em>对你</em>而言实际有什么风险，因为知识应当是你能够据以行动的东西。高利害确实可以剥夺你在事情无关紧要时本可拥有的知识——一个令人吃惊的观点，因为它让实践压力「侵入」一个据称纯粹事实性的状态。<strong>不变主义</strong>（传统的坚守者）死守阵地：「知道」意指一个固定的东西，标准不会移动，你的两个裁决之一根本就是错的——你要么一直知道，要么从未知道，而利害关系只是改变了你<em>愿意</em>这样<em>说</em>的程度。<span class="chip ok" data-print="已共识"><i></i>裁决发生转变 · 已达成共识</span> <span class="chip bad" data-print="未解决"><i></i>为何转变 · 未解决</span> 数据是坚实的；其解释却是该领域最活跃的争论焦点之一。</p>
</section>
<section>
<p class="sec-eyebrow"><span class="n">§4</span> 补丁背后的模式</p>
<h2>我们真正追逐的运气</h2>
<p>回到正文中的补丁战争——无假前提、敏感性、安全性、德性。它们看起来像是一袋精巧的修补，每一种都遇到了更棘手的反例。退后一步，它们便骤然清晰：每一个都在追逐<em>同一个幽灵</em>。<strong>邓肯·普里查德</strong>在 <em>Epistemic Luck</em>（Oxford, 2005）中给了它一个精确的名字。知识的敌人是他所称的<em class="term">真理运气</em>（veritic luck）的特定物种：你的信念在实际世界中为真，但在<em>事物本可能走上的几乎所有邻近道路</em>中，你会相信同样的事，却是错的。真理与你的相信它只是偶然地同步。</p>
<p>这是「安全性」观念的深层内容，值得单独说明。将实际世界想象为一个点，被邻近的可能世界环绕——事物本可能如何的小小现实变体。当一种信念在整个邻近区域保持为真时，它是<em class="term">安全的</em>（知识级别），而当轻轻一推就将它翻转为假时，它是<em>不安全的</em>（单纯幸运）。切换下面的三种情境，观察邻近区域如何亮起。</p>
</section>
<div class="panel web-only modal-rings">
<p class="ptitle">图表 · 一个信念的邻近区域</p>
<h4>安全与幸运——模态 X 光</h4>
<p class="pnote">中心点 = 实际世界，你的信念在此为真。环 = 邻近的可能世界，现实的侥幸脱险。<span style="color:var(--ok)">绿色</span> = 你在那里仍然正确；<span style="color:var(--contested)">红色</span> = 你会相信它，却是错的。知识需要一个绿色的邻近区域。</p>
<div class="mr-wrap">
<div class="mr-btns">
<button class="mr-btn" data-scn="know" aria-pressed="true">正常运行的钟（知识）</button>
<button class="mr-btn" data-scn="gettier">停走的钟（盖梯尔）</button>
<button class="mr-btn" data-scn="barn">假谷仓之国</button>
</div>
<svg id="appendix-d001-mrSvg" viewBox="0 0 360 300" role="img" aria-label="一个中心世界被邻近的可能世界环绕，按信念是否保持为真着色。">
<circle cx="180" cy="150" r="118" fill="none" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 5"></circle>
<text x="180" y="22" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" fill="var(--ink-faint)">邻近可能世界</text>
<g id="appendix-d001-mrSat" class="modal-satellites"></g>
<circle id="appendix-d001-mrCore" cx="180" cy="150" r="24" fill="color-mix(in srgb,var(--ok) 22%,transparent)" stroke="var(--ok)" stroke-width="2.5" class="modal-core"></circle>
<text x="180" y="147" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="var(--ink)">实际</text>
<text x="180" y="159" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="var(--ink)">真</text>
</svg>
<div class="mr-verdict safe modal-verdict" id="appendix-d001-mrVerdict">— 安全 —</div>
<p class="mr-expl modal-explainer" id="appendix-d001-mrExpl"></p>
</div>
</div>
<div class="format-alt epub-only print-only">
<p class="ptitle">印刷版</p>
<h4>安全与幸运：邻近世界案例</h4>
<table class="alt-table">
<thead><tr><th>情境</th><th>实际世界</th><th>邻近世界</th><th>裁决</th></tr></thead>
<tbody>
<tr><td>正常运行的钟</td><td>你的信念为真。</td><td>微小变化仍然让你正确。</td><td>安全：知识级别。</td></tr>
<tr><td>停走的钟</td><td>你的信念在 9:12 为真。</td><td>早一分钟或晚一分钟，同样的信念为假。</td><td>不安全：真理运气。</td></tr>
<tr><td>假谷仓之国</td><td>你看见了唯一一座真谷仓。</td><td>大多数邻近的一瞥都会落在假谷仓外观上。</td><td>不安全：环境运气。</td></tr>
</tbody>
</table>
</div>
<section>
<p>这幅图能把前面的混乱重新组织起来。停走的钟<em>彻底</em>失败——左右一分钟你就错了，因此邻近区域是一片红色的海洋。假谷仓之国则更微妙：你看着的谷仓确实在那里（核心是绿色的），但你被假谷仓外观包围，因此往任何方向瞥上一百米都会骗到你——红色邻近区域，没有知识，即便拥有有正当理由的真信念且无假前提。那些补丁之所以不断失效，是因为每一个都试图用略有不同的尺度去捕捉「绿色邻近区域」，而运气不断找到缝隙。</p>
<p>既然我们有了框架，再来看正文未提及的另外两个补丁。<strong>可废止性理论</strong>（莱勒与帕克森，1969）说知识是<em>未被击败的</em>有正当理由的真信念：外部必须不存在某种真的事实，一旦你得知它，就会消解你的正当理由。它优雅地处理了许多案例——直到「误导性击败者」的转折，那里存在一个真却误导的事实，它<em>不应该</em>剥夺你的知识，却在技术上做到了，迫使人们做出越来越精细的区分。再往前追溯，<strong>因果理论</strong>（戈德曼，1967，在他转向可靠主义之前）要求事实<em>引起</em>你的信念——没有因果链，就没有知识。对知觉而言很美；对数学却是致命的，因为数字 7 和毕达哥拉斯定理不会引起任何东西（保罗·贝纳塞拉夫在 1973 年正是提出了这个「通道问题」）。你无法与抽象对象握手。</p>
<p>还有一个正文只轻轻带过、却足以撬开可靠主义的难题：<strong>一般性问题</strong>（科尼与费尔德曼，1998）。可靠主义说，一种信念如果由<em>可靠的过程</em>产生，它就是有正当理由的——但究竟是<em>哪一个</em>过程？你的「现在是 9:12」的信念是由「读钟」产生的，也是由「读<em>那座</em>钟」产生的，还是由「在昏暗光线下使用视力」产生的，以及由「在周二依赖仪器」产生的——每一个都同样真实，每一个都有不同的可靠性分数。选择类型，你就选择了裁决。以原则性的方式确定「正确」的粒度，已被证明是顽固地困难。</p>
<p>普里查德落脚于何处？在<em class="term">反运气德性认识论</em>：知识需要两项条件缺一不可，因为它们针对的是不同失败方式。你需要<strong>安全性</strong>（绿色的邻近区域——没有真理运气）<em>并且</em>你需要<strong>适切性</strong>（信念之所以为真，是<em>通过你自己的能力</em>——正文中那位弓箭手的技艺）。单独任何一个都不够：停走的钟缺乏安全性；假谷仓之国则显示，一个人即使在局部使用了真实能力，也可能被环境运气击败。它并非一个整洁的三字公式——而到如今，这或许就是教训。知识也许<em>正是</em>这样一种东西：需要两重保障，一个关于你，一个关于你的世界。</p>
</section>
<section>
<p class="sec-eyebrow"><span class="n">§5</span> 问题之下的问题</p>
<h2>为什么知道比仅仅正确更有价值？</h2>
<p>从「什么是知识？」退一步，来到柏拉图最先提出、却无人完整回答的问题：<em>我们为何在意？</em> 如果一个真信念足以完成任务，知识的额外机制又为你买到了什么？柏拉图在<em>《美诺篇》</em>（<em>Meno</em>，约公元前 380 年）中将其表述为一个旅人的问题。假设你想步行前往拉里萨（Larissa）城。一个<em>知道</em>路的人会把你带到那里。但一个仅仅对路拥有<em>真信念</em>的人也会——他从未去过，只是碰巧正确。就抵达目的地而言，二者价值完全相同。那么为什么整个传统都将知识置于真信念之上？这就是<em class="term">价值问题</em>，它是一个承重性的问题：一种知识理论如果不能说明知识为何<em>更好</em>，可以说就错失了这一概念的要义。</p>

<figure style="margin:1.8rem auto;max-width:30rem;">
<svg viewBox="0 0 440 170" role="img" aria-label="两条从你通往拉里萨的路：仅仅真信念与知识，二者皆抵达。">
<text x="40" y="88" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" fill="var(--ink)">你</text>
<circle cx="40" cy="95" r="6" fill="var(--ink)"></circle>
<text x="400" y="88" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" fill="var(--brass)">拉里萨</text>
<circle cx="400" cy="95" r="6" fill="var(--brass)"></circle>
<path d="M48,92 C150,40 300,40 392,90" fill="none" stroke="var(--hint)" stroke-width="2" stroke-dasharray="2 5"></path>
<path d="M48,98 C150,150 300,150 392,100" fill="none" stroke="var(--accent)" stroke-width="2.5"></path>
<text x="220" y="38" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" fill="var(--hint)">仅仅真信念 — 抵达</text>
<text x="220" y="165" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" fill="var(--accent)">知识 — 亦抵达</text>
</svg>
<p class="figcap">如果两条路都通向拉里萨，第二条价值何在？</p>
</figure>

<p>价值问题也精准地刺向一种理论。它被称为<em class="term">淹没问题</em>（琳达·扎格泽布斯基，2003）。可靠主义说，知识是来自可靠过程的真信念。但追问<em>可靠性在价值上增添了什么</em>。可靠性之所以好，仅在于它倾向于产生真理。因此一旦你<em>已经拥有</em>了真理，这个特定的真理还来自一个可靠的来源，这又增添了什么？扎格泽布斯基的家常类比是：一杯好咖啡并不会因为它出自一台可靠的咖啡机就更好喝——一台不可靠的机器也可能碰巧产出一杯完全相同的咖啡。使之为好的特征（美味 / 真理）已然在场；来源的可靠性被<em>淹没</em>了，没有增添任何东西。如果这是对的，可靠主义就无法解释为什么知识胜过幸运的真信念——而这正是一种知识理论最需要说明的东西。</p>
<p>这正是<strong>德性认识论</strong>证明其价值的所在，也是那位弓箭手最终兑现的地方。它的回答是：知识之有价值，并非因为它是真信念再多一层包装；它之有价值，在于它是一种<em class="term">成就</em>——一种<em>属于你</em>的成功，一种<em>通过你自己的能力</em>而实现的成功。成就带有一种幸运的成功永远不具备的价值，就像你真正瞄准射中的靶心，总比被一阵幸运的风吹进去的箭更有价值，即便二者落在同一点上。通过你自己的认知技艺达到的真信念是一种<em>认知成就</em>；幸运的真信念则不是。那额外的价值不在结果中，而在<em>抵达的过程</em>中。那条你能<em>再次</em>找到的通往拉里萨的路，比你误打误撞撞上的那条更有价值，即便某一天两者都抵达终点。</p>
</section>
<section>
<p class="sec-eyebrow"><span class="n">§6</span> 其他的知</p>
<h2>我们忽略的认知类型</h2>
<p>迄今为止的一切——整节正文——都是关于<em class="term">命题之知</em>，也就是「知道某事为真」：知道<em>那是</em> 9:12，<em>那是</em>琼斯得到了工作。但看看日常语言中「知道」有多少完全不是这回事。你知道<em>如何</em>骑自行车。你认识你母亲的脸。你知道里斯本。这些都不是事实的堆积，而哲学家们已为它们之间的关系争论了一个世纪。</p>

<figure style="margin:1.8rem auto;">
<svg viewBox="0 0 600 230" role="img" aria-label="一棵将知识分为命题之知、技艺之知与亲知之知的树。">
<rect x="235" y="14" width="130" height="44" rx="9" fill="var(--paper)" stroke="var(--accent)" stroke-width="2"></rect>
<text x="300" y="34" text-anchor="middle" font-family="Fraunces,serif" font-size="14" fill="var(--ink)">知道</text>
<text x="300" y="50" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="var(--ink-faint)">这一个词</text>
<line x1="300" y1="58" x2="100" y2="96" stroke="var(--line-strong)" stroke-width="1.5"></line>
<line x1="300" y1="58" x2="300" y2="96" stroke="var(--line-strong)" stroke-width="1.5"></line>
<line x1="300" y1="58" x2="500" y2="96" stroke="var(--line-strong)" stroke-width="1.5"></line>
<rect x="30" y="98" width="140" height="50" rx="9" fill="color-mix(in srgb,var(--accent) 10%,transparent)" stroke="var(--line-strong)" stroke-width="1.4"></rect>
<text x="100" y="118" text-anchor="middle" font-family="Fraunces,serif" font-size="13" fill="var(--ink)">命题之知</text>
<text x="100" y="135" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="var(--ink-faint)">命题的</text>
<rect x="230" y="98" width="140" height="50" rx="9" fill="color-mix(in srgb,var(--accent) 10%,transparent)" stroke="var(--line-strong)" stroke-width="1.4"></rect>
<text x="300" y="118" text-anchor="middle" font-family="Fraunces,serif" font-size="13" fill="var(--ink)">技艺之知</text>
<text x="300" y="135" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="var(--ink-faint)">程序 / 技艺</text>
<rect x="430" y="98" width="140" height="50" rx="9" fill="color-mix(in srgb,var(--accent) 10%,transparent)" stroke="var(--line-strong)" stroke-width="1.4"></rect>
<text x="500" y="115" text-anchor="middle" font-family="Fraunces,serif" font-size="13" fill="var(--ink)">亲知之知</text>
<text x="500" y="132" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="var(--ink-faint)">亲知</text>
<text x="100" y="178" text-anchor="middle" font-family="Newsreader,serif" font-style="italic" font-size="11.5" fill="var(--ink-soft)">「……银行在营业」</text>
<text x="300" y="178" text-anchor="middle" font-family="Newsreader,serif" font-style="italic" font-size="11.5" fill="var(--ink-soft)">「……如何骑自行车」</text>
<text x="500" y="178" text-anchor="middle" font-family="Newsreader,serif" font-style="italic" font-size="11.5" fill="var(--ink-soft)">「……那张脸 / 这座城市」</text>
<text x="300" y="212" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="var(--brass)">争论焦点：中间的箱子是否其实只是左边的箱子？</text>
</svg>
<p class="figcap">一个英语动词，至少三种不同的与世界的关系。</p>
</figure>

<p><strong>技艺之知。</strong> <strong>吉尔伯特·赖尔</strong>在 <em>The Concept of Mind</em>（1949）中坚持认为，知道如何做某事并不是知道一组事实。一位杰出的自行车手可能无法陈述任何一条平衡法则；一个熟记了关于自行车的一切事实的人可能在第一次尝试时就摔倒。问题还不止于此：赖尔论证说，将技艺还原为事实会触发无限倒退：如果每一个熟练的行动都要求首先<em>知道描述该规则的命题</em>，那么你就需要<em>应用</em>那条规则的技艺，而那又需要另一条规则，永无止境。因此技艺必须是其自身类型的知。转折在于：<strong>杰森·斯坦利</strong>与<strong>蒂莫西·威廉森</strong>在 <strong>"Knowing How"</strong>（2001）中回击，提出<em class="term">理智主义</em>——主张技艺之知终究只是命题之知的一种（知道某种骑车方式，并知道<em>它</em>是一种骑车方式），只是披着不同的语法形式。技艺是否可还原为命题，确实尚未有定论。<span class="chip bad" data-print="有争议"><i></i>技艺之知可还原吗？· 有争议</span></p>
<p><strong>亲知之知。</strong> <strong>伯特兰·罗素</strong>（1911）又划出一道界线：在<em>亲知</em>之知——你对所见的一抹红色、所感的一种疼痛、所注视的一张面孔的直接把握——与<em>描述</em>之知之间，即你所知的关于你从未直接遭遇过的事实的<em>关于</em>之物（「第一个站在月球上的人」，你只知道他是满足该描述的那个人）。你可以对俾斯麦知道<em>关于</em>他的大量事实，却从未<em>认识</em>他；你知道红色，其方式是世界上最伟大的盲人物理学家所不知道的，尽管他知道关于波长的每一个事实。那道缝隙——关于体验的事实与体验本身之间的缝隙——是整门课程中最难问题的一颗安静的种子，那颗种子在<strong>第 123 日</strong>等待：看见红色的体验究竟是什么样。</p>
</section>
<section>
<p class="sec-eyebrow"><span class="n">§7</span> 社会转向</p>
<h2>你所知的一切，几乎皆由他人告知</h2>
<p>正文与大多数传统认识论一样，想象了一颗孤独的心灵面对世界——一个人，一座钟。但盘点一下你实际所知的东西：地球约有 45 亿年历史。南极洲存在。你自己的出生日期。水的沸点。你基本上从未第一手验证过其中任何一项；你是被<em>告知</em>的，由老师、书本、父母、仪器、陌生人。<em class="term">证言</em>是任何人知识的压倒性主体——而数个世纪以来，认识论却将其当作事后之想。</p>
<p>核心问题在于，信任证言是你必须先行<em>取得</em>资格，还是你默认就<em>有权</em>享有的东西。<strong>大卫·休谟</strong>（1748）采取了苛刻的路线：证言只与你自己的归纳可靠性记录一样好，即证言何时被证明为可靠——它<em>还原</em>为你个人收集的证据。<strong>托马斯·里德</strong>（1764）觉得这很荒谬：没有一个孩子能在信任任何人之前自行建立起一份可靠性记录，而事实上，我们天生就带有一条「轻信原则」，一种默认的倾向去相信我们被告知的东西，正如我们天生就信任我们的感官一样。在里德的<em>反还原主义</em>观点看来，证言是一种<em>基本的</em>知识来源，而非派生的——而且它必须是，否则知识就无法在社会性动物中起步。现代领域大多同意某种默认信任是不可避免的；争论在于多少，以及它在何时被击败。</p>
<p>从这个房间分出的两个更新的房间，在 2026 年都极为重要。第一个是<strong>分歧</strong>。当你视某人为<em>认识论上的同侪</em>——和你一样聪明、一样知情、一样谨慎——看着同样的证据却得出相反的结论时，你该怎么做？<em class="term">调和主义</em>或「同等权重」观点（亚当·埃尔加，<em>Noûs</em>, 2007；大卫·克里斯滕森，2007）主张你应当实质性地向他们移动：固守原地意味着在没有独立理由的情况下声称<em>你</em>才是正确的，而对方才错了。<em>坚定</em>观点回答说，有时你可以理性地守住阵地，因为你自己的推理也是证据。这听起来很抽象，直到你注意到：这其实就是回声室、专家共识，以及信息源彼此冲突时我们该如何判断的认识论。<span class="chip bad" data-print="争论中"><i></i>同等权重观点 · 正在进行的争论</span></p>
<p>第二个则更尖锐：<strong>认识论不正义</strong>，由<strong>米兰达·弗里克</strong>命名（<em>Epistemic Injustice: Power and the Ethics of Knowing</em>, 2007）。因为如此多的认知运行在证言之上，<em>谁被相信</em>便成为一个伦理问题，而不仅仅是认识论问题。弗里克区分了两种不公。<em class="term">证言不正义</em>：一个说话者的话语被给予低于其应得的信任，因为对其身份的偏见——病人的疼痛被漠视，证人因其口音或性别而不被相信。<em class="term">诠释不正义</em>：更微妙也更深层——一个人甚至无法为自己的经验赋予意义，包括自己也包括他人，因为周围文化尚未发展出相应的<em>概念</em>（她的例子：我们现在称之为性骚扰的经验，由那些没有词语来命名它的人所承受，因此无法说出这种伤害是什么）。结果证明，知识是有政治性的：理解的工具分配不均，而这种不均本身可以是一种不正义。</p>

<div class="aside">
<p class="h">功能优先的逃生舱口</p>
<p>有一种激进的方式可以终结这整段 180 页的定义追寻，它将社会转向的线索重新穿回起点。<strong>爱德华·克雷格</strong>在 <em>Knowledge and the State of Nature</em>（1990）中提出：停止追问<em>「知识是什么？」</em>，转而追问<em>「这个概念是为了什么——像我们这样的生物为什么会发明它？」</em> 他的回答是：一个社会性的、使用语言的物种迫切需要一种方式来标记<strong>可靠的信息来源</strong>——以标明谁的话你可以据以行动。「知识」就是我们演化出来别在可靠的真信息来源上的标签。这立刻解释了那些分析所苦苦挣扎的东西：为什么知识必须为<em>真</em>（一条假的提示毫无价值），为什么<em>运气</em>会使你丧失资格（你下次无法依赖侥幸），以及为什么我们在意这一切（在一个大多数你需要知道的东西都必须从他人那里获取的世界中生存）。它与威廉森的「停止试图定义它」相呼应，并且兑现了正文的开放问题——<em>演化</em>是否安装了那种基于运气的认知不作数的本能？克雷格的回答本质上是：是的，而且原因如下。</p>
</div>
</section>
<section>
<p class="sec-eyebrow"><span class="n">§8</span> 形式前沿</p>
<h2>贝叶斯之外的两处前沿</h2>
<p>正文的形式前沿是贝叶斯置信度。另外两个形式化思路也值得在地图上占有一席之地，因为两者都不断挑战日常直觉，且都直接通向计算机科学与 AI。</p>
<p><strong>认知的逻辑。</strong> <strong>雅科·欣蒂卡</strong>在 <em>Knowledge and Belief</em>（1962）中将「知道」视为一个可以像「必然地」一样进行推理的形式算子——从而开创了<em class="term">认知逻辑</em>，如今已成为计算机科学的主力工具（推理分布式智能体与 AI 系统「知道」什么）。它立刻带出深层难题。<em class="term">KK 原则</em>：如果你知道 <em>p</em>，你是否因此知道<em>你知道</em> <em>p</em>？这很诱人，但威廉森（来自正文）论证它是假的——你可以知道某事，却未处于知道你知道它的位置上，因为知识有模糊的边界。以及<em>逻辑全知</em>：干净的逻辑意味着如果你知道某些公理，你就知道它们的<em>每一个</em>逻辑后果——那将使每一位数学家瞬间意识到每一个定理。对于真实的、有限的心灵而言，这显然为假，并且是为实际推理者（以及机器）建模时的一个核心难题。</p>
<p><strong>序言悖论。</strong> 正文中彩票悖论的伴侣，而且可以说更为棘手。你写了一本冗长而审慎的书。对于书中的<em>每一个</em>主张，你都检查了工作并理性地相信它为真。然而你也真诚地在序言中写道：「无疑仍有错误存在，且皆由我一人负责」——因为你知道在数百个主张中，你几乎肯定在某处疏漏了。因此你理性地相信每一个单独的主张，并且<em>也</em>理性地相信<em>其中至少有一个为假</em>（大卫·马金森，"The Paradox of the Preface," 1965）。这些不可能同时为真。它直接回应了正文留下的开放问题：普通的非此即彼信念<em>对合取不封闭</em>——相信许多事物中的每一个，并不等于你有理由相信它们合起来全都为真——这正是该领域持续从是/否信念滑向分级置信度的又一个原因。再一次，分级拨盘能表达开关表达不了的东西。</p>
</section>
<div class="recap">
<p class="h">◆ 三句话总结本附录</p>
<dl>
<div><dt>大观念</dt><dd>正文让知识看起来像一个整洁的谜题——找到第四个条件——但它实际上更像一组相互牵连的问题：是否要求确定性（以及由此招来的怀疑论）、「知道」在利害关系变化时是否还能保持不动、知识相对于单纯真信念的<em>价值</em>何在，以及几乎所有知识都来自<em>他人</em>这一事实。</dd></div>
<div><dt>最佳新类比</dt><dd>邻近可能世界：知识是一种在相近情形中仍保持为真、因而安全的信念；运气则是一种现实稍微变化就会出错、因而不安全的信念——而且那条你能<em>再次</em>找到的通往拉里萨的路，比你误打误撞撞上的那条更有价值，即便二者都抵达了终点。</dd></div>
<div><dt>正在进行的争论</dt><dd>银行案例裁决为什么会改变——是语境移动了「知道」这个<em>词</em>（语境主义），是利害关系移动了<em>认知者</em>所知的东西（实践侵入），还是两者皆非（不变主义）——是该领域最活跃的争论焦点之一，同时并列的还有封闭性能否被否定，以及技艺之知是否其实只是命题之知。</dd></div>
</dl>
<p class="threads"><b>此处线索 ›</b> 信息（证言 &amp; 知识的社会传递；序言/置信度）· 计算（认知逻辑；世界的模态「邻近区域」）· 演化（克雷格：知识的概念作为一种为社会物种而设的可靠信息来源探测器）——拾起我们整段 180 天都在追踪的同五条线索。</p>
</div>
<section>
<p class="sec-eyebrow">开放问题</p>
<h2>本附录留下的未决问题</h2>
<ul>
<li><strong>确定性与否？</strong> 不可错论者是否正确：真正的知识需要无错的理由（从而招来怀疑论）——还是可能出错的知识才是唯一值得想要的类型？</li>
<li><strong>否定封闭性能否不带来灾难？</strong> 德雷茨克与诺齐克通过放弃它来阻挡怀疑论者；它在其他地方造成的代价仍有争议。</li>
<li><strong>「知道」的标准会变吗？</strong> 对语境敏感、对利害关系敏感，还是固定的——如果它移动，究竟是什么在移动，词语还是世界？</li>
<li><strong>知识的价值究竟能否被解释</strong>，还是每一种说明都让知识看起来不比幸运的真信念更好？</li>
<li><strong>技艺之知是否只是伪装的命题之知</strong>，还是它对世界有着自身不可还原的把握方式？</li>
<li><strong>证言是基本的还是需要先取得资格？</strong>进一步说，当一位同侪分歧时，你是否真的必须与他们半路相逢？</li>
<li><strong>而功能优先的解释：</strong>如果知识的概念存在是为了标记可靠的信息来源，那是否<em>消解</em>了分析计划，还是只是把问题移到别处？</li>
</ul>
</section>

<hr class="div">
<section class="sources">
<p class="sec-eyebrow">来源</p>
<h2>来源与延伸阅读</h2>
<p>古典著作按原始日期引用；所有版本均为标准且广泛可得的版本。经核实的二次文献锚点与参考条目已附链接。</p>
<ol>
<li>Descartes, R. (1641). <em>Meditations on First Philosophy.</em> <span class="meta">—— 方法论怀疑、邪恶恶魔，以及作为唯一不可怀疑之点的我思。</span></li>
<li>Unger, P. (1975). <em>Ignorance: A Case for Scepticism.</em> Oxford University Press. <span class="meta">—— 不可错论被推向其怀疑论结论（「知道」如同「平坦」一样，几乎不适用于任何事物）。</span></li>
<li>Moore, G. E. (1939). "Proof of an External World." <em>Proceedings of the British Academy</em> 25: 273–300. <span class="meta">—— 「这里有一只手」：将怀疑论论证反向运行。</span></li>
<li>Dretske, F. (1970). "Epistemic Operators." <em>Journal of Philosophy</em> 67(24): 1007–1023. <span class="meta">—— 否定封闭性；相关替代项观点；斑马/漆骡案例。</span></li>
<li>Nozick, R. (1981). <em>Philosophical Explanations.</em> Harvard University Press. <span class="meta">—— 敏感性 / 真值追踪，及其对封闭性的否定。</span></li>
<li>Putnam, H. (1981). <em>Reason, Truth and History.</em> Cambridge University Press. <span class="meta">—— 缸中之脑，以及语义外在论论证「我是 BIV」是自我驳斥的。</span></li>
<li>Bostrom, N. (2003). "Are You Living in a Computer Simulation?" <em>Philosophical Quarterly</em> 53(211): 243–255. <a href="https://www.simulation-argument.com/simulation.html">simulation-argument.com</a></li>
<li>Chalmers, D. J. (2022). <em>Reality+: Virtual Worlds and the Problems of Philosophy.</em> W. W. Norton / Allen Lane. <span class="meta">—— 「虚拟现实是真正的现实」；模拟实在论。 <a href="https://consc.net/reality/">consc.net/reality</a></span></li>
<li>DeRose, K. (1992). "Contextualism and Knowledge Attributions." <em>Philosophy and Phenomenological Research</em> 52(4): 913–929. <span class="meta">—— 银行案例。</span> 另见 DeRose (1995), "Solving the Skeptical Puzzle," <em>Philosophical Review</em> 104(1): 1–52。</li>
<li>Lewis, D. (1996). "Elusive Knowledge." <em>Australasian Journal of Philosophy</em> 74(4): 549–567. <span class="meta">—— 语境主义与注意规则。</span></li>
<li>Cohen, S. (1988). "How to Be a Fallibilist." <em>Philosophical Perspectives</em> 2: 91–123. <span class="meta">—— 机场案例。</span></li>
<li>Stanley, J. (2005). <em>Knowledge and Practical Interests.</em> Oxford University Press. <span class="meta">—— 实践侵入 / 利益相对不变主义。</span> 另见 Hawthorne, J. (2004), <em>Knowledge and Lotteries</em> (OUP); Fantl, J. &amp; McGrath, M. (2009), <em>Knowledge in an Uncertain World</em> (OUP).</li>
<li>Pritchard, D. (2005). <em>Epistemic Luck.</em> Oxford University Press. <span class="meta">—— 运气的模态说明；真理运气；安全性条件；后来的反运气德性认识论。</span> 概述： <a href="https://iep.utm.edu/epi-luck/">IEP, "Epistemic Luck."</a></li>
<li>Lehrer, K. &amp; Paxson, T. (1969). "Knowledge: Undefeated Justified True Belief." <em>Journal of Philosophy</em> 66(8): 225–237. <span class="meta">—— 可废止性分析。</span></li>
<li>Goldman, A. (1967). "A Causal Theory of Knowing." <em>Journal of Philosophy</em> 64(12): 357–372. <span class="meta">—— 以及 Benacerraf, P. (1973), "Mathematical Truth," <em>J. Phil.</em> 70(19): 661–679, 关于它为何对抽象对象失效。</span></li>
<li>Conee, E. &amp; Feldman, R. (1998). "The Generality Problem for Reliabilism." <em>Philosophical Studies</em> 89(1): 1–29.</li>
<li>Plato. <em>Meno</em> (~380 BCE). <span class="meta">—— 通往拉里萨的路；价值问题（知识与真信念）。</span></li>
<li>Zagzebski, L. (2003). "The Search for the Source of Epistemic Good." <em>Metaphilosophy</em> 34(1–2): 12–28. <span class="meta">—— 淹没问题。</span> 另见 Kvanvig, J. (2003), <em>The Value of Knowledge and the Pursuit of Understanding</em> (Cambridge UP).</li>
<li>Ryle, G. (1949). <em>The Concept of Mind.</em> University of Chicago Press. <span class="meta">—— 技艺之知与命题之知；规则的无限倒退。</span></li>
<li>Stanley, J. &amp; Williamson, T. (2001). "Knowing How." <em>Journal of Philosophy</em> 98(8): 411–444. <span class="meta">—— 理智主义：技艺之知作为命题之知的一种。</span></li>
<li>Russell, B. (1910–11). "Knowledge by Acquaintance and Knowledge by Description." <em>Proceedings of the Aristotelian Society</em> 11: 108–128.</li>
<li>Hume, D. (1748). <em>An Enquiry Concerning Human Understanding</em>, §X. <span class="meta">—— 证言的还原主义观点。</span> Reid, T. (1764). <em>An Inquiry into the Human Mind on the Principles of Common Sense.</em> <span class="meta">—— 证言作为基本来源（反还原主义）。</span></li>
<li>Elga, A. (2007). "Reflection and Disagreement." <em>Noûs</em> 41(3): 478–502. <span class="meta">doi:10.1111/j.1468-0068.2007.00656.x.</span> 以及 Christensen, D. (2007), "Epistemology of Disagreement: The Good News," <em>Philosophical Review</em> 116(2): 187–217.</li>
<li>Fricker, M. (2007). <em>Epistemic Injustice: Power and the Ethics of Knowing.</em> Oxford University Press. <span class="meta">—— 证言不正义与诠释不正义。</span></li>
<li>Craig, E. (1990). <em>Knowledge and the State of Nature: An Essay in Conceptual Synthesis.</em> Oxford University Press. <span class="meta">—— 功能优先 / 良好信息来源的概念谱系学。</span></li>
<li>Hintikka, J. (1962). <em>Knowledge and Belief: An Introduction to the Logic of the Two Notions.</em> Cornell University Press. <span class="meta">—— 认知逻辑；KK 原则；逻辑全知。</span></li>
<li>Makinson, D. C. (1965). "The Paradox of the Preface." <em>Analysis</em> 25(6): 205–207.</li>
<li>参考综述： <em>Stanford Encyclopedia of Philosophy</em> —— <a href="https://plato.stanford.edu/entries/skepticism/">"Skepticism,"</a> <a href="https://plato.stanford.edu/entries/contextualism-epistemology/">"Epistemic Contextualism,"</a> <a href="https://plato.stanford.edu/entries/knowledge-value/">"The Value of Knowledge,"</a> <a href="https://plato.stanford.edu/entries/testimony-episprob/">"Epistemological Problems of Testimony,"</a> <a href="https://plato.stanford.edu/entries/epistemic-injustice/">"Epistemic Injustice."</a></li>
</ol>
</section>
</div>
</details>
<!-- deep-dive:end -->

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
<li>"Gettier problem." <em>Wikipedia</em> (accessed 2026). <a href="https://en.wikipedia.org/wiki/Gettier_problem">en.wikipedia.org/wiki/Gettier_problem</a> <span class="meta">—— Russell（1948）、法上（约公元 770 年）与甘格沙（14 世纪）的先例。</span></li>
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
