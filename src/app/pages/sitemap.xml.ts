import {
  absoluteUrl,
  getBookData,
  getPublishedDays
} from "@app/site-data";

interface SitemapEntry {
  path: string;
  alternate?: string;
}

export async function GET() {
  const book = await getBookData();
  const [enDays, zhDays] = await Promise.all([
    getPublishedDays("en"),
    getPublishedDays("zh")
  ]);
  const dayPaths = new Set([...enDays, ...zhDays].map((day) => day.path));
  const entries: SitemapEntry[] = [
    { path: "/", alternate: "/zh/" },
    { path: "/zh/", alternate: "/" },
    { path: "/introduction/", alternate: "/zh/introduction/" },
    { path: "/zh/introduction/", alternate: "/introduction/" },
    { path: "/syllabus/", alternate: "/zh/syllabus/" },
    { path: "/zh/syllabus/", alternate: "/syllabus/" },
    { path: "/downloads/", alternate: "/zh/downloads/" },
    { path: "/zh/downloads/", alternate: "/downloads/" },
    { path: "/credits/", alternate: "/zh/credits/" },
    { path: "/zh/credits/", alternate: "/credits/" },
    ...[...dayPaths].sort().flatMap((dayPath) => [
      { path: `/days/${dayPath}/`, alternate: `/zh/days/${dayPath}/` },
      { path: `/zh/days/${dayPath}/`, alternate: `/days/${dayPath}/` }
    ])
  ];
  const lastmod = new Date().toISOString().slice(0, 10);
  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...entries.map((entry) => sitemapUrl(entry, book.site_url, lastmod)),
    "</urlset>"
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8"
    }
  });
}

function sitemapUrl(entry: SitemapEntry, siteUrl: string, lastmod: string): string {
  const loc = absoluteUrl(entry.path, siteUrl);
  const alternate = entry.alternate ? absoluteUrl(entry.alternate, siteUrl) : "";
  const isZh = entry.path.startsWith("/zh/");
  const enUrl = isZh ? alternate : loc;
  const zhUrl = isZh ? loc : alternate;
  return [
    "  <url>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    entry.alternate ? `    <xhtml:link rel="alternate" hreflang="en" href="${xmlEscape(enUrl)}" />` : "",
    entry.alternate ? `    <xhtml:link rel="alternate" hreflang="zh-Hans" href="${xmlEscape(zhUrl)}" />` : "",
    entry.alternate ? `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(enUrl)}" />` : "",
    "  </url>"
  ].filter(Boolean).join("\n");
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
