import path from "node:path";
import { describe, expect, it } from "vitest";
import { isPathInside } from "@lib/fs/path";

describe("filesystem path helpers", () => {
  it("treats paths under the filesystem root as inside that root", () => {
    const root = path.parse(process.cwd()).root;

    expect(isPathInside(root, path.join(root, "tmp"))).toBe(true);
  });

  it("rejects sibling paths that share a string prefix", () => {
    const root = path.join(path.parse(process.cwd()).root, "tmp", "site");

    expect(isPathInside(root, path.join(root, "index.html"))).toBe(true);
    expect(isPathInside(root, path.join(path.dirname(root), "site-copy", "index.html"))).toBe(false);
  });
});
