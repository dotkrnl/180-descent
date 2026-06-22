declare module "postcss-import" {
  import type { PluginCreator } from "postcss";

  const postcssImport: PluginCreator<Record<string, unknown>>;
  export default postcssImport;
}
