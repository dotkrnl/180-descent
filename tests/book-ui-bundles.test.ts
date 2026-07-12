import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { bookScriptTags, readBookScripts } from "./helpers/book-scripts";

const origin = "http://book-ui.test";
let bookScripts: Record<string, string> = {};
let browser: Browser;

beforeAll(async () => {
  bookScripts = await readBookScripts();
  browser = await chromium.launch({ headless: true });
}, 30_000);

afterAll(async () => {
  await browser.close();
});

async function openPage(): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext({ colorScheme: "light" });
  const page = await context.newPage();
  await page.route(`${origin}/**`, async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const script = bookScripts[pathname];
    await route.fulfill({
      status: 200,
      contentType: script === undefined ? "text/html" : "application/javascript",
      body: script ?? pageHtml()
    });
  });
  await page.goto(origin);
  return { context, page };
}

function pageHtml(): string {
  return `<!doctype html>
    <html lang="en" data-theme="auto">
      <head>
        <meta charset="utf-8">
        <meta id="colorScheme" name="color-scheme" content="light dark">
        <meta id="themeColorLight" name="theme-color" content="#fff" data-theme-color="#fff">
        <meta id="themeColorDark" name="theme-color" content="#000" data-theme-color="#000">
        <link id="themeFavicon" href="light.png" data-light-href="light.png" data-dark-href="dark.png">
        ${bookScriptTags()}
      </head>
      <body>
        <button id="themeBtn" data-label-dark="Use dark" data-label-light="Use light">Theme</button>
        <img id="themedImage" src="light.png" data-light-src="light.png" data-dark-src="dark.png">
        <div id="liveRegion" class="vexpl"></div>
        <span id="keyboardButton" role="button" tabindex="0">Activate</span>
        <span class="tip-note" data-tip-text="A useful note">
          <button class="tip-note-mark" aria-expanded="false">Note</button>
          <span class="tip-note-box">A useful note</span>
        </span>
        <div data-syllabus-map>
          <button data-map-block="one" aria-pressed="false">
            <span class="map-block-title">Block one</span>
            <span class="map-block-summary">First summary</span>
          </button>
          <p data-map-status>Choose a block</p>
        </div>
        <section id="block-one">Block one content</section>
        <script>document.getElementById("keyboardButton").addEventListener("click", function(){ this.dataset.activated = "true"; });</script>
      </body>
    </html>`;
}

describe("book UI bundles", () => {
  it("keeps theme, accessibility, tip-note, and syllabus interactions working", async () => {
    const { context, page } = await openPage();
    try {
      await page.locator("#themeBtn").click();
      await expect(page.locator("html").getAttribute("data-theme")).resolves.toBe("dark");
      await expect(page.locator("#themeBtn").getAttribute("aria-pressed")).resolves.toBe("true");
      await expect(page.locator("#themedImage").getAttribute("src")).resolves.toBe("dark.png");
      await expect(page.evaluate(() => localStorage.getItem("180-descent-theme"))).resolves.toBe("dark");

      await expect(page.locator("#liveRegion").getAttribute("aria-live")).resolves.toBe("polite");
      await page.locator("#keyboardButton").press("Enter");
      await expect(page.locator("#keyboardButton").getAttribute("data-activated")).resolves.toBe("true");

      await page.locator(".tip-note-mark").click();
      await expect(page.locator(".tip-note").getAttribute("data-open")).resolves.toBe("true");
      await expect(page.locator("#tipNoteLive").textContent()).resolves.toBe("A useful note");

      await page.locator("[data-map-block]").click();
      await expect(page.locator("[data-syllabus-map]").getAttribute("data-focused")).resolves.toBe("one");
      await expect(page.locator("[data-map-status]").textContent()).resolves.toBe("Block one — First summary");
      await page.locator("[data-syllabus-map]").press("Escape");
      await expect(page.locator("[data-syllabus-map]").getAttribute("data-focused")).resolves.toBeNull();
    } finally {
      await context.close();
    }
  });
});
