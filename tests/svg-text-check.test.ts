import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkSvgTextSize } from "@lib/checks/svg-text";

describe("svg text size check", () => {
  it("reports SVG font sizes below the minimum", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-svg-text-"));
    await mkdir(path.join(root, "src"), { recursive: true });
    await writeFile(path.join(root, "src/bad.svg"), '<svg><text font-size="9">tiny</text></svg>');

    expect(checkSvgTextSize({ root })).toEqual([
      {
        file: "src/bad.svg",
        line: 1,
        value: 9
      }
    ]);
  });

  it("ignores generated SCSS partials", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-svg-text-"));
    await mkdir(path.join(root, "src/assets/scss/generated"), { recursive: true });
    await writeFile(path.join(root, "src/assets/scss/generated/_vendor.scss"), ".chart { font-size: 8px; }");

    expect(checkSvgTextSize({ root })).toEqual([]);
  });
});
