import { lstat, readlink } from "node:fs/promises";
import path from "node:path";

interface WorkflowCheckFailure {
  path: string;
  reason: string;
}

const WORKFLOW_SKILL_PATH = ".codex/skills/180-descent/SKILL.md";
const WORKFLOW_TARGET = "../../../docs/workflows/180-descent/README.md";
const SPLIT_WORKFLOW_SKILLS = [
  "180-descent-assets",
  "180-descent-content",
  "180-descent-publish"
] as const;

export async function checkProjectWorkflow(root: string): Promise<WorkflowCheckFailure[]> {
  const failures: WorkflowCheckFailure[] = [];

  try {
    const stats = await lstat(path.join(root, WORKFLOW_SKILL_PATH));
    if (!stats.isSymbolicLink()) {
      failures.push({
        path: WORKFLOW_SKILL_PATH,
        reason: `Expected symlink to ${WORKFLOW_TARGET}`
      });
    } else {
      const target = await readlink(path.join(root, WORKFLOW_SKILL_PATH));
      if (target !== WORKFLOW_TARGET) {
        failures.push({
          path: WORKFLOW_SKILL_PATH,
          reason: `Expected symlink target ${WORKFLOW_TARGET}, got ${target}`
        });
      }
    }
  } catch (error) {
    failures.push({
      path: WORKFLOW_SKILL_PATH,
      reason: error instanceof Error ? error.message : "Unable to inspect project workflow skill"
    });
  }

  for (const skillName of SPLIT_WORKFLOW_SKILLS) {
    const splitSkillPath = `.codex/skills/${skillName}`;
    try {
      await lstat(path.join(root, splitSkillPath));
      failures.push({
        path: splitSkillPath,
        reason: "Remove split workflow skill; use .codex/skills/180-descent"
      });
    } catch (error) {
      if (!isMissingPathError(error)) {
        failures.push({
          path: splitSkillPath,
          reason: error instanceof Error ? error.message : "Unable to inspect split workflow skill"
        });
      }
    }
  }

  return failures;
}

function isMissingPathError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT";
}
