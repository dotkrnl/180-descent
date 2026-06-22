import { createReadStream } from "node:fs";
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import http, { type Server } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { inflateSync } from "node:zlib";
import { PDFDocument, PDFName, StandardFonts, rgb } from "pdf-lib";
import { chromium, type Browser, type Page } from "playwright";
import { loadLegacyDays, type LegacyDay } from "@lib/content";
import { ghostscriptPageCount, ghostscriptText, postScriptString } from "@lib/pdf";
import { contentType } from "@lib/static-site";

export interface BuildAllPdfsOptions {
  root: string;
  siteUrl?: string;
}

interface ServedSite {
  url: string;
  close: () => Promise<void>;
}

interface PdfBuildContext {
  root: string;
  browser: Browser;
  server: ServedSite;
  publicBaseUrl: string;
}

interface PdfEdition {
  route: string;
  output: string;
  dayBasePath: string;
  introPath: string;
  bookTitle: string;
  introTitle: string;
  blockTitle?: string;
  includeDeepDive?: boolean;
}

interface TocBlock {
  id: string;
  title: string;
}

interface DayPdfConfig {
  dayDir: string;
  dayRoutePrefix: string;
  outputPrefix: string;
  bookTitle: string;
  language: string;
}

interface TocMarker {
  key: string;
  page: number;
}

export async function buildAllPdfs(options: BuildAllPdfsOptions): Promise<void> {
  const root = options.root;
  await mkdir(path.join(root, "_site/downloads"), { recursive: true });
  await mkdir(path.join(root, "dist/downloads"), { recursive: true });

  const server = await serveSite(path.join(root, "_site"));
  const publicBaseUrl = (options.siteUrl || process.env.SITE_URL || "https://180d.io").replace(/\/+$/, "");
  const editions: PdfEdition[] = [
    {
      route: "/print/",
      output: "180-descent.pdf",
      dayBasePath: "/days/",
      introPath: "/introduction/",
      bookTitle: "The 180-Day Descent",
      introTitle: "Introduction"
    },
    {
      route: "/print-deep/",
      output: "180-descent-deep-dive.pdf",
      dayBasePath: "/days/",
      introPath: "/introduction/",
      bookTitle: "The 180-Day Descent: Deep Dive",
      introTitle: "Introduction",
      includeDeepDive: true
    },
    {
      route: "/zh/print/",
      output: "180-descent-zh.pdf",
      dayBasePath: "/zh/days/",
      introPath: "/zh/introduction/",
      bookTitle: "180 Descent",
      introTitle: "Introduction",
      blockTitle: "Lessons"
    },
    {
      route: "/zh/print-deep/",
      output: "180-descent-zh-deep-dive.pdf",
      dayBasePath: "/zh/days/",
      introPath: "/zh/introduction/",
      bookTitle: "180 Descent",
      introTitle: "Introduction",
      blockTitle: "Lessons",
      includeDeepDive: true
    }
  ];
  const browser = await chromium.launch({ headless: true });

  try {
    const context = { root, browser, server, publicBaseUrl };
    for (const edition of editions) {
      await buildEdition(edition, context);
    }
    await buildDayPdfs({
      dayDir: path.join(root, "src/days"),
      dayRoutePrefix: "/days/",
      outputPrefix: "180-descent-day",
      bookTitle: "The 180-Day Descent",
      language: "en"
    }, context);
    await buildDayPdfs({
      dayDir: path.join(root, "src/zh/days"),
      dayRoutePrefix: "/zh/days/",
      outputPrefix: "180-descent-zh-day",
      bookTitle: "180 Descent",
      language: "zh-Hans"
    }, context);
  } finally {
    await browser.close();
    await server.close();
  }
}

