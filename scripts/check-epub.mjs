import { readFile } from "node:fs/promises";
import JSZip from "jszip";

const data = await readFile("_site/downloads/180-descent.epub");
const zip = await JSZip.loadAsync(data);
const required = [
  "mimetype",
  "META-INF/container.xml",
  "OEBPS/content.opf",
  "OEBPS/nav.xhtml",
  "OEBPS/introduction.xhtml",
  "OEBPS/day-001.xhtml",
  "OEBPS/day-002.xhtml"
];

let failures = 0;
for (const file of required) {
  if (!zip.file(file)) {
    console.error(`EPUB missing ${file}`);
    failures++;
  }
}

for (const name of Object.keys(zip.files).filter((file) => file.endsWith(".xhtml"))) {
  const text = await zip.file(name).async("string");
  if (/<script\b/i.test(text)) {
    console.error(`EPUB contains script tag in ${name}`);
    failures++;
  }
  if (/web-only/.test(text)) {
    console.error(`EPUB contains web-only content in ${name}`);
    failures++;
  }
}

if (failures) process.exit(1);

