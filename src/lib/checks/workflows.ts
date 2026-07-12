import { lstat, readFile, readlink, stat } from "node:fs/promises";
import path from "node:path";
import { toError } from "@lib/errors";

interface WorkflowCheckFailure {
  path: string;
  reason: string;
}

const WORKFLOW_SKILL_PATH = ".codex/skills/180-descent/SKILL.md";
const WORKFLOW_TARGET = "../../../docs/workflows/180-descent/README.md";

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
      } else {
        try {
          await stat(path.join(root, WORKFLOW_SKILL_PATH));
          failures.push(...await checkWorkflowReferences(root));
        } catch (error) {
          failures.push({
            path: WORKFLOW_TARGET,
            reason: toError(error).message
          });
        }
      }
    }
  } catch (error) {
    failures.push({
      path: WORKFLOW_SKILL_PATH,
      reason: toError(error).message
    });
  }

  return failures;
}

async function checkWorkflowReferences(root: string): Promise<WorkflowCheckFailure[]> {
  const source = await readFile(path.join(root, WORKFLOW_SKILL_PATH), "utf8");
  const targets = new Set(
    [...source.matchAll(/\[[^\]]+\]\(([^)#]+\.md)(?:#[^)]*)?\)/g)]
      .map((match) => match[1])
      .filter((target) => !/^(?:[a-z]+:|\/)/i.test(target))
  );
  const failures: WorkflowCheckFailure[] = [];

  for (const target of targets) {
    const referencePath = path.posix.normalize(
      path.posix.join(path.posix.dirname(WORKFLOW_SKILL_PATH), target)
    );
    const expectedTarget = path.posix.join(
      "../../../docs/workflows/180-descent",
      path.posix.basename(target)
    );
    try {
      const stats = await lstat(path.join(root, referencePath));
      if (!stats.isSymbolicLink()) {
        failures.push({
          path: referencePath,
          reason: `Expected symlink to ${expectedTarget}`
        });
        continue;
      }
      const linkedTarget = await readlink(path.join(root, referencePath));
      if (linkedTarget !== expectedTarget) {
        failures.push({
          path: referencePath,
          reason: `Expected symlink target ${expectedTarget}, got ${linkedTarget}`
        });
        continue;
      }
      await stat(path.join(root, referencePath));
    } catch (error) {
      failures.push({
        path: referencePath,
        reason: toError(error).message
      });
    }
  }

  return failures;
}
