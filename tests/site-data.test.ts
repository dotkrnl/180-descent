import { describe, expect, it } from "vitest";
import { upcomingSyllabusDays, type ContentDay } from "@app/site-data";
import type { Syllabus } from "@lib/data/syllabus";

describe("site data helpers", () => {
  it("honors non-positive upcoming syllabus limits", () => {
    expect(upcomingSyllabusDays(syllabusFixture(), [], 0)).toEqual([]);
    expect(upcomingSyllabusDays(syllabusFixture(), [], -1)).toEqual([]);
  });

  it("returns unpublished syllabus rows with block metadata", () => {
    const publishedDays: ContentDay[] = [{
      day: 1,
      path: "001-fixture",
      title: "Published",
      summary: "Published summary.",
      block: "Foundations",
      url: "/days/001-fixture/"
    }];

    expect(upcomingSyllabusDays(syllabusFixture(), publishedDays, 1)).toEqual([
      {
        day: 2,
        title: "Second",
        block: "Foundations",
        blockId: "I"
      }
    ]);
  });
});

function syllabusFixture(): Syllabus {
  return {
    title: "Syllabus",
    subtitle: "Fixture",
    purpose: "Test",
    method: "Test",
    blocks: [
      {
        id: "I",
        startDay: 1,
        endDay: 2,
        title: "Foundations",
        summary: "First block",
        days: [
          { day: 1, title: "First" },
          { day: 2, title: "Second" }
        ]
      }
    ]
  };
}
