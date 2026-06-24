import path from "node:path";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import { describe, expect, it } from "vitest";
import { listRegistryDayLocaleEntries, loadContentRegistry } from "@lib/content/registry";
import { dayManifestSchema } from "@lib/schemas/day";

const fixtureDaysDir = path.join(process.cwd(), "tests/fixtures/content/days");
const projectDaysDir = path.join(process.cwd(), "src/content/days");

describe("target content registry", () => {
  it("validates the paired day manifest schema", () => {
    const parsed = dayManifestSchema.parse({
      day: 1,
      block: "foundations",
      locales: {
        en: {
          title: "Minimal",
          summary: "Minimal summary.",
          body: "en.mdx"
        }
      }
    });

    expect(parsed.published).toBe(false);
    expect(parsed.assets).toEqual([]);
  });

  it("loads paired locale bodies, appendices, assets, and component declarations", async () => {
    const registry = await loadContentRegistry({ daysDir: fixtureDaysDir });
    const day = registry.days[0];

    expect(registry.days).toHaveLength(1);
    expect(day.manifest.path).toBe("001-fixture");
    expect(day.bodies.map((body) => body.locale).sort()).toEqual(["en", "zh"]);
    expect(day.appendixBodies.map((body) => `${body.appendixId}:${body.locale}`).sort()).toEqual([
      "appendix-a:en",
      "appendix-a:zh"
    ]);
    expect(day.assets).toEqual([
      "assets/fixture-diagram.svg",
      "assets/fixture-diagram.zh.svg"
    ]);
    expect(day.manifest.components[0].webEntry).toBe("fixture-interaction");
  });

  it("lists renderable locale entries for Astro routes", async () => {
    const registry = await loadContentRegistry({ daysDir: fixtureDaysDir });
    const routes = listRegistryDayLocaleEntries(registry);

    expect(routes.map((route) => `${route.locale}/${route.day.manifest.path}`)).toEqual([
      "en/001-fixture",
      "zh/001-fixture"
    ]);
    expect(routes[0].title).toBe("Fixture Day");
    expect(routes[1].summary).toBe("中文夹具摘要。");
  });

  it("rejects manifest file references that escape a day directory", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-registry-escape-"));
    const daysDir = path.join(root, "days");
    const dayDir = path.join(daysDir, "001-fixture");
    await mkdir(dayDir, { recursive: true });
    await writeFile(path.join(root, "outside.mdx"), "# Outside");
    await writeFile(path.join(dayDir, "day.yaml"), [
      "day: 1",
      "block: Fixture",
      "locales:",
      "  en:",
      "    title: Fixture",
      "    summary: Fixture summary.",
      "    body: ../outside.mdx"
    ].join("\n"));

    await expect(loadContentRegistry({ daysDir })).rejects.toThrow("Manifest reference escapes day directory: ../outside.mdx");
  });

  it("loads project day content with paired appendices and components", async () => {
    const registry = await loadContentRegistry({ daysDir: projectDaysDir });
    const daysByPath = new Map(registry.days.map((day) => [day.manifest.path, day]));
    const day001 = daysByPath.get("001-what-is-knowledge");
    const day002 = daysByPath.get("002-scientific-method-and-demarcation");
    const day003 = daysByPath.get("003-logic-and-valid-inference");
    const day004 = daysByPath.get("004-probability-as-extended-logic");
    const day005 = daysByPath.get("005-causation");
    const day006 = daysByPath.get("006-statistics-and-the-art-of-not-fooling-yourself");
    const day007 = daysByPath.get("007-information-theory");

    expect([...daysByPath.keys()]).toEqual([
      "001-what-is-knowledge",
      "002-scientific-method-and-demarcation",
      "003-logic-and-valid-inference",
      "004-probability-as-extended-logic",
      "005-causation",
      "006-statistics-and-the-art-of-not-fooling-yourself",
      "007-information-theory"
    ]);

    for (const day of registry.days) {
      expect(day.bodies.map((body) => body.locale).sort()).toEqual(["en", "zh"]);
      for (const body of [...day.bodies, ...day.appendixBodies]) {
        expect(body.source).not.toContain("{%");
        expect(body.source).not.toContain("{{");
        expect(body.source).not.toContain("<!-- deep-dive");
      }
    }

    expect(day001?.appendixBodies.map((body) => `${body.appendixId}:${body.locale}`).sort()).toEqual([
      "rest-of-the-map:en",
      "rest-of-the-map:zh",
      "the-edge-of-the-map:en",
      "the-edge-of-the-map:zh"
    ]);
    expect(day001?.manifest.components.map((component) => component.id)).toEqual([
      "clock-ticks",
      "gettier-machine",
      "credence-dial",
      "closure-machine",
      "stakes-dial",
      "modal-rings",
      "echo-chamber",
      "accuracy-domination"
    ]);
    expect(day001?.bodies[0].source).toContain("<StatusChip");

    expect(day002?.appendixBodies.map((body) => `${body.appendixId}:${body.locale}`).sort()).toEqual([
      "foundations-without-bedrock:en",
      "foundations-without-bedrock:zh"
    ]);
    expect(day002?.manifest.components.map((component) => component.id)).toEqual([
      "demarcation-lab",
      "grue-machine",
      "base-rate-engine"
    ]);
    expect(day002?.bodies[0].source).toContain("blackSwan.src");

    expect(day003?.appendixBodies.map((body) => `${body.appendixId}:${body.locale}`).sort()).toEqual([
      "the-deeper-machinery-of-logic:en",
      "the-deeper-machinery-of-logic:zh",
      "the-unsettled-frontier:en",
      "the-unsettled-frontier:zh"
    ]);
    expect(day003?.manifest.components.map((component) => component.id)).toEqual([
      "inference-inspector",
      "fallacy-spotter",
      "hype-filter-trainer"
    ]);
    expect(day003?.bodies[0].source).toContain("sherlockHolmes.src");

    expect(day004?.appendixBodies).toEqual([]);
    expect(day004?.manifest.components.map((component) => component.id)).toEqual([
      "probability-machines"
    ]);
    expect(day004?.bodies[0].source).toContain("montyHall.src");

    expect(day005?.appendixBodies).toEqual([]);
    expect(day005?.manifest.components.map((component) => component.id)).toEqual([
      "causation-lab"
    ]);
    expect(day005?.bodies[0].source).toContain("<DoSeeCalculator");
    expect(day005?.bodies[0].source).toContain("<MathBlock");

    expect(day006?.appendixBodies.map((body) => `${body.appendixId}:${body.locale}`).sort()).toEqual([
      "the-deeper-machinery:en",
      "the-deeper-machinery:zh",
      "the-incoming-wave:en",
      "the-incoming-wave:zh"
    ]);
    expect(day006?.manifest.components.map((component) => component.id)).toEqual([
      "statistics-core",
      "statistics-lab",
      "statistics-appendices"
    ]);
    expect(day006?.bodies[0].source).toContain("feynman1959.src");
    expect(day006?.bodies[0].source).toContain("pValueTailArea.src");
    expect(day006?.appendixBodies[0].source).toContain("PValueShapeSimulator");

    expect(day007?.appendixBodies.map((body) => `${body.appendixId}:${body.locale}`).sort()).toEqual([
      "the-bleeding-edge:en",
      "the-bleeding-edge:zh",
      "the-deeper-currents:en",
      "the-deeper-currents:zh"
    ]);
    expect(day007?.manifest.components.map((component) => component.id)).toEqual([
      "information-theory"
    ]);
    expect(day007?.bodies[0].source).toContain("maxwellsDemon.src");
    expect(day007?.bodies[0].source).toContain("EntropyDial");
    expect(day007?.bodies[0].source).toContain("<MathBlock");
    expect(day007?.appendixBodies[0].source).toContain("MutualInformationOverlap");
    expect(day007?.appendixBodies[0].source).toContain("HammingCube");
  });
});
