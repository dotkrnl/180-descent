import { describe, expect, it } from "vitest";
import { markdownTable, scriptNameList, tableCell } from "@lib/refactor";

describe("refactor inventory helpers", () => {
  it("formats markdown table cells consistently", () => {
    expect(tableCell(null)).toBe("-");
    expect(tableCell(["a", "b"])).toBe("a<br>b");
    expect(tableCell("a|b\nc")).toBe("a\\|b<br>c");
  });

  it("selects sorted package script names by prefix", () => {
    expect(scriptNameList({
      "check:seo": "x",
      build: "x",
      "check:a11y": "x"
    }, "check")).toEqual(["check:a11y", "check:seo"]);
  });

  it("renders basic markdown tables", () => {
    expect(markdownTable(["A"], [["B"]])).toBe("| A |\n| --- |\n| B |");
  });
});
