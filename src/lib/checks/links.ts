import { access, readFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import YAML from "yaml";
import { loadContentRegistry } from "@lib/content/registry";
import { toPosixRelative } from "@lib/fs/path";
import { walkFiles } from "@lib/fs/walk";

interface LinkCheckOptions {
  root: string;
  siteDir?: string;
  daysDir?: string;
  futureLinksPath?: string;
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
  const siteDir = path.join(options.root, options.siteDir ?? "_site");
  const daysDir = path.join(options.root, options.daysDir ?? "src/content/days");
  const futureLinksPath = path.join(options.root, options.futureLinksPath ?? "src/_data/future-links.yaml");
  const failures: LinkCheckFailure[] = [];
  const htmlFiles = await walkFiles(siteDir, { exts: ".html", ignored: [] });
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
      const target = targetRef.samePage
        ? file
        : pathname.endsWith("/")
          ? path.join(siteDir, pathname, "index.html")
          : path.join(siteDir, pathname);

      try {
        await access(target);
        if (anchor) {
          const targetIds = idCache.get(target);
          if (targetIds && !targetIds.has(anchor)) {
            failures.push({
              message: `Missing anchor ${href} (anchor "${anchor}" not found in ${toPosixRelative(options.root, target)}) referenced from ${toPosixRelative(options.root, file)}`
            });
          }
        }
      } catch {
        failures.push({
          message: `Broken internal link ${href} in ${toPosixRelative(options.root, file)}`
        });
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

  const parsed = new URL(href, "https://local.invalid");
  return {
    pathname: parsed.pathname,
    anchor: parsed.hash ? parsed.hash.slice(1) : undefined
  };
}

async function checkFutureLinks(daysDir: string, futureLinksPath: string): Promise<LinkCheckFailure[]> {
  const registry = await loadContentRegistry({ daysDir });
  const days = registry.days.filter((day) => day.manifest.published).map((day) => day.manifest.day);
  const maxDay = days.length ? Math.max(...days) : 0;
  const parsed = YAML.parse(await readFile(futureLinksPath, "utf8"));
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
