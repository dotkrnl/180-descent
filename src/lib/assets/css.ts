import { mkdir, writeFile } from "node:fs/promises";
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
  outFile: string;
}

export async function compileCss(options: Omit<BuildCssOptions, "outFile">): Promise<string> {
  const entryFile = path.resolve(options.root, options.entryFile ?? "src/assets/scss/book.scss");
  const css = compile(entryFile, {
    loadPaths: [path.dirname(entryFile)],
    style: "expanded"
  }).css;
  const result = await postcss([postcssImport()]).process(css, {
    from: entryFile
  });

  return result.css;
}

export async function buildCss(options: BuildCssOptions): Promise<BuildCssResult> {
  const outFile = path.resolve(options.root, options.outFile ?? "dist/generated/book.css");
  const css = await compileCss(options);

  await mkdir(path.dirname(outFile), { recursive: true });
  await writeFile(outFile, css);
  return { bytes: css.length, outFile };
}
