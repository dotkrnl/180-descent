import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { parse as parseYaml } from "yaml";

export interface WriteRefactorInventoryOptions {
  root: string;
}

interface RouteShell {
  locale: "en" | "zh";
  file: string;
  day: number | null;
  dayPath: string | null;
  slug: string | null;
  title: string | null;
  permalink: string | null;
  contentTemplate: string | null;
  contentTemplateFile: string | null;
  contentTemplateExists: boolean;
  scripts: string[];
}

interface DayPair {
  dayPath: string;
  day: number | null;
  enShell: string | null;
  zhShell: string | null;
  enBody: string | null;
  zhBody: string | null;
  enBodyExists: boolean;
  zhBodyExists: boolean;
  scripts: string[];
}

interface RefactorInventory {
  generatedAt: string;
  status: string;
  package: {
    name: string;
    version: string;
    scripts: {
      build: string[];
      check: string[];
      deploy: string[];
    };
  };
  book: Record<string, unknown>;
  counts: Record<string, number>;
  dayPairs: DayPair[];
  interactionScripts: string[];
  sourceScripts: string[];
  workflowDocs: string[];
  generatedDownloads: string[];
  oldConventions: {
    eleventyConfig: boolean;
    englishRouteShells: number;
    chineseRouteShells: number;
    nunjucksDayBodies: number;
    importers: string[];
  };
}

export async function writeRefactorInventory(options: WriteRefactorInventoryOptions): Promise<{
  jsonPath: string;
  markdownPath: string;
}> {
  const outputDir = path.join(options.root, "docs/refactor/inventory");
  const jsonPath = path.join(outputDir, "current-inventory.json");
  const markdownPath = path.join(outputDir, "current-inventory.md");
  const inventory = await buildInventory(options.root);

  await mkdir(outputDir, { recursive: true });
  await writeFile(jsonPath, `${JSON.stringify(inventory, null, 2)}\n`);
  await writeFile(markdownPath, renderMarkdown(inventory));

  return { jsonPath, markdownPath };
}

export function posixPath(filePath: string): string {
  return filePath.split(path.sep).join("/");
}

export function tableCell(value: unknown): string {
  if (Array.isArray(value)) {
    return value.length ? value.join("<br>") : "-";
  }
  if (value === null || value === undefined || value === "") {
    return "-";
  }
  return String(value).replace(/\|/g, "\\|").replace(/\n/g, "<br>");
}

export function markdownTable(headers: string[], rows: unknown[][]): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(tableCell).join(" | ")} |`)
  ].join("\n");
}

export function scriptNameList(packageScripts: Record<string, string>, prefix: string | null = null): string[] {
  return Object.keys(packageScripts)
    .filter((name) => prefix === null || name.startsWith(prefix))
    .sort();
}

async function buildInventory(root: string): Promise<RefactorInventory> {
  const packageJson = await readJson<Record<string, unknown>>(root, "package.json");
  const packageScripts = asStringRecord(packageJson.scripts);
  const book = await readYaml<Record<string, unknown>>(root, "src/_data/book.yaml");
  const englishShells = await loadShells(root, "src/days", "en");
  const chineseShells = await loadShells(root, "src/zh/days", "zh");
  const dayBodies = await listFiles(root, path.join(root, "src/_includes/days"), (file) => file.endsWith(".njk"));
  const interactionScripts = await listFiles(root, path.join(root, "src/assets/js/interactions"), (file) => /\.(?:js|ts)$/.test(file));
  const sourceScripts = await listFiles(root, path.join(root, "scripts"), (file) => /\.(?:mjs|cjs|js|ts)$/.test(file));
  const workflowDocs = await listFiles(root, path.join(root, "docs/workflows"), (file) => file.endsWith(".md"));
  const imageAssets = await listFiles(root, path.join(root, "src/assets/images"));
  const generatedDownloads = await listFiles(root, path.join(root, "_site/downloads"));

  const checkScripts = scriptNameList(packageScripts, "check");
  const buildScripts = scriptNameList(packageScripts, "build");
  const deployScripts = scriptNameList(packageScripts, "deploy");
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

  const sourceScriptPaths = sourceScripts.map((filePath) => rel(root, filePath));
  const oldConventions = {
    eleventyConfig: await exists(path.join(root, "eleventy.config.cjs")),
    englishRouteShells: englishShells.length,
    chineseRouteShells: chineseShells.length,
    nunjucksDayBodies: dayBodies.length,
    importers: sourceScriptPaths.filter((file) => file.includes("import-") && file.endsWith(".mjs"))
  };

  return {
    generatedAt: new Date().toISOString(),
    status: "migration-freeze-active",
    package: {
      name: String(packageJson.name ?? ""),
      version: String(packageJson.version ?? ""),
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
      zhDownloads: nestedRecord(book.zh).downloads ?? {}
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
    interactionScripts: interactionScripts.map((filePath) => rel(root, filePath)),
    sourceScripts: sourceScriptPaths,
    workflowDocs: workflowDocs.map((filePath) => rel(root, filePath)),
    generatedDownloads: generatedDownloads.map((filePath) => rel(root, filePath)),
    oldConventions
  };
}

function rel(root: string, filePath: string): string {
  return posixPath(path.relative(root, filePath));
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(root: string, dir: string, predicate: (filePath: string) => boolean = () => true): Promise<string[]> {
  if (!(await exists(dir))) {
    return [];
  }

  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(root, fullPath, predicate));
    } else if (entry.isFile() && predicate(fullPath)) {
      files.push(fullPath);
    }
  }
  return files.sort((a, b) => rel(root, a).localeCompare(rel(root, b)));
}

async function readJson<T>(root: string, relativePath: string): Promise<T> {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8")) as T;
}

async function readYaml<T>(root: string, relativePath: string): Promise<T> {
  return parseYaml(await readFile(path.join(root, relativePath), "utf8")) as T;
}

async function loadShells(root: string, relativeDir: string, locale: "en" | "zh"): Promise<RouteShell[]> {
  const dir = path.join(root, relativeDir);
  const files = await listFiles(root, dir, (file) => file.endsWith(".md"));

  return Promise.all(files.map(async (filePath) => {
    const parsed = matter(await readFile(filePath, "utf8"));
    const data = parsed.data as Record<string, unknown>;
    const scripts = Array.isArray(data.scripts) ? data.scripts.map(String) : [];
    const template = data.content_template ? String(data.content_template) : null;
    const templatePath = template ? path.join(root, "src/_includes", template) : null;

    return {
      locale,
      file: rel(root, filePath),
      day: data.day === undefined ? null : Number(data.day),
      dayPath: data.day_path ? String(data.day_path) : null,
      slug: data.slug ? String(data.slug) : null,
      title: data.title ? String(data.title) : null,
      permalink: data.permalink ? String(data.permalink) : null,
      contentTemplate: template,
      contentTemplateFile: templatePath ? rel(root, templatePath) : null,
      contentTemplateExists: templatePath ? await exists(templatePath) : false,
      scripts
    };
  }));
}

function byDayPath(items: RouteShell[]): Map<string, RouteShell> {
  const map = new Map<string, RouteShell>();
  for (const item of items) {
    if (item.dayPath) {
      map.set(item.dayPath, item);
    }
  }
  return map;
}

function renderMarkdown(inventory: RefactorInventory): string {
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

function asStringRecord(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, String(entry)]));
}

function nestedRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? value as Record<string, unknown> : {};
}
