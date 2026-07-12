import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";

const origin = "http://day9-interaction.test";
const scriptPath = "/systems-thinking-feedback.js";

let browser: Browser;
let interactionScript = "";

beforeAll(async () => {
  interactionScript = await readFile(
    path.join(
      process.cwd(),
      "src/assets/js/interactions/systems-thinking-feedback.js"
    ),
    "utf8"
  );
  browser = await chromium.launch({ headless: true });
}, 30_000);

afterAll(async () => {
  await browser.close();
});

function feedbackPage(): string {
  return `<!doctype html>
    <html lang="en">
      <head><meta charset="utf-8"></head>
      <body>
        <section data-day9-kind="feedback" data-locale="en">
          <input data-role="gain" type="range" min="0" max="100" value="20">
          <input data-role="delay" type="range" min="0" max="40" value="4">
          <output data-out="gain"></output>
          <output data-out="delay"></output>
          <button type="button" data-sign="neg" aria-pressed="true">Negative</button>
          <button type="button" data-sign="pos" aria-pressed="false">Positive</button>
          <svg data-role="plot" viewBox="0 0 600 270"></svg>
          <strong data-out="state"></strong>
          <span data-out="expl"></span>
        </section>
        <script>delete window.IntersectionObserver;</script>
        <script src="${scriptPath}"></script>
      </body>
    </html>`;
}

async function openFeedback(): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.route(`${origin}/**`, async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    await route.fulfill({
      status: 200,
      contentType: pathname === scriptPath ? "application/javascript" : "text/html",
      body: pathname === scriptPath ? interactionScript : feedbackPage()
    });
  });
  await page.goto(origin);
  await page.locator('[data-day9-kind="feedback"][data-day9-ready="1"]').waitFor();
  return { context, page };
}

describe("Day 9 interaction runtime", () => {
  it("initializes feedback controls and responds to a sign change", async () => {
    const { context, page } = await openFeedback();
    const state = page.locator('[data-out="state"]');

    try {
      await expect(state.textContent()).resolves.toBe("Calm control — it settles");
      await expect(page.locator('[data-role="plot"] path').count()).resolves.toBeGreaterThan(0);

      await page.locator('[data-sign="pos"]').click();
      await expect(state.textContent()).resolves.toBe("Runaway — the gap explodes");
      await expect(page.locator('[data-sign="pos"]').getAttribute("aria-pressed")).resolves.toBe("true");
      await expect(page.locator('[data-sign="neg"]').getAttribute("aria-pressed")).resolves.toBe("false");
    } finally {
      await context.close();
    }
  });
});
