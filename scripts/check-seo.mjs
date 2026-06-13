import fs from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";

const siteDir = path.resolve("_site");
const siteUrl = "https://180d.io";
const errors = [];

async function exists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else files.push(fullPath);
  }
  return files;
}

function urlForHtml(filePath) {
  const rel = path.relative(siteDir, filePath).split(path.sep).join("/");
  if (rel === "index.html") return "/";
  if (rel.endsWith("/index.html")) return `/${rel.slice(0, -"index.html".length)}`;
  return `/${rel}`;
}

function localPathForUrl(url) {
  if (!url.startsWith(siteUrl)) return "";
  const parsed = new URL(url);
  return path.join(siteDir, parsed.pathname.replace(/^\/+/, ""));
}

function isIndexablePage(url) {
  return !/^\/(?:zh\/)?print(?:-deep)?\//.test(url);
}

async function hasHtmlForUrl(url) {
  const clean = url.replace(/^\/+/, "");
  const target = clean ? path.join(siteDir, clean, "index.html") : path.join(siteDir, "index.html");
  return exists(target);
}

function alternateUrl(url) {
  if (url === "/") return "/zh/";
  if (url === "/zh/") return "/";
  if (url.startsWith("/zh/")) return url.replace(/^\/zh/, "") || "/";
  return `/zh${url}`;
}

async function checkHtml(filePath) {
  const url = urlForHtml(filePath);
  const html = await fs.readFile(filePath, "utf8");
  const $ = load(html);

  if (!isIndexablePage(url)) {
    const robots = $('meta[name="robots"]').attr("content") || "";
    if (!robots.includes("noindex")) errors.push(`${url}: print/duplicate page is missing noindex robots meta`);
    return;
  }

  const title = $("title").first().text().trim();
  const description = $('meta[name="description"]').attr("content") || "";
  const canonical = $('link[rel="canonical"]').attr("href") || "";
  const ogImage = $('meta[property="og:image"]').attr("content") || "";

  if (!title) errors.push(`${url}: missing <title>`);
  if (!description) errors.push(`${url}: missing meta description`);
  if (canonical !== `${siteUrl}${url}`) errors.push(`${url}: canonical should be ${siteUrl}${url}, got ${canonical || "(missing)"}`);
  if (!$('meta[property="og:title"]').attr("content")) errors.push(`${url}: missing og:title`);
  if (!$('meta[property="og:description"]').attr("content")) errors.push(`${url}: missing og:description`);
  if (!ogImage) errors.push(`${url}: missing og:image`);
  if (!$('meta[name="twitter:card"]').attr("content")) errors.push(`${url}: missing twitter card metadata`);
  if (!$('script[type="application/ld+json"]').length) errors.push(`${url}: missing JSON-LD structured data`);

  if (ogImage) {
    const imagePath = localPathForUrl(ogImage);
    if (!imagePath || !await exists(imagePath)) errors.push(`${url}: og:image does not exist locally (${ogImage})`);
  }

  const alt = alternateUrl(url);
  if (await hasHtmlForUrl(alt)) {
    const enHref = $('link[rel="alternate"][hreflang="en"]').attr("href") || "";
    const zhHref = $('link[rel="alternate"][hreflang="zh-Hans"]').attr("href") || "";
    const defaultHref = $('link[rel="alternate"][hreflang="x-default"]').attr("href") || "";
    if (!enHref || !zhHref || !defaultHref) errors.push(`${url}: missing reciprocal hreflang alternates`);
  }
}

async function checkSitemap() {
  const sitemapPath = path.join(siteDir, "sitemap.xml");
  if (!await exists(sitemapPath)) {
    errors.push("missing sitemap.xml");
    return;
  }

  const sitemap = await fs.readFile(sitemapPath, "utf8");
  if (!sitemap.includes("<urlset")) errors.push("sitemap.xml: missing urlset");
  if (sitemap.includes("/print/")) errors.push("sitemap.xml: print duplicate URLs should be excluded");
  if (!sitemap.includes("xhtml:link")) errors.push("sitemap.xml: missing hreflang xhtml:link alternates");
}

async function checkRobots() {
  const robotsPath = path.join(siteDir, "robots.txt");
  if (!await exists(robotsPath)) {
    errors.push("missing robots.txt");
    return;
  }
  const robots = await fs.readFile(robotsPath, "utf8");
  if (!robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) errors.push("robots.txt: missing Sitemap directive");
}

async function main() {
  if (!await exists(siteDir)) throw new Error("_site does not exist; run npm run build:site first");
  const htmlFiles = (await walk(siteDir)).filter((file) => file.endsWith(".html"));
  for (const file of htmlFiles) await checkHtml(file);
  await checkSitemap();
  await checkRobots();

  if (errors.length) {
    console.error("SEO check failed:");
    for (const error of errors) console.error(`- ${error}`);
    process.exit(1);
  }

  console.log(`SEO check passed for ${htmlFiles.length} HTML files.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
