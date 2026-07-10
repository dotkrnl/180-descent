import { checkMath } from "@lib/checks/math";
import { exitOnErrors } from "./support";

const args = process.argv.slice(2);
const unknown = args.filter((arg) => arg !== "--source-only");
if (unknown.length) {
  console.error("Usage: npm run check:math -- [--source-only]");
  console.error(unknown.map((arg) => `- Unknown option: ${arg}`).join("\n"));
  process.exit(1);
}

const sourceOnly = args.includes("--source-only");
const result = await checkMath({ root: process.cwd(), requireBuiltHtml: !sourceOnly });

exitOnErrors(result.failures, (failure) => `${failure.file}: ${failure.label}`, {
  footer: [
    `\nMath lint failed. ${result.failures.length} problem(s) found.`,
    "Use <MathBlock> for display equations and <MathInline> for inline equations."
  ]
});

console.log(`Math lint passed for ${result.checkedSourceFiles} source files and ${result.checkedBuiltFiles} built HTML files.`);
