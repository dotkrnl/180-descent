import { prepareCjkFonts, prepareKatexAssets, prepareLatinFonts } from "@lib/assets/fonts";

const root = process.cwd();

await prepareLatinFonts({ root });
console.log("Latin fonts prepared.");

await prepareCjkFonts({ root });
console.log("CJK fonts prepared.");

await prepareKatexAssets({ root });
console.log("KaTeX assets prepared.");
