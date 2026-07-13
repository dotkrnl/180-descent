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
  "src/app/components/lesson/interactives/Day12Interactive.astro"
);
const bundlePath = path.join(
  root,
  "src/assets/js/interactions/networks.js"
);
const initializers = [
  ["small-world", "initSmallWorld"],
  ["degree-distribution", "initDistribution"],
  ["contagion", "initContagion"],
  ["friendship-paradox", "initFriendship"],
  ["robustness", "initRobustness"],
  ["centrality", "initCentrality"],
  ["synchronization", "initSynchronization"],
  ["tipping-cascade", "initTipping"]
] as const;

describe("Day 12 interaction bundle", () => {
  it("registers the shared bundle exactly once", async () => {
    const registry = await loadContentRegistry({ daysDir: contentDaysDir(root) });
    const day = registry.days.find((entry) => entry.manifest.day === 12);

    expect(day?.manifest.path).toBe("012-networks");
    expect(day?.manifest.interactionScripts).toEqual([
      "networks"
    ]);
  });

  it("keeps all eight initializers lazy and out of the repeated component", async () => {
    const [component, bundle] = await Promise.all([
      readFile(componentPath, "utf8"),
      readFile(bundlePath, "utf8")
    ]);

    expect(component).not.toMatch(/<script\b/);
    expect(bundle).toContain('document.querySelectorAll("[data-day12-kind]")');
    expect(bundle).toContain("var observer = new IntersectionObserver");
    expect(bundle).toContain("observer.observe(root);");
    expect(bundle).toContain("if (init) mountWhenVisible(root, init);");
    for (const [kind, initializer] of initializers) {
      expect(component).toContain(`| "${kind}"`);
      expect(bundle).toContain(`"${kind}": ${initializer}`);
    }
  });

  it("is valid JavaScript", async () => {
    await expect(
      execFileAsync(process.execPath, ["--check", bundlePath])
    ).resolves.toMatchObject({ stderr: "" });
  });
});
