import { readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import matter from "gray-matter";

const [source, dayRaw] = process.argv.slice(2);
if (!source || !dayRaw) {
  console.error("Usage: node scripts/import-appendix-from-html.mjs SOURCE DAY");
  process.exit(1);
}

const day = Number(dayRaw);
const dayFile = await findDayFile(day);
const routeSource = await readFile(dayFile, "utf8");
const parsed = matter(routeSource);
const contentFile = dayContentFile(parsed);
const originalContent = contentFile ? await readFile(contentFile, "utf8") : parsed.content;
const html = normalizeSvgTextEmphasis(await readFile(source, "utf8"));
const $ = cheerio.load(html, { decodeEntities: false });
const header = $("header.hero").first();
const wrap = $("body > div.wrap").first();
const neededScripts = new Set();

if (!header.length || !wrap.length) {
  throw new Error(`Could not find appendix hero/wrap content in ${source}`);
}

const title = cleanText(header.find("h1").first().text()) || "The Rest of the Map";
const subtitle = cleanText(header.find(".sub").first().text());
const appendixId = slugify(title) || "rest-of-the-map";
const idPrefix = `appendix-d${String(day).padStart(3, "0")}-${appendixId}-`;
const ledeHtml = htmlFrom(header.find(".lede").first());
const wrapHtml = wrap.children().map((_, child) => $.html(child)).get().join("\n");
const fragment = cheerio.load(`<root>${[ledeHtml, wrapHtml].filter(Boolean).join("\n")}</root>`, { decodeEntities: false }, false);
const root = fragment("root");

root.find(".tomorrow,.endcap").remove();
root.find(".sources .sec-eyebrow").each((_, el) => {
  const node = fragment(el);
  const label = cleanText(node.text());
  if (label === "Receipts") node.text("Sources");
  else if (label.startsWith("Receipts ")) node.text(label.replace(/^Receipts/, "Sources"));
});
root.find("[style]").each((_, el) => {
  const node = fragment(el);
  const style = node.attr("style") || "";
  if (/^font-size:\.95em;?$/.test(style.replace(/\s/g, ""))) node.removeAttr("style");
});

root.find(".panel").each((_, panel) => {
  const el = fragment(panel);
  if (el.find("[id='cmArg']").length) {
    el.addClass("web-only cm-machine");
    neededScripts.add("/assets/js/interactions/closure-machine.js");
    addClassById(fragment, "cmP1", "cm-p1");
    addClassById(fragment, "cmP2", "cm-p2");
    addClassById(fragment, "cmC", "cm-c");
    addClassById(fragment, "cmOut", "cm-outlet");
    el.after(closureFallback());
  } else if (el.find("[id='rStakes']").length) {
    el.addClass("web-only stakes-dial");
    neededScripts.add("/assets/js/interactions/stakes-dial.js");
    addClassById(fragment, "sdCase", "stakes-case");
    addClassById(fragment, "rStakes", "stakes-range");
    addClassById(fragment, "sdVal", "stakes-value");
    addClassById(fragment, "sdErr", "stakes-error");
    addClassById(fragment, "sdState", "stakes-state");
    addClassById(fragment, "sdCtx", "stakes-contextualism");
    addClassById(fragment, "sdEnc", "stakes-encroachment");
    addClassById(fragment, "sdInv", "stakes-invariantism");
    el.after(stakesFallback());
  } else if (el.find("[id='mrSvg']").length) {
    el.addClass("web-only modal-rings");
    neededScripts.add("/assets/js/interactions/modal-rings.js");
    addClassById(fragment, "mrSat", "modal-satellites");
    addClassById(fragment, "mrCore", "modal-core");
    addClassById(fragment, "mrVerdict", "modal-verdict");
    addClassById(fragment, "mrExpl", "modal-explainer");
    el.after(modalFallback());
  } else if (el.find("[id='echoSvg']").length) {
    el.addClass("web-only echo-chamber");
    neededScripts.add("/assets/js/interactions/echo-chamber.js");
    addClassById(fragment, "echoOutLinks", "echo-out-links");
    addClassById(fragment, "echoExpose", "echo-expose");
    addClassById(fragment, "echoMsg", "echo-message");
    addClassById(fragment, "o1", "echo-out-node");
    addClassById(fragment, "o2", "echo-out-node");
    addClassById(fragment, "o3", "echo-out-node");
    el.after(echoFallback());
  } else if (el.find("[id='accSvg']").length) {
    el.addClass("web-only accuracy-domination");
    neededScripts.add("/assets/js/interactions/accuracy-domination.js");
    addClassById(fragment, "aS", "accuracy-s-value");
    addClassById(fragment, "raS", "accuracy-s-range");
    addClassById(fragment, "aN", "accuracy-n-value");
    addClassById(fragment, "raN", "accuracy-n-range");
    addClassById(fragment, "aLedger", "accuracy-ledger");
    addClassById(fragment, "aLh", "accuracy-ledger-title");
    addClassById(fragment, "aBody", "accuracy-ledger-body");
    addClassById(fragment, "aSnap", "accuracy-snap");
    addClassById(fragment, "accP", "accuracy-point");
    addClassById(fragment, "accStar", "accuracy-star");
    addClassById(fragment, "accConn", "accuracy-connector");
    addClassById(fragment, "accCap", "accuracy-caption");
    addClassById(fragment, "lp1", "accuracy-point-line-s");
    addClassById(fragment, "lp2", "accuracy-point-line-not");
    addClassById(fragment, "ls1", "accuracy-star-line-s");
    addClassById(fragment, "ls2", "accuracy-star-line-not");
    addClassById(fragment, "accSlines", "accuracy-star-lines");
    el.after(accuracyFallback());
  } else if (el.find("[id='fsClaim']").length) {
    el.addClass("web-only fallacy-spotter");
    neededScripts.add("/assets/js/interactions/fallacy-spotter.js");
    addClassById(fragment, "fsScore", "fallacy-score");
    addClassById(fragment, "fsClaim", "fallacy-claim");
    addClassById(fragment, "fsOpts", "fallacy-options");
    addClassById(fragment, "fsExplain", "fallacy-explain");
    addClassById(fragment, "fsNext", "fallacy-next");
    el.after(fallacyFallback());
  } else if (el.find("[id='hfClaim']").length) {
    el.addClass("web-only hype-filter-trainer");
    neededScripts.add("/assets/js/interactions/hype-filter-trainer.js");
    addClassById(fragment, "hfScore", "hype-score");
    addClassById(fragment, "hfTag", "hype-tag");
    addClassById(fragment, "hfClaim", "hype-claim");
    addClassById(fragment, "hfExplain", "hype-explain");
    addClassById(fragment, "hfNext", "hype-next");
    el.find(".hfbtn").addClass("hype-choice");
    el.after(hypeFilterFallback());
  }
});

root.find(".chip").each((_, chip) => {
  const el = fragment(chip);
  if (!el.attr("data-print")) el.attr("data-print", compactChipLabel(el.text()));
});

namespaceIds(fragment, root, idPrefix);

const appendixHtml = [
  `<details class="deep-dive" id="${appendixId}">`,
  `<summary>`,
  `<span class="ptitle">Deep dive appendix</span>`,
  `<span class="deep-dive-title">${escapeHtml(title)}</span>`,
  subtitle ? `<span class="deep-dive-sub">${escapeHtml(subtitle)}</span>` : "",
  `</summary>`,
  `<div class="deep-dive-body">`,
  normalizeSvgWhitespace(normalizeHtmlBlockIndent(root.html().trim())),
  `</div>`,
  `</details>`
].filter(Boolean).join("\n");
const appendixBlock = [
  "<!-- deep-dive:start -->",
  appendixHtml,
  "<!-- deep-dive:end -->"
].join("\n");

const target = upsertAppendix(originalContent, appendixHtml, appendixBlock, appendixId);

if (contentFile) {
  await writeFile(contentFile, target.trimEnd() + "\n");
  await ensureScripts(dayFile, routeSource, [...neededScripts]);
} else {
  const scripts = [...new Set([...(parsed.data.scripts || []), ...neededScripts])];
  await writeFile(dayFile, matter.stringify(target, { ...parsed.data, scripts }));
}

function dayContentFile(parsedDay) {
  if (!parsedDay.data.content_template) return null;
  return path.join("src/_includes", parsedDay.data.content_template);
}

async function ensureScripts(routeFile, sourceText, additions) {
  const missing = additions.filter((script) => {
    const current = matter(sourceText).data.scripts || [];
    return !current.includes(script);
  });
  if (!missing.length) return;

  const match = sourceText.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    const current = matter(sourceText);
    const scripts = [...new Set([...(current.data.scripts || []), ...missing])];
    await writeFile(routeFile, matter.stringify(current.content, { ...current.data, scripts }));
    return;
  }

  const frontmatter = addScriptsToFrontmatter(match[1], missing);
  await writeFile(routeFile, `---\n${frontmatter}\n---\n${match[2]}`);
}

