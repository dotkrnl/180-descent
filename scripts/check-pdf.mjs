import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { PDFDocument, PDFName } from "pdf-lib";

const execFileAsync = promisify(execFile);

let failures = 0;
const pdfFiles = [
  "_site/downloads/180-descent.pdf",
  "_site/downloads/180-descent-deep-dive.pdf",
  "_site/downloads/180-descent-zh.pdf",
  "_site/downloads/180-descent-zh-deep-dive.pdf"
];

for (const file of pdfFiles) {
  const data = await readFile(file);
  const text = data.toString("latin1");
  const annotationCount = await countPdfAnnotations(data);

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

const extractedText = await extractPdfText("_site/downloads/180-descent.pdf");
const frontMatter = extractedText.split("THE 180-DAY MAP")[0] || "";
const deepDiveText = await extractPdfText("_site/downloads/180-descent-deep-dive.pdf");
const zhText = await extractPdfText("_site/downloads/180-descent-zh.pdf");
const zhDeepDiveText = await extractPdfText("_site/downloads/180-descent-zh-deep-dive.pdf");

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
  /The Bank Cases, as a stakes table/,
  /Safe vs\. Lucky, as nearby-worlds cases/
]) {
  if (pattern.test(extractedText)) {
    console.error(`Standard PDF contains deep-dive appendix content matching ${pattern}`);
    failures++;
  }
  if (!pattern.test(deepDiveText)) {
    console.error(`Deep-dive PDF is missing appendix fallback content matching ${pattern}`);
    failures++;
  }
}

for (const pattern of [
  /地图的其余部分/,
  /怀疑论者的三段论：四种出路/,
  /银.案例：利害关系表/,
  /安全与幸运：邻近世界案例/
]) {
  if (pattern.test(zhText)) {
    console.error(`Standard Chinese PDF contains deep-dive appendix content matching ${pattern}`);
    failures++;
  }
  if (!pattern.test(zhDeepDiveText)) {
    console.error(`Deep-dive Chinese PDF is missing appendix fallback content matching ${pattern}`);
    failures++;
  }
}

for (const pattern of [
  /Choose a door/,
  /How much rides on being right/,
  /Spouse raises the possibility of error/,
  /Working clock \(knowledge\)/
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
  /正常运行的钟（知识）/
]) {
  if (pattern.test(zhDeepDiveText)) {
    console.error(`Deep-dive Chinese PDF contains live interactive control text matching ${pattern}`);
    failures++;
  }
}

const blockMatch = frontMatter.match(/BLOCK I · FOUNDATIONS OF KNOWLEDGE & REASONING\s+(\d+)/);
const introMatch = frontMatter.match(/Introduction\s+(\d+)/);
const dayOneMatch = frontMatter.match(/DAY 1\s+What Is Knowledge\?\s+(\d+)/);
if (blockMatch) {
  for (const pageNumber of [1, Number(blockMatch[1])]) {
    const box = await extractPageBoundingBox("_site/downloads/180-descent.pdf", pageNumber);
    if (!isFullPageBox(box)) {
      console.error(`PDF page ${pageNumber} is not painted to the full 6x9 page bounds: ${box.join(" ")}`);
      failures++;
    }
  }
} else {
  console.error("PDF TOC is missing the Block I page number needed for full-bleed validation");
  failures++;
}

if (introMatch && dayOneMatch) {
  const introPage = Number(introMatch[1]);
  const dayOnePage = Number(dayOneMatch[1]);
  for (const [pageNumber, section] of [
    [introPage, "Introduction"],
    [dayOnePage, "Foundations of Knowledge & Reasoning"]
  ]) {
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

if (failures) process.exit(1);

async function extractPdfText(pdfPath) {
  const { stdout } = await execFileAsync("gs", [
    "-q",
    "-dSAFER",
    "-dBATCH",
    "-dNOPAUSE",
    "-sDEVICE=txtwrite",
    "-o",
    "-",
    pdfPath
  ], { maxBuffer: 8 * 1024 * 1024 });
  return stdout;
}

async function countPdfAnnotations(data) {
  const pdf = await PDFDocument.load(data);
  let count = 0;
  for (const page of pdf.getPages()) {
    count += page.node.lookup(PDFName.of("Annots"))?.size?.() ?? 0;
  }
  return count;
}

async function extractPdfPageText(pdfPath, pageNumber) {
  const { stdout } = await execFileAsync("gs", [
    "-q",
    "-dSAFER",
    "-dBATCH",
    "-dNOPAUSE",
    "-sDEVICE=txtwrite",
    `-dFirstPage=${pageNumber}`,
    `-dLastPage=${pageNumber}`,
    "-o",
    "-",
    pdfPath
  ], { maxBuffer: 1024 * 1024 });
  return stdout;
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
  ], { maxBuffer: 1024 * 1024 });
  const match = `${stdout}\n${stderr}`.match(/%%HiResBoundingBox:\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)/);
  if (!match) return [Infinity, Infinity, -Infinity, -Infinity];
  return match.slice(1).map(Number);
}

function isFullPageBox([left, bottom, right, top]) {
  return left <= 1 && bottom <= 1 && right >= 431 && top >= 647;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
