import { chromium } from "playwright";
import { describe, expect, it, vi } from "vitest";
import {
  checkTools,
  formatPreflightFailure,
  formatToolList,
  parsePreflightArgs,
  PreflightError,
  resolveToolNames
} from "@lib/tools/preflight";
import { epubcheckVersionCommands } from "@lib/tools/epubcheck";

describe("typed preflight", () => {
  it("resolves named groups without duplicates", () => {
    expect(resolveToolNames(["epubcheck", "node"])).toEqual(["java", "epubcheck", "node"]);
  });

  it("parses optional, list, and group arguments", () => {
    expect(parsePreflightArgs(["--optional", "--list", "--group=epubcheck", "node"])).toEqual({
      toolNames: ["epubcheck", "node"],
      optional: true,
      list: true,
      errors: []
    });
  });

  it("reports invalid option-shaped arguments", () => {
    expect(parsePreflightArgs(["--group=", "--unknown", "node"])).toEqual({
      toolNames: ["node"],
      optional: false,
      list: false,
      errors: [
        "--group requires a value",
        "Unknown option: --unknown"
      ]
    });
  });

  it("formats the tool list", () => {
    const list = formatToolList();
    expect(list).toContain("Preflight groups:");
    expect(list).toContain("build:");
    expect(list).toContain("epubcheck - official EPUB validation");
  });

  it("reports unknown tools without executing external commands", () => {
    const result = checkTools(["missing-tool-fixture"], { throwOnMissing: false });

    expect(result.present).toEqual([]);
    expect(result.missing[0].name).toBe("missing-tool-fixture");
    expect(formatPreflightFailure(result.missing)).toContain("Unknown tool: missing-tool-fixture");
  });

  it("formats install hints with project command prefixes", () => {
    const message = formatPreflightFailure([{
      name: "node",
      label: "Node.js",
      usedBy: "all build/check scripts",
      installHint: "Install the project Node version, then run npm install.",
      error: new Error("missing")
    }]);

    expect(message).toContain("install:   Install the project Node version, then run npm install.");
  });

  it("lists standard Playwright installation guidance", () => {
    const executablePath = vi.spyOn(chromium, "executablePath").mockReturnValue("/missing/chromium");
    try {
      const result = checkTools(["playwright"], { throwOnMissing: false });
      const message = formatPreflightFailure(result.missing);

      expect(message).toContain("npx playwright install chromium");
    } finally {
      executablePath.mockRestore();
    }
  });

  it("throws typed errors when required tools are missing", () => {
    expect(() => checkTools(["missing-tool-fixture"])).toThrow(PreflightError);
  });

  it("treats EPUBCHECK_JAR as an explicit command override", () => {
    const previousJar = process.env.EPUBCHECK_JAR;
    process.env.EPUBCHECK_JAR = "/missing/epubcheck.jar";
    try {
      expect(epubcheckVersionCommands()[0]).toEqual([
        "java",
        ["-jar", "/missing/epubcheck.jar", "--version"]
      ]);
    } finally {
      if (previousJar === undefined) {
        delete process.env.EPUBCHECK_JAR;
      } else {
        process.env.EPUBCHECK_JAR = previousJar;
      }
    }
  });
});
