import { readFile } from "node:fs/promises";
import path from "node:path";
import { compileCss } from "@lib/assets/css";
import { contentDaysDir } from "@lib/content/paths";
import { loadContentRegistry } from "@lib/content/registry";
import { toPosixRelative } from "@lib/fs/path";
import { walkFiles } from "@lib/fs/walk";
import { stripFencedCodeBlocks } from "@lib/text/markdown";

interface AppendixStyleCheckOptions {
  root: string;
}

interface AppendixStyleCheckResult {
  checkedAppendixFiles: number;
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
  "corner",
  "frontier",
  "grue-machine"
]);

export async function checkAppendixStyle(options: AppendixStyleCheckOptions): Promise<AppendixStyleCheckResult> {
  const errors: string[] = [];
  const cssClasses = await collectCssClasses(options, errors);
  const jsClasses = await collectJsClasses(options);
  const appendixFiles = await collectAppendixFiles(options);

  for (const file of appendixFiles) {
    checkBlock(options.root, file, stripFencedCodeBlocks(await readFile(file, "utf8")), cssClasses, jsClasses, errors);
  }

  return {
    checkedAppendixFiles: appendixFiles.length,
    errors
  };
}

async function collectCssClasses(options: AppendixStyleCheckOptions, errors: string[]): Promise<Set<string>> {
  const out = new Set<string>();
  const css = await compileCss({ root: options.root });
  checkCssForDayScopedSelectors(options.root, "src/assets/scss/book.scss", css, errors);
  collectClassesFromCss(css, out);
  return out;
}

function collectClassesFromCss(css: string, out: Set<string>): void {
  for (const match of css.matchAll(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)/g)) {
    out.add(match[1]);
  }
}

async function collectJsClasses(options: AppendixStyleCheckOptions): Promise<Set<string>> {
  const out = new Set<string>();
  const jsRoot = path.join(options.root, "src/assets/js/interactions");

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

async function collectAppendixFiles(options: AppendixStyleCheckOptions): Promise<string[]> {
  const daysDir = contentDaysDir(options.root);
  const registry = await loadContentRegistry({ daysDir });
  return registry.days
    .flatMap((day) => day.appendixBodies.map((body) => path.join(day.directory, body.path)))
    .sort();
}

function checkBlock(
  root: string,
  file: string,
  block: string,
  cssClasses: Set<string>,
  jsClasses: Set<string>,
  errors: string[]
): void {
  const relativeFile = toPosixRelative(root, file);
  if (/<br\s*\/?>\s*<blockquote\b/i.test(block)) {
    errors.push(`${relativeFile}: raw <br> used as spacing before a blockquote inside an appendix`);
  }
  if (/\sstyle\s*=/.test(block)) {
    errors.push(`${relativeFile}: inline style attributes are not allowed inside appendices; add a shared class in the SCSS style system`);
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
      errors.push(`${toPosixRelative(root, file)}: day-scoped CSS selector "${selector}" should be a shared component or utility selector`);
    }
  }
}

function isDayScopedClass(className: string): boolean {
  return /^(?:appendix-d\d{3}|day-\d{3}|d\d{3}(?:[-_]|$))/i.test(className);
}

function classNames(block: string): Set<string> {
  const out = new Set<string>();
  for (const match of block.matchAll(/class(?:Name)?="([^"]+)"/g)) {
    for (const className of match[1].trim().split(/\s+/)) {
      if (className) out.add(className);
    }
  }
  return out;
}
