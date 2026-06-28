import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { PDFDocument, PDFName } from "pdf-lib";
import { loadArtifactBookDays } from "@lib/artifacts/book";
import { bookArtifactPaths, dayArtifactName, dayArtifactPaths, downloadArtifactPath } from "@lib/artifacts/downloads";
import { CHINESE_DAY_ONE_APPENDIX_PATTERNS, ENGLISH_DAY_ONE_APPENDIX_PATTERNS } from "@lib/checks/day-one-appendix-patterns";

const execFileAsync = promisify(execFile);

interface PdfCheckOptions {
  root: string;
}

interface PdfCheckResult {
  errors: string[];
}

interface PdfInfo {
  data: Buffer;
  pdf: PDFDocument;
  text: string;
}

type TextPatternCheck = [label: string, text: string, pattern: RegExp];

export async function checkPdf(options: PdfCheckOptions): Promise<PdfCheckResult> {
  const checker = new PdfChecker(options);
  return { errors: await checker.run() };
}

function hasPdfHeader(data: Buffer): boolean {
  return data.toString("latin1", 0, 5) === "%PDF-";
}

function textMatchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => {
    pattern.lastIndex = 0;
    return pattern.test(text);
  });
}

class PdfChecker {
  private readonly pdfCache = new Map<string, PdfInfo>();
  private readonly missingFiles = new Set<string>();
  private readonly errors: string[] = [];
  private readonly debug = process.env.PDF_CHECK_DEBUG === "1";

  constructor(private readonly options: PdfCheckOptions) {}

  async run(): Promise<string[]> {
    const pdfFiles = await this.collectPdfFiles();
    for (const file of pdfFiles) {
      await this.checkPdfHeaderTextAndLinks(file);
    }

    this.debugStep("extract edition text");
    const [standardPdf, deepDivePdf, zhPdf, zhDeepDivePdf] = bookArtifactPaths("pdf");
    const standardText = await this.extractPdfText(standardPdf);
    const deepDiveText = await this.extractPdfText(deepDivePdf);
    const zhText = await this.extractPdfText(zhPdf);
    const zhDeepDiveText = await this.extractPdfText(zhDeepDivePdf);
    const dayOneText = await this.extractPdfText(downloadArtifactPath(dayArtifactName("pdf", "en", "001-what-is-knowledge")));
    const zhDayOneText = await this.extractPdfText(downloadArtifactPath(dayArtifactName("pdf", "zh", "001-what-is-knowledge")));

    this.checkBookText(standardText, zhText);
    this.checkAppendixLabels(deepDiveText, dayOneText, zhDeepDiveText, zhDayOneText);
    this.checkAppendixContent(standardText, deepDiveText, dayOneText, zhText, zhDeepDiveText, zhDayOneText);

    return this.errors;
  }

  private async collectPdfFiles(): Promise<string[]> {
    const enDays = await loadArtifactBookDays(this.options.root, "en");
    const zhDays = await loadArtifactBookDays(this.options.root, "zh");
    return [
      ...bookArtifactPaths("pdf"),
      ...dayArtifactPaths("pdf", "en", enDays.map((day) => day.path)),
      ...dayArtifactPaths("pdf", "zh", zhDays.map((day) => day.path))
    ];
  }

  private async checkPdfHeaderTextAndLinks(file: string): Promise<void> {
    this.debugStep(`load ${file}`);
    if (!existsSync(this.absolute(file))) {
      this.reportMissing(file);
      return;
    }

    const info = await this.pdfInfo(file);
    const raw = info.data.toString("latin1");
    const annotationCount = countPdfAnnotations(info);

    if (!hasPdfHeader(info.data)) {
      this.errors.push(`${file} does not start with a PDF header`);
    }

    if (info.pdf.getPageCount() < 1) {
      this.errors.push(`${file} has no pages`);
    }

    if (!info.text.trim()) {
      this.errors.push(`${file} has no extractable text`);
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
      if (pattern.test(raw)) {
        this.errors.push(`${file} contains forbidden PDF link matching ${pattern}`);
      }
    }
  }

