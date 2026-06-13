import { readFile, mkdtemp, rm } from "node:fs/promises";
import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { PDFDocument, PDFName } from "pdf-lib";

const execFileAsync = promisify(execFile);
const debug = process.env.PDF_CHECK_DEBUG === "1";

let failures = 0;
const pdfCache = new Map();
const pdfFiles = [
  "_site/downloads/180-descent.pdf",
  "_site/downloads/180-descent-deep-dive.pdf",
  "_site/downloads/180-descent-zh.pdf",
  "_site/downloads/180-descent-zh-deep-dive.pdf",
  "_site/downloads/180-descent-day-001-what-is-knowledge.pdf",
  "_site/downloads/180-descent-zh-day-001-what-is-knowledge.pdf"
];

for (const file of pdfFiles) {
  debugStep(`load ${file}`);
  const info = await pdfInfo(file);
  const text = info.data.toString("latin1");
  const annotationCount = countPdfAnnotations(info);

  if (!text.startsWith("%PDF-")) {
    console.error(`${file} does not start with a PDF header`);
    failures++;
  }

  if (annotationCount > 0) {
    console.error(`${file} contains ${annotationCount} PDF annotation(s); PDF output must be non-interactive`);
    failures++;
  }

  for (const pattern of [
    /127\.0\.0\.1/,
    /localhost/i,
    /https:\/\/180-descent\.pages\.dev\/(?:zh\/)?days\//,
    /https:\/\/180-descent\.pages\.dev\/(?:zh\/)?introduction\//
  ]) {
    if (pattern.test(text)) {
      console.error(`${file} contains forbidden PDF link matching ${pattern}`);
      failures++;
    }
  }
}

debugStep("extract full text");
const extractedText = await extractPdfText("_site/downloads/180-descent.pdf");
const frontMatter = extractedText.split("THE 180-DAY MAP")[0] || "";
const deepDiveText = await extractPdfText("_site/downloads/180-descent-deep-dive.pdf");
const deepDiveFrontMatter = deepDiveText.split("THE 180-DAY MAP")[0] || "";
const zhText = await extractPdfText("_site/downloads/180-descent-zh.pdf");
const zhDeepDiveText = await extractPdfText("_site/downloads/180-descent-zh-deep-dive.pdf");
const dayOneText = await extractPdfText("_site/downloads/180-descent-day-001-what-is-knowledge.pdf");
const zhDayOneText = await extractPdfText("_site/downloads/180-descent-zh-day-001-what-is-knowledge.pdf");

for (const [label, text, pattern] of [
  ["Deep-dive PDF", deepDiveText, /Optional appendix/i],
  ["Day-specific PDF", dayOneText, /Optional appendix/i],
  ["Deep-dive Chinese PDF", zhDeepDiveText, /可选附录/],
  ["Day-specific Chinese PDF", zhDayOneText, /可选附录/]
]) {
  if (!pattern.test(text)) {
    console.error(`${label} is missing optional appendix label matching ${pattern}`);
    failures++;
  }
}

for (const [label, pdfPath, pattern] of [
  ["Deep-dive PDF", "_site/downloads/180-descent-deep-dive.pdf", /OPTIONAL APPENDIX/i],
  ["Day-specific PDF", "_site/downloads/180-descent-day-001-what-is-knowledge.pdf", /OPTIONAL APPENDIX/i],
  ["Deep-dive Chinese PDF", "_site/downloads/180-descent-zh-deep-dive.pdf", /可选附录/],
  ["Day-specific Chinese PDF", "_site/downloads/180-descent-zh-day-001-what-is-knowledge.pdf", /可选附录/]
]) {
  debugStep(`find appendix ${label}`);
  const appendixPage = await findFirstPageContaining(pdfPath, pattern);
  if (!appendixPage) {
    console.error(`${label} is missing an appendix page matching ${pattern}`);
    failures++;
    continue;
  }
  for (const [xRatio, yRatio] of [[0.03, 0.03], [0.97, 0.97]]) {
    const sample = await samplePdfPagePixel(pdfPath, appendixPage, xRatio, yRatio);
    if (isWhitePixel(sample)) {
      console.error(`${label} appendix page ${appendixPage} is missing a full-page background sample at ${xRatio},${yRatio}: ${sample.join(" ")}`);
      failures++;
      break;
    }
  }
}

