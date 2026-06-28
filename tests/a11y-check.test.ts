import { mkdir, mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkAccessibility } from "@lib/checks/a11y";

describe("accessibility check", () => {
  it("fails empty built sites instead of passing zero pages", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-a11y-check-"));
    await mkdir(path.join(root, "_site"), { recursive: true });

    await expect(checkAccessibility({ root })).resolves.toEqual({
      checkedPages: 0,
      failures: ["_site contains no HTML files"]
    });
  });
});