function addScriptsToFrontmatter(frontmatter, additions) {
  const lines = frontmatter.split("\n");
  const scriptsIndex = lines.findIndex((line) => /^scripts:\s*$/.test(line));
  if (scriptsIndex >= 0) {
    let insertAt = scriptsIndex + 1;
    while (insertAt < lines.length && /^\s+-\s+/.test(lines[insertAt])) insertAt++;
    lines.splice(insertAt, 0, ...additions.map((script) => `  - ${script}`));
    return lines.join("\n");
  }

  const block = ["scripts:", ...additions.map((script) => `  - ${script}`)];
  const permalinkIndex = lines.findIndex((line) => /^permalink:/.test(line));
  if (permalinkIndex >= 0) lines.splice(permalinkIndex, 0, ...block);
  else lines.push(...block);
  return lines.join("\n");
}

async function findDayFile(dayNumber) {
  const files = (await readdir("src/days")).filter((file) => file.endsWith(".md"));
  for (const file of files) {
    const full = path.join("src/days", file);
    if (Number(matter.read(full).data.day) === dayNumber) return full;
  }
  throw new Error(`No English day file found for day ${dayNumber}`);
}

function addClassById($root, id, className) {
  const el = $root(`[id='${id}']`);
  if (el.length) el.addClass(className);
}

