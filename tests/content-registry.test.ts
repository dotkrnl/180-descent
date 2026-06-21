import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadContentRegistry } from "@lib/content";
import { dayManifestSchema } from "@lib/schemas";

const fixtureDaysDir = path.join(process.cwd(), "tests/fixtures/content/days");

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
});
