import { describe, expect, it } from "vitest";
import { artifactEditionKind, renderArtifactInventoryMarkdown } from "@lib/refactor";

describe("artifact inventory helpers", () => {
  it("classifies book and per-day artifacts", () => {
    expect(artifactEditionKind("180-descent-zh-day-007-information-theory.pdf")).toEqual({
      scope: "per-day",
      locale: "zh",
      day: 7,
      deepDive: true
    });
    expect(artifactEditionKind("180-descent-deep-dive.epub")).toMatchObject({
      scope: "book",
      locale: "en",
      day: null,
      deepDive: true
    });
  });

  it("renders artifact inventory markdown", () => {
    const markdown = renderArtifactInventoryMarkdown({
      generatedAt: "now",
      downloadsDir: "_site/downloads",
      totalBytes: 0,
      artifacts: []
    });

    expect(markdown).toContain("# Artifact Inventory Baseline");
    expect(markdown).toContain("- EPUB files: 0");
    expect(markdown).toContain("- PDF files: 0");
  });
});