async function buildEdition(edition: PdfEdition, context: PdfBuildContext): Promise<void> {
  const page = await context.browser.newPage({ viewport: { width: 900, height: 1350 } });
  try {
    await page.goto(`${context.server.url}${edition.route}`, { waitUntil: "networkidle" });
    if (edition.includeDeepDive) {
      await page.evaluate(markOptionalAppendicesScript);
    }
    await page.evaluate(({ baseUrl, dayBasePath, introPath }) => {
      const localOrigin = window.location.origin;
      const dayAnchors = new Map(
        [...document.querySelectorAll<HTMLElement>(".lesson-print[data-day-path]")]
          .map((article) => [`${dayBasePath}${article.dataset.dayPath}/`, article.id])
      );
      for (const anchor of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
        const href = anchor.getAttribute("href");
        if (!href || href.startsWith("#")) continue;

        const url = new URL(href, window.location.href);
        if (url.origin === localOrigin) {
          if (url.pathname === introPath) {
            anchor.setAttribute("href", "#intro");
          } else if (dayAnchors.has(url.pathname)) {
            anchor.setAttribute("href", `#${dayAnchors.get(url.pathname)}`);
          } else {
            anchor.setAttribute("href", `${baseUrl}${url.pathname}${url.search}${url.hash}`);
          }
        }
      }
    }, { baseUrl: context.publicBaseUrl, dayBasePath: edition.dayBasePath, introPath: edition.introPath });
    await page.evaluate(prepareTipFootnotesForPrintScript);
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: "print" });
    const blocks = await page.evaluate(() => {
      return [...document.querySelectorAll(".block-divider")].map((divider) => ({
        id: divider.querySelector(".print-dest")?.id || "",
        title: divider.querySelector("h1")?.textContent?.trim() || ""
      })).filter((block) => block.id && block.title);
    });
    const draftDir = await mkdtemp(path.join(tmpdir(), "180-descent-pdf-"));
    const draftPath = path.join(draftDir, "draft.pdf");
    const unstampedPath = path.join(draftDir, "unstamped.pdf");
    try {
      await renderPdf(page, draftPath);
      const tocPages = await extractTocPages(draftPath);
      await page.evaluate((pages) => {
        for (const [key, pageNumber] of Object.entries(pages)) {
          const target = document.querySelector(`[data-toc-page-for="${CSS.escape(key)}"]`);
          if (target) target.textContent = String(pageNumber);
        }
        for (const marker of document.querySelectorAll(".print-page-marker")) {
          marker.remove();
        }
      }, tocPages);
      await renderPdf(page, unstampedPath);
      const distPath = path.join(context.root, "dist/downloads", edition.output);
      const sitePath = path.join(context.root, "_site/downloads", edition.output);
      await stampRunningMatter(unstampedPath, distPath, { ...edition, blocks, tocPages });
      await copyFile(distPath, sitePath);
    } finally {
      await rm(draftDir, { recursive: true, force: true });
    }
  } finally {
    await page.close();
  }
}

async function renderPdf(page: Page, outputPath: string): Promise<void> {
  await loadPageImages(page);
  await page.pdf({
    path: outputPath,
    printBackground: true,
    preferCSSPageSize: true
  });
}

async function loadPageImages(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const images = [...document.images];
    await Promise.all(images.map(async (image) => {
      image.loading = "eager";
      if (!image.getAttribute("src") && image.dataset?.src) {
        image.setAttribute("src", image.dataset.src);
      }

      if (!image.complete) {
        await new Promise((resolve) => {
          image.addEventListener("load", resolve, { once: true });
          image.addEventListener("error", resolve, { once: true });
        });
      }

      if (typeof image.decode === "function") {
        await image.decode().catch(() => {});
      }
    }));
  });
}

async function buildDayPdfs(config: DayPdfConfig, context: PdfBuildContext): Promise<void> {
  const days = await loadLegacyDays(config.dayDir);
  for (const day of days) {
    await buildDayPdf(day, config, context);
  }
}

