import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import JSZip from "jszip";
import { loadArtifactBookDays, type ArtifactBookDay } from "@lib/artifacts/book";
import { bookArtifactName, dayArtifactName, downloadsDir } from "@lib/artifacts/downloads";
import { compileCss } from "@lib/assets/css";
import { stripUnbundledKatexTtfSources } from "@lib/assets/fonts";
import { readBookData } from "@lib/data/book";
import type { Locale } from "@lib/schemas/day";
import { dayUrlPrefix, siteDayDir, sitePageFile, staticPageUrl } from "@lib/static-site/routes";
import { escapeXml } from "@lib/text/escape";

type CheerioRoot = ReturnType<typeof cheerio.load>;

interface BuildAllEpubsOptions {
  root: string;
}

interface EpubMeta {
  title: string;
  subtitle?: string;
  authors: string;
  translators?: string;
  language: string;
  publisher: string;
  epubIdentifier: string;
}

interface EpubConfig {
  root: string;
  locale: Locale;
  meta: EpubMeta;
  siteDayDir: string;
  dayUrlPrefix: string;
  introHtml: string | null;
  introUrl?: string;
  introTitle?: string;
  introLabel?: string;
  dayLabel: string;
  output: string;
  days?: ArtifactBookDay[];
  includeDeepDive?: boolean;
  singleDay?: boolean;
}

interface DayEpubConfig {
  root: string;
  locale: Locale;
  meta: EpubMeta;
  siteDayDir: string;
  dayUrlPrefix: string;
  dayLabel: string;
}

interface EpubImage {
  href: string;
  filePath: string;
  mediaType: string;
  id: string;
}

interface EpubFont {
  href: string;
  filePath: string;
  mediaType: string;
  id: string;
}

export async function buildAllEpubs(options: BuildAllEpubsOptions): Promise<void> {
  const root = options.root;
  const book = await readBookData(root);

  await mkdir(downloadsDir(root), { recursive: true });

  await buildEpub({
    root,
    locale: "en",
    meta: {
      title: book.title,
      subtitle: book.subtitle,
      authors: book.authors,
      language: book.language,
      publisher: book.publisher,
      epubIdentifier: book.epubIdentifier
    },
    siteDayDir: siteDayDir(root, "en"),
    dayUrlPrefix: dayUrlPrefix("en"),
    introHtml: sitePageFile(root, "en", "introduction"),
    introUrl: staticPageUrl("en", "introduction"),
    introTitle: "Introduction",
    introLabel: "Introduction",
    dayLabel: "Day",
    output: bookArtifactName("epub", "en", false)
  });

  await buildEpub({
    root,
    locale: "en",
    meta: {
      title: `${book.title}: Deep Dive Edition`,
      subtitle: book.deepDiveSubtitle,
      authors: book.authors,
      language: book.language,
      publisher: book.publisher,
      epubIdentifier: `${book.epubIdentifier}-deep-dive`
    },
    siteDayDir: siteDayDir(root, "en"),
    dayUrlPrefix: dayUrlPrefix("en"),
    introHtml: sitePageFile(root, "en", "introduction"),
    introUrl: staticPageUrl("en", "introduction"),
    introTitle: "Introduction",
    introLabel: "Introduction",
    dayLabel: "Day",
    output: bookArtifactName("epub", "en", true),
    includeDeepDive: true
  });

  await buildEpub({
    root,
    locale: "zh",
    meta: {
      title: book.zh.title,
      subtitle: book.zh.subtitle,
      authors: book.zh.authors,
      translators: book.zh.translators,
      language: book.zh.language,
      publisher: book.publisher,
      epubIdentifier: book.zh.epubIdentifier
    },
    siteDayDir: siteDayDir(root, "zh"),
    dayUrlPrefix: dayUrlPrefix("zh"),
    introHtml: sitePageFile(root, "zh", "introduction"),
    introUrl: staticPageUrl("zh", "introduction"),
    introTitle: "导言",
    introLabel: "导言",
    dayLabel: "第",
    output: bookArtifactName("epub", "zh", false)
  });

  await buildEpub({
    root,
    locale: "zh",
    meta: {
      title: `${book.zh.title}：专题深入版`,
      subtitle: book.zh.deepDiveSubtitle,
      authors: book.zh.authors,
      translators: book.zh.translators,
      language: book.zh.language,
      publisher: book.publisher,
      epubIdentifier: `${book.zh.epubIdentifier}-deep-dive`
    },
    siteDayDir: siteDayDir(root, "zh"),
    dayUrlPrefix: dayUrlPrefix("zh"),
    introHtml: sitePageFile(root, "zh", "introduction"),
    introUrl: staticPageUrl("zh", "introduction"),
    introTitle: "导言",
    introLabel: "导言",
    dayLabel: "第",
    output: bookArtifactName("epub", "zh", true),
    includeDeepDive: true
  });

  await buildDayEpubs({
    root,
    locale: "en",
    meta: {
      title: book.title,
      subtitle: book.subtitle,
      authors: book.authors,
      language: book.language,
      publisher: book.publisher,
      epubIdentifier: `${book.epubIdentifier}-day`
    },
    siteDayDir: siteDayDir(root, "en"),
    dayUrlPrefix: dayUrlPrefix("en"),
    dayLabel: "Day"
  });

  await buildDayEpubs({
    root,
    locale: "zh",
    meta: {
      title: book.zh.title,
      subtitle: book.zh.subtitle,
      authors: book.zh.authors,
      translators: book.zh.translators,
      language: book.zh.language,
      publisher: book.publisher,
      epubIdentifier: `${book.zh.epubIdentifier}-day`
    },
    siteDayDir: siteDayDir(root, "zh"),
    dayUrlPrefix: dayUrlPrefix("zh"),
    dayLabel: "第"
  });
}

