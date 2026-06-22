import { mkdir, writeFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkAppendixStyle } from "@lib/checks";

describe("appendix style check", () => {
  it("reports forbidden appendix-local classes", async () => {
    const root = await createFixtureRoot();
    await writeAppendix(root, '<div class="movement"></div>');

    const result = await checkAppendixStyle({ root });

    expect(result.checkedAppendixFiles).toBe(1);
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
});

async function createFixtureRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-appendix-style-"));
  await mkdir(path.join(root, "src/content/days/001-fixture/appendices"), { recursive: true });
  await mkdir(path.join(root, "src/assets/css"), { recursive: true });
  await mkdir(path.join(root, "src/assets/js/interactions"), { recursive: true });
  await writeFile(path.join(root, "src/assets/css/book.css"), [
    ".wrap{}",
    ".deep-dive{}",
    ".ptitle{}",
    ".deep-dive-title{}",
    ".deep-dive-sub{}",
    ".deep-dive-body{}"
  ].join("\n"));
  await writeFile(path.join(root, "src/content/days/001-fixture/day.yaml"), [
    "day: 1",
    "slug: fixture",
    "path: 001-fixture",
    "block: Fixture",
    "published: true",
    "locales:",
    "  en:",
    "    title: Fixture",
    "    summary: Fixture summary.",
    "    body: en.mdx",
    "    status: reviewed",
    "appendices:",
    "  - id: appendix-a",
    "    locales:",
    "      en:",
    "        title: Appendix A",
    "        body: appendices/appendix-a.en.mdx",
    "        status: reviewed"
  ].join("\n"));
  await writeFile(path.join(root, "src/content/days/001-fixture/en.mdx"), "");
  return root;
}

async function writeAppendix(root: string, body: string): Promise<void> {
  await writeFile(path.join(root, "src/content/days/001-fixture/appendices/appendix-a.en.mdx"), body);
}
