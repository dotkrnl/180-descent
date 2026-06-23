import { describe, expect, it } from "vitest";
import { checkEpub, decodeXmlEntities, isInsideSvg } from "@lib/checks/epub";
import { createEmptyContentRoot, writePublishedDay } from "./helpers/content-root";

describe("epub check helpers", () => {
  it("decodes XML entities before appendix content matching", () => {
    expect(decodeXmlEntities("A&amp;B &apos;x&apos; &#x4e2d; &#65;")).toBe("A&B 'x' 中 A");
  });

  it("detects SVG child tags outside an svg wrapper", () => {
    const text = "<svg><g><path /></g></svg><path />";
    expect(isInsideSvg(text, text.indexOf("<g>"))).toBe(true);
    expect(isInsideSvg(text, text.lastIndexOf("<path"))).toBe(false);
  });

  it("reports missing required artifacts without throwing", async () => {
    const root = await createEmptyContentRoot("180-epub-missing-");

    const result = await checkEpub({ root });

    expect(result.errors).toContain("_site/downloads/180-descent.epub is missing");
  });

  it("reports missing per-day artifacts", async () => {
    const root = await createEmptyContentRoot("180-epub-day-missing-");
    await writePublishedDay(root);

    const result = await checkEpub({ root });

    expect(result.errors).toContain("_site/downloads/180-descent-day-001-fixture.epub is missing");
    expect(result.errors).toContain("_site/downloads/180-descent-zh-day-001-fixture.epub is missing");
  });
});
