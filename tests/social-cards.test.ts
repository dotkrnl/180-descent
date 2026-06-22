import { mkdir, writeFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { clampSocialText, loadSocialCards, renderSocialCardHtml } from "@lib/assets";

describe("social cards", () => {
  it("loads root and paired day cards from source metadata", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-social-cards-"));
    await mkdir(path.join(root, "src/days"), { recursive: true });
    await mkdir(path.join(root, "src/zh/days"), { recursive: true });
    await writeFile(path.join(root, "src/days/day-001-fixture.md"), [
      "---",
      "day: 1",
      "day_path: 001-fixture",
      "title: English Fixture",
      "summary: English summary.",
      "---"
    ].join("\n"));
    await writeFile(path.join(root, "src/zh/days/day-001-fixture.md"), [
      "---",
      "day: 1",
      "day_path: 001-fixture",
      "title: Chinese Fixture",
      "summary: Chinese summary.",
      "---"
    ].join("\n"));

    const cards = await loadSocialCards({
      root,
      book: {
        title: "The Book",
        description: "Book summary.",
        zh: {
          title: "中文书名",
          description: "中文简介。"
        }
      },
      outDir: path.join(root, "src/assets/images/social")
    });

    expect(cards.map((card) => path.basename(card.outPath))).toEqual([
      "180-descent.png",
      "180-descent-zh.png",
      "day-001-fixture.png",
      "zh-day-001-fixture.png"
    ]);
    expect(cards[2]).toMatchObject({ locale: "en", kicker: "The Book", title: "English Fixture" });
    expect(cards[3]).toMatchObject({ locale: "zh", kicker: "中文书名", title: "Chinese Fixture" });
  });

  it("escapes card html and clamps long summaries", () => {
    const html = renderSocialCardHtml({
      locale: "en",
      day: 7,
      title: "A <B>",
      summary: "one ".repeat(80),
      outPath: "unused.png"
    }, "brand");

    expect(html).toContain("A &lt;B&gt;");
    expect(html).toContain("Day 007");
    expect(html).not.toContain("one ".repeat(80));
  });

  it("normalizes whitespace before clamping", () => {
    expect(clampSocialText("  alpha\n\nbeta\tgamma  ", 20)).toBe("alpha beta gamma");
    expect(clampSocialText("abcdef", 4)).toBe("abc...");
  });
});
