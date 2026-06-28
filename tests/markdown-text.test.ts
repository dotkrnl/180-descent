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

  it("supports indented fences with longer closing fences", () => {
    expect(stripFencedCodeBlocks([
      "before",
      "   ````ts",
      "const value = 1;",
      "   `````",
      "after"
    ].join("\n"))).toBe("before\n\nafter");
  });

  it("strips unclosed fenced code blocks to the end of the source", () => {
    expect(stripFencedCodeBlocks([
      "before",
      "```ts",
      "const value = 1;"
    ].join("\n"))).toBe("before\n");
    expect(stripFencedCodeBlocksPreservingLines([
      "before",
      "```ts",
      "const value = 1;"
    ].join("\n"))).toBe("before\n\n");
  });

  it("leaves inline triple backticks intact", () => {
    expect(stripFencedCodeBlocks("before ```not a block``` after")).toBe("before ```not a block``` after");
  });
});
