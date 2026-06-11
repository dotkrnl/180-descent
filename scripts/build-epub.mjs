import { mkdir, readFile, readdir, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import * as cheerio from "cheerio";
import JSZip from "jszip";
import YAML from "yaml";

const book = YAML.parse(await readFile("src/_data/book.yaml", "utf8"));

await mkdir("_site/downloads", { recursive: true });
await mkdir("dist/downloads", { recursive: true });

await buildEpub({
  meta: {
    title: book.title,
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
    authors: book.zh.authors,
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
    authors: book.zh.authors,
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

async function buildEpub(config) {
  const dayFiles = (await readdir(config.dayDir)).filter((file) => file.endsWith(".md")).sort();
  const days = dayFiles.map((file) => {
    const parsed = matter.read(path.join(config.dayDir, file));
    return { file, data: parsed.data, xhtml: `day-${String(parsed.data.day).padStart(3, "0")}.xhtml` };
  });

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
  const manifestItems = [
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="css" href="styles/book.css" media-type="text/css"/>`
  ];

  const intro = await pageToXhtml(config.introHtml, config.introTitle, "introduction.xhtml", config, days);
  oebps.file("introduction.xhtml", intro);
  manifestItems.push(`<item id="intro" href="introduction.xhtml" media-type="application/xhtml+xml"/>`);
  spine.push(`<itemref idref="intro"/>`);

  for (const day of days) {
    const htmlPath = path.join(config.siteDayDir, day.data.day_path, "index.html");
    const title = `${config.dayLabel} ${day.data.day}: ${day.data.title}`;
    const xhtml = await pageToXhtml(htmlPath, title, day.xhtml, config, days);
    oebps.file(day.xhtml, xhtml);
    manifestItems.push(`<item id="day${String(day.data.day).padStart(3, "0")}" href="${day.xhtml}" media-type="application/xhtml+xml"/>`);
    spine.push(`<itemref idref="day${String(day.data.day).padStart(3, "0")}"/>`);
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

async function pageToXhtml(htmlPath, title, selfHref, config, days) {
  const html = await readFile(htmlPath, "utf8");
  const $ = cheerio.load(html, { decodeEntities: true });
  if (!config.includeDeepDive) {
    $(".deep-dive").remove();
  } else {
    $("details.deep-dive").each((_, details) => {
      const el = $(details);
      const heading = el.find("> summary .deep-dive-title").text().trim() || "Deep Dive Appendix";
      el.find("> summary").replaceWith(`<h2 class="deep-dive-heading">${escapeXml(heading)}</h2>`);
      el.replaceWith(`<section class="deep-dive-epub">${el.html()}</section>`);
    });
  }
  $("script,.site-topbar,.site-footer,.download-strip,.web-only,.print-hide,.print-only:not(.epub-only)").remove();
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
      }
    } else if (href === config.introUrl) {
      el.attr("href", "introduction.xhtml");
    } else if (href.startsWith("/") && !href.includes("/downloads/")) {
      el.attr("href", "nav.xhtml");
    }
  });
  const contentRoot = $("#content").length ? $("#content") : $("body");
  const body = contentRoot.contents().map((_, node) => $.xml(node)).get().join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="${config.meta.language}">
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
.deep-dive-heading{page-break-before:always;}
.epub-alt{display:block!important;}
.epub-alt>.ptitle{display:none!important;}
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

function navDocument(items, config) {
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
        <li><a href="introduction.xhtml">${escapeXml(config.introLabel)}</a></li>
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

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
