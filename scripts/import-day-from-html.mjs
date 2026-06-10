import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";

const [source, dayRaw, slug, title, summary, threadsRaw = "information"] = process.argv.slice(2);
if (!source || !dayRaw || !slug || !title || !summary) {
  console.error("Usage: node scripts/import-day-from-html.mjs SOURCE DAY SLUG TITLE SUMMARY [thread,thread]");
  process.exit(1);
}

const day = Number(dayRaw);
const html = await readFile(source, "utf8");
const $ = cheerio.load(html, { decodeEntities: false });

$(".topbar, script, style, link[rel='preconnect'], link[href*='fonts.googleapis']").remove();

const hero = $("header.hero").first();
const wrap = $("body > div.wrap").first();
if (!hero.length || !wrap.length) {
  throw new Error(`Could not find hero/wrap content in ${source}`);
}

const content = cheerio.load(`<root>${$.html(hero)}${$.html(wrap)}</root>`, { decodeEntities: false }, false);

content(".panel").each((_, panel) => {
  const el = content(panel);
  if (el.find("#sw-b").length) {
    el.addClass("web-only");
    el.after(gettierFallback());
  }
  if (el.find("#rS").length) {
    el.addClass("web-only");
    el.after(credenceFallback());
  }
  if (el.find("#claimlist").length) {
    el.addClass("web-only");
    el.after(demarcationFallback());
  }
});

const dayPath = `${String(day).padStart(3, "0")}-${slug}`;
const frontmatter = [
  "---",
  "layout: layouts/day.njk",
  "tags: day",
  `day: ${day}`,
  `title: "${escapeYaml(title)}"`,
  `summary: "${escapeYaml(summary)}"`,
  "block: Foundations of Knowledge & Reasoning",
  `slug: ${slug}`,
  `day_path: ${dayPath}`,
  `source_file: ${source}`,
  "threads:",
  ...threadsRaw.split(",").map((thread) => `  - ${thread.trim()}`),
  `permalink: /days/${dayPath}/`,
  "---",
  ""
].join("\n");

await mkdir("src/days", { recursive: true });
await writeFile(path.join("src/days", `day-${dayPath}.md`), frontmatter + content("root").html().trim() + "\n");

function escapeYaml(value) {
  return String(value).replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function gettierFallback() {
  return `
<div class="format-alt epub-only print-only">
  <p class="ptitle">Static version</p>
  <h4>The Gettier Machine, as a table</h4>
  <p class="pnote">The live website lets you flip these conditions. In ebook and print form, the key cases are:</p>
  <table class="alt-table">
    <thead><tr><th>Case</th><th>Belief</th><th>Truth</th><th>Justification</th><th>Luck</th><th>Verdict</th></tr></thead>
    <tbody>
      <tr><td>Plain knowing</td><td>Yes</td><td>Yes</td><td>Yes</td><td>No</td><td>Knowledge on the classic view</td></tr>
      <tr><td>Stopped clock</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Not knowledge: truth arrives by coincidence</td></tr>
      <tr><td>Lucky guess</td><td>Yes</td><td>Yes</td><td>No</td><td>Yes</td><td>Not knowledge: no justification</td></tr>
      <tr><td>Confident error</td><td>Yes</td><td>No</td><td>Yes</td><td>No</td><td>Not knowledge: the claim is false</td></tr>
    </tbody>
  </table>
</div>`;
}

function credenceFallback() {
  return `
<div class="format-alt epub-only print-only">
  <p class="ptitle">Static version</p>
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
</div>`;
}

function demarcationFallback() {
  return `
<div class="format-alt epub-only print-only">
  <p class="ptitle">Static version</p>
  <h4>The Demarcation Lab, as a comparison table</h4>
  <table class="alt-table">
    <thead><tr><th>Claim</th><th>Popper</th><th>Kuhn</th><th>Lakatos</th><th>Cluster view</th></tr></thead>
    <tbody>
      <tr><td>Starlight bends by 1.75 arcseconds</td><td>Science</td><td>Science</td><td>Progressive</td><td>Strong scientific profile</td></tr>
      <tr><td>Mercury retrograde disrupts communication</td><td>Not science</td><td>Not mature science</td><td>Degenerating</td><td>Weak profile</td></tr>
      <tr><td>Class struggle drives history</td><td>Often unfalsifiable as used</td><td>It depends</td><td>Can degenerate</td><td>Mixed social science and philosophy</td></tr>
      <tr><td>String theory</td><td>Not yet testable in key forms</td><td>Normal science without decisive tests</td><td>Open question</td><td>Live border case</td></tr>
      <tr><td>Common descent</td><td>Falsifiable</td><td>Central biological paradigm</td><td>Progressive</td><td>Strong scientific profile</td></tr>
    </tbody>
  </table>
</div>`;
}

