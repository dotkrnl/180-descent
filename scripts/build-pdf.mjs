import { mkdir, copyFile, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { execFile } from "node:child_process";
import http from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { PDFDocument, PDFName, StandardFonts, rgb } from "pdf-lib";
import { chromium } from "playwright";

const execFileAsync = promisify(execFile);

await mkdir("_site/downloads", { recursive: true });
await mkdir("dist/downloads", { recursive: true });

const server = await serveSite("_site");
const publicBaseUrl = (process.env.SITE_URL || "https://180-descent.pages.dev").replace(/\/+$/, "");
const editions = [
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
    introTitle: "Chinese Edition",
    blockTitle: "Lessons"
  },
  {
    route: "/zh/print-deep/",
    output: "180-descent-zh-deep-dive.pdf",
    dayBasePath: "/zh/days/",
    introPath: "/zh/introduction/",
    bookTitle: "180 Descent",
    introTitle: "Chinese Edition",
    blockTitle: "Lessons",
    includeDeepDive: true
  }
];
const browser = await chromium.launch({ headless: true });

try {
  for (const edition of editions) {
    await buildEdition(edition);
  }
} finally {
  await browser.close();
  await server.close();
}

async function buildEdition(edition) {
  const page = await browser.newPage({ viewport: { width: 900, height: 1350 } });
  try {
    await page.goto(`${server.url}${edition.route}`, { waitUntil: "networkidle" });
    if (edition.includeDeepDive) {
      await page.evaluate(() => {
        for (const details of document.querySelectorAll("details.deep-dive")) {
          details.setAttribute("open", "");
        }
      });
    }
    await page.evaluate(({ baseUrl, dayBasePath, introPath }) => {
    const localOrigin = window.location.origin;
    const dayAnchors = new Map(
      [...document.querySelectorAll(".lesson-print[data-day-path]")]
        .map((article) => [`${dayBasePath}${article.dataset.dayPath}/`, article.id])
    );
    for (const anchor of document.querySelectorAll("a[href]")) {
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
    }, { baseUrl: publicBaseUrl, dayBasePath: edition.dayBasePath, introPath: edition.introPath });
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
      await stampRunningMatter(unstampedPath, `dist/downloads/${edition.output}`, { ...edition, blocks, tocPages });
      await copyFile(`dist/downloads/${edition.output}`, `_site/downloads/${edition.output}`);
    } finally {
      await rm(draftDir, { recursive: true, force: true });
    }
  } finally {
    await page.close();
  }
}

async function renderPdf(page, outputPath) {
  await page.pdf({
    path: outputPath,
    printBackground: true,
    preferCSSPageSize: true
  });
}

async function extractTocPages(pdfPath) {
  const markers = await ghostscriptPageMarkers(pdfPath);
  const pages = {};
  for (const marker of markers) {
    if (!(marker.key in pages)) pages[marker.key] = marker.page;
  }
  return pages;
}

async function stampRunningMatter(inputPath, outputPath, { blocks, tocPages, bookTitle, introTitle, blockTitle }) {
  const pdf = await PDFDocument.load(await readFile(inputPath));
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const pages = pdf.getPages();
  const blockRanges = blocks
    .map((block) => ({ ...block, title: blockTitle || block.title, page: Number(tocPages[block.id]) }))
    .filter((block) => Number.isFinite(block.page))
    .sort((a, b) => a.page - b.page);
  const excludedPages = new Set([
    1,
    2,
    ...blockRanges.map((block) => block.page)
  ]);

  for (const [index, pdfPage] of pages.entries()) {
    pdfPage.node.delete(PDFName.of("Annots"));

    const pageNumber = index + 1;
    if (excludedPages.has(pageNumber)) continue;

    const { width, height } = pdfPage.getSize();
    const sectionTitle = sectionTitleForPage(pageNumber, blockRanges, introTitle);
    const pageText = String(pageNumber);
    const color = rgb(0.38, 0.46, 0.49);
    const headerSize = 6.6;
    const footerSize = 7.2;
    const left = 39.6;
    const right = width - 39.6;

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

function sectionTitleForPage(pageNumber, blockRanges, introTitle) {
  let title = introTitle;
  for (const block of blockRanges) {
    if (pageNumber > block.page) title = block.title;
  }
  return title;
}

async function ghostscriptPageMarkers(pdfPath) {
  const pageCount = await ghostscriptPageCount(pdfPath);
  const markers = [];
  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const text = await ghostscriptPageText(pdfPath, pageNumber);
    for (const match of text.matchAll(/\[\[toc:([^\]]+)\]\]/g)) {
      markers.push({ key: match[1], page: pageNumber });
    }
  }
  return markers;
}

async function ghostscriptPageCount(pdfPath) {
  const { stdout } = await execFileAsync("gs", [
    "-q",
    "-dNOSAFER",
    "-dNODISPLAY",
    "-c",
    `${postScriptString(path.resolve(pdfPath))} (r) file runpdfbegin pdfpagecount = quit`
  ]);
  return Number(stdout.trim());
}

async function ghostscriptPageText(pdfPath, pageNumber) {
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

function postScriptString(value) {
  return `(${String(value).replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)")})`;
}

async function serveSite(root) {
  const absoluteRoot = path.resolve(root);
  const server = http.createServer(async (request, response) => {
    const url = new URL(request.url || "/", "http://127.0.0.1");
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith("/")) pathname += "index.html";
    const filePath = path.resolve(absoluteRoot, `.${pathname}`);

    if (!filePath.startsWith(absoluteRoot)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const ext = path.extname(filePath);
    const types = {
      ".css": "text/css; charset=utf-8",
      ".html": "text/html; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".pdf": "application/pdf",
      ".epub": "application/epub+zip",
      ".woff2": "font/woff2"
    };

    response.setHeader("Content-Type", types[ext] || "application/octet-stream");
    createReadStream(filePath)
      .on("error", () => {
        response.writeHead(404);
        response.end("Not found");
      })
      .pipe(response);
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  return {
    url: `http://127.0.0.1:${address.port}`,
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
  };
}
