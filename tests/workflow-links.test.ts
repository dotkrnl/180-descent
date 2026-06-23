import { mkdtemp, mkdir, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkWorkflowSkillLinks } from "@lib/checks";

describe("workflow skill links", () => {
  it("accepts canonical workflow symlinks", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-workflow-links-"));
    await createWorkflowTree(root, true);

    await expect(checkWorkflowSkillLinks(root)).resolves.toEqual([]);
  });

  it("rejects copied skill docs", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-workflow-links-"));
    await createWorkflowTree(root, false);

    const failures = await checkWorkflowSkillLinks(root);
    expect(failures[0]).toEqual({
      path: ".codex/skills/180-descent-assets/SKILL.md",
      reason: "Expected symlink to ../../../docs/workflows/180-descent-assets/README.md"
    });
  });
});

async function createWorkflowTree(root: string, linked: boolean): Promise<void> {
  for (const workflow of [
    "180-descent-assets",
    "180-descent-content",
    "180-descent-publish"
  ]) {
    const skillDir = path.join(root, ".codex/skills", workflow);
    const workflowDir = path.join(root, "docs/workflows", workflow);
    await mkdir(skillDir, { recursive: true });
    await mkdir(workflowDir, { recursive: true });
    await writeFile(path.join(workflowDir, "README.md"), "---\nname: fixture\n---\n");

    const skillPath = path.join(skillDir, "SKILL.md");
    if (linked) {
      await symlink(`../../../docs/workflows/${workflow}/README.md`, skillPath);
    } else {
      await writeFile(skillPath, "---\nname: copied\n---\n");
    }
  }
}
