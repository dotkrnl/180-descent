import { readFile } from "node:fs/promises";
import * as cheerio from "cheerio";
import { contentDaysDir } from "@lib/content/paths";
import { loadContentRegistry } from "@lib/content/registry";
import { readFutureLinksData } from "@lib/data/future-links";
import { toPosixRelative } from "@lib/fs/path";
import { pathExists, walkFiles } from "@lib/fs/walk";
import { siteDir } from "@lib/static-site/routes";
import { siteFileForUrlPath } from "@lib/static-site/url";

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
  const builtSiteDir = siteDir(options.root);
  const daysDir = contentDaysDir(options.root);
  const failures: LinkCheckFailure[] = [];
  const htmlFiles = await walkFiles(builtSiteDir, { exts: ".html", ignoredDirNames: [] });
  const documents = await Promise.all(htmlFiles.map(loadHtmlDocument));
  const idCache = new Map(documents.map((document) => [document.file, document.ids]));

  for (const { file, $ } of documents) {
    for (const a of $("a[href]").toArray()) {
      const href = $(a).attr("href");
      const targetRef = linkTarget(href);
      if (!targetRef) continue;

      const { pathname, anchor } = targetRef;
      if (isArtifactDownloadPath(pathname)) continue;
      const target = targetRef.samePage ? file : siteFileForUrlPath(builtSiteDir, pathname);

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

  failures.push(...await checkFutureLinks(options.root, daysDir));
  return failures;
}

async function loadHtmlDocument(file: string): Promise<HtmlDocument> {
  const $ = cheerio.load(await readFile(file, "utf8"));
  const ids = new Set($("[id]").map((_, el) => $(el).attr("id") ?? "").get().filter(Boolean));
  return { file, $, ids };
}

function linkTarget(href?: string): { pathname: string; anchor?: string; samePage?: boolean } | null {
  if (!href) return null;
  if (href.startsWith("#")) {
    return {
      pathname: "",
      anchor: href.slice(1),
      samePage: true
    };
  }
  if (href.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(href)) return null;
  if (!href.startsWith("/")) return null;

  const parsed = new URL(href, "https://local.invalid");
  return {
    pathname: parsed.pathname,
    anchor: parsed.hash ? parsed.hash.slice(1) : undefined
  };
}

async function checkFutureLinks(root: string, daysDir: string): Promise<LinkCheckFailure[]> {
  const registry = await loadContentRegistry({ daysDir });
  const days = registry.days.map((day) => day.manifest.day);
  const maxDay = days.length ? Math.max(...days) : 0;
  const futureLinks = await readFutureLinksData(root);
  const failures: LinkCheckFailure[] = [];

  for (const link of futureLinks) {
    if (link.status === "pending" && link.target_day <= maxDay) {
      failures.push({
        message: `Future link ${link.id} targets published day ${link.target_day} but is still pending`
      });
    } else if (link.status === "resolved" && link.target_day > maxDay) {
      failures.push({
        message: `Future link ${link.id} targets unpublished day ${link.target_day} but is marked resolved`
      });
    }
  }

  return failures;
}

function isArtifactDownloadPath(pathname: string): boolean {
  return /^\/downloads\/.+\.(?:epub|pdf)$/.test(pathname);
}
