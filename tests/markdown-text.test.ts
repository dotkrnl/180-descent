import { describe, expect, it } from "vitest";
import { stripFencedCodeBlocks, stripFencedCodeBlocksPreservingLines } from "@lib/text/markdown";

describe("markdown text helpers", () => {
  it("strips backtick and tilde fenced code blocks", () => {
    expect(stripFencedCodeBlocks([
      "before",
      "```ts",
      "const value = 1;",
      "```",
      "middle",
      "~~~html",
      "<div></div>",
      "~~~",
      "after"
    ].join("\n"))).toBe("before\n\nmiddle\n\nafter");
  });

  it("preserves line numbers when stripping fenced code blocks", () => {
    expect(stripFencedCodeBlocksPreservingLines([
      "before",
      "```ts",
      "const value = 1;",
      "```",
      "after"
    ].join("\n"))).toBe("before\n\n\n\nafter");
  });
});
