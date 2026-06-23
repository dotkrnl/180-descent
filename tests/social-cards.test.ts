import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { clampSocialText, loadSocialCards, renderSocialCardSvg, wrapSocialText } from "@lib/assets/social-cards";
import { writePublishedDay } from "./helpers/content-root";

describe("social cards", () => {
  it("loads root and paired day cards from source metadata", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-social-cards-"));
    await writePublishedDay(root, {
      enTitle: "English Fixture",
      enSummary: "English summary.",
      zhTitle: "Chinese Fixture",
      zhSummary: "Chinese summary."
    });

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

  it("escapes card svg and clamps long summaries", () => {
    const svg = renderSocialCardSvg({
      locale: "en",
      day: 7,
      title: "A <B>",
      summary: "one ".repeat(80),
      outPath: "unused.png"
    }, "brand");

    expect(svg).toContain("<svg");
    expect(svg).toContain("A &lt;B&gt;");
    expect(svg).toContain("Day 007");
    expect(svg).not.toContain("one ".repeat(80));
  });

  it("normalizes whitespace before clamping", () => {
    expect(clampSocialText("  alpha\n\nbeta\tgamma  ", 20)).toBe("alpha beta gamma");
    expect(clampSocialText("abcdef", 4)).toBe("abc...");
  });

  it("wraps latin and Chinese text without a browser layout engine", () => {
    expect(wrapSocialText("alpha beta gamma delta", { maxLines: 2, maxChars: 12 })).toEqual([
      "alpha beta",
      "gamma delta"
    ]);
    expect(wrapSocialText("中文标题需要换行", { maxLines: 2, maxChars: 4 })).toEqual([
      "中文标题",
      "需要换行"
    ]);
  });
});
