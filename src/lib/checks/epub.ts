import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import JSZip from "jszip";
import { loadLegacyDays, type LegacyDay } from "@lib/content";

export interface EpubCheckOptions {
  root: string;
}

export interface EpubCheckResult {
  errors: string[];
}

interface EpubEdition {
  file: string;
  deepDive: boolean;
  appendixPatterns: RegExp[] | null;
  optionalPattern?: RegExp;
  required: string[];
}

const BOOK_REQUIRED = [
  "mimetype",
  "META-INF/container.xml",
  "OEBPS/content.opf",
  "OEBPS/nav.xhtml",
  "OEBPS/introduction.xhtml",
  "OEBPS/day-001.xhtml",
  "OEBPS/day-002.xhtml"
];

const ENGLISH_APPENDIX_PATTERNS = [
  /The Rest of the Map/,
  /The Skeptic&apos;s Syllogism, as four exits|The Skeptic's Syllogism, as four exits/,
  /The Bank Cases/,
  /Safe vs\. Lucky, as nearby-worlds cases/,
  /The Edge of the Map/,
  /Bubble vs\. Chamber, as exposure outcomes/,
  /Accuracy domination, as credence geometry/
];

const CHINESE_APPENDIX_PATTERNS = [
  /地图的其余部分/,
  /怀疑论者的三段论：四种出路/,
  /银行案例：利害关系表/,
  /安全与幸运：邻近世界案例/,
  /地图的边缘/,
  /[气⽓]泡与回声室：接触后的结果/,
  /准确性支配，表现为置信度几何/
];

export async function checkEpub(options: EpubCheckOptions): Promise<EpubCheckResult> {
  const errors: string[] = [];
  const editions = await collectEpubEditions(options.root);

  for (const edition of editions) {
    await checkEpubEdition(options.root, edition, errors);
  }

  return { errors };
}

export function decodeXmlEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}

export function isInsideSvg(text: string, index: number): boolean {
  const before = text.slice(0, index);
  return before.lastIndexOf("<svg") > before.lastIndexOf("</svg>");
}

async function collectEpubEditions(root: string): Promise<EpubEdition[]> {
  const editions: EpubEdition[] = [
    { file: "_site/downloads/180-descent.epub", deepDive: false, appendixPatterns: ENGLISH_APPENDIX_PATTERNS, required: BOOK_REQUIRED },
    { file: "_site/downloads/180-descent-deep-dive.epub", deepDive: true, appendixPatterns: ENGLISH_APPENDIX_PATTERNS, optionalPattern: /Optional appendix/, required: BOOK_REQUIRED },
    { file: "_site/downloads/180-descent-zh.epub", deepDive: false, appendixPatterns: CHINESE_APPENDIX_PATTERNS, required: BOOK_REQUIRED },
    { file: "_site/downloads/180-descent-zh-deep-dive.epub", deepDive: true, appendixPatterns: CHINESE_APPENDIX_PATTERNS, optionalPattern: /可选附录/, required: BOOK_REQUIRED }
  ];

  const enDays = await loadLegacyDays(path.join(root, "src/days"));
  const zhDays = await loadLegacyDays(path.join(root, "src/zh/days"));
  addPerDayEditions(root, editions, enDays, false);
  addPerDayEditions(root, editions, zhDays, true);
  return editions;
}

function addPerDayEditions(root: string, editions: EpubEdition[], days: LegacyDay[], zh: boolean): void {
  for (const day of days) {
    const dayPath = String(day.data.day_path);
    const dayNumber = Number(day.data.day);
    const file = zh
      ? `_site/downloads/180-descent-zh-day-${dayPath}.epub`
      : `_site/downloads/180-descent-day-${dayPath}.epub`;
    if (!existsSync(path.join(root, file))) continue;

    const isDayOne = dayNumber === 1;
    const dayRequired = [
      "mimetype",
      "META-INF/container.xml",
      "OEBPS/content.opf",
      "OEBPS/nav.xhtml",
      `OEBPS/day-${String(dayNumber).padStart(3, "0")}.xhtml`
    ];
    editions.push({
      file,
      deepDive: true,
      appendixPatterns: isDayOne ? (zh ? CHINESE_APPENDIX_PATTERNS : ENGLISH_APPENDIX_PATTERNS) : null,
      optionalPattern: zh ? /可选附录/ : /Optional appendix/,
      required: dayRequired
    });
  }
}