async function buildDayEpubs(config: DayEpubConfig): Promise<void> {
  const days = await loadArtifactBookDays(config.root, config.locale);
  for (const day of days) {
    await buildEpub({
      ...config,
      meta: {
        ...config.meta,
        title: dayDocumentTitle(day, config),
        epubIdentifier: `${config.meta.epubIdentifier}-${String(dayNumber(day)).padStart(3, "0")}`
      },
      days: [day],
      introHtml: null,
      output: dayArtifactName("epub", config.locale, dayPath(day)),
      singleDay: true,
      includeDeepDive: true
    });
  }
}

async function buildEpub(config: EpubConfig): Promise<void> {
  const days = config.days ?? await loadArtifactBookDays(config.root, config.locale);

  const zip = new JSZip();
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.file("META-INF/container.xml", `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

  const oebps = requiredZipFolder(zip, "OEBPS");
  requiredZipFolder(oebps, "styles").file("book.css", await epubCss(config.root));
  const epubFonts = await collectEpubFonts(config.root);
  requiredZipFolder(oebps, "fonts");
  for (const font of epubFonts) {
    oebps.file(font.href, await readFile(font.filePath));
  }

  const spine: string[] = [];
  const imageAssets = new Map<string, EpubImage>();
  const manifestItems = [
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="css" href="styles/book.css" media-type="text/css"/>`
  ];

  if (config.introHtml && !config.singleDay) {
    const titlePage = titlePageDocument(config);
    oebps.file("title.xhtml", titlePage);
    manifestItems.push(xhtmlManifestItem("titlepage", "title.xhtml", titlePage));
    spine.push(`<itemref idref="titlepage"/>`);
  }

  spine.push(`<itemref idref="nav"/>`);

  if (config.introHtml) {
    const intro = await pageToXhtml(config.introHtml, config.introTitle ?? "", "introduction.xhtml", config, days, imageAssets);
    oebps.file("introduction.xhtml", intro);
    manifestItems.push(xhtmlManifestItem("intro", "introduction.xhtml", intro));
    spine.push(`<itemref idref="intro"/>`);
  }

  for (const day of days) {
    const htmlPath = path.join(config.siteDayDir, dayPath(day), "index.html");
    const title = dayDocumentTitle(day, config);
    const xhtml = await pageToXhtml(htmlPath, title, dayXhtml(day), config, days, imageAssets);
    oebps.file(dayXhtml(day), xhtml);
    manifestItems.push(xhtmlManifestItem(`day${String(dayNumber(day)).padStart(3, "0")}`, dayXhtml(day), xhtml));
    spine.push(`<itemref idref="day${String(dayNumber(day)).padStart(3, "0")}"/>`);
  }

  for (const image of imageAssets.values()) {
    oebps.file(image.href, await readFile(image.filePath));
    manifestItems.push(`<item id="${image.id}" href="${escapeXml(image.href)}" media-type="${image.mediaType}"/>`);
  }

  for (const font of epubFonts) {
    manifestItems.push(`<item id="${font.id}" href="${escapeXml(font.href)}" media-type="${font.mediaType}"/>`);
  }

  oebps.file("nav.xhtml", navDocument(days, config));
  oebps.file("content.opf", contentOpf(config.meta, manifestItems, spine));

  const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  await writeFile(path.join(downloadsDir(config.root), config.output), buffer);
}

