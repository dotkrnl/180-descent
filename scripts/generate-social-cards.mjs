import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";
import { chromium } from "playwright";
import yaml from "yaml";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outDir = path.join(rootDir, "src/assets/images/social");
const scriptPath = fileURLToPath(import.meta.url);
const bookPath = path.join(rootDir, "src/_data/book.yaml");

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function clamp(value = "", max = 160) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  return text.length > max ? `${text.slice(0, max - 1).trim()}...` : text;
}

async function readBookData() {
  return yaml.parse(await fs.readFile(bookPath, "utf8"));
}

async function readDays(dir, locale = "en") {
  const fullDir = path.join(rootDir, dir);
  const files = (await fs.readdir(fullDir))
    .filter((file) => file.endsWith(".md"))
    .sort();

  const days = [];
  for (const file of files) {
    const fullPath = path.join(fullDir, file);
    const parsed = matter(await fs.readFile(fullPath, "utf8"));
    days.push({
      ...parsed.data,
      locale,
      sourcePath: fullPath
    });
  }
  return days;
}

function cardHtml(card) {
  const isZh = card.locale === "zh";
  const kicker = card.kicker || (isZh ? "深入一百八十日" : "The 180-Day Descent");
  const label = card.day
    ? (isZh ? `第 ${String(card.day).padStart(3, "0")} 日` : `Day ${String(card.day).padStart(3, "0")}`)
    : (isZh ? "从根基到 2026 年研究前沿" : "Foundations to the 2026 research frontier");
  const summary = clamp(card.summary || card.description || "", isZh ? 132 : 150);

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
  .dot {
    width: 74px;
    height: 18px;
    background:
      radial-gradient(circle at 9px 9px, #c54840 0 8px, transparent 9px),
      radial-gradient(circle at 37px 9px, #bd8a38 0 8px, transparent 9px),
      radial-gradient(circle at 65px 9px, #1e4942 0 8px, transparent 9px);
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
      <span class="mark"><span class="dot"></span><span>180d.io</span></span>
    </div>
  </main>
</body>
</html>`;
}

async function needsGeneration(card, bookMtimeMs, scriptMtimeMs) {
  try {
    const outStat = await fs.stat(card.outPath);
    const sourceMtimeMs = card.sourcePath ? (await fs.stat(card.sourcePath)).mtimeMs : 0;
    return outStat.mtimeMs < Math.max(sourceMtimeMs, bookMtimeMs, scriptMtimeMs);
  } catch {
    return true;
  }
}

async function main() {
  await fs.mkdir(outDir, { recursive: true });
  const [book, bookStat, scriptStat] = await Promise.all([
    readBookData(),
    fs.stat(bookPath),
    fs.stat(scriptPath)
  ]);

  const enDays = await readDays("src/days", "en");
  const zhDays = await readDays("src/zh/days", "zh");
  const cards = [
    {
      locale: "en",
      title: book.title,
      summary: book.description,
      outPath: path.join(outDir, "180-descent.png")
    },
    {
      locale: "zh",
      title: book.zh.title,
      summary: book.zh.description,
      outPath: path.join(outDir, "180-descent-zh.png")
    },
    ...enDays.map((day) => ({
      ...day,
      kicker: book.title,
      outPath: path.join(outDir, `day-${day.day_path}.png`)
    })),
    ...zhDays.map((day) => ({
      ...day,
      kicker: book.zh.title,
      outPath: path.join(outDir, `zh-day-${day.day_path}.png`)
    }))
  ];

  const pending = [];
  for (const card of cards) {
    if (await needsGeneration(card, bookStat.mtimeMs, scriptStat.mtimeMs)) pending.push(card);
  }

  if (!pending.length) {
    console.log("Social cards are up to date.");
    return;
  }

  const browser = await chromium.launch({ args: ["--no-sandbox"] });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    for (const card of pending) {
      await page.setContent(cardHtml(card), { waitUntil: "load" });
      await page.screenshot({ path: card.outPath, type: "png" });
      console.log(`Generated ${path.relative(rootDir, card.outPath)}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