async function checkEpubEdition(root: string, edition: EpubEdition, errors: string[]): Promise<void> {
  const absoluteFile = path.join(root, edition.file);
  const data = await readFile(absoluteFile);
  const zip = await JSZip.loadAsync(data);

  for (const file of edition.required) {
    if (!zip.file(file)) {
      errors.push(`${edition.file} missing ${file}`);
    }
  }

  const dayOne = await zip.file("OEBPS/day-001.xhtml")?.async("string");
  if (dayOne) {
    checkDayOneAppendixContent(edition, decodeXmlEntities(dayOne), errors);
  }

  const xmlFiles = Object.keys(zip.files).filter((file) => /\.(xhtml|opf|xml)$/i.test(file));
  const xmlTemp = await mkdtemp(path.join(os.tmpdir(), "180-epub-xml-"));
  try {
    for (const name of xmlFiles) {
      const entry = zip.file(name);
      if (!entry) continue;

      const text = await entry.async("string");
      inspectEpubXml(edition.file, name, text, zip, errors);
      await lintXmlFile(edition.file, name, text, xmlTemp, errors);
    }
  } finally {
    await rm(xmlTemp, { recursive: true, force: true });
  }

  const epubcheck = spawnSync("epubcheck", [absoluteFile], { encoding: "utf8" });
  if (epubcheck.status !== 0) {
    errors.push([
      `${edition.file} failed official EPUBCheck`,
      epubcheck.stdout.trim(),
      epubcheck.stderr.trim()
    ].filter(Boolean).join("\n"));
  }
}

function checkDayOneAppendixContent(edition: EpubEdition, searchableDayOne: string, errors: string[]): void {
  const appendixPatterns = edition.appendixPatterns ?? [];

  if (edition.deepDive) {
    if (edition.optionalPattern && !edition.optionalPattern.test(searchableDayOne)) {
      errors.push(`${edition.file} is missing optional appendix label matching ${edition.optionalPattern}`);
    }
    for (const pattern of appendixPatterns) {
      if (!pattern.test(searchableDayOne)) {
        errors.push(`${edition.file} is missing deep-dive appendix content matching ${pattern}`);
      }
    }
  } else {
    for (const pattern of appendixPatterns) {
      if (pattern.test(searchableDayOne)) {
        errors.push(`${edition.file} contains deep-dive appendix content matching ${pattern}`);
      }
    }
  }
}

function inspectEpubXml(edition: string, name: string, text: string, zip: JSZip, errors: string[]): void {
  if (/<script\b/i.test(text)) {
    errors.push(`${edition} contains script tag in ${name}`);
  }
  if (/web-only/.test(text)) {
    errors.push(`${edition} contains web-only content in ${name}`);
  }
  if (/print-hide/.test(text)) {
    errors.push(`${edition} contains print-hidden content in ${name}`);
  }
  if (/Reference table/.test(text)) {
    errors.push(`${edition} contains generic fallback label in ${name}`);
  }
  for (const match of text.matchAll(/<img\b[^>]*\bsrc="([^"]+)"/gi)) {
    const src = match[1];
    if (/^(?:\/|https?:)/i.test(src)) {
      errors.push(`${edition} contains non-local EPUB image src in ${name}: ${src}`);
    } else if (src.startsWith("images/") && !zip.file(`OEBPS/${src}`)) {
      errors.push(`${edition} references missing EPUB image in ${name}: ${src}`);
    }
  }
  const namedEntities = text.match(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)[A-Za-z][A-Za-z0-9]+;/g);
  if (namedEntities) {
    errors.push(`${edition} contains XML-unsafe named entities in ${name}: ${[...new Set(namedEntities)].join(", ")}`);
  }
  const orphanSvgTags = [...text.matchAll(/<(rect|path|line|circle|text|g|defs|marker|linearGradient|radialGradient|stop)\b/gi)]
    .filter((match) => !isInsideSvg(text, match.index || 0))
    .map((match) => match[1]);
  if (orphanSvgTags.length) {
    errors.push(`${edition} contains SVG child tags outside <svg> in ${name}: ${[...new Set(orphanSvgTags)].join(", ")}`);
  }
}

async function lintXmlFile(edition: string, name: string, text: string, xmlTemp: string, errors: string[]): Promise<void> {
  const tempPath = path.join(xmlTemp, name.replaceAll("/", "__"));
  await writeFile(tempPath, text);
  const parsed = spawnSync("xmllint", ["--noout", tempPath], { encoding: "utf8" });
  if (parsed.status !== 0) {
    errors.push([
      `${edition} XML parse failed in ${name}`,
      parsed.stderr.trim()
    ].filter(Boolean).join("\n"));
  }
}
