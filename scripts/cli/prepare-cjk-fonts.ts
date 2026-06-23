import { prepareCjkFonts } from "@lib/assets/fonts";
import { runCli } from "./support";

await runCli(async () => {
  const result = await prepareCjkFonts({ root: process.cwd() });
  for (const weight of result.weights) {
    console.log(`  ${weight.prefix}: ${weight.subsets} subsets`);
  }
  console.log(`CJK fonts prepared -> ${result.scssOut}`);
});
