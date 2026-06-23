import { describe, expect, it } from "vitest";
import { decodeXmlEntities, isInsideSvg } from "@lib/checks/epub";

describe("epub check helpers", () => {
  it("decodes XML entities before appendix content matching", () => {
    expect(decodeXmlEntities("A&amp;B &apos;x&apos; &#x4e2d; &#65;")).toBe("A&B 'x' 中 A");
  });

  it("detects SVG child tags outside an svg wrapper", () => {
    const text = "<svg><g><path /></g></svg><path />";
    expect(isInsideSvg(text, text.indexOf("<g>"))).toBe(true);
    expect(isInsideSvg(text, text.lastIndexOf("<path"))).toBe(false);
  });
});