async function pageToXhtml(
  htmlPath: string,
  title: string,
  selfHref: string,
  config: EpubConfig,
  days: ArtifactBookDay[],
  imageAssets: Map<string, EpubImage>
): Promise<string> {
  const html = await readFile(htmlPath, "utf8");
  const $ = cheerio.load(html);
  if (config.singleDay) {
    $(".lesson-nav").remove();
  }
  if (!config.includeDeepDive) {
    $(".deep-dive,.deep-dive-edition-only").remove();
  } else {
    $("details.deep-dive").each((_, details) => {
      const el = $(details);
      const labels = appendixLabels(config.meta.language);
      const heading = el.find("> summary .deep-dive-title").text().trim();
      if (!heading) {
        throw new Error(`Missing deep-dive title while building EPUB page ${selfHref}`);
      }
      const subtitle = el.find("> summary .deep-dive-sub").text().trim();
      const subtitleMarkup = subtitle ? `<p class="deep-dive-sub">${escapeXml(subtitle)}</p>` : "";
      el.find("> summary").replaceWith(`<header class="deep-dive-header">
<p class="deep-dive-kicker">${escapeXml(labels.kicker)}</p>
<h2 class="deep-dive-heading">${escapeXml(`${labels.headingPrefix}${heading}`)}</h2>
<p class="deep-dive-optional-note">${escapeXml(labels.note)}</p>
${subtitleMarkup}
</header>`);
      el.replaceWith(`<section class="deep-dive-epub">${el.html()}</section>`);
    });
  }
  $("script,.site-topbar,.site-footer,.download-strip,.web-only,.print-hide,.print-only:not(.epub-only)").remove();
  convertTipNotesToFootnotes($, config.meta.language, selfHref);
  $(".epub-only .ptitle").remove();
  $(".epub-only").removeClass("epub-only print-only format-alt").addClass("epub-alt");
  $("svg").attr("xmlns", "http://www.w3.org/2000/svg");
  $("a[href]").each((_, anchor) => {
    const el = $(anchor);
    const href = el.attr("href");
    if (!href) return;
    if (href.startsWith(config.dayUrlPrefix)) {
      const slug = href.slice(config.dayUrlPrefix.length).split("/")[0];
      const day = days.find((candidate) => dayPath(candidate) === slug);
      if (day) {
        const hash = href.includes("#") ? `#${href.split("#")[1]}` : "";
        el.attr("href", `${dayXhtml(day)}${hash}`);
      } else {
        el.attr("href", "nav.xhtml");
      }
    } else if (href === config.introUrl) {
      el.attr("href", "introduction.xhtml");
    } else if (href.startsWith("/") && !href.includes("/downloads/")) {
      el.attr("href", "nav.xhtml");
    }
  });
  $("img[src]").each((_, img) => {
    const el = $(img);
    const epubImage = registerEpubImage(el.attr("src"), imageAssets, config.root);
    if (!epubImage) return;

    el.attr("src", epubImage.href);
    el.removeAttr("srcset");
    el.removeAttr("sizes");
    el.removeAttr("data-light-src");
    el.removeAttr("data-dark-src");
  });
  const contentRoot = $("#content").length ? $("#content") : $("body");
  const body = contentRoot.contents().map((_, node) => $.xml(node)).get().join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${config.meta.language}">
  <head>
    <title>${escapeXml(title)}</title>
    <link rel="stylesheet" type="text/css" href="styles/book.css"/>
  </head>
  <body data-source="${escapeXml(selfHref)}">
    ${body}
  </body>
</html>`;
}

async function epubCss(root: string): Promise<string> {
  const css = await compileCss({ root });
  return normalizeEpubFontUrls(stripUnbundledKatexTtfSources(stripCjkFontFaces(css)))
    .replaceAll("@media print", "@media amzn-mobi")
    .replaceAll(".epub-only,.print-only,.format-alt{display:none;}", ".print-only{display:none;}.epub-alt{display:block;}")
    .replaceAll(".site-topbar,.site-footer,.download-strip,.web-only,.epub-only,.print-hide{display:none!important;}", ".site-topbar,.site-footer,.download-strip,.web-only,.print-only{display:none!important;}")
    + `
body{font-size:1em;}
.web-only,.print-only{display:none!important;}
.deep-dive{display:none!important;}
.deep-dive-epub{display:block!important;margin:2em 0 0;}
.deep-dive-header{margin:0 0 1.4em;}
.deep-dive-kicker{font-family:"IBM Plex Mono",monospace;font-size:.78em;letter-spacing:.12em;text-transform:uppercase;color:#777;margin:0 0 .35em;}
.deep-dive-heading{page-break-before:always;}
.deep-dive-optional-note{font-style:italic;color:#555;margin:.2em 0 .65em;}
.epub-alt{display:block!important;}
.epub-alt>.ptitle{display:none!important;}
.tip-note{display:inline!important;margin:0!important;vertical-align:baseline!important;}
.tip-note-mark,.tip-note-box{display:none!important;}
.tip-note-ref{display:inline!important;font-family:"IBM Plex Mono",monospace;font-size:.72em;font-weight:500;line-height:0;vertical-align:super;margin-left:.08em;color:#555;}
.tip-note-ref a{color:#555;text-decoration:none;border-bottom:0;}
.tip-footnotes{display:block!important;margin:1.6em 0 1.2em;padding-top:.75em;border-top:1px solid #ddd;font-size:.86em;line-height:1.45;color:#555;}
.tip-footnotes h2{font-family:"IBM Plex Mono",monospace;font-size:.82em;letter-spacing:.1em;text-transform:uppercase;color:#777;margin:0 0 .55em;}
.tip-footnotes ol{margin:0;padding-left:1.35em;}
.tip-footnotes li{margin:.35em 0;}
.tip-footnotes p{margin:0;}
.tip-note-back{font-size:.86em;color:#777;border-bottom:0;text-decoration:none;}
.bartrack{background:#f7f7f2!important;border:1px solid #9c9588!important;}
.barfill{display:block!important;min-height:1.1em!important;}
.barfill.orig{background:#2f7d52!important;}
.barfill.rep{background:#a23c34!important;}
.barfill.mid{background:#a9792b!important;}
@media (prefers-color-scheme: dark){
  .bartrack{background:#101820!important;border-color:#6d7a70!important;}
  .barfill.orig{background:#63c98d!important;}
  .barfill.rep{background:#e07168!important;}
  .barfill.mid{background:#d8ac5a!important;}
}
`;
}

function stripCjkFontFaces(css: string): string {
  return css.replace(/\/\* LXGW WenKai \[[^\]]+\] \*\/\s*@font-face\s*{[\s\S]*?}\s*/g, "");
}

function normalizeEpubFontUrls(css: string): string {
  return css.replaceAll("../../fonts/", "../fonts/");
}

async function collectEpubFonts(root: string): Promise<EpubFont[]> {
  const fontsRoot = path.join(root, "src/assets/fonts");
  const fonts: EpubFont[] = [];

  for (const fileName of await readdir(fontsRoot)) {
    if (fileName.endsWith(".woff2")) {
      fonts.push(epubFont(`fonts/${fileName}`, path.join(fontsRoot, fileName)));
    }
  }

  const katexRoot = path.join(fontsRoot, "katex");
  for (const fileName of await readdir(katexRoot)) {
    if (fileName.endsWith(".woff2") || fileName.endsWith(".woff")) {
      fonts.push(epubFont(`fonts/katex/${fileName}`, path.join(katexRoot, fileName)));
    }
  }

  return fonts;
}

function epubFont(href: string, filePath: string): EpubFont {
  const extension = path.extname(href).slice(1);
  return {
    href,
    filePath,
    mediaType: `font/${extension}`,
    id: href.replace(/[^a-z0-9]/gi, "_")
  };
}

function convertTipNotesToFootnotes($: CheerioRoot, language = "", selfHref = "document.xhtml"): void {
  const isZh = language.startsWith("zh");
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
  const scopeCandidates = $(".page,.lesson").toArray();
  const scopes = scopeCandidates.length ? scopeCandidates : [$("body").get(0)].filter(Boolean);
  const used = new Set<unknown>();

  scopes.forEach((scopeElement, scopeIndex) => {
    const scope = $(scopeElement);
    const notes = scope.find(".tip-note").toArray()
      .filter((note) => !used.has(note))
      .filter((note) => !$(note).closest(".tip-footnotes").length);

    if (!notes.length) return;

    const baseId = epubNoteBaseId(scope, selfHref, scopeIndex);
    const items: string[] = [];
    notes.forEach((noteElement, noteIndex) => {
      used.add(noteElement);
      const note = $(noteElement);
      const box = note.children(".tip-note-box").first();
      const text = (note.attr("data-tip-text") || box.attr("data-tip") || box.text()).trim();
      if (!text) return;

      const number = noteIndex + 1;
      const refId = `${baseId}-tip-ref-${number}`;
      const noteId = `${baseId}-tip-note-${number}`;
      note.children(".tip-note-mark").remove();
      box.remove();
      note.append(`<sup class="tip-note-ref" id="${refId}"><a href="#${noteId}" epub:type="noteref" aria-label="${escapeXml(`${labels.reference} ${number}`)}">${number}</a></sup>`);
      items.push(`<li id="${noteId}" epub:type="footnote"><p>${escapeXml(text)} <a class="tip-note-back" href="#${refId}">${escapeXml(labels.back)}</a></p></li>`);
    });

    if (!items.length) return;

    const section = `<section class="tip-footnotes" epub:type="footnotes" role="doc-endnotes"><h2>${escapeXml(labels.heading)}</h2><ol>${items.join("")}</ol></section>`;
    const sources = scope.find(".sources").first();
    if (sources.length) {
      sources.before(section);
    } else {
      scope.append(section);
    }
  });
}

function epubNoteBaseId(scope: ReturnType<CheerioRoot>, selfHref: string, scopeIndex: number): string {
  const id = scope.attr("id") || scope.attr("data-day-path") || scope.attr("data-reading-day") || `${selfHref}-${scopeIndex + 1}`;
  const base = String(id).replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "");
  return `tip-${base || `section-${scopeIndex + 1}`}`;
}

function navDocument(items: ArtifactBookDay[], config: EpubConfig): string {
  const titleLink = config.introHtml && !config.singleDay
    ? `<li><a href="title.xhtml">${escapeXml(config.meta.language.startsWith("zh") ? "书名页" : "Title Page")}</a></li>`
    : "";
  const introLink = config.introHtml
    ? `<li><a href="introduction.xhtml">${escapeXml(config.introLabel ?? "")}</a></li>`
    : "";
  const links = items.map((day) => {
    const label = config.meta.language.startsWith("zh")
      ? `第 ${dayNumber(day)} 日：${escapeXml(dayTitle(day))}`
      : `Day ${dayNumber(day)}: ${escapeXml(dayTitle(day))}`;
    return `<li><a href="${dayXhtml(day)}">${label}</a></li>`;
  }).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${config.meta.language}">
  <head><title>Table of Contents</title></head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>${escapeXml(config.meta.title)}</h1>
      <ol>
        ${titleLink}
        ${introLink}
        ${links}
      </ol>
    </nav>
  </body>
</html>`;
}

function contentOpf(meta: EpubMeta, manifestItems: string[], spine: string[]): string {
  const modified = "2026-06-19T00:00:00Z";
  const identifier = `urn:uuid:${epubUuidFromString(meta.epubIdentifier)}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${escapeXml(identifier)}</dc:identifier>
    <dc:title>${escapeXml(meta.title)}</dc:title>
    <dc:creator>${escapeXml(meta.authors)}</dc:creator>
    ${meta.translators ? `<dc:contributor id="translator">${escapeXml(meta.translators)}</dc:contributor>
    <meta refines="#translator" property="role" scheme="marc:relators">trl</meta>` : ""}
    <dc:language>${escapeXml(meta.language)}</dc:language>
    <dc:publisher>${escapeXml(meta.publisher)}</dc:publisher>
    <meta property="dcterms:modified">${modified}</meta>
  </metadata>
  <manifest>
    ${manifestItems.join("\n    ")}
  </manifest>
  <spine>
    ${spine.join("\n    ")}
  </spine>
</package>`;
}

function xhtmlManifestItem(id: string, href: string, xhtml: string, properties: string[] = []): string {
  const allProperties = [...properties];
  if (/<svg\b/i.test(xhtml)) allProperties.push("svg");
  const propertyAttr = allProperties.length ? ` properties="${allProperties.join(" ")}"` : "";
  return `<item id="${id}" href="${escapeXml(href)}" media-type="application/xhtml+xml"${propertyAttr}/>`;
}

function epubUuidFromString(value: string): string {
  const bytes = createHash("sha1").update(String(value)).digest();
  bytes[6] = (bytes[6] & 0x0f) | 0x50;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = bytes.subarray(0, 16).toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function registerEpubImage(src = "", imageAssets: Map<string, EpubImage>, root: string): EpubImage | null {
  const pathOnly = src.split(/[?#]/)[0];
  const href = epubImageHref(pathOnly);
  if (!href) return null;

  const extension = path.extname(pathOnly).toLowerCase();
  const mediaTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp"
  };
  const mediaType = mediaTypes[extension];
  if (!mediaType) return null;

  if (!imageAssets.has(href)) {
    imageAssets.set(href, {
      href,
      filePath: path.join(root, "_site", pathOnly.slice(1)),
      mediaType,
      id: `img_${href.replace(/[^a-z0-9]/gi, "_")}`
    });
  }

  return imageAssets.get(href) ?? null;
}

function epubImageHref(pathOnly: string): string {
  if (pathOnly.startsWith("/assets/images/")) {
    return pathOnly.replace(/^\/assets\/images\//, "images/");
  }
  if (pathOnly.startsWith("/_astro/")) {
    return `images/astro/${path.basename(pathOnly)}`;
  }
  return "";
}

function titlePageDocument(config: Pick<EpubConfig, "meta">): string {
  const isZh = config.meta.language.startsWith("zh");
  const authorLine = isZh ? `作者：${config.meta.authors}` : `By ${config.meta.authors}`;
  const translatorLine = config.meta.translators
    ? `<span class="credit-line">${escapeXml(isZh ? `翻译：${config.meta.translators}` : `Translated by ${config.meta.translators}`)}</span>`
    : "";
  const editorLine = `<span class="credit-line">${escapeXml(isZh ? "人工编辑：刘家昌" : "Human editor: Jason Lau")}</span>`;
  const subtitle = config.meta.subtitle ? `<p class="eyebrow">${escapeXml(config.meta.subtitle)}</p>` : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${config.meta.language}">
  <head>
    <title>${escapeXml(config.meta.title)}</title>
    <link rel="stylesheet" type="text/css" href="styles/book.css"/>
  </head>
  <body data-source="title.xhtml">
    <section class="epub-title-page page-hero wrap wide">
      ${subtitle}
      <h1>${escapeXml(config.meta.title)}</h1>
      <p class="sub book-credit"><span class="credit-line">${escapeXml(authorLine)}</span>${translatorLine}${editorLine}</p>
    </section>
  </body>
</html>`;
}

function dayDocumentTitle(day: ArtifactBookDay, config: Pick<EpubConfig | DayEpubConfig, "meta" | "dayLabel">): string {
  if (config.meta.language.startsWith("zh")) {
    return `${config.dayLabel} ${dayNumber(day)} 日：${dayTitle(day)}`;
  }
  return `${config.dayLabel} ${dayNumber(day)}: ${dayTitle(day)}`;
}

function appendixLabels(language = ""): {
  kicker: string;
  headingPrefix: string;
  note: string;
} {
  if (language.startsWith("zh")) {
    return {
      kicker: "可选附录",
      headingPrefix: "附录：",
      note: "本节是可选的补充阅读；可以放心跳过，不会影响正文课程。"
    };
  }
  return {
    kicker: "Optional appendix",
    headingPrefix: "Appendix: ",
    note: "This section is optional supplemental reading. You can skip it without losing the main lesson."
  };
}

function requiredZipFolder(zip: JSZip, name: string): JSZip {
  const folder = zip.folder(name);
  if (!folder) throw new Error(`Unable to create EPUB folder: ${name}`);
  return folder;
}

function dayNumber(day: ArtifactBookDay): number {
  return day.day;
}

function dayPath(day: ArtifactBookDay): string {
  return day.path;
}

function dayTitle(day: ArtifactBookDay): string {
  return day.title;
}

function dayXhtml(day: ArtifactBookDay): string {
  return day.xhtml;
}
