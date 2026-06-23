import { prepareCjkFonts } from "@lib/assets/fonts";

try {
  const result = await prepareCjkFonts({ root: process.cwd() });
  for (const weight of result.weights) {
    console.log(`  ${weight.prefix}: ${weight.subsets} subsets`);
  }
  console.log(`CJK fonts prepared -> ${result.scssOut}`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
