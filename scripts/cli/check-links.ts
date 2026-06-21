import { checkLinks } from "@lib/checks";

const failures = await checkLinks({ root: process.cwd() });

for (const failure of failures) {
  console.error(failure.message);
}

if (failures.length) {
  process.exit(1);
}