function namespaceIds($root, rootNode, prefix) {
  const idMap = new Map();
  rootNode.find("[id]").each((_, el) => {
    const node = $root(el);
    const current = node.attr("id");
    if (!current) return;
    const next = `${prefix}${current}`;
    idMap.set(current, next);
    node.attr("id", next);
  });
  if (!idMap.size) return;

  rootNode.find("*").each((_, el) => {
    const attrs = el.attribs || {};
    for (const attr of Object.keys(attrs)) {
      if (attr === "id") continue;
      const original = attrs[attr];
      const updated = replaceIdReferences(original, idMap);
      if (updated !== original) $root(el).attr(attr, updated);
    }
  });
}

function replaceIdReferences(value, idMap) {
  let next = value;
  for (const [oldId, newId] of idMap) {
    next = next
      .replace(new RegExp(`#${escapeRegExp(oldId)}\\b`, "g"), `#${newId}`)
      .replace(new RegExp(`(^|\\s)${escapeRegExp(oldId)}(?=\\s|$)`, "g"), `$1${newId}`);
  }
  return next;
}

function upsertAppendix(content, appendixHtml, appendixBlock, appendixId) {
  const existingDetails = new RegExp(`<details class="deep-dive" id="${escapeRegExp(appendixId)}"[\\s\\S]*?<\\/details>`);
  const markedBlock = /<!-- deep-dive:start -->[\s\S]*?<!-- deep-dive:end -->/;
  const blockMatch = content.match(markedBlock);
  if (blockMatch) {
    const block = blockMatch[0];
    const nextBlock = existingDetails.test(block)
      ? block.replace(existingDetails, appendixHtml)
      : block.replace(/\n?<!-- deep-dive:end -->/, `\n\n${appendixHtml}\n<!-- deep-dive:end -->`);
    return content.replace(block, nextBlock);
  }
  if (content.includes('class="deep-dive"')) {
    if (existingDetails.test(content)) return content.replace(existingDetails, appendixHtml);
    return content.replace(/(<details class="deep-dive"[\s\S]*?<\/details>)/, `<!-- deep-dive:start -->\n$1\n\n${appendixHtml}\n<!-- deep-dive:end -->`);
  }
  return content.replace(/\n<div class="tomorrow">/, `\n${appendixBlock}\n\n<div class="tomorrow">`);
}

