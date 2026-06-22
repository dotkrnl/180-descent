import { describe, expect, it } from "vitest";
import { summarizePdfSmokeFailure, trimOutput } from "@lib/refactor";

describe("pdf renderer smoke helpers", () => {
  it("trims long command output", () => {
    expect(trimOutput(" x ".repeat(700)).endsWith("...")).toBe(true);
  });

  it("summarizes failure evidence for markdown tables", () => {
    expect(summarizePdfSmokeFailure({ error: null, stderr: "bad|pipe\nnext", stdout: "" })).toBe("bad/pipe");
    expect(summarizePdfSmokeFailure({ error: "direct", stderr: "", stdout: "" })).toBe("direct");
  });
});
