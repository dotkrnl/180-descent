import { readFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import { pathExists, walkFiles } from "@lib/fs/walk";
import { urlForHtml } from "@lib/static-site/url";

interface SeoCheckOptions {
  root: string;
  siteDir?: string;
  siteUrl?: string;
}

interface SeoCheckResult {
  checkedHtmlFiles: number;
  errors: string[];
}

export async function checkSeo(options: SeoCheckOptions): Promise<SeoCheckResult> {
  const siteDir = path.resolve(options.root, options.siteDir ?? "_site");
  const siteUrl = options.siteUrl ?? "https://180d.io";
  const errors: string[] = [];

  if (!await pathExists(siteDir)) {
    throw new Error("_site does not exist; run npm run build:site first");
  }

  const htmlFiles = (await walkFiles(siteDir, { ignored: [] })).filter((file) => file.endsWith(".html"));
  for (const file of htmlFiles) {
    await checkHtml(siteDir, siteUrl, file, errors);
  }
  await checkSitemap(siteDir, errors);
  await checkRobots(siteDir, siteUrl, errors);

  return {
    checkedHtmlFiles: htmlFiles.length,
    errors
  };
}

async function checkHtml(siteDir: string, siteUrl: string, filePath: string, errors: string[]): Promise<void> {
  const url = urlForHtml(siteDir, filePath);
  const html = await readFile(filePath, "utf8");
  const $ = load(html);

  const title = $("title").first().text().trim();
  const description = $('meta[name="description"]').attr("content") || "";
  const canonical = $('link[rel="canonical"]').attr("href") || "";
  const ogImage = $('meta[property="og:image"]').attr("content") || "";
  const favicon = $('link[rel="icon"]').first().attr("href") || "";
  const appleTouchIcon = $('link[rel="apple-touch-icon"]').attr("href") || "";
  const manifest = $('link[rel="manifest"]').attr("href") || "";

  if (!title) errors.push(`${url}: missing <title>`);
  if (!description) errors.push(`${url}: missing meta description`);
  if (canonical !== `${siteUrl}${url}`) errors.push(`${url}: canonical should be ${siteUrl}${url}, got ${canonical || "(missing)"}`);
  if (!$('meta[property="og:title"]').attr("content")) errors.push(`${url}: missing og:title`);
  if (!$('meta[property="og:description"]').attr("content")) errors.push(`${url}: missing og:description`);
  if (!ogImage) errors.push(`${url}: missing og:image`);
  if (!$('meta[name="twitter:card"]').attr("content")) errors.push(`${url}: missing twitter card metadata`);
  if (!$('script[type="application/ld+json"]').length) errors.push(`${url}: missing JSON-LD structured data`);
  if (!favicon) errors.push(`${url}: missing favicon link`);
  if (!appleTouchIcon) errors.push(`${url}: missing apple-touch-icon link`);
  if (!manifest) errors.push(`${url}: missing web app manifest link`);

  if (ogImage) {
    const imagePath = localPathForUrl(siteDir, siteUrl, ogImage);
    if (!imagePath || !await pathExists(imagePath)) errors.push(`${url}: og:image does not exist locally (${ogImage})`);
  }
  for (const [label, href] of [["favicon", favicon], ["apple-touch-icon", appleTouchIcon], ["manifest", manifest]] as const) {
    const localPath = href ? localPathForHref(siteDir, siteUrl, href) : "";
    if (href && (!localPath || !await pathExists(localPath))) {
      errors.push(`${url}: ${label} does not exist locally (${href})`);
    }
  }
  if (manifest) {
    await checkManifestIcons(siteDir, siteUrl, manifest, errors);
  }

  const alt = alternateUrl(url);
  if (await hasHtmlForUrl(siteDir, alt)) {
    const enHref = $('link[rel="alternate"][hreflang="en"]').attr("href") || "";
    const zhHref = $('link[rel="alternate"][hreflang="zh-Hans"]').attr("href") || "";
    const defaultHref = $('link[rel="alternate"][hreflang="x-default"]').attr("href") || "";
    if (!enHref || !zhHref || !defaultHref) errors.push(`${url}: missing reciprocal hreflang alternates`);
    const expectedEnHref = `${siteUrl}${englishUrl(url)}`;
    const expectedZhHref = `${siteUrl}${chineseUrl(url)}`;
    if (enHref && enHref !== expectedEnHref) errors.push(`${url}: hreflang en should be ${expectedEnHref}, got ${enHref}`);
    if (zhHref && zhHref !== expectedZhHref) errors.push(`${url}: hreflang zh-Hans should be ${expectedZhHref}, got ${zhHref}`);
    if (defaultHref && defaultHref !== expectedEnHref) errors.push(`${url}: hreflang x-default should be ${expectedEnHref}, got ${defaultHref}`);
  }
}

async function checkSitemap(siteDir: string, errors: string[]): Promise<void> {
  const sitemapPath = path.join(siteDir, "sitemap.xml");
  if (!await pathExists(sitemapPath)) {
    errors.push("missing sitemap.xml");
    return;
  }

  const sitemap = await readFile(sitemapPath, "utf8");
  if (!sitemap.includes("<urlset")) errors.push("sitemap.xml: missing urlset");
  if (!sitemap.includes("xhtml:link")) errors.push("sitemap.xml: missing hreflang xhtml:link alternates");
}

async function checkRobots(siteDir: string, siteUrl: string, errors: string[]): Promise<void> {
  const robotsPath = path.join(siteDir, "robots.txt");
  if (!await pathExists(robotsPath)) {
    errors.push("missing robots.txt");
    return;
  }
  const robots = await readFile(robotsPath, "utf8");
  if (!robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) errors.push("robots.txt: missing Sitemap directive");
}

async function checkManifestIcons(siteDir: string, siteUrl: string, href: string, errors: string[]): Promise<void> {
  const manifestPath = localPathForHref(siteDir, siteUrl, href);
  if (!await pathExists(manifestPath)) return;

  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as {
    icons?: Array<{ src?: unknown }>;
  };
  const icons = manifest.icons ?? [];
  if (!icons.length) {
    errors.push(`${href}: missing icons`);
    return;
  }
  for (const icon of icons) {
    if (typeof icon.src !== "string" || !icon.src) {
      errors.push(`${href}: icon src must be a string`);
      continue;
    }
    const localPath = localPathForHref(siteDir, siteUrl, icon.src);
    if (!localPath || !await pathExists(localPath)) {
      errors.push(`${href}: icon does not exist locally (${icon.src})`);
    }
  }
}

function localPathForUrl(siteDir: string, siteUrl: string, url: string): string {
  if (!url.startsWith(siteUrl)) return "";
  const parsed = new URL(url);
  return path.join(siteDir, parsed.pathname.replace(/^\/+/, ""));
}

function localPathForHref(siteDir: string, siteUrl: string, href: string): string {
  if (href.startsWith("http") && !href.startsWith(siteUrl)) return "";
  const parsed = href.startsWith("http") ? new URL(href) : new URL(href, siteUrl);
  return path.join(siteDir, parsed.pathname.replace(/^\/+/, ""));
}

async function hasHtmlForUrl(siteDir: string, url: string): Promise<boolean> {
  const clean = url.replace(/^\/+/, "");
  const target = clean ? path.join(siteDir, clean, "index.html") : path.join(siteDir, "index.html");
  return pathExists(target);
}

function alternateUrl(url: string): string {
  if (url === "/") return "/zh/";
  if (url === "/zh/") return "/";
  if (url.startsWith("/zh/")) return url.replace(/^\/zh/, "") || "/";
  return `/zh${url}`;
}

function englishUrl(url: string): string {
  return url.startsWith("/zh/") ? alternateUrl(url) : url;
}

function chineseUrl(url: string): string {
  return url.startsWith("/zh/") ? url : alternateUrl(url);
}
