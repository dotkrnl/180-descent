import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import JSZip from "jszip";

const bookRequired = [
  "mimetype",
  "META-INF/container.xml",
  "OEBPS/content.opf",
  "OEBPS/nav.xhtml",
  "OEBPS/introduction.xhtml",
  "OEBPS/day-001.xhtml",
  "OEBPS/day-002.xhtml"
];
const dayRequired = [
  "mimetype",
  "META-INF/container.xml",
  "OEBPS/content.opf",
  "OEBPS/nav.xhtml",
  "OEBPS/day-001.xhtml"
];

let failures = 0;
const englishAppendixPatterns = [
  /The Rest of the Map/,
  /The Skeptic&apos;s Syllogism, as four exits|The Skeptic's Syllogism, as four exits/,
  /The Bank Cases, as a stakes table/,
  /Safe vs\. Lucky, as nearby-worlds cases/
];
const chineseAppendixPatterns = [
  /地图的其余部分/,
  /怀疑论者的三段论：四种出路/,
  /银行案例：利害关系表/,
  /安全与幸运：邻近世界案例/
];
const editions = [
  { file: "_site/downloads/180-descent.epub", deepDive: false, appendixPatterns: englishAppendixPatterns, required: bookRequired },
  { file: "_site/downloads/180-descent-deep-dive.epub", deepDive: true, appendixPatterns: englishAppendixPatterns, optionalPattern: /Optional appendix/, required: bookRequired },
  { file: "_site/downloads/180-descent-zh.epub", deepDive: false, appendixPatterns: chineseAppendixPatterns, required: bookRequired },
  { file: "_site/downloads/180-descent-zh-deep-dive.epub", deepDive: true, appendixPatterns: chineseAppendixPatterns, optionalPattern: /可选附录/, required: bookRequired },
  { file: "_site/downloads/180-descent-day-001-what-is-knowledge.epub", deepDive: true, appendixPatterns: englishAppendixPatterns, optionalPattern: /Optional appendix/, required: dayRequired },
  { file: "_site/downloads/180-descent-zh-day-001-what-is-knowledge.epub", deepDive: true, appendixPatterns: chineseAppendixPatterns, optionalPattern: /可选附录/, required: dayRequired }
];

for (const { file: edition, deepDive, appendixPatterns, optionalPattern, required } of editions) {
  const data = await readFile(edition);
  const zip = await JSZip.loadAsync(data);

  for (const file of required) {
    if (!zip.file(file)) {
      console.error(`${edition} missing ${file}`);
      failures++;
    }
  }

  const dayOne = await zip.file("OEBPS/day-001.xhtml")?.async("string");
  if (dayOne) {
    const searchableDayOne = decodeXmlEntities(dayOne);
    if (deepDive) {
      if (optionalPattern && !optionalPattern.test(searchableDayOne)) {
        console.error(`${edition} is missing optional appendix label matching ${optionalPattern}`);
        failures++;
      }
      for (const pattern of appendixPatterns) {
        if (!pattern.test(searchableDayOne)) {
          console.error(`${edition} is missing deep-dive appendix content matching ${pattern}`);
          failures++;
        }
      }
    } else {
      for (const pattern of appendixPatterns) {
        if (pattern.test(searchableDayOne)) {
          console.error(`${edition} contains deep-dive appendix content matching ${pattern}`);
          failures++;
        }
      }
    }
  }

  const xmlFiles = Object.keys(zip.files).filter((file) => /\.(xhtml|opf|xml)$/i.test(file));
  const xmlTemp = await mkdtemp(path.join(os.tmpdir(), "180-epub-xml-"));

  for (const name of xmlFiles) {
    const text = await zip.file(name).async("string");
    if (/<script\b/i.test(text)) {
      console.error(`${edition} contains script tag in ${name}`);
      failures++;
    }
    if (/web-only/.test(text)) {
      console.error(`${edition} contains web-only content in ${name}`);
      failures++;
    }
    if (/print-hide/.test(text)) {
      console.error(`${edition} contains print-hidden content in ${name}`);
      failures++;
    }
    if (/Reference table/.test(text)) {
      console.error(`${edition} contains generic fallback label in ${name}`);
      failures++;
    }
    const namedEntities = text.match(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)[A-Za-z][A-Za-z0-9]+;/g);
    if (namedEntities) {
      console.error(`${edition} contains XML-unsafe named entities in ${name}: ${[...new Set(namedEntities)].join(", ")}`);
      failures++;
    }
    const orphanSvgTags = [...text.matchAll(/<(rect|path|line|circle|text|g|defs|marker|linearGradient|radialGradient|stop)\b/gi)]
      .filter((match) => !isInsideSvg(text, match.index || 0))
      .map((match) => match[1]);
    if (orphanSvgTags.length) {
      console.error(`${edition} contains SVG child tags outside <svg> in ${name}: ${[...new Set(orphanSvgTags)].join(", ")}`);
      failures++;
    }

    const tempPath = path.join(xmlTemp, name.replaceAll("/", "__"));
    await writeFile(tempPath, text);
    const parsed = spawnSync("xmllint", ["--noout", tempPath], { encoding: "utf8" });
    if (parsed.status !== 0) {
      console.error(`${edition} XML parse failed in ${name}`);
      if (parsed.stderr) console.error(parsed.stderr.trim());
      failures++;
    }
  }

  await rm(xmlTemp, { recursive: true, force: true });
}

if (failures) process.exit(1);

function isInsideSvg(text, index) {
  const before = text.slice(0, index);
  return before.lastIndexOf("<svg") > before.lastIndexOf("</svg>");
}

function decodeXmlEntities(value) {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}
