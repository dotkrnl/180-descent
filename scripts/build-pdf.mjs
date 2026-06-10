import { mkdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

await mkdir("_site/downloads", { recursive: true });
await mkdir("dist/downloads", { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 900, height: 1350 } });
await page.goto(pathToFileURL(path.resolve("_site/print/index.html")).href, { waitUntil: "networkidle" });
await page.emulateMedia({ media: "print" });
await page.pdf({
  path: "dist/downloads/180-descent.pdf",
  width: "6in",
  height: "9in",
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: "0", right: "0", bottom: "0", left: "0" }
});
await browser.close();
await copyFile("dist/downloads/180-descent.pdf", "_site/downloads/180-descent.pdf");

