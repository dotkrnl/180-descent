import { mkdir, readFile, stat, utimes, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { brandIconFile, socialImagesDir } from "@lib/assets/paths";
import { bookSocialImageFile, daySocialImageFile } from "@lib/assets/social-images";
import { contentDaysDir } from "@lib/content/paths";
import { loadContentRegistry } from "@lib/content/registry";
import { readBookData, type BookData } from "@lib/data/book";
import { bookDataFile } from "@lib/data/paths";
import { isPathUnavailableError } from "@lib/fs/errors";
import { toPosixRelative } from "@lib/fs/path";
import { escapeXml } from "@lib/text/escape";

interface GenerateSocialCardsOptions {
  root: string;
}

interface GenerateSocialCardsResult {
  generated: string[];
  refreshed: string[];
}

interface SocialCard {
  locale: "en" | "zh";
  title: string;
  summary: string;
  kicker: string;
  day: number | null;
  sourcePath: string;
  outPath: string;
}

interface DayData {
  locale: "en" | "zh";
  title: string;
  summary: string;
  day: number;
  dayPath: string;
  sourcePath: string;
}

const rendererPath = fileURLToPath(import.meta.url);
const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

function clampSocialText(value: string, max = 160): string {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).trim()}...` : text;
}

export async function generateSocialCards(options: GenerateSocialCardsOptions): Promise<GenerateSocialCardsResult> {
  const root = options.root;
  const outDir = socialImagesDir(root);
  const bookPath = bookDataFile(root);
  const brandMarkPath = brandIconFile(root);
  await mkdir(outDir, { recursive: true });

  const [book, bookStat, brandMarkStat, brandMarkBase64, rendererStat] = await Promise.all([
    readBookData(root),
    stat(bookPath),
    stat(brandMarkPath),
    readFile(brandMarkPath, "base64"),
    stat(rendererPath)
  ]);
  const cards = await loadSocialCards({ root, book, outDir });

  const pending: SocialCard[] = [];
  for (const card of cards) {
    const sourceMtimeMs = (await stat(card.sourcePath)).mtimeMs;
    const latestSourceMtimeMs = Math.max(bookStat.mtimeMs, brandMarkStat.mtimeMs, rendererStat.mtimeMs, sourceMtimeMs);
    if (await isSocialCardStale(card.outPath, latestSourceMtimeMs)) {
      pending.push(card);
    }
  }

  if (!pending.length) {
    return {
      generated: [],
      refreshed: []
    };
  }

  const generated: string[] = [];
  const refreshed: string[] = [];
  for (const card of pending) {
    const changed = await renderCard(card, brandMarkBase64);
    const relativePath = toPosixRelative(root, card.outPath);
    if (changed) {
      generated.push(relativePath);
    } else {
      refreshed.push(relativePath);
    }
  }

  return {
    generated,
    refreshed
  };
}

async function loadSocialCards(options: {
  root: string;
  book: BookData;
  outDir: string;
}): Promise<SocialCard[]> {
  const registry = await loadContentRegistry({ daysDir: contentDaysDir(options.root) });
  const enDays = registryDays(registry, "en");
  const zhDays = registryDays(registry, "zh");

  return [
    {
      locale: "en",
      title: options.book.title,
      summary: options.book.description,
      kicker: options.book.title,
      day: null,
      sourcePath: bookDataFile(options.root),
      outPath: path.join(options.outDir, bookSocialImageFile("en"))
    },
    {
      locale: "zh",
      title: options.book.zh.title,
      summary: options.book.zh.description,
      kicker: options.book.zh.title,
      day: null,
      sourcePath: bookDataFile(options.root),
      outPath: path.join(options.outDir, bookSocialImageFile("zh"))
    },
    ...enDays.map((day) => ({
      ...day,
      kicker: options.book.title,
      outPath: path.join(options.outDir, daySocialImageFile(day.locale, day.dayPath))
    })),
    ...zhDays.map((day) => ({
      ...day,
      kicker: options.book.zh.title,
      outPath: path.join(options.outDir, daySocialImageFile(day.locale, day.dayPath))
    }))
  ];
}

function renderSocialCardSvg(card: SocialCard, brandMarkBase64: string): string {
  const isZh = card.locale === "zh";
  const label = card.day !== null
    ? (isZh ? `第 ${String(card.day).padStart(3, "0")} 日` : `Day ${String(card.day).padStart(3, "0")}`)
    : (isZh ? "从根基到 2026 年研究前沿" : "Foundations to the 2026 research frontier");
  const summary = clampSocialText(card.summary, isZh ? 132 : 150);
  const titleLines = wrapSocialTextForCard(card.title, { maxLines: isZh ? 2 : 3, maxChars: isZh ? 15 : 22 });
  const summaryMaxLines = titleLines.length >= 3 ? 1 : titleLines.length === 2 ? 2 : 3;
  const summaryLines = summary ? wrapSocialTextForCard(summary, { maxLines: summaryMaxLines, maxChars: isZh ? 28 : 48 }) : [];
  const titleSize = isZh ? 70 : 78;
  const summarySize = isZh ? 34 : 32;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${CARD_WIDTH}" height="${CARD_HEIGHT}" viewBox="0 0 ${CARD_WIDTH} ${CARD_HEIGHT}">
  <defs>
    <pattern id="atlasGrid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M40 0H0V40" fill="none" stroke="#65c9bd" stroke-opacity=".07" stroke-width="1"/>
    </pattern>
    <linearGradient id="depthFade" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0c2a35" stop-opacity=".15"/>
      <stop offset="1" stop-color="#086b68" stop-opacity=".22"/>
    </linearGradient>
  </defs>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="#071d27"/>
  <rect width="${CARD_WIDTH}" height="${CARD_HEIGHT}" fill="url(#atlasGrid)"/>
  <rect width="20" height="${CARD_HEIGHT}" fill="#d75b43"/>
  <circle cx="1090" cy="92" r="246" fill="none" stroke="#65c9bd" stroke-opacity=".13" stroke-width="2"/>
  <circle cx="1090" cy="92" r="184" fill="none" stroke="#65c9bd" stroke-opacity=".09" stroke-width="1"/>
  <path d="M865 630C915 450 1015 374 1200 348V630Z" fill="url(#depthFade)"/>
  <text x="830" y="392" fill="#65c9bd" fill-opacity=".055" font-family="Georgia, Times New Roman, serif" font-size="330" font-weight="700">180</text>
  <rect x="84" y="70" width="220" height="3" fill="#65c9bd"/>
  <rect x="304" y="70" width="94" height="3" fill="#d75b43"/>
  <rect x="398" y="70" width="718" height="1" fill="#2c4850"/>
  <text x="84" y="142" fill="#7ad2c7" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" letter-spacing="1.4">${escapeXml(card.kicker.toUpperCase())}</text>
  ${svgMultilineText(titleLines, { x: 84, y: 224, size: titleSize, lineHeight: titleSize * 1.04, color: "#f7efdf", weight: 760, family: socialTitleFont(isZh) })}
  ${svgMultilineText(summaryLines, { x: 84, y: 224 + titleLines.length * titleSize * 1.04 + 40, size: summarySize, lineHeight: summarySize * 1.32, color: "#c3cfca", weight: 400, family: socialBodyFont(isZh) })}
  <circle cx="58" cy="574" r="5" fill="#d75b43"/>
  <text x="84" y="584" fill="#a9b9b7" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700">${escapeXml(label)}</text>
  <circle cx="935" cy="553" r="44" fill="#f3ecdf"/>
  <image x="897" y="515" width="76" height="76" href="data:image/png;base64,${brandMarkBase64}"/>
  <text x="990" y="564" fill="#f7efdf" font-family="Arial, Helvetica, sans-serif" font-size="25" font-weight="700">180d.io</text>
</svg>`;
}

