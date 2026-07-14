import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { describe, expect, it } from "vitest";
import { contentDaysDir } from "@lib/content/paths";
import { loadContentRegistry } from "@lib/content/registry";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const componentPath = path.join(root, "src/app/components/lesson/interactives/Day13Interactive.astro");
const bundlePath = path.join(root, "src/assets/js/interactions/measurement-units.js");
const initializers = [
  ["uncertainty-ledger", "initLedger"],
  ["kibble-balance", "initKibble"],
  ["alpha-drift", "initAlpha"],
  ["lineage", "initLineage"],
  ["quantum-hall", "initQuantumHall"],
  ["accuracy-target", "initAccuracy"],
  ["readiness-ladder", "initReadiness"],
  ["dark-matter-wave", "initDarkMatter"]
] as const;

describe("Day 13 interaction bundle", () => {
  it("registers the shared bundle exactly once", async () => {
    const registry = await loadContentRegistry({ daysDir: contentDaysDir(root) });
    const day = registry.days.find((entry) => entry.manifest.day === 13);

    expect(day?.manifest.interactionScripts).toEqual(["measurement-units"]);
  });

  it("keeps all eight initializers lazy and out of the repeated component", async () => {
    const [component, bundle] = await Promise.all([
      readFile(componentPath, "utf8"),
      readFile(bundlePath, "utf8")
    ]);

    expect(component).not.toMatch(/<script\b/);
    expect(bundle).toContain('document.querySelectorAll("[data-day13-kind]")');
    expect(bundle).toContain("var observer = new IntersectionObserver");
    expect(bundle).toContain("observer.observe(root);");
    expect(bundle).toContain("if (initializer) mountWhenVisible(root, initializer);");
    for (const [kind, initializer] of initializers) {
      expect(component).toContain(`| "${kind}"`);
      expect(bundle).toContain(`"${kind}": ${initializer}`);
    }
  });

  it("is valid JavaScript", async () => {
    await expect(execFileAsync(process.execPath, ["--check", bundlePath])).resolves.toMatchObject({ stderr: "" });
  });

  it("has no timed work to leak off-screen and disables decorative transitions for reduced motion", async () => {
    const [bundle, styles] = await Promise.all([
      readFile(bundlePath, "utf8"),
      readFile(path.join(root, "src/assets/scss/components/interactions/_day13.scss"), "utf8")
    ]);
    expect(bundle).not.toMatch(/requestAnimationFrame|setInterval|setTimeout/);
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)");
    expect(styles).toContain("transition: none;");
  });
});
