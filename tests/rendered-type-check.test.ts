import { mkdir, mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkRenderedType } from "@lib/checks/rendered-type";

describe("rendered typography check", () => {
  it("reports an empty built site", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-rendered-type-check-"));
    await mkdir(path.join(root, "_site"), { recursive: true });

    const result = await checkRenderedType({ root });

    expect(result).toEqual({
      checkedPages: 0,
      errors: ["_site contains no HTML files"]
    });
  });
});
