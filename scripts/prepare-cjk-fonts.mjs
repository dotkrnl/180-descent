import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const pkgRoot = path.dirname(new URL(import.meta.resolve("lxgw-wenkai-webfont/package.json")).pathname);
const outDir = path.resolve("src/assets/fonts/cjk");
const cssOut = path.resolve("src/assets/css/cjk.css");

const weights = [
  { css: "lxgwwenkai-regular.css", prefix: "lxgwwenkai-regular" },
  { css: "lxgwwenkai-bold.css", prefix: "lxgwwenkai-bold" },
];

await mkdir(outDir, { recursive: true });

let cssParts = [];

for (const { css, prefix } of weights) {
  const cssText = await readFile(path.join(pkgRoot, css), "utf8");

  const subsets = (await readdir(path.join(pkgRoot, "files")))
    .filter((f) => f.startsWith(`${prefix}-subset-`) && f.endsWith(".woff2"));

  for (const file of subsets) {
    await copyFile(path.join(pkgRoot, "files", file), path.join(outDir, file));
  }

  const rewritten = cssText.replaceAll("./files/", "/assets/fonts/cjk/");
  cssParts.push(rewritten);
  console.log(`  ${prefix}: ${subsets.length} subsets`);
}

await writeFile(cssOut, cssParts.join("\n"));
console.log(`CJK fonts prepared → ${cssOut}`);
