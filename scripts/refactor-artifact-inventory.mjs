import { createHash } from "node:crypto";
import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { PDFDocument } from "pdf-lib";

const root = process.cwd();
const downloadsDir = path.join(root, "_site/downloads");
const outputDir = path.join(root, "docs/refactor/inventory");
const jsonPath = path.join(outputDir, "artifact-inventory.json");
const markdownPath = path.join(outputDir, "artifact-inventory.md");

function posixPath(filePath) {
  return filePath.split(path.sep).join("/");
}

function rel(filePath) {
  return posixPath(path.relative(root, filePath));
}

function sha256(buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

async function listDownloadFiles() {
  const entries = await readdir(downloadsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(downloadsDir, entry.name))
    .filter((filePath) => /\.(?:epub|pdf)$/i.test(filePath))
    .sort((a, b) => rel(a).localeCompare(rel(b)));
}

function editionKind(fileName) {
  const stem = fileName.replace(/\.(?:epub|pdf)$/i, "");
  const locale = stem.includes("-zh") ? "zh" : "en";
  const deepDive = stem.includes("deep-dive");
  const dayMatch = stem.match(/day-(\d{3})-/);

  if (dayMatch) {
    return {
      scope: "per-day",
      locale,
      day: Number.parseInt(dayMatch[1], 10),
      deepDive: true
    };
  }

  return {
    scope: "book",
    locale,
    day: null,
    deepDive
  };
}

async function inspectPdf(filePath, data) {
  const pdf = await PDFDocument.load(data, { ignoreEncryption: true });
  return {
    pageCount: pdf.getPageCount(),
    title: pdf.getTitle() ?? null,
    author: pdf.getAuthor() ?? null,
    subject: pdf.getSubject() ?? null,
    creator: pdf.getCreator() ?? null,
    producer: pdf.getProducer() ?? null
  };
}

async function inspectEpub(filePath, data) {
  const zip = await JSZip.loadAsync(data);
  const entries = Object.keys(zip.files).filter((name) => !zip.files[name].dir).sort();
  const xhtmlEntries = entries.filter((name) => /\.xhtml$/i.test(name));
  const imageEntries = entries.filter((name) => /^OEBPS\/images\//.test(name));
  const cssEntries = entries.filter((name) => /\.css$/i.test(name));
  const opf = await zip.file("OEBPS/content.opf")?.async("string");
  const nav = await zip.file("OEBPS/nav.xhtml")?.async("string");

  return {
    entryCount: entries.length,
    xhtmlCount: xhtmlEntries.length,
    imageCount: imageEntries.length,
    cssCount: cssEntries.length,
    hasMimetype: zip.file("mimetype") !== null,
    hasContainer: zip.file("META-INF/container.xml") !== null,
    hasPackageDocument: opf !== undefined,
    hasNav: nav !== undefined,
    hasScripts: entries.some((entry) => /\.js$/i.test(entry)) || /<script\b/i.test(`${opf ?? ""}\n${nav ?? ""}`),
    sampleEntries: entries.slice(0, 12)
  };
}

async function inspectArtifact(filePath) {
  const data = await readFile(filePath);
  const fileStat = await stat(filePath);
  const fileName = path.basename(filePath);
  const format = path.extname(fileName).slice(1).toLowerCase();

  const base = {
    file: rel(filePath),
    fileName,
    format,
    bytes: fileStat.size,
    sha256: sha256(data),
    ...editionKind(fileName)
  };

  if (format === "pdf") {
    return {
      ...base,
      pdf: await inspectPdf(filePath, data)
    };
  }

  return {
    ...base,
    epub: await inspectEpub(filePath, data)
  };
}

function tableCell(value) {
  if (value === null || value === undefined || value === "") return "-";
  return String(value).replace(/\|/g, "\\|");
}

function markdownTable(headers, rows) {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map((row) => `| ${row.map(tableCell).join(" | ")} |`)
  ].join("\n");
}

function renderMarkdown(inventory) {
  const pdfs = inventory.artifacts.filter((artifact) => artifact.format === "pdf");
  const epubs = inventory.artifacts.filter((artifact) => artifact.format === "epub");

  return `${[
    "# Artifact Inventory Baseline",
    "",
    `Generated: ${inventory.generatedAt}`,
    "",
    "This report records generated EPUB/PDF structure after the current build. It is a migration coverage baseline, not a filename or layout compatibility promise.",
    "",
    "## Summary",
    "",
    `- EPUB files: ${epubs.length}`,
    `- PDF files: ${pdfs.length}`,
    `- Total artifact bytes: ${inventory.totalBytes}`,
    "",
    "## EPUBs",
    "",
    markdownTable(
      ["File", "Scope", "Locale", "Day", "Deep Dive", "Entries", "XHTML", "Images", "CSS", "Scripts"],
      epubs.map((artifact) => [
        artifact.file,
        artifact.scope,
        artifact.locale,
        artifact.day,
        artifact.deepDive,
        artifact.epub.entryCount,
        artifact.epub.xhtmlCount,
        artifact.epub.imageCount,
        artifact.epub.cssCount,
        artifact.epub.hasScripts ? "yes" : "no"
      ])
    ),
    "",
    "## PDFs",
    "",
    markdownTable(
      ["File", "Scope", "Locale", "Day", "Deep Dive", "Pages", "Bytes"],
      pdfs.map((artifact) => [
        artifact.file,
        artifact.scope,
        artifact.locale,
        artifact.day,
        artifact.deepDive,
        artifact.pdf.pageCount,
        artifact.bytes
      ])
    ),
    ""
  ].join("\n")}\n`;
}

const files = await listDownloadFiles();
const artifacts = [];
for (const filePath of files) {
  artifacts.push(await inspectArtifact(filePath));
}

const inventory = {
  generatedAt: new Date().toISOString(),
  downloadsDir: rel(downloadsDir),
  totalBytes: artifacts.reduce((sum, artifact) => sum + artifact.bytes, 0),
  artifacts
};

await mkdir(outputDir, { recursive: true });
await writeFile(jsonPath, `${JSON.stringify(inventory, null, 2)}\n`);
await writeFile(markdownPath, renderMarkdown(inventory));

console.log(`Wrote ${rel(jsonPath)}`);
console.log(`Wrote ${rel(markdownPath)}`);
