import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync, type SpawnSyncReturns } from "node:child_process";
import { existsSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import JSZip from "jszip";
import { loadArtifactBookDays, type ArtifactBookDay } from "@lib/artifacts/book";
import { bookArtifactPaths, dayArtifactName, downloadArtifactPath } from "@lib/artifacts/downloads";
import { CHINESE_DAY_ONE_APPENDIX_PATTERNS, ENGLISH_DAY_ONE_APPENDIX_PATTERNS } from "@lib/checks/day-one-appendix-patterns";
import { toError } from "@lib/errors";
import type { Locale } from "@lib/schemas/day";
import { epubcheckValidationCommands, type CommandSpec } from "@lib/tools/epubcheck";

interface EpubCheckOptions {
  root: string;
}

interface BaseEpubEdition {
  file: string;
  appendixPatterns: RegExp[];
  required: string[];
}

type EpubEdition = BaseEpubEdition & (
  | {
    deepDive: true;
    optionalAppendixLabel: RegExp;
  }
  | {
    deepDive: false;
  }
);

const BOOK_REQUIRED = [
  "mimetype",
  "META-INF/container.xml",
  "OEBPS/content.opf",
  "OEBPS/nav.xhtml",
  "OEBPS/introduction.xhtml",
  "OEBPS/day-001.xhtml",
  "OEBPS/day-002.xhtml"
];

export async function checkEpub(options: EpubCheckOptions): Promise<string[]> {
  const errors: string[] = [];
  const editions = await collectEpubEditions(options.root);

  for (const edition of editions) {
    await checkEpubEdition(options.root, edition, errors);
  }

  return errors;
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, hex: string) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, "\"")
    .replace(/&gt;/g, ">")
    .replace(/&lt;/g, "<")
    .replace(/&amp;/g, "&");
}

function isInsideSvg(text: string, index: number): boolean {
  const before = text.slice(0, index);
  return before.lastIndexOf("<svg") > before.lastIndexOf("</svg>");
}

async function collectEpubEditions(root: string): Promise<EpubEdition[]> {
  const [enStandard, enDeepDive, zhStandard, zhDeepDive] = bookArtifactPaths("epub");
  const editions: EpubEdition[] = [
    {
      file: enStandard,
      deepDive: false,
      appendixPatterns: ENGLISH_DAY_ONE_APPENDIX_PATTERNS,
      required: BOOK_REQUIRED
    },
    {
      file: enDeepDive,
      deepDive: true,
      appendixPatterns: ENGLISH_DAY_ONE_APPENDIX_PATTERNS,
      optionalAppendixLabel: /Optional appendix/,
      required: BOOK_REQUIRED
    },
    {
      file: zhStandard,
      deepDive: false,
      appendixPatterns: CHINESE_DAY_ONE_APPENDIX_PATTERNS,
      required: BOOK_REQUIRED
    },
    {
      file: zhDeepDive,
      deepDive: true,
      appendixPatterns: CHINESE_DAY_ONE_APPENDIX_PATTERNS,
      optionalAppendixLabel: /可选附录/,
      required: BOOK_REQUIRED
    }
  ];

  const enDays = await loadArtifactBookDays(root, "en");
  const zhDays = await loadArtifactBookDays(root, "zh");
  addPerDayEditions(editions, enDays, "en");
  addPerDayEditions(editions, zhDays, "zh");
  return editions;
}

function addPerDayEditions(editions: EpubEdition[], days: ArtifactBookDay[], locale: Locale): void {
  for (const day of days) {
    const file = downloadArtifactPath(dayArtifactName("epub", locale, day.path));
    const isZh = locale === "zh";

    const isDayOne = day.day === 1;
    const dayRequired = [
      "mimetype",
      "META-INF/container.xml",
      "OEBPS/content.opf",
      "OEBPS/nav.xhtml",
      `OEBPS/day-${String(day.day).padStart(3, "0")}.xhtml`
    ];
    editions.push({
      file,
      deepDive: true,
      appendixPatterns: isDayOne ? (isZh ? CHINESE_DAY_ONE_APPENDIX_PATTERNS : ENGLISH_DAY_ONE_APPENDIX_PATTERNS) : [],
      optionalAppendixLabel: isZh ? /可选附录/ : /Optional appendix/,
      required: dayRequired
    });
  }
}

async function checkEpubEdition(root: string, edition: EpubEdition, errors: string[]): Promise<void> {
  const absoluteFile = path.join(root, edition.file);
  if (!existsSync(absoluteFile)) {
    errors.push(`${edition.file} is missing`);
    return;
  }

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

  const epubcheck = runEpubcheck(absoluteFile);
  if (epubcheck.status !== 0) {
    errors.push([
      `${edition.file} failed official EPUBCheck`,
      epubcheck.stdout.trim(),
      epubcheck.stderr.trim()
    ].filter(Boolean).join("\n"));
  }
}

function runEpubcheck(absoluteFile: string): SpawnSyncReturns<string> {
  return spawnFirstAvailable(epubcheckValidationCommands(absoluteFile));
}

function spawnFirstAvailable(commands: CommandSpec[]): SpawnSyncReturns<string> {
  let lastResult: SpawnSyncReturns<string> | null = null;
  for (const [command, args] of commands) {
    const result = spawnSync(command, args, { encoding: "utf8" });
    lastResult = result;
    if (!result.error) return result;
  }

  const message = lastResult?.error ? toError(lastResult.error).message : "No EPUBCheck command configured";
  return {
    status: 1,
    signal: null,
    output: [null, "", message],
    pid: 0,
    stdout: "",
    stderr: message
  };
}

function checkDayOneAppendixContent(edition: EpubEdition, searchableDayOne: string, errors: string[]): void {
  if (edition.deepDive) {
    if (!edition.optionalAppendixLabel.test(searchableDayOne)) {
      errors.push(`${edition.file} is missing optional appendix label matching ${edition.optionalAppendixLabel}`);
    }
    for (const pattern of edition.appendixPatterns) {
      if (!pattern.test(searchableDayOne)) {
        errors.push(`${edition.file} is missing deep-dive appendix content matching ${pattern}`);
      }
    }
  } else {
    for (const pattern of edition.appendixPatterns) {
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
  if (/reference table/i.test(text) || /参考表/.test(text)) {
    errors.push(`${edition} contains generic reference-table label in ${name}`);
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
      parsed.error ? toError(parsed.error).message : "",
      parsed.stderr.trim()
    ].filter(Boolean).join("\n"));
  }
}
