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
  "small-world",
  "degree-distribution",
  "contagion",
  "friendship-paradox",
  "robustness",
  "centrality",
  "synchronization",
  "tipping-cascade"
] as const;
const staticKinds = [
  "hero-small-world",
  "small-world",
  "degree-distribution",
  "contagion",
  "friendship-paradox",
  "navigability",
  "weak-ties",
  "robustness",
  "centrality",
  "simplex",
  "synchronization",
  "hyperbolic",
  "message-passing",
  "driver-nodes",
  "tipping-cascade"
] as const;
type InteractionKind = typeof interactionKinds[number];

interface TimerSnapshot {
  cleared: number[];
  pending: number[];
  scheduled: number[];
}

const origin = "http://day12-interaction.test";
const scriptPath = "/networks.js";
const viteCacheDir = path.join(process.env.TMPDIR ?? os.tmpdir(), "day12-interaction-vite");

let browser: Browser;
let container: AstroContainer;
let interactionComponent: AstroComponentFactory;
let interactionScript = "";
let server: ViteDevServer;
let staticComponent: AstroComponentFactory;

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
  const [interactionModule, staticModule] = await Promise.all([
    server.ssrLoadModule(
      "/src/app/components/lesson/interactives/Day12Interactive.astro"
    ),
    server.ssrLoadModule(
      "/src/app/components/lesson/figures/Day12StaticFigure.astro"
    )
  ]);
  interactionComponent = interactionModule.default as AstroComponentFactory;
  staticComponent = staticModule.default as AstroComponentFactory;
  container = await AstroContainer.create();
  interactionScript = await readFile(
    path.join(root, "src/assets/js/interactions/networks.js"),
    "utf8"
  );
  browser = await chromium.launch({ headless: true });
}, 30_000);

afterAll(async () => {
  await Promise.all([browser.close(), server.close()]);
  await rm(viteCacheDir, { recursive: true, force: true });
});

function renderInteraction(kind: InteractionKind, locale: Locale): Promise<string> {
  return container.renderToString(interactionComponent, { props: { kind, locale } });
}

function renderStatic(kind: typeof staticKinds[number], locale: Locale): Promise<string> {
  return container.renderToString(staticComponent, { props: { kind, locale } });
}