function cleanText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function htmlFrom(node) {
  return node.length ? $.html(node) : "";
}

function normalizeHtmlBlockIndent(value) {
  const [front, ...rest] = value.split("\n");
  return [front, ...rest.map((line) => line.replace(/^[ \t]+(?=<)/, ""))].join("\n");
}

function normalizeSvgWhitespace(value) {
  return value.replace(/<svg\b[\s\S]*?<\/svg>/g, (svg) => {
    return svg.split("\n").filter((line) => line.trim()).join("\n");
  });
}

function compactChipLabel(value) {
  const text = value.toLowerCase();
  if (text.includes("unfalsifiable")) return "unfalsifiable";
  if (text.includes("agreed")) return "agreed";
  if (text.includes("unresolved")) return "unresolved";
  if (text.includes("contested")) return "contested";
  if (text.includes("debate")) return "debate";
  if (text.includes("established")) return "established";
  if (text.includes("widely adopted")) return "established";
  if (text.includes("robust")) return "promising";
  if (text.includes("plausible")) return "promising";
  if (text.includes("taken seriously")) return "promising";
  if (text.includes("promising")) return "promising";
  if (text.includes("superseded")) return "superseded";
  return "review";
}

function normalizeSvgTextEmphasis(value) {
  return value.replace(/(<text\b[^>]*>[^<]*)<em>([^<]*)<\/em>([^<]*<\/text>)/g, "$1$2$3");
}

function echoFallback() {
  return `
<div class="format-alt epub-only print-only">
<p class="ptitle">Reference table</p>
<h4>Bubble vs. Chamber, as exposure outcomes</h4>
<table class="alt-table">
<thead><tr><th>Structure</th><th>Outside voices</th><th>Exposure outcome</th><th>Lesson</th></tr></thead>
<tbody>
<tr><td>Epistemic bubble</td><td>Absent, not refuted.</td><td>New sources can connect and puncture the bubble.</td><td>Exposure can work when the problem is missing information.</td></tr>
<tr><td>Echo chamber</td><td>Present but pre-discredited.</td><td>Exposure can reinforce distrust because the chamber predicted hostile outsiders.</td><td>The obvious repair can backfire when distrust is built into the structure.</td></tr>
</tbody>
</table>
</div>`;
}

function accuracyFallback() {
  return `
<div class="format-alt epub-only print-only">
<p class="ptitle">Reference table</p>
<h4>Accuracy domination, as credence geometry</h4>
<table class="alt-table">
<thead><tr><th>Credences</th><th>Sum</th><th>Geometry</th><th>Verdict</th></tr></thead>
<tbody>
<tr><td>P(S)=0.50, P(not-S)=0.50</td><td>1.00</td><td>On the coherence line.</td><td>Undominated: no other credence is closer in every world.</td></tr>
<tr><td>P(S)=0.80, P(not-S)=0.80</td><td>1.60</td><td>Above the coherence line.</td><td>Dominated by a coherent projection closer to both truth-corners.</td></tr>
<tr><td>P(S)=0.20, P(not-S)=0.20</td><td>0.40</td><td>Below the coherence line.</td><td>Dominated by a coherent projection closer to both truth-corners.</td></tr>
</tbody>
</table>
</div>`;
}

function closureFallback() {
  return `
<div class="format-alt epub-only print-only">
<p class="ptitle">Reference table</p>
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
</div>`;
}

function stakesFallback() {
  return `
<div class="format-alt epub-only print-only">
<p class="ptitle">Reference table</p>
<h4>The Bank Cases</h4>
<table class="alt-table">
<thead><tr><th>Case</th><th>Evidence</th><th>Stakes</th><th>Natural verdict</th><th>What it tests</th></tr></thead>
<tbody>
<tr><td>Low stakes</td><td>You were there two Saturdays ago.</td><td>A minor errand.</td><td>"I know it is open."</td><td>Ordinary standards are easy to meet.</td></tr>
<tr><td>High stakes</td><td>The same memory.</td><td>A mortgage deadline.</td><td>"I had better check."</td><td>Whether practical stakes affect knowledge.</td></tr>
<tr><td>Error raised</td><td>The same memory plus a live doubt.</td><td>Any serious consequence.</td><td>The claim to know weakens.</td><td>Whether context shifts the word or the knower's state.</td></tr>
</tbody>
</table>
</div>`;
}

