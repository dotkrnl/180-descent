import { mkdir, readFile, readdir, stat, utimes, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { chromium, type Page } from "playwright";
import sharp from "sharp";
import yaml from "yaml";
import { escapeHtml } from "@lib/text/escape";

export interface GenerateSocialCardsOptions {
  root: string;
  dependencyFiles?: readonly string[];
}

export interface GenerateSocialCardsResult {
  generated: string[];
  preserved: string[];
  skipped: number;
  total: number;
}

export interface SocialCard {
  locale: "en" | "zh";
  title: string;
  summary?: string;
  description?: string;
  kicker?: string;
  day?: number;
  day_path?: string;
  sourcePath?: string;
  outPath: string;
}

interface BookData {
  title: string;
  description?: string;
  zh: {
    title: string;
    description?: string;
  };
}

interface DayData {
  locale: "en" | "zh";
  title: string;
  summary?: string;
  description?: string;
  day?: number;
  day_path: string;
  sourcePath: string;
}

const rendererPath = fileURLToPath(import.meta.url);

export function clampSocialText(value = "", max = 160): string {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).trim()}...` : text;
}

export async function generateSocialCards(options: GenerateSocialCardsOptions): Promise<GenerateSocialCardsResult> {
  const root = options.root;
  const outDir = path.join(root, "src/assets/images/social");
  const bookPath = path.join(root, "src/_data/book.yaml");
  const brandMarkPath = path.join(root, "src/assets/images/brand/180-descent-icon.png");
  const dependencyFiles = [rendererPath, ...(options.dependencyFiles ?? [])];

  await mkdir(outDir, { recursive: true });

  const [book, bookStat, brandMarkStat, brandMarkBase64, dependencyMtimeMs] = await Promise.all([
    readBookData(bookPath),
    stat(bookPath),
    stat(brandMarkPath),
    readFile(brandMarkPath, "base64"),
    latestMtime(dependencyFiles)
  ]);
  const cards = await loadSocialCards({ root, book, outDir });

  const pending: SocialCard[] = [];
  for (const card of cards) {
    const sourceMtimeMs = card.sourcePath ? (await stat(card.sourcePath)).mtimeMs : 0;
    const latestSourceMtimeMs = Math.max(bookStat.mtimeMs, brandMarkStat.mtimeMs, dependencyMtimeMs, sourceMtimeMs);
    if (await isSocialCardStale(card.outPath, latestSourceMtimeMs)) {
      pending.push(card);
    }
  }

  if (!pending.length) {
    return {
      generated: [],
      preserved: [],
      skipped: cards.length,
      total: cards.length
    };
  }

  const generated: string[] = [];
  const preserved: string[] = [];
  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    for (const card of pending) {
      const changed = await renderCard(page, card, brandMarkBase64);
      const relativePath = path.relative(root, card.outPath);
      if (changed) {
        generated.push(relativePath);
      } else {
        preserved.push(relativePath);
      }
    }
  } finally {
    await browser.close();
  }

  return {
    generated,
    preserved,
    skipped: cards.length - pending.length,
    total: cards.length
  };
}

export async function loadSocialCards(options: {
  root: string;
  book: BookData;
  outDir: string;
}): Promise<SocialCard[]> {
  const [enDays, zhDays] = await Promise.all([
    readDays(path.join(options.root, "src/days"), "en"),
    readDays(path.join(options.root, "src/zh/days"), "zh")
  ]);

  return [
    {
      locale: "en",
      title: options.book.title,
      summary: options.book.description,
      outPath: path.join(options.outDir, "180-descent.png")
    },
    {
      locale: "zh",
      title: options.book.zh.title,
      summary: options.book.zh.description,
      outPath: path.join(options.outDir, "180-descent-zh.png")
    },
    ...enDays.map((day) => ({
      ...day,
      kicker: options.book.title,
      outPath: path.join(options.outDir, `day-${day.day_path}.png`)
    })),
    ...zhDays.map((day) => ({
      ...day,
      kicker: options.book.zh.title,
      outPath: path.join(options.outDir, `zh-day-${day.day_path}.png`)
    }))
  ];
}

export function renderSocialCardHtml(card: SocialCard, brandMarkBase64: string): string {
  const isZh = card.locale === "zh";
  const kicker = card.kicker || (isZh ? "深入一百八十日" : "The 180-Day Descent");
  const label = card.day
    ? (isZh ? `第 ${String(card.day).padStart(3, "0")} 日` : `Day ${String(card.day).padStart(3, "0")}`)
    : (isZh ? "从根基到 2026 年研究前沿" : "Foundations to the 2026 research frontier");
  const summary = clampSocialText(card.summary || card.description || "", isZh ? 132 : 150);

  return `<!doctype html>
