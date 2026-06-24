import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkCleanRepo } from "@lib/checks/clean";

describe("clean repo check", () => {
  it("flags tracked generated output", async () => {
    const root = await createGitRoot();

    await mkdir(path.join(root, ".astro"), { recursive: true });
    await mkdir(path.join(root, "_site"), { recursive: true });
    await mkdir(path.join(root, "dist"), { recursive: true });
    await mkdir(path.join(root, "tmp"), { recursive: true });
    await writeFile(path.join(root, ".astro/types.d.ts"), "");
    await writeFile(path.join(root, "_site/index.html"), "");
    await writeFile(path.join(root, "dist/index.html"), "");
    await writeFile(path.join(root, "tmp/output.txt"), "");
    runGit(root, "add", ".astro/types.d.ts", "_site/index.html", "dist/index.html", "tmp/output.txt");

    expect(checkCleanRepo({ root })).toEqual([
      {
        path: ".astro",
        reason: "Generated Astro metadata must not be committed"
      },
      {
        path: "_site",
        reason: "Generated site output must not be committed"
      },
      {
        path: "dist",
        reason: "Generated distribution output must not be committed"
      },
      {
        path: "tmp",
        reason: "Temporary build output must not be committed"
      }
    ]);
  });

  it("flags tracked public assets", async () => {
    const root = await createGitRoot();

    await mkdir(path.join(root, "public/assets"), { recursive: true });
    await writeFile(path.join(root, "public/assets/source.txt"), "");
    runGit(root, "add", "public/assets/source.txt");

    expect(checkCleanRepo({ root })).toEqual([
      {
        path: "public/assets",
        reason: "Public assets must be imported through Astro instead of committed under public/assets"
      }
    ]);
  });

  it("flags tracked generated font and SCSS assets", async () => {
    const root = await createGitRoot();

    await mkdir(path.join(root, "src/assets/fonts/katex"), { recursive: true });
    await mkdir(path.join(root, "src/assets/scss/generated"), { recursive: true });
    await writeFile(path.join(root, "src/assets/fonts/katex/KaTeX_Main-Regular.woff2"), "");
    await writeFile(path.join(root, "src/assets/scss/generated/_katex.scss"), "");
    runGit(root, "add", "src/assets/fonts/katex/KaTeX_Main-Regular.woff2", "src/assets/scss/generated/_katex.scss");

    expect(checkCleanRepo({ root })).toEqual([
      {
        path: "src/assets/fonts",
        reason: "Generated font assets must not be committed"
      },
      {
        path: "src/assets/scss/generated",
        reason: "Generated SCSS partials must not be committed"
      }
    ]);
  });
});

async function createGitRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-clean-check-"));
  runGit(root, "init");
  runGit(root, "config", "user.email", "test@example.com");
  runGit(root, "config", "user.name", "Test User");
  return root;
}

function runGit(cwd: string, ...args: string[]): void {
  execFileSync("git", args, { cwd, stdio: "ignore" });
}