async function buildDayPdf(day: LegacyDay, config: DayPdfConfig, context: PdfBuildContext): Promise<void> {
  const page = await context.browser.newPage({ viewport: { width: 900, height: 1350 } });
  try {
    await page.goto(`${context.server.url}${config.dayRoutePrefix}${dayPath(day)}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => {
      const localOrigin = window.location.origin;
      document.body.classList.add("include-deep-dive");
      document.querySelectorAll(".lesson-nav").forEach((el) => el.remove());
      for (const anchor of document.querySelectorAll<HTMLAnchorElement>("a[href]")) {
        const href = anchor.getAttribute("href");
        if (!href || href.startsWith("#")) continue;

        const url = new URL(href, window.location.href);
        if (url.origin === localOrigin) {
          anchor.removeAttribute("href");
        }
      }
    });
    await page.evaluate(markOptionalAppendicesScript);
    await page.evaluate(prepareTipFootnotesForPrintScript);
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: "print" });

    const draftDir = await mkdtemp(path.join(tmpdir(), "180-descent-day-pdf-"));
    const draftPath = path.join(draftDir, "draft.pdf");
    const output = `${config.outputPrefix}-${dayPath(day)}.pdf`;
    try {
      await renderPdf(page, draftPath);
      const distPath = path.join(context.root, "dist/downloads", output);
      const sitePath = path.join(context.root, "_site/downloads", output);
      await finalizeDayPdf(draftPath, distPath, {
        bookTitle: config.bookTitle,
        sectionTitle: dayPdfHeaderTitle(day)
      });
      await copyFile(distPath, sitePath);
    } finally {
      await rm(draftDir, { recursive: true, force: true });
    }
  } finally {
    await page.close();
  }
}

async function finalizeDayPdf(inputPath: string, outputPath: string, { bookTitle, sectionTitle }: {
  bookTitle: string;
  sectionTitle: string;
}): Promise<void> {
  const pdf = await PDFDocument.load(await readFile(inputPath));
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  for (const [index, pdfPage] of pdf.getPages().entries()) {
    pdfPage.node.delete(PDFName.of("Annots"));
    if (index === 0) continue;

    const pageNumber = index + 1;
    const { width, height } = pdfPage.getSize();
    const color = rgb(0.38, 0.46, 0.49);
    const headerSize = 6.6;
    const footerSize = 7.2;
    const left = 39.6;
    const right = width - 39.6;
    const pageText = String(pageNumber);

    pdfPage.drawText(bookTitle, {
      x: left,
      y: height - 24,
      size: headerSize,
      font: regular,
      color
    });
    pdfPage.drawText(sectionTitle, {
      x: right - regular.widthOfTextAtSize(sectionTitle, headerSize),
      y: height - 24,
      size: headerSize,
      font: regular,
      color
    });
    pdfPage.drawText(pageText, {
      x: right - regular.widthOfTextAtSize(pageText, footerSize),
      y: 22,
      size: footerSize,
      font: regular,
      color
    });
  }

  await writeFile(outputPath, await pdf.save({ useObjectStreams: false }));
}

async function extractTocPages(pdfPath: string): Promise<Record<string, number>> {
  const markers = await ghostscriptPageMarkers(pdfPath);
  const pages: Record<string, number> = {};
  for (const marker of markers) {
    if (!(marker.key in pages)) pages[marker.key] = marker.page;
  }
  return pages;
}

async function stampRunningMatter(inputPath: string, outputPath: string, options: PdfEdition & {
  blocks: TocBlock[];
  tocPages: Record<string, number>;
}): Promise<void> {
  const pdf = await PDFDocument.load(await readFile(inputPath));
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  const blockRanges = options.blocks
    .map((block) => ({ ...block, title: options.blockTitle || block.title, page: Number(options.tocPages[block.id]) }))
    .filter((block) => Number.isFinite(block.page))
    .sort((a, b) => a.page - b.page);
  const blockPages = new Set(blockRanges.map((block) => block.page));
  const excludedPages = new Set([
    1,
    2,
    ...blockRanges.map((block) => block.page)
  ]);

  for (const [index, pdfPage] of pages.entries()) {
    pdfPage.node.delete(PDFName.of("Annots"));

    const pageNumber = index + 1;
    if (pageNumber === 1 || blockPages.has(pageNumber)) paintTealPageBackground(pdf, pdfPage);
    if (excludedPages.has(pageNumber)) continue;

    const { width, height } = pdfPage.getSize();
    const sectionTitle = sectionTitleForPage(pageNumber, blockRanges, options.introTitle);
    const pageText = String(pageNumber);
    const color = rgb(0.38, 0.46, 0.49);
    const headerSize = 6.6;
    const footerSize = 7.2;
    const left = 39.6;
    const right = width - 39.6;

    pdfPage.drawText(options.bookTitle, {
      x: left,
      y: height - 24,
      size: headerSize,
      font: regular,
      color
    });
    pdfPage.drawText(sectionTitle, {
      x: right - regular.widthOfTextAtSize(sectionTitle, headerSize),
      y: height - 24,
      size: headerSize,
      font: regular,
      color
    });
    pdfPage.drawText(pageText, {
      x: right - regular.widthOfTextAtSize(pageText, footerSize),
      y: 22,
      size: footerSize,
      font: regular,
      color
    });
  }

  await writeFile(outputPath, await pdf.save({ useObjectStreams: false }));
}

function paintTealPageBackground(pdf: PDFDocument, pdfPage: ReturnType<PDFDocument["getPages"]>[number]): void {
  const { Contents } = pdfPage.node.normalizedEntries();
  const pageBackgroundColor = ".0745 .3216 .3529 RG .0745 .3216 .3529 rg";
  const pageBackgroundPattern = /1 1 1 RG 1 1 1 rg(?=\n\/G\d+ gs\n0 0 [\d.]+ [\d.]+ re\nf)/;

  if (!Contents) {
    throw new Error("Unable to find page content streams for teal background replacement");
  }

  for (let index = 0; index < Contents.size(); index++) {
    const ref = Contents.get(index);
    const stream = pdf.context.lookup(ref);
    if (typeof (stream as { getContents?: unknown })?.getContents !== "function") continue;

    const decoded = decodePdfStream(stream);
    if (!pageBackgroundPattern.test(decoded)) continue;

    const updated = decoded.replace(pageBackgroundPattern, pageBackgroundColor);
    Contents.set(index, pdf.context.register(pdf.context.flateStream(updated)));
    return;
  }

  throw new Error("Unable to find full-bleed teal page background stream");
}

function decodePdfStream(stream: unknown): string {
  const pdfStream = stream as {
    getContents: () => Uint8Array;
    dict: {
      get: (name: PDFName) => { toString: () => string } | undefined;
    };
  };
  const contents = Buffer.from(pdfStream.getContents());
  const filter = pdfStream.dict.get(PDFName.of("Filter"))?.toString();
  if (filter === "/FlateDecode") return inflateSync(contents).toString("latin1");
  return contents.toString("latin1");
}

export function sectionTitleForPage(pageNumber: number, blockRanges: Array<{
  page: number;
  title: string;
}>, introTitle: string): string {
  let title = introTitle;
  for (const block of blockRanges) {
    if (pageNumber > block.page) title = block.title;
  }
  return title;
}

async function ghostscriptPageMarkers(pdfPath: string): Promise<TocMarker[]> {
  const pageCount = await ghostscriptPageCount(pdfPath);
  const markers: TocMarker[] = [];
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const text = await ghostscriptText(pdfPath, { firstPage: pageNumber, lastPage: pageNumber });
    for (const match of text.matchAll(/\[\[toc:([^\]]+)\]\]/g)) {
      markers.push({ key: match[1], page: pageNumber });
    }
  }
  return markers;
}

function dayPdfHeaderTitle(day: LegacyDay): string {
  return `Day ${dayNumber(day)}`;
}

const markOptionalAppendicesScript = String.raw`(() => {
  const isZh = document.documentElement.lang.startsWith("zh");
  const labels = isZh
    ? {
        kicker: "可选附录",
        headingPrefix: "附录：",
        note: "本节是可选的补充阅读；可以放心跳过，不会影响正文课程。"
      }
    : {
        kicker: "Optional appendix",
        headingPrefix: "Appendix: ",
        note: "This section is optional supplemental reading. You can skip it without losing the main lesson."
      };

  for (const details of document.querySelectorAll("details.deep-dive")) {
    details.setAttribute("open", "");
    const summary = details.querySelector(":scope > summary") || details.querySelector("summary");
    if (!summary) continue;

    const kicker = summary.querySelector(".ptitle");
    if (kicker) kicker.textContent = labels.kicker;

    const title = summary.querySelector(".deep-dive-title");
    if (title) {
      const current = (title.textContent || "").trim();
      if (!current.startsWith(labels.headingPrefix)) {
        title.textContent = labels.headingPrefix + current;
      }
    }

    if (!summary.querySelector(".deep-dive-optional-note")) {
      const note = document.createElement("span");
      note.className = "deep-dive-optional-note";
      note.textContent = labels.note;
      const subtitle = summary.querySelector(".deep-dive-sub");
      summary.insertBefore(note, subtitle || null);
    }
  }
})()`;

const prepareTipFootnotesForPrintScript = String.raw`(() => {
  function staticNoteBaseId(scope, scopeIndex) {
    const dataset = scope.dataset || {};
    const source = scope.id || dataset.dayPath || dataset.readingDay || "section-" + (scopeIndex + 1);
    const normalized = String(source).replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "");
    return "tip-" + (normalized || "section-" + (scopeIndex + 1));
  }

  const isZh = document.documentElement.lang.startsWith("zh");
  const labels = isZh
    ? {
        heading: "说明",
        reference: "说明",
        back: "返回"
      }
    : {
        heading: "Notes",
        reference: "Note",
        back: "Back"
      };
  const includeDeepDive = document.body.classList.contains("include-deep-dive");
  const scopeList = [
    ...document.querySelectorAll(".print-intro,.lesson-print,.lesson,.page")
  ];
  const scopes = scopeList.length ? scopeList : [document.body];
  const used = new Set();

  scopes.forEach((scope, scopeIndex) => {
    const notes = [...scope.querySelectorAll(".tip-note")]
      .filter((note) => !used.has(note))
      .filter((note) => !note.closest(".tip-footnotes"))
      .filter((note) => includeDeepDive || !note.closest(".deep-dive"));

    if (!notes.length) return;

    const baseId = staticNoteBaseId(scope, scopeIndex);
    const section = document.createElement("section");
    section.className = "tip-footnotes print-only";
    section.setAttribute("aria-label", labels.heading);

    const heading = document.createElement("h2");
    heading.textContent = labels.heading;
    section.appendChild(heading);

    const list = document.createElement("ol");
    section.appendChild(list);

    notes.forEach((note, noteIndex) => {
      used.add(note);
      const number = noteIndex + 1;
      const refId = baseId + "-tip-ref-" + number;
      const noteId = baseId + "-tip-note-" + number;
      const box = note.querySelector(":scope > .tip-note-box");
      const text = (note.getAttribute("data-tip-text") || (box && box.getAttribute("data-tip")) || (box && box.textContent) || "").trim();
      if (!text) return;

      const mark = note.querySelector(":scope > .tip-note-mark");
      if (mark) mark.remove();
      if (box) box.remove();

      const ref = document.createElement("sup");
      ref.className = "tip-note-ref";
      ref.id = refId;
      const link = document.createElement("a");
      link.href = "#" + noteId;
      link.setAttribute("aria-label", labels.reference + " " + number);
      link.textContent = String(number);
      ref.appendChild(link);
      note.appendChild(ref);

      const item = document.createElement("li");
      item.id = noteId;
      const paragraph = document.createElement("p");
      paragraph.textContent = text;
      const back = document.createElement("a");
      back.className = "tip-note-back";
      back.href = "#" + refId;
      back.textContent = labels.back;
      paragraph.append(" ");
      paragraph.appendChild(back);
      item.appendChild(paragraph);
      list.appendChild(item);
    });

    if (!list.children.length) return;

    const sources = scope.querySelector(".sources");
    if (sources && sources.parentNode) {
      sources.parentNode.insertBefore(section, sources);
    } else {
      scope.appendChild(section);
    }
  });
})()`;

async function serveSite(root: string): Promise<ServedSite> {
  const absoluteRoot = path.resolve(root);
  const server = http.createServer((request, response) => {
    void handleStaticRequest(absoluteRoot, request, response);
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") {
    throw new Error("Unable to determine local PDF server address");
  }
  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () => closeServer(server)
  };
}

async function handleStaticRequest(
  absoluteRoot: string,
  request: http.IncomingMessage,
  response: http.ServerResponse
): Promise<void> {
  const url = new URL(request.url || "/", "http://127.0.0.1");
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith("/")) pathname += "index.html";
  const filePath = path.resolve(absoluteRoot, `.${pathname}`);

  if (!isInsideDirectory(absoluteRoot, filePath)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  response.setHeader("Content-Type", contentType(filePath));
  createReadStream(filePath)
    .on("error", () => {
      response.writeHead(404);
      response.end("Not found");
    })
    .pipe(response);
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

function isInsideDirectory(directory: string, filePath: string): boolean {
  const relative = path.relative(directory, filePath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function dayNumber(day: LegacyDay): number {
  return Number(day.data.day);
}

function dayPath(day: LegacyDay): string {
  return String(day.data.day_path);
}
