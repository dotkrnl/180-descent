import { checkMath } from "@lib/checks";

const result = await checkMath({ root: process.cwd() });

for (const failure of result.failures) {
  console.error(`${failure.file}: ${failure.label}`);
}

if (result.failures.length) {
  console.error(`\nMath lint failed. ${result.failures.length} problem(s) found.`);
  console.error("Use {% math %}...{% endmath %} for display equations.");
  process.exit(1);
}

console.log(`Math lint passed for ${result.checkedSourceFiles} files. KaTeX output is clean.`);
