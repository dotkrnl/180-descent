import { prepareCjkFonts, prepareKatexAssets, prepareLatinFonts } from "@lib/assets/fonts";

const root = process.cwd();

const latin = await prepareLatinFonts({ root });
console.log(`Latin fonts prepared: ${latin.copied} fonts`);

const cjk = await prepareCjkFonts({ root });
for (const weight of cjk.weights) {
  console.log(`  ${weight.prefix}: ${weight.subsets} subsets`);
}
console.log(`CJK fonts prepared -> ${cjk.scssOut}`);

const katex = await prepareKatexAssets({ root });
console.log(`KaTeX prepared: ${katex.fonts} fonts, generated SCSS`);
