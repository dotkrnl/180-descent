import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";

const siteDir = path.resolve("_site");
const pages = [
  "/",
  "/zh/",
  "/syllabus/",
  "/zh/syllabus/",
  "/days/001-what-is-knowledge/",
  "/zh/days/001-what-is-knowledge/",
  "/days/004-probability-as-extended-logic/",
  "/zh/days/004-probability-as-extended-logic/"
];

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".woff2", "font/woff2"]
]);

function contentType(filePath) {
  return mimeTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream";
}

async function fileForUrl(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const clean = decoded.replace(/^\/+/, "");
  const candidate = path.join(siteDir, clean);
  const resolved = path.resolve(candidate);
  if (!resolved.startsWith(siteDir)) return "";

  try {
    const stats = await fs.stat(resolved);
    if (stats.isDirectory()) return path.join(resolved, "index.html");
    return resolved;
  } catch {
    return path.join(resolved, "index.html");
  }
}

async function startServer() {
  const server = http.createServer(async (req, res) => {
    try {
      const filePath = await fileForUrl(req.url || "/");
      if (!filePath) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      const body = await fs.readFile(filePath);
      res.writeHead(200, { "content-type": contentType(filePath) });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  return {
    server,
    origin: `http://127.0.0.1:${address.port}`
  };
}

function summarizeViolation(pagePath, violation) {
  const nodes = violation.nodes
    .slice(0, 3)
    .map((node) => `    - ${node.target.join(", ")}: ${node.failureSummary?.replace(/\s+/g, " ").trim() || "no failure summary"}`)
    .join("\n");
  return [
    `${pagePath}: ${violation.id} (${violation.impact || "unknown impact"})`,
    `  ${violation.help}`,
    nodes
  ].filter(Boolean).join("\n");
}

async function walkHtml(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walkHtml(fullPath));
    else if (entry.name.endsWith(".html")) files.push(fullPath);
  }
  return files;
}

function htmlUrl(filePath) {
  const rel = path.relative(siteDir, filePath).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel}`;
}

function attrSelectorValue(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function elementName($, el) {
  const ariaLabel = $(el).attr("aria-label");
  if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

  const labelledBy = $(el).attr("aria-labelledby");
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => $(`[id="${attrSelectorValue(id)}"]`).text().trim())
      .filter(Boolean)
      .join(" ");
    if (text) return text;
  }

  const text = $(el).text().trim();
  if (text) return text;

  const imageAlt = $(el).find("img[alt]").map((_, img) => $(img).attr("alt") || "").get().join(" ").trim();
  return imageAlt;
}

async function checkStaticAccessibility() {
  const errors = [];
  const htmlFiles = await walkHtml(siteDir);

  for (const filePath of htmlFiles) {
    const url = htmlUrl(filePath);
    const html = await fs.readFile(filePath, "utf8");
    const $ = load(html);

    $("img").each((index, el) => {
      if (!$(el).attr("alt") && $(el).attr("alt") !== "") {
        errors.push(`${url}: img ${index + 1} is missing alt`);
      }
    });

    $('svg[role="img"]').each((index, el) => {
      if (!$(el).attr("aria-label") && !$(el).attr("aria-labelledby")) {
        errors.push(`${url}: svg[role="img"] ${index + 1} is missing an accessible name`);
      }
    });

    $("a[href],button").each((index, el) => {
      if (!elementName($, el)) {
        errors.push(`${url}: ${el.tagName} ${index + 1} is missing an accessible name`);
      }
    });

    $("[aria-checked]").each((index, el) => {
      const role = $(el).attr("role") || "";
      if (!["checkbox", "menuitemcheckbox", "radio", "switch"].includes(role)) {
        errors.push(`${url}: [aria-checked] ${index + 1} must use checkbox, menuitemcheckbox, radio, or switch role`);
      }
    });
  }

  return errors;
}

async function main() {
  await fs.access(siteDir);
  const staticFailures = await checkStaticAccessibility();
  const { server, origin } = await startServer();
  const browser = await chromium.launch();
  const failures = [...staticFailures];

  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    for (const pagePath of pages) {
      await page.goto(`${origin}${pagePath}`, { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      for (const violation of results.violations) {
        failures.push(summarizeViolation(pagePath, violation));
      }
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  if (failures.length) {
    console.error("Accessibility check failed:");
    console.error(failures.join("\n\n"));
    process.exit(1);
  }

  console.log(`Accessibility check passed for ${pages.length} pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
