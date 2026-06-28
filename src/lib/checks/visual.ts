import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import sharp from "sharp";
import { builtHtmlFiles } from "@lib/checks/built-site";
import { urlForSiteFile } from "@lib/static-site/url";

interface VisualCheckOptions {
  root: string;
  baseUrl: string;
  compareUrl?: string;
  outDir?: string;
}

interface VisualCheckCliArgs {
  baseUrl?: string;
  compareUrl?: string;
  outDir?: string;
  errors: string[];
}

interface VisualCheckResult {
  errors: string[];
  reportPath: string;
}

interface PageSnapshot {
  route: string;
  viewport: string;
  url: string;
  status: number;
  lang: string;
  title: string;
  h1: string;
  clientWidth: number;
  scrollWidth: number;
  scrollHeight: number;
  screenshots: Record<string, string>;
}

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 1000 }
] as const;
const SCROLL_STOPS = ["top", "middle", "bottom"] as const;

export function parseVisualCheckArgs(argv: string[]): VisualCheckCliArgs {
  const out: VisualCheckCliArgs = { errors: [] };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg.startsWith("--")) {
      out.errors.push(`Unexpected argument: ${arg}`);
      continue;
    }

    const equalsIndex = arg.indexOf("=");
    const inline = equalsIndex !== -1;
    const name = inline ? arg.slice(0, equalsIndex) : arg;
    if (!["--base", "--compare", "--out"].includes(name)) {
      out.errors.push(`Unknown option: ${name}`);
      if (!inline && argv[index + 1] && !argv[index + 1].startsWith("--")) index += 1;
      continue;
    }

    const value = inline ? arg.slice(equalsIndex + 1) : argv[index + 1];
    if (!value || value.startsWith("--")) {
      out.errors.push(`${name} requires a value`);
      continue;
    }

    const urlError = name === "--base" || name === "--compare" ? visualUrlError(name, value) : null;
    if (urlError) {
      out.errors.push(urlError);
    } else if (name === "--base" && out.baseUrl !== undefined) {
      out.errors.push("--base was provided more than once");
    } else if (name === "--compare" && out.compareUrl !== undefined) {
      out.errors.push("--compare was provided more than once");
    } else if (name === "--out" && out.outDir !== undefined) {
      out.errors.push("--out was provided more than once");
    } else if (name === "--base") {
      out.baseUrl = value;
    } else if (name === "--compare") {
      out.compareUrl = value;
    } else {
      out.outDir = value;
    }
    if (!inline) index += 1;
  }

  return out;
}

function visualUrlError(option: string, value: string): string | null {
  try {
    const url = new URL(value);
    if (url.protocol === "http:" || url.protocol === "https:") return null;
  } catch {}
  return `${option} must be an absolute http(s) URL`;
}

export async function checkVisual(options: VisualCheckOptions): Promise<VisualCheckResult> {
  const { builtSiteDir, htmlFiles } = await builtHtmlFiles(options.root, { required: true });
  const outDir = options.outDir ?? path.join(options.root, "tmp/visual-qa");
  const reportPath = path.join(outDir, "report.json");
  const routes = htmlFiles
    .map((file) => urlForSiteFile(builtSiteDir, file))
    .sort();
  const errors: string[] = [];
  const pages: Array<{ base: PageSnapshot; compare?: PageSnapshot; diffs?: Record<string, number> }> = [];

  await mkdir(outDir, { recursive: true });

  if (!routes.length) {
    errors.push("_site contains no HTML files");
    await writeVisualReport(reportPath, options, routes, errors, pages);
    return { errors, reportPath };
  }

  const browser = await chromium.launch();
  try {
    for (const route of routes) {
      for (const viewport of VIEWPORTS) {
        const base = await inspectPage(browser, options.baseUrl, route, viewport, path.join(outDir, "base"));
        checkSnapshot(base, errors);

        if (!options.compareUrl) {
          pages.push({ base });
          continue;
        }

        const compare = await inspectPage(browser, options.compareUrl, route, viewport, path.join(outDir, "compare"));
        checkSnapshot(compare, errors);
        compareSnapshots(base, compare, errors);
        pages.push({
          base,
          compare,
          diffs: await screenshotDiffs(base.screenshots, compare.screenshots)
        });
      }
    }
  } finally {
    await browser.close();
  }

  await writeVisualReport(reportPath, options, routes, errors, pages);

  return { errors, reportPath };
}

async function writeVisualReport(
  reportPath: string,
  options: VisualCheckOptions,
  routes: string[],
  errors: string[],
  pages: Array<{ base: PageSnapshot; compare?: PageSnapshot; diffs?: Record<string, number> }>
): Promise<void> {
  await writeFile(reportPath, JSON.stringify({
    baseUrl: options.baseUrl,
    compareUrl: options.compareUrl ?? null,
    routes,
    viewports: VIEWPORTS,
    errors,
    pages
  }, null, 2));
}