  private checkBookText(standardText: string, zhText: string): void {
    const checks: TextPatternCheck[] = [
      ["English PDF", standardText, /The Scientific Method/i],
      ["English PDF", standardText, /Probability as/i],
      ["Chinese PDF", zhText, /科学方法|证伪|概率/],
      ["Chinese PDF", zhText, /深入一百八十日/]
    ];
    for (const [label, text, pattern] of checks) {
      if (!pattern.test(text)) {
        this.errors.push(`${label} is missing core text matching ${pattern}`);
      }
    }
  }

  private checkAppendixLabels(
    deepDiveText: string,
    dayOneText: string,
    zhDeepDiveText: string,
    zhDayOneText: string
  ): void {
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

  private checkAppendixContent(
    standardText: string,
    deepDiveText: string,
    dayOneText: string,
    zhText: string,
    zhDeepDiveText: string,
    zhDayOneText: string
  ): void {
    for (const pattern of ENGLISH_DAY_ONE_APPENDIX_PATTERNS) {
      if (pattern.test(standardText)) this.errors.push(`Standard PDF contains deep-dive appendix content matching ${pattern}`);
      if (!pattern.test(deepDiveText)) this.errors.push(`Deep-dive PDF is missing appendix content matching ${pattern}`);
      if (!pattern.test(dayOneText)) this.errors.push(`Day-specific PDF is missing appendix content matching ${pattern}`);
    }

    for (const pattern of CHINESE_DAY_ONE_APPENDIX_PATTERNS) {
      if (pattern.test(zhText)) this.errors.push(`Standard Chinese PDF contains deep-dive appendix content matching ${pattern}`);
      if (!pattern.test(zhDeepDiveText)) this.errors.push(`Deep-dive Chinese PDF is missing appendix content matching ${pattern}`);
      if (!pattern.test(zhDayOneText)) this.errors.push(`Day-specific Chinese PDF is missing appendix content matching ${pattern}`);
    }

    const liveControlPatterns = [
      /Choose a door/,
      /How much rides on being right/,
      /Spouse raises the possibility of error/,
      /Expose to outside voices/,
      /Snap onto the coherence line/
    ];
    if (textMatchesAny(deepDiveText, liveControlPatterns)) {
      this.errors.push("Deep-dive PDF contains live interactive control text");
    }

    const zhLiveControlPatterns = [
      /选择一扇门/,
      /你拒绝哪一行/,
      /利害关系拨盘/,
      /配偶提出出错的可能性/,
      /正常运行的钟（知识）/,
      /接触外部声音/,
      /对 S 的置信度/,
      /吸附到融贯线上/
    ];
    if (textMatchesAny(zhDeepDiveText, zhLiveControlPatterns)) {
      this.errors.push("Deep-dive Chinese PDF contains live interactive control text");
    }
  }

  private async pdfInfo(pdfPath: string): Promise<PdfInfo> {
    const absolute = this.absolute(pdfPath);
    if (this.pdfCache.has(absolute)) return this.pdfCache.get(absolute)!;
    const data = await readFile(absolute);
    const pdf = await PDFDocument.load(data);
    const text = await popplerText(absolute);
    const info = { data, pdf, text };
    this.pdfCache.set(absolute, info);
    return info;
  }

  private async extractPdfText(pdfPath: string): Promise<string> {
    if (!existsSync(this.absolute(pdfPath))) {
      this.reportMissing(pdfPath);
      return "";
    }

    return (await this.pdfInfo(pdfPath)).text;
  }

  private absolute(relativePath: string): string {
    return path.join(this.options.root, relativePath);
  }

  private reportMissing(relativePath: string): void {
    if (this.missingFiles.has(relativePath)) return;
    this.missingFiles.add(relativePath);
    this.errors.push(`${relativePath} is missing`);
  }

  private debugStep(label: string): void {
    if (this.debug) console.error(`[check-pdf] ${label}`);
  }
}

async function popplerText(pdfPath: string): Promise<string> {
  const { stdout } = await execFileAsync("pdftotext", [pdfPath, "-"], {
    maxBuffer: 1024 * 1024 * 24,
    timeout: 60000
  });
  return String(stdout);
}

function countPdfAnnotations({ pdf }: PdfInfo): number {
  let count = 0;
  for (const page of pdf.getPages()) {
    const annotations = page.node.lookup(PDFName.of("Annots")) as { size?: () => number } | undefined;
    count += annotations?.size?.() ?? 0;
  }
  return count;
}
