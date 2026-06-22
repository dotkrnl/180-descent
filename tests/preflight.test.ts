import { describe, expect, it } from "vitest";
import {
  checkTools,
  formatPreflightFailure,
  formatToolList,
  parsePreflightArgs,
  PreflightError,
  resolveToolNames
} from "@lib/tools";

describe("typed preflight", () => {
  it("resolves named groups without duplicates", () => {
    expect(resolveToolNames(["epubcheck", "node"])).toEqual(["java", "epubcheck", "node"]);
  });

  it("parses optional, list, and group arguments", () => {
    expect(parsePreflightArgs(["--optional", "--list", "--group=epubcheck", "node"])).toEqual({
      toolNames: ["epubcheck", "node"],
      optional: true,
      list: true
    });
  });

  it("formats the tool list", () => {
    const list = formatToolList();
    expect(list).toContain("Preflight groups:");
    expect(list).toContain("durable:");
    expect(list).toContain("epubcheck [durable-required]");
  });

  it("reports unknown tools without executing external commands", () => {
    const result = checkTools(["missing-tool-fixture"], { throwOnMissing: false });

    expect(result.present).toEqual([]);
    expect(result.missing[0].name).toBe("missing-tool-fixture");
    expect(formatPreflightFailure(result.missing)).toContain("Unknown tool: missing-tool-fixture");
  });

  it("throws typed errors when required tools are missing", () => {
    expect(() => checkTools(["missing-tool-fixture"])).toThrow(PreflightError);
  });
});
