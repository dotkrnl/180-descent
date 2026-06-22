import { prepareKatexAssets } from "@lib/assets";

try {
  const { fonts } = await prepareKatexAssets({ root: process.cwd() });
  console.log(`KaTeX prepared: ${fonts} fonts, katex.css`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
