import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import matter, { type GrayMatterFile } from "gray-matter";
import { pathExists, walkFiles } from "@lib/fs";

export interface ContentCheckOptions {
  root: string;
}

export interface ContentCheckFailure {
  message: string;
}

const DAY_GROUPS = [
  { dir: "src/days", label: "English" },
  { dir: "src/zh/days", label: "Chinese" }
] as const;

const REQUIRED_FRONTMATTER_KEYS = ["day", "title", "summary", "threads", "content_template", "permalink"] as const;
const PRINT_UNFRIENDLY_PHRASES = ["Static version", "live website lets", "as a table", "Receipts"] as const;
const PROJECT_TEXT_EXTS = new Set([".cjs", ".css", ".html", ".json", ".md", ".mjs", ".njk", ".yaml", ".yml"]);
const PARENT_MARKDOWN_PATTERN = /\.\.\/[^\s"'`)]+\.md\b/;

interface DayFile {
  file: string;
  full: string;
  label: string;
}

export async function checkContent(options: ContentCheckOptions): Promise<ContentCheckFailure[]> {
  const failures: ContentCheckFailure[] = [];
  const allDayFiles = await collectDayFiles(options.root);

  if (!allDayFiles.length) {
    failures.push({ message: "No day files found" });
  }

  for (const dayFile of allDayFiles) {
    await checkDayFile(options.root, dayFile, failures);
  }

  await checkCssFonts(options.root, failures);
  await checkParentMarkdownReferences(options.root, failures);

  return failures;
}

async function collectDayFiles(root: string): Promise<DayFile[]> {
  const allDayFiles: DayFile[] = [];

  for (const group of DAY_GROUPS) {
    const dir = path.join(root, group.dir);
    if (!await pathExists(dir)) continue;

    const files = (await readdir(dir)).filter((file) => file.endsWith(".md")).sort();
    for (const file of files) {
      allDayFiles.push({
        file,
        full: path.join(dir, file),
        label: group.label
      });
    }
  }

  return allDayFiles;
}

async function checkDayFile(root: string, dayFile: DayFile, failures: ContentCheckFailure[]): Promise<void> {
  const parsed = matter.read(dayFile.full);

  for (const key of REQUIRED_FRONTMATTER_KEYS) {
    if (!parsed.data[key]) {
      failures.push({ message: `${dayFile.label} ${dayFile.file} missing frontmatter key: ${key}` });
    }
  }

  const content = await readDayContent(root, parsed, dayFile.full, failures);

  for (const script of parsed.data.scripts || []) {
    const scriptPath = path.join(root, String(script).replace(/^\//, "src/"));
    if (!await pathExists(scriptPath)) {
      failures.push({ message: `${dayFile.label} ${dayFile.file} references missing script: ${script}` });
    }
  }

  if (!content.includes('class="sources"')) {
    failures.push({ message: `${dayFile.label} ${dayFile.file} has no sources section` });
  }

  const firstSources = content.indexOf('class="sources"');
  const deepDiveStart = content.indexOf("<!-- deep-dive:start -->");
  if (deepDiveStart >= 0 && (firstSources < 0 || firstSources > deepDiveStart)) {
    failures.push({ message: `${dayFile.label} ${dayFile.file} places main lesson sources after the appendix` });
  }

  if (!content.includes("chip ")) {
    failures.push({ message: `${dayFile.label} ${dayFile.file} has no frontier status chips` });
  }

  if (content.includes("fonts.googleapis.com")) {
    failures.push({ message: `${dayFile.label} ${dayFile.file} references remote Google Fonts` });
  }

  for (const phrase of PRINT_UNFRIENDLY_PHRASES) {
    if (content.includes(phrase)) {
      failures.push({ message: `${dayFile.label} ${dayFile.file} contains print-unfriendly phrase: ${phrase}` });
    }
  }

  checkHtmlContent(dayFile, parsed, content, failures);
}

function checkHtmlContent(
  dayFile: DayFile,
  parsed: GrayMatterFile<string>,
  content: string,
  failures: ContentCheckFailure[]
): void {
  const $ = cheerio.load(content);
  const h1Html = $("h1").first().html();
  if (!h1Html) {
    failures.push({ message: `${dayFile.label} ${dayFile.file} has no lesson h1` });
  } else if (h1Html.includes("{{")) {
    if (!h1Html.includes("title")) {
      failures.push({ message: `${dayFile.label} ${dayFile.file} has a dynamic h1 that does not reference route title data` });
    }
  } else {
    const h1Text = normalizeVisibleText(h1Html);
    const titleText = normalizeVisibleText(String(parsed.data.title));
    if (h1Text !== titleText) {
      failures.push({ message: `${dayFile.label} ${dayFile.file} h1 "${h1Text}" does not match route title "${titleText}"` });
    }
  }

  const webPanels = $(".panel.web-only").length;
  const staticAlternates = $(".format-alt.print-only").length;
  if (staticAlternates < webPanels) {
    failures.push({
      message: `${dayFile.label} ${dayFile.file} has ${webPanels} web-only panels but only ${staticAlternates} static print/EPUB alternates`
    });
  }

  $(".chip").each((_, el) => {
    if (!$(el).attr("data-print")) {
      failures.push({ message: `${dayFile.label} ${dayFile.file} has a status chip without data-print="${$(el).text().trim()}"` });
    }
    if (dayFile.label === "Chinese" && /[A-Za-z]/.test($(el).attr("data-print") || "")) {
      failures.push({ message: `${dayFile.label} ${dayFile.file} has untranslated print chip data-print="${$(el).attr("data-print")}"` });
    }
  });
}

async function readDayContent(
  root: string,
  parsed: GrayMatterFile<string>,
  sourceFile: string,
  failures: ContentCheckFailure[]
): Promise<string> {
  if (!parsed.data.content_template) return parsed.content;

  const includePath = path.join(root, "src/_includes", parsed.data.content_template);
  try {
    return await readFile(includePath, "utf8");
  } catch {
    failures.push({ message: `${toRelative(root, sourceFile)} points to missing content_template: ${parsed.data.content_template}` });
    return parsed.content;
  }
}

async function checkCssFonts(root: string, failures: ContentCheckFailure[]): Promise<void> {
  const cssPath = path.join(root, "src/assets/css/book.css");
  const css = await readFile(cssPath, "utf8");
  if (!css.includes("@font-face")) {
    failures.push({ message: "CSS does not declare local fonts" });
  }
}

async function checkParentMarkdownReferences(root: string, failures: ContentCheckFailure[]): Promise<void> {
  for (const file of await walkFiles(root, { exts: PROJECT_TEXT_EXTS })) {
    const text = await readFile(file, "utf8");
    if (PARENT_MARKDOWN_PATTERN.test(text)) {
      failures.push({
        message: `${toRelative(root, file)} references a parent Markdown file; keep canonical project content inside this repo`
      });
    }
  }
}

function normalizeVisibleText(text: string): string {
  const withoutTemplate = text
    .replace(/\{%[\s\S]*?%\}/g, "")
    .replace(/\{\{[\s\S]*?\}\}/g, "");
  return cheerio
    .load(`<body>${withoutTemplate}</body>`)("body")
    .text()
    .replace(/\s+/g, " ")
    .trim();
}

function toRelative(root: string, filePath: string): string {
  return path.relative(root, filePath).split(path.sep).join("/");
}
