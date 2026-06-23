import { checkWorkflowSkillLinks } from "@lib/checks/workflows";
import { exitOnErrors } from "./support";

const failures = await checkWorkflowSkillLinks(process.cwd());

exitOnErrors(failures, (failure) => `${failure.path}: ${failure.reason}`, {
  heading: "Workflow link check failed:",
  prefix: "- "
});

console.log("Workflow link check passed.");
