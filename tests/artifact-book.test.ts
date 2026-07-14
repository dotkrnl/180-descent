import { describe, expect, it } from "vitest";
import { loadArtifactBookDays } from "@lib/artifacts/book";

const root = process.cwd();

describe("artifact book model", () => {
  it("loads project Chinese day bodies and appendices from the registry", async () => {
    const days = await loadArtifactBookDays(root, "zh");
    const fixture = days[0];

    expect(fixture.path).toBe("001-what-is-knowledge");
    expect(fixture.title).toBe("知识是什么？");
    expect(fixture.bodyPath).toBe("zh.mdx");
    expect(fixture.bodySource).toContain("<StatusChip");
    expect(fixture.xhtml).toBe("day-001.xhtml");
    expect(fixture.appendices.map((appendix) => appendix.id)).toEqual([
      "rest-of-the-map",
      "the-edge-of-the-map"
    ]);
    expect(fixture.appendices[0].bodyPath).toBe("appendices/rest-of-the-map.zh.mdx");
    expect(fixture.appendices[0].bodySource).toContain("<Sources");
  });

  it("loads project days as artifact book days", async () => {
    const days = await loadArtifactBookDays(root, "en");
    const dayOne = days[0];

    expect(days.map((day) => day.path)).toEqual([
      "001-what-is-knowledge",
      "002-scientific-method-and-demarcation",
      "003-logic-and-valid-inference",
      "004-probability-as-extended-logic",
      "005-causation",
      "006-statistics-and-the-art-of-not-fooling-yourself",
      "007-information-theory",
      "008-complexity-and-emergence",
      "009-systems-thinking-and-feedback",
      "010-models-maps-and-idealization",
      "011-heuristics-biases-and-rationality",
      "012-networks",
      "013-measurement-and-units"
    ]);
    expect(dayOne.title).toBe("What Is Knowledge?");
    expect(dayOne.bodyPath).toBe("en.mdx");
    expect(dayOne.bodySource).toContain("<StatusChip");
    expect(dayOne.xhtml).toBe("day-001.xhtml");
    expect(dayOne.appendices.map((appendix) => appendix.id)).toEqual([
      "rest-of-the-map",
      "the-edge-of-the-map"
    ]);
  });
});
