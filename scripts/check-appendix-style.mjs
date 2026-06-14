import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";

const includeRoot = "src/_includes/days";
const cssFiles = ["src/assets/css/book.css"];
const jsRoot = "src/assets/js/interactions";

const forbiddenClasses = new Map([
  ["movement", "Use <section> with .sec-eyebrow instead of appendix-local section wrappers."],
  ["mv-num", "Use .sec-eyebrow .n for numbered appendix labels."],
  ["dispatch", "Use <section> with .sec-eyebrow instead of appendix-local dispatch wrappers."],
  ["dp-num", "Use .sec-eyebrow .n for dispatch labels."],
  ["cards", "Use .appendix-card-grid for appendix card groups."],
  ["card", "Use .appendix-card for appendix cards; generic .card has no shared owner."],
  ["tl", "Use .appendix-timeline for appendix timelines."],
  ["ttable", "Use .alt-table unless a shared table component is added."],
  ["warnstrip", "Use .aside or a named shared callout component."]
]);

const allowedStateClasses = new Set([
  "dim",
  "open",
  "hype",
  "real",
  "hint",
  "ok",
  "bad",
  "safe",
  "unsafe",
  "struck",
  "concl",
  "chosen-ok",
  "chosen-hint",
  "chosen-bad",
  "correct",
  "wrong",
  "right"
]);

const allowedMarkerClasses = new Set([
  "base-rate-engine",
  "chiprow",
  "corner",
  "frontier",
  "grue-machine"
]);

const errors = [];
const cssClasses = await collectCssClasses();
const jsClasses = await collectJsClasses();
const includeFiles = await collectIncludeFiles(includeRoot);

for (const file of includeFiles) {
  const content = await readFile(file, "utf8");
  checkDeepDiveWrap(file, content);
  const blocks = deepDiveBlocks(content, file);
  for (const block of blocks) checkBlock(file, block);
}

if (errors.length) {
  console.error("Appendix style check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Appendix style check passed for ${includeFiles.length} include files.`);

async function collectCssClasses() {
  const out = new Set();
  for (const file of cssFiles) {
    const css = await readFile(file, "utf8");
    for (const match of css.matchAll(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g)) {
      out.add(match[1]);
    }
  }
  return out;
}

async function collectJsClasses() {
  const out = new Set();
  for (const file of await collectFiles(jsRoot, ".js")) {
    const js = await readFile(file, "utf8");
    for (const match of js.matchAll(/querySelector(?:All)?\(\s*["'`]([^"'`]+)["'`]\s*\)/g)) {
      for (const selectorMatch of match[1].matchAll(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g)) {
        out.add(selectorMatch[1]);
      }
    }
    for (const match of js.matchAll(/className\s*=\s*["'`]([^"'`]+)["'`]/g)) {
      for (const className of match[1].split(/\s+/)) {
        if (className && !className.includes("$")) out.add(className);
      }
    }
  }
  return out;
}

async function collectIncludeFiles(root) {
  return (await collectFiles(root, ".njk")).sort();
}

async function collectFiles(dir, ext) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(full, ext));
    else if (entry.name.endsWith(ext)) files.push(full);
  }
  return files;
}

function deepDiveBlocks(content, file) {
  const blocks = [];
  let searchFrom = 0;
  while (true) {
    const start = content.indexOf("<!-- deep-dive:start -->", searchFrom);
    if (start < 0) break;
    const end = content.indexOf("<!-- deep-dive:end -->", start);
    if (end < 0) {
      errors.push(`${file}: missing <!-- deep-dive:end --> marker`);
      blocks.push(content.slice(start));
      break;
    }
    blocks.push(content.slice(start, end));
    searchFrom = end + "<!-- deep-dive:end -->".length;
  }
  return blocks;
}

function checkBlock(file, block) {
  if (!/<details\s+class="deep-dive"[\s>]/.test(block)) {
    errors.push(`${file}: deep-dive block has no <details class="deep-dive"> shell`);
  }
  if (!/<summary>[\s\S]*class="ptitle"[\s\S]*class="deep-dive-title"[\s\S]*class="deep-dive-sub"[\s\S]*<\/summary>/.test(block)) {
    errors.push(`${file}: deep-dive summary is missing the standard title/subtitle structure`);
  }
  if (!/<div\s+class="deep-dive-body">/.test(block)) {
    errors.push(`${file}: deep-dive block has no .deep-dive-body wrapper`);
  }
  if (/<br\s*\/?>\s*<blockquote\b/i.test(block)) {
    errors.push(`${file}: raw <br> used as spacing before a blockquote inside an appendix`);
  }

  for (const className of classNames(block)) {
    const forbidden = forbiddenClasses.get(className);
    if (forbidden) {
      errors.push(`${file}: forbidden appendix class "${className}". ${forbidden}`);
      continue;
    }
    if (
      cssClasses.has(className) ||
      jsClasses.has(className) ||
      allowedStateClasses.has(className) ||
      allowedMarkerClasses.has(className)
    ) continue;
    errors.push(`${file}: appendix class "${className}" has no shared CSS rule or JS owner`);
  }
}

function checkDeepDiveWrap(file, content) {
  if (!content.includes("<!-- deep-dive:start -->")) return;

  const $ = load(content, { decodeEntities: false }, false);
  const allDetails = $("details.deep-dive").length;
  if (!allDetails) return;

  const wrappedDetails = $("div.wrap details.deep-dive").length;
  if (wrappedDetails !== allDetails) {
    errors.push(`${file}: ${allDetails - wrappedDetails} deep-dive section(s) outside the standard .wrap content container`);
  }
}

function classNames(block) {
  const out = new Set();
  for (const match of block.matchAll(/class="([^"]+)"/g)) {
    for (const className of match[1].trim().split(/\s+/)) {
      if (className) out.add(className);
    }
  }
  return out;
}
