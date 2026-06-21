import { lstat, readlink } from "node:fs/promises";
import path from "node:path";

export interface WorkflowLinkFailure {
  path: string;
  reason: string;
}

const WORKFLOW_SKILL_LINKS = [
  "180-descent-add-appendix",
  "180-descent-add-day",
  "180-descent-assets",
  "180-descent-chinese-edition",
  "180-descent-publish"
] as const;

export async function checkWorkflowSkillLinks(root: string): Promise<WorkflowLinkFailure[]> {
  const failures: WorkflowLinkFailure[] = [];

  for (const workflow of WORKFLOW_SKILL_LINKS) {
    const skillPath = `.codex/skills/${workflow}/SKILL.md`;
    const expectedTarget = `../../../docs/workflows/${workflow}/README.md`;
    const absoluteSkillPath = path.join(root, skillPath);

    try {
      const stats = await lstat(absoluteSkillPath);
      if (!stats.isSymbolicLink()) {
        failures.push({
          path: skillPath,
          reason: `Expected symlink to ${expectedTarget}`
        });
        continue;
      }

      const target = await readlink(absoluteSkillPath);
      if (target !== expectedTarget) {
        failures.push({
          path: skillPath,
          reason: `Expected symlink target ${expectedTarget}, got ${target}`
        });
      }
    } catch (error) {
      failures.push({
        path: skillPath,
        reason: error instanceof Error ? error.message : "Unable to inspect workflow skill link"
      });
    }
  }

  return failures;
}
