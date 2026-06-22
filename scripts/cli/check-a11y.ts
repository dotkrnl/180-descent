import { checkAccessibility } from "@lib/checks";

const result = await checkAccessibility({ root: process.cwd() });

if (result.failures.length) {
  console.error("Accessibility check failed:");
  console.error(result.failures.join("\n\n"));
  process.exit(1);
}

console.log(`Accessibility check passed for ${result.checkedPages} pages.`);