function modalFallback() {
  return `
<div class="format-alt epub-only print-only">
<p class="ptitle">Reference table</p>
<h4>Safe vs. Lucky, as nearby-worlds cases</h4>
<table class="alt-table">
<thead><tr><th>Scenario</th><th>Actual world</th><th>Nearby worlds</th><th>Verdict</th></tr></thead>
<tbody>
<tr><td>Working clock</td><td>Your belief is true.</td><td>Small variations still leave you right.</td><td>Safe: knowledge-grade.</td></tr>
<tr><td>Stopped clock</td><td>Your belief is true at 9:12.</td><td>A minute earlier or later, the same belief is false.</td><td>Unsafe: veritic luck.</td></tr>
<tr><td>Fake-barn country</td><td>You see the one real barn.</td><td>Most nearby looks would have landed on facades.</td><td>Unsafe: environmental luck.</td></tr>
</tbody>
</table>
</div>`;
}

function fallacyFallback() {
  return `
<div class="format-alt epub-only print-only">
<p class="ptitle">Worked exercise</p>
<h4>The Fallacy Spotter, as an answer key</h4>
<table class="alt-table">
<thead><tr><th>Argument shape</th><th>Better name</th><th>Why</th></tr></thead>
<tbody>
<tr><td>Dismiss the climate plan by attacking the speaker's private life.</td><td>Ad hominem</td><td>The personal attack does not test whether the plan is sound.</td></tr>
<tr><td>Offer only total budget cuts or bankruptcy.</td><td>False dilemma</td><td>The argument hides partial options between the two extremes.</td></tr>
<tr><td>Blame a new traffic light for back pain because it came first.</td><td>Post hoc</td><td>Sequence alone is not causation.</td></tr>
<tr><td>Trust the book because the book says it is true.</td><td>Begging the question</td><td>The conclusion is smuggled into the premise.</td></tr>
<tr><td>Infer that a whole city is rude from two people.</td><td>Hasty generalization</td><td>The sample is too thin for the sweeping rule.</td></tr>
</tbody>
</table>
</div>`;
}

function hypeFilterFallback() {
  return `
<div class="format-alt epub-only print-only">
<p class="ptitle">Reference table</p>
<h4>The Hype-Filter Trainer, as a calibration key</h4>
<table class="alt-table">
<thead><tr><th>Claim</th><th>Best tag</th><th>Calibration note</th></tr></thead>
<tbody>
<tr><td>An open 32B Lean prover reaches about 90% on miniF2F.</td><td>Established</td><td>Lean checking makes correctness auditable; the sampling budget still matters.</td></tr>
<tr><td>GPT-5 solved ten previously unsolved Erdos problems.</td><td>Hype</td><td>The contested public version describes literature retrieval, not ten new results.</td></tr>
<tr><td>FunSearch improved the dimension-8 cap-set construction.</td><td>Established</td><td>The construction is published and directly checkable, though it was search rather than insight.</td></tr>
<tr><td>o3 scored over 25% on FrontierMath.</td><td>Hype</td><td>The number is fragile because of benchmark access and later lower independent testing.</td></tr>
<tr><td>Erdos problem #728 was more-or-less autonomously advanced and Lean-checked.</td><td>Promising</td><td>Real and interesting, but still early and with human feedback around the loop.</td></tr>
<tr><td>Altered word-problem failures prove LLMs cannot reason.</td><td>Promising</td><td>The fragility result is real; the universal conclusion remains disputed.</td></tr>
<tr><td>A chain-of-thought transcript faithfully reports the model's actual reasoning.</td><td>Hype</td><td>Evidence suggests explanations can be post-hoc rationalizations.</td></tr>
</tbody>
</table>
</div>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
