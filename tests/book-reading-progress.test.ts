import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";

const storageKey = "180-descent-reading-progress";
const origin = "http://reading-progress.test";

type ReadingRecord = {
  day: number;
  url: string;
  label: string;
  title: string;
  summary: string;
  progress: number;
  expandedAppendices: string[];
  updatedAt: string;
};

type Lesson = Pick<ReadingRecord, "day" | "url" | "label" | "title" | "summary">;

let bookScript = "";
let browser: Browser;

beforeAll(async () => {
  bookScript = await readFile(path.join(process.cwd(), "src/assets/js/book.js"), "utf8");
  browser = await chromium.launch({ headless: true });
}, 30_000);

afterAll(async () => {
  await browser.close();
});

function lessonPage(lesson: Lesson): string {
  return `<!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <style>body { margin: 0; } .spacer { height: 5000px; }</style>
        <script src="/book.js" defer></script>
      </head>
      <body>
        <main
          data-reading-progress
          data-reading-locale="en"
          data-reading-day="${lesson.day}"
          data-reading-url="${lesson.url}"
          data-reading-label="${lesson.label}"
          data-reading-title="${lesson.title}"
          data-reading-summary="${lesson.summary}"
        >
          <details class="deep-dive" id="appendix-a"><summary>Appendix A</summary></details>
          <details class="deep-dive" id="appendix-b"><summary>Appendix B</summary></details>
          <div class="spacer"></div>
        </main>
      </body>
    </html>`;
}

async function openLesson(
  lesson: Lesson,
  saved: ReadingRecord
): Promise<{ context: BrowserContext; page: Page }> {
  const context = await browser.newContext();
  await context.addInitScript(
    ({ key, value }) => window.localStorage.setItem(key, JSON.stringify({ en: value })),
    { key: storageKey, value: saved }
  );
  const page = await context.newPage();
  await page.route(`${origin}/**`, async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    await route.fulfill({
      status: 200,
      contentType: pathname === "/book.js" ? "application/javascript" : "text/html",
      body: pathname === "/book.js" ? bookScript : lessonPage(lesson)
    });
  });
  await page.goto(`${origin}${lesson.url}`);
  return { context, page };
}

async function savedRecord(page: Page): Promise<ReadingRecord> {
  return page.evaluate((key) => JSON.parse(window.localStorage.getItem(key) || "{}").en, storageKey);
}

describe("saved reading progress", () => {
  it("does not replace a valid later-day resume record from an earlier lesson", async () => {
    const later: ReadingRecord = {
      day: 9,
      url: "/days/009-systems-thinking-and-feedback/",
      label: "Day 009",
      title: "Systems Thinking and Feedback",
      summary: "Saved later lesson",
      progress: 0.46,
      expandedAppendices: ["appendix-a"],
      updatedAt: "2026-07-01T00:00:00.000Z"
    };
    const earlier: Lesson = {
      day: 3,
      url: "/days/003-logic-and-valid-inference/",
      label: "Day 003",
      title: "Logic and Valid Inference",
      summary: "Earlier lesson"
    };
    const { context, page } = await openLesson(earlier, later);

    try {
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(500);
      expect(await savedRecord(page)).toEqual(later);
    } finally {
      await context.close();
    }
  });

  it("keeps same-day progress monotonic while refreshing metadata and appendices", async () => {
    const saved: ReadingRecord = {
      day: 7,
      url: "/days/007-information-theory/",
      label: "Old day label",
      title: "Old title",
      summary: "Old summary",
      progress: 0.78,
      expandedAppendices: ["appendix-a"],
      updatedAt: "2026-07-01T00:00:00.000Z"
    };
    const lesson: Lesson = {
      day: 7,
      url: "/days/007-information-theory/",
      label: "Day 007",
      title: "Information Theory",
      summary: "Current lesson metadata"
    };
    const { context, page } = await openLesson(lesson, saved);

    try {
      await page.evaluate(() => {
        const first = document.querySelector<HTMLDetailsElement>("#appendix-a");
        const second = document.querySelector<HTMLDetailsElement>("#appendix-b");
        if (first) first.open = false;
        if (second) second.open = true;
        window.scrollTo(0, document.documentElement.scrollHeight * 0.2);
      });
      await page.waitForTimeout(500);

      const record = await savedRecord(page);
      expect(record.progress).toBe(0.78);
      expect(record).toMatchObject({
        day: lesson.day,
        url: lesson.url,
        label: lesson.label,
        title: lesson.title,
        summary: lesson.summary,
        expandedAppendices: ["appendix-b"]
      });
      expect(record.updatedAt).not.toBe(saved.updatedAt);
    } finally {
      await context.close();
    }
  });
});
