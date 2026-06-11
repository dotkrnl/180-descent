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
const original = await readFile(dayFile, "utf8");
const parsed = matter(original);
const html = await readFile(source, "utf8");
const $ = cheerio.load(html, { decodeEntities: false });
const header = $("header.hero").first();
const wrap = $("body > div.wrap").first();

if (!header.length || !wrap.length) {
  throw new Error(`Could not find appendix hero/wrap content in ${source}`);
}

const title = cleanText(header.find("h1").first().text()) || "The Rest of the Map";
const subtitle = cleanText(header.find(".sub").first().text());
const ledeHtml = htmlFrom(header.find(".lede").first());
const wrapHtml = wrap.children().map((_, child) => $.html(child)).get().join("\n");
const fragment = cheerio.load(`<root>${[ledeHtml, wrapHtml].filter(Boolean).join("\n")}</root>`, { decodeEntities: false }, false);
const root = fragment("root");

root.find(".tomorrow,.endcap").remove();
root.find(".sources .sec-eyebrow").each((_, el) => {
  const node = fragment(el);
  if (cleanText(node.text()) === "Receipts") node.text("Sources");
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
    addClassById(fragment, "cmP1", "cm-p1");
    addClassById(fragment, "cmP2", "cm-p2");
    addClassById(fragment, "cmC", "cm-c");
    addClassById(fragment, "cmOut", "cm-outlet");
    el.after(closureFallback());
  } else if (el.find("[id='rStakes']").length) {
    el.addClass("web-only stakes-dial");
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
    addClassById(fragment, "mrSat", "modal-satellites");
    addClassById(fragment, "mrCore", "modal-core");
    addClassById(fragment, "mrVerdict", "modal-verdict");
    addClassById(fragment, "mrExpl", "modal-explainer");
    el.after(modalFallback());
  }
});

root.find(".chip").each((_, chip) => {
  const el = fragment(chip);
  if (!el.attr("data-print")) el.attr("data-print", compactChipLabel(el.text()));
});

root.find("[id]").each((_, el) => {
  const node = fragment(el);
  node.attr("id", `appendix-d${String(day).padStart(3, "0")}-${node.attr("id")}`);
});

const appendixHtml = [
  `<details class="deep-dive" id="rest-of-the-map">`,
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

const target = parsed.content.includes("<!-- deep-dive:start -->")
  ? parsed.content.replace(/<!-- deep-dive:start -->[\s\S]*?<!-- deep-dive:end -->/, appendixBlock)
  : parsed.content.includes('class="deep-dive"')
    ? parsed.content.replace(/<details class="deep-dive"[\s\S]*?<\/details>/, appendixBlock)
    : parsed.content.replace(/\n<div class="tomorrow">/, `\n${appendixBlock}\n\n<div class="tomorrow">`);

await writeFile(dayFile, matter.stringify(target, parsed.data));

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
  if (text.includes("promising")) return "promising";
  if (text.includes("superseded")) return "superseded";
  return "review";
}

function closureFallback() {
  return `
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
</div>`;
}

function stakesFallback() {
  return `
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
</div>`;
}

function modalFallback() {
  return `
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
</div>`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
