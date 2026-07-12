import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { shouldRenderPdfFormatOnly } from "@lib/artifacts/pdf/xetex";

interface FormatOnlyPassage {
  media: string;
  body: string;
}

const introductions = [
  {
    file: "introduction.en.mdx",
    pdfCopy: "This deep-dive PDF includes optional appendices",
    epubCopy: "This deep-dive EPUB includes optional appendices"
  },
  {
    file: "introduction.zh.mdx",
    pdfCopy: "本专题深入版 PDF 在部分章节后收录了附录",
    epubCopy: "本专题深入版 EPUB 在部分章节正文后收录了附录"
  }
] as const;

describe("PDF FormatOnly media", () => {
  it.each(introductions)("selects only the PDF deep-dive copy from $file", async ({ file, pdfCopy, epubCopy }) => {
    const source = await readFile(path.join(process.cwd(), "src/app/content", file), "utf8");
    const passages = formatOnlyPassages(source);
    const deepDivePdf = selectedCopy(passages, true);
    const standardPdf = selectedCopy(passages, false);

    expect(deepDivePdf).toContain(pdfCopy);
    expect(deepDivePdf).not.toContain(epubCopy);
    expect(standardPdf).not.toContain(pdfCopy);
    expect(standardPdf).not.toContain(epubCopy);
  });
});

function formatOnlyPassages(source: string): FormatOnlyPassage[] {
  return [...source.matchAll(/<FormatOnly\b[^>]*\bmedia="([^"]+)"[^>]*>([\s\S]*?)<\/FormatOnly>/g)]
    .map((match) => ({ media: match[1], body: match[2] }));
}

function selectedCopy(passages: FormatOnlyPassage[], includeDeepDive: boolean): string {
  return passages
    .filter((passage) => shouldRenderPdfFormatOnly(passage.media, includeDeepDive))
    .map((passage) => passage.body)
    .join("\n");
}
