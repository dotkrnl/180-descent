import { checkCleanRepo } from "@lib/checks";

const final = process.argv.includes("--final");
const failures = await checkCleanRepo({ root: process.cwd(), final });

if (failures.length) {
  console.error(final ? "Final cleanup gate failed:" : "Cleanliness check failed:");
  for (const failure of failures) {
    console.error(`- ${failure.path}: ${failure.reason}`);
  }
  process.exit(1);
}

console.log(final ? "Final cleanup gate passed." : "Cleanliness check passed.");
