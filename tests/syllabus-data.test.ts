import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { syllabusDataFile } from "@lib/data/paths";
import { readSyllabusBlockTitleMap, readSyllabusData } from "@lib/data/syllabus";

describe("syllabus data", () => {
  it("loads localized syllabus rows", async () => {
    const root = await createFixtureRoot(validSyllabusYaml());

    await expect(readSyllabusData(root, "zh")).resolves.toMatchObject({
      title: "知识地图",
      blocks: [
        {
          id: "I",
          startDay: 1,
          endDay: 1,
          title: "根基",
          days: [
            {
              day: 1,
              title: "知识是什么？",
              entry: "钟表谜题",
              frontier: "贝叶斯认识论"
            }
          ]
        }
      ]
    });
  });

  it("maps English block titles to localized block titles", async () => {
    const root = await createFixtureRoot(validSyllabusYaml());

    await expect(readSyllabusBlockTitleMap(root, "zh")).resolves.toEqual(new Map([
      ["Foundations", "根基"]
    ]));
  });

  it("rejects incomplete localized text", async () => {
    const root = await createFixtureRoot([
      "title:",
      "  en: Knowledge Map",
      "subtitle:",
      "  en: Foundations",
      "  zh: 根基",
      "purpose:",
      "  en: Purpose",
      "  zh: 目的",
      "method:",
      "  en: Method",
      "  zh: 方法",
      "blocks: []"
    ].join("\n"));

    await expect(readSyllabusData(root, "en")).rejects.toThrow();
  });

  it("rejects day rows outside the declared block range", async () => {
    const root = await createFixtureRoot(validSyllabusYaml().replace("      - day: 1", "      - day: 2"));

    await expect(readSyllabusData(root, "en")).rejects.toThrow(/outside block I range 1-1/);
  });

  it("rejects duplicate day numbers across blocks", async () => {
    const root = await createFixtureRoot([
      validSyllabusYaml(),
      "  - id: II",
      "    start_day: 1",
      "    end_day: 1",
      "    title:",
      "      en: Duplicate",
      "      zh: 重复",
      "    summary:",
      "      en: Duplicate block",
      "      zh: 重复模块",
      "    days:",
      "      - day: 1",
      "        title:",
      "          en: Duplicate Day",
      "          zh: 重复日"
    ].join("\n"));

    await expect(readSyllabusData(root, "en")).rejects.toThrow(/appears in both block I and block II/);
  });
});

async function createFixtureRoot(syllabusYaml: string): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-syllabus-data-"));
  await mkdir(path.dirname(syllabusDataFile(root)), { recursive: true });
  await writeFile(syllabusDataFile(root), `${syllabusYaml}\n`);
  return root;
}

function validSyllabusYaml(): string {
  return [
    "title:",
    "  en: Knowledge Map",
    "  zh: 知识地图",
    "subtitle:",
    "  en: Foundations",
    "  zh: 根基",
    "purpose:",
    "  en: Purpose",
    "  zh: 目的",
    "method:",
    "  en: Method",
    "  zh: 方法",
    "blocks:",
    "  - id: I",
    "    start_day: 1",
    "    end_day: 1",
    "    title:",
    "      en: Foundations",
    "      zh: 根基",
    "    summary:",
    "      en: First block",
    "      zh: 第一模块",
    "    days:",
    "      - day: 1",
    "        title:",
    "          en: What Is Knowledge?",
    "          zh: 知识是什么？",
    "        entry:",
    "          en: clock puzzle",
    "          zh: 钟表谜题",
    "        model:",
    "          en: justified true belief",
    "          zh: 证成的真信念",
    "        debate:",
    "          en: foundations or coherence",
    "          zh: 基础或融贯",
    "        frontier:",
    "          en: Bayesian epistemology",
    "          zh: 贝叶斯认识论"
  ].join("\n");
}
