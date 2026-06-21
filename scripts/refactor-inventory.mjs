import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { parse as parseYaml } from "yaml";

const root = process.cwd();
const outputDir = path.join(root, "docs/refactor/inventory");
const jsonPath = path.join(outputDir, "current-inventory.json");
const markdownPath = path.join(outputDir, "current-inventory.md");

function posixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function rel(filePath) {
  return posixPath(path.relative(root, filePath));
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(dir, predicate = () => true) {
  if (!(await exists(dir))) {
    return [];
  }

  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(fullPath, predicate));
    } else if (entry.isFile() && predicate(fullPath)) {
      files.push(fullPath);
    }
  }

  return files.sort((a, b) => rel(a).localeCompare(rel(b)));
}

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

async function readYaml(relativePath) {
  return parseYaml(await readFile(path.join(root, relativePath), "utf8"));
}

async function loadShells(relativeDir, locale) {
  const dir = path.join(root, relativeDir);
  const files = await listFiles(dir, (file) => file.endsWith(".md"));

  return Promise.all(files.map(async (filePath) => {
    const parsed = matter(await readFile(filePath, "utf8"));
    const scripts = Array.isArray(parsed.data.scripts) ? parsed.data.scripts : [];
    const template = parsed.data.content_template ?? null;
    const templatePath = template ? path.join(root, "src/_includes", template) : null;

    return {
      locale,
      file: rel(filePath),
      day: parsed.data.day ?? null,
      dayPath: parsed.data.day_path ?? null,
      slug: parsed.data.slug ?? null,
      title: parsed.data.title ?? null,
      permalink: parsed.data.permalink ?? null,
      contentTemplate: template,
      contentTemplateFile: templatePath ? rel(templatePath) : null,
      contentTemplateExists: templatePath ? await exists(templatePath) : false,
      scripts
    };
  }));
}

function byDayPath(items) {
  const map = new Map();
  for (const item of items) {
    if (item.dayPath) {
      map.set(item.dayPath, item);
    }
  }
  return map;
}

