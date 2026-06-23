import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { prepareCjkFonts, prepareKatexAssets, prepareLatinFonts } from "@lib/assets/fonts";

describe("font asset preparation", () => {
  it("copies configured latin font files into the site asset directory", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-latin-fonts-"));
    const packageRoot = await fakePackage(root, "@fontsource/fixture");
    await mkdir(path.join(packageRoot, "files"), { recursive: true });
    await writeFile(path.join(packageRoot, "files", "fixture.woff2"), "font");

    const result = await prepareLatinFonts({
      root,
      resolvePackageRoot: () => packageRoot,
      assets: [{ packageName: "@fontsource/fixture", fileName: "fixture.woff2" }]
    });

    const copied = await readFile(path.join(root, "src/assets/fonts/fixture.woff2"), "utf8");
    expect(result.copied).toBe(1);
    expect(copied).toBe("font");
  });

  it("copies CJK font subsets and rewrites vendor CSS into a generated SCSS partial", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-cjk-fonts-"));
    const packageRoot = await fakePackage(root, "lxgw-wenkai-webfont");
    await mkdir(path.join(packageRoot, "files"), { recursive: true });
    await writeFile(path.join(packageRoot, "fixture.css"), "@font-face{src:url(./files/fixture-subset-1.woff2)}");
    await writeFile(path.join(packageRoot, "files", "fixture-subset-1.woff2"), "subset");
    await writeFile(path.join(packageRoot, "files", "ignored.woff2"), "ignored");

    const result = await prepareCjkFonts({
      root,
      resolvePackageRoot: () => packageRoot,
      weights: [{ cssFile: "fixture.css", prefix: "fixture" }]
    });

    const copied = await readFile(path.join(root, "src/assets/fonts/cjk/fixture-subset-1.woff2"), "utf8");
    const css = await readFile(path.join(root, "src/assets/scss/generated/_cjk.scss"), "utf8");
    expect(result.weights).toEqual([{ prefix: "fixture", subsets: 1 }]);
    expect(copied).toBe("subset");
    expect(css).toContain("../../fonts/cjk/fixture-subset-1.woff2");
  });

  it("copies KaTeX fonts and rewrites CSS into a generated SCSS partial", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-katex-assets-"));
    const packageRoot = await fakePackage(root, "katex");
    await mkdir(path.join(packageRoot, "dist/fonts"), { recursive: true });
    await writeFile(path.join(packageRoot, "dist/fonts", "KaTeX_Main-Regular.woff2"), "woff2");
    await writeFile(path.join(packageRoot, "dist/fonts", "KaTeX_Main-Regular.woff"), "woff");
    await writeFile(path.join(packageRoot, "dist/fonts", "KaTeX_Main-Regular.ttf"), "ignored");
    await writeFile(path.join(packageRoot, "dist/katex.min.css"), '@font-face{src:url(fonts/KaTeX_Main-Regular.woff2) format("woff2"),url(fonts/KaTeX_Main-Regular.woff) format("woff"),url(fonts/KaTeX_Main-Regular.ttf) format("truetype")}');

    const result = await prepareKatexAssets({
      root,
      resolvePackageRoot: () => packageRoot
    });

    const copied = await readFile(path.join(root, "src/assets/fonts/katex/KaTeX_Main-Regular.woff2"), "utf8");
    const css = await readFile(path.join(root, "src/assets/scss/generated/_katex.scss"), "utf8");
    expect(result.fonts).toBe(2);
    expect(copied).toBe("woff2");
    expect(css).toContain("../../fonts/katex/KaTeX_Main-Regular.woff2");
    expect(css).toContain("../../fonts/katex/KaTeX_Main-Regular.woff");
    expect(css).not.toContain("../../fonts/katex/KaTeX_Main-Regular.ttf");
  });
});

async function fakePackage(root: string, packageName: string): Promise<string> {
  const packageRoot = path.join(root, "vendor", packageName);
  await mkdir(packageRoot, { recursive: true });
  return packageRoot;
}
