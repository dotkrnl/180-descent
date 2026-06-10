import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const data = await readFile("_site/downloads/180-descent.pdf");
const text = data.toString("latin1");
let failures = 0;

if (!text.startsWith("%PDF-")) {
  console.error("PDF does not start with a PDF header");
  failures++;
}

for (const pattern of [
  /127\.0\.0\.1/,
  /localhost/i,
  /https:\/\/180-descent\.pages\.dev\/days\//,
  /https:\/\/180-descent\.pages\.dev\/introduction\//
]) {
  if (pattern.test(text)) {
    console.error(`PDF contains local development link matching ${pattern}`);
    failures++;
  }
}

const extractedText = await extractPdfText("_site/downloads/180-descent.pdf");
const frontMatter = extractedText.split("THE 180-DAY MAP")[0] || "";

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
