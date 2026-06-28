import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkSvgTextSize } from "@lib/checks/svg-text";
import { contentDayFile, contentDaysDir } from "@lib/content/paths";

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

  it("reports inline SVG font sizes in Astro and MDX files", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-svg-text-"));
    await mkdir(path.join(root, "src/app/components"), { recursive: true });
    await mkdir(path.join(contentDaysDir(root), "001-fixture"), { recursive: true });
    await writeFile(path.join(root, "src/app/components/Figure.astro"), '<svg><text font-size="9">tiny</text></svg>');
    await writeFile(contentDayFile(root, "001-fixture", "en.mdx"), '<svg><text style="font-size: 9px">tiny</text></svg>');

    expect(checkSvgTextSize({ root })).toEqual([
      {
        file: "src/app/components/Figure.astro",
        line: 1,
        value: 9
      },
      {
        file: "src/content/days/001-fixture/en.mdx",
        line: 1,
        value: 9
      }
    ]);
  });

  it("reports JavaScript SVG setAttribute font sizes below the minimum", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-svg-text-"));
    await mkdir(path.join(root, "src/assets/js/interactions"), { recursive: true });
    await writeFile(path.join(root, "src/assets/js/interactions/fixture.js"), [
      'label.setAttribute("font-size", "9");',
      'otherLabel.setAttribute("font-size", "10.5");'
    ].join("\n"));

    expect(checkSvgTextSize({ root })).toEqual([
      {
        file: "src/assets/js/interactions/fixture.js",
        line: 1,
        value: 9
      }
    ]);
  });

  it("ignores fenced SVG examples without shifting later line numbers", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-svg-text-"));
    await mkdir(path.join(contentDaysDir(root), "001-fixture"), { recursive: true });
    await writeFile(contentDayFile(root, "001-fixture", "en.mdx"), [
      "```html",
      '<svg><text font-size="9">example</text></svg>',
      "```",
      "",
      '<svg><text font-size="9">tiny</text></svg>'
    ].join("\n"));

    expect(checkSvgTextSize({ root })).toEqual([
      {
        file: "src/content/days/001-fixture/en.mdx",
        line: 5,
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
