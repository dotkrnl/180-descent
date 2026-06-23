import { checkCleanRepo } from "@lib/checks/clean";

const failures = await checkCleanRepo({ root: process.cwd() });

if (failures.length) {
  console.error("Cleanliness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure.path}: ${failure.reason}`);
  }
  process.exit(1);
}

console.log("Cleanliness check passed.");
