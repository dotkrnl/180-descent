import { mkdir, readFile, readdir, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import JSZip from "jszip";
import YAML from "yaml";
import { escapeXml } from "./lib/escape.mjs";
import { loadDays } from "./lib/days.mjs";

const book = YAML.parse(await readFile("src/_data/book.yaml", "utf8"));

await mkdir("_site/downloads", { recursive: true });
await mkdir("dist/downloads", { recursive: true });

await buildEpub({
  meta: {
    title: book.title,
    subtitle: book.subtitle,
    authors: book.authors,
    language: book.language,
    publisher: book.publisher,
    epub_identifier: book.epub_identifier
  },
  dayDir: "src/days",
  siteDayDir: "_site/days",
  dayUrlPrefix: "/days/",
  introHtml: "_site/introduction/index.html",
  introUrl: "/introduction/",
  introTitle: "Introduction",
  introLabel: "Introduction",
  dayLabel: "Day",
  output: "180-descent.epub"
});

await buildEpub({
  meta: {
    title: `${book.title}: Deep Dive Edition`,
    subtitle: book.deep_dive_subtitle,
    authors: book.authors,
    language: book.language,
    publisher: book.publisher,
    epub_identifier: `${book.epub_identifier}-deep-dive`
  },
  dayDir: "src/days",
  siteDayDir: "_site/days",
  dayUrlPrefix: "/days/",
  introHtml: "_site/introduction/index.html",
  introUrl: "/introduction/",
  introTitle: "Introduction",
  introLabel: "Introduction",
  dayLabel: "Day",
  output: "180-descent-deep-dive.epub",
  includeDeepDive: true
});

await buildEpub({
  meta: {
    title: book.zh.title,
    subtitle: book.zh.subtitle,
    authors: book.zh.authors,
    translators: book.zh.translators,
    language: book.zh.language,
    publisher: book.publisher,
    epub_identifier: book.zh.epub_identifier
  },
  dayDir: "src/zh/days",
  siteDayDir: "_site/zh/days",
  dayUrlPrefix: "/zh/days/",
  introHtml: "_site/zh/introduction/index.html",
  introUrl: "/zh/introduction/",
  introTitle: "导言",
  introLabel: "导言",
  dayLabel: "第",
  output: "180-descent-zh.epub"
});

await buildEpub({
  meta: {
    title: `${book.zh.title}：专题深入版`,
    subtitle: book.zh.deep_dive_subtitle,
    authors: book.zh.authors,
    translators: book.zh.translators,
    language: book.zh.language,
    publisher: book.publisher,
    epub_identifier: `${book.zh.epub_identifier}-deep-dive`
  },
  dayDir: "src/zh/days",
  siteDayDir: "_site/zh/days",
  dayUrlPrefix: "/zh/days/",
  introHtml: "_site/zh/introduction/index.html",
  introUrl: "/zh/introduction/",
  introTitle: "导言",
  introLabel: "导言",
  dayLabel: "第",
  output: "180-descent-zh-deep-dive.epub",
  includeDeepDive: true
});

await buildDayEpubs({
  meta: {
    title: book.title,
    subtitle: book.subtitle,
    authors: book.authors,
    language: book.language,
    publisher: book.publisher,
    epub_identifier: `${book.epub_identifier}-day`
  },
  dayDir: "src/days",
  siteDayDir: "_site/days",
  dayUrlPrefix: "/days/",
  dayLabel: "Day",
  outputPrefix: "180-descent-day"
});

await buildDayEpubs({
  meta: {
    title: book.zh.title,
    subtitle: book.zh.subtitle,
    authors: book.zh.authors,
    translators: book.zh.translators,
    language: book.zh.language,
    publisher: book.publisher,
    epub_identifier: `${book.zh.epub_identifier}-day`
  },
  dayDir: "src/zh/days",
  siteDayDir: "_site/zh/days",
  dayUrlPrefix: "/zh/days/",
  dayLabel: "第",
  outputPrefix: "180-descent-zh-day"
});

async function buildDayEpubs(config) {
  const days = await loadDays(config.dayDir, { xhtml: true });
  for (const day of days) {
    await buildEpub({
      ...config,
      meta: {
        ...config.meta,
        title: dayDocumentTitle(day, config),
        epub_identifier: `${config.meta.epub_identifier}-${String(day.data.day).padStart(3, "0")}`
      },
      days: [day],
      introHtml: null,
      output: `${config.outputPrefix}-${day.data.day_path}.epub`,
      singleDay: true,
      includeDeepDive: true
    });
  }
}

async function buildEpub(config) {
  const days = config.days || await loadDays(config.dayDir, { xhtml: true });

  const zip = new JSZip();
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.file("META-INF/container.xml", `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`);

  const oebps = zip.folder("OEBPS");
  oebps.folder("styles").file("book.css", await epubCss());
  const fontsFolder = oebps.folder("fonts");
  for (const font of await readdir("_site/assets/fonts")) {
    if (font.endsWith(".woff2")) {
      fontsFolder.file(font, await readFile(path.join("_site/assets/fonts", font)));
    }
  }

  const spine = [];
  const imageAssets = new Map();
  const manifestItems = [
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="css" href="styles/book.css" media-type="text/css"/>`
  ];

  if (config.introHtml && !config.singleDay) {
    oebps.file("title.xhtml", titlePageDocument(config));
    manifestItems.push(`<item id="titlepage" href="title.xhtml" media-type="application/xhtml+xml"/>`);
    spine.push(`<itemref idref="titlepage"/>`);
  }

  if (config.introHtml) {
    const intro = await pageToXhtml(config.introHtml, config.introTitle, "introduction.xhtml", config, days, imageAssets);
    oebps.file("introduction.xhtml", intro);
    manifestItems.push(`<item id="intro" href="introduction.xhtml" media-type="application/xhtml+xml"/>`);
    spine.push(`<itemref idref="intro"/>`);
  }

  for (const day of days) {
    const htmlPath = path.join(config.siteDayDir, day.data.day_path, "index.html");
    const title = dayDocumentTitle(day, config);
    const xhtml = await pageToXhtml(htmlPath, title, day.xhtml, config, days, imageAssets);
    oebps.file(day.xhtml, xhtml);
    manifestItems.push(`<item id="day${String(day.data.day).padStart(3, "0")}" href="${day.xhtml}" media-type="application/xhtml+xml"/>`);
    spine.push(`<itemref idref="day${String(day.data.day).padStart(3, "0")}"/>`);
  }

  for (const image of imageAssets.values()) {
    oebps.file(image.href, await readFile(image.filePath));
    manifestItems.push(`<item id="${image.id}" href="${escapeXml(image.href)}" media-type="${image.mediaType}"/>`);
  }

  for (const font of await readdir("_site/assets/fonts")) {
    if (font.endsWith(".woff2")) {
      manifestItems.push(`<item id="${font.replace(/[^a-z0-9]/gi, "_")}" href="fonts/${font}" media-type="font/woff2"/>`);
    }
  }

  oebps.file("nav.xhtml", navDocument(days, config));
  oebps.file("content.opf", contentOpf(config.meta, manifestItems, spine));

  const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
  await writeFile(`dist/downloads/${config.output}`, buffer);
  await copyFile(`dist/downloads/${config.output}`, `_site/downloads/${config.output}`);
}

async function pageToXhtml(htmlPath, title, selfHref, config, days, imageAssets) {
  const html = await readFile(htmlPath, "utf8");
  const $ = cheerio.load(html, { decodeEntities: true });
  if (config.singleDay) {
    $(".lesson-nav").remove();
  }
  if (!config.includeDeepDive) {
    $(".deep-dive,.deep-dive-edition-only").remove();
  } else {
    $("details.deep-dive").each((_, details) => {
      const el = $(details);
      const labels = appendixLabels(config.meta.language);
      const heading = el.find("> summary .deep-dive-title").text().trim() || labels.fallbackTitle;
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
  $("a[href]").each((_, a) => {
    const el = $(a);
    const href = el.attr("href");
    if (!href) return;
    if (href.startsWith(config.dayUrlPrefix)) {
      const slug = href.slice(config.dayUrlPrefix.length).split("/")[0];
      const day = days.find((d) => d.data.day_path === slug);
      if (day) {
        const anchor = href.includes("#") ? `#${href.split("#")[1]}` : "";
        el.attr("href", `${day.xhtml}${anchor}`);
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
    const epubImage = registerEpubImage(el.attr("src"), imageAssets);
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

async function epubCss() {
  const css = await readFile("src/assets/css/book.css", "utf8");
  return css
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

function convertTipNotesToFootnotes($, language = "", selfHref = "document.xhtml") {
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
  const scopeCandidates = $(".page,.lesson,.print-intro,.lesson-print").toArray();
  const scopes = scopeCandidates.length ? scopeCandidates : [$("body").get(0)].filter(Boolean);
  const used = new Set();

  scopes.forEach((scopeElement, scopeIndex) => {
    const scope = $(scopeElement);
    const notes = scope.find(".tip-note").toArray()
      .filter((note) => !used.has(note))
      .filter((note) => !$(note).closest(".tip-footnotes").length);

    if (!notes.length) return;

    const baseId = epubNoteBaseId(scope, selfHref, scopeIndex);
    const items = [];
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

function epubNoteBaseId(scope, selfHref, scopeIndex) {
  const id = scope.attr("id") || scope.attr("data-day-path") || scope.attr("data-reading-day") || `${selfHref}-${scopeIndex + 1}`;
  const base = String(id).replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-|-$/g, "");
  return `tip-${base || `section-${scopeIndex + 1}`}`;
}

function navDocument(items, config) {
  const titleLink = config.introHtml && !config.singleDay
    ? `<li><a href="title.xhtml">${escapeXml(config.meta.language.startsWith("zh") ? "书名页" : "Title Page")}</a></li>`
    : "";
  const introLink = config.introHtml
    ? `<li><a href="introduction.xhtml">${escapeXml(config.introLabel)}</a></li>`
    : "";
  const links = items.map((day) => {
    const label = config.meta.language.startsWith("zh")
      ? `第 ${day.data.day} 日：${escapeXml(day.data.title)}`
      : `Day ${day.data.day}: ${escapeXml(day.data.title)}`;
    return `<li><a href="${day.xhtml}">${label}</a></li>`;
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

function contentOpf(meta, manifestItems, spine) {
  const modified = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
  return `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="bookid" version="3.0">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="bookid">${escapeXml(meta.epub_identifier)}</dc:identifier>
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

function registerEpubImage(src = "", imageAssets) {
  const pathOnly = src.split(/[?#]/)[0];
  if (!pathOnly.startsWith("/assets/images/")) return null;

  const extension = path.extname(pathOnly).toLowerCase();
  const mediaTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".webp": "image/webp"
  };
  const mediaType = mediaTypes[extension];
  if (!mediaType) return null;

  const href = pathOnly.replace(/^\/assets\/images\//, "images/");
  if (!imageAssets.has(href)) {
    imageAssets.set(href, {
      href,
      filePath: path.join("_site", pathOnly.slice(1)),
      mediaType,
      id: `img_${href.replace(/[^a-z0-9]/gi, "_")}`
    });
  }

  return imageAssets.get(href);
}

function titlePageDocument(config) {
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

function dayDocumentTitle(day, config) {
  if (config.meta.language.startsWith("zh")) {
    return `${config.dayLabel} ${day.data.day} 日：${day.data.title}`;
  }
  return `${config.dayLabel} ${day.data.day}: ${day.data.title}`;
}

function appendixLabels(language = "") {
  if (language.startsWith("zh")) {
    return {
      kicker: "可选附录",
      headingPrefix: "附录：",
      fallbackTitle: "专题深入",
      note: "本节是可选的补充阅读；可以放心跳过，不会影响正文课程。"
    };
  }
  return {
    kicker: "Optional appendix",
    headingPrefix: "Appendix: ",
    fallbackTitle: "Deep Dive",
    note: "This section is optional supplemental reading. You can skip it without losing the main lesson."
  };
}