async function openInteractions(options: { reducedMotion?: "reduce" } = {}): Promise<{ context: BrowserContext; page: Page }> {
  const markup = (await Promise.all(
    interactionKinds.map((kind) => renderInteraction(kind, "en"))
  )).join("\n");
  const context = await browser.newContext({
    viewport: { width: 900, height: 700 },
    reducedMotion: options.reducedMotion
  });
  const page = await context.newPage();
  await page.route(`${origin}/**`, async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname === scriptPath) {
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
        <html lang="en">
          <head><meta charset="utf-8"></head>
          <body>
            <script>
              (function(){
                var observers = [];
                var nativeSetTimeout = window.setTimeout.bind(window);
                var nativeClearTimeout = window.clearTimeout.bind(window);
                var pending = new Map();
                var scheduled = [];
                var cleared = [];

                window.IntersectionObserver = function(callback){
                  this.callback = callback;
                  this.target = null;
                  observers.push(this);
                };
                window.IntersectionObserver.prototype.observe = function(target){
                  this.target = target;
                };
                window.IntersectionObserver.prototype.disconnect = function(){};
                window.IntersectionObserver.prototype.unobserve = function(){};
                window.__setDay12Visibility = function(kind, isIntersecting){
                  var target = document.querySelector('[data-day12-kind="' + kind + '"]');
                  var observer = observers.find(function(candidate){ return candidate.target === target; });
                  if (!target || !observer) throw new Error("Missing Day 12 observer for " + kind);
                  observer.callback([{ target: target, isIntersecting: isIntersecting }], observer);
                };
                window.__day12ObserverCount = function(){ return observers.length; };
                window.setTimeout = function(callback, delay){
                  var timer = nativeSetTimeout(function(){
                    pending.delete(timer);
                    callback();
                  }, delay);
                  if (delay === 380 || delay === 430) {
                    pending.set(timer, delay);
                    scheduled.push(delay);
                  }
                  return timer;
                };
                window.clearTimeout = function(timer){
                  if (pending.has(timer)) {
                    cleared.push(pending.get(timer));
                    pending.delete(timer);
                  }
                  nativeClearTimeout(timer);
                };
                window.__day12TimerSnapshot = function(){
                  return {
                    cleared: cleared.slice(),
                    pending: Array.from(pending.values()),
                    scheduled: scheduled.slice()
                  };
                };
              })();
            </script>
            ${markup}
            <script src="${scriptPath}"></script>
          </body>
        </html>`
    });
  });
  await page.goto(origin);
  await page.waitForFunction(
    (expected) => document.querySelectorAll("[data-day12-kind]").length === expected,
    interactionKinds.length
  );
  return { context, page };
}

async function setVisibility(page: Page, kind: InteractionKind, isIntersecting: boolean): Promise<void> {
  await page.evaluate(({ kind, isIntersecting }) => {
    const harness = window as typeof window & {
      __setDay12Visibility: (value: string, visible: boolean) => void;
    };
    harness.__setDay12Visibility(kind, isIntersecting);
  }, { kind, isIntersecting });
}

async function timerSnapshot(page: Page): Promise<TimerSnapshot> {
  return page.evaluate(() => {
    const harness = window as typeof window & {
      __day12TimerSnapshot: () => TimerSnapshot;
    };
    return harness.__day12TimerSnapshot();
  });
}

describe("Day 12 component contracts", () => {
  it.each(["en", "zh"] as const)("renders every static figure contract in %s", async (locale) => {
    const figures = await Promise.all(
      staticKinds.map(async (kind) => ({ kind, markup: await renderStatic(kind, locale) }))
    );

    for (const { kind, markup } of figures) {
      const $ = load(markup);
      const figure = $(`figure.day12-static-figure-${kind}`);
      const svg = figure.children("svg");

      expect(figure).toHaveLength(1);
      expect(svg.attr("role")).toBe("img");
      expect(svg.attr("aria-label")?.trim()).not.toBe("");
      expect(figure.children("figcaption").text().trim()).not.toBe("");
    }
  });

  it.each(["en", "zh"] as const)("renders every interactive contract in %s", async (locale) => {
    const interactions = await Promise.all(
      interactionKinds.map(async (kind) => ({ kind, markup: await renderInteraction(kind, locale) }))
    );

    for (const { kind, markup } of interactions) {
      const $ = load(markup);
      const root = $(`[data-day12-kind="${kind}"]`);
      const svg = root.find("svg");

      expect(root).toHaveLength(1);
      expect(root.attr("data-locale")).toBe(locale);
      expect(svg).toHaveLength(1);
      expect(svg.attr("aria-label")?.trim()).not.toBe("");
      expect(svg.attr("role")).toBe(
        kind === "friendship-paradox" || kind === "tipping-cascade" ? "group" : "img"
      );
      expect(root.find('[data-out="verdict"][role="status"][aria-live="polite"]')).toHaveLength(1);
      expect(root.find("button:not([type='button'])")).toHaveLength(0);
      expect($("script")).toHaveLength(0);
    }
  });

  it("preserves directional markers, wrapped labels, and non-color legends", async () => {
    const [messageMarkup, driverMarkup, tippingMarkup, contagionMarkup, robustnessMarkup] = await Promise.all([
      renderStatic("message-passing", "en"),
      renderStatic("driver-nodes", "en"),
      renderStatic("tipping-cascade", "en"),
      renderInteraction("contagion", "en"),
      renderInteraction("robustness", "en")
    ]);
    const message = load(messageMarkup);
    const driver = load(driverMarkup);
    const tipping = load(tippingMarkup);
    const contagion = load(contagionMarkup);
    const robustness = load(robustnessMarkup);

    expect(message("line[marker-end], path[marker-end]").length).toBeGreaterThanOrEqual(4);
    expect(driver("line[marker-end], path[marker-end]").length).toBeGreaterThanOrEqual(8);
    expect(tipping('line[marker-end*="arrow-red"]').length).toBeGreaterThan(0);
    expect(tipping('line[marker-end*="bar-green"]').length).toBeGreaterThan(0);
    expect(tipping('path[marker-end*="arrow-red"]').length).toBeGreaterThan(0);
    expect(tipping("tspan").map((_, node) => tipping(node).text()).get()).toEqual(expect.arrayContaining(["Green", "land"]));
    expect(contagion(".day12-legend li")).toHaveLength(4);
    expect(robustness(".day12-legend li")).toHaveLength(3);
  });
});

describe("Day 12 interaction runtime", () => {
  it("lazily initializes all eight interaction kinds", async () => {
    const { context, page } = await openInteractions();

    try {
      expect(await page.evaluate(() => {
        const harness = window as typeof window & { __day12ObserverCount: () => number };
        return harness.__day12ObserverCount();
      })).toBe(interactionKinds.length);

      for (const kind of interactionKinds) {
        const root = page.locator(`[data-day12-kind="${kind}"]`);
        expect(await root.locator("svg > *").count()).toBe(0);
        expect(await root.locator('[data-out="verdict"]').textContent()).toBe("");
      }

      for (const kind of interactionKinds) await setVisibility(page, kind, true);

      for (const kind of interactionKinds) {
        const root = page.locator(`[data-day12-kind="${kind}"]`);
        expect(await root.locator("svg > *").count()).toBeGreaterThan(0);
        expect((await root.locator('[data-out="verdict"]').textContent())?.trim()).not.toBe("");
      }
    } finally {
      await context.close();
    }
  });

  it("makes interactive SVG groups keyboard-operable and announces their result", async () => {
    const { context, page } = await openInteractions();

    try {
      await setVisibility(page, "friendship-paradox", true);
      const friendship = page.locator('[data-day12-kind="friendship-paradox"]');
      const people = friendship.locator('svg g[role="button"][tabindex="0"]');
      expect(await people.count()).toBe(12);
      expect((await people.first().getAttribute("aria-label"))?.trim()).not.toBe("");
      await people.first().focus();
      await page.keyboard.press("Space");
      expect(await friendship.locator('[data-out="verdict"]').textContent()).toContain("Person 1 has");
      expect(await people.first().getAttribute("aria-pressed")).toBe("true");
      expect(await page.evaluate(() => document.activeElement?.getAttribute("data-node"))).toBe("0");

      await setVisibility(page, "tipping-cascade", true);
      await setVisibility(page, "tipping-cascade", false);
      const tipping = page.locator('[data-day12-kind="tipping-cascade"]');
      const elements = tipping.locator('svg g[role="button"][tabindex="0"]');
      expect(await elements.count()).toBe(7);
      expect(await tipping.locator("svg [marker-end]").count()).toBe(9);
      expect((await elements.first().getAttribute("aria-label"))?.trim()).not.toBe("");
      await elements.first().focus();
      await page.keyboard.press("Enter");
      expect(await tipping.locator('[data-out="tipped"]').textContent()).toBe("1 / 7");
      expect(await tipping.locator('[data-out="trigger"]').textContent()).toBe("Greenland ice sheet");
      expect(await elements.first().getAttribute("aria-pressed")).toBe("true");
      expect((await tipping.locator('[role="status"]').textContent())?.trim()).not.toBe("");
      expect(await page.evaluate(() => document.activeElement?.getAttribute("data-node"))).toBe("0");
    } finally {
      await context.close();
    }
  });

  it("holds the contagion index case and random stream fixed across protection strategies", async () => {
    const { context, page } = await openInteractions();

    try {
      await setVisibility(page, "contagion", true);
      const root = page.locator('[data-day12-kind="contagion"]');
      const infectedIndex = async (strategy: "random" | "hubs"): Promise<number> => {
        await root.locator(`[data-strategy="${strategy}"]`).click();
        expect(await root.locator('[data-out="immunized"]').textContent()).toBe("5");
        await root.locator('[data-action="play"]').click();
        return root.locator("svg circle").evaluateAll((nodes) => nodes.findIndex((node) => node.getAttribute("fill") === "var(--contested)"));
      };

      const randomIndex = await infectedIndex("random");
      const hubIndex = await infectedIndex("hubs");
      expect(randomIndex).toBeGreaterThanOrEqual(0);
      expect(hubIndex).toBe(randomIndex);
      expect(await root.locator("svg circle").count()).toBe(42);
    } finally {
      await context.close();
    }
  });

  it("keeps the small-world rewiring plan stable and preserves its edge count", async () => {
    const { context, page } = await openInteractions();

    try {
      await setVisibility(page, "small-world", true);
      const root = page.locator('[data-day12-kind="small-world"]');
      const slider = root.locator('[data-role="rewiring"]');
      const setProbability = async (value: number): Promise<void> => {
        await slider.evaluate((input, nextValue) => {
          const range = input as HTMLInputElement;
          range.value = String(nextValue);
          range.dispatchEvent(new Event("input", { bubbles: true }));
        }, value);
      };
      const shortcuts = async (): Promise<string[]> => root.locator('svg line[stroke="var(--brass)"]').evaluateAll((lines) =>
        lines.map((line) => ["x1", "y1", "x2", "y2"].map((name) => line.getAttribute(name)).join(":"))
      );

      expect(await root.locator("svg line").count()).toBe(48);
      expect(await shortcuts()).toEqual([]);
      await setProbability(20);
      const earlier = await shortcuts();
      expect(earlier.length).toBeGreaterThan(0);
      await setProbability(40);
      const later = await shortcuts();
      expect(await root.locator("svg line").count()).toBe(48);
      for (const edge of earlier) expect(later).toContain(edge);
    } finally {
      await context.close();
    }
  });

  it("uses comparable probability scales and reserves the look-alike overlay for heavy tails", async () => {
    const { context, page } = await openInteractions();

    try {
      await setVisibility(page, "degree-distribution", true);
      const root = page.locator('[data-day12-kind="degree-distribution"]');
      const overlay = root.locator('[data-role="overlay"]');
      await overlay.check();
      const paths = root.locator("svg > path");
      expect(await paths.count()).toBe(2);
      const starts = await paths.evaluateAll((nodes) => nodes.map((node) => {
        const match = node.getAttribute("d")?.match(/^M\s+\S+\s+(\S+)/);
        return Number(match?.[1]);
      }));
      expect(starts[0]).toBeGreaterThan(25);
      expect(Math.abs(starts[0] - starts[1])).toBeGreaterThan(5);

      await root.locator('[data-dist="random"]').click();
      expect(await overlay.isDisabled()).toBe(true);
      expect(await overlay.isChecked()).toBe(false);
      expect(await paths.count()).toBe(1);
    } finally {
      await context.close();
    }
  });

  it("draws explicit synchronization jumps and resolves motion instantly when requested", async () => {
    const standard = await openInteractions();

    try {
      await setVisibility(standard.page, "synchronization", true);
      const root = standard.page.locator('[data-day12-kind="synchronization"]');
      await root.locator('[data-role="coupling"]').evaluate((input) => {
        const range = input as HTMLInputElement;
        range.value = "100";
        range.dispatchEvent(new Event("input", { bubbles: true }));
      });
      expect(await root.locator("svg text").allTextContents()).toContain("bistable range");
      const paths = await root.locator("svg > path").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("d") ?? ""));
      expect(paths.every((pathData) => /L\s+(\d+\.\d+)\s+\S+\s+L\s+\1\s+/.test(pathData))).toBe(true);
    } finally {
      await standard.context.close();
    }

    const reduced = await openInteractions({ reducedMotion: "reduce" });
    try {
      await setVisibility(reduced.page, "contagion", true);
      await reduced.page.locator('[data-day12-kind="contagion"] [data-action="play"]').click();
      expect((await timerSnapshot(reduced.page)).pending).not.toContain(380);
      expect(await reduced.page.locator('[data-day12-kind="contagion"] [data-out="verdict"]').textContent()).toContain("Outbreak complete");

      await setVisibility(reduced.page, "tipping-cascade", true);
      const tipping = reduced.page.locator('[data-day12-kind="tipping-cascade"]');
      await tipping.locator('svg g[role="button"]').first().click();
      expect(await tipping.locator('[data-out="tipped"]').textContent()).toBe("6 / 7");
      expect((await timerSnapshot(reduced.page)).pending).not.toContain(430);

      await tipping.locator('[data-action="reset"]').click();
      await tipping.locator('svg g[role="button"]').nth(2).click();
      expect(await tipping.locator('[data-out="tipped"]').textContent()).toBe("5 / 7");
      expect(await tipping.locator('svg g[role="button"]').first().getAttribute("aria-pressed")).toBe("false");
    } finally {
      await reduced.context.close();
    }
  });

  it("stops and resumes animated timers as their interactions leave the viewport", async () => {
    const { context, page } = await openInteractions();

    try {
      await setVisibility(page, "contagion", true);
      await page.locator('[data-day12-kind="contagion"] [data-action="play"]').click();
      expect((await timerSnapshot(page)).pending).toContain(380);
      await setVisibility(page, "contagion", false);
      expect(await timerSnapshot(page)).toMatchObject({ cleared: [380], pending: [] });
      await setVisibility(page, "contagion", true);
      expect((await timerSnapshot(page)).pending).toContain(380);
      await setVisibility(page, "contagion", false);

      await setVisibility(page, "tipping-cascade", true);
      await page.locator('[data-day12-kind="tipping-cascade"] svg g[role="button"]').first().click();
      expect((await timerSnapshot(page)).pending).toContain(430);
      await setVisibility(page, "tipping-cascade", false);

      const snapshot = await timerSnapshot(page);
      expect(snapshot.pending).toEqual([]);
      expect(snapshot.scheduled.filter((delay) => delay === 380)).toHaveLength(2);
      expect(snapshot.cleared.filter((delay) => delay === 380)).toHaveLength(2);
      expect(snapshot.scheduled.filter((delay) => delay === 430)).toHaveLength(1);
      expect(snapshot.cleared.filter((delay) => delay === 430)).toHaveLength(1);
    } finally {
      await context.close();
    }
  });
});