function registryDays(registry: Awaited<ReturnType<typeof loadContentRegistry>>, locale: "en" | "zh"): DayData[] {
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

async function isSocialCardStale(outPath: string, sourceMtimeMs: number): Promise<boolean> {
  try {
    return (await stat(outPath)).mtimeMs < sourceMtimeMs;
  } catch (error) {
    if (!isPathUnavailableError(error)) throw error;
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
    ? "LXGW WenKai, Noto Serif CJK SC, Songti SC, SimSun, serif"
    : "Georgia, Times New Roman, serif";
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

export function wrapSocialTextForCard(value: string, options: { maxLines: number; maxChars: number }): string[] {
  const text = value.replace(/\s+/g, " ").trim();
  if (!text) return [];

  const isCjk = /[\u3400-\u9fff]/.test(text);
  const joiner = isCjk ? "" : " ";
  const tokens = isCjk ? [...text] : splitSocialTextTokens(text, options.maxChars);
  const lines: string[] = [];
  let line = "";

  for (const token of tokens) {
    const candidate = line ? `${line}${joiner}${token}` : token;
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

  if (lines.length && tokens.join(joiner).length > lines.join(joiner).length) {
    lines[lines.length - 1] = truncateSocialLine(lines[lines.length - 1], options.maxChars);
  }

  return lines;
}

function truncateSocialLine(line: string, maxChars: number): string {
  const ellipsis = "...";
  const text = line.replace(/\.{3}$/, "").trim();
  return `${text.slice(0, Math.max(0, maxChars - ellipsis.length)).trim()}${ellipsis}`;
}

function splitSocialTextTokens(text: string, maxChars: number): string[] {
  return text.split(" ").flatMap((token) => {
    if (token.length <= maxChars) return [token];
    const chunks: string[] = [];
    for (let index = 0; index < token.length; index += maxChars) {
      chunks.push(token.slice(index, index + maxChars));
    }
    return chunks;
  });
}

async function isSameRenderedImage(outPath: string, candidate: Buffer): Promise<boolean> {
  let existing: Buffer;
  try {
    existing = await readFile(outPath);
  } catch (error) {
    if (!isPathUnavailableError(error)) throw error;
    return false;
  }

  if (existing.equals(candidate)) {
    return true;
  }

  const candidatePixels = await sharp(candidate).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let existingPixels: typeof candidatePixels;
  try {
    existingPixels = await sharp(existing).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  } catch {
    return false;
  }

  return existingPixels.info.width === candidatePixels.info.width
    && existingPixels.info.height === candidatePixels.info.height
    && existingPixels.info.channels === candidatePixels.info.channels
    && existingPixels.data.equals(candidatePixels.data);
}
