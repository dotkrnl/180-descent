import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

export default defineConfig({
  integrations: [mdx()],
  outDir: "_site-astro",
  srcDir: "src/app",
  publicDir: "public"
});
