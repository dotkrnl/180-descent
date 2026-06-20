import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";
import postcssImport from "postcss-import";

const entryFile = path.resolve("src/assets/css/src/book.css");
const outFile = path.resolve("src/assets/css/book.css");

export async function buildCss() {
  const css = await readFile(entryFile, "utf8");
  const result = await postcss([postcssImport()]).process(css, {
    from: entryFile,
    to: outFile,
  });

  await writeFile(outFile, result.css);
  return { bytes: result.css.length };
}

const isDirectInvocation = process.argv[1] && path.resolve(process.argv[1]) === path.resolve("scripts/prepare-css.mjs");
if (isDirectInvocation) {
  buildCss()
    .then(({ bytes }) => {
      console.log(`CSS bundled: src/book.css → book.css (${bytes} bytes)`);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
