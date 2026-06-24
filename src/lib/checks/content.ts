import { readFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import { compileCss } from "@lib/assets/css";
import { loadContentRegistry } from "@lib/content/registry";
import { toPosixRelative } from "@lib/fs/path";
import { walkFiles } from "@lib/fs/walk";
import type { Locale } from "@lib/schemas/day";

interface ContentCheckOptions {
  root: string;
  daysDir?: string;
}

interface ContentCheckFailure {
  message: string;
}

const PRINT_UNFRIENDLY_PHRASES = ["Static version", "live website lets", "as a table", "Receipts"] as const;
const PROJECT_TEXT_EXTS = new Set([".astro", ".cjs", ".css", ".html", ".json", ".md", ".mdx", ".mjs", ".scss", ".yaml", ".yml"]);
const PARENT_MARKDOWN_PATTERN = /\.\.\/[^\s"'`)]+\.md\b/;
const UNSUPPORTED_MDX_WRAPPER_PATTERNS: Array<[RegExp, string]> = [
  [/<header class="hero wrap">/, "use <Hero>"],
  [/<\/header>/, "use </Hero>"],
  [/<section(?:\s|>)/, "use Markdown structure, <ContentSection>, or <Sources>"],
  [/<\/section>/, "use Markdown structure, </ContentSection>, or </Sources>"],
  [/<\/?blockquote(?:\s|>)/, "use <BlockQuote>"],
  [/<h3>/, "use Markdown headings"],
  [/<\/?p(?:\s|>)/, "use Markdown paragraphs, <Lead>, <FormatOnly>, <LessonNote>, or a shared paragraph component"],
  [/<\/?(?:strong|b|em|span|small)(?:\s|>)/, "use Markdown emphasis or a shared inline component"],
  [/<br\s*\/?>/i, "use Markdown line breaks or a shared block component"],
  [/<\/?code(?:\s|>)/, "use Markdown backticks or fenced code blocks"],
  [/<\/?(?:ul|li)(?:\s|>)/, "use Markdown lists or shared list components"],
  [/<div class="roadmap">/, "use <Roadmap>"],
  [/<div class="def">/, "use <DefinitionBox>"],
  [/<figure class="appendix-figure\b/, "use <AppendixFigure>"],
  [/<ul class="(?:clean|check)">/, "use <LessonList>"],
  [/<ul class="mislist">/, "use <MisconceptionList>"],
  [/<span class="fix">/, "use <MisconceptionFix>"],
  [/<span class="table-subnote\b/, "use <TableSubnote>"],
  [/<span class="daymark">/, "use the <HeroEyebrow> dayMark prop"],
  [/<span class="meta">/, "use <Meta>"],
  [/<span class="threads-label">/, "use the <Threads> label prop"],
  [/<figure class="bayes-sieve">/, "use <BayesSieve>"],
  [/<p class="bs-total">/, "use <BayesSieve>"],
  [/<div class="mathline">/, "use <MathLine>"],
  [/<div class="camps">/, "use <ProbabilityCamps>"],
  [/<div class="camp\b/, "use <ProbabilityCamp>"],
  [/<span class="bs-symbol">/, "use <BayesSymbol>"],
  [/<span class="bs-note">/, "use <BayesNote>"],
  [/<span class="latin">/, "use <Latin>"],
  [/<span class="emoji">/, "use <Emoji>"],
  [/<div class="dek-grid">/, "use <DekGrid>"],
  [/<div class="(?:aside|formula|recap|whereblock|wrap|format-alt epub-only print-only|panel)\b/, "use shared lesson components"],
  [/<div class="(?:regress-map|tri-print)\b/, "use <AgrippaTrilemmaMap>"],
  [/<figure class="(?:hero-clock|hero-doors)\b/, "use shared figure components"],
  [/<figure class="lesson-figure[^"]*">\s*<img\b/, "use <ImageFigure>"],
  [/<div class="mh-machine"\b/, "use <ProbabilityMontyPanel>"],
  [/<div class="atlas"\b/, "use <IncomingWaveAtlas> or <WaveAtlas>"]
];
const RAW_INTERACTIVE_PATTERNS: Array<[RegExp, string]> = [
  [/<(?:button|input|select|textarea|canvas)\b/i, "raw control or canvas"],
  [/\s(?:on[a-z]+)=/i, "inline event handler"],
  [/\srole=["'](?:button|switch|slider|tab|tabpanel|checkbox|radio)["']/i, "interactive ARIA role"],
  [/\saria-(?:pressed|checked|expanded|controls)=/i, "interactive ARIA state"],
  [/\sdata-(?:action|case|exit|filter|mode|p|pick|preset|scn|state|step|target|value)=/i, "interactive data hook"]
];

interface RegistryContentFile {
  label: string;
  relativePath: string;
  source: string;
  locale: Locale;
  title?: string;
  requiresTitle: boolean;
}

export async function checkContent(options: ContentCheckOptions): Promise<ContentCheckFailure[]> {
  const failures: ContentCheckFailure[] = [];
  const daysDir = path.join(options.root, options.daysDir ?? "src/content/days");
  const registry = await loadContentRegistry({ daysDir });

  if (!registry.days.length) {
    failures.push({ message: "No registry days found" });
  }

  for (const day of registry.days) {
    for (const locale of ["en", "zh"] as const) {
      if (!day.manifest.locales[locale]) {
        failures.push({ message: `${day.manifest.path} missing ${locale} locale` });
      }
    }

    for (const body of day.bodies) {
      const localeData = day.manifest.locales[body.locale];
      checkContentFile({
        label: `${body.locale.toUpperCase()} ${day.manifest.path}`,
        relativePath: toPosixRelative(options.root, path.join(day.directory, body.path)),
        source: body.source,
        locale: body.locale,
        title: localeData?.title,
        requiresTitle: true
      }, failures);
    }

    for (const appendixBody of day.appendixBodies) {
      checkContentFile({
        label: `${appendixBody.locale.toUpperCase()} ${day.manifest.path} appendix ${appendixBody.appendixId}`,
        relativePath: toPosixRelative(options.root, path.join(day.directory, appendixBody.path)),
        source: appendixBody.source,
        locale: appendixBody.locale,
        requiresTitle: false
      }, failures);
    }

  }

  await checkCssFonts(options.root, failures);
  await checkParentMarkdownReferences(options.root, failures);

  return failures;
}

function checkContentFile(file: RegistryContentFile, failures: ContentCheckFailure[]): void {
  if (/[{]%|%}/.test(file.source)) {
    failures.push({ message: `${file.relativePath} contains template syntax; use MDX components instead` });
  }

  if (/<\/?script\b/i.test(file.source)) {
    failures.push({ message: `${file.relativePath} contains inline script; use shared interaction assets instead` });
  }

  if (!file.source.includes("<Sources") && !file.source.includes('class="sources"') && !file.source.includes("className=\"sources\"")) {
    failures.push({ message: `${file.label} has no sources section` });
  }

  if (!file.source.includes("<StatusChip")) {
    failures.push({ message: `${file.label} has no frontier status chips` });
  }

  if (file.source.includes("fonts.googleapis.com")) {
    failures.push({ message: `${file.relativePath} references remote Google Fonts` });
  }

  for (const phrase of PRINT_UNFRIENDLY_PHRASES) {
    if (file.source.includes(phrase)) {
      failures.push({ message: `${file.relativePath} contains print-unfriendly phrase: ${phrase}` });
    }
  }

  if (file.requiresTitle) {
    checkMainTitle(file, failures);
  }

  checkStaticAlternates(file, failures);
  checkUnsupportedMdxWrappers(file, failures);
  checkRawInteractiveMarkup(file, failures);
}

function checkMainTitle(file: RegistryContentFile, failures: ContentCheckFailure[]): void {
  const titleMatch = file.source.match(/^#\s+(.+)$/m) ?? file.source.match(/<h1(?:\s[^>]*)?>([\s\S]*?)<\/h1>/);
  if (!titleMatch) {
    failures.push({ message: `${file.label} has no lesson h1` });
    return;
  }

  if (!file.title) return;
  const h1Text = normalizeVisibleText(titleMatch[1]);
  const titleText = normalizeVisibleText(file.title);
  if (h1Text !== titleText) {
    failures.push({ message: `${file.label} h1 "${h1Text}" does not match manifest title "${titleText}"` });
  }
}

function checkStaticAlternates(file: RegistryContentFile, failures: ContentCheckFailure[]): void {
  const webPanels =
    countMatches(file.source, /class="[^"]*\bpanel\b[^"]*\bweb-only\b[^"]*"/g) +
    countMatches(file.source, /<Panel\b[^>]*class="[^"]*\bweb-only\b[^"]*"/g);
  const staticAlternates =
    countMatches(file.source, /class="[^"]*\bformat-alt\b[^"]*\b(?:print-only|epub-only)\b[^"]*"/g) +
    countMatches(file.source, /<FormatOnly\b(?=[^>]*\bmedia="print-epub")(?=[^>]*\bclass="[^"]*\bformat-alt\b)/g);
  if (staticAlternates < webPanels) {
    failures.push({
      message: `${file.label} has ${webPanels} web-only panels but only ${staticAlternates} static print/EPUB alternates`
    });
  }
}

function checkUnsupportedMdxWrappers(file: RegistryContentFile, failures: ContentCheckFailure[]): void {
  for (const [pattern, replacement] of UNSUPPORTED_MDX_WRAPPER_PATTERNS) {
    if (pattern.test(file.source)) {
      failures.push({ message: `${file.relativePath} contains unsupported MDX wrapper markup; ${replacement}` });
    }
  }
}

function checkRawInteractiveMarkup(file: RegistryContentFile, failures: ContentCheckFailure[]): void {
  const source = stripCodeBlocks(file.source);
  for (const [pattern, label] of RAW_INTERACTIVE_PATTERNS) {
    if (pattern.test(source)) {
      failures.push({
        message: `${file.relativePath} contains raw interactive markup (${label}); extract it to a lesson component`
      });
      return;
    }
  }
}

function stripCodeBlocks(source: string): string {
  return source.replace(/```[\s\S]*?```/g, "");
}

async function checkCssFonts(root: string, failures: ContentCheckFailure[]): Promise<void> {
  const css = await compileCss({ root });
  if (!css.includes("@font-face")) {
    failures.push({ message: "CSS does not declare local fonts" });
  }
}

async function checkParentMarkdownReferences(root: string, failures: ContentCheckFailure[]): Promise<void> {
  for (const file of await walkFiles(root, { exts: PROJECT_TEXT_EXTS })) {
    const text = await readFile(file, "utf8");
    if (PARENT_MARKDOWN_PATTERN.test(text)) {
      failures.push({
        message: `${toPosixRelative(root, file)} references a parent Markdown file; keep canonical project content inside this repo`
      });
    }
  }
}

function countMatches(text: string, pattern: RegExp): number {
  return [...text.matchAll(pattern)].length;
}

function normalizeVisibleText(text: string): string {
  const withoutTemplate = text
    .replace(/\{%[\s\S]*?%\}/g, "")
    .replace(/\{\{[\s\S]*?\}\}/g, "")
    .replace(/[*_`]/g, "");
  return cheerio
    .load(`<body>${withoutTemplate}</body>`)("body")
    .text()
    .replace(/\s+/g, " ")
    .trim();
}