for (const [label, pdfPath, pattern] of [
  ["Deep-dive PDF", "_site/downloads/180-descent-deep-dive.pdf", /Reference surveys/i],
  ["Day-specific PDF", "_site/downloads/180-descent-day-001-what-is-knowledge.pdf", /Reference surveys/i],
  ["Deep-dive Chinese PDF", "_site/downloads/180-descent-zh-deep-dive.pdf", /参考综述/],
  ["Day-specific Chinese PDF", "_site/downloads/180-descent-zh-day-001-what-is-knowledge.pdf", /参考综述/]
]) {
  debugStep(`find appendix sources ${label}`);
  const appendixSourcePage = await findFirstPageContaining(pdfPath, pattern);
  if (!appendixSourcePage) {
    console.error(`${label} is missing an appendix sources page matching ${pattern}`);
    failures++;
    continue;
  }
  const sample = await samplePdfPagePixel(pdfPath, appendixSourcePage, 0.5, 0.74);
  if (sample.every((channel) => channel > 250)) {
    console.error(`${label} appendix sources page ${appendixSourcePage} has a white background sample: ${sample.join(" ")}`);
    failures++;
  }
}

for (const pattern of [/\[\[toc:/, /WHERE WE ARE/i, /PAGE\s+\d+\s*\/\s*\d+/, /THE 180-DAY DESCENT/]) {
  if (pattern.test(extractedText)) {
    console.error(`PDF extracted text contains forbidden print artifact matching ${pattern}`);
    failures++;
  }
}

if (/^\s+\d+\.\s/m.test(frontMatter)) {
  console.error("PDF TOC appears to use ordered-list numbering");
  failures++;
}

for (const pattern of [
  /Introduction\s+\d+/,
  /BLOCK I · FOUNDATIONS OF KNOWLEDGE & REASONING\s+\d+/,
  /DAY 1\s+What Is Knowledge\?\s+\d+/,
  /DAY 2\s+The Scientific Method & Demarcation\s+\d+/
]) {
  if (!pattern.test(frontMatter)) {
    console.error(`PDF TOC is missing right-aligned page number text matching ${pattern}`);
    failures++;
  }
}

for (const pattern of [
  /The Rest of the Map/,
  /The Skeptic's Syllogism, as four exits/,
  /The Bank Cases/,
  /Safe vs\. Lucky, as nearby-worlds cases/,
  /The Edge of the Map/,
  /Bubble vs\. Chamber, as exposure outcomes/,
  /Accuracy domination, as credence geometry/
]) {
  if (pattern.test(extractedText)) {
    console.error(`Standard PDF contains deep-dive appendix content matching ${pattern}`);
    failures++;
  }
  if (!pattern.test(deepDiveText)) {
    console.error(`Deep-dive PDF is missing appendix fallback content matching ${pattern}`);
    failures++;
  }
  if (!pattern.test(dayOneText)) {
    console.error(`Day-specific PDF is missing appendix fallback content matching ${pattern}`);
    failures++;
  }
}

for (const pattern of [
  /地图的其余部分/,
  /怀疑论者的三段论：四种出路/,
  /银.案例：利害关系表/,
  /安全与幸运：邻近世界案例/,
  /地图的边缘/,
  /[气⽓]泡与回声室：接触后的结果/,
  /准确性.配，表现为置信度.何/
]) {
  if (pattern.test(zhText)) {
    console.error(`Standard Chinese PDF contains deep-dive appendix content matching ${pattern}`);
    failures++;
  }
  if (!pattern.test(zhDeepDiveText)) {
    console.error(`Deep-dive Chinese PDF is missing appendix fallback content matching ${pattern}`);
    failures++;
  }
  if (!pattern.test(zhDayOneText)) {
    console.error(`Day-specific Chinese PDF is missing appendix fallback content matching ${pattern}`);
    failures++;
  }
}

for (const pattern of [
  /Choose a door/,
  /How much rides on being right/,
  /Spouse raises the possibility of error/,
  /Working clock \(knowledge\)/,
  /Expose to outside voices/,
  /Credence in S/,
  /Snap onto the coherence line/
]) {
  if (pattern.test(deepDiveText)) {
    console.error(`Deep-dive PDF contains live interactive control text matching ${pattern}`);
    failures++;
  }
}

for (const pattern of [
  /选择一扇门/,
  /你拒绝哪一行/,
  /利害关系拨盘/,
  /配偶提出出错的可能性/,
  /正常运行的钟（知识）/,
  /接触外部声音/,
  /对 S 的置信度/,
  /吸附到融贯线上/
]) {
  if (pattern.test(zhDeepDiveText)) {
    console.error(`Deep-dive Chinese PDF contains live interactive control text matching ${pattern}`);
    failures++;
  }
}

const blockMatch = frontMatter.match(/BLOCK I · FOUNDATIONS OF KNOWLEDGE & REASONING\s+(\d+)/);
const introMatch = frontMatter.match(/Introduction\s+(\d+)/);
const dayOneMatch = frontMatter.match(/DAY 1\s+What Is Knowledge\?\s+(\d+)/);
for (const [label, pdfPath, matterText] of [
  ["PDF", "_site/downloads/180-descent.pdf", frontMatter],
  ["Deep-dive PDF", "_site/downloads/180-descent-deep-dive.pdf", deepDiveFrontMatter]
]) {
  debugStep(`validate full bleed ${label}`);
  const match = matterText.match(/BLOCK I · FOUNDATIONS OF KNOWLEDGE & REASONING\s+(\d+)/);
  if (!match) {
    console.error(`${label} TOC is missing the Block I page number needed for full-bleed validation`);
    failures++;
    continue;
  }

  for (const pageNumber of [1, Number(match[1])]) {
    const box = await extractPageBoundingBox(pdfPath, pageNumber);
    if (!isFullPageBox(box)) {
      console.error(`${label} page ${pageNumber} is not painted to the full 6x9 page bounds: ${box.join(" ")}`);
      failures++;
    }
  }
}

if (introMatch && dayOneMatch) {
  const introPage = Number(introMatch[1]);
  const dayOnePage = Number(dayOneMatch[1]);
  for (const [pageNumber, section] of [
    [introPage, "Introduction"],
    [dayOnePage, "Foundations of Knowledge & Reasoning"]
  ]) {
    debugStep(`validate running header page ${pageNumber}`);
    const pageText = await extractPdfPageText("_site/downloads/180-descent.pdf", pageNumber);
    if (!new RegExp(`The 180-Day Descent\\s+${escapeRegExp(section)}`).test(pageText)) {
      console.error(`PDF page ${pageNumber} is missing its running header`);
      failures++;
    }
    if (!new RegExp(`\\n\\s*${pageNumber}\\s*$`).test(pageText)) {
      console.error(`PDF page ${pageNumber} is missing its right-aligned footer page number`);
      failures++;
    }
  }

  for (const pageNumber of [2, Number(blockMatch?.[1])].filter(Boolean)) {
    debugStep(`validate no running header page ${pageNumber}`);
    const pageText = await extractPdfPageText("_site/downloads/180-descent.pdf", pageNumber);
    if (/The 180-Day Descent\s+Foundations of Knowledge & Reasoning/.test(pageText) || new RegExp(`\\n\\s*${pageNumber}\\s*$`).test(pageText)) {
      console.error(`PDF page ${pageNumber} should not have running header/footer text`);
      failures++;
    }
  }
} else {
  console.error("PDF TOC is missing page numbers needed for running-header validation");
  failures++;
}

process.exit(failures ? 1 : 0);

function debugStep(label) {
  if (debug) console.error(`[check-pdf] ${label}`);
}

async function pdfInfo(pdfPath) {
  if (pdfCache.has(pdfPath)) return pdfCache.get(pdfPath);
  const data = await readFile(pdfPath);
  const pdf = await PDFDocument.load(data);
  const pageTexts = await extractPdfPageTexts(pdfPath, pdf.getPageCount());
  const info = { data, pdf, pageTexts, text: pageTexts.join("\n") };
  pdfCache.set(pdfPath, info);
  return info;
}

async function extractPdfText(pdfPath) {
  return (await pdfInfo(pdfPath)).text;
}

async function extractPdfPageTexts(pdfPath, pageCount) {
  const workDir = await mkdtemp(path.join(tmpdir(), "180-descent-pdf-text-"));
  const outputPattern = path.join(workDir, "page-%03d.txt");
  try {
    await execFileAsync("gs", [
      "-q",
      "-dSAFER",
      "-dBATCH",
      "-dNOPAUSE",
      "-sDEVICE=txtwrite",
      `-sOutputFile=${outputPattern}`,
      pdfPath
    ], { maxBuffer: 1024 * 1024, timeout: 30000 });

    return Promise.all(Array.from({ length: pageCount }, async (_, index) => {
      const file = path.join(workDir, `page-${String(index + 1).padStart(3, "0")}.txt`);
      return readFile(file, "utf8").catch(() => "");
    }));
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

function countPdfAnnotations({ pdf }) {
  let count = 0;
  for (const page of pdf.getPages()) {
    count += page.node.lookup(PDFName.of("Annots"))?.size?.() ?? 0;
  }
  return count;
}

async function extractPdfPageText(pdfPath, pageNumber) {
  return (await pdfInfo(pdfPath)).pageTexts[pageNumber - 1] || "";
}

async function findFirstPageContaining(pdfPath, pattern) {
  const { pageTexts } = await pdfInfo(pdfPath);
  for (const [index, text] of pageTexts.entries()) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) return index + 1;
  }
  return null;
}

async function extractPageBoundingBox(pdfPath, pageNumber) {
  const { stdout, stderr } = await execFileAsync("gs", [
    "-q",
    "-dSAFER",
    "-dBATCH",
    "-dNOPAUSE",
    "-sDEVICE=bbox",
    `-dFirstPage=${pageNumber}`,
    `-dLastPage=${pageNumber}`,
    pdfPath
  ], { maxBuffer: 1024 * 1024, timeout: 15000 });
  const match = `${stdout}\n${stderr}`.match(/%%HiResBoundingBox:\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/);
  if (!match) return [Infinity, Infinity, -Infinity, -Infinity];
  return match.slice(1).map(Number);
}

async function samplePdfPagePixel(pdfPath, pageNumber, xRatio, yRatio) {
  const { stdout } = await execFileAsync("gs", [
    "-q",
    "-dSAFER",
    "-dBATCH",
    "-dNOPAUSE",
    "-sDEVICE=ppmraw",
    "-r12",
    `-dFirstPage=${pageNumber}`,
    `-dLastPage=${pageNumber}`,
    "-o",
    "-",
    pdfPath
  ], { encoding: "buffer", maxBuffer: 1024 * 1024, timeout: 15000 });

  const parsed = parsePpm(stdout);
  const x = Math.max(0, Math.min(parsed.width - 1, Math.floor(parsed.width * xRatio)));
  const y = Math.max(0, Math.min(parsed.height - 1, Math.floor(parsed.height * yRatio)));
  const offset = parsed.dataOffset + ((y * parsed.width + x) * 3);
  return [stdout[offset], stdout[offset + 1], stdout[offset + 2]];
}

function parsePpm(buffer) {
  let index = 0;
  const tokens = [];
  while (tokens.length < 4 && index < buffer.length) {
    while (index < buffer.length) {
      while (index < buffer.length && /\s/.test(String.fromCharCode(buffer[index]))) index++;
      if (buffer[index] !== 35) break;
      while (index < buffer.length && buffer[index] !== 10) index++;
    }
    const start = index;
    while (index < buffer.length && !/\s/.test(String.fromCharCode(buffer[index]))) index++;
    if (index > start) tokens.push(buffer.slice(start, index).toString("ascii"));
  }
  while (index < buffer.length && /\s/.test(String.fromCharCode(buffer[index]))) index++;
  if (tokens[0] !== "P6") throw new Error(`Unsupported PPM header: ${tokens.join(" ")}`);
  return {
    width: Number(tokens[1]),
    height: Number(tokens[2]),
    max: Number(tokens[3]),
    dataOffset: index
  };
}

function isFullPageBox([left, bottom, right, top]) {
  return left <= 1 && bottom <= 1 && right >= 431 && top >= 647;
}

function isWhitePixel(sample) {
  return sample.every((channel) => channel > 250);
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
