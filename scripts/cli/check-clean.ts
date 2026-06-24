import { checkCleanRepo } from "@lib/checks/clean";
import { exitOnErrors } from "./support";

const failures = checkCleanRepo({ root: process.cwd() });

exitOnErrors(failures, (failure) => `${failure.path}: ${failure.reason}`, {
  heading: "Cleanliness check failed:",
  prefix: "- "
});

console.log("Cleanliness check passed.");
