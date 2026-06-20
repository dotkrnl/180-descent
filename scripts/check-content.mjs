import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import * as cheerio from "cheerio";
import { walk } from "./lib/fs.mjs";

let failures = 0;
const dayGroups = [
  { dir: "src/days", label: "English" },
  { dir: "src/zh/days", label: "Chinese" }
];
const allDayFiles = [];
for (const group of dayGroups) {
  const files = (await readdir(group.dir)).filter((file) => file.endsWith(".md")).sort();
  for (const file of files) allDayFiles.push({ file, full: path.join(group.dir, file), label: group.label });
}
if (!allDayFiles.length) {
  console.error("No day files found");
  process.exit(1);
}

for (const { file, full, label } of allDayFiles) {
  const parsed = matter.read(full);
  for (const key of ["day", "title", "summary", "threads", "content_template", "permalink"]) {
    if (!parsed.data[key]) {
      console.error(`${label} ${file} missing frontmatter key: ${key}`);
      failures++;
    }
  }
  const content = await readDayContent(parsed, full);
  for (const script of parsed.data.scripts || []) {
    const scriptPath = String(script).replace(/^\//, "src/");
    try {
      await readFile(scriptPath, "utf8");
    } catch {
      console.error(`${label} ${file} references missing script: ${script}`);
      failures++;
    }
  }
  if (!content.includes('class="sources"')) {
    console.error(`${label} ${file} has no sources section`);
    failures++;
  }
  const firstSources = content.indexOf('class="sources"');
  const deepDiveStart = content.indexOf("<!-- deep-dive:start -->");
  if (deepDiveStart >= 0 && (firstSources < 0 || firstSources > deepDiveStart)) {
    console.error(`${label} ${file} places main lesson sources after the appendix`);
    failures++;
  }
  if (!content.includes("chip ")) {
    console.error(`${label} ${file} has no frontier status chips`);
    failures++;
  }
  if (content.includes("fonts.googleapis.com")) {
    console.error(`${label} ${file} references remote Google Fonts`);
    failures++;
  }
  for (const phrase of ["Static version", "live website lets", "as a table", "Receipts"]) {
    if (content.includes(phrase)) {
      console.error(`${label} ${file} contains print-unfriendly phrase: ${phrase}`);
      failures++;
    }
  }
  const $ = cheerio.load(content);
  const h1Html = $("h1").first().html();
  if (!h1Html) {
    console.error(`${label} ${file} has no lesson h1`);
    failures++;
  } else if (h1Html.includes("{{")) {
    if (!h1Html.includes("title")) {
      console.error(`${label} ${file} has a dynamic h1 that does not reference route title data`);
      failures++;
    }
  } else {
    const h1Text = normalizeVisibleText(h1Html);
    const titleText = normalizeVisibleText(String(parsed.data.title));
    if (h1Text !== titleText) {
      console.error(`${label} ${file} h1 "${h1Text}" does not match route title "${titleText}"`);
      failures++;
    }
  }
  const webPanels = $(".panel.web-only").length;
  const staticAlternates = $(".format-alt.print-only").length;
  if (staticAlternates < webPanels) {
    console.error(`${label} ${file} has ${webPanels} web-only panels but only ${staticAlternates} static print/EPUB alternates`);
    failures++;
  }
  $(".chip").each((_, el) => {
    if (!$(el).attr("data-print")) {
      console.error(`${label} ${file} has a status chip without data-print="${$(el).text().trim()}"`);
      failures++;
    }
    if (label === "Chinese" && /[A-Za-z]/.test($(el).attr("data-print") || "")) {
      console.error(`${label} ${file} has untranslated print chip data-print="${$(el).attr("data-print")}"`);
      failures++;
    }
  });
}

const css = await readFile("src/assets/css/book.css", "utf8");
if (!css.includes("@font-face")) {
  console.error("CSS does not declare local fonts");
  failures++;
}

const parentMarkdownPattern = /\.\.\/[^\s"'`)]+\.md\b/;
for (const file of await walk(".", { exts: new Set([".cjs", ".css", ".html", ".json", ".md", ".mjs", ".njk", ".yaml", ".yml"]) })) {
  const text = await readFile(file, "utf8");
  if (parentMarkdownPattern.test(text)) {
    console.error(`${file} references a parent Markdown file; keep canonical project content inside this repo`);
    failures++;
  }
}

if (failures) process.exit(1);

async function readDayContent(parsed, sourceFile) {
  if (!parsed.data.content_template) return parsed.content;
  const includePath = path.join("src/_includes", parsed.data.content_template);
  try {
    return await readFile(includePath, "utf8");
  } catch {
    console.error(`${sourceFile} points to missing content_template: ${parsed.data.content_template}`);
    failures++;
    return parsed.content;
  }
}

function normalizeVisibleText(text) {
  const withoutTemplate = text
    .replace(/\{%[\s\S]*?%\}/g, "")
    .replace(/\{\{[\s\S]*?\}\}/g, "");
  return cheerio
    .load(`<body>${withoutTemplate}</body>`)("body")
    .text()
    .replace(/\s+/g, " ")
    .trim();
}
