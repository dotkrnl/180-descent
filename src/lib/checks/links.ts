import { access, readFile } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";
import YAML from "yaml";
import { loadContentRegistry } from "@lib/content/registry";
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
      if (!href || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#") || href.startsWith("urn:")) continue;
      if (!href.startsWith("/")) continue;

      const [pathname, anchor] = href.split("#");
      if (isArtifactDownloadPath(pathname)) continue;
      const target = pathname.endsWith("/") ? path.join(siteDir, pathname, "index.html") : path.join(siteDir, pathname);

      try {
        await access(target);
        if (anchor) {
          const targetIds = idCache.get(target);
          if (targetIds && !targetIds.has(anchor)) {
            failures.push({
              message: `Missing anchor ${href} (anchor "${anchor}" not found in ${toRelative(options.root, target)}) referenced from ${toRelative(options.root, file)}`
            });
          }
        }
      } catch {
        failures.push({
          message: `Broken internal link ${href} in ${toRelative(options.root, file)}`
        });
      }
    }
  }

  failures.push(...await checkFutureLinks(daysDir, futureLinksPath));
  return failures;
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

function toRelative(root: string, filePath: string): string {
  return path.relative(root, filePath).split(path.sep).join("/");
}
