import { execFile } from "node:child_process";
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { promisify } from "node:util";
import { cjkFontsDir, fontsDir, generatedScssFile, katexFontsDir, pdfFontsDir } from "@lib/assets/paths";

const require = createRequire(import.meta.url);
const execFileAsync = promisify(execFile);

interface AssetPreparationOptions {
  root: string;
}

type AssetPackageName =
  | "@fontsource/fraunces"
  | "@fontsource/ibm-plex-mono"
  | "@fontsource/newsreader"
  | "katex"
  | "lxgw-wenkai-webfont";

interface LatinFontAsset {
  packageName: AssetPackageName;
  fileName: string;
}

interface PrepareLatinFontsResult {
  copied: number;
  outDir: string;
}

interface CjkFontWeight {
  cssFile: string;
  prefix: string;
}

interface PrepareCjkFontsResult {
  scssOut: string;
  weights: Array<{
    prefix: string;
    subsets: number;
  }>;
}

interface PrepareKatexAssetsResult {
  scssOut: string;
  fonts: number;
}

interface PreparePdfFontsResult {
  converted: number;
  outDir: string;
}

const latinFontAssets: readonly LatinFontAsset[] = [
  { packageName: "@fontsource/fraunces", fileName: "fraunces-latin-400-normal.woff2" },
  { packageName: "@fontsource/fraunces", fileName: "fraunces-latin-400-italic.woff2" },
  { packageName: "@fontsource/fraunces", fileName: "fraunces-latin-500-normal.woff2" },
  { packageName: "@fontsource/fraunces", fileName: "fraunces-latin-500-italic.woff2" },
  { packageName: "@fontsource/fraunces", fileName: "fraunces-latin-600-normal.woff2" },
  { packageName: "@fontsource/fraunces", fileName: "fraunces-latin-700-normal.woff2" },
  { packageName: "@fontsource/fraunces", fileName: "fraunces-latin-700-italic.woff2" },
  { packageName: "@fontsource/newsreader", fileName: "newsreader-latin-400-normal.woff2" },
  { packageName: "@fontsource/newsreader", fileName: "newsreader-latin-400-italic.woff2" },
  { packageName: "@fontsource/newsreader", fileName: "newsreader-latin-500-normal.woff2" },
  { packageName: "@fontsource/newsreader", fileName: "newsreader-latin-700-normal.woff2" },
  { packageName: "@fontsource/newsreader", fileName: "newsreader-latin-700-italic.woff2" },
  { packageName: "@fontsource/ibm-plex-mono", fileName: "ibm-plex-mono-latin-400-normal.woff2" },
  { packageName: "@fontsource/ibm-plex-mono", fileName: "ibm-plex-mono-latin-500-normal.woff2" },
  { packageName: "@fontsource/ibm-plex-mono", fileName: "ibm-plex-mono-latin-600-normal.woff2" }
];

const cjkFontWeights: readonly CjkFontWeight[] = [
  { cssFile: "lxgwwenkai-regular.css", prefix: "lxgwwenkai-regular" },
  { cssFile: "lxgwwenkai-bold.css", prefix: "lxgwwenkai-bold" }
];

const packageRoots: Record<AssetPackageName, string> = {
  "@fontsource/fraunces": path.dirname(require.resolve("@fontsource/fraunces/package.json")),
  "@fontsource/ibm-plex-mono": path.dirname(require.resolve("@fontsource/ibm-plex-mono/package.json")),
  "@fontsource/newsreader": path.dirname(require.resolve("@fontsource/newsreader/package.json")),
  katex: path.dirname(require.resolve("katex/package.json")),
  "lxgw-wenkai-webfont": path.dirname(require.resolve("lxgw-wenkai-webfont/package.json"))
};

