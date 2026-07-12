import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { PDFArray, PDFDict, PDFDocument, PDFHexString, PDFName, PDFString } from "pdf-lib";
import { loadArtifactBookDays, type ArtifactBookDay } from "@lib/artifacts/book";
import { bookArtifactPaths, dayArtifactName, dayArtifactPaths, downloadArtifactPath } from "@lib/artifacts/downloads";
import { CHINESE_DAY_ONE_APPENDIX_PATTERNS, ENGLISH_DAY_ONE_APPENDIX_PATTERNS } from "@lib/checks/day-one-appendix-patterns";
import { toError } from "@lib/errors";

const execFileAsync = promisify(execFile);
const FORBIDDEN_PDF_URI_PATTERNS = [
  /127\.0\.0\.1/,
  /localhost/i,
  /https:\/\/180-descent\.pages\.dev\/(?:zh\/)?days\//,
  /https:\/\/180-descent\.pages\.dev\/(?:zh\/)?introduction\//
];

interface PdfCheckOptions {
  root: string;
}

interface PdfInfo {
  pdf: PDFDocument;
  text: string;
}

interface PdfAnnotationUri {
  page: number;
  uri: string;
}

export interface PdfAnnotationInspection {
  count: number;
  uris: PdfAnnotationUri[];
}

type TextPatternCheck = [label: string, text: string | null, pattern: RegExp];

