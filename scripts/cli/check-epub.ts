import { checkEpub } from "@lib/checks/epub";

const result = await checkEpub({ root: process.cwd() });

for (const error of result.errors) {
  console.error(error);
}

if (result.errors.length) {
  process.exit(1);
}
