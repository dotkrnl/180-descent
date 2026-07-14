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
const interactionKinds = [
  "uncertainty-ledger",
  "kibble-balance",
  "alpha-drift",
  "lineage",
  "quantum-hall",
  "accuracy-target",
  "readiness-ladder",
  "dark-matter-wave"
] as const;
const staticKinds = [
  "hero-meridian",
  "uncertainty-ledger",
  "kibble-balance",
  "alpha-drift",
  "hero-fossils",
  "lineage",
  "quantum-hall",
  "accuracy-target",
  "clock-tower",
  "hero-readiness",
  "readiness-ladder",
  "dark-matter-wave"
] as const;
type InteractionKind = typeof interactionKinds[number];

const origin = "http://day13-interaction.test";
const scriptPath = "/measurement-units.js";
const viteCacheDir = path.join(process.env.TMPDIR ?? os.tmpdir(), "day13-interaction-vite");
let browser: Browser;
let container: AstroContainer;
let interactionComponent: AstroComponentFactory;
let interactionScript = "";
let server: ViteDevServer;
let staticComponent: AstroComponentFactory;

beforeAll(async () => {
  const root = process.cwd();
  const configFactory = getViteConfig({ root }, { root });
  const config = await configFactory({ command: "serve", mode: "test", isPreview: false, isSsrBuild: true });
  server = await createServer({
    ...config,
    cacheDir: viteCacheDir,
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true, hmr: false, ws: false }
  });
  const [interactionModule, staticModule] = await Promise.all([
    server.ssrLoadModule("/src/app/components/lesson/interactives/Day13Interactive.astro"),
    server.ssrLoadModule("/src/app/components/lesson/figures/Day13StaticFigure.astro")
  ]);
  interactionComponent = interactionModule.default as AstroComponentFactory;
  staticComponent = staticModule.default as AstroComponentFactory;
  container = await AstroContainer.create();
  interactionScript = await readFile(path.join(root, "src/assets/js/interactions/measurement-units.js"), "utf8");
  browser = await chromium.launch({ headless: true });
}, 30_000);

afterAll(async () => {
  await Promise.all([browser ? browser.close() : Promise.resolve(), server ? server.close() : Promise.resolve()]);
  await rm(viteCacheDir, { recursive: true, force: true });
});

function renderInteraction(kind: InteractionKind, locale: Locale): Promise<string> {
  return container.renderToString(interactionComponent, { props: { kind, locale } });
}

function renderStatic(kind: typeof staticKinds[number], locale: Locale): Promise<string> {
  return container.renderToString(staticComponent, { props: { kind, locale } });
}

async function openInteractions(): Promise<{ context: BrowserContext; page: Page }> {
  const markup = (await Promise.all(interactionKinds.map((kind) => renderInteraction(kind, "en")))).join("\n");
  const context = await browser.newContext({ viewport: { width: 980, height: 760 }, reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.route(`${origin}/**`, async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname === scriptPath) {
      await route.fulfill({ status: 200, contentType: "application/javascript", body: interactionScript });
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: "text/html",
      body: `<!doctype html><html lang="en"><head><meta charset="utf-8"></head><body>
        <script>
          (function(){
            var observers = [];
            window.IntersectionObserver = function(callback){ this.callback = callback; this.target = null; observers.push(this); };
            window.IntersectionObserver.prototype.observe = function(target){ this.target = target; };
            window.IntersectionObserver.prototype.disconnect = function(){};
            window.IntersectionObserver.prototype.unobserve = function(){};
            window.__setDay13Visibility = function(kind, visible){
              var target = document.querySelector('[data-day13-kind="' + kind + '"]');
              var observer = observers.find(function(candidate){ return candidate.target === target; });
              if (!target || !observer) throw new Error('Missing Day 13 observer for ' + kind);
              observer.callback([{ target: target, isIntersecting: visible }], observer);
            };
            window.__day13ObserverCount = function(){ return observers.length; };
          })();
        </script>
        ${markup}<script src="${scriptPath}"></script>
      </body></html>`
    });
  });
  await page.goto(origin);
  await page.waitForFunction((expected) => document.querySelectorAll("[data-day13-kind]").length === expected, interactionKinds.length);
  return { context, page };
}

