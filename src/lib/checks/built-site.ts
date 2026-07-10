import { walkFiles, pathExists } from "@lib/fs/walk";
import { siteDir } from "@lib/static-site/routes";

const MISSING_BUILT_SITE_MESSAGE = "_site does not exist; run npm run build:site first";

export async function builtHtmlFiles(root: string, options: { required?: boolean } = {}): Promise<{
  builtSiteDir: string;
  htmlFiles: string[];
}> {
  const builtSiteDir = siteDir(root);
  if (!await pathExists(builtSiteDir)) {
    if (options.required) throw new Error(MISSING_BUILT_SITE_MESSAGE);
    return { builtSiteDir, htmlFiles: [] };
  }
  return {
    builtSiteDir,
    htmlFiles: await walkFiles(builtSiteDir, { exts: ".html", ignoredDirNames: [] })
  };
}
