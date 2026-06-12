import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import * as cheerio from "cheerio";

const [dayRaw, ...flags] = process.argv.slice(2);
if (!dayRaw) {
  console.error("Usage: node .codex/skills/180-descent-add-day/scripts/add-day-checklist.mjs DAY [--require-zh]");
  process.exit(1);
}

const day = Number(dayRaw);
if (!Number.isInteger(day) || day < 1 || day > 180) {
  console.error("DAY must be an integer from 1 to 180");
  process.exit(1);
}

const requireZh = flags.includes("--require-zh");
const prefix = `day-${String(day).padStart(3, "0")}-`;
let failures = 0;

const englishRoute = await findRoute("src/days", true);
if (englishRoute) await validateRoute(englishRoute, "English", "en");

const zhRoute = await findRoute("src/zh/days", false);
if (zhRoute) {
  await validateRoute(zhRoute, "Chinese", "zh");
} else if (requireZh) {
  console.error(`Expected exactly one src/zh/days/${prefix}*.md file; found 0`);
  failures++;
}

await validateIntroduction("src/pages/introduction.md", "English introduction", `Day ${day}`);
if (zhRoute || requireZh) {
  await validateIntroduction("src/zh/introduction.md", "Chinese introduction", `第 ${day} 日`);
}

for (const file of [
  "src/_data/future-links.yaml",
  "src/_data/credits.yaml",
  "src/assets/css/book.css",
  "src/assets/js/book.js",
  "src/assets/js/interactions"
]) {
  try {
    await access(file);
  } catch {
    console.error(`Missing expected project file: ${file}`);
    failures++;
  }
}

if (failures) process.exit(1);
console.log(`Day ${day} checklist passed`);

async function findRoute(dir, required) {
  const dayFiles = await findRouteFiles(dir, day);
  if (dayFiles.length !== 1) {
    if (required || dayFiles.length > 1) {
      console.error(`Expected exactly one ${dir}/${prefix}*.md file; found ${dayFiles.length}`);
      failures++;
    }
    return null;
  }
  return path.join(dir, dayFiles[0]);
}

async function findRouteFiles(dir, targetDay) {
  const targetPrefix = `day-${String(targetDay).padStart(3, "0")}-`;
  return (await readdir(dir)).filter((file) => file.startsWith(targetPrefix) && file.endsWith(".md"));
}

