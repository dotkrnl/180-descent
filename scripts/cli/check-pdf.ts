import { checkPdf } from "@lib/checks";

const result = await checkPdf({ root: process.cwd() });

for (const error of result.errors) {
  console.error(error);
}

if (result.errors.length) {
  process.exit(1);
}
