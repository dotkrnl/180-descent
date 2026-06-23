import { checkAppendixStyle } from "@lib/checks/appendix-style";
import { exitOnErrors } from "./support";

const result = await checkAppendixStyle({ root: process.cwd() });

exitOnErrors(result.errors, (error) => error, {
  heading: "Appendix style check failed:",
  prefix: "- "
});

console.log(`Appendix style check passed for ${result.checkedAppendixFiles} appendix files.`);
