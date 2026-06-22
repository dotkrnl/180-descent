import { writeFile } from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";
import postcssImport from "postcss-import";
import { compile } from "sass";

export interface BuildCssOptions {
  root: string;
  entryFile?: string;
  outFile?: string;
}

export interface BuildCssResult {
  bytes: number;
}

export async function buildCss(options: BuildCssOptions): Promise<BuildCssResult> {
  const entryFile = path.resolve(options.root, options.entryFile ?? "src/assets/scss/book.scss");
  const outFile = path.resolve(options.root, options.outFile ?? "src/assets/css/book.css");
  const css = compile(entryFile, {
    loadPaths: [path.dirname(entryFile)],
    style: "expanded"
  }).css;
  const result = await postcss([postcssImport()]).process(css, {
    from: entryFile,
    to: outFile
  });

  await writeFile(outFile, result.css);
  return { bytes: result.css.length };
}
