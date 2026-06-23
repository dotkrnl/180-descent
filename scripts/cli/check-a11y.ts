import { checkAccessibility } from "@lib/checks/a11y";
import { exitOnErrors } from "./support";

const result = await checkAccessibility({ root: process.cwd() });

exitOnErrors(result.failures, (failure) => failure, {
  heading: "Accessibility check failed:",
  separator: "\n\n"
});

console.log(`Accessibility check passed for ${result.checkedPages} pages.`);
