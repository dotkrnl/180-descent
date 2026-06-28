import { describe, expect, it } from "vitest";
import { parseVisualCheckArgs } from "@lib/checks/visual";

describe("visual check CLI args", () => {
  it("parses known value options", () => {
    expect(parseVisualCheckArgs([
      "--base", "https://staging.example",
      "--compare", "https://prod.example",
      "--out", "tmp/visual"
    ])).toEqual({
      baseUrl: "https://staging.example",
      compareUrl: "https://prod.example",
      outDir: "tmp/visual",
      errors: []
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
      outDir: "tmp/visual",
      errors: []
    });
  });

  it("reports missing option arguments", () => {
    expect(parseVisualCheckArgs(["--base", "--compare", "https://prod.example"])).toEqual({
      compareUrl: "https://prod.example",
      errors: ["--base requires a value"]
    });
  });

  it("reports unknown options and positional arguments", () => {
    expect(parseVisualCheckArgs(["--ignored", "value", "extra"])).toEqual({
      errors: [
        "Unknown option: --ignored",
        "Unexpected argument: extra"
      ]
    });
  });
});
