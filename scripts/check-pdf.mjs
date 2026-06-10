import { readFile } from "node:fs/promises";

const data = await readFile("_site/downloads/180-descent.pdf");
const text = data.toString("latin1");
let failures = 0;

if (!text.startsWith("%PDF-")) {
  console.error("PDF does not start with a PDF header");
  failures++;
}

for (const pattern of [/127\.0\.0\.1/, /localhost/i]) {
  if (pattern.test(text)) {
    console.error(`PDF contains local development link matching ${pattern}`);
    failures++;
  }
}

if (failures) process.exit(1);
