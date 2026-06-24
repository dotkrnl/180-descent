import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadArtifactBookDays } from "@lib/artifacts/book";

const root = process.cwd();
const fixtureDaysDir = path.join(root, "tests/fixtures/content/days");

describe("artifact book model", () => {
  it("loads fixture day bodies, appendices, components, and localized assets from the registry", async () => {
    const days = await loadArtifactBookDays(root, "zh", { daysDir: fixtureDaysDir });
    const fixture = days[0];

    expect(fixture.path).toBe("001-fixture");
    expect(fixture.title).toBe("夹具日");
    expect(fixture.bodyPath).toBe("zh.mdx");
    expect(fixture.bodySource).toContain("中文");
    expect(fixture.xhtml).toBe("day-001.xhtml");
    expect(fixture.appendices).toEqual([{
      id: "appendix-a",
      title: "附录 A",
      bodyPath: "appendices/appendix-a.zh.mdx",
      bodySource: expect.stringContaining("中文")
    }]);
    expect(fixture.assets).toEqual([{
      id: "fixture-diagram",
      path: "assets/fixture-diagram.zh.svg"
    }]);
    expect(fixture.components).toEqual([{
      id: "fixture-interaction",
      webEntry: "fixture-interaction",
      artifactVariants: {
        epub: "table",
        pdf: "static-figure"
      }
    }]);
  });

  it("loads published project days as artifact book days", async () => {
    const days = await loadArtifactBookDays(root, "en");
    const dayOne = days[0];

    expect(days.map((day) => day.path)).toEqual([
      "001-what-is-knowledge",
      "002-scientific-method-and-demarcation",
      "003-logic-and-valid-inference",
      "004-probability-as-extended-logic",
      "005-causation",
      "006-statistics-and-the-art-of-not-fooling-yourself",
      "007-information-theory"
    ]);
    expect(dayOne.title).toBe("What Is Knowledge?");
    expect(dayOne.bodyPath).toBe("en.mdx");
    expect(dayOne.bodySource).toContain("<StatusChip");
    expect(dayOne.xhtml).toBe("day-001.xhtml");
    expect(dayOne.appendices.map((appendix) => appendix.id)).toEqual([
      "rest-of-the-map",
      "the-edge-of-the-map"
    ]);
    expect(dayOne.components.map((component) => component.artifactVariants.pdf)).toContain("static-figure");
  });
});
