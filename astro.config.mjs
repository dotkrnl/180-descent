import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

export default defineConfig({
  integrations: [
    mdx({
      remarkPlugins: [remarkMath],
      rehypePlugins: [[rehypeKatex, { output: "html" }]]
    })
  ],
  outDir: "_site-astro",
  srcDir: "src/app",
  publicDir: "public"
});
