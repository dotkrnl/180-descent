import { checkProjectWorkflow } from "@lib/checks/workflows";
import { exitOnErrors } from "./support";

const failures = await checkProjectWorkflow(process.cwd());

exitOnErrors(failures, (failure) => `${failure.path}: ${failure.reason}`, {
  heading: "Project workflow check failed:",
  prefix: "- "
});

console.log("Project workflow check passed.");
