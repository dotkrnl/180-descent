import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { pathExists, walkFiles } from "@lib/fs/walk";

describe("filesystem walk helpers", () => {
  it("treats impossible child paths as absent", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-fs-walk-"));
    const filePath = path.join(root, "file.txt");
    await writeFile(filePath, "");

    await expect(pathExists(filePath)).resolves.toBe(true);
    await expect(pathExists(path.join(root, "missing.txt"))).resolves.toBe(false);
    await expect(pathExists(path.join(filePath, "child.txt"))).resolves.toBe(false);
  });

  it("ignores directories by entry name", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-fs-walk-"));
    await mkdir(path.join(root, "src", "generated"), { recursive: true });
    await mkdir(path.join(root, "generated"), { recursive: true });
    await writeFile(path.join(root, "src", "keep.txt"), "");
    await writeFile(path.join(root, "src", "generated", "skip.txt"), "");
    await writeFile(path.join(root, "generated", "skip.txt"), "");

    await expect(walkFiles(root, { exts: ".txt", ignoredDirNames: ["generated"] })).resolves.toEqual([
      path.join(root, "src", "keep.txt")
    ]);
  });
});