<html lang="${isZh ? "zh-Hans" : "en"}">
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0;
    width: 1200px;
    height: 630px;
    background: #f7f3ea;
    color: #191815;
    font-family: ui-serif, Georgia, "Times New Roman", "Noto Serif CJK SC", serif;
  }
  .card {
    position: relative;
    width: 1200px;
    height: 630px;
    padding: 72px 84px;
    overflow: hidden;
    background:
      linear-gradient(90deg, #1e4942 0 18px, transparent 18px),
      linear-gradient(180deg, rgba(197, 72, 64, .18), transparent 38%),
      #f7f3ea;
  }
  .rule {
    width: 100%;
    height: 2px;
    margin: 0 0 52px;
    background: linear-gradient(90deg, #bd8a38 0 28%, #c54840 28% 44%, #1e4942 44% 100%);
  }
  .kicker {
    margin: 0 0 20px;
    color: #6d4d18;
    font: 700 30px/1.15 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    text-transform: uppercase;
  }
  h1 {
    margin: 0;
    max-width: 970px;
    font-size: ${isZh ? "70px" : "78px"};
    line-height: 1.03;
    font-weight: 760;
  }
  .summary {
    max-width: 930px;
    margin: 34px 0 0;
    color: #34312b;
    font: 400 ${isZh ? "34px" : "32px"}/1.32 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .footer {
    position: absolute;
    left: 84px;
    right: 84px;
    bottom: 56px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 32px;
    color: #5b574e;
    font: 700 25px/1 ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  .mark {
    display: inline-flex;
    align-items: center;
    gap: 14px;
  }
  .footer-mark {
    width: 76px;
    height: 76px;
    display: block;
    object-fit: contain;
  }
</style>
</head>
<body>
  <main class="card">
    <div class="rule"></div>
    <p class="kicker">${escapeHtml(kicker)}</p>
    <h1>${escapeHtml(card.title)}</h1>
    ${summary ? `<p class="summary">${escapeHtml(summary)}</p>` : ""}
    <div class="footer">
      <span>${escapeHtml(label)}</span>
      <span class="mark"><img class="footer-mark" src="data:image/png;base64,${brandMarkBase64}" alt=""><span>180d.io</span></span>
    </div>
  </main>
</body>
</html>`;
}

async function readBookData(bookPath: string): Promise<BookData> {
  return yaml.parse(await readFile(bookPath, "utf8")) as BookData;
}

async function readDays(dir: string, locale: "en" | "zh"): Promise<DayData[]> {
  const files = (await readdir(dir))
    .filter((fileName) => fileName.endsWith(".md"))
    .sort();

  const days: DayData[] = [];
  for (const fileName of files) {
    const sourcePath = path.join(dir, fileName);
    const parsed = matter(await readFile(sourcePath, "utf8"));
    days.push({
      ...(parsed.data as Omit<DayData, "locale" | "sourcePath">),
      locale,
      sourcePath
    });
  }

  return days;
}

async function latestMtime(files: readonly string[]): Promise<number> {
  const mtimes = await Promise.all(files.map(async (filePath) => (await stat(filePath)).mtimeMs));
  return Math.max(...mtimes);
}

async function isSocialCardStale(outPath: string, sourceMtimeMs: number): Promise<boolean> {
  try {
    return (await stat(outPath)).mtimeMs < sourceMtimeMs;
  } catch {
    return true;
  }
}

async function renderCard(page: Page, card: SocialCard, brandMarkBase64: string): Promise<boolean> {
  await page.setContent(renderSocialCardHtml(card, brandMarkBase64), { waitUntil: "load" });
  const png = await page.screenshot({ type: "png" });

  if (await isSameRenderedImage(card.outPath, png)) {
    const now = new Date();
    await utimes(card.outPath, now, now);
    return false;
  }

  await writeFile(card.outPath, png);
  return true;
}

async function isSameRenderedImage(outPath: string, candidate: Buffer): Promise<boolean> {
  try {
    const existing = await readFile(outPath);
    if (existing.equals(candidate)) {
      return true;
    }

    const [existingPixels, candidatePixels] = await Promise.all([
      sharp(existing).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
      sharp(candidate).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
    ]);

    return existingPixels.info.width === candidatePixels.info.width
      && existingPixels.info.height === candidatePixels.info.height
      && existingPixels.info.channels === candidatePixels.info.channels
      && existingPixels.data.equals(candidatePixels.data);
  } catch {
    return false;
  }
}
