import { checkAppendixStyle } from "@lib/checks/appendix-style";

const result = await checkAppendixStyle({ root: process.cwd() });

if (result.errors.length) {
  console.error("Appendix style check failed:");
  for (const error of result.errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Appendix style check passed for ${result.checkedAppendixFiles} appendix files.`);