export async function checkPdf(options: PdfCheckOptions): Promise<string[]> {
  const checker = new PdfChecker(options);
  return checker.run();
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

function dayArtifactPathForDay(
  days: ArtifactBookDay[],
  locale: ArtifactBookDay["locale"],
  dayNumber: number
): string | null {
  const day = days.find((candidate) => candidate.day === dayNumber);
  return day ? downloadArtifactPath(dayArtifactName("pdf", locale, day.path)) : null;
}

class PdfChecker {
  private readonly pdfCache = new Map<string, PdfInfo>();
  private readonly missingFiles = new Set<string>();
  private readonly invalidFiles = new Set<string>();
  private readonly errors: string[] = [];
  private readonly debug = process.env.PDF_CHECK_DEBUG === "1";

  constructor(private readonly options: PdfCheckOptions) {}

  async run(): Promise<string[]> {
    const enDays = await loadArtifactBookDays(this.options.root, "en");
    const zhDays = await loadArtifactBookDays(this.options.root, "zh");
    const pdfFiles = this.collectPdfFiles(enDays, zhDays);
    for (const file of pdfFiles) {
      await this.checkPdfHeaderTextAndLinks(file);
    }

    this.debugStep("extract edition text");
    const [standardPdf, deepDivePdf, zhPdf, zhDeepDivePdf] = bookArtifactPaths("pdf");
    const standardText = await this.extractPdfText(standardPdf);
    const deepDiveText = await this.extractPdfText(deepDivePdf);
    const zhText = await this.extractPdfText(zhPdf);
    const zhDeepDiveText = await this.extractPdfText(zhDeepDivePdf);
    const dayOnePdf = dayArtifactPathForDay(enDays, "en", 1);
    const zhDayOnePdf = dayArtifactPathForDay(zhDays, "zh", 1);
    const dayOneText = dayOnePdf ? await this.extractPdfText(dayOnePdf) : null;
    const zhDayOneText = zhDayOnePdf ? await this.extractPdfText(zhDayOnePdf) : null;

    this.checkBookText(standardText, zhText);
    this.checkAppendixLabels(deepDiveText, dayOneText, zhDeepDiveText, zhDayOneText);
    this.checkAppendixContent(standardText, deepDiveText, dayOneText, zhText, zhDeepDiveText, zhDayOneText);

    return this.errors;
  }

  private collectPdfFiles(enDays: ArtifactBookDay[], zhDays: ArtifactBookDay[]): string[] {
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
    if (!info) return;
    const annotations = inspectPdfAnnotations(info.pdf);

    if (info.pdf.getPageCount() < 1) {
      this.errors.push(`${file} has no pages`);
    }

    if (!info.text.trim()) {
      this.errors.push(`${file} has no extractable text`);
    }

    if (annotations.count === 0) {
      this.errors.push(`${file} has no clickable PDF link annotations`);
    }

    if (!hasPdfOutlines(info)) {
      this.errors.push(`${file} has no PDF outline/bookmarks`);
    }

    this.checkPdfMetadata(file, info);

    this.errors.push(...forbiddenPdfAnnotationUriErrors(file, annotations.uris));
  }

  private checkPdfMetadata(file: string, info: PdfInfo): void {
    const metadata: Array<[label: string, value: string | undefined]> = [
      ["title", info.pdf.getTitle()],
      ["author", info.pdf.getAuthor()],
      ["subject", info.pdf.getSubject()],
      ["keywords", info.pdf.getKeywords()]
    ];

    for (const [label, value] of metadata) {
      if (!value?.trim()) {
        this.errors.push(`${file} is missing PDF ${label} metadata`);
      }
    }
  }

  private checkBookText(standardText: string | null, zhText: string | null): void {
    const checks: TextPatternCheck[] = [
      ["English PDF", standardText, /The Scientific Method/i],
      ["English PDF", standardText, /Probability as/i],
      ["Chinese PDF", zhText, /科学方法|证伪|概率/],
      ["Chinese PDF", zhText, /深入一百八十日/]
    ];
    for (const [label, text, pattern] of checks) {
      if (text !== null && !pattern.test(text)) {
        this.errors.push(`${label} is missing core text matching ${pattern}`);
      }
    }
  }

  private checkAppendixLabels(
    deepDiveText: string | null,
    dayOneText: string | null,
    zhDeepDiveText: string | null,
    zhDayOneText: string | null
  ): void {
    const checks: TextPatternCheck[] = [
      ["Deep-dive PDF", deepDiveText, /Optional appendix/i],
      ["Day-specific PDF", dayOneText, /Optional appendix/i],
      ["Deep-dive Chinese PDF", zhDeepDiveText, /可选附录/],
      ["Day-specific Chinese PDF", zhDayOneText, /可选附录/]
    ];
    for (const [label, text, pattern] of checks) {
      if (text !== null && !pattern.test(text)) {
        this.errors.push(`${label} is missing optional appendix label matching ${pattern}`);
      }
    }
  }

  private checkAppendixContent(
    standardText: string | null,
    deepDiveText: string | null,
    dayOneText: string | null,
    zhText: string | null,
    zhDeepDiveText: string | null,
    zhDayOneText: string | null
  ): void {
    for (const pattern of ENGLISH_DAY_ONE_APPENDIX_PATTERNS) {
      if (standardText !== null && pattern.test(standardText)) this.errors.push(`Standard PDF contains deep-dive appendix content matching ${pattern}`);
      if (deepDiveText !== null && !pattern.test(deepDiveText)) this.errors.push(`Deep-dive PDF is missing appendix content matching ${pattern}`);
      if (dayOneText !== null && !pattern.test(dayOneText)) this.errors.push(`Day-specific PDF is missing appendix content matching ${pattern}`);
    }

    for (const pattern of CHINESE_DAY_ONE_APPENDIX_PATTERNS) {
      if (zhText !== null && pattern.test(zhText)) this.errors.push(`Standard Chinese PDF contains deep-dive appendix content matching ${pattern}`);
      if (zhDeepDiveText !== null && !pattern.test(zhDeepDiveText)) this.errors.push(`Deep-dive Chinese PDF is missing appendix content matching ${pattern}`);
      if (zhDayOneText !== null && !pattern.test(zhDayOneText)) this.errors.push(`Day-specific Chinese PDF is missing appendix content matching ${pattern}`);
    }

    const liveControlPatterns = [
      /Choose a door/,
      /How much rides on being right/,
      /Spouse raises the possibility of error/,
      /Expose to outside voices/,
      /Snap onto the coherence line/
    ];
    if (deepDiveText !== null && textMatchesAny(deepDiveText, liveControlPatterns)) {
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
    if (zhDeepDiveText !== null && textMatchesAny(zhDeepDiveText, zhLiveControlPatterns)) {
      this.errors.push("Deep-dive Chinese PDF contains live interactive control text");
    }
  }

  private async pdfInfo(pdfPath: string): Promise<PdfInfo | null> {
    if (this.invalidFiles.has(pdfPath)) return null;

    const absolute = this.absolute(pdfPath);
    const cached = this.pdfCache.get(absolute);
    if (cached) return cached;
    const data = await readFile(absolute);

    if (!hasPdfHeader(data)) {
      this.invalidFiles.add(pdfPath);
      this.errors.push(`${pdfPath} does not start with a PDF header`);
      return null;
    }

    let pdf: PDFDocument;
    try {
      pdf = await PDFDocument.load(data);
    } catch (error) {
      this.invalidFiles.add(pdfPath);
      this.errors.push(`${pdfPath} cannot be parsed as PDF (${toError(error).message})`);
      return null;
    }

    const text = await popplerText(absolute);
    const info = { pdf, text };
    this.pdfCache.set(absolute, info);
    return info;
  }

  private async extractPdfText(pdfPath: string): Promise<string | null> {
    if (!existsSync(this.absolute(pdfPath))) {
      this.reportMissing(pdfPath);
      return null;
    }

    return (await this.pdfInfo(pdfPath))?.text ?? null;
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

export function inspectPdfAnnotations(pdf: PDFDocument): PdfAnnotationInspection {
  let count = 0;
  const uris: PdfAnnotationUri[] = [];

  for (const [pageIndex, page] of pdf.getPages().entries()) {
    const annotations = page.node.lookup(PDFName.Annots);
    if (!(annotations instanceof PDFArray)) continue;
    count += annotations.size();

    for (let index = 0; index < annotations.size(); index += 1) {
      const annotation = annotations.lookup(index);
      if (!(annotation instanceof PDFDict)) continue;
      const action = annotation.lookup(PDFName.of("A"));
      if (!(action instanceof PDFDict)) continue;
      const actionType = action.lookup(PDFName.of("S"));
      if (!(actionType instanceof PDFName) || actionType.decodeText() !== "URI") continue;
      const uri = action.lookup(PDFName.of("URI"));
      if (!(uri instanceof PDFString || uri instanceof PDFHexString)) continue;
      uris.push({ page: pageIndex + 1, uri: uri.decodeText() });
    }
  }

  return { count, uris };
}

export function forbiddenPdfAnnotationUriErrors(
  file: string,
  uris: readonly PdfAnnotationUri[]
): string[] {
  return uris.flatMap(({ page, uri }) => {
    return FORBIDDEN_PDF_URI_PATTERNS.some((pattern) => pattern.test(uri))
      ? [`${file} contains forbidden PDF annotation URI on page ${page}: ${JSON.stringify(uri)}`]
      : [];
  });
}

function hasPdfOutlines({ pdf }: PdfInfo): boolean {
  return Boolean(pdf.catalog.get(PDFName.of("Outlines")));
}
