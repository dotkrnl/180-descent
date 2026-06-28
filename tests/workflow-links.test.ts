import { mkdtemp, mkdir, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkProjectWorkflow } from "@lib/checks/workflows";

describe("project workflow", () => {
  it("accepts the canonical unified workflow symlink", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-workflow-links-"));
    await createWorkflowTree(root, { linked: true });

    await expect(checkProjectWorkflow(root)).resolves.toEqual([]);
  });

  it("rejects copied project workflow docs", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-workflow-links-"));
    await createWorkflowTree(root, { linked: false });

    const failures = await checkProjectWorkflow(root);
    expect(failures[0]).toEqual({
      path: ".codex/skills/180-descent/SKILL.md",
      reason: "Expected symlink to ../../../docs/workflows/180-descent/README.md"
    });
  });

  it("rejects canonical workflow symlinks with missing targets", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-workflow-links-"));
    await mkdir(path.join(root, ".codex/skills/180-descent"), { recursive: true });
    await symlink("../../../docs/workflows/180-descent/README.md", path.join(root, ".codex/skills/180-descent/SKILL.md"));

    const failures = await checkProjectWorkflow(root);
    expect(failures[0]?.path).toBe("../../../docs/workflows/180-descent/README.md");
  });
});

async function createWorkflowTree(
  root: string,
  options: { linked: boolean }
): Promise<void> {
  const skillDir = path.join(root, ".codex/skills/180-descent");
  const workflowDir = path.join(root, "docs/workflows/180-descent");
  await mkdir(skillDir, { recursive: true });
  await mkdir(workflowDir, { recursive: true });
  await writeFile(path.join(workflowDir, "README.md"), "---\nname: fixture\n---\n");

  const skillPath = path.join(skillDir, "SKILL.md");
  if (options.linked) {
    await symlink("../../../docs/workflows/180-descent/README.md", skillPath);
  } else {
    await writeFile(skillPath, "---\nname: copied\n---\n");
  }
}
