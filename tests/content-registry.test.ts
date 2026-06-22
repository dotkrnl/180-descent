import path from "node:path";
import { describe, expect, it } from "vitest";
import { listRegistryDayLocaleEntries, loadContentRegistry } from "@lib/content";
import { dayManifestSchema } from "@lib/schemas";

const fixtureDaysDir = path.join(process.cwd(), "tests/fixtures/content/days");
const projectDaysDir = path.join(process.cwd(), "src/content/days");

describe("target content registry", () => {
  it("validates the paired day manifest schema", () => {
    const parsed = dayManifestSchema.parse({
      day: 1,
      slug: "minimal",
      path: "001-minimal",
      block: "foundations",
      locales: {
        en: {
          title: "Minimal",
          summary: "Minimal summary.",
          body: "en.mdx",
          status: "reviewed"
        }
      }
    });

    expect(parsed.published).toBe(false);
    expect(parsed.sources.required).toBe(true);
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
    expect(day.manifest.components[0].artifactVariants).toEqual({
      epub: "table",
      pdf: "static-figure"
    });
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

  it("loads migrated project day content with paired appendices and components", async () => {
    const registry = await loadContentRegistry({ daysDir: projectDaysDir });
    const daysByPath = new Map(registry.days.map((day) => [day.manifest.path, day]));
    const day001 = daysByPath.get("001-what-is-knowledge");
    const day002 = daysByPath.get("002-scientific-method-and-demarcation");

    expect([...daysByPath.keys()]).toEqual([
      "001-what-is-knowledge",
      "002-scientific-method-and-demarcation"
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
  });
});
