import { access, mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { prepareCjkFonts, prepareKatexAssets, prepareLatinFonts } from "@lib/assets/fonts";

describe("font asset preparation", () => {
  it("copies configured latin font files into the site asset directory", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-latin-fonts-"));

    await prepareLatinFonts({ root });

    await expectFile(path.join(root, "src/assets/fonts/fraunces-latin-700-italic.woff2"));
    await expectFile(path.join(root, "src/assets/fonts/newsreader-latin-400-normal.woff2"));
    await expectFile(path.join(root, "src/assets/fonts/ibm-plex-mono-latin-600-normal.woff2"));
  });

  it("copies CJK font subsets and rewrites vendor CSS into a generated SCSS partial", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-cjk-fonts-"));

    await prepareCjkFonts({ root });

    const css = await readFile(path.join(root, "src/assets/scss/generated/_cjk.scss"), "utf8");
    await expectFile(path.join(root, "src/assets/fonts/cjk/lxgwwenkai-regular-subset-21.woff2"));
    await expectFile(path.join(root, "src/assets/fonts/cjk/lxgwwenkai-bold-subset-21.woff2"));
    expect(css).toContain("../../fonts/cjk/lxgwwenkai-regular-subset-21.woff2");
    expect(css).toContain("../../fonts/cjk/lxgwwenkai-bold-subset-21.woff2");
  });

  it("copies KaTeX fonts and rewrites CSS into a generated SCSS partial", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-katex-assets-"));

    await prepareKatexAssets({ root });

    const css = await readFile(path.join(root, "src/assets/scss/generated/_katex.scss"), "utf8");
    await expectFile(path.join(root, "src/assets/fonts/katex/KaTeX_Main-Regular.woff2"));
    await expectFile(path.join(root, "src/assets/fonts/katex/KaTeX_Main-Regular.woff"));
    expect(css).toContain("../../fonts/katex/KaTeX_Main-Regular.woff2");
    expect(css).toContain("../../fonts/katex/KaTeX_Main-Regular.woff");
    expect(css).not.toContain("../../fonts/katex/KaTeX_Main-Regular.ttf");
  });
});

async function expectFile(filePath: string): Promise<void> {
  await expect(access(filePath)).resolves.toBeUndefined();
}
