import { mkdir, readFile, readdir, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import * as cheerio from "cheerio";
import JSZip from "jszip";
import YAML from "yaml";

const book = YAML.parse(await readFile("src/_data/book.yaml", "utf8"));
const dayFiles = (await readdir("src/days")).filter((file) => file.endsWith(".md")).sort();
const days = dayFiles.map((file) => {
  const parsed = matter.read(path.join("src/days", file));
  return { file, data: parsed.data, xhtml: `day-${String(parsed.data.day).padStart(3, "0")}.xhtml` };
});

await mkdir("_site/downloads", { recursive: true });
await mkdir("dist/downloads", { recursive: true });

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

const intro = await pageToXhtml("_site/introduction/index.html", "Introduction", "introduction.xhtml");
oebps.file("introduction.xhtml", intro);
manifestItems.push(`<item id="intro" href="introduction.xhtml" media-type="application/xhtml+xml"/>`);
spine.push(`<itemref idref="intro"/>`);

for (const day of days) {
  const htmlPath = path.join("_site/days", day.data.day_path, "index.html");
  const xhtml = await pageToXhtml(htmlPath, `Day ${day.data.day}: ${day.data.title}`, day.xhtml);
  oebps.file(day.xhtml, xhtml);
  manifestItems.push(`<item id="day${String(day.data.day).padStart(3, "0")}" href="${day.xhtml}" media-type="application/xhtml+xml"/>`);
  spine.push(`<itemref idref="day${String(day.data.day).padStart(3, "0")}"/>`);
}

for (const font of await readdir("_site/assets/fonts")) {
  if (font.endsWith(".woff2")) {
    manifestItems.push(`<item id="${font.replace(/[^a-z0-9]/gi, "_")}" href="fonts/${font}" media-type="font/woff2"/>`);
  }
}

oebps.file("nav.xhtml", navDocument(days, book));
oebps.file("content.opf", contentOpf(book, manifestItems, spine));

const buffer = await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
await writeFile("dist/downloads/180-descent.epub", buffer);
await copyFile("dist/downloads/180-descent.epub", "_site/downloads/180-descent.epub");

async function pageToXhtml(htmlPath, title, selfHref) {
  const html = await readFile(htmlPath, "utf8");
  const $ = cheerio.load(html, { decodeEntities: false });
  $("script,.site-topbar,.site-footer,.download-strip,.web-only,.print-only:not(.epub-only)").remove();
  $(".epub-only").removeClass("epub-only print-only format-alt").addClass("epub-alt");
  $("a[href]").each((_, a) => {
    const el = $(a);
    const href = el.attr("href");
    if (!href) return;
    if (href.startsWith("/days/")) {
      const parts = href.split("/");
      const slug = parts[2];
      const day = days.find((d) => d.data.day_path === slug);
      if (day) {
        const anchor = href.includes("#") ? `#${href.split("#")[1]}` : "";
        el.attr("href", `${day.xhtml}${anchor}`);
      }
    } else if (href === "/introduction/") {
      el.attr("href", "introduction.xhtml");
    } else if (href.startsWith("/") && !href.startsWith("/downloads/")) {
      el.attr("href", "nav.xhtml");
    }
  });
  const body = $("#content").length ? $("#content").html() : $("body").html();
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="${book.language}">
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
    .replaceAll(".site-topbar,.site-footer,.download-strip,.web-only,.epub-only{display:none!important;}", ".site-topbar,.site-footer,.download-strip,.web-only,.print-only{display:none!important;}")
    + "\nbody{font-size:1em;} .web-only,.print-only{display:none!important;} .epub-alt{display:block!important;}\n";
}

function navDocument(items, meta) {
  const links = items.map((day) => `<li><a href="${day.xhtml}">Day ${day.data.day}: ${escapeXml(day.data.title)}</a></li>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" lang="${meta.language}">
  <head><title>Table of Contents</title></head>
  <body>
    <nav epub:type="toc" id="toc">
      <h1>${escapeXml(meta.title)}</h1>
      <ol>
        <li><a href="introduction.xhtml">Introduction</a></li>
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

