import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { load } from "cheerio";
import { readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getViteConfig } from "astro/config";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { createServer, type ViteDevServer } from "vite";

type Locale = "en" | "zh";

const origin = "http://game-of-life.test";
const copy = {
  en: {
    canvas: "Editable Conway's Game of Life grid, initially showing a glider gun.",
    help: "Click a cell, or focus the grid and use the arrow keys to choose one; press Space or Enter to toggle it.",
    pause: "Pause the Game of Life",
    resume: "Resume the Game of Life",
    playText: "Play",
    pauseText: "Pause",
    dead: "Row 23, column 40: dead cell.",
    alive: "Row 23, column 40: alive cell.",
    pointerAlive: "Row 36, column 61: alive cell."
  },
  zh: {
    canvas: "可编辑的康威生命游戏网格，初始显示滑翔机枪。",
    help: "点击细胞；或聚焦网格，用方向键选择细胞，再按空格键或回车键切换。",
    pause: "暂停生命游戏",
    resume: "继续生命游戏",
    playText: "播放",
    pauseText: "暂停",
    dead: "第 23 行，第 40 列：死细胞。",
    alive: "第 23 行，第 40 列：活细胞。",
    pointerAlive: "第 36 行，第 61 列：活细胞。"
  }
} as const;

let browser: Browser;
let component: AstroComponentFactory;
let container: AstroContainer;
let interactionScript = "";
let server: ViteDevServer;
const viteCacheDir = path.join(process.env.TMPDIR ?? os.tmpdir(), "game-of-life-vite");

beforeAll(async () => {
  const root = process.cwd();
  const configFactory = getViteConfig({ root }, { root });
  const config = await configFactory({
    command: "serve",
    mode: "test",
    isPreview: false,
    isSsrBuild: true
  });
  server = await createServer({
    ...config,
    cacheDir: viteCacheDir,
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true, hmr: false, ws: false }
  });
  const module = await server.ssrLoadModule(
    "/src/app/components/lesson/interactives/GameOfLifeGun.astro"
  );
  component = module.default as AstroComponentFactory;
  container = await AstroContainer.create();
  interactionScript = await readFile(
    path.join(root, "src/assets/js/interactions/complexity-emergence.js"),
    "utf8"
  );
  browser = await chromium.launch({ headless: true });
}, 30_000);

afterAll(async () => {
  await Promise.all([browser.close(), server.close()]);
  await rm(viteCacheDir, { recursive: true, force: true });
});

async function render(locale: Locale): Promise<string> {
  return container.renderToString(component, { props: { locale } });
}

async function openGame(locale: Locale): Promise<{ context: BrowserContext; page: Page }> {
  const markup = await render(locale);
  const context = await browser.newContext({
    reducedMotion: "reduce",
    viewport: { width: 800, height: 600 }
  });
  const page = await context.newPage();
  await page.route(`${origin}/**`, async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname === "/complexity-emergence.js") {
      await route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: interactionScript
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: `<!doctype html>
        <html lang="${locale}">
          <head>
            <meta charset="utf-8">
            <style>
              body { --paper: rgb(255, 255, 255); --accent: rgb(0, 128, 128); --brass: rgb(180, 120, 0); --ink: rgb(0, 0, 0); }
              #gol { display: block; width: 380px; height: 220px; }
            </style>
          </head>
          <body>
            <script>delete window.IntersectionObserver;</script>
            ${markup}
            <script src="/complexity-emergence.js"></script>
          </body>
        </html>`
    });
  });
  await page.goto(`${origin}/${locale}/`);
  await page.waitForFunction(
    (expected) => document.getElementById("gol-play")?.textContent === expected,
    copy[locale].playText
  );
  return { context, page };
}

async function canvasPixel(page: Page, x: number, y: number): Promise<number[]> {
  return page.evaluate(({ x, y }) => {
    const canvas = document.querySelector<HTMLCanvasElement>("#gol");
    const context = canvas?.getContext("2d");
    return context ? Array.from(context.getImageData(x, y, 1, 1).data) : [];
  }, { x, y });
}

describe("GameOfLifeGun accessibility", () => {
  it.each(["en", "zh"] as const)("renders a named keyboard-operable grid in %s", async (locale) => {
    const $ = load(await render(locale));
    const canvas = $("#gol");

    expect(canvas.attr("role")).toBe("application");
    expect(canvas.attr("tabindex")).toBe("0");
    expect(canvas.attr("aria-label")).toBe(copy[locale].canvas);
    expect(canvas.attr("aria-describedby")).toBe("gol-keyboard-help gol-cell-status");
    expect(canvas.attr("aria-keyshortcuts")).toBe("ArrowUp ArrowDown ArrowLeft ArrowRight Space Enter");
    expect($("#gol-keyboard-help").text()).toContain(copy[locale].help);
    expect($("#gol-cell-status").attr("aria-live")).toBe("polite");
    expect($("#gol-play").attr("aria-label")).toBe(copy[locale].pause);
    expect($(".emergence-controls button[type='button']")).toHaveLength(4);
  });

  it.each(["en", "zh"] as const)("supports keyboard and pointer cell editing in %s", async (locale) => {
    const { context, page } = await openGame(locale);
    const canvas = page.locator("#gol");

    try {
      await canvas.focus();
      await page.keyboard.press("ArrowRight");
      expect(await page.locator("#gol-cell-status").textContent()).toBe(copy[locale].dead);

      await page.keyboard.press("Space");
      expect(await page.locator("#gol-cell-status").textContent()).toBe(copy[locale].alive);
      expect(await canvasPixel(page, 39 * 5 + 2, 22 * 5 + 2)).toEqual([0, 128, 128, 255]);

      await page.keyboard.press("Enter");
      expect(await page.locator("#gol-cell-status").textContent()).toBe(copy[locale].dead);
      expect(await canvasPixel(page, 39 * 5 + 2, 22 * 5 + 2)).toEqual([255, 255, 255, 255]);

      const box = await canvas.boundingBox();
      expect(box).not.toBeNull();
      await page.mouse.click(box!.x + 60 * 5 + 2.5, box!.y + 35 * 5 + 2.5);
      expect(await page.locator("#gol-cell-status").textContent()).toBe(copy[locale].pointerAlive);
      expect(await canvasPixel(page, 60 * 5 + 2, 35 * 5 + 2)).toEqual([0, 128, 128, 255]);

      const clear = page.locator("#gol-clear");
      await clear.focus();
      await page.keyboard.press("Enter");
      expect(await canvasPixel(page, 60 * 5 + 2, 35 * 5 + 2)).toEqual([255, 255, 255, 255]);

      const play = page.locator("#gol-play");
      expect(await play.getAttribute("aria-label")).toBe(copy[locale].resume);
      await play.focus();
      await page.keyboard.press("Enter");
      expect(await play.textContent()).toBe(copy[locale].pauseText);
      expect(await play.getAttribute("aria-label")).toBe(copy[locale].pause);
      await page.keyboard.press("Enter");
      expect(await play.textContent()).toBe(copy[locale].playText);
      expect(await play.getAttribute("aria-label")).toBe(copy[locale].resume);
    } finally {
      await context.close();
    }
  });
});
