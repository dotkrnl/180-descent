import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkAppendixStyle } from "@lib/checks/appendix-style";
import { contentDayFile, contentDaysDir } from "@lib/content/paths";

describe("appendix style check", () => {
  it("reports forbidden appendix-local classes", async () => {
    const root = await createFixtureRoot();
    await writeAppendix(root, '<div class="movement"></div>');

    const result = await checkAppendixStyle({ root });

    expect(result.checkedAppendixFiles).toBe(2);
    expect(result.errors).toEqual([
      'src/content/days/001-fixture/appendices/appendix-a.en.mdx: forbidden appendix class "movement". Use <section> with .sec-eyebrow instead of appendix-local section wrappers.'
    ]);
  });

  it("reports missing shared CSS ownership", async () => {
    const root = await createFixtureRoot();
    await writeAppendix(root, '<div class="unknown-appendix-class"></div>');

    const result = await checkAppendixStyle({ root });

    expect(result.errors).toEqual([
      'src/content/days/001-fixture/appendices/appendix-a.en.mdx: appendix class "unknown-appendix-class" has no shared CSS rule or JS owner'
    ]);
  });

  it("ignores appendix-local class examples inside fenced code blocks", async () => {
    const root = await createFixtureRoot();
    await writeAppendix(root, [
      "```html",
      '<div class="movement unknown-appendix-class"></div>',
      "```"
    ].join("\n"));

    const result = await checkAppendixStyle({ root });

    expect(result.errors).toEqual([]);
  });
});

async function createFixtureRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-appendix-style-"));
  await mkdir(path.join(contentDaysDir(root), "001-fixture/appendices"), { recursive: true });
  await mkdir(path.join(root, "src/assets/scss"), { recursive: true });
  await mkdir(path.join(root, "src/assets/js/interactions"), { recursive: true });
  await writeFile(path.join(root, "src/assets/scss/book.scss"), [
    ".wrap{}",
    ".deep-dive{}",
    ".ptitle{}",
    ".deep-dive-title{}",
    ".deep-dive-sub{}",
    ".deep-dive-body{}"
  ].join("\n"));
  await writeFile(contentDayFile(root, "001-fixture", "day.yaml"), [
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
    "        body: appendices/appendix-a.en.mdx",
    "      zh:",
    "        title: 附录 A",
    "        body: appendices/appendix-a.zh.mdx",
    "interactionScripts: []"
  ].join("\n"));
  await writeFile(contentDayFile(root, "001-fixture", "en.mdx"), "");
  await writeFile(contentDayFile(root, "001-fixture", "zh.mdx"), "");
  await writeFile(contentDayFile(root, "001-fixture", "appendices/appendix-a.zh.mdx"), "");
  return root;
}

async function writeAppendix(root: string, body: string): Promise<void> {
  await writeFile(contentDayFile(root, "001-fixture", "appendices/appendix-a.en.mdx"), body);
}
