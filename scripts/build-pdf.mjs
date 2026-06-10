import { mkdir, copyFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import http from "node:http";
import path from "node:path";
import { chromium } from "playwright";

await mkdir("_site/downloads", { recursive: true });
await mkdir("dist/downloads", { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 900, height: 1350 } });
const server = await serveSite("_site");

try {
  await page.goto(`${server.url}/print/`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: "dist/downloads/180-descent.pdf",
    printBackground: true,
    preferCSSPageSize: true
  });
} finally {
  await browser.close();
  await server.close();
}
await copyFile("dist/downloads/180-descent.pdf", "_site/downloads/180-descent.pdf");

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
