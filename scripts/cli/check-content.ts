import { checkContent } from "@lib/checks/content";

const failures = await checkContent({ root: process.cwd() });

for (const failure of failures) {
  console.error(failure.message);
}

if (failures.length) {
  process.exit(1);
}
