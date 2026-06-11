---
layout: layouts/day.njk
tags: day
day: 1
title: What Is Knowledge?
summary: A stopped clock exposes why justified true belief is not enough for knowledge.
block: Foundations of Knowledge & Reasoning
slug: what-is-knowledge
day_path: 001-what-is-knowledge
source_file: ../day-01-what-is-knowledge.html
threads:
  - information
  - computation
  - emergence
permalink: /days/001-what-is-knowledge/
---
<header class="hero wrap">
<p class="eyebrow">Block I · Foundations of Knowledge &amp; Reasoning · <span class="daymark">Day 01 / 180</span></p>
<h1>What Is Knowledge?</h1>
<p class="sub">You looked at the clock. You were right. Did you <em>know</em>?</p>

<figure class="hero-clock">
<div class="clockwrap">
<svg viewBox="0 0 240 240" role="img" aria-label="An analog clock showing 9:12, which has secretly stopped.">
<defs>
<radialGradient id="face" cx="50%" cy="42%" r="70%">
<stop offset="0%" stop-color="var(--raised)"></stop>
<stop offset="100%" stop-color="var(--paper)"></stop>
</radialGradient>
</defs>
<circle cx="120" cy="120" r="108" fill="url(#face)" stroke="var(--line-strong)" stroke-width="2"></circle>
<circle cx="120" cy="120" r="100" fill="none" stroke="var(--line)" stroke-width="1"></circle>
<!-- ticks -->
<g id="ticks" stroke="var(--ink-faint)"></g>
<!-- 12 / 3 / 6 / 9 numerals -->
<g fill="var(--ink-soft)" font-family="IBM Plex Mono, monospace" font-size="12" text-anchor="middle">
<text x="120" y="34">12</text>
<text x="208" y="125">3</text>
<text x="120" y="216">6</text>
<text x="33" y="125">9</text>
</g>
<!-- hour hand 9:12 (276deg) -->
<line x1="120" y1="120" x2="68.3" y2="114.6" stroke="var(--ink)" stroke-width="5" stroke-linecap="round"></line>
<!-- minute hand 12 min (72deg) -->
<line x1="120" y1="120" x2="194.2" y2="95.9" stroke="var(--ink)" stroke-width="3.5" stroke-linecap="round"></line>
<!-- frozen second hand -->
<line x1="120" y1="120" x2="150" y2="180" stroke="var(--accent)" stroke-width="1.6" stroke-linecap="round"></line>
<circle cx="120" cy="120" r="5.5" fill="var(--ink)"></circle>
<circle cx="120" cy="120" r="2" fill="var(--accent)"></circle>
</svg>
</div>
<span class="stopped-tag">● stopped 12 h ago — but right, for this one minute</span>
</figure>

<p class="lede"><span class="drop">I</span>t is 9:12 in the morning and you are late. You glance up at the great station clock as you rush past, read <strong>9:12</strong>, and think: <em>fine — three minutes to spare.</em> You are right. It really is 9:12. And yet the clock you trusted died at 9:12 exactly twelve hours ago, somewhere in the small hours, and has hung there frozen ever since. You consulted a broken instrument at the single instant in the day it happened to be correct.</p>

<p>Your belief was <strong>true</strong>. It rested on a perfectly sensible <strong>reason</strong> — clocks tell the time, and you have trusted a thousand of them without incident. You <strong>believed</strong> it sincerely. So: did you <em>know</em> it was 9:12? Asked carefully, almost everyone says no. Something is missing. Saying exactly what has consumed philosophers for sixty years — and, as we'll see, the better part of a thousand.</p>
</header><div class="wrap">

<div class="whereblock">
<p class="label">◆ Where we are</p>
<p>This is the first descent, so there is nothing behind us yet — the log is blank. Instead we plant seeds. The machinery introduced today (belief as something that comes in <em>degrees</em>; updating on evidence; minds as inference engines) is the epistemic toolkit the entire course will lean on. Watch for it to resurface on <a href="/days/002-scientific-method-and-demarcation/"><strong>Day 2</strong></a> (how science decides what counts at all), <strong>Day 4</strong> (probability as the logic of partial belief), <strong>Day 7</strong> (information), <strong>Day 119</strong> (the predictive brain), and <strong>Day 149</strong> (when famous results evaporate). The five threads we'll trace across all 180 days — <em>information, energy, evolution, emergence, computation</em> — all have a quiet first appearance right here.</p>
</div>

<section>
<p class="sec-eyebrow">The model</p>
<h2>The three-legged stool</h2>
<p>For roughly twenty-three centuries, Western philosophy carried around a tidy answer to "what is knowledge?" To <em class="term">know</em> that something is the case, you needed three things at once:</p>
<p><strong>(1) you believe it</strong> — you can't know what you don't even hold to be true. <strong>(2) it's true</strong> — you can't <em>know</em> a falsehood; people who said "I knew the Earth was flat" merely <em>believed</em> it, confidently and wrongly. <strong>(3) you're justified</strong> — you have good reason, because a lucky guess that lands isn't knowledge either. The gambler who "just had a feeling" the long-shot would win, and won, did not <em>know</em> it would.</p>
<p>Knowledge, on this view, is <em class="term">justified true belief</em> — JTB, a three-legged stool. Kick away any leg and it topples. The picture is usually traced to Plato, who in the <em>Theaetetus</em> floats the idea that knowledge is "true judgement with an account." There's a delicious irony here, much enjoyed by historians: in that very dialogue Socrates then dismantles the definition, so Plato arguably never endorsed the thing named after him. As one scholar put it, it is almost as if a distinguished critic created a tradition in the very act of destroying it.</p>
<p>Still, the rough consensus held. The stool seemed stable. And then a 35-year-old philosopher who, the story goes, hadn't published much and rather needed to, wrote three pages.</p>
</section>

