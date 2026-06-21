import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkCleanRepo } from "@lib/checks";

describe("final cleanup gate", () => {
  it("flags legacy Eleventy paths only in final mode", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-clean-check-"));
    await writeFile(path.join(root, "eleventy.config.cjs"), "module.exports = {};");
    await mkdir(path.join(root, "scripts"), { recursive: true });

    await expect(checkCleanRepo({ root, final: false })).resolves.toEqual([]);
    await expect(checkCleanRepo({ root, final: true })).resolves.toEqual([
      {
        path: "eleventy.config.cjs",
        reason: "Eleventy config must be removed after Astro cutover"
      }
    ]);
  });

  it("flags migration-only script names in any mode", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-clean-check-"));
    await mkdir(path.join(root, "scripts"), { recursive: true });
    await writeFile(path.join(root, "scripts/renderer-spike-demo.ts"), "");

    const failures = await checkCleanRepo({ root, final: false });
    expect(failures).toHaveLength(1);
    expect(failures[0].path).toBe("scripts/renderer-spike-demo.ts");
  });

  it("blocks retired blind importers in any mode", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-clean-check-"));
    await mkdir(path.join(root, "scripts"), { recursive: true });
    await writeFile(path.join(root, "scripts/import-day-from-html.mjs"), "");

    const failures = await checkCleanRepo({ root, final: false });
    expect(failures).toEqual([
      {
        path: "scripts/import-day-from-html.mjs",
        reason: "Blind day importer has been retired; use manual paired-MDX conversion"
      }
    ]);
  });
});
