import { prepareKatexAssets } from "@lib/assets/fonts";
import { runCli } from "./support";

await runCli(async () => {
  const { fonts } = await prepareKatexAssets({ root: process.cwd() });
  console.log(`KaTeX prepared: ${fonts} fonts, generated SCSS`);
});
