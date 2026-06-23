import path from "node:path";
import postcss from "postcss";
import postcssImport from "postcss-import";
import { compile } from "sass";

export interface CompileCssOptions {
  root: string;
  entryFile?: string;
}

export async function compileCss(options: CompileCssOptions): Promise<string> {
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
