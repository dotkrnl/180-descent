import path from "node:path";
import postcss from "postcss";
import postcssImport from "postcss-import";
import { compile } from "sass";
import { bookScssFile } from "@lib/assets/paths";

interface CompileCssOptions {
  root: string;
}

export async function compileCss(options: CompileCssOptions): Promise<string> {
  const entryFile = bookScssFile(options.root);
  const css = compile(entryFile, {
    loadPaths: [path.dirname(entryFile)],
    style: "expanded"
  }).css;
  const result = await postcss([postcssImport()]).process(css, {
    from: entryFile
  });

  return result.css;
}