<section>
<p class="sec-eyebrow">The grenade</p>
<h2>Gettier's three pages</h2>
<p>In 1963, Edmund Gettier published a paper in the journal <em>Analysis</em> with the cheekily plain title <em>"Is Justified True Belief Knowledge?"</em>. It runs barely three pages. It has since been cited in <strong>thousands</strong> of scholarly works and spawned entire subfields. Few documents in modern philosophy have done more damage per word.</p>
<p>Gettier's move was devastatingly simple. He built little stories in which all three legs of the stool are firmly in place — belief, truth, justification — and yet you'd never say the person <em>knows</em>. Here is his first case, lightly modernized:</p>
<blockquote>Smith and Jones both apply for a job. The boss tells Smith, "Jones will get it." Smith has also, idly, counted the coins in Jones's pocket: ten. So Smith forms a justified belief: <em>the person who gets the job has ten coins in their pocket.</em></blockquote>
<p>Now the twist. The boss was wrong (or changed her mind): <strong>Smith</strong> gets the job, not Jones. And — entirely unknown to Smith — Smith happens to have <strong>ten coins</strong> in his own pocket too. Look at his belief, "the person who gets the job has ten coins": it's <strong>true</strong> (the winner, Smith, does have ten coins), it's <strong>justified</strong> (excellent evidence — the boss's word, a literal coin count), and it's sincerely <strong>believed</strong>. JTB, all three legs. Yet Smith plainly doesn't <em>know</em> it. He was tracking <em>Jones</em> and arrived at the right answer about the wrong man.</p>
<p>That is the anatomy of a <em class="term">Gettier case</em>: your justification runs <em>through a falsehood</em> ("Jones will get the job"), and the belief is rescued into truth by an unrelated <em>coincidence</em> ("Smith also has ten coins"). The reason and the truth never actually touch. The stopped clock is the same skeleton in cleaner clothes: your reason (the clock) is broken, and the truth (it's 9:12) arrives by luck.</p>

<div class="aside">
<p class="h">A twist older than its name</p>
<p>Gettier wasn't first. Bertrand Russell had the stopped-clock case in <em>Human Knowledge: Its Scope and Limits</em> (1948). Go back further and the problem is downright ancient: around <strong>770&nbsp;CE</strong> the Buddhist logician <strong>Dharmottara</strong> described a traveler who sees what looks like smoke over a hill, infers fire, and is right that there's fire — except the "smoke" was a swarm of insects. Same skeleton, twelve centuries early. In 14th-century India, <strong>Gaṅgeśa</strong> built a whole causal theory of knowing to handle such cases. The "Gettier problem" is one of philosophy's great instances of <em>convergent discovery</em> — the kind of thing minds keep tripping over independently, which is itself a hint that something real is there.</p>
</div>
</section>

<!-- ===================== INTERACTIVE 1 ===================== -->
<div class="panel web-only">
<p class="ptitle">Interactive · build it and break it</p>
<h4>The Gettier Machine</h4>
<p class="pnote">Flip the three classic conditions on and off. The center of the diagram lights up when all three overlap — that's <em>justified true belief</em>. Then try the red switch, <strong>Luck</strong>, with all three on: watch JTB stay satisfied while knowledge slips away. Or load a famous scenario.</p>

<div class="gm-grid">
<div>
<div class="switches">
<button class="swbtn" id="sw-b" role="switch" aria-checked="true">
<span class="knob"></span><span class="lab"><b>Belief</b><span>You sincerely hold it</span></span>
</button>
<button class="swbtn" id="sw-t" role="switch" aria-checked="true">
<span class="knob"></span><span class="lab"><b>Truth</b><span>It is in fact the case</span></span>
</button>
<button class="swbtn" id="sw-j" role="switch" aria-checked="true">
<span class="knob"></span><span class="lab"><b>Justification</b><span>You have good reason</span></span>
</button>
<button class="swbtn luck" id="sw-l" role="switch" aria-checked="false">
<span class="knob"></span><span class="lab"><b>Luck (the Gettier twist)</b><span>Reason misfires; truth arrives by coincidence</span></span>
</button>
</div>
<div class="presets">
<p class="h">Load a scenario</p>
<div class="pbtns">
<button class="pbtn" data-preset="clock">Stopped clock</button>
<button class="pbtn" data-preset="coins">Smith &amp; the coins</button>
<button class="pbtn" data-preset="guess">A lucky guess</button>
<button class="pbtn" data-preset="false">A confident error</button>
<button class="pbtn" data-preset="know">Plain knowing</button>
</div>
</div>
</div>

<div class="venn-box">
<svg viewBox="0 0 400 330" role="img" aria-label="Three overlapping circles for Belief, Truth and Justification.">
<defs>
<pattern id="hatch" width="8" height="8" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
<rect width="8" height="8" fill="color-mix(in srgb,var(--contested) 18%,transparent)"></rect>
<line x1="0" y1="0" x2="0" y2="8" stroke="var(--contested)" stroke-width="2"></line>
</pattern>
</defs>
<circle id="c-b" cx="200" cy="118" r="92" fill="color-mix(in srgb,var(--accent) 16%,transparent)" stroke="var(--accent)" stroke-width="2"></circle>
<circle id="c-t" cx="150" cy="208" r="92" fill="color-mix(in srgb,var(--accent) 16%,transparent)" stroke="var(--accent)" stroke-width="2"></circle>
<circle id="c-j" cx="250" cy="208" r="92" fill="color-mix(in srgb,var(--accent) 16%,transparent)" stroke="var(--accent)" stroke-width="2"></circle>
<text x="200" y="64" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="13" fill="var(--ink-soft)">BELIEF</text>
<text x="96" y="250" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="13" fill="var(--ink-soft)">TRUE</text>
<text x="305" y="250" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="13" fill="var(--ink-soft)">JUSTIFIED</text>
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
<p class="ptitle">Reference table</p>
<h4>The Gettier Machine</h4>
<p class="pnote">Key cases:</p>
<table class="alt-table">
<thead><tr><th>Case</th><th>Belief</th><th>Truth</th><th>Justification</th><th>Luck</th><th>Verdict</th></tr></thead>
<tbody>
<tr><td>Plain knowing</td><td>Yes</td><td>Yes</td><td>Yes</td><td>No</td><td>Knowledge on the classic view</td></tr>
<tr><td>Stopped clock</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Not knowledge: truth arrives by coincidence</td></tr>
<tr><td>Lucky guess</td><td>Yes</td><td>Yes</td><td>No</td><td>Yes</td><td>Not knowledge: no justification</td></tr>
<tr><td>Confident error</td><td>Yes</td><td>No</td><td>Yes</td><td>No</td><td>Not knowledge: the claim is false</td></tr>
</tbody>
</table>
</div>

<section>
<p class="sec-eyebrow">The patch wars</p>
<h2>The hunt for the fourth leg</h2>
<p>The obvious response to Gettier was: add a fourth condition that screens out the luck. For decades, epistemologists tried — and each tidy fix met a nastier counterexample. It became a minor blood sport.</p>
<p><strong>No false lemmas.</strong> First idea: knowledge can't be reasoned <em>through</em> a falsehood. Smith's belief leaned on "Jones will get the job," which was false; ban that and you're safe. Clean — until Alvin Goldman's <strong>fake-barn country</strong> (1976). You're driving through a region where, as a prank, every "barn" is a flat movie-set façade — except one. You happen to glance at the single real barn and think "a barn." Your belief is true, justified, and rests on <em>no</em> false premise. Yet you don't know it's a barn: you could so easily have been fooled by a façade a hundred meters either way.</p>
<p><strong>Track the truth.</strong> So maybe knowledge is about how your belief behaves across <em>nearby possibilities</em>. Robert Nozick (1981) proposed <em class="term">sensitivity</em>: you know <em>p</em> only if, <em>were p false, you wouldn't believe it.</em> Elegant — but it produces strange verdicts in edge cases. Ernest Sosa (1999) flipped it into <em class="term">safety</em>: in all the nearby ways things could have gone, you wouldn't have been wrong. The stopped clock fails safety hard (a minute either side and you're mistaken); a working clock passes. Fake-barn-you fails safety too.</p>
<p>Then Linda Zagzebski (1994) delivered the gut-punch with a kind of <strong>recipe</strong> for defeating <em>any</em> such fix. Take a belief that's justified but could still be false (which justification, being fallible, always allows). Arrange for the justification to misfire so the belief is false — then arrange, by luck, for it to be true after all. As long as your fourth condition stops short of demanding that the justification <em>guarantee</em> the truth, luck can always wedge back in. The patch wars may be structurally unwinnable.</p>

<h3>Two ways to stop fighting</h3>
<p><strong>Declare knowledge a primitive.</strong> Timothy Williamson, in <em>Knowledge and Its Limits</em> (2000), made a radical move: stop trying to build knowledge out of simpler parts. Maybe it has no analysis. On his <em class="term">knowledge-first</em> view, knowing is a basic mental state — the most general <em>factive</em> one — and we should explain belief, evidence, and justification <em>in terms of knowledge</em>, not the other way around. You can't define <em>hydrogen</em> or <em>John F. Kennedy</em> into simpler concepts; perhaps knowledge is bedrock too. Sixty years of failed definitions start to look less like a puzzle and more like a clue.</p>
<p><strong>Make it about competence.</strong> The other escape is <em class="term">virtue epistemology</em> (Sosa again). Knowledge is <em>apt</em> belief — a belief that is true <em>because of</em> the knower's skill, not by accident. Picture an archer. A bullseye is a good shot only if the arrow hit center <em>because</em> the archer aimed well — not because a gust blew a bad shot onto the target. The Gettiered believer is exactly that archer: the wind knocked the arrow off course, then a second gust knocked it back onto the bull. Accurate, yes. Skillful, no. <em>Apt</em>, no. That, says Sosa, is why luck-based hits aren't knowledge.</p>
</section>

<section>
<p class="sec-eyebrow">The debate</p>
<h2>What makes a belief justified at all?</h2>
<p>Step back from "is it knowledge?" to the humbler leg: what makes a belief <em>justified</em> in the first place? Push on any justification and you fall into a regress. It's 9:12 because the clock says so. Trust the clock because clocks are reliable. Believe <em>that</em> because… and now you're sliding. The ancient skeptics mapped the trap precisely. Every chain of justification, they argued, ends in one of three uncomfortable places — the <em class="term">Agrippan trilemma</em>: it goes on <strong>forever</strong>, or it loops back in a <strong>circle</strong>, or it stops at some <strong>arbitrary</strong> point you simply declare.</p>
<p>Three modern schools each pick which horn to grab — and a fourth changes the subject entirely.</p>
</section>

<!-- ===================== VISUAL 2 ===================== -->
<div class="panel tri">
<p class="ptitle">Diagram · the regress problem</p>
<h4>Agrippa's Trilemma — three bad endings, four escapes</h4>
<p class="pnote">Why is your belief justified? Every honest answer to "…and why <em>that</em>?" eventually hits one of three walls.</p>
<div class="regress-map print-hide" role="img" aria-label="A chain of reasons ending in infinite regress, a circle, or an arbitrary halt.">
<div class="regress-chain">
<div class="rnode strong"><b>Belief</b><span>"it is 9:12"</span></div>
<div class="rstep" aria-hidden="true">-></div>
<div class="rnode"><b>Reason</b><span>"the clock says so"</span></div>
<div class="rstep" aria-hidden="true">-></div>
<div class="rnode"><b>Further reason</b><span>"the clock is reliable"</span></div>
</div>
<div class="regress-outcomes">
<article class="routcome"><span>∞</span><b>Infinite regress</b><p>Every reason asks for another reason.</p></article>
<article class="routcome"><span>↻</span><b>Circle</b><p>The chain returns to a claim it already used.</p></article>
<article class="routcome"><span>▮</span><b>Arbitrary halt</b><p>The chain simply stops at a basic commitment.</p></article>
</div>
</div>
<div class="tri-print epub-only print-only">
<p><strong>Reason chain:</strong> belief: "it's 9:12" -> because "the clock" -> because "...and why that?"</p>
<ol>
<li><strong>Infinite regress:</strong> every reason needs another reason forever.</li>
<li><strong>Circle:</strong> the chain loops back to something it already used.</li>
<li><strong>Arbitrary halt:</strong> the chain simply stops at a basic commitment.</li>
</ol>
</div>
<div class="tri-key">
<div class="k"><b>Foundationalism</b> — bites the third bullet: some beliefs are <em>basic</em> and need no further support (raw experience, simple logic). The chain stops, but not arbitrarily.</div>
<div class="k"><b>Coherentism</b> — embraces the circle, but makes it virtuous: no belief stands alone; a belief is justified by how well it hangs together with the whole web. (A first taste of <em>systems thinking</em>, Day 9.)</div>
<div class="k"><b>Infinitism</b> — the brave minority: accepts that justification is an endless chain of reasons, never bottoming out.</div>
<div class="k"><b>Reliabilism</b> — changes the question. A belief is justified if it was <em>produced by a reliable process</em> — good vision, sound memory — whether or not you can recite a defense. This is <em>externalism</em>: justification can be a fact about your wiring, not a story in your head.</div>
</div>
</div>

<section>
<p>That internal/external split matters more than it looks. The <strong>internalist</strong> says justification must be something you can access by reflection — reasons available "from the inside." The <strong>externalist</strong> (reliabilism's home) says what matters is that your belief was, in fact, produced in a truth-conducive way, accessible or not. Hold that tension in mind: it is exactly where the old armchair questions collide with the new science of how brains actually form beliefs.</p>
</section>

<section class="frontier">
<p class="sec-eyebrow">The frontier · 2026</p>
<h2>Three live edges — and the hype filter</h2>
<p>Every day in this course ends at the research frontier, with each claim tagged for how much weight it can bear. Knowledge sits at a fascinating junction right now: philosophers, psychologists, and neuroscientists are all circling the same questions from different sides.</p>

<div class="claim">
<div class="ctop">
<span class="cnum">Edge 01</span>
<span class="chip bad" data-print="superseded"><i></i>Original claim · superseded</span>
<span class="chip ok" data-print="established"><i></i>Replication · established</span>
</div>
<h3>Are "knowledge" intuitions universal — or just Western?</h3>
<p>When the discipline runs on "asked carefully, almost everyone says no," a natural worry is: <em>which</em> everyone? In 2001, the founding study of <em class="term">experimental philosophy</em> — Weinberg, Nichols &amp; Stich — reported that the Gettier intuition varies by culture, with East-Asian participants supposedly more willing to grant the lucky believer "knowledge." If true, it was a bombshell: philosophy's whole method of consulting intuitions looked parochial.</p>
<p>The bombshell did not survive contact with replication. In <strong>"Gettier Across Cultures"</strong> (<em>Noûs</em>, 2017), Machery, Stich, Rose and colleagues tested Brazil, India, Japan, and the United States with cases taken near-verbatim — and found the <em>opposite</em>: in <strong>every</strong> group, people robustly refused to call the Gettiered belief knowledge. A separate replication (Kim &amp; Yuan) failed to reproduce the original cross-cultural gap even with a far larger East-Asian sample. The current best reading is that there may be a <strong>universal core "folk epistemology"</strong> that recoils from luck-based knowing. The deeper lesson is one we'll meet at industrial scale on <strong>Day 149</strong>: the splashiest finding is often the one careful re-testing quietly walks back.</p>
</div>

<div class="claim">
<div class="ctop">
<span class="cnum">Edge 02</span>
<span class="chip ok" data-print="established"><i></i>Normative framework · established</span>
<span class="chip hint" data-print="contested"><i></i>"Replaces belief" · contested</span>
</div>
<h3>Belief by the dial, not the switch: Bayesian epistemology</h3>
<p>Maybe the all-or-nothing picture of belief was the wrong starting point. <em class="term">Bayesian epistemology</em> says your real epistemic states are <em class="term">credences</em> — degrees of confidence on a scale from 0 to 1. Rationality then needs just two rules: your credences must obey the laws of probability (<em>coherence</em>), and you must revise them by <em>conditionalization</em> as evidence comes in.</p>
<p>Why obey? The <strong>Dutch book theorem</strong> (Ramsey, 1926; de Finetti, 1937) supplies a startlingly concrete answer: if your credences break the probability laws, a clever bookmaker can offer you a set of bets you'll each accept as fair, but which together guarantee you lose money <em>no matter what happens</em>. Incoherent confidence isn't merely untidy — it's exploitable. The dial below lets you feel the trap close. What's still <em>contested</em> is whether graded credence <em>replaces</em> ordinary yes/no belief or merely sits beside it. (The lottery paradox bites here: you're 99.9% sure your ticket loses — but do you flat-out <em>believe</em> it loses?) We pick this thread up properly on <strong>Day 4</strong>.</p>
</div>
</section>

<!-- ===================== INTERACTIVE 3 ===================== -->
<div class="panel web-only">
<p class="ptitle">Interactive · feel the trap</p>
<h4>The Credence Dial &amp; the Dutch Book</h4>
<p class="pnote">Set your confidence that the next card is <strong>red</strong> (S) and that it's <strong>not red</strong> (¬S). The two should sum to exactly 1. Push them out of line and watch a bookie turn your incoherence into a guaranteed profit — at your expense.</p>

<div class="cred-controls">
<div class="slider-row">
<label>Credence in S — "next card is red" <span class="val" id="vS">0.50</span></label>
<input type="range" id="rS" min="0" max="100" value="50" aria-label="Credence in S">
</div>
<div class="slider-row">
<label>Credence in ¬S — "next card is not red" <span class="val" id="vN">0.50</span></label>
<input type="range" id="rN" min="0" max="100" value="50" aria-label="Credence in not S">
</div>

<div>
<div class="sumbar" id="sumbar" aria-hidden="true">
<div class="seg s" id="segS" style="width:50%"></div>
<div class="seg n" id="segN" style="width:50%"></div>
<div class="one-line"></div>
</div>
<div class="sum-readout"><span>0</span><span id="sumtxt">sum = 1.00 ✓</span><span>2</span></div>
</div>

<div class="ledger coherent" id="ledger">
<p class="lh" id="ledgerH">Coherent</p>
<p id="ledgerBody" style="margin:0;">Your confidences sum to 1. No book of fair-looking bets can guarantee you a loss. This is the bare minimum probability asks of a rational mind.</p>
</div>
<button class="snap" id="snapBtn">↳ Snap ¬S to 1 − S (make it coherent)</button>
</div>
</div>
<div class="format-alt epub-only print-only">
<p class="ptitle">Reference table</p>
<h4>The Credence Dial and the Dutch Book</h4>
<p>If your credence in <em>S</em> and your credence in <em>not-S</em> sum to 1.00, the pair is coherent. If they sum above 1.00, you will overpay for bets where exactly one can win. If they sum below 1.00, a bookie can reverse the bets and still guarantee a profit.</p>
<table class="alt-table">
<thead><tr><th>Credence in S</th><th>Credence in not-S</th><th>Sum</th><th>Result</th></tr></thead>
<tbody>
<tr><td>0.50</td><td>0.50</td><td class="num">1.00</td><td>Coherent</td></tr>
<tr><td>0.70</td><td>0.60</td><td class="num">1.30</td><td>Guaranteed 0.30 loss if you buy both $1 bets</td></tr>
<tr><td>0.30</td><td>0.40</td><td class="num">0.70</td><td>Guaranteed 0.30 loss if the bookie buys both bets from you</td></tr>
</tbody>
</table>
</div>

<section class="frontier">
<div class="claim">
<div class="ctop">
<span class="cnum">Edge 03</span>
<span class="chip hint" data-print="promising"><i></i>Predictive coding · promising</span>
<span class="chip bad" data-print="contested"><i></i>Grand "Free Energy" theory · contested</span>
</div>
<h3>Where do beliefs come from? The brain as a prediction machine</h3>
<p>Philosophy asks what justifies a belief; neuroscience now asks how a lump of tissue forms one. A fast-growing program answers: the brain is not a passive sponge soaking up the world — it is a relentless <em class="term">prediction machine</em>. On the <em class="term">predictive-processing</em> view (Andy Clark, <em>Behavioral and Brain Sciences</em>, 2013; Jakob Hohwy, 2013), the brain constantly generates a model of its surroundings, predicts the sensory signals it expects, and forwards only the <em>prediction errors</em> — the surprises — up the hierarchy. Perception becomes the brain's best running guess, reined in by error; in Anil Seth's memorable phrase, a "controlled hallucination." Belief-updating starts to look like <strong>Bayesian inference rendered in neurons</strong> — the so-called "Bayesian brain," tying Edge 02 to wetware.</p>
<p>Karl Friston pushes the idea to its limit with the <em class="term">Free Energy Principle</em> (<em>Nature Reviews Neuroscience</em>, 2010): living systems persist precisely by minimizing a quantity — "free energy," an information-theoretic cousin of <em>surprise</em> — that knits perception, action, and even biological self-organization into one framework. The honest labels matter here. Predictive coding genuinely explains real perceptual phenomena and is a serious, productive research program — <strong>promising</strong>. But the <em>grand</em> Free Energy Principle, as a single law for all of mind and life, is widely criticized as so general it is hard to <em>falsify</em> — closer to a framework than a tested theory, and so <strong>contested</strong>. We'll return to it for perception (<strong>Day 119</strong>) and consciousness (<strong>Days 123–126</strong>) — and notice already how its "free energy" rhymes with the thermodynamics we'll meet on <strong>Days 33 and 83–85</strong>. <em>Information, energy, computation, emergence</em> — four of our five threads, braided into one neuron's quiet arithmetic.</p>
</div>
</section>

<section>
<p class="sec-eyebrow">Open questions</p>
<h2>What's genuinely unsettled</h2>
<p>Sixty years on, the honest answer to "what is knowledge?" includes a healthy list of things nobody has nailed down:</p>
<ul>
<li><strong>Can knowledge be analyzed at all?</strong> Or was Williamson right that it's bedrock — a primitive we explain other things <em>with</em>, not <em>from</em>?</li>
<li><strong>Internal or external?</strong> Does being justified require reasons you can access by reflection, or just wiring that tends to produce truths?</li>
<li><strong>One currency or two?</strong> Is rational belief fundamentally graded (credence), all-or-nothing, or both somehow reconciled?</li>
<li><strong>Is there really a universal human epistemology</strong> — and if so, did <em>evolution</em> install the instinct that luck-based "knowing" doesn't count? (A thread for <strong>Day 74</strong>.)</li>
<li><strong>Is the brain <em>literally</em> Bayesian</strong>, or is "the brain does inference" just a useful way of describing it from outside?</li>
<li><strong>And the question that will haunt the AI block:</strong> when a system like the one that drafted this page outputs a true, well-supported claim, does it <em>know</em> anything — or is it the ultimate Gettier case, right for reasons that have nothing to do with the truth? (<strong>Days 138–145</strong>.)</li>
</ul>
</section>

<div class="recap">
<p class="h">◆ The day in three sentences</p>
<dl>
<div><dt>Big idea</dt><dd>For 2,300 years knowledge looked like justified true belief — until Gettier showed in three pages that you can hold all three and still not know, because your reasons and the truth can meet by luck rather than by connection.</dd></div>
<div><dt>Best analogy</dt><dd>The stopped clock that's right twice a day — and the archer whose arrow is blown off target, then blown back onto the bullseye: accurate, but not <em>apt</em>.</dd></div>
<div><dt>Live controversy</dt><dd>Whether the fix is a fourth condition (and which), whether knowledge is unanalyzable bedrock, and whether "belief" should give way to graded, Bayesian credence — with a real scientific frontier in the claim that the brain is a prediction machine.</dd></div>
</dl>
<p class="threads"><b>Threads today ›</b> information (credence &amp; the Bayesian brain) · energy (Friston's free energy) · computation (mind as inference engine) — with light first touches of emergence and evolution.</p>
</div>

<!-- deep-dive:start -->
<details class="deep-dive" id="rest-of-the-map">
<summary>
<span class="ptitle">Deep dive appendix</span>
<span class="deep-dive-title">The Rest of the Map</span>
<span class="deep-dive-sub">We spent the main lesson on one belief, on one late morning. The field is far larger than one clock.</span>
</summary>
<div class="deep-dive-body">
<p class="lede"><span class="drop">T</span>he main piece had a tight job: take a single belief — <em>it's 9:12</em> — and ask whether it counted as knowledge. To do that it leaned, quietly, on a stack of assumptions it never examined, and it strolled right past whole provinces of the subject without nodding. Does knowing require <em>certainty</em>? Can the skeptic who says you know <em>nothing</em> actually be answered? Does the word "know" even hold still from one sentence to the next? Why is knowledge worth <em>more</em> than a true belief that does the same job? And what about all the knowing that has nothing to do with facts — knowing how to swim, knowing a face, knowing a city? This appendix walks the rest of that map. Nothing here repeats the main lesson; it all hangs off its edges.</p>
<div class="continues">
<p class="label">↩ Continues directly from</p>
<p><strong>Day 1 — What Is Knowledge?</strong> There we built the three-legged stool (justified true belief), watched Gettier kick a leg out with three pages, toured the failed "fourth condition" patches, mapped Agrippa's trilemma, and ended at three frontiers: the cross-cultural test of "knowledge" intuitions, Bayesian credence, and the predictive brain. Keep two images from that day in your pocket — the <em>stopped clock</em> (right by luck, not connection) and the <em>archer</em> whose arrow is blown off course then back onto the bull (accurate, but not <em>apt</em>). Both come back transformed below.</p>
</div>
<div class="roadmap">
<p class="h">◇ Seven rooms we skipped</p>
<ol>
<li><b>The trapdoors under Gettier</b> — the two hidden assumptions that make the trick possible, and the escape hatch (certainty) that drops you into skepticism.</li>
<li><b>The skeptic at the door</b> — dreams, demons, brains in vats, and the 2020s simulation upgrade.</li>
<li><b>"Knows" on a sliding scale</b> — the Bank Cases: same evidence, different stakes, opposite verdict.</li>
<li><b>The luck we were really chasing</b> — anti-luck epistemology, which finally explains <em>why</em> the patch wars happened.</li>
<li><b>Why knowing beats being right</b> — Meno's road, and the value of knowledge.</li>
<li><b>The kinds of knowing we ignored</b> — how, and by acquaintance.</li>
<li><b>Almost everything you know, someone told you</b> — testimony, disagreement, and epistemic injustice.</li>
</ol>
</div>
<section>
<p class="sec-eyebrow"><span class="n">§1</span> The machinery</p>
<h2>The two trapdoors under every Gettier case</h2>
<p>Before we explore new rooms, look down. Gettier's three-page bomb only goes off because the floor has two trapdoors built into it — two assumptions so natural the main lesson never paused on them. Name them and the whole landscape reorganizes.</p>
<p><strong>Trapdoor one: fallible justification.</strong> The classical picture lets you be <em>justified</em> in believing something that turns out <em>false</em>. Smith had excellent reason to believe "Jones will get the job" — the boss said so — and it was false. If justification had to <em>guarantee</em> truth, that step would be impossible and the case couldn't even start. <strong>Trapdoor two: closure.</strong> Justification (and knowledge) is assumed to travel across <em class="term">entailment</em>: if you're justified in believing something, you're justified in believing what it obviously implies. Smith reasons from "Jones will get it (and has ten coins)" to the weaker "the winner has ten coins" — a valid inference — and carries his justification along for the ride. Knock out either plank and Gettier cases evaporate.</p>
<p>That hands us a tempting exit. Slam trapdoor one shut: insist that real knowledge needs <em class="term">infallible</em> justification — reasons that make error literally impossible. No more Gettier cases, ever. This is the dream of <em class="term">infallibilism</em>, and it is very old. Descartes went looking in 1641 for a single belief no demon could fake, and found exactly one that survives even the supposition that an all-powerful deceiver is fooling you about everything else: <em>I think, therefore I am</em>. You cannot be tricked into wrongly believing you exist, because the tricking requires a you to be tricked.</p>
<p>The trouble is what the demon takes with him on the way out. If knowledge demands that kind of certainty, then you do not know you have hands, that the sun will rise, that the person across the table is your friend and not an android — because a clever enough deception could fake any of it. Buy certainty and the price is <strong>skepticism</strong>: the bar is set so high that almost nothing clears it. Peter Unger argued exactly this in <em>Ignorance</em> (1975) — that "knows," used strictly, applies to virtually nothing, much as "flat" strictly applies to no real surface. So infallibilism doesn't dissolve the problem; it trades a small puzzle (the odd lucky belief) for a total one (you know next to nothing). Which is our cue to open the next door, where that skeptic is already knocking.</p>

<div class="aside">
<p class="h">Gettier's other case, in one breath</p>
<p>The main lesson used the coins. Gettier's <em>second</em> case shows trapdoor two even more nakedly. Smith, with great evidence, believes "Jones owns a Ford." From that he validly deduces "Jones owns a Ford, <em>or</em> Brown is in Barcelona" — a disjunction he's entitled to, since a true disjunct makes the whole thing true. But Jones doesn't own a Ford after all… and Brown, by pure fluke, <em>is</em> in Barcelona. The disjunction is true, justified, believed — and obviously not known. Closure carried the justification; luck supplied the truth. Same skeleton, fancier clothes.</p>
</div>
</section>
<section>
<p class="sec-eyebrow"><span class="n">§2</span> The biggest omission</p>
<h2>The skeptic at the door</h2>
<p>Western epistemology has a recurring houseguest who refuses to leave: the figure who says you can't know <em>anything</em> about the world outside your own mind. The main lesson kept the door shut. Open it, because every modern theory of knowledge is partly built to deal with what's standing there.</p>
<p>The skeptic's tools are thought experiments, escalating in cruelty. First, the <strong>dream</strong>: right now, how do you know you're not asleep? Dreams feel utterly real from the inside; you've been fooled before. (The Daoist Zhuangzi, around 300 BCE, dreamt he was a butterfly and woke unsure whether he was a man who'd dreamt a butterfly or a butterfly now dreaming a man — the same wound the Buddhist Dharmottara reopened in the main lesson, proof again that minds keep tripping over this independently.) Descartes raised the stakes to an <strong>evil demon</strong> bent on deceiving you about everything. The twentieth century updated the hardware: you might be a <em class="term">brain in a vat</em>, nerves wired to a computer feeding you exactly the experiences you're having now (Hilary Putnam, <em>Reason, Truth and History</em>, 1981). You cannot tell from the inside. That's the whole point.</p>
<p>Spelled out, the skeptic's argument is brutally clean — and it runs on the very closure principle from §1:</p>
<blockquote>(1) You don't <em>know</em> you're not a handless brain in a vat being fed a hand-experience.<br>(2) If you know you have hands, then (since having hands entails not being a handless vat-brain) you know you're not one.<br>(3) So you don't know you have hands.</blockquote>
<p>Each line looks reasonable; together they seem to prove you know nothing about the external world. The interactive below lets you try every way out — and discover that each "way out" is a named philosophical position with a price tag.</p>
</section>
<div class="panel web-only cm-machine">
<p class="ptitle">Interactive · pick your escape</p>
<h4>The Skeptic's Syllogism — four doors out</h4>
<p class="pnote">The argument below is valid: if you accept all three lines, you're a skeptic. So you must reject something. Each rejection is a real move with real defenders — and real costs. Pick one and see whose company you've joined.</p>

<div class="cm-arg" id="appendix-d001-cmArg">
<div class="cm-line cm-p1" id="appendix-d001-cmP1"><span class="pn">P1</span><span class="pt">You don't <strong>know</strong> you're not a handless brain in a vat (an indistinguishable fake).</span></div>
<div class="cm-line cm-p2" id="appendix-d001-cmP2"><span class="pn">P2</span><span class="pt"><strong>Closure:</strong> if you know you have hands, you know you're not such a vat-brain.</span></div>
<div class="cm-line concl cm-c" id="appendix-d001-cmC"><span class="pn">∴</span><span class="pt">So you <strong>don't know</strong> you have hands.</span></div>
</div>

<div class="cm-exits">
<p class="h">Which line do you refuse?</p>
<div class="cm-btns">
<button class="cm-btn" data-exit="skeptic">Accept all three</button>
<button class="cm-btn" data-exit="moore">Reject P1</button>
<button class="cm-btn" data-exit="dretske">Reject P2 (deny closure)</button>
<button class="cm-btn" data-exit="context">Redefine "know"</button>
</div>
</div>

<div class="cm-out cm-outlet" id="appendix-d001-cmOut">
<span class="who">Choose a door…</span>
      Each option dims the line you're rejecting and tells you where you've landed.
</div>
</div>
<div class="format-alt epub-only print-only">
<p class="ptitle">Print form</p>
<h4>The Skeptic's Syllogism, as four exits</h4>
<table class="alt-table">
<thead><tr><th>Move</th><th>Line refused</th><th>Representative view</th><th>Cost</th></tr></thead>
<tbody>
<tr><td>Accept all three</td><td>None</td><td>Skepticism</td><td>You do not know you have hands, or much about the external world.</td></tr>
<tr><td>Reject P1</td><td>You do not know you are not a vat-brain</td><td>Moore's common-sense reply</td><td>Can feel like insisting rather than explaining.</td></tr>
<tr><td>Reject P2</td><td>Closure</td><td>Dretske / Nozick relevant alternatives</td><td>Closure is deeply intuitive and useful elsewhere.</td></tr>
<tr><td>Change the standard</td><td>A fixed meaning of "know"</td><td>Contextualism</td><td>The skeptic wins in the seminar; ordinary speakers win in ordinary life.</td></tr>
</tbody>
</table>
</div>
<section>
<p>The doors are worth naming in full. <strong>G. E. Moore</strong> (1939) simply ran the argument backwards: <em>I am far more sure that here is one hand</em> (holding it up) <em>than I am of any fancy premise the skeptic offers</em> — so if the premises imply I don't know it, so much the worse for the premises. Cheeky, and strangely hard to beat. <strong>Fred Dretske</strong> (1970) and Robert Nozick (1981) took the surgical route: <em>deny closure.</em> On Dretske's <em class="term">relevant alternatives</em> view, to know something you only need to rule out the <em>relevant</em> ways you could be wrong, not every bizarre one. At the zoo you know the animal is a zebra — you've ruled out "it's a horse," "it's a goat" — even though you haven't ruled out "it's a mule cleverly painted to look like a zebra," because in this context that's not a live possibility. Knowledge doesn't automatically transmit to every entailment. The cost is steep: closure is intuitive, and giving it up has consequences elsewhere. <strong>Contextualism</strong> (our next section) offers the diplomat's solution: maybe the skeptic and Moore are <em>both</em> right, because "know" means something stricter in the skeptic's seminar than in ordinary life.</p>

<h3>The 2020s upgrade: are we in a simulation?</h3>
<p>The vat got a software update. Nick Bostrom's <strong>simulation argument</strong> (<em>Philosophical Quarterly</em>, 2003) makes a careful probabilistic case that at least one of three things is true: civilizations almost never reach the technology to run ancestor-simulations; or they reach it but choose not to; or <em>we are almost certainly living in one</em>. David Chalmers, in <strong>Reality+</strong> (2022), takes the next step and bites a bullet most people won't: he argues we <em>can't know</em> we're not simulated and should assign the possibility real probability — but that this <strong>isn't a catastrophe</strong>, because <em>"virtual reality is genuine reality."</em> A simulated tree, on his <em class="term">simulation realism</em>, is a real digital object, not an illusion; if you've always lived in a perfect simulation, your belief "that's a tree" is <em>true</em>, just realized in silicon. The skeptic assumed a fake world means false beliefs; Chalmers denies the link.</p>
<p>Two honest labels before we move on. The simulation <em>hypothesis</em> — that we are in fact simulated — is, as it stands, <strong>untestable metaphysics, not science</strong>: there's no agreed observation that would confirm or refute it, which puts it on the wrong side of the demarcation line we'll draw tomorrow. <span class="chip bad" data-print="unfalsifiable"><i></i>simulation hypothesis · unfalsifiable</span> The <em>philosophical</em> payoff is real all the same: it sharpens what we even mean by "real" and "know." And there's a famous reply that turns the screw the other way. Putnam argued that "I am a brain in a vat" is <strong>self-refuting</strong>: your words only mean what they do because of your causal history, so a lifelong brain-in-a-vat's word "vat" couldn't refer to real vats (it never causally touched one) — meaning that if you <em>were</em> a vat-brain, your sentence "I am a brain in a vat" would come out <em>false</em>. Whether that works is still argued, which is precisely why this thread runs straight into the AI block: when a system trained only on text outputs "Paris is in France," does it <em>know</em> that — or is it the purest brain-in-a-vat of all, with words that never touched the world? Hold the question for <strong>Days 138–145</strong>.</p>
</section>
<section>
<p class="sec-eyebrow"><span class="n">§3</span> The moving target</p>
<h2>"Knows" on a sliding scale</h2>
<p>Here is a possibility the main lesson never entertained: maybe sixty years of hunting the perfect definition of "knows" failed because the word was never aiming at a fixed point. Consider a pair of cases from Keith DeRose (<em>Philosophy and Phenomenological Research</em>, 1992) that have launched a thousand papers — the <strong>Bank Cases</strong>.</p>
<p>It's Friday. You drive past your bank, which has a long Saturday line, and decide to come back tomorrow. Your wife asks if it'll be open Saturday. <em>Low stakes</em> version: nothing much rides on it; you say, "Yes, I know it's open Saturdays — I was here two Saturdays ago." That sounds true. You know it. <em>High stakes</em> version: there's a check that <em>must</em> be deposited by Monday or you bounce your mortgage and lose the house, and your wife points out, reasonably, that banks do change their hours. Now the very same sentence — "I know it's open Saturday" — curdles in your mouth. "Well… I'd better go in and check." Same person, same memory, same evidence, same day. Only the stakes (and whether someone raised the chance of error) have changed. Yet the knowledge seems to come and go. The dial below lets you slide between the two and watch it flip.</p>
</section>
<div class="panel web-only stakes-dial">
<p class="ptitle">Interactive · same evidence, shifting verdict</p>
<h4>The Bank Cases — the Stakes Dial</h4>
<p class="pnote">Your evidence is fixed: <em>"I was at this bank two Saturdays ago, and it was open."</em> Nothing about the world or your eyesight changes. Slide the stakes; optionally let your spouse raise the possibility of error. Watch "I know" turn into "I'd better check" — and read how three rival camps explain the very same flip.</p>

<div class="sd-case stakes-case" id="appendix-d001-sdCase">…</div>

<div class="slider-row">
<label>How much rides on being right <span class="val stakes-value" id="appendix-d001-sdVal">low</span></label>
<input type="range" id="appendix-d001-rStakes" min="0" max="100" value="15" aria-label="Stakes" class="stakes-range">
</div>

<button class="errtoggle stakes-error" id="appendix-d001-sdErr" role="switch" aria-checked="false">
<span class="knob"></span>
<span class="lab">Spouse raises the possibility of error <span>"…but banks <em>do</em> sometimes change their hours."</span></span>
</button>

<div class="sd-verdict">
<div class="vstate know stakes-state" id="appendix-d001-sdState">—</div>
<div class="sd-readings">
<div class="r"><b>Contextualism</b><span id="appendix-d001-sdCtx" class="stakes-contextualism"></span></div>
<div class="r"><b>Pragmatic encroachment</b><span id="appendix-d001-sdEnc" class="stakes-encroachment"></span></div>
<div class="r"><b>Invariantism</b><span id="appendix-d001-sdInv" class="stakes-invariantism"></span></div>
</div>
</div>
</div>
<div class="format-alt epub-only print-only">
<p class="ptitle">Print form</p>
<h4>The Bank Cases, as a stakes table</h4>
<table class="alt-table">
<thead><tr><th>Case</th><th>Evidence</th><th>Stakes</th><th>Natural verdict</th><th>What it tests</th></tr></thead>
<tbody>
<tr><td>Low stakes</td><td>You were there two Saturdays ago.</td><td>A minor errand.</td><td>"I know it is open."</td><td>Ordinary standards are easy to meet.</td></tr>
<tr><td>High stakes</td><td>The same memory.</td><td>A mortgage deadline.</td><td>"I had better check."</td><td>Whether practical stakes affect knowledge.</td></tr>
<tr><td>Error raised</td><td>The same memory plus a live doubt.</td><td>Any serious consequence.</td><td>The claim to know weakens.</td><td>Whether context shifts the word or the knower's state.</td></tr>
</tbody>
</table>
</div>
<section>
<p>Three camps, three diagnoses of the same data. <strong>Contextualism</strong> (DeRose; David Lewis, "Elusive Knowledge," 1996; Stewart Cohen, 1988) locates the shift in the <em>word</em>: "knows" is like "tall" or "here" — context-sensitive. Raising the stakes or mentioning error raises the standard a belief must meet for the sentence "S knows" to count as true. Both utterances are correct, in their own conversations. The skeptic is even right in the seminar — he's just jacked the standard sky-high. <strong>Pragmatic encroachment</strong> (Jason Stanley, <em>Knowledge and Practical Interests</em>, 2005; Fantl &amp; McGrath; John Hawthorne, <em>Knowledge and Lotteries</em>, 2004) puts the shift in the <em>knower</em>: what <em>you</em> know genuinely depends on what's practically at stake <em>for you</em>, because knowledge is supposed to be the thing you can act on. High stakes really can deprive you of knowledge you'd have had when it didn't matter — a startling idea, since it lets practical pressure "encroach" on a supposedly purely factual state. <strong>Invariantism</strong> (the traditional holdout) digs in: "knows" means one fixed thing, the standards don't move, and one of your two verdicts is simply mistaken — you either knew all along or never did, and the stakes just changed how <em>willing</em> you were to <em>say</em> so. <span class="chip ok" data-print="agreed"><i></i>that the verdicts shift · agreed</span> <span class="chip bad" data-print="unresolved"><i></i>why they shift · unresolved</span> The data is robust; its explanation is one of the most active fault lines in the field.</p>
</section>
<section>
<p class="sec-eyebrow"><span class="n">§4</span> The pattern behind the patches</p>
<h2>The luck we were really chasing</h2>
<p>Return to the patch wars from the main lesson — no-false-lemmas, sensitivity, safety, virtue. They looked like a grab-bag of clever fixes that each met a nastier counterexample. Step back and they snap into focus: every one was chasing the <em>same ghost</em>. Duncan Pritchard gave it a precise name in <em>Epistemic Luck</em> (Oxford, 2005). The enemy of knowledge is a specific species he calls <em class="term">veritic luck</em>: your belief is true in the actual world, but in <em>almost all the nearby ways things could have gone</em>, you'd have believed the same thing and been wrong. The truth and your believing it are only accidentally in step.</p>
<p>This is the deep content of the "safety" idea, and it's worth <em>seeing</em>. Picture the actual world as a dot, ringed by the nearby possible worlds — the small, realistic variations on how things might have been. A belief is <em class="term">safe</em> (knowledge-grade) when it stays true across that neighborhood, and <em>unsafe</em> (merely lucky) when a slight nudge flips it to false. Toggle the three scenarios below and watch the neighborhood light up.</p>
</section>
<div class="panel web-only modal-rings">
<p class="ptitle">Diagram · the neighborhood of a belief</p>
<h4>Safe vs. Lucky — a modal X-ray</h4>
<p class="pnote">Center dot = the actual world, where your belief is true. Ring = nearby possible worlds, the realistic near-misses. <span style="color:var(--ok)">Green</span> = you'd still be right there; <span style="color:var(--contested)">red</span> = you'd believe it and be wrong. Knowledge needs a green neighborhood.</p>
<div class="mr-wrap">
<div class="mr-btns">
<button class="mr-btn" data-scn="know" aria-pressed="true">Working clock (knowledge)</button>
<button class="mr-btn" data-scn="gettier">Stopped clock (Gettier)</button>
<button class="mr-btn" data-scn="barn">Fake-barn country</button>
</div>
<svg id="appendix-d001-mrSvg" viewBox="0 0 360 300" role="img" aria-label="A central world surrounded by nearby possible worlds, colored by whether the belief stays true.">
<circle cx="180" cy="150" r="118" fill="none" stroke="var(--line)" stroke-width="1" stroke-dasharray="3 5"></circle>
<text x="180" y="22" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" fill="var(--ink-faint)">nearby possible worlds</text>
<g id="appendix-d001-mrSat" class="modal-satellites"></g>
<circle id="appendix-d001-mrCore" cx="180" cy="150" r="24" fill="color-mix(in srgb,var(--ok) 22%,transparent)" stroke="var(--ok)" stroke-width="2.5" class="modal-core"></circle>
<text x="180" y="147" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="var(--ink)">actual</text>
<text x="180" y="159" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="var(--ink)">TRUE</text>
</svg>
<div class="mr-verdict safe modal-verdict" id="appendix-d001-mrVerdict">— safe —</div>
<p class="mr-expl modal-explainer" id="appendix-d001-mrExpl"></p>
</div>
</div>
<div class="format-alt epub-only print-only">
<p class="ptitle">Print form</p>
<h4>Safe vs. Lucky, as nearby-worlds cases</h4>
<table class="alt-table">
<thead><tr><th>Scenario</th><th>Actual world</th><th>Nearby worlds</th><th>Verdict</th></tr></thead>
<tbody>
<tr><td>Working clock</td><td>Your belief is true.</td><td>Small variations still leave you right.</td><td>Safe: knowledge-grade.</td></tr>
<tr><td>Stopped clock</td><td>Your belief is true at 9:12.</td><td>A minute earlier or later, the same belief is false.</td><td>Unsafe: veritic luck.</td></tr>
<tr><td>Fake-barn country</td><td>You see the one real barn.</td><td>Most nearby looks would have landed on facades.</td><td>Unsafe: environmental luck.</td></tr>
</tbody>
</table>
</div>
<section>
<p>That single picture retroactively explains the whole mess. The stopped clock fails <em>hard</em> — a minute either side and you're wrong, so the neighborhood is a sea of red. Fake-barn country is subtler: the barn you're looking at is genuinely there (the core is green), but you're surrounded by façades, so a glance a hundred meters either way would have fooled you — red neighborhood, no knowledge, even with a true justified belief and no false premise. The patches all failed because each tried to capture "green neighborhood" with a slightly different yardstick, and luck kept finding the gaps.</p>
<p>Two more patches the main lesson didn't name, now that we have the frame. <strong>Defeasibility theory</strong> (Lehrer &amp; Paxson, 1969) said knowledge is <em>un-defeated</em> justified true belief: there must be no true fact out there that, if you learned it, would dissolve your justification. It handles many cases elegantly — until the "misleading defeater" twist, where there's a true-but-misleading fact that <em>shouldn't</em> rob you of knowledge but technically does, forcing ever-finer distinctions. And reaching back further, the <strong>causal theory</strong> (Goldman, 1967, before he turned reliabilist) demanded that the fact <em>cause</em> your belief — no causal chain, no knowledge. Beautiful for perception; fatal for mathematics, since the number 7 and the Pythagorean theorem don't cause anything (Paul Benacerraf pressed exactly this "access problem" in 1973). You can't shake hands with an abstract object.</p>
<p>And the deepest crack in reliabilism, which the main lesson only gestured at: the <strong>generality problem</strong> (Conee &amp; Feldman, 1998). Reliabilism says a belief is justified if produced by a <em>reliable process</em> — but <em>which</em> process? Your belief that it's 9:12 was produced by "reading a clock," and also by "reading <em>that</em> clock," and "using vision in dim light," and "trusting instruments on Tuesdays" — each as real as the others, each with a different reliability score. Pick the type and you've picked the verdict. Specifying the "right" grain, in a principled way, has proven stubbornly hard.</p>
<p>Where does Pritchard land? At <em class="term">anti-luck virtue epistemology</em>: knowledge needs <em>both</em> conditions, because they catch different failures. You need <strong>safety</strong> (a green neighborhood — no veritic luck) <em>and</em> you need <strong>aptness</strong> (the belief is true <em>through your own ability</em> — the archer's skill from the main lesson). Neither alone suffices: the stopped clock can fail safety, fake-barn country can have local skill but bad luck. It's not a tidy three-word formula — and that, by now, may be the lesson. Knowledge might just <em>be</em> the kind of thing that takes two independent guarantees, one about you and one about your world.</p>
</section>
<section>
<p class="sec-eyebrow"><span class="n">§5</span> The question under the question</p>
<h2>Why is knowing worth more than just being right?</h2>
<p>Step back from "what is knowledge?" to a question Plato asked first and nobody has fully answered: <em>why do we care?</em> If a true belief gets the job done, what does the extra machinery of knowledge buy you? Plato put it as a traveler's problem in the <em>Meno</em> (~380 BCE). Suppose you want to walk to the town of Larissa. A person who <em>knows</em> the road will get you there. But so will a person who merely has a <em>true belief</em> about the road — who's never been, but happens to be right. For the purpose of arriving, the two are worth exactly the same. So why has the entire tradition prized knowledge above true belief? This is the <em class="term">value problem</em>, and it's a load-bearing question: a theory of knowledge that can't say why knowledge is <em>better</em> has arguably missed the point of the concept.</p>

<figure style="margin:1.8rem auto;max-width:30rem;">
<svg viewBox="0 0 440 170" role="img" aria-label="Two roads from You to Larissa: mere true belief and knowledge, both arriving.">
<text x="40" y="88" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" fill="var(--ink)">YOU</text>
<circle cx="40" cy="95" r="6" fill="var(--ink)"></circle>
<text x="400" y="88" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="11" fill="var(--brass)">LARISSA</text>
<circle cx="400" cy="95" r="6" fill="var(--brass)"></circle>
<path d="M48,92 C150,40 300,40 392,90" fill="none" stroke="var(--hint)" stroke-width="2" stroke-dasharray="2 5"></path>
<path d="M48,98 C150,150 300,150 392,100" fill="none" stroke="var(--accent)" stroke-width="2.5"></path>
<text x="220" y="38" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" fill="var(--hint)">mere true belief — arrives</text>
<text x="220" y="165" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="10.5" fill="var(--accent)">knowledge — also arrives</text>
</svg>
<p class="figcap">If both roads reach Larissa, what is the second one worth?</p>
</figure>

<p>The value problem turns into a precise weapon against one of the main lesson's theories. It's called the <em class="term">swamping problem</em> (Linda Zagzebski, 2003). Reliabilism says knowledge is true belief from a reliable process. But ask <em>what the reliability adds in value</em>. Reliability is good only because it tends to produce truth. So once you <em>already have</em> the truth, what does it add that this particular truth also came from a reliable source? Zagzebski's homely analogy: a cup of good coffee is no <em>better</em> to drink for having come from a reliable coffee machine rather than an unreliable one that happened to produce an identical cup. The good-making feature (deliciousness / truth) is already present; the source's reliability gets <em>swamped</em>, adding nothing. If that's right, reliabilism can't explain why knowledge beats lucky true belief — the very thing a theory of knowledge most needs to deliver.</p>
<p>This is where <strong>virtue epistemology</strong> earns its keep, and where the archer finally pays off. Its answer: knowledge isn't valuable as a <em>better-stocked</em> true belief; it's valuable as an <em class="term">achievement</em> — a success that's <em>yours</em>, that came about <em>through your own competence</em>. And achievements carry a kind of worth that lucky successes never do, the way a bullseye you actually aimed is worth something a lucky gust-blown hit isn't, even though the arrow lands in the same spot. A true belief reached through your own cognitive skill is a <em>cognitive achievement</em>; a lucky true belief is not. That's the extra value — not in the result, but in the <em>getting there</em>. The road to Larissa you can actually find again is worth more than the one you stumbled onto, even on a day you both arrive.</p>
</section>
<section>
<p class="sec-eyebrow"><span class="n">§6</span> The other knowings</p>
<h2>The kinds of knowing we ignored</h2>
<p>Everything so far — the entire main lesson — was about <em class="term">propositional knowledge</em>, knowledge-<em>that</em>: knowing <em>that</em> it's 9:12, <em>that</em> Jones got the job. But look how much of "know" in plain English isn't that at all. You know <em>how</em> to ride a bicycle. You know your mother's face. You know Lisbon. None of these is a stockpile of facts, and philosophers have argued for a century about how they relate.</p>

<figure style="margin:1.8rem auto;">
<svg viewBox="0 0 600 230" role="img" aria-label="A tree dividing knowledge into knowing-that, knowing-how, and knowing-by-acquaintance.">
<rect x="235" y="14" width="130" height="44" rx="9" fill="var(--paper)" stroke="var(--accent)" stroke-width="2"></rect>
<text x="300" y="34" text-anchor="middle" font-family="Fraunces,serif" font-size="14" fill="var(--ink)">"knows"</text>
<text x="300" y="50" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="var(--ink-faint)">the one word</text>
<line x1="300" y1="58" x2="100" y2="96" stroke="var(--line-strong)" stroke-width="1.5"></line>
<line x1="300" y1="58" x2="300" y2="96" stroke="var(--line-strong)" stroke-width="1.5"></line>
<line x1="300" y1="58" x2="500" y2="96" stroke="var(--line-strong)" stroke-width="1.5"></line>
<rect x="30" y="98" width="140" height="50" rx="9" fill="color-mix(in srgb,var(--accent) 10%,transparent)" stroke="var(--line-strong)" stroke-width="1.4"></rect>
<text x="100" y="118" text-anchor="middle" font-family="Fraunces,serif" font-size="13" fill="var(--ink)">knowing-THAT</text>
<text x="100" y="135" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="var(--ink-faint)">propositional</text>
<rect x="230" y="98" width="140" height="50" rx="9" fill="color-mix(in srgb,var(--accent) 10%,transparent)" stroke="var(--line-strong)" stroke-width="1.4"></rect>
<text x="300" y="118" text-anchor="middle" font-family="Fraunces,serif" font-size="13" fill="var(--ink)">knowing-HOW</text>
<text x="300" y="135" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="var(--ink-faint)">procedural / skill</text>
<rect x="430" y="98" width="140" height="50" rx="9" fill="color-mix(in srgb,var(--accent) 10%,transparent)" stroke="var(--line-strong)" stroke-width="1.4"></rect>
<text x="500" y="115" text-anchor="middle" font-family="Fraunces,serif" font-size="13" fill="var(--ink)">knowing-OF</text>
<text x="500" y="132" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9" fill="var(--ink-faint)">by acquaintance</text>
<text x="100" y="178" text-anchor="middle" font-family="Newsreader,serif" font-style="italic" font-size="11.5" fill="var(--ink-soft)">"…that the bank is open"</text>
<text x="300" y="178" text-anchor="middle" font-family="Newsreader,serif" font-style="italic" font-size="11.5" fill="var(--ink-soft)">"…how to ride a bike"</text>
<text x="500" y="178" text-anchor="middle" font-family="Newsreader,serif" font-style="italic" font-size="11.5" fill="var(--ink-soft)">"…that face / this city"</text>
<text x="300" y="212" text-anchor="middle" font-family="IBM Plex Mono,monospace" font-size="9.5" fill="var(--brass)">live debate: is the middle box secretly just the left box?</text>
</svg>
<p class="figcap">One English verb, at least three different relations to the world.</p>
</figure>

<p><strong>Knowing-how.</strong> Gilbert Ryle, in <em>The Concept of Mind</em> (1949), insisted that knowing how to do something is not knowing a set of facts. A brilliant cyclist may be unable to state a single law of balance; a person who has memorized every fact about bicycles may topple on the first try. Worse, Ryle argued, reducing skill to facts triggers a regress: if every skilled act required first <em>knowing the proposition</em> describing the rule, you'd then need the skill of <em>applying</em> that rule, which would need another rule, forever. So skill must be its own kind of knowing. The twist: Jason Stanley and Timothy Williamson fired back in <strong>"Knowing How"</strong> (2001) with <em class="term">intellectualism</em> — the claim that knowing-how just <em>is</em> a species of knowing-that after all (knowing, of some way to ride, <em>that</em> it is a way to ride), dressed in different grammar. Whether skill collapses into propositions is genuinely unsettled. <span class="chip bad" data-print="contested"><i></i>knowing-how reducible? · contested</span></p>
<p><strong>Knowing by acquaintance.</strong> Bertrand Russell (1911) drew a second cut: between knowledge <em>by acquaintance</em> — your direct, unmediated grip on a patch of red you're seeing, a pain you're feeling, a face you're looking at — and knowledge <em>by description</em>, the facts you know <em>about</em> things you've never directly met ("the first person to stand on the Moon," whom you know only as the one satisfying that description). You can know a stupendous amount <em>about</em> Bismarck and never have known <em>him</em>; you know the color red in a way the world's greatest blind physicist, who knows every fact about wavelengths, does not. That gap — facts about an experience versus the experience itself — is a quiet seed for the hardest problem in the entire course, the one waiting on <strong>Day 123</strong>: why there's <em>something it is like</em> to see red at all.</p>
</section>
<section>
<p class="sec-eyebrow"><span class="n">§7</span> The social turn</p>
<h2>Almost everything you know, someone told you</h2>
<p>The main lesson, like most of traditional epistemology, imagined a lone mind facing the world — one person, one clock. But run an audit of what you actually know. That the Earth is about 4.5 billion years old. That Antarctica exists. Your own date of birth. The boiling point of water. You verified essentially none of it first-hand; you were <em>told</em>, by teachers, books, parents, instruments, strangers. <em class="term">Testimony</em> is the overwhelming bulk of any human being's knowledge — and for centuries epistemology treated it as an afterthought.</p>
<p>The central question is whether trusting testimony is something you have to <em>earn</em> or something you're <em>entitled</em> to by default. <strong>David Hume</strong> (1748) took the demanding line: testimony is only as good as your own inductive track record of when testimony has proved reliable — it <em>reduces</em> to evidence you've personally gathered. <strong>Thomas Reid</strong> (1764) found this absurd: no child could bootstrap a track record before trusting anyone, and in fact we're built with a "principle of credulity," a default disposition to believe what we're told, exactly as we're built to trust our senses. On Reid's <em>anti-reductionist</em> view, testimony is a <em>basic</em> source of knowledge, not a derived one — and it has to be, or knowledge couldn't get off the ground in a social animal. The modern field mostly agrees that some default trust is unavoidable; the fights are over how much, and when it's defeated.</p>
<p>Two newer rooms branch off this one, and both matter enormously in 2026. The first is <strong>disagreement</strong>. When someone you regard as an <em>epistemic peer</em> — as smart, as informed, as careful as you — looks at the same evidence and concludes the opposite, what should you do? The <em class="term">conciliationist</em> or "equal-weight" view (Adam Elga, <em>Noûs</em>, 2007; David Christensen, 2007) argues you should move substantially toward them: to stay put is to claim, with no independent reason, that <em>you're</em> the one who got it right and they made the mistake. The <em>steadfast</em> view answers that sometimes you can rationally hold your ground, because your own reasoning is evidence too. It sounds abstract until you notice it's the whole epistemology of echo chambers, expert consensus, and what to do when half your sources contradict the other half. <span class="chip bad" data-print="debate"><i></i>equal-weight view · live debate</span></p>
<p>The second is sharper still: <strong>epistemic injustice</strong>, named by Miranda Fricker (<em>Epistemic Injustice: Power and the Ethics of Knowing</em>, 2007). Because so much knowing runs on testimony, <em>who gets believed</em> becomes an ethical question, not just an epistemic one. Fricker isolates two wrongs. <em class="term">Testimonial injustice</em>: a speaker's word is given less credence than it deserves because of prejudice about who they are — the patient whose pain is dismissed, the witness disbelieved for their accent or gender. <em class="term">Hermeneutical injustice</em>: subtler and deeper — a person can't even make sense of their own experience, to themselves or others, because the surrounding culture hasn't yet developed the <em>concept</em> for it (her example: the experience we now call sexual harassment, suffered by people who had no word for it and so couldn't name the wrong). Knowledge, it turns out, has a politics: the tools for understanding are unevenly distributed, and that unevenness can itself be an injustice.</p>

<div class="aside">
<p class="h">The function-first escape hatch</p>
<p>There's a radical way to end the whole 180-page hunt for a definition, and it threads the social turn back to the start. Edward Craig, in <em>Knowledge and the State of Nature</em> (1990), proposed: stop asking <em>"what is knowledge?"</em> and ask <em>"what is the concept FOR — why would creatures like us ever invent it?"</em> His answer: a social, language-using species desperately needs a way to flag <strong>good informants</strong> — to mark out whose word you can act on. "Knowledge" is the tag we evolved to pin on reliable sources of true information. That instantly explains the things the analyses struggled with: why knowledge must be <em>true</em> (a tip that's false is worthless), why <em>luck</em> disqualifies (you can't rely on a fluke next time), and why we care at all (survival in a world where most of what you need to know, you must get from others). It rhymes with Williamson's "stop trying to define it," and it cashes out the main lesson's open question — did <em>evolution</em> install the instinct that luck-based knowing doesn't count? Craig's answer is essentially: yes, and here's why it would.</p>
</div>
</section>
<section>
<p class="sec-eyebrow"><span class="n">§8</span> The formal edge</p>
<h2>Two more frontiers, beyond Bayes</h2>
<p>The main lesson's formal frontier was Bayesian credence. Two further formal ideas deserve a place on the map, because both bite ordinary intuitions and both feed straight into computer science and AI.</p>
<p><strong>The logic of knowing.</strong> Jaakko Hintikka, in <em>Knowledge and Belief</em> (1962), treated "knows" as a formal operator you can reason with, like "necessarily" — launching <em class="term">epistemic logic</em>, now a workhorse in computer science (reasoning about what distributed agents and AI systems "know"). It immediately surfaces deep puzzles. The <em class="term">KK principle</em>: if you know <em>p</em>, do you thereby know <em>that you know</em> <em>p</em>? Tempting, but Williamson (from the main lesson) argues it's false — you can know something without being in a position to know that you know it, because knowledge has blurry margins. And <em>logical omniscience</em>: the clean logic implies that if you know some axioms, you know <em>every</em> logical consequence of them — which would make every mathematician instantly aware of every theorem. Obviously false for real, bounded minds, and a central headache for modeling actual reasoners (and machines).</p>
<p><strong>The preface paradox.</strong> A companion to the lottery paradox from the main lesson, and arguably nastier. You write a long, careful book. For <em>each</em> claim in it, you've checked your work and rationally believe it's true. Yet you also write, sincerely, in the preface: "no doubt errors remain, and they are mine alone" — because you know that across hundreds of claims, you've almost certainly slipped <em>somewhere</em>. So you rationally believe each individual claim, and <em>also</em> rationally believe that <em>at least one of them is false</em> (David Makinson, "The Paradox of the Preface," 1965). Those can't all be true together. The moral lands on the main lesson's open question with full force: ordinary all-or-nothing belief isn't <em>closed under conjunction</em> — believing each of many things doesn't license believing their grand conjunction — which is one more reason the field keeps drifting from yes/no belief toward graded credence. The dial, again, doing what the switch can't.</p>
</section>
<div class="recap">
<p class="h">◆ The appendix in three sentences</p>
<dl>
<div><dt>Big idea</dt><dd>The main lesson made knowledge look like one tidy puzzle — find the fourth condition — but it's really a constellation: whether certainty is required (and the skeptic that demand invites), whether "knows" even holds still as stakes change, what knowledge is <em>worth</em> over mere true belief, and the fact that almost all of it comes from <em>other people</em>.</dd></div>
<div><dt>Best new analogy</dt><dd>The neighborhood of nearby possible worlds: knowledge is a belief whose neighborhood stays green (safe), while luck is a belief one nudge from red — and the road to Larissa you can find <em>again</em> is worth more than the one you stumbled onto, even when both arrive.</dd></div>
<div><dt>Live controversy</dt><dd>Why the Bank-Case verdict flips — context shifting the <em>word</em> "knows" (contextualism), stakes shifting what the <em>knower</em> knows (pragmatic encroachment), or neither (invariantism) — is among the field's hottest open fault lines, alongside whether closure can be denied and whether knowing-how is secretly knowing-that.</dd></div>
</dl>
<p class="threads"><b>Threads here ›</b> information (testimony &amp; the social transmission of knowledge; preface/credence) · computation (epistemic logic; modal "neighborhoods" of worlds) · evolution (Craig: the concept of knowledge as a good-informant detector built for a social species) — picking up the same five we're tracking all 180 days.</p>
</div>
<section>
<p class="sec-eyebrow">Open questions</p>
<h2>What this appendix leaves unsettled</h2>
<ul>
<li><strong>Certainty or not?</strong> Is the infallibilist right that real knowledge needs error-proof reasons (inviting skepticism) — or is fallible knowledge the only kind worth wanting?</li>
<li><strong>Can closure be denied without disaster?</strong> Dretske and Nozick block the skeptic by giving it up; the cost elsewhere is still being counted.</li>
<li><strong>Does "knows" move?</strong> Context-sensitive, stakes-sensitive, or fixed — and if it moves, what exactly is moving, the word or the world?</li>
<li><strong>Can the value of knowledge be explained at all</strong>, or does every account leave knowledge looking no better than lucky true belief?</li>
<li><strong>Is knowing-how just knowing-that</strong> in disguise, or its own irreducible kind of grip on the world?</li>
<li><strong>Is testimony basic or earned?</strong> — and, downstream, when a peer disagrees, must you really meet them halfway?</li>
<li><strong>And the function-first wager:</strong> if the concept of knowledge exists to flag good informants, does that <em>dissolve</em> the analysis project — or just relocate it?</li>
</ul>
</section>

<hr class="div">
<section class="sources">
<p class="sec-eyebrow">Sources</p>
<h2>Sources &amp; further reading</h2>
<p>Classical works are cited by original date; all are standard, widely available editions. Verified secondary anchors and reference entries are linked.</p>
<ol>
<li>Descartes, R. (1641). <em>Meditations on First Philosophy.</em> <span class="meta">— methodic doubt, the evil demon, and the cogito as the one indubitable point.</span></li>
<li>Unger, P. (1975). <em>Ignorance: A Case for Scepticism.</em> Oxford University Press. <span class="meta">— infallibilism pushed to its skeptical conclusion ("knows," like "flat," applies to almost nothing).</span></li>
<li>Moore, G. E. (1939). "Proof of an External World." <em>Proceedings of the British Academy</em> 25: 273–300. <span class="meta">— "Here is one hand": running the skeptical argument in reverse.</span></li>
<li>Dretske, F. (1970). "Epistemic Operators." <em>Journal of Philosophy</em> 67(24): 1007–1023. <span class="meta">— denying closure; the relevant-alternatives view; the zebra/painted-mule case.</span></li>
<li>Nozick, R. (1981). <em>Philosophical Explanations.</em> Harvard University Press. <span class="meta">— sensitivity / truth-tracking and its own denial of closure.</span></li>
<li>Putnam, H. (1981). <em>Reason, Truth and History.</em> Cambridge University Press. <span class="meta">— the brain-in-a-vat, and the semantic-externalist argument that "I am a BIV" is self-refuting.</span></li>
<li>Bostrom, N. (2003). "Are You Living in a Computer Simulation?" <em>Philosophical Quarterly</em> 53(211): 243–255. <a href="https://www.simulation-argument.com/simulation.html">simulation-argument.com</a></li>
<li>Chalmers, D. J. (2022). <em>Reality+: Virtual Worlds and the Problems of Philosophy.</em> W. W. Norton / Allen Lane. <span class="meta">— "virtual reality is genuine reality"; simulation realism. <a href="https://consc.net/reality/">consc.net/reality</a></span></li>
<li>DeRose, K. (1992). "Contextualism and Knowledge Attributions." <em>Philosophy and Phenomenological Research</em> 52(4): 913–929. <span class="meta">— the Bank Cases.</span> See also DeRose (1995), "Solving the Skeptical Puzzle," <em>Philosophical Review</em> 104(1): 1–52.</li>
<li>Lewis, D. (1996). "Elusive Knowledge." <em>Australasian Journal of Philosophy</em> 74(4): 549–567. <span class="meta">— contextualism and the rule of attention.</span></li>
<li>Cohen, S. (1988). "How to Be a Fallibilist." <em>Philosophical Perspectives</em> 2: 91–123. <span class="meta">— the airport cases.</span></li>
<li>Stanley, J. (2005). <em>Knowledge and Practical Interests.</em> Oxford University Press. <span class="meta">— pragmatic encroachment / interest-relative invariantism.</span> See also Hawthorne, J. (2004), <em>Knowledge and Lotteries</em> (OUP); Fantl, J. &amp; McGrath, M. (2009), <em>Knowledge in an Uncertain World</em> (OUP).</li>
<li>Pritchard, D. (2005). <em>Epistemic Luck.</em> Oxford University Press. <span class="meta">— the modal account of luck; veritic luck; the safety condition; later, anti-luck virtue epistemology.</span> Overview: <a href="https://iep.utm.edu/epi-luck/">IEP, "Epistemic Luck."</a></li>
<li>Lehrer, K. &amp; Paxson, T. (1969). "Knowledge: Undefeated Justified True Belief." <em>Journal of Philosophy</em> 66(8): 225–237. <span class="meta">— the defeasibility analysis.</span></li>
<li>Goldman, A. (1967). "A Causal Theory of Knowing." <em>Journal of Philosophy</em> 64(12): 357–372. <span class="meta">— and Benacerraf, P. (1973), "Mathematical Truth," <em>J. Phil.</em> 70(19): 661–679, on why it fails for abstract objects.</span></li>
<li>Conee, E. &amp; Feldman, R. (1998). "The Generality Problem for Reliabilism." <em>Philosophical Studies</em> 89(1): 1–29.</li>
<li>Plato. <em>Meno</em> (~380 BCE). <span class="meta">— the road to Larissa; the value problem (knowledge vs. true belief).</span></li>
<li>Zagzebski, L. (2003). "The Search for the Source of Epistemic Good." <em>Metaphilosophy</em> 34(1–2): 12–28. <span class="meta">— the swamping problem.</span> See also Kvanvig, J. (2003), <em>The Value of Knowledge and the Pursuit of Understanding</em> (Cambridge UP).</li>
<li>Ryle, G. (1949). <em>The Concept of Mind.</em> University of Chicago Press. <span class="meta">— knowing-how vs. knowing-that; the regress of rules.</span></li>
<li>Stanley, J. &amp; Williamson, T. (2001). "Knowing How." <em>Journal of Philosophy</em> 98(8): 411–444. <span class="meta">— intellectualism: knowing-how as a species of knowing-that.</span></li>
<li>Russell, B. (1910–11). "Knowledge by Acquaintance and Knowledge by Description." <em>Proceedings of the Aristotelian Society</em> 11: 108–128.</li>
<li>Hume, D. (1748). <em>An Enquiry Concerning Human Understanding</em>, §X. <span class="meta">— the reductionist view of testimony.</span> Reid, T. (1764). <em>An Inquiry into the Human Mind on the Principles of Common Sense.</em> <span class="meta">— testimony as a basic source (anti-reductionism).</span></li>
<li>Elga, A. (2007). "Reflection and Disagreement." <em>Noûs</em> 41(3): 478–502. <span class="meta">doi:10.1111/j.1468-0068.2007.00656.x.</span> And Christensen, D. (2007), "Epistemology of Disagreement: The Good News," <em>Philosophical Review</em> 116(2): 187–217.</li>
<li>Fricker, M. (2007). <em>Epistemic Injustice: Power and the Ethics of Knowing.</em> Oxford University Press. <span class="meta">— testimonial and hermeneutical injustice.</span></li>
<li>Craig, E. (1990). <em>Knowledge and the State of Nature: An Essay in Conceptual Synthesis.</em> Oxford University Press. <span class="meta">— the function-first / good-informant genealogy of the concept.</span></li>
<li>Hintikka, J. (1962). <em>Knowledge and Belief: An Introduction to the Logic of the Two Notions.</em> Cornell University Press. <span class="meta">— epistemic logic; the KK principle; logical omniscience.</span></li>
<li>Makinson, D. C. (1965). "The Paradox of the Preface." <em>Analysis</em> 25(6): 205–207.</li>
<li>Reference surveys: <em>Stanford Encyclopedia of Philosophy</em> — <a href="https://plato.stanford.edu/entries/skepticism/">"Skepticism,"</a> <a href="https://plato.stanford.edu/entries/contextualism-epistemology/">"Epistemic Contextualism,"</a> <a href="https://plato.stanford.edu/entries/knowledge-value/">"The Value of Knowledge,"</a> <a href="https://plato.stanford.edu/entries/testimony-episprob/">"Epistemological Problems of Testimony,"</a> <a href="https://plato.stanford.edu/entries/epistemic-injustice/">"Epistemic Injustice."</a></li>
</ol>
</section>
</div>
</details>
<!-- deep-dive:end -->

<div class="tomorrow">
<p class="h">Tomorrow <span class="arrow">→</span> Day 02</p>
<h3><a href="/days/002-scientific-method-and-demarcation/">The Scientific Method &amp; Demarcation</a></h3>
<p>Today we asked when a <em>single</em> belief counts as knowledge. Tomorrow we scale the question up to an entire institution: how does science decide which claims even get to enter the arena? Popper's demand that a real theory be <em>falsifiable</em>, Kuhn's paradigm shifts, Lakatos's research programmes — and the modern replication crisis as the demarcation line tested under live fire. Bring today's calibration instinct; you'll need it.</p>
</div>

<hr class="div">

<section class="sources">
<p class="sec-eyebrow">Sources</p>
<h2>Sources &amp; further reading</h2>
<ol>
<li>Gettier, E. L. (1963). "Is Justified True Belief Knowledge?" <em>Analysis</em> 23(6): 121–123. <span class="meta">doi:10.1093/analys/23.6.121.</span> <a href="https://doi.org/10.1093/analys/23.6.121">doi.org/10.1093/analys/23.6.121</a></li>
<li>Ichikawa, J. J. &amp; Steup, M. "The Analysis of Knowledge." <em>Stanford Encyclopedia of Philosophy</em> (rev. 2018). <a href="https://plato.stanford.edu/entries/knowledge-analysis/">plato.stanford.edu/entries/knowledge-analysis</a> <span class="meta">— JTB, the Gettier cases, safety/sensitivity, and the knowledge-first turn.</span></li>
<li>"Gettier problem." <em>Wikipedia</em> (accessed 2026). <a href="https://en.wikipedia.org/wiki/Gettier_problem">en.wikipedia.org/wiki/Gettier_problem</a> <span class="meta">— precedents in Russell (1948), Dharmottara (~770 CE), and Gaṅgeśa (14th c.).</span></li>
<li>Russell, B. (1948). <em>Human Knowledge: Its Scope and Limits.</em> London: Allen &amp; Unwin. <span class="meta">— the stopped-clock case (pp. ~170–171).</span></li>
<li>Goldman, A. (1976). "Discrimination and Perceptual Knowledge." <em>Journal of Philosophy</em> 73(20): 771–791. <span class="meta">— the fake-barn case; reliabilism.</span></li>
<li>Nozick, R. (1981). <em>Philosophical Explanations.</em> Harvard University Press. <span class="meta">— truth-tracking / sensitivity.</span></li>
<li>Sosa, E. (1999). "How to Defeat Opposition to Moore." <em>Philosophical Perspectives</em> 13: 141–153. <span class="meta">— the safety condition.</span> See also Sosa (2007), <em>A Virtue Epistemology</em> (apt belief).</li>
<li>Zagzebski, L. (1994). "The Inescapability of Gettier Problems." <em>The Philosophical Quarterly</em> 44(174): 65–73. <span class="meta">— the recipe defeating any luck-excluding fix.</span></li>
<li>Williamson, T. (2000). <em>Knowledge and Its Limits.</em> Oxford University Press. <a href="https://en.wikipedia.org/wiki/Knowledge_and_Its_Limits">overview</a> <span class="meta">— knowledge-first epistemology; knowledge as the most general factive mental state.</span></li>
<li>Weinberg, J. M., Nichols, S. &amp; Stich, S. (2001). "Normativity and Epistemic Intuitions." <em>Philosophical Topics</em> 29(1–2): 429–460. <span class="meta">— the founding (later contested) cross-cultural x-phi study.</span></li>
<li>Machery, E., Stich, S., Rose, D., Chatterjee, A., Karasawa, K., Struchiner, N., Sirker, S., Usui, N. &amp; Hashimoto, T. (2017). "Gettier Across Cultures." <em>Noûs</em> 51(3): 645–664. <span class="meta">doi:10.1111/nous.12110.</span> <a href="https://doi.org/10.1111/nous.12110">doi.org/10.1111/nous.12110</a></li>
<li>Kim, M. &amp; Yuan, Y. (2015). "No cross-cultural differences in the Gettier car case intuition: A replication study of Weinberg et al. 2001." <em>Episteme</em>. <a href="https://philpapers.org/rec/KIMNCD">philpapers.org/rec/KIMNCD</a></li>
<li>Weisberg, J. "Bayesian Epistemology." <em>Stanford Encyclopedia of Philosophy.</em> <a href="https://plato.stanford.edu/entries/epistemology-bayesian/">plato.stanford.edu/entries/epistemology-bayesian</a> <span class="meta">— credences, conditionalization, and the Dutch book argument (Ramsey 1926; de Finetti 1937).</span></li>
<li>Clark, A. (2013). "Whatever next? Predictive brains, situated agents, and the future of cognitive science." <em>Behavioral and Brain Sciences</em> 36(3): 181–204. See also Clark, <em>Surfing Uncertainty</em> (OUP, 2016).</li>
<li>Friston, K. (2010). "The free-energy principle: a unified brain theory?" <em>Nature Reviews Neuroscience</em> 11(2): 127–138. <span class="meta">doi:10.1038/nrn2787.</span> <a href="https://doi.org/10.1038/nrn2787">doi.org/10.1038/nrn2787</a></li>
<li>Hohwy, J. (2013). <em>The Predictive Mind.</em> Oxford University Press.</li>
</ol>
</section>

<p class="endcap">End of Day 01 · <span class="gleam">179 descents remain</span></p>

</div>
