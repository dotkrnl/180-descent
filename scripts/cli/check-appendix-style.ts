import { checkAppendixStyle } from "@lib/checks";

const result = await checkAppendixStyle({ root: process.cwd() });

if (result.errors.length) {
  console.error("Appendix style check failed:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Appendix style check passed for ${result.checkedIncludeFiles} include files.`);
