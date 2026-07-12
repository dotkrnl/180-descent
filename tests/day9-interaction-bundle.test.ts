import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { contentDaysDir } from "@lib/content/paths";
import { loadContentRegistry } from "@lib/content/registry";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const componentPath = path.join(
  root,
  "src/app/components/lesson/interactives/Day9Interactive.astro"
);
const bundlePath = path.join(
  root,
  "src/assets/js/interactions/systems-thinking-feedback.js"
);

describe("Day 9 interaction bundle", () => {
  it("registers the shared bundle exactly once", async () => {
    const registry = await loadContentRegistry({ daysDir: contentDaysDir(root) });
    const day = registry.days.find((entry) => entry.manifest.day === 9);

    expect(day?.manifest.interactionScripts).toEqual([
      "systems-thinking-feedback"
    ]);
  });

  it("keeps behavior and lazy initialization out of the repeated component", async () => {
    const [component, bundle] = await Promise.all([
      readFile(componentPath, "utf8"),
      readFile(bundlePath, "utf8")
    ]);

    expect(component).not.toMatch(/<script\b/);
    expect(component).not.toContain("dataset.day9Ready");
    expect(bundle).toContain('document.querySelectorAll("[data-day9-kind]")');
    expect(bundle).toContain("if (root.dataset.day9Ready) return;");
    expect(bundle).toContain("const observer = new IntersectionObserver");
  });

  it("is valid JavaScript", async () => {
    await expect(
      execFileAsync(process.execPath, ["--check", bundlePath])
    ).resolves.toMatchObject({ stderr: "" });
  });
});
