import { readFile } from "node:fs/promises";
import * as cheerio from "cheerio";
import { contentDaysDir } from "@lib/content/paths";
import { loadContentRegistry } from "@lib/content/registry";
import { futureLinksDataFile } from "@lib/data/paths";
import { readYamlFile } from "@lib/data/yaml";
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

interface FutureLinkEntry {
  id?: unknown;
  status?: unknown;
  target_day?: unknown;
}

export async function checkLinks(options: LinkCheckOptions): Promise<LinkCheckFailure[]> {
  const builtSiteDir = siteDir(options.root);
  const daysDir = contentDaysDir(options.root);
  const futureLinksPath = futureLinksDataFile(options.root);
  const failures: LinkCheckFailure[] = [];
  const htmlFiles = await walkFiles(builtSiteDir, { exts: ".html", ignored: [] });
  const idCache = new Map<string, Set<string>>();

  for (const file of htmlFiles) {
    const $ = cheerio.load(await readFile(file, "utf8"));
    idCache.set(file, new Set($("[id]").map((_, el) => $(el).attr("id") ?? "").get().filter(Boolean)));
  }

  for (const file of htmlFiles) {
    const $ = cheerio.load(await readFile(file, "utf8"));
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

  failures.push(...await checkFutureLinks(daysDir, futureLinksPath));
  return failures;
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

  try {
    const parsed = new URL(href, "https://local.invalid");
    return {
      pathname: parsed.pathname,
      anchor: parsed.hash ? parsed.hash.slice(1) : undefined
    };
  } catch {
    return { pathname: "" };
  }
}

async function checkFutureLinks(daysDir: string, futureLinksPath: string): Promise<LinkCheckFailure[]> {
  const registry = await loadContentRegistry({ daysDir });
  const days = registry.days.map((day) => day.manifest.day);
  const maxDay = days.length ? Math.max(...days) : 0;
  const parsed = await readYamlFile<unknown>(futureLinksPath);
  const futureLinks = Array.isArray(parsed) ? parsed as FutureLinkEntry[] : [];
  const failures: LinkCheckFailure[] = [];

  for (const link of futureLinks) {
    const targetDay = Number(link.target_day);
    if (link.status === "pending" && Number.isFinite(targetDay) && targetDay <= maxDay) {
      failures.push({
        message: `Future link ${String(link.id)} targets published day ${targetDay} but is still pending`
      });
    }
  }

  return failures;
}

function isArtifactDownloadPath(pathname: string): boolean {
  return /^\/downloads\/.+\.(?:epub|pdf)$/.test(pathname);
}
