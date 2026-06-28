import { describe, expect, it } from "vitest";
import { parseVisualCheckArgs } from "@lib/checks/visual";

describe("visual check CLI args", () => {
  it("parses known value options", () => {
    expect(parseVisualCheckArgs([
      "--base", "https://staging.example",
      "--compare", "https://prod.example",
      "--out", "tmp/visual",
      "--ignored", "value"
    ])).toEqual({
      baseUrl: "https://staging.example",
      compareUrl: "https://prod.example",
      outDir: "tmp/visual"
    });
  });

  it("parses known inline value options", () => {
    expect(parseVisualCheckArgs([
      "--base=https://staging.example",
      "--compare=https://prod.example",
      "--out=tmp/visual"
    ])).toEqual({
      baseUrl: "https://staging.example",
      compareUrl: "https://prod.example",
      outDir: "tmp/visual"
    });
  });

  it("does not invent values for missing option arguments", () => {
    expect(parseVisualCheckArgs(["--base", "--compare", "https://prod.example"])).toEqual({
      compareUrl: "https://prod.example"
    });
  });
});
