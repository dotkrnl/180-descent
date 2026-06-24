import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkCleanRepo } from "@lib/checks/clean";

describe("clean repo check", () => {
  it("flags tracked generated output", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-clean-check-"));
    runGit(root, "init");
    runGit(root, "config", "user.email", "test@example.com");
    runGit(root, "config", "user.name", "Test User");

    await mkdir(path.join(root, "_site"), { recursive: true });
    await writeFile(path.join(root, "_site/index.html"), "");
    runGit(root, "add", "_site/index.html");

    expect(checkCleanRepo({ root })).toEqual([
      {
        path: "_site",
        reason: "Generated site output must not be committed"
      }
    ]);
  });

  it("flags a tracked public assets source mirror", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-clean-check-"));
    runGit(root, "init");
    runGit(root, "config", "user.email", "test@example.com");
    runGit(root, "config", "user.name", "Test User");

    await mkdir(path.join(root, "src/assets"), { recursive: true });
    await mkdir(path.join(root, "public"), { recursive: true });
    await symlink("../src/assets", path.join(root, "public/assets"));
    runGit(root, "add", "public/assets");

    expect(checkCleanRepo({ root })).toEqual([
      {
        path: "public/assets",
        reason: "Public assets must not mirror src/assets wholesale"
      }
    ]);
  });
});

function runGit(cwd: string, ...args: string[]): void {
  execFileSync("git", args, { cwd, stdio: "ignore" });
}
