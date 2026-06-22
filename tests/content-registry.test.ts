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
    const day = registry.days.find((entry) => entry.manifest.path === "001-what-is-knowledge");

    expect(day).toBeDefined();
    expect(day?.bodies.map((body) => body.locale).sort()).toEqual(["en", "zh"]);
    expect(day?.appendixBodies.map((body) => `${body.appendixId}:${body.locale}`).sort()).toEqual([
      "rest-of-the-map:en",
      "rest-of-the-map:zh",
      "the-edge-of-the-map:en",
      "the-edge-of-the-map:zh"
    ]);
    expect(day?.manifest.components.map((component) => component.id)).toEqual([
      "clock-ticks",
      "gettier-machine",
      "credence-dial",
      "closure-machine",
      "stakes-dial",
      "modal-rings",
      "echo-chamber",
      "accuracy-domination"
    ]);
    expect(day?.bodies[0].source).toContain("<StatusChip");
    expect(day?.bodies[0].source).not.toContain("{%");
  });
});
