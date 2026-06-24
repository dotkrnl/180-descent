import {
  getBookData,
  getContentDays
} from "@app/site-data";
import { alternateLocale, dayUrl, homeUrl, staticPageUrl, type StaticPageSlug } from "@lib/static-site/routes";
import { escapeXml } from "@lib/text/escape";

interface SitemapEntry {
  path: string;
  alternate?: string;
}

export async function GET() {
  const book = await getBookData();
  const [enDays, zhDays] = await Promise.all([
    getContentDays("en"),
    getContentDays("zh")
  ]);
  const dayPaths = new Set([...enDays, ...zhDays].map((day) => day.path));
  const staticPages: StaticPageSlug[] = ["introduction", "syllabus", "downloads", "credits"];
  const entries: SitemapEntry[] = [
    ...localizedEntries((locale) => homeUrl(locale)),
    ...staticPages.flatMap((slug) => localizedEntries((locale) => staticPageUrl(locale, slug))),
    ...[...dayPaths].sort().flatMap((dayPath) => [
      ...localizedEntries((locale) => dayUrl(locale, dayPath))
    ])
  ];
  const lastmod = new Date().toISOString().slice(0, 10);
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries.map((entry) => sitemapUrl(entry, book.siteUrl, lastmod)),
    "</urlset>"
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}

function localizedEntries(pathFor: (locale: "en" | "zh") => string): SitemapEntry[] {
  return (["en", "zh"] as const).map((locale) => ({
    path: pathFor(locale),
    alternate: pathFor(alternateLocale(locale))
  }));
}

function sitemapUrl(entry: SitemapEntry, siteUrl: string, lastmod: string): string {
  const loc = absoluteUrl(entry.path, siteUrl);
  const alternate = entry.alternate ? absoluteUrl(entry.alternate, siteUrl) : "";
  const isZh = entry.path.startsWith("/zh/");
  const enUrl = isZh ? alternate : loc;
  const zhUrl = isZh ? loc : alternate;
  return [
    "  <url>",
    `    <loc>${escapeXml(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    entry.alternate ? `    <xhtml:link rel="alternate" hreflang="en" href="${escapeXml(enUrl)}" />` : "",
    entry.alternate ? `    <xhtml:link rel="alternate" hreflang="zh-Hans" href="${escapeXml(zhUrl)}" />` : "",
    entry.alternate ? `    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(enUrl)}" />` : "",
    "  </url>"
  ].filter(Boolean).join("\n");
}

function absoluteUrl(pathname: string, siteUrl: string): string {
  return new URL(pathname, siteUrl).href;
}
