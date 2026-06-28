import { readFile } from "node:fs/promises";
import * as cheerio from "cheerio";
import { builtHtmlFiles } from "@lib/checks/built-site";
import { contentDaysDir } from "@lib/content/paths";
import { loadContentRegistry } from "@lib/content/registry";
import { readBookData } from "@lib/data/book";
import { readFutureLinksData } from "@lib/data/future-links";
import { toPosixRelative } from "@lib/fs/path";
import { pathExists } from "@lib/fs/walk";
import { siteFileForUrlPath, urlForSiteFile } from "@lib/static-site/url";

interface LinkCheckOptions {
  root: string;
}

interface LinkCheckFailure {
  message: string;
}

interface HtmlDocument {
  file: string;
  $: cheerio.CheerioAPI;
  ids: Set<string>;
}

export async function checkLinks(options: LinkCheckOptions): Promise<LinkCheckFailure[]> {
  const { builtSiteDir, htmlFiles } = await builtHtmlFiles(options.root, { required: true });
  const book = await readBookData(options.root);
  const siteUrl = book.siteUrl;
  const daysDir = contentDaysDir(options.root);
  const failures: LinkCheckFailure[] = [];
  if (!htmlFiles.length) {
    failures.push({ message: "_site contains no HTML files" });
  }
  const documents = await Promise.all(htmlFiles.map(loadHtmlDocument));
  const idCache = new Map(documents.map((document) => [document.file, document.ids]));

  for (const { file, $ } of documents) {
    const currentUrl = urlForSiteFile(builtSiteDir, file);
    for (const a of $("a[href]").toArray()) {
      const href = $(a).attr("href");
      const targetRef = linkTarget(href, currentUrl, siteUrl);
      if (!targetRef) continue;

      const { pathname, anchor } = targetRef;
      const target = siteFileForUrlPath(builtSiteDir, pathname);

      if (!target || !await pathExists(target)) {
        failures.push({
          message: `Broken internal link ${href} in ${toPosixRelative(options.root, file)}`
        });
        continue;
      }

      if (anchor) {
        const targetIds = idCache.get(target);
        if (targetIds && !targetIds.has(anchor)) {
          failures.push({
            message: `Missing anchor ${href} (anchor "${anchor}" not found in ${toPosixRelative(options.root, target)}) referenced from ${toPosixRelative(options.root, file)}`
          });
        }
      }
    }
  }

  failures.push(...await checkFutureLinks(options.root, daysDir, book.totalDays));
  return failures;
}

async function loadHtmlDocument(file: string): Promise<HtmlDocument> {
  const $ = cheerio.load(await readFile(file, "utf8"));
  const ids = new Set($("[id]").map((_, el) => $(el).attr("id") ?? "").get().filter(Boolean));
  return { file, $, ids };
}

function linkTarget(href: string | undefined, currentUrl: string, siteUrl: string): { pathname: string; anchor?: string } | null {
  if (!href) return null;

  const parsed = parseHref(href, currentUrl, siteUrl);
  if (!parsed || parsed.origin !== siteUrl) return null;
  return {
    pathname: parsed.pathname,
    anchor: parsed.hash ? decodedFragment(parsed.hash.slice(1)) : undefined
  };
}

function parseHref(href: string, currentUrl: string, siteUrl: string): URL | null {
  try {
    if (href.startsWith("//")) return new URL(`https:${href}`);
    return new URL(href, `${siteUrl}${currentUrl}`);
  } catch {
    return null;
  }
}

function decodedFragment(fragment: string): string {
  try {
    return decodeURIComponent(fragment);
  } catch {
    return fragment;
  }
}

async function checkFutureLinks(root: string, daysDir: string, totalDays: number): Promise<LinkCheckFailure[]> {
  const registry = await loadContentRegistry({ daysDir });
  const publishedDays = new Set(registry.days.map((day) => day.manifest.day));
  const futureLinks = await readFutureLinksData(root);
  const failures: LinkCheckFailure[] = [];

  for (const link of futureLinks) {
    if (link.from_day > totalDays) {
      failures.push({
        message: `Future link ${link.id} starts from day ${link.from_day}, beyond book total_days ${totalDays}`
      });
    }
    if (link.target_day > totalDays) {
      failures.push({
        message: `Future link ${link.id} targets day ${link.target_day}, beyond book total_days ${totalDays}`
      });
    }

    if (!publishedDays.has(link.from_day)) {
      failures.push({
        message: `Future link ${link.id} starts from unpublished day ${link.from_day}`
      });
    }

    if (link.status === "pending" && publishedDays.has(link.target_day)) {
      failures.push({
        message: `Future link ${link.id} targets published day ${link.target_day} but is still pending`
      });
    } else if (link.status === "resolved" && !publishedDays.has(link.target_day)) {
      failures.push({
        message: `Future link ${link.id} targets unpublished day ${link.target_day} but is marked resolved`
      });
    }
  }

  return failures;
}
