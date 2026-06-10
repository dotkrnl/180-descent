import { copyFile, mkdir } from "node:fs/promises";
import path from "node:path";

const fonts = [
  ["@fontsource/fraunces", "fraunces-latin-400-normal.woff2"],
  ["@fontsource/fraunces", "fraunces-latin-400-italic.woff2"],
  ["@fontsource/fraunces", "fraunces-latin-500-normal.woff2"],
  ["@fontsource/fraunces", "fraunces-latin-500-italic.woff2"],
  ["@fontsource/fraunces", "fraunces-latin-600-normal.woff2"],
  ["@fontsource/newsreader", "newsreader-latin-400-normal.woff2"],
  ["@fontsource/newsreader", "newsreader-latin-400-italic.woff2"],
  ["@fontsource/newsreader", "newsreader-latin-500-normal.woff2"],
  ["@fontsource/ibm-plex-mono", "ibm-plex-mono-latin-400-normal.woff2"],
  ["@fontsource/ibm-plex-mono", "ibm-plex-mono-latin-500-normal.woff2"],
  ["@fontsource/ibm-plex-mono", "ibm-plex-mono-latin-600-normal.woff2"]
];

const outDir = path.resolve("src/assets/fonts");
await mkdir(outDir, { recursive: true });

for (const [pkg, file] of fonts) {
  const packageRoot = path.dirname(new URL(import.meta.resolve(`${pkg}/package.json`)).pathname);
  await copyFile(path.join(packageRoot, "files", file), path.join(outDir, file));
}
