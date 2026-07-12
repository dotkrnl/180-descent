import { describe, expect, it } from "vitest";
import { latexLogIssues } from "@lib/artifacts/pdf/xetex";

describe("XeTeX log warnings", () => {
  it("treats layout, glyph, and package warnings as build failures", () => {
    const log = [
      "Underfull \\vbox (badness 10000) has occurred while \\output is active",
      "Missing character: There is no Ω in font Newsreader!",
      "LaTeX Font Warning: Font shape `TU/Newsreader(0)/m/sc' undefined",
      "Package hyperref Warning: Difference (2) between bookmark levels is greater"
    ].join("\n");

    expect(latexLogIssues(log)).toHaveLength(4);
  });

  it("ignores informational log entries", () => {
    expect(latexLogIssues("Package fontspec Info: Font family created")).toEqual([]);
  });
});
