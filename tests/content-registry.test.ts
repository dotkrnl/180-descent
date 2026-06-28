import path from "node:path";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import { describe, expect, it } from "vitest";
import { contentDaysDir } from "@lib/content/paths";
import { listRegistryDayLocaleEntries, loadContentRegistry } from "@lib/content/registry";
import { dayManifestSchema } from "@lib/schemas/day";
import { createEmptyContentRoot, writeContentDay } from "./helpers/content-root";

const projectDaysDir = contentDaysDir(process.cwd());

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
        },
        zh: {
          title: "最小示例",
          summary: "中文摘要。",
          body: "zh.mdx"
        }
      },
      appendices: [],
      interactionScripts: []
    });

    expect(parsed.locales.en.title).toBe("Minimal");
  });

  it("rejects partial day manifests", () => {
    expect(() => dayManifestSchema.parse({
      day: 1,
      block: "foundations",
      locales: {
        en: {
          title: "Minimal",
          summary: "Minimal summary.",
          body: "en.mdx"
        }
      },
      appendices: [],
      interactionScripts: []
    })).toThrow();
  });

  it("rejects unexpected nested manifest fields", () => {
    expect(() => dayManifestSchema.parse({
      day: 1,
      block: "foundations",
      locales: {
        en: {
          title: "Minimal",
          summary: "Minimal summary.",
          body: "en.mdx",
          draft: true
        },
        zh: {
          title: "最小示例",
          summary: "中文摘要。",
          body: "zh.mdx"
        }
      },
      appendices: [],
      interactionScripts: []
    })).toThrow();
  });

  it("rejects non-MDX locale body paths", () => {
    expect(() => dayManifestSchema.parse({
      day: 1,
      block: "foundations",
      locales: {
        en: {
          title: "Minimal",
          summary: "Minimal summary.",
          body: "en.html"
        },
        zh: {
          title: "最小示例",
          summary: "中文摘要。",
          body: "zh.mdx"
        }
      },
      appendices: [],
      interactionScripts: []
    })).toThrow();
  });

  it("rejects locale body paths that escape the day directory", () => {
    expect(() => dayManifestSchema.parse({
      day: 1,
      block: "foundations",
      locales: {
        en: {
          title: "Minimal",
          summary: "Minimal summary.",
          body: "../outside.mdx"
        },
        zh: {
          title: "最小示例",
          summary: "中文摘要。",
          body: "zh.mdx"
        }
      },
      appendices: [],
      interactionScripts: []
    })).toThrow("MDX body path must be a relative POSIX path within the day directory");
  });

  it("rejects absolute locale body paths", () => {
    expect(() => dayManifestSchema.parse({
      day: 1,
      block: "foundations",
      locales: {
        en: {
          title: "Minimal",
          summary: "Minimal summary.",
          body: "/tmp/en.mdx"
        },
        zh: {
          title: "最小示例",
          summary: "中文摘要。",
          body: "zh.mdx"
        }
      },
      appendices: [],
      interactionScripts: []
    })).toThrow("MDX body path must be a relative POSIX path within the day directory");
  });

  it("rejects non-normalized locale body paths", () => {
    for (const body of ["./en.mdx", "appendices//en.mdx", "appendices/./en.mdx"]) {
      expect(() => dayManifestSchema.parse({
        day: 1,
        block: "foundations",
        locales: {
          en: {
            title: "Minimal",
            summary: "Minimal summary.",
            body
          },
          zh: {
            title: "最小示例",
            summary: "中文摘要。",
            body: "zh.mdx"
          }
        },
        appendices: [],
        interactionScripts: []
      })).toThrow("MDX body path must be a relative POSIX path within the day directory");
    }
  });

  it("rejects locale bodies that do not match the canonical locale file", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-registry-locale-body-"));
    const daysDir = path.join(root, "days");
    const dayDir = path.join(daysDir, "001-fixture");
    await mkdir(dayDir, { recursive: true });
    await writeFile(path.join(dayDir, "day.yaml"), [
      "day: 1",
      "block: Fixture",
      "locales:",
      "  en:",
      "    title: Fixture",
      "    summary: Fixture summary.",
      "    body: fixture.en.mdx",
      "  zh:",
      "    title: 中文夹具",
      "    summary: 中文摘要。",
      "    body: zh.mdx",
      "appendices: []",
      "interactionScripts: []"
    ].join("\n"));

    await expect(loadContentRegistry({ daysDir })).rejects.toThrow(/en body must be en\.mdx/);
  });

  it("rejects path-like interaction script names", () => {
    expect(() => dayManifestSchema.parse({
      day: 1,
      block: "foundations",
      locales: {
        en: {
          title: "Minimal",
          summary: "Minimal summary.",
          body: "en.mdx"
        },
        zh: {
          title: "最小示例",
          summary: "中文摘要。",
          body: "zh.mdx"
        }
      },
      appendices: [],
      interactionScripts: ["../clock-ticks.js"]
    })).toThrow();
  });

  it("rejects non-slug appendix ids", () => {
    expect(() => dayManifestSchema.parse({
      day: 1,
      block: "foundations",
      locales: {
        en: {
          title: "Minimal",
          summary: "Minimal summary.",
          body: "en.mdx"
        },
        zh: {
          title: "最小示例",
          summary: "中文摘要。",
          body: "zh.mdx"
        }
      },
      appendices: [
        {
          id: "Appendix A",
          locales: {
            en: {
              title: "Appendix A",
              body: "appendices/a.en.mdx"
            },
            zh: {
              title: "附录 A",
              body: "appendices/a.zh.mdx"
            }
          }
        }
      ],
      interactionScripts: []
    })).toThrow();
  });

  it("rejects non-MDX appendix body paths", () => {
    expect(() => dayManifestSchema.parse({
      day: 1,
      block: "foundations",
      locales: {
        en: {
          title: "Minimal",
          summary: "Minimal summary.",
          body: "en.mdx"
        },
        zh: {
          title: "最小示例",
          summary: "中文摘要。",
          body: "zh.mdx"
        }
      },
      appendices: [
        {
          id: "appendix-a",
          locales: {
            en: {
              title: "Appendix A",
              body: "appendices/appendix-a.html"
            },
            zh: {
              title: "附录 A",
              body: "appendices/appendix-a.zh.mdx"
            }
          }
        }
      ],
      interactionScripts: []
    })).toThrow();
  });

  it("rejects appendix bodies that do not match the canonical locale suffix", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-registry-appendix-body-"));
    const daysDir = path.join(root, "days");
    const dayDir = path.join(daysDir, "001-fixture");
    await mkdir(dayDir, { recursive: true });
    await writeFile(path.join(dayDir, "day.yaml"), [
      "day: 1",
      "block: Fixture",
      "locales:",
      "  en:",
      "    title: Fixture",
      "    summary: Fixture summary.",
      "    body: en.mdx",
      "  zh:",
      "    title: 中文夹具",
      "    summary: 中文摘要。",
      "    body: zh.mdx",
      "appendices:",
      "  - id: appendix-a",
      "    locales:",
      "      en:",
      "        title: Appendix A",
      "        body: appendices/a.zh.mdx",
      "      zh:",
      "        title: 附录 A",
      "        body: appendices/appendix-a.zh.mdx",
      "interactionScripts: []"
    ].join("\n"));

    await expect(loadContentRegistry({ daysDir })).rejects.toThrow(
      "en appendix body must be appendices/appendix-a.en.mdx"
    );
  });

  it("rejects appendix bodies whose file slug does not match the appendix id", () => {
    expect(() => dayManifestSchema.parse({
      day: 1,
      block: "foundations",
      locales: {
        en: {
          title: "Minimal",
          summary: "Minimal summary.",
          body: "en.mdx"
        },
        zh: {
          title: "最小示例",
          summary: "中文摘要。",
          body: "zh.mdx"
        }
      },
      appendices: [
        {
          id: "appendix-a",
          locales: {
            en: { title: "Appendix A", body: "appendices/other.en.mdx" },
            zh: { title: "附录 A", body: "appendices/appendix-a.zh.mdx" }
          }
        }
      ],
      interactionScripts: []
    })).toThrow("en appendix body must be appendices/appendix-a.en.mdx");
  });

  it("rejects duplicate appendix ids", () => {
    expect(() => dayManifestSchema.parse({
      day: 1,
      block: "foundations",
      locales: {
        en: {
          title: "Minimal",
          summary: "Minimal summary.",
          body: "en.mdx"
        },
        zh: {
          title: "最小示例",
          summary: "中文摘要。",
          body: "zh.mdx"
        }
      },
      appendices: [
        {
          id: "appendix-a",
          locales: {
            en: { title: "Appendix A", body: "appendices/appendix-a.en.mdx" },
            zh: { title: "附录 A", body: "appendices/appendix-a.zh.mdx" }
          }
        },
        {
          id: "appendix-a",
          locales: {
            en: { title: "Appendix A2", body: "appendices/appendix-a.en.mdx" },
            zh: { title: "附录 A2", body: "appendices/appendix-a.zh.mdx" }
          }
        }
      ],
      interactionScripts: []
    })).toThrow(/duplicate appendix id: appendix-a/);
  });

  it("rejects duplicate interaction scripts", () => {
    expect(() => dayManifestSchema.parse({
      day: 1,
      block: "foundations",
      locales: {
        en: {
          title: "Minimal",
          summary: "Minimal summary.",
          body: "en.mdx"
        },
        zh: {
          title: "最小示例",
          summary: "中文摘要。",
          body: "zh.mdx"
        }
      },
      appendices: [],
      interactionScripts: ["clock-ticks", "clock-ticks"]
    })).toThrow(/duplicate interaction script: clock-ticks/);
  });

  it("loads paired locale bodies, appendices, and interaction scripts", async () => {
    const fixtureDaysDir = await createRegistryFixtureDaysDir();
    const registry = await loadContentRegistry({ daysDir: fixtureDaysDir });
    const day = registry.days[0];

    expect(registry.days).toHaveLength(1);
    expect(day.manifest.path).toBe("001-fixture");
    expect(Object.values(day.bodies).map((body) => body.locale).sort()).toEqual(["en", "zh"]);
    expect(day.appendixBodies.map((body) => `${body.appendixId}:${body.locale}`).sort()).toEqual([
      "appendix-a:en",
      "appendix-a:zh"
    ]);
    expect(day.manifest.interactionScripts).toEqual(["fixture-interaction"]);
  });

  it("lists renderable locale entries for Astro routes", async () => {
    const fixtureDaysDir = await createRegistryFixtureDaysDir();
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
    await writeFile(path.join(dayDir, "zh.mdx"), "# 中文");
    await writeFile(path.join(dayDir, "day.yaml"), [
      "day: 1",
      "block: Fixture",
      "locales:",
      "  en:",
      "    title: Fixture",
      "    summary: Fixture summary.",
      "    body: ../outside.mdx",
      "  zh:",
      "    title: 中文夹具",
      "    summary: 中文摘要。",
      "    body: zh.mdx",
      "appendices: []",
      "interactionScripts: []"
    ].join("\n"));

    await expect(loadContentRegistry({ daysDir })).rejects.toThrow(
      "MDX body path must be a relative POSIX path within the day directory"
    );
  });

  it("rejects absolute manifest file references", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-registry-absolute-"));
    const daysDir = path.join(root, "days");
    const dayDir = path.join(daysDir, "001-fixture");
    await mkdir(dayDir, { recursive: true });
    await writeFile(path.join(dayDir, "en.mdx"), "# Fixture");
    await writeFile(path.join(dayDir, "zh.mdx"), "# 中文");
    await writeFile(path.join(dayDir, "day.yaml"), [
      "day: 1",
      "block: Fixture",
      "locales:",
      "  en:",
      "    title: Fixture",
      "    summary: Fixture summary.",
      `    body: ${path.join(dayDir, "en.mdx")}`,
      "  zh:",
      "    title: 中文夹具",
      "    summary: 中文摘要。",
      "    body: zh.mdx",
      "appendices: []",
      "interactionScripts: []"
    ].join("\n"));

    await expect(loadContentRegistry({ daysDir })).rejects.toThrow(
      "MDX body path must be a relative POSIX path within the day directory"
    );
  });

  it("rejects non-canonical day directory names", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-registry-directory-"));
    const daysDir = path.join(root, "days");
    await mkdir(path.join(daysDir, "fixture"), { recursive: true });

    await expect(loadContentRegistry({ daysDir })).rejects.toThrow("Invalid day directory name: fixture");
  });

  it("rejects duplicate day numbers", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-registry-duplicate-"));
    const daysDir = path.join(root, "days");
    await writeMinimalDay(daysDir, "001-first", 1);
    await writeMinimalDay(daysDir, "001-second", 1);

    await expect(loadContentRegistry({ daysDir })).rejects.toThrow("Duplicate day number 1: 001-first and 001-second");
  });

  it("rejects manifest day numbers that do not match the directory prefix", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-registry-day-prefix-"));
    const daysDir = path.join(root, "days");
    await writeMinimalDay(daysDir, "009-fixture", 1);

    await expect(loadContentRegistry({ daysDir })).rejects.toThrow(
      "Manifest day 1 does not match directory 009-fixture"
    );
  });

  it("loads project day content with paired appendices and interaction scripts", async () => {
    const registry = await loadContentRegistry({ daysDir: projectDaysDir });
    const daysByPath = new Map(registry.days.map((day) => [day.manifest.path, day]));
    const day001 = daysByPath.get("001-what-is-knowledge");
    const day002 = daysByPath.get("002-scientific-method-and-demarcation");
    const day003 = daysByPath.get("003-logic-and-valid-inference");
    const day004 = daysByPath.get("004-probability-as-extended-logic");
    const day005 = daysByPath.get("005-causation");
    const day006 = daysByPath.get("006-statistics-and-the-art-of-not-fooling-yourself");
    const day007 = daysByPath.get("007-information-theory");
    const day008 = daysByPath.get("008-complexity-and-emergence");

    expect([...daysByPath.keys()]).toEqual([
      "001-what-is-knowledge",
      "002-scientific-method-and-demarcation",
      "003-logic-and-valid-inference",
      "004-probability-as-extended-logic",
      "005-causation",
      "006-statistics-and-the-art-of-not-fooling-yourself",
      "007-information-theory",
      "008-complexity-and-emergence"
    ]);

    for (const day of registry.days) {
      expect(Object.values(day.bodies).map((body) => body.locale).sort()).toEqual(["en", "zh"]);
      for (const body of [...Object.values(day.bodies), ...day.appendixBodies]) {
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
    expect(day001?.manifest.interactionScripts).toEqual([
      "clock-ticks",
      "gettier-machine",
      "credence-dial",
      "closure-machine",
      "stakes-dial",
      "modal-rings",
      "echo-chamber",
      "accuracy-domination"
    ]);
    expect(day001?.bodies.en.source).toContain("<StatusChip");

    expect(day002?.appendixBodies.map((body) => `${body.appendixId}:${body.locale}`).sort()).toEqual([
      "foundations-without-bedrock:en",
      "foundations-without-bedrock:zh"
    ]);
    expect(day002?.manifest.interactionScripts).toEqual([
      "demarcation-lab",
      "grue-machine",
      "base-rate-engine"
    ]);
    expect(day002?.bodies.en.source).toContain("blackSwan.src");

    expect(day003?.appendixBodies.map((body) => `${body.appendixId}:${body.locale}`).sort()).toEqual([
      "the-deeper-machinery-of-logic:en",
      "the-deeper-machinery-of-logic:zh",
      "the-unsettled-frontier:en",
      "the-unsettled-frontier:zh"
    ]);
    expect(day003?.manifest.interactionScripts).toEqual([
      "inference-inspector",
      "fallacy-spotter",
      "hype-filter-trainer"
    ]);
    expect(day003?.bodies.en.source).toContain("sherlockHolmes.src");

    expect(day004?.appendixBodies).toEqual([]);
    expect(day004?.manifest.interactionScripts).toEqual([
      "probability-machines"
    ]);
    expect(day004?.bodies.en.source).toContain("montyHall.src");

    expect(day005?.appendixBodies).toEqual([]);
    expect(day005?.manifest.interactionScripts).toEqual([
      "causation-lab"
    ]);
    expect(day005?.bodies.en.source).toContain("<DoSeeCalculator");
    expect(day005?.bodies.en.source).toContain("<MathBlock");

    expect(day006?.appendixBodies.map((body) => `${body.appendixId}:${body.locale}`).sort()).toEqual([
      "the-deeper-machinery:en",
      "the-deeper-machinery:zh",
      "the-incoming-wave:en",
      "the-incoming-wave:zh"
    ]);
    expect(day006?.manifest.interactionScripts).toEqual([
      "statistics-core",
      "statistics-lab",
      "statistics-appendices"
    ]);
    expect(day006?.bodies.en.source).toContain("feynman1959.src");
    expect(day006?.bodies.en.source).toContain("pValueTailArea.src");
    expect(day006?.appendixBodies[0].source).toContain("PValueShapeSimulator");

    expect(day007?.appendixBodies.map((body) => `${body.appendixId}:${body.locale}`).sort()).toEqual([
      "the-bleeding-edge:en",
      "the-bleeding-edge:zh",
      "the-deeper-currents:en",
      "the-deeper-currents:zh"
    ]);
    expect(day007?.manifest.interactionScripts).toEqual([
      "information-theory"
    ]);
    expect(day007?.bodies.en.source).toContain("maxwellsDemon.src");
    expect(day007?.bodies.en.source).toContain("EntropyDial");
    expect(day007?.bodies.en.source).toContain("<MathBlock");
    expect(day007?.appendixBodies[0].source).toContain("MutualInformationOverlap");
    expect(day007?.appendixBodies[0].source).toContain("HammingCube");

    expect(day008?.appendixBodies.map((body) => `${body.appendixId}:${body.locale}`).sort()).toEqual([
      "the-bleeding-edge-2020-2026:en",
      "the-bleeding-edge-2020-2026:zh",
      "the-deeper-machinery:en",
      "the-deeper-machinery:zh"
    ]);
    expect(day008?.manifest.interactionScripts).toEqual([
      "complexity-emergence"
    ]);
    expect(day008?.bodies.en.source).toContain("MurmurationEngine");
    expect(day008?.bodies.en.source).toContain("GameOfLifeGun");
    expect(day008?.bodies.en.source).toContain("ComplexityHump");
  });
});

