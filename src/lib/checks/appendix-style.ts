import { readFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import { pathExists, walkFiles } from "@lib/fs";

export interface AppendixStyleCheckOptions {
  root: string;
  includeRoot?: string;
  cssFiles?: string[];
  jsRoot?: string;
}

export interface AppendixStyleCheckResult {
  checkedIncludeFiles: number;
  errors: string[];
}

const FORBIDDEN_CLASSES = new Map([
  ["movement", "Use <section> with .sec-eyebrow instead of appendix-local section wrappers."],
  ["mv-num", "Use .sec-eyebrow .n for numbered appendix labels."],
  ["dispatch", "Use <section> with .sec-eyebrow instead of appendix-local dispatch wrappers."],
  ["dp-num", "Use .sec-eyebrow .n for dispatch labels."],
  ["cards", "Use .appendix-card-grid for appendix card groups."],
  ["card", "Use .appendix-card for appendix cards; generic .card has no shared owner."],
  ["tl", "Use .appendix-timeline for appendix timelines."],
  ["ttable", "Use .alt-table unless a shared table component is added."],
  ["warnstrip", "Use .aside or a named shared callout component."],
  ["whereblock", "Use .continues for appendix continuation/context blocks; .whereblock belongs to main lessons."]
]);

const ALLOWED_STATE_CLASSES = new Set([
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

const ALLOWED_MARKER_CLASSES = new Set([
  "base-rate-engine",
  "chiprow",
  "corner",
  "frontier",
  "grue-machine"
]);

export async function checkAppendixStyle(options: AppendixStyleCheckOptions): Promise<AppendixStyleCheckResult> {
  const errors: string[] = [];
  const cssClasses = await collectCssClasses(options, errors);
  const jsClasses = await collectJsClasses(options);
  const includeFiles = await collectIncludeFiles(options);

  for (const file of includeFiles) {
    const content = await readFile(file, "utf8");
    checkDeepDiveWrap(options.root, file, content, errors);
    const blocks = deepDiveBlocks(options.root, content, file, errors);
    for (const block of blocks) {
      checkBlock(options.root, file, block, cssClasses, jsClasses, errors);
    }
  }

  return {
    checkedIncludeFiles: includeFiles.length,
    errors
  };
}

async function collectCssClasses(options: AppendixStyleCheckOptions, errors: string[]): Promise<Set<string>> {
  const out = new Set<string>();
  for (const relativeFile of options.cssFiles ?? ["src/assets/css/book.css"]) {
    const file = path.join(options.root, relativeFile);
    if (!await pathExists(file)) continue;

    const css = await readFile(file, "utf8");
    checkCssForDayScopedSelectors(options.root, file, css, errors);
    for (const match of css.matchAll(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g)) {
      out.add(match[1]);
    }
  }
  return out;
}

async function collectJsClasses(options: AppendixStyleCheckOptions): Promise<Set<string>> {
  const out = new Set<string>();
  const jsRoot = path.join(options.root, options.jsRoot ?? "src/assets/js/interactions");
  if (!await pathExists(jsRoot)) return out;

  for (const file of await walkFiles(jsRoot, { exts: ".js", ignored: [] })) {
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

async function collectIncludeFiles(options: AppendixStyleCheckOptions): Promise<string[]> {
  const includeRoot = path.join(options.root, options.includeRoot ?? "src/_includes/days");
  if (!await pathExists(includeRoot)) return [];
  return (await walkFiles(includeRoot, { exts: ".njk", ignored: [] })).sort();
}

function deepDiveBlocks(root: string, content: string, file: string, errors: string[]): string[] {
  const blocks: string[] = [];
  let searchFrom = 0;
  while (true) {
    const start = content.indexOf("<!-- deep-dive:start -->", searchFrom);
    if (start < 0) break;
    const end = content.indexOf("<!-- deep-dive:end -->", start);
    if (end < 0) {
      errors.push(`${toRelative(root, file)}: missing <!-- deep-dive:end --> marker`);
      blocks.push(content.slice(start));
      break;
    }
    blocks.push(content.slice(start, end));
    searchFrom = end + "<!-- deep-dive:end -->".length;
  }
  return blocks;
}

function checkBlock(
  root: string,
  file: string,
  block: string,
  cssClasses: Set<string>,
  jsClasses: Set<string>,
  errors: string[]
): void {
  const relativeFile = toRelative(root, file);
  if (!/<details\s+class="deep-dive"[\s>]/.test(block)) {
    errors.push(`${relativeFile}: deep-dive block has no <details class="deep-dive"> shell`);
  }
  if (!/<summary>[\s\S]*class="ptitle"[\s\S]*class="deep-dive-title"[\s\S]*class="deep-dive-sub"[\s\S]*<\/summary>/.test(block)) {
    errors.push(`${relativeFile}: deep-dive summary is missing the standard title/subtitle structure`);
  }
  if (!/<div\s+class="deep-dive-body">/.test(block)) {
    errors.push(`${relativeFile}: deep-dive block has no .deep-dive-body wrapper`);
  }
  if (/<br\s*\/?>\s*<blockquote\b/i.test(block)) {
    errors.push(`${relativeFile}: raw <br> used as spacing before a blockquote inside an appendix`);
  }
  if (/\sstyle\s*=/.test(block)) {
    errors.push(`${relativeFile}: inline style attributes are not allowed inside appendices; add a shared class in book.css`);
  }

  for (const className of classNames(block)) {
    const forbidden = FORBIDDEN_CLASSES.get(className);
    if (forbidden) {
      errors.push(`${relativeFile}: forbidden appendix class "${className}". ${forbidden}`);
      continue;
    }
    if (isDayScopedClass(className)) {
      errors.push(`${relativeFile}: appendix class "${className}" is day-scoped; use a reusable component or utility class`);
      continue;
    }
    if (
      cssClasses.has(className) ||
      jsClasses.has(className) ||
      ALLOWED_STATE_CLASSES.has(className) ||
      ALLOWED_MARKER_CLASSES.has(className)
    ) continue;
    errors.push(`${relativeFile}: appendix class "${className}" has no shared CSS rule or JS owner`);
  }
}

function checkCssForDayScopedSelectors(root: string, file: string, css: string, errors: string[]): void {
  const selectorPattern = /(^|})\s*([^{}]+)\{/g;
  for (const match of css.matchAll(selectorPattern)) {
    const selector = match[2].trim();
    if (/(?:#|\.)(?:appendix-d\d{3}|day-\d{3}|d\d{3}(?:[-_]|$))/i.test(selector)) {
      errors.push(`${toRelative(root, file)}: day-scoped CSS selector "${selector}" should be a shared component or utility selector`);
    }
  }
}

function isDayScopedClass(className: string): boolean {
  return /^(?:appendix-d\d{3}|day-\d{3}|d\d{3}(?:[-_]|$))/i.test(className);
}

function checkDeepDiveWrap(root: string, file: string, content: string, errors: string[]): void {
  if (!content.includes("<!-- deep-dive:start -->")) return;

  const $ = load(content, undefined, false);
  const allDetails = $("details.deep-dive").length;
  if (!allDetails) return;

  const wrappedDetails = $("div.wrap details.deep-dive").length;
  if (wrappedDetails !== allDetails) {
    errors.push(`${toRelative(root, file)}: ${allDetails - wrappedDetails} deep-dive section(s) outside the standard .wrap content container`);
  }
}

function classNames(block: string): Set<string> {
  const out = new Set<string>();
  for (const match of block.matchAll(/class="([^"]+)"/g)) {
    for (const className of match[1].trim().split(/\s+/)) {
      if (className) out.add(className);
    }
  }
  return out;
}

function toRelative(root: string, filePath: string): string {
  return path.relative(root, filePath).split(path.sep).join("/");
}
