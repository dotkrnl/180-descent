import { mkdir, mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkVisual, parseVisualCheckArgs, visualRouteFileStem } from "@lib/checks/visual";

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

  it("reports duplicate value options instead of overwriting them", () => {
    expect(parseVisualCheckArgs([
      "--base", "https://staging.example",
      "--base=https://prod.example",
      "--compare", "https://compare.example",
      "--compare", "https://other.example",
      "--out", "tmp/visual",
      "--out", "tmp/other"
    ])).toEqual({
      baseUrl: "https://staging.example",
      compareUrl: "https://compare.example",
      outDir: "tmp/visual",
      errors: [
        "--base was provided more than once",
        "--compare was provided more than once",
        "--out was provided more than once"
      ]
    });
  });

  it("reports invalid base and compare URLs", () => {
    expect(parseVisualCheckArgs([
      "--base", "localhost:4321",
      "--compare", "/preview"
    ])).toEqual({
      errors: [
        "--base must be an absolute http(s) URL",
        "--compare must be an absolute http(s) URL"
      ]
    });
  });

  it("creates collision-resistant screenshot stems from routes", () => {
    expect(visualRouteFileStem("/")).toBe("home");
    expect(visualRouteFileStem("/a-b/")).toBe("a-b");
    expect(visualRouteFileStem("/a/b/")).toBe("a__b");
    expect(visualRouteFileStem("/zh/days/001-what-is-knowledge/")).toBe("zh__days__001-what-is-knowledge");
  });

  it("fails empty built sites instead of producing an empty visual report", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-visual-check-"));
    const outDir = path.join(root, "tmp/visual");
    await mkdir(path.join(root, "_site"), { recursive: true });

    const result = await checkVisual({
      root,
      baseUrl: "https://example.com",
      outDir
    });

    expect(result.errors).toEqual(["_site contains no HTML files"]);
    await expect(readFile(result.reportPath, "utf8").then(JSON.parse)).resolves.toMatchObject({
      routes: [],
      errors: ["_site contains no HTML files"],
      pages: []
    });
  });
});
