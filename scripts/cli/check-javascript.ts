import { checkJavaScriptSyntax } from "@lib/checks/javascript";
import { exitOnErrors } from "./support";

const result = await checkJavaScriptSyntax({ root: process.cwd() });

exitOnErrors(result.failures, (failure) => `${failure.file}: ${failure.reason}`, {
  heading: "JavaScript syntax check failed:",
  prefix: "- "
});

console.log(`JavaScript syntax check passed (${result.checkedFiles} files).`);
