import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { bookScriptTags, readBookScripts } from "./helpers/book-scripts";

const origin = "http://rail-navigation.test";
let bookScripts: Record<string, string> = {};
let browser: Browser;

beforeAll(async () => {
  bookScripts = await readBookScripts();
  browser = await chromium.launch({ headless: true });
}, 30_000);

afterAll(async () => {
  await browser.close();
});

async function openLesson(options: { headingCount?: number } = {}): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.route(`${origin}/**`, async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const script = bookScripts[pathname];
    await route.fulfill({
      status: 200,
      contentType: script === undefined ? "text/html" : "application/javascript",
      body: script ?? lessonPage(options.headingCount ?? 2)
    });
  });
  await page.goto(`${origin}/days/008-complexity-and-emergence/`);
  return { context, page };
}

function lessonPage(headingCount: number): string {
  const sections = ["Local rules", "Global order"]
    .slice(0, headingCount)
    .map((heading) => `<section><h2>${heading}</h2></section>`)
    .join("\n");
  return `<!doctype html>
    <html lang="en" data-theme="auto">
      <head>
        <meta charset="utf-8">
        ${bookScriptTags()}
      </head>
      <body>
        <header class="site-topbar">
          <span data-running-day></span><span data-running-block></span><span data-running-title></span><span data-running-progress></span>
          <div class="top-actions">
            <button id="themeBtn" data-label-dark="Use dark" data-label-light="Use light">Theme</button>
            <button type="button" data-rail-fab aria-controls="lessonRail" aria-expanded="false" hidden>Contents</button>
          </div>
        </header>
        <article class="lesson" data-reading-title="Complexity &amp; Emergence">
          <header class="hero"><h1>Complexity &amp; Emergence</h1></header>
          <button type="button" data-rail-backdrop hidden>Close contents</button>
          <aside id="lessonRail" data-lesson-rail>
            <span data-rail-read></span>
            <nav data-rail-toc-nav hidden><ol data-rail-toc></ol></nav>
          </aside>
          ${sections}
        </article>
      </body>
    </html>`;
}

describe("lesson rail navigation", () => {
  it("moves focus to the selected heading when the mobile drawer closes", async () => {
    const { context, page } = await openLesson();
    try {
      await expect(page.locator("#themeBtn + [data-rail-fab]").count()).resolves.toBe(1);
      await expect(page.locator("[data-rail-fab]").getAttribute("hidden")).resolves.toBeNull();
      await page.locator("[data-rail-fab]").click();
      await page.locator("[data-rail-link='global-order']").click();

      await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe("global-order");
      await expect(page.locator("[data-lesson-rail]").getAttribute("data-open")).resolves.toBeNull();
      await expect(page.locator("[data-rail-fab]").getAttribute("aria-expanded")).resolves.toBe("false");
    } finally {
      await context.close();
    }
  });

  it("returns focus to the navbar trigger when Escape closes the drawer", async () => {
    const { context, page } = await openLesson();
    try {
      const fab = page.locator("[data-rail-fab]");
      await fab.click();
      await expect.poll(() => page.evaluate(() => document.activeElement?.getAttribute("data-rail-link"))).toBe("local-rules");
      await page.keyboard.press("Escape");

      await expect(page.locator("[data-lesson-rail]").getAttribute("data-open")).resolves.toBeNull();
      await expect(fab.getAttribute("aria-expanded")).resolves.toBe("false");
      await expect(page.evaluate(() => document.activeElement?.hasAttribute("data-rail-fab"))).resolves.toBe(true);
    } finally {
      await context.close();
    }
  });

  it("keeps the navbar trigger hidden when the lesson cannot build a TOC", async () => {
    const { context, page } = await openLesson({ headingCount: 1 });
    try {
      await expect(page.locator("[data-rail-fab]").getAttribute("hidden")).resolves.not.toBeNull();
      await expect(page.locator("[data-rail-toc-nav]").getAttribute("hidden")).resolves.not.toBeNull();
      await expect(page.locator("[data-rail-link]").count()).resolves.toBe(0);
    } finally {
      await context.close();
    }
  });

  it("resets an open mobile drawer when the persistent rail breakpoint takes over", async () => {
    const { context, page } = await openLesson();
    try {
      await page.locator("[data-rail-fab]").click();
      await page.setViewportSize({ width: 1280, height: 900 });

      await expect.poll(() => page.locator("[data-lesson-rail]").getAttribute("data-open")).toBeNull();
      await expect(page.locator("[data-rail-backdrop]").getAttribute("hidden")).resolves.not.toBeNull();
      await expect(page.locator("[data-rail-fab]").getAttribute("aria-expanded")).resolves.toBe("false");
    } finally {
      await context.close();
    }
  });

  it("keeps the mobile topbar stable while scrolling past the lesson hero", async () => {
    const { context, page } = await openLesson();
    try {
      await page.evaluate(() => {
        document.body.style.minHeight = "2400px";
        window.scrollTo(0, 1800);
      });
      await page.waitForTimeout(50);

      await expect(page.evaluate(() => document.querySelector(".site-topbar")?.classList.contains("is-running"))).resolves.toBe(false);
    } finally {
      await context.close();
    }
  });
});
