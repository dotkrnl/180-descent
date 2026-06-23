import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkCleanRepo } from "@lib/checks";

describe("final cleanup gate", () => {
  it("flags unsupported static-site paths", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-clean-check-"));
    await writeFile(path.join(root, "eleventy.config.cjs"), "module.exports = {};");
    await mkdir(path.join(root, "scripts"), { recursive: true });

    await expect(checkCleanRepo({ root })).resolves.toEqual([
      {
        path: "eleventy.config.cjs",
        reason: "Static-site config outside Astro must not exist"
      }
    ]);
  });

  it("flags unsupported experiment script names in any mode", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-clean-check-"));
    await mkdir(path.join(root, "scripts"), { recursive: true });
    await writeFile(path.join(root, "scripts/renderer-spike-demo.ts"), "");

    const failures = await checkCleanRepo({ root });
    expect(failures).toHaveLength(1);
    expect(failures[0].path).toBe("scripts/renderer-spike-demo.ts");
  });

  it("blocks blind importers in any mode", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-clean-check-"));
    await mkdir(path.join(root, "scripts"), { recursive: true });
    await writeFile(path.join(root, "scripts/import-day-from-html.mjs"), "");

    const failures = await checkCleanRepo({ root });
    expect(failures).toEqual([
      {
        path: "scripts/import-day-from-html.mjs",
        reason: "Blind day importers are not allowed; convert paired MDX manually"
      }
    ]);
  });
});
