import { copyFile, mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const katexRoot = path.dirname(new URL(import.meta.resolve("katex/package.json")).pathname);
const cssOut = path.resolve("src/assets/css/katex.css");
const fontsOut = path.resolve("src/assets/fonts/katex");

await mkdir(fontsOut, { recursive: true });

const fonts = (await readdir(path.join(katexRoot, "dist", "fonts")))
  .filter((f) => f.endsWith(".woff2") || f.endsWith(".woff"));

for (const file of fonts) {
  await copyFile(path.join(katexRoot, "dist", "fonts", file), path.join(fontsOut, file));
}

let css = await readFile(path.join(katexRoot, "dist", "katex.min.css"), "utf8");
css = css.replaceAll("fonts/", "../fonts/katex/");
await writeFile(cssOut, css);

console.log(`KaTeX prepared: ${fonts.length} fonts, katex.css`);