async function inspectPage(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  baseUrl: string,
  route: string,
  viewport: typeof VIEWPORTS[number],
  outDir: string
): Promise<PageSnapshot> {
  const page = await browser.newPage({ viewport: { width: viewport.width, height: viewport.height } });
  const url = new URL(route, normalizedBaseUrl(baseUrl)).href;
  const response = await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
  const metrics = await page.evaluate(() => {
    const doc = document.documentElement;
    return {
      lang: doc.getAttribute("lang") || "",
      title: document.title.trim(),
      h1: (document.querySelector("h1")?.textContent || "").replace(/\s+/g, " ").trim(),
      clientWidth: doc.clientWidth,
      scrollWidth: doc.scrollWidth,
      scrollHeight: doc.scrollHeight
    };
  });
  const screenshots: Record<string, string> = {};
  await mkdir(outDir, { recursive: true });

  for (const stop of SCROLL_STOPS) {
    const y = scrollYForStop(stop, metrics.scrollHeight, viewport.height);
    await page.evaluate(async (scrollY) => {
      window.scrollTo(0, scrollY);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }, y);
    const screenshotPath = path.join(outDir, `${safeName(route)}-${viewport.name}-${stop}.png`);
    await page.screenshot({ path: screenshotPath });
    screenshots[stop] = screenshotPath;
  }

  await page.close();

  return {
    route,
    viewport: viewport.name,
    url,
    status: response?.status() ?? 0,
    ...metrics,
    screenshots
  };
}

function checkSnapshot(snapshot: PageSnapshot, errors: string[]): void {
  if (snapshot.status < 200 || snapshot.status >= 400) {
    errors.push(`${snapshot.url} returned HTTP ${snapshot.status}`);
  }
  if (snapshot.scrollWidth > snapshot.clientWidth + 1) {
    errors.push(`${snapshot.url} overflows horizontally at ${snapshot.viewport}: scrollWidth ${snapshot.scrollWidth}, clientWidth ${snapshot.clientWidth}`);
  }
  if (!snapshot.lang) errors.push(`${snapshot.url} is missing html lang`);
  if (!snapshot.title) errors.push(`${snapshot.url} is missing title`);
  if (!snapshot.h1) errors.push(`${snapshot.url} is missing h1`);
}

function compareSnapshots(base: PageSnapshot, compare: PageSnapshot, errors: string[]): void {
  const label = `${base.route} ${base.viewport}`;
  if (base.status !== compare.status) errors.push(`${label}: status changed ${compare.status} -> ${base.status}`);
  if (base.lang !== compare.lang) errors.push(`${label}: lang changed "${compare.lang}" -> "${base.lang}"`);
  if (base.title !== compare.title) errors.push(`${label}: title changed "${compare.title}" -> "${base.title}"`);
  if (base.h1 !== compare.h1) errors.push(`${label}: h1 changed "${compare.h1}" -> "${base.h1}"`);
  const maxHeight = Math.max(base.scrollHeight, compare.scrollHeight, 1);
  if (Math.abs(base.scrollHeight - compare.scrollHeight) / maxHeight > 0.2) {
    errors.push(`${label}: scroll height changed ${compare.scrollHeight} -> ${base.scrollHeight}`);
  }
}

async function screenshotDiffs(base: Record<string, string>, compare: Record<string, string>): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const stop of SCROLL_STOPS) {
    out[stop] = await imageDiffRatio(base[stop], compare[stop]);
  }
  return out;
}

async function imageDiffRatio(aPath: string, bPath: string): Promise<number> {
  const [a, b] = await Promise.all([
    sharp(aPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(bPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  ]);
  if (a.info.width !== b.info.width || a.info.height !== b.info.height || a.info.channels !== b.info.channels) return 1;

  let changed = 0;
  const channels = a.info.channels;
  for (let index = 0; index < a.data.length; index += channels) {
    const diff = Math.abs(a.data[index] - b.data[index])
      + Math.abs(a.data[index + 1] - b.data[index + 1])
      + Math.abs(a.data[index + 2] - b.data[index + 2]);
    if (diff > 72) changed += 1;
  }
  return changed / (a.data.length / channels);
}

function scrollYForStop(stop: typeof SCROLL_STOPS[number], scrollHeight: number, viewportHeight: number): number {
  const max = Math.max(0, scrollHeight - viewportHeight);
  if (stop === "top") return 0;
  if (stop === "middle") return Math.round(max / 2);
  return max;
}

function normalizedBaseUrl(url: string): string {
  return url.endsWith("/") ? url : `${url}/`;
}

function safeName(route: string): string {
  return route.replace(/^\/|\/$/g, "").replace(/[^A-Za-z0-9]+/g, "-") || "home";
}
