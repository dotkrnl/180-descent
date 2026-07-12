import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";

const origin = "http://rail-navigation.test";
let bookScript = "";
let browser: Browser;

beforeAll(async () => {
  bookScript = await readFile(path.join(process.cwd(), "src/assets/js/book.js"), "utf8");
  browser = await chromium.launch({ headless: true });
}, 30_000);

afterAll(async () => {
  await browser.close();
});

async function openLesson(): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.route(`${origin}/**`, async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    await route.fulfill({
      status: 200,
      contentType: pathname === "/book.js" ? "application/javascript" : "text/html",
      body: pathname === "/book.js" ? bookScript : lessonPage()
    });
  });
  await page.goto(`${origin}/days/008-complexity-and-emergence/`);
  return { context, page };
}

function lessonPage(): string {
  return `<!doctype html>
    <html lang="en">
      <head><meta charset="utf-8"><script src="/book.js" defer></script></head>
      <body>
        <header class="site-topbar"><span data-running-day></span><span data-running-block></span><span data-running-title></span><span data-running-progress></span></header>
        <article class="lesson" data-reading-title="Complexity &amp; Emergence">
          <header class="hero"><h1>Complexity &amp; Emergence</h1></header>
          <button type="button" data-rail-fab aria-controls="lessonRail" aria-expanded="false" hidden>Contents</button>
          <button type="button" data-rail-backdrop hidden>Close contents</button>
          <aside id="lessonRail" data-lesson-rail>
            <span data-rail-read></span>
            <nav data-rail-toc-nav hidden><ol data-rail-toc></ol></nav>
          </aside>
          <section><h2>Local rules</h2></section>
          <section><h2>Global order</h2></section>
        </article>
      </body>
    </html>`;
}

describe("lesson rail navigation", () => {
  it("moves focus to the selected heading when the mobile drawer closes", async () => {
    const { context, page } = await openLesson();
    try {
      await page.locator("[data-rail-fab]").click();
      await page.locator("[data-rail-link='global-order']").click();

      await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe("global-order");
      await expect(page.locator("[data-lesson-rail]").getAttribute("data-open")).resolves.toBeNull();
      await expect(page.locator("[data-rail-fab]").getAttribute("aria-expanded")).resolves.toBe("false");
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
