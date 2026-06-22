import { prepareCjkFonts } from "@lib/assets";

try {
  const result = await prepareCjkFonts({ root: process.cwd() });
  for (const weight of result.weights) {
    console.log(`  ${weight.prefix}: ${weight.subsets} subsets`);
  }
  console.log(`CJK fonts prepared -> ${result.cssOut}`);
} catch (error) {
  console.error(error);
  process.exit(1);
}
