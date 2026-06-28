import { checkMath } from "@lib/checks/math";
import { exitOnErrors } from "./support";

const result = await checkMath({ root: process.cwd() });

exitOnErrors(result.failures, (failure) => `${failure.file}: ${failure.label}`, {
  footer: [
    `\nMath lint failed. ${result.failures.length} problem(s) found.`,
    "Use <MathBlock> for display equations and <MathInline> for inline equations."
  ]
});

console.log(`Math lint passed for ${result.checkedSourceFiles} source files and ${result.checkedBuiltFiles} built HTML files.`);