async function validateRoute(routeFile, label, locale) {
  const source = await readFile(routeFile, "utf8");
  const parsed = matter(source);
  const data = parsed.data;

  for (const key of ["layout", "day", "title", "summary", "block", "slug", "day_path", "threads", "content_template", "permalink"]) {
    if (!data[key]) {
      console.error(`${label} ${routeFile} missing frontmatter key: ${key}`);
      failures++;
    }
  }

  if (data.layout !== "layouts/day.njk") {
    console.error(`${label} ${routeFile} must use layout: layouts/day.njk`);
    failures++;
  }

  const expectedTemplate = data.day_path ? `days/${data.day_path}/${locale}.njk` : "";
  if (expectedTemplate && data.content_template !== expectedTemplate) {
    console.error(`${label} ${routeFile} should use content_template: ${expectedTemplate}`);
    failures++;
  }

  if (locale === "zh") {
    if (data.locale !== "zh") {
      console.error(`${label} ${routeFile} missing locale: zh`);
      failures++;
    }
    if (data.tags !== "zhDay") {
      console.error(`${label} ${routeFile} should use tags: zhDay`);
      failures++;
    }
    if (!String(data.permalink || "").startsWith("/zh/days/")) {
      console.error(`${label} ${routeFile} should use a /zh/days/ permalink`);
      failures++;
    }
  } else if (data.tags !== "day") {
    console.error(`${label} ${routeFile} should use tags: day`);
    failures++;
  }

  if (parsed.content.trim() !== "{% include content_template %}") {
    console.error(`${label} ${routeFile} should be a route shell with only {% include content_template %}`);
    failures++;
  }

  const includePath = path.join("src/_includes", String(data.content_template || ""));
  let body = "";
  try {
    body = await readFile(includePath, "utf8");
  } catch {
    console.error(`${label} ${routeFile} points to missing lesson body: ${includePath}`);
    failures++;
    return;
  }

  for (const needle of ["section class=\"sources\"", "class=\"recap\"", "class=\"tomorrow\""]) {
    if (!body.includes(needle)) {
      console.error(`${label} ${includePath} missing ${needle}`);
      failures++;
    }
  }

  const $ = cheerio.load(body);
  const webPanels = $(".panel.web-only").length;
  const staticAlternates = $(".format-alt.print-only").length;
  if (staticAlternates < webPanels) {
    console.error(`${label} ${includePath} has ${webPanels} web-only panels but only ${staticAlternates} static print/EPUB alternates`);
    failures++;
  }
  $(".chip").each((_, chip) => {
    if (!$(chip).attr("data-print")) {
      console.error(`${label} ${includePath} has a status chip without data-print`);
      failures++;
    }
  });
  await validateTomorrowBlock($, includePath, label, locale);

  const scripts = Array.isArray(data.scripts) ? data.scripts : data.scripts ? [data.scripts] : [];
  for (const script of scripts) {
    const scriptPath = String(script).replace(/^\//, "src/");
    if (!String(script).startsWith("/assets/js/interactions/")) {
      console.error(`${label} ${routeFile} script should be an interaction module: ${script}`);
      failures++;
    }
    try {
      await access(scriptPath);
    } catch {
      console.error(`${label} ${routeFile} references missing script: ${script}`);
      failures++;
    }
  }
}

async function validateTomorrowBlock($, includePath, label, locale) {
  const blocks = $(".tomorrow");
  if (blocks.length !== 1) {
    console.error(`${label} ${includePath} should have exactly one inline tomorrow block; found ${blocks.length}`);
    failures++;
    return;
  }

  const nextDay = day + 1;
  if (nextDay > 180) return;

  const dir = locale === "zh" ? "src/zh/days" : "src/days";
  const nextFiles = await findRouteFiles(dir, nextDay);
  if (nextFiles.length > 1) {
    console.error(`${label} expected at most one ${dir}/day-${String(nextDay).padStart(3, "0")}-*.md file; found ${nextFiles.length}`);
    failures++;
    return;
  }

  const block = blocks.first();
  if (nextFiles.length === 0) {
    const unpublishedPrefix = locale === "zh" ? `/zh/days/${String(nextDay).padStart(3, "0")}-` : `/days/${String(nextDay).padStart(3, "0")}-`;
    block.find("a[href]").each((_, anchor) => {
      const href = $(anchor).attr("href") || "";
      if (href.startsWith(unpublishedPrefix)) {
        console.error(`${label} ${includePath} tomorrow block links to unpublished day ${nextDay}: ${href}`);
        failures++;
      }
    });
    return;
  }

  const nextRoute = path.join(dir, nextFiles[0]);
  const nextParsed = matter(await readFile(nextRoute, "utf8"));
  const expectedHref = nextParsed.data.permalink;
  if (!expectedHref) {
    console.error(`${label} next route ${nextRoute} missing permalink`);
    failures++;
    return;
  }

  const matchingLinks = block.find("a[href]").filter((_, anchor) => $(anchor).attr("href") === expectedHref);
  if (matchingLinks.length === 0) {
    console.error(`${label} ${includePath} tomorrow block should link to next published day: ${expectedHref}`);
    failures++;
  }
}

async function validateIntroduction(file, label, currentDayMarker) {
  let source = "";
  try {
    source = await readFile(file, "utf8");
  } catch {
    console.error(`${label} missing expected file: ${file}`);
    failures++;
    return;
  }

  if (!source.includes(currentDayMarker)) {
    console.error(`${label} ${file} should mention the current published day: ${currentDayMarker}`);
    failures++;
  }
}
