import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
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

  it("reports svg images whose accessible names resolve empty", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-a11y-check-"));
    await mkdir(path.join(root, "_site"), { recursive: true });
    await writeFile(path.join(root, "_site/index.html"), [
      "<!doctype html>",
      '<html lang="en">',
      "<head><title>Fixture</title></head>",
      "<body>",
      "<h1>Fixture</h1>",
      '<svg role="img" aria-label=""></svg>',
      '<svg role="img" aria-labelledby="missing-title"></svg>',
      "</body>",
      "</html>"
    ].join("\n"));

    const result = await checkAccessibility({ root });

    expect(result.failures).toContain('/: svg[role="img"] 1 is missing an accessible name');
    expect(result.failures).toContain('/: svg[role="img"] 2 is missing an accessible name');
  });
});
