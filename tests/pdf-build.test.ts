import { describe, expect, it } from "vitest";
import { sectionTitleForPage } from "@lib/artifacts";

describe("pdf builder helpers", () => {
  it("uses the latest completed block title for running heads", () => {
    const blocks = [
      { page: 3, title: "Lesson 1" },
      { page: 8, title: "Lesson 2" }
    ];

    expect(sectionTitleForPage(2, blocks, "Introduction")).toBe("Introduction");
    expect(sectionTitleForPage(4, blocks, "Introduction")).toBe("Lesson 1");
    expect(sectionTitleForPage(8, blocks, "Introduction")).toBe("Lesson 1");
    expect(sectionTitleForPage(9, blocks, "Introduction")).toBe("Lesson 2");
  });
});
