import { readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { PDFDocument, PDFName } from "pdf-lib";
import { ghostscriptAllPagesText, ghostscriptBoundingBox, ghostscriptPagePpm } from "@lib/pdf";
import { escapeRegExp } from "@lib/text";
import { loadArtifactBookDays } from "@lib/artifacts/book";

export interface PdfCheckOptions {
  root: string;
  debug?: boolean;
}

export interface PdfCheckResult {
  errors: string[];
}

interface PdfInfo {
  data: Buffer;
  pdf: PDFDocument;
  pageTexts: string[];
  text: string;
}

type TextPatternCheck = [label: string, text: string, pattern: RegExp];
type PdfPatternCheck = [label: string, pdfPath: string, pattern: RegExp];

export async function checkPdf(options: PdfCheckOptions): Promise<PdfCheckResult> {
  const checker = new PdfChecker(options);
  return { errors: await checker.run() };
}

export function isFullPageBox([left, bottom, right, top]: number[]): boolean {
  return left <= 1 && bottom <= 1 && right >= 431 && top >= 647;
}

export function isWhitePixel(sample: number[]): boolean {
  return sample.every((channel) => channel > 250);
}

class PdfChecker {
  private readonly pdfCache = new Map<string, PdfInfo>();
  private readonly errors: string[] = [];
  private readonly debug: boolean;

  constructor(private readonly options: PdfCheckOptions) {
    this.debug = options.debug ?? process.env.PDF_CHECK_DEBUG === "1";
  }

  async run(): Promise<string[]> {
    const pdfFiles = await this.collectPdfFiles();
    for (const file of pdfFiles) {
      await this.checkPdfHeaderAndLinks(file);
    }

    this.debugStep("extract full text");
    const extractedText = await this.extractPdfText("_site/downloads/180-descent.pdf");
    const frontMatter = extractedText.split("THE 180-DAY MAP")[0] || "";
    const deepDiveText = await this.extractPdfText("_site/downloads/180-descent-deep-dive.pdf");
    const deepDiveFrontMatter = deepDiveText.split("THE 180-DAY MAP")[0] || "";
    const zhText = await this.extractPdfText("_site/downloads/180-descent-zh.pdf");
    const zhDeepDiveText = await this.extractPdfText("_site/downloads/180-descent-zh-deep-dive.pdf");
    const dayOneText = await this.extractPdfText("_site/downloads/180-descent-day-001-what-is-knowledge.pdf");
    const zhDayOneText = await this.extractPdfText("_site/downloads/180-descent-zh-day-001-what-is-knowledge.pdf");

    await this.checkAppendixLabels(deepDiveText, dayOneText, zhDeepDiveText, zhDayOneText);
    await this.checkAppendixBackgrounds();
    await this.checkAppendixSourceBackgrounds();
    this.checkForbiddenArtifacts(extractedText, frontMatter);
    this.checkToc(frontMatter);
    this.checkAppendixContent(extractedText, deepDiveText, dayOneText, zhText, zhDeepDiveText, zhDayOneText);
    await this.checkFullBleed(frontMatter, deepDiveFrontMatter);
    await this.checkRunningHeaders(frontMatter);

    return this.errors;
  }

  private async collectPdfFiles(): Promise<string[]> {
    const pdfFiles = [
      "_site/downloads/180-descent.pdf",
      "_site/downloads/180-descent-deep-dive.pdf",
      "_site/downloads/180-descent-zh.pdf",
      "_site/downloads/180-descent-zh-deep-dive.pdf"
    ];
    const enDays = await loadArtifactBookDays(this.options.root, "en");
    const zhDays = await loadArtifactBookDays(this.options.root, "zh");
    for (const day of enDays) {
      const file = `_site/downloads/180-descent-day-${day.path}.pdf`;
      if (existsSync(this.absolute(file))) pdfFiles.push(file);
    }
    for (const day of zhDays) {
      const file = `_site/downloads/180-descent-zh-day-${day.path}.pdf`;
      if (existsSync(this.absolute(file))) pdfFiles.push(file);
    }
    return pdfFiles;
  }

  private async checkPdfHeaderAndLinks(file: string): Promise<void> {
    this.debugStep(`load ${file}`);
    const info = await this.pdfInfo(file);
    const text = info.data.toString("latin1");
    const annotationCount = countPdfAnnotations(info);

    if (!text.startsWith("%PDF-")) {
      this.errors.push(`${file} does not start with a PDF header`);
    }

    if (annotationCount > 0) {
      this.errors.push(`${file} contains ${annotationCount} PDF annotation(s); PDF output must be non-interactive`);
    }

    for (const pattern of [
      /127\.0\.0\.1/,
      /localhost/i,
      /https:\/\/180-descent\.pages\.dev\/(?:zh\/)?days\//,
      /https:\/\/180-descent\.pages\.dev\/(?:zh\/)?introduction\//
    ]) {
      if (pattern.test(text)) {
        this.errors.push(`${file} contains forbidden PDF link matching ${pattern}`);
      }
    }
  }

  private async checkAppendixLabels(
    deepDiveText: string,
    dayOneText: string,
    zhDeepDiveText: string,
    zhDayOneText: string
  ): Promise<void> {
    const checks: TextPatternCheck[] = [
      ["Deep-dive PDF", deepDiveText, /Optional appendix/i],
      ["Day-specific PDF", dayOneText, /Optional appendix/i],
      ["Deep-dive Chinese PDF", zhDeepDiveText, /可选附录/],
      ["Day-specific Chinese PDF", zhDayOneText, /可选附录/]
    ];
    for (const [label, text, pattern] of checks) {
      if (!pattern.test(text)) {
        this.errors.push(`${label} is missing optional appendix label matching ${pattern}`);
      }
    }
  }

  private async checkAppendixBackgrounds(): Promise<void> {
    const checks: PdfPatternCheck[] = [
      ["Deep-dive PDF", "_site/downloads/180-descent-deep-dive.pdf", /OPTIONAL APPENDIX/i],
      ["Day-specific PDF", "_site/downloads/180-descent-day-001-what-is-knowledge.pdf", /OPTIONAL APPENDIX/i],
      ["Deep-dive Chinese PDF", "_site/downloads/180-descent-zh-deep-dive.pdf", /可选附录/],
      ["Day-specific Chinese PDF", "_site/downloads/180-descent-zh-day-001-what-is-knowledge.pdf", /可选附录/]
    ];
    for (const [label, pdfPath, pattern] of checks) {
      this.debugStep(`find appendix ${label}`);
      const appendixPage = await this.findFirstPageContaining(pdfPath, pattern);
      if (!appendixPage) {
        this.errors.push(`${label} is missing an appendix page matching ${pattern}`);
        continue;
      }
      for (const [xRatio, yRatio] of [[0.03, 0.03], [0.97, 0.97]]) {
        const sample = await this.samplePdfPagePixel(pdfPath, appendixPage, xRatio, yRatio);
        if (isWhitePixel(sample)) {
          this.errors.push(`${label} appendix page ${appendixPage} is missing a full-page background sample at ${xRatio},${yRatio}: ${sample.join(" ")}`);
          break;
        }
      }
    }
  }

  private async checkAppendixSourceBackgrounds(): Promise<void> {
    const checks: PdfPatternCheck[] = [
      ["Deep-dive PDF", "_site/downloads/180-descent-deep-dive.pdf", /Reference surveys/i],
      ["Day-specific PDF", "_site/downloads/180-descent-day-001-what-is-knowledge.pdf", /Reference surveys/i],
      ["Deep-dive Chinese PDF", "_site/downloads/180-descent-zh-deep-dive.pdf", /参考综述/],
      ["Day-specific Chinese PDF", "_site/downloads/180-descent-zh-day-001-what-is-knowledge.pdf", /参考综述/]
    ];
    for (const [label, pdfPath, pattern] of checks) {
      this.debugStep(`find appendix sources ${label}`);
      const appendixSourcePage = await this.findFirstPageContaining(pdfPath, pattern);
      if (!appendixSourcePage) {
        this.errors.push(`${label} is missing an appendix sources page matching ${pattern}`);
        continue;
      }
      const sample = await this.samplePdfPagePixel(pdfPath, appendixSourcePage, 0.5, 0.74);
      if (sample.every((channel) => channel > 250)) {
        this.errors.push(`${label} appendix sources page ${appendixSourcePage} has a white background sample: ${sample.join(" ")}`);
      }
    }
  }

  private checkForbiddenArtifacts(extractedText: string, frontMatter: string): void {
    for (const pattern of [/\[\[toc:/, /WHERE WE ARE/i, /PAGE\s+\d+\s*\/\s*\d+/, /THE 180-DAY DESCENT/]) {
      if (pattern.test(extractedText)) {
        this.errors.push(`PDF extracted text contains forbidden print artifact matching ${pattern}`);
      }
    }

    if (/^\s+\d+\.\s/m.test(frontMatter)) {
      this.errors.push("PDF TOC appears to use ordered-list numbering");
    }
  }

  private checkToc(frontMatter: string): void {
    for (const pattern of [
      /Introduction\s+\d+/,
      /BLOCK I · FOUNDATIONS OF KNOWLEDGE & REASONING\s+\d+/,
      /DAY 1\s+What Is Knowledge\?\s+\d+/,
      /DAY 2\s+The Scientific Method & Demarcation\s+\d+/
    ]) {
      if (!pattern.test(frontMatter)) {
        this.errors.push(`PDF TOC is missing right-aligned page number text matching ${pattern}`);
      }
    }
  }

  private checkAppendixContent(
    extractedText: string,
    deepDiveText: string,
    dayOneText: string,
    zhText: string,
    zhDeepDiveText: string,
    zhDayOneText: string
  ): void {
    for (const pattern of [
      /The Rest of the Map/,
      /The Skeptic['’]s Syllogism, as four exits/,
      /The Bank Cases/,
      /Safe vs\. Lucky, as nearby-worlds cases/,
      /The Edge of the Map/,
      /Bubble vs\. Chamber, as exposure outcomes/,
      /Accuracy domination, as credence geometry/
    ]) {
      if (pattern.test(extractedText)) this.errors.push(`Standard PDF contains deep-dive appendix content matching ${pattern}`);
      if (!pattern.test(deepDiveText)) this.errors.push(`Deep-dive PDF is missing appendix content matching ${pattern}`);
      if (!pattern.test(dayOneText)) this.errors.push(`Day-specific PDF is missing appendix content matching ${pattern}`);
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
      if (pattern.test(zhText)) this.errors.push(`Standard Chinese PDF contains deep-dive appendix content matching ${pattern}`);
      if (!pattern.test(zhDeepDiveText)) this.errors.push(`Deep-dive Chinese PDF is missing appendix content matching ${pattern}`);
      if (!pattern.test(zhDayOneText)) this.errors.push(`Day-specific Chinese PDF is missing appendix content matching ${pattern}`);
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
      if (pattern.test(deepDiveText)) this.errors.push(`Deep-dive PDF contains live interactive control text matching ${pattern}`);
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
      if (pattern.test(zhDeepDiveText)) this.errors.push(`Deep-dive Chinese PDF contains live interactive control text matching ${pattern}`);
    }
  }

  private async checkFullBleed(frontMatter: string, deepDiveFrontMatter: string): Promise<void> {
    for (const [label, pdfPath, matterText] of [
      ["PDF", "_site/downloads/180-descent.pdf", frontMatter],
      ["Deep-dive PDF", "_site/downloads/180-descent-deep-dive.pdf", deepDiveFrontMatter]
    ] as Array<[string, string, string]>) {
      this.debugStep(`validate full bleed ${label}`);
      const match = matterText.match(/BLOCK I · FOUNDATIONS OF KNOWLEDGE & REASONING\s+(\d+)/);
      if (!match) {
        this.errors.push(`${label} TOC is missing the Block I page number needed for full-bleed validation`);
        continue;
      }

      for (const pageNumber of [1, Number(match[1])]) {
        const box = await this.extractPageBoundingBox(pdfPath, pageNumber);
        if (!isFullPageBox(box)) {
          this.errors.push(`${label} page ${pageNumber} is not painted to the full 6x9 page bounds: ${box.join(" ")}`);
        }
      }
    }
  }

  private async checkRunningHeaders(frontMatter: string): Promise<void> {
    const blockMatch = frontMatter.match(/BLOCK I · FOUNDATIONS OF KNOWLEDGE & REASONING\s+(\d+)/);
    const introMatch = frontMatter.match(/Introduction\s+(\d+)/);
    const dayOneMatch = frontMatter.match(/DAY 1\s+What Is Knowledge\?\s+(\d+)/);
    if (introMatch && dayOneMatch) {
      const introPage = Number(introMatch[1]);
      const dayOnePage = Number(dayOneMatch[1]);
      for (const [pageNumber, section] of [
        [introPage, "Introduction"],
        [dayOnePage, "Foundations of Knowledge & Reasoning"]
      ] as Array<[number, string]>) {
        this.debugStep(`validate running header page ${pageNumber}`);
        const pageText = await this.extractPdfPageText("_site/downloads/180-descent.pdf", pageNumber);
        if (!new RegExp(`The 180-Day Descent\\s+${escapeRegExp(section)}`).test(pageText)) {
          this.errors.push(`PDF page ${pageNumber} is missing its running header`);
        }
        if (!new RegExp(`\\n\\s*${pageNumber}\\s*$`).test(pageText)) {
          this.errors.push(`PDF page ${pageNumber} is missing its right-aligned footer page number`);
        }
      }

      for (const pageNumber of [2, Number(blockMatch?.[1])].filter(Boolean) as number[]) {
        this.debugStep(`validate no running header page ${pageNumber}`);
        const pageText = await this.extractPdfPageText("_site/downloads/180-descent.pdf", pageNumber);
        if (/The 180-Day Descent\s+Foundations of Knowledge & Reasoning/.test(pageText) || new RegExp(`\\n\\s*${pageNumber}\\s*$`).test(pageText)) {
          this.errors.push(`PDF page ${pageNumber} should not have running header/footer text`);
        }
      }
    } else {
      this.errors.push("PDF TOC is missing page numbers needed for running-header validation");
    }
  }

  private async pdfInfo(pdfPath: string): Promise<PdfInfo> {
    const absolute = this.absolute(pdfPath);
    if (this.pdfCache.has(absolute)) return this.pdfCache.get(absolute)!;
    const data = await readFile(absolute);
    const pdf = await PDFDocument.load(data);
    const pageTexts = await ghostscriptAllPagesText(absolute, pdf.getPageCount());
    const info = { data, pdf, pageTexts, text: pageTexts.join("\n") };
    this.pdfCache.set(absolute, info);
    return info;
  }

  private async extractPdfText(pdfPath: string): Promise<string> {
    return (await this.pdfInfo(pdfPath)).text;
  }

  private async extractPdfPageText(pdfPath: string, pageNumber: number): Promise<string> {
    return (await this.pdfInfo(pdfPath)).pageTexts[pageNumber - 1] || "";
  }

  private async findFirstPageContaining(pdfPath: string, pattern: RegExp): Promise<number | null> {
    const { pageTexts } = await this.pdfInfo(pdfPath);
    for (const [index, text] of pageTexts.entries()) {
      pattern.lastIndex = 0;
      if (pattern.test(text)) return index + 1;
    }
    return null;
  }

  private async extractPageBoundingBox(pdfPath: string, pageNumber: number): Promise<number[]> {
    return ghostscriptBoundingBox(this.absolute(pdfPath), pageNumber);
  }

  private async samplePdfPagePixel(pdfPath: string, pageNumber: number, xRatio: number, yRatio: number): Promise<number[]> {
    const parsed = await ghostscriptPagePpm(this.absolute(pdfPath), pageNumber);
    const x = Math.max(0, Math.min(parsed.width - 1, Math.floor(parsed.width * xRatio)));
    const y = Math.max(0, Math.min(parsed.height - 1, Math.floor(parsed.height * yRatio)));
    const offset = parsed.dataOffset + ((y * parsed.width + x) * 3);
    const buffer = parsed.buffer;
    return [buffer[offset], buffer[offset + 1], buffer[offset + 2]];
  }

  private absolute(relativePath: string): string {
    return path.join(this.options.root, relativePath);
  }

  private debugStep(label: string): void {
    if (this.debug) console.error(`[check-pdf] ${label}`);
  }
}

function countPdfAnnotations({ pdf }: PdfInfo): number {
  let count = 0;
  for (const page of pdf.getPages()) {
    const annotations = page.node.lookup(PDFName.of("Annots")) as { size?: () => number } | undefined;
    count += annotations?.size?.() ?? 0;
  }
  return count;
}