async function createRegistryFixtureDaysDir(): Promise<string> {
  const root = await createEmptyContentRoot("180-registry-fixture-");
  await writeContentDay(root, {
    enTitle: "Fixture Day",
    enSummary: "Fixture summary.",
    enBody: "# Fixture Day\nEnglish fixture body.",
    zhTitle: "中文夹具",
    zhSummary: "中文夹具摘要。",
    zhBody: "# 中文夹具\n中文 fixture body.",
    appendices: [
      {
        id: "appendix-a",
        enTitle: "Appendix A",
        enBodyPath: "appendices/appendix-a.en.mdx",
        enBody: "English appendix.",
        zhTitle: "附录 A",
        zhBodyPath: "appendices/appendix-a.zh.mdx",
        zhBody: "中文 appendix."
      }
    ],
    interactionScripts: ["fixture-interaction"]
  });
  return contentDaysDir(root);
}

async function writeMinimalDay(daysDir: string, dayPath: string, dayNumber: number): Promise<void> {
  const dayDir = path.join(daysDir, dayPath);
  await mkdir(dayDir, { recursive: true });
  await writeFile(path.join(dayDir, "en.mdx"), "# Fixture");
  await writeFile(path.join(dayDir, "zh.mdx"), "# 中文");
  await writeFile(path.join(dayDir, "day.yaml"), [
    `day: ${dayNumber}`,
    "block: Fixture",
    "locales:",
    "  en:",
    "    title: Fixture",
    "    summary: Fixture summary.",
    "    body: en.mdx",
    "  zh:",
    "    title: 中文夹具",
    "    summary: 中文摘要。",
    "    body: zh.mdx",
    "appendices: []",
    "interactionScripts: []"
  ].join("\n"));
}
