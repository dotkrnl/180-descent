import { readFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import { builtHtmlFiles } from "@lib/checks/built-site";
import { readBookData } from "@lib/data/book";
import { toError } from "@lib/errors";
import { pathExists } from "@lib/fs/walk";
import { siteFileForUrlPath, sitePathForHref, sitePathForUrlPath, urlForSiteFile } from "@lib/static-site/url";

interface SeoCheckOptions {
  root: string;
}

interface SeoCheckResult {
  checkedHtmlFiles: number;
  errors: string[];
}

export async function checkSeo(options: SeoCheckOptions): Promise<SeoCheckResult> {
  const { builtSiteDir, htmlFiles } = await builtHtmlFiles(options.root, { required: true });
  const siteUrl = (await readBookData(options.root)).siteUrl;
  const errors: string[] = [];
  const checkedManifests = new Set<string>();

  if (!htmlFiles.length) {
    errors.push("_site contains no HTML files");
  }
  for (const file of htmlFiles) {
    await checkHtml(builtSiteDir, siteUrl, file, errors, checkedManifests);
  }
  await checkSitemap(builtSiteDir, errors);
  await checkRobots(builtSiteDir, siteUrl, errors);

  return {
    checkedHtmlFiles: htmlFiles.length,
    errors
  };
}

async function checkHtml(
  siteDir: string,
  siteUrl: string,
  filePath: string,
  errors: string[],
  checkedManifests: Set<string>
): Promise<void> {
  const url = urlForSiteFile(siteDir, filePath);
  const pageUrl = new URL(url, siteUrl).href;
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
  if (canonical !== pageUrl) errors.push(`${url}: canonical should be ${pageUrl}, got ${canonical || "(missing)"}`);
  if (!$('meta[property="og:title"]').attr("content")) errors.push(`${url}: missing og:title`);
  if (!$('meta[property="og:description"]').attr("content")) errors.push(`${url}: missing og:description`);
  if (!ogImage) errors.push(`${url}: missing og:image`);
  if (!$('meta[name="twitter:card"]').attr("content")) errors.push(`${url}: missing twitter card metadata`);
  checkStructuredData(url, $, errors);
  if (!favicon) errors.push(`${url}: missing favicon link`);
  if (!appleTouchIcon) errors.push(`${url}: missing apple-touch-icon link`);
  if (!manifest) errors.push(`${url}: missing web app manifest link`);

  if (ogImage) {
    const imagePath = sitePathForHref(siteDir, pageUrl, ogImage);
    if (!imagePath || !await pathExists(imagePath)) errors.push(`${url}: og:image does not exist locally (${ogImage})`);
  }
  for (const [label, href] of [["favicon", favicon], ["apple-touch-icon", appleTouchIcon], ["manifest", manifest]] as const) {
    const localPath = href ? sitePathForHref(siteDir, pageUrl, href) : "";
    if (href && (!localPath || !await pathExists(localPath))) {
      errors.push(`${url}: ${label} does not exist locally (${href})`);
    }
  }
  const manifestUrl = manifest ? sameSiteUrl(pageUrl, manifest) : null;
  if (manifestUrl && !checkedManifests.has(manifestUrl.href)) {
    checkedManifests.add(manifestUrl.href);
    await checkManifestIcons(siteDir, manifestUrl, errors);
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

function checkStructuredData(url: string, $: ReturnType<typeof load>, errors: string[]): void {
  const scripts = $('script[type="application/ld+json"]').toArray();
  if (!scripts.length) {
    errors.push(`${url}: missing JSON-LD structured data`);
    return;
  }

  for (const script of scripts) {
    try {
      const parsed: unknown = JSON.parse($(script).text().trim());
      if (!parsed || typeof parsed !== "object") {
        errors.push(`${url}: JSON-LD structured data must be a JSON object or array`);
      }
    } catch (error) {
      errors.push(`${url}: invalid JSON-LD structured data (${toError(error).message})`);
    }
  }
}

async function checkSitemap(siteDir: string, errors: string[]): Promise<void> {
  const sitemapPath = path.join(siteDir, "sitemap.xml");
  if (!await pathExists(sitemapPath)) {
    errors.push("missing sitemap.xml");
    return;
  }

  const sitemap = await readFile(sitemapPath, "utf8");
  const $ = load(sitemap, { xmlMode: true });
  if (!$("urlset").length) errors.push("sitemap.xml: missing urlset");
  if (!$("xhtml\\:link[rel='alternate']").length) errors.push("sitemap.xml: missing hreflang xhtml:link alternates");
}

async function checkRobots(siteDir: string, siteUrl: string, errors: string[]): Promise<void> {
  const robotsPath = path.join(siteDir, "robots.txt");
  if (!await pathExists(robotsPath)) {
    errors.push("missing robots.txt");
    return;
  }
  const robots = await readFile(robotsPath, "utf8");
  if (!hasSitemapDirective(robots, `${siteUrl}/sitemap.xml`)) errors.push("robots.txt: missing Sitemap directive");
}

async function checkManifestIcons(siteDir: string, manifestUrl: URL, errors: string[]): Promise<void> {
  const href = manifestUrl.pathname;
  const manifestPath = sitePathForUrlPath(siteDir, manifestUrl.pathname);
  if (!manifestPath || !await pathExists(manifestPath)) return;

  let manifest: { icons?: unknown };
  try {
    const parsed: unknown = JSON.parse(await readFile(manifestPath, "utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      errors.push(`${href}: web manifest must be a JSON object`);
      return;
    }
    manifest = parsed;
  } catch (error) {
    errors.push(`${href}: invalid web manifest JSON (${toError(error).message})`);
    return;
  }
  if (manifest.icons !== undefined && !Array.isArray(manifest.icons)) {
    errors.push(`${href}: icons must be an array`);
    return;
  }
  const icons = manifest.icons ?? [];
  if (!icons.length) {
    errors.push(`${href}: missing icons`);
    return;
  }
  for (const icon of icons) {
    const src = webManifestIconSrc(icon);
    if (!src) {
      errors.push(`${href}: icon src must be a non-blank string`);
      continue;
    }
    const localPath = sitePathForManifestIcon(siteDir, manifestUrl, src);
    if (!localPath || !await pathExists(localPath)) {
      errors.push(`${href}: icon does not exist locally (${src})`);
    }
  }
}

function sameSiteUrl(pageUrl: string, href: string): URL | null {
  try {
    const base = new URL(pageUrl);
    const url = new URL(href, base);
    return url.origin === base.origin ? url : null;
  } catch {
    return null;
  }
}

function sitePathForManifestIcon(siteDir: string, manifestUrl: URL, iconSrc: string): string | null {
  try {
    const iconUrl = new URL(iconSrc, manifestUrl);
    return sitePathForHref(siteDir, manifestUrl.href, iconUrl.href);
  } catch {
    return null;
  }
}

function webManifestIconSrc(icon: unknown): string | null {
  if (!icon || typeof icon !== "object" || !("src" in icon)) return null;
  return typeof icon.src === "string" && icon.src.trim() ? icon.src : null;
}

async function hasHtmlForUrl(siteDir: string, url: string): Promise<boolean> {
  const target = siteFileForUrlPath(siteDir, url);
  return target ? pathExists(target) : false;
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

function hasSitemapDirective(robots: string, sitemapUrl: string): boolean {
  return robots.split(/\r?\n/).some((line) => {
    const trimmed = line.trim();
    return trimmed === `Sitemap: ${sitemapUrl}`;
  });
}
