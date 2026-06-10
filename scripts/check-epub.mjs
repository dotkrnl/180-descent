import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import JSZip from "jszip";

const data = await readFile("_site/downloads/180-descent.epub");
const zip = await JSZip.loadAsync(data);
const required = [
  "mimetype",
  "META-INF/container.xml",
  "OEBPS/content.opf",
  "OEBPS/nav.xhtml",
  "OEBPS/introduction.xhtml",
  "OEBPS/day-001.xhtml",
  "OEBPS/day-002.xhtml"
];

let failures = 0;
for (const file of required) {
  if (!zip.file(file)) {
    console.error(`EPUB missing ${file}`);
    failures++;
  }
}

const xmlFiles = Object.keys(zip.files).filter((file) => /\.(xhtml|opf|xml)$/i.test(file));
const xmlTemp = await mkdtemp(path.join(os.tmpdir(), "180-epub-xml-"));

for (const name of xmlFiles) {
  const text = await zip.file(name).async("string");
  if (/<script\b/i.test(text)) {
    console.error(`EPUB contains script tag in ${name}`);
    failures++;
  }
  if (/web-only/.test(text)) {
    console.error(`EPUB contains web-only content in ${name}`);
    failures++;
  }
  if (/print-hide/.test(text)) {
    console.error(`EPUB contains print-hidden content in ${name}`);
    failures++;
  }
  const namedEntities = text.match(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)[A-Za-z][A-Za-z0-9]+;/g);
  if (namedEntities) {
    console.error(`EPUB contains XML-unsafe named entities in ${name}: ${[...new Set(namedEntities)].join(", ")}`);
    failures++;
  }
  const orphanSvgTags = [...text.matchAll(/<(rect|path|line|circle|text|g|defs|marker|linearGradient|radialGradient|stop)\b/gi)]
    .filter((match) => !isInsideSvg(text, match.index || 0))
    .map((match) => match[1]);
  if (orphanSvgTags.length) {
    console.error(`EPUB contains SVG child tags outside <svg> in ${name}: ${[...new Set(orphanSvgTags)].join(", ")}`);
    failures++;
  }

  const tempPath = path.join(xmlTemp, name.replaceAll("/", "__"));
  await writeFile(tempPath, text);
  const parsed = spawnSync("xmllint", ["--noout", tempPath], { encoding: "utf8" });
  if (parsed.status !== 0) {
    console.error(`EPUB XML parse failed in ${name}`);
    if (parsed.stderr) console.error(parsed.stderr.trim());
    failures++;
  }
}

await rm(xmlTemp, { recursive: true, force: true });

if (failures) process.exit(1);

function isInsideSvg(text, index) {
  const before = text.slice(0, index);
  return before.lastIndexOf("<svg") > before.lastIndexOf("</svg>");
}