async function setVisibility(page: Page, kind: InteractionKind): Promise<void> {
  await page.evaluate((value) => {
    const harness = window as typeof window & { __setDay13Visibility: (kind: string, visible: boolean) => void };
    harness.__setDay13Visibility(value, true);
  }, kind);
}

describe("Day 13 component and runtime contracts", () => {
  it("renders localized, programmatically named controls without inline scripts", async () => {
    for (const locale of ["en", "zh"] as const) {
      for (const kind of interactionKinds) {
        const markup = await renderInteraction(kind, locale);
        const $ = load(markup);
        const root = $(`[data-day13-kind="${kind}"]`);
        expect(root).toHaveLength(1);
        expect(root.attr("data-locale")).toBe(locale);
        expect(root.hasClass("web-only")).toBe(true);
        expect(root.find("script")).toHaveLength(0);
        expect(root.find("h3").text().trim().length).toBeGreaterThan(0);
        root.find("button").each((_index, button) => {
          expect($(button).text().trim().length).toBeGreaterThan(0);
          expect($(button).attr("type")).toBe("button");
        });
        root.find('input[type="range"]').each((_index, range) => {
          expect($(range).closest("label")).toHaveLength(1);
        });
        root.find("svg").each((_index, svg) => {
          expect($(svg).attr("role")).toBe("img");
          expect($(svg).attr("aria-label")?.trim().length).toBeGreaterThan(0);
        });
      }
    }
  }, 20_000);

  it("gives every static kind one localized image and explanatory caption", async () => {
    for (const locale of ["en", "zh"] as const) {
      for (const kind of staticKinds) {
        const markup = await renderStatic(kind, locale);
        const $ = load(markup, { xmlMode: false });
        const root = $(`.day13-static-figure-${kind}`);
        expect(root).toHaveLength(1);
        expect(root.find("svg")).toHaveLength(1);
        expect(root.find("svg").attr("role")).toBe("img");
        expect(root.find("svg").attr("aria-label")?.trim().length).toBeGreaterThan(12);
        expect(root.find("figcaption").text().trim().length).toBeGreaterThan(40);
      }
    }
  }, 20_000);

  it("initializes each exhibit only after its own visibility signal", async () => {
    const { context, page } = await openInteractions();
    try {
      expect(await page.evaluate(() => (window as typeof window & { __day13ObserverCount: () => number }).__day13ObserverCount())).toBe(interactionKinds.length);
      expect(await page.locator('[data-day13-kind="uncertainty-ledger"] .day13-ledger-item').count()).toBe(0);
      for (const kind of interactionKinds) await setVisibility(page, kind);
      await page.waitForFunction(() => document.querySelectorAll('[data-day13-kind="readiness-ladder"] .day13-rung').length === 8);
      expect(await page.locator('[data-day13-kind="uncertainty-ledger"] .day13-ledger-item').count()).toBe(11);
      expect(await page.locator('[data-day13-kind="kibble-balance"] svg > *').count()).toBeGreaterThan(10);
      expect(await page.locator('[data-day13-kind="alpha-drift"] svg > *').count()).toBeGreaterThan(10);
      expect(await page.locator('[data-day13-kind="lineage"] .day13-stratum').count()).toBe(5);
      expect(await page.locator('[data-day13-kind="quantum-hall"] svg path').count()).toBeGreaterThan(0);
      expect(await page.locator('[data-day13-kind="accuracy-target"] svg circle').count()).toBeGreaterThan(10);
      expect(await page.locator('[data-day13-kind="dark-matter-wave"] svg path').count()).toBe(1);
    } finally {
      await context.close();
    }
  }, 20_000);

  it("supports native keyboard activation for buttons and ranges", async () => {
    const { context, page } = await openInteractions();
    try {
      for (const kind of interactionKinds) await setVisibility(page, kind);

      const secondRung = page.locator('[data-day13-kind="readiness-ladder"] .day13-rung').nth(1);
      await secondRung.focus();
      await page.keyboard.press("Enter");
      await expect(secondRung.getAttribute("aria-pressed")).resolves.toBe("true");
      expect(await page.locator('[data-day13-kind="readiness-ladder"] [data-out="detail-title"]').textContent()).toContain("orbital");

      const kilogram = page.locator('[data-day13-kind="lineage"] [data-unit="kilogram"]');
      await kilogram.focus();
      await page.keyboard.press("Space");
      await expect(kilogram.getAttribute("aria-pressed")).resolves.toBe("true");
      expect(await page.locator('[data-day13-kind="lineage"] [data-role="strata"]').textContent()).toContain("6.626 070 15");

      const audit = page.locator('[data-day13-kind="alpha-drift"] [data-action="audit"]');
      await audit.focus();
      await page.keyboard.press("Enter");
      await expect(audit.getAttribute("aria-pressed")).resolves.toBe("true");
      expect(await page.locator('[data-day13-kind="alpha-drift"] [data-out="verdict-title"]').textContent()).toContain("After");

      const velocity = page.locator('[data-day13-kind="kibble-balance"] [data-mode="velocity"]');
      await velocity.focus();
      await page.keyboard.press("Space");
      await expect(velocity.getAttribute("aria-pressed")).resolves.toBe("true");
      expect(await page.locator('[data-day13-kind="kibble-balance"] [data-role="equation-velocity"]').getAttribute("class")).toContain("is-active");

      const disorder = page.locator('[data-day13-kind="quantum-hall"] [data-role="disorder"]');
      await disorder.focus();
      await page.keyboard.press("Home");
      expect(await page.locator('[data-day13-kind="quantum-hall"] [data-out="verdict-title"]').textContent()).toContain("Too clean");

      const separation = page.locator('[data-day13-kind="dark-matter-wave"] [data-role="separation"]');
      await separation.focus();
      await page.keyboard.press("Home");
      expect(await page.locator('[data-day13-kind="dark-matter-wave"] [data-out="verdict-title"]').textContent()).toContain("Blind spot");
      await expect(separation.getAttribute("aria-valuetext")).resolves.toBe("0 km");
    } finally {
      await context.close();
    }
  }, 20_000);

  it("uses the displayed low/moderate boundary for accuracy verdicts", async () => {
    const { context, page } = await openInteractions();
    try {
      await setVisibility(page, "accuracy-target");
      const bias = page.locator('[data-day13-kind="accuracy-target"] [data-role="bias"]');
      const biasLabel = page.locator('[data-day13-kind="accuracy-target"] [data-out="bias"]');
      const verdict = page.locator('[data-day13-kind="accuracy-target"] [data-out="verdict-title"]');

      await bias.fill("27");
      await expect(biasLabel.textContent()).resolves.toBe("moderate");
      await expect(verdict.textContent()).resolves.toContain("High precision, low trueness");

      await bias.fill("24");
      await expect(biasLabel.textContent()).resolves.toBe("low");
      await expect(verdict.textContent()).resolves.toContain("Accurate");
    } finally {
      await context.close();
    }
  }, 20_000);

  it("distinguishes same-phase blind spots from momentary near-cancellation", async () => {
    const { context, page } = await openInteractions();
    try {
      await setVisibility(page, "dark-matter-wave");
      const separation = page.locator('[data-day13-kind="dark-matter-wave"] [data-role="separation"]');
      const verdict = page.locator('[data-day13-kind="dark-matter-wave"] [data-out="verdict-title"]');

      await separation.fill("0");
      await expect(verdict.textContent()).resolves.toContain("Blind spot");

      await separation.fill("17");
      await expect(verdict.textContent()).resolves.toContain("Near cancellation");

      const shortWave = page.locator('[data-day13-kind="dark-matter-wave"] [data-wave="short"]');
      await shortWave.click();
      await separation.fill("38");
      await expect(verdict.textContent()).resolves.toContain("Near cancellation");
    } finally {
      await context.close();
    }
  }, 20_000);
});
