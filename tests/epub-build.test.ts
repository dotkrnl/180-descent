import { describe, expect, it } from "vitest";
import { epubUuidFromString, titlePageDocument } from "@lib/artifacts/epub/build";

describe("epub builder helpers", () => {
  it("derives stable version-5 UUIDs from identifiers", () => {
    const uuid = epubUuidFromString("fixture");
    expect(uuid).toBe(epubUuidFromString("fixture"));
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("renders title page credits for translated editions", () => {
    const html = titlePageDocument({
      meta: {
        title: "中文标题",
        subtitle: "副标题",
        authors: "作者",
        translators: "译者",
        language: "zh-Hans",
        publisher: "Publisher",
        epub_identifier: "fixture"
      }
    });

    expect(html).toContain("中文标题");
    expect(html).toContain("翻译：译者");
    expect(html).toContain("人工编辑：刘家昌");
  });
});