function tableCell(value) {
  if (Array.isArray(value)) {
    return value.length ? value.join("<br>") : "-";
  }
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(tableCell).join(" | ")} |`)
  ].join("\n");
}

function scriptNameList(packageScripts, prefix = null) {
  return Object.keys(packageScripts)
    .filter((name) => prefix === null || name.startsWith(prefix))
    .sort();
}

async function buildInventory() {
  const packageJson = await readJson("package.json");
  const book = await readYaml("src/_data/book.yaml");
  const englishShells = await loadShells("src/days", "en");
  const chineseShells = await loadShells("src/zh/days", "zh");
  const dayBodies = await listFiles(path.join(root, "src/_includes/days"), (file) => file.endsWith(".njk"));
  const interactionScripts = await listFiles(path.join(root, "src/assets/js/interactions"), (file) => file.endsWith(".js"));
  const sourceScripts = await listFiles(path.join(root, "scripts"), (file) => /\.(mjs|cjs|js)$/.test(file));
  const workflowDocs = await listFiles(path.join(root, "docs/workflows"), (file) => file.endsWith(".md"));
  const imageAssets = await listFiles(path.join(root, "src/assets/images"));
  const generatedDownloads = await listFiles(path.join(root, "_site/downloads"));

  const checkScripts = scriptNameList(packageJson.scripts, "check");
  const buildScripts = scriptNameList(packageJson.scripts, "build");
  const deployScripts = scriptNameList(packageJson.scripts, "deploy");
  const englishByPath = byDayPath(englishShells);
  const chineseByPath = byDayPath(chineseShells);
  const allDayPaths = [...new Set([...englishByPath.keys(), ...chineseByPath.keys()])].sort();

  const dayPairs = allDayPaths.map((dayPath) => {
    const en = englishByPath.get(dayPath) ?? null;
    const zh = chineseByPath.get(dayPath) ?? null;
    return {
      dayPath,
      day: en?.day ?? zh?.day ?? null,
      enShell: en?.file ?? null,
      zhShell: zh?.file ?? null,
      enBody: en?.contentTemplateFile ?? null,
      zhBody: zh?.contentTemplateFile ?? null,
      enBodyExists: en?.contentTemplateExists ?? false,
      zhBodyExists: zh?.contentTemplateExists ?? false,
      scripts: [...new Set([...(en?.scripts ?? []), ...(zh?.scripts ?? [])])].sort()
    };
  });

  const oldConventions = {
    eleventyConfig: await exists(path.join(root, "eleventy.config.cjs")),
    englishRouteShells: englishShells.length,
    chineseRouteShells: chineseShells.length,
    nunjucksDayBodies: dayBodies.length,
    importers: sourceScripts
      .map(rel)
      .filter((file) => file.includes("import-") && file.endsWith(".mjs"))
  };

  return {
    generatedAt: new Date().toISOString(),
    status: "migration-freeze-active",
    package: {
      name: packageJson.name,
      version: packageJson.version,
      scripts: {
        build: buildScripts,
        check: checkScripts,
        deploy: deployScripts
      }
    },
    book: {
      title: book.title,
      totalDays: book.total_days,
      siteUrl: book.site_url,
      downloads: book.downloads,
      zhDownloads: book.zh?.downloads ?? {}
    },
    counts: {
      englishRouteShells: englishShells.length,
      chineseRouteShells: chineseShells.length,
      pairedDayPaths: dayPairs.length,
      nunjucksDayBodies: dayBodies.length,
      interactionScripts: interactionScripts.length,
      scripts: sourceScripts.length,
      workflowDocs: workflowDocs.length,
      imageAssets: imageAssets.length,
      generatedDownloads: generatedDownloads.length
    },
    dayPairs,
    interactionScripts: interactionScripts.map(rel),
    sourceScripts: sourceScripts.map(rel),
    workflowDocs: workflowDocs.map(rel),
    generatedDownloads: generatedDownloads.map(rel),
    oldConventions
  };
}

function renderMarkdown(inventory) {
  const lines = [
    "# Refactor Inventory Baseline",
    "",
    `Generated: ${inventory.generatedAt}`,
    `Status: ${inventory.status}`,
    "",
    "This report captures source facts for the clean-break refactor. It is a coverage baseline, not a compatibility promise.",
    "",
    "## Summary",
    "",
    `- English route shells: ${inventory.counts.englishRouteShells}`,
    `- Chinese route shells: ${inventory.counts.chineseRouteShells}`,
    `- Paired day paths: ${inventory.counts.pairedDayPaths}`,
    `- Nunjucks day bodies: ${inventory.counts.nunjucksDayBodies}`,
    `- Interaction scripts: ${inventory.counts.interactionScripts}`,
    `- Build/check scripts: ${inventory.package.scripts.build.length + inventory.package.scripts.check.length}`,
    `- Workflow docs: ${inventory.counts.workflowDocs}`,
    `- Image assets: ${inventory.counts.imageAssets}`,
    `- Existing generated downloads: ${inventory.counts.generatedDownloads}`,
    "",
    "## Build And Deploy Surface",
    "",
    `- Build scripts: ${inventory.package.scripts.build.join(", ")}`,
    `- Check scripts: ${inventory.package.scripts.check.join(", ")}`,
    `- Deploy scripts: ${inventory.package.scripts.deploy.join(", ")}`,
    "",
    "## Day Pairing Baseline",
    "",
    markdownTable(
      ["Day", "Path", "EN Shell", "ZH Shell", "EN Body", "ZH Body", "Scripts"],
      inventory.dayPairs.map((day) => [
        day.day,
        day.dayPath,
        day.enShell,
        day.zhShell,
        day.enBodyExists ? day.enBody : `MISSING: ${day.enBody}`,
        day.zhBodyExists ? day.zhBody : `MISSING: ${day.zhBody}`,
        day.scripts.map((script) => script.replace("/assets/js/interactions/", ""))
      ])
    ),
    "",
    "## Old Conventions Present",
    "",
    `- Eleventy config: ${inventory.oldConventions.eleventyConfig ? "present" : "absent"}`,
    `- English route shells: ${inventory.oldConventions.englishRouteShells}`,
    `- Chinese route shells: ${inventory.oldConventions.chineseRouteShells}`,
    `- Nunjucks day bodies: ${inventory.oldConventions.nunjucksDayBodies}`,
    `- Importer scripts: ${inventory.oldConventions.importers.join(", ") || "none"}`,
    "",
    "## Generated Downloads Currently Present",
    "",
    ...(inventory.generatedDownloads.length
      ? inventory.generatedDownloads.map((file) => `- ${file}`)
      : ["- none"]),
    "",
    "## Workflow Docs",
    "",
    ...inventory.workflowDocs.map((file) => `- ${file}`),
    ""
  ];

  return `${lines.join("\n")}\n`;
}

const inventory = await buildInventory();
await mkdir(outputDir, { recursive: true });
await writeFile(jsonPath, `${JSON.stringify(inventory, null, 2)}\n`);
await writeFile(markdownPath, renderMarkdown(inventory));

console.log(`Wrote ${rel(jsonPath)}`);
console.log(`Wrote ${rel(markdownPath)}`);