export async function prepareLatinFonts(options: AssetPreparationOptions): Promise<PrepareLatinFontsResult> {
  const outDir = fontsDir(options.root);
  await mkdir(outDir, { recursive: true });

  await Promise.all(latinFontAssets.map((asset) => {
    const packageRoot = packageRoots[asset.packageName];
    return copyFile(path.join(packageRoot, "files", asset.fileName), path.join(outDir, asset.fileName));
  }));

  return {
    copied: latinFontAssets.length,
    outDir
  };
}

export async function preparePdfFonts(options: AssetPreparationOptions): Promise<PreparePdfFontsResult> {
  const sourceDir = fontsDir(options.root);
  const outDir = pdfFontsDir(options.root);
  await mkdir(outDir, { recursive: true });

  let converted = 0;
  for (const asset of latinFontAssets) {
    const source = path.join(sourceDir, asset.fileName);
    const output = path.join(outDir, asset.fileName.replace(/\.woff2$/, ".otf"));
    if (await isFresh(output, source)) continue;
    await execFileAsync("fonttools", ["ttLib.woff2", "decompress", source, "-o", output], {
      maxBuffer: 1024 * 1024 * 4
    });
    converted++;
  }

  return { converted, outDir };
}

export async function prepareCjkFonts(options: AssetPreparationOptions): Promise<PrepareCjkFontsResult> {
  const packageRoot = packageRoots["lxgw-wenkai-webfont"];
  const outDir = cjkFontsDir(options.root);
  const scssOut = generatedScssFile(options.root, "_cjk.scss");
  const results: PrepareCjkFontsResult["weights"] = [];

  await mkdir(outDir, { recursive: true });
  await mkdir(path.dirname(scssOut), { recursive: true });

  const cssParts: string[] = [];
  for (const weight of cjkFontWeights) {
    const cssText = await readFile(path.join(packageRoot, weight.cssFile), "utf8");
    const subsets = (await readdir(path.join(packageRoot, "files")))
      .filter((fileName) => fileName.startsWith(`${weight.prefix}-subset-`) && fileName.endsWith(".woff2"));
    subsets.sort();

    await Promise.all(subsets.map((fileName) => {
      return copyFile(path.join(packageRoot, "files", fileName), path.join(outDir, fileName));
    }));

    cssParts.push(cssText.replaceAll("./files/", "../../fonts/cjk/"));
    results.push({ prefix: weight.prefix, subsets: subsets.length });
  }

  await writeFile(scssOut, cssParts.join("\n"));
  return {
    scssOut,
    weights: results
  };
}

export async function prepareKatexAssets(options: AssetPreparationOptions): Promise<PrepareKatexAssetsResult> {
  const katexRoot = packageRoots.katex;
  const scssOut = generatedScssFile(options.root, "_katex.scss");
  const fontsOut = katexFontsDir(options.root);

  await mkdir(fontsOut, { recursive: true });
  await mkdir(path.dirname(scssOut), { recursive: true });

  const fonts = (await readdir(path.join(katexRoot, "dist", "fonts")))
    .filter((fileName) => fileName.endsWith(".woff2") || fileName.endsWith(".woff"));
  fonts.sort();

  await Promise.all(fonts.map((fileName) => {
    return copyFile(path.join(katexRoot, "dist", "fonts", fileName), path.join(fontsOut, fileName));
  }));

  const css = await readFile(path.join(katexRoot, "dist", "katex.min.css"), "utf8");
  await writeFile(scssOut, stripUnbundledKatexTtfSources(css.replaceAll("fonts/", "../../fonts/katex/")));

  return {
    scssOut,
    fonts: fonts.length
  };
}

export function stripUnbundledKatexTtfSources(css: string): string {
  return css.replace(/,url\((?:\.\.\/){1,2}fonts\/katex\/[^)]*?\.ttf\)\s*format\("truetype"\)/g, "");
}

async function isFresh(output: string, source: string): Promise<boolean> {
  try {
    const [outputStat, sourceStat] = await Promise.all([stat(output), stat(source)]);
    return outputStat.mtimeMs >= sourceStat.mtimeMs;
  } catch {
    return false;
  }
}
