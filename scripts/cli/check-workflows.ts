import { checkWorkflowSkillLinks } from "@lib/checks/workflows";

const failures = await checkWorkflowSkillLinks(process.cwd());

if (failures.length) {
  console.error("Workflow link check failed:");
  for (const failure of failures) {
    console.error(`- ${failure.path}: ${failure.reason}`);
  }
  process.exit(1);
}

console.log("Workflow link check passed.");
