import { mkdir, readFile, stat, utimes, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { loadContentRegistry } from "@lib/content/registry";
import { readBookData, type BookData } from "@lib/data/book";
import { toPosixRelative } from "@lib/fs/path";
import { escapeXml } from "@lib/text/escape";

interface GenerateSocialCardsOptions {
  root: string;
  dependencyFiles?: readonly string[];
}

interface GenerateSocialCardsResult {
  generated: string[];
  preserved: string[];
  skipped: number;
  total: number;
}

interface SocialCard {
  locale: "en" | "zh";
  title: string;
  summary?: string;
  description?: string;
  kicker?: string;
  day?: number;
  dayPath?: string;
  sourcePath?: string;
  outPath: string;
}

interface DayData {
  locale: "en" | "zh";
  title: string;
  summary?: string;
  description?: string;
  day?: number;
  dayPath: string;
  sourcePath: string;
}

const rendererPath = fileURLToPath(import.meta.url);
const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

function clampSocialText(value = "", max = 160): string {
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
    readBookData(root),
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
  for (const card of pending) {
    const changed = await renderCard(card, brandMarkBase64);
    const relativePath = toPosixRelative(root, card.outPath);
    if (changed) {
      generated.push(relativePath);
    } else {
      preserved.push(relativePath);
    }
  }

  return {
    generated,
    preserved,
    skipped: cards.length - pending.length,
    total: cards.length
  };
}

async function loadSocialCards(options: {
  root: string;
  book: BookData;
  outDir: string;
}): Promise<SocialCard[]> {
  const [enDays, zhDays] = await Promise.all([
    readRegistryDays(options.root, "en"),
    readRegistryDays(options.root, "zh")
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
      outPath: path.join(options.outDir, `day-${day.dayPath}.png`)
    })),
    ...zhDays.map((day) => ({
      ...day,
      kicker: options.book.zh.title,
      outPath: path.join(options.outDir, `zh-day-${day.dayPath}.png`)
    }))
  ];
}

function renderSocialCardSvg(card: SocialCard, brandMarkBase64: string): string {
  const isZh = card.locale === "zh";
  const kicker = card.kicker || (isZh ? "深入一百八十日" : "The 180-Day Descent");
  const label = card.day
    ? (isZh ? `第 ${String(card.day).padStart(3, "0")} 日` : `Day ${String(card.day).padStart(3, "0")}`)
    : (isZh ? "从根基到 2026 年研究前沿" : "Foundations to the 2026 research frontier");
  const summary = clampSocialText(card.summary || card.description || "", isZh ? 132 : 150);
  const titleLines = wrapSocialText(card.title, { maxLines: isZh ? 2 : 3, maxChars: isZh ? 15 : 22 });
  const summaryLines = summary ? wrapSocialText(summary, { maxLines: 3, maxChars: isZh ? 28 : 48 }) : [];
  const titleSize = isZh ? 70 : 78;
  const summarySize = isZh ? 34 : 32;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#f7f3ea"/>
  <rect width="18" height="${CARD_HEIGHT}" fill="#1e4942"/>
  <linearGradient id="warmFade" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#c54840" stop-opacity=".18"/>
    <stop offset=".38" stop-color="#c54840" stop-opacity="0"/>
  </linearGradient>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#warmFade)"/>
  <rect x="84" y="72" width="289" height="2" fill="#bd8a38"/>
  <rect x="373" y="72" width="166" height="2" fill="#c54840"/>
  <rect x="539" y="72" width="577" height="2" fill="#1e4942"/>
  <text x="84" y="145" fill="#6d4d18" font-family="Arial, Helvetica, sans-serif" font-size="30" font-weight="700" letter-spacing=".5">${escapeXml(kicker.toUpperCase())}</text>
  ${svgMultilineText(titleLines, { x: 84, y: 224, size: titleSize, lineHeight: titleSize * 1.04, color: "#191815", weight: 760, family: socialTitleFont(isZh) })}
  ${svgMultilineText(summaryLines, { x: 84, y: 224 + titleLines.length * titleSize * 1.04 + 40, size: summarySize, lineHeight: summarySize * 1.32, color: "#34312b", weight: 400, family: socialBodyFont(isZh) })}
  <text x="84" y="584" fill="#5b574e" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700">${escapeXml(label)}</text>
  <image x="897" y="515" width="76" height="76" href="data:image/png;base64,${brandMarkBase64}"/>
  <text x="990" y="564" fill="#5b574e" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700">180d.io</text>
</svg>`;
}

async function readRegistryDays(root: string, locale: "en" | "zh"): Promise<DayData[]> {
  const registry = await loadContentRegistry({ daysDir: path.join(root, "src/content/days") });
  return registry.days
    .map((day) => {
      const localeEntry = day.manifest.locales[locale];
      return {
        locale,
        title: localeEntry.title,
        summary: localeEntry.summary,
        day: day.manifest.day,
        dayPath: day.manifest.path,
        sourcePath: day.manifestPath
      };
    });
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

async function renderCard(card: SocialCard, brandMarkBase64: string): Promise<boolean> {
  const svg = renderSocialCardSvg(card, brandMarkBase64);
  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  if (await isSameRenderedImage(card.outPath, png)) {
    const now = new Date();
    await utimes(card.outPath, now, now);
    return false;
  }

  await writeFile(card.outPath, png);
  return true;
}

function socialTitleFont(isZh: boolean): string {
  return isZh
    ? "LXGW WenKai, Noto Serif CJK SC, Songti SC, SimSun, serif"
    : "Georgia, Times New Roman, serif";
}

function socialBodyFont(isZh: boolean): string {
  return isZh
    ? "LXGW WenKai, Noto Sans CJK SC, PingFang SC, Microsoft YaHei, sans-serif"
    : "Arial, Helvetica, sans-serif";
}

function svgMultilineText(lines: string[], options: {
  x: number;
  y: number;
  size: number;
  lineHeight: number;
  color: string;
  weight: number;
  family: string;
}): string {
  if (!lines.length) return "";
  const tspans = lines.map((line, index) => {
    const y = options.y + index * options.lineHeight;
    return `<tspan x="${options.x}" y="${y}">${escapeXml(line)}</tspan>`;
  }).join("");
  return `<text fill="${options.color}" font-family="${escapeXml(options.family)}" font-size="${options.size}" font-weight="${options.weight}">${tspans}</text>`;
}

function wrapSocialText(value: string, options: { maxLines: number; maxChars: number }): string[] {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (!text) return [];

  const tokens = /[\u3400-\u9fff]/.test(text)
    ? [...text]
    : text.split(" ");
  const lines: string[] = [];
  let line = "";

  for (const token of tokens) {
    const joiner = /[\u3400-\u9fff]/.test(text) ? "" : (line ? " " : "");
    const candidate = `${line}${joiner}${token}`;
    if (candidate.length > options.maxChars && line) {
      lines.push(line);
      line = token;
      if (lines.length === options.maxLines) break;
    } else {
      line = candidate;
    }
  }

  if (line && lines.length < options.maxLines) {
    lines.push(line);
  }

  if (lines.length && tokens.join(/[\u3400-\u9fff]/.test(text) ? "" : " ").length > lines.join(/[\u3400-\u9fff]/.test(text) ? "" : " ").length) {
    lines[lines.length - 1] = `${lines[lines.length - 1].replace(/\.{3}$/, "").trim()}...`;
  }

  return lines;
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
