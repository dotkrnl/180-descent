import { mkdir, writeFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkContent } from "@lib/checks";

describe("content check", () => {
  it("accepts minimal paired registry content", async () => {
    const root = await createFixtureRoot();
    await writeRegistryDay(root, {
      en: body("Fixture Day"),
      zh: body("夹具日", "zh")
    });

    await expect(checkContent({ root })).resolves.toEqual([]);
  });

  it("reports mismatched h1 text and missing sources", async () => {
    const root = await createFixtureRoot();
    await writeRegistryDay(root, {
      en: [
        "<h1>Different</h1>",
        '<StatusChip status={"ok"} label={"ok"} />'
      ].join("\n"),
      zh: body("夹具日", "zh")
    });

    const failures = await checkContent({ root });

    expect(failures).toEqual([
      {
        message: "EN 001-fixture has no sources section"
      },
      {
        message: 'EN 001-fixture h1 "Different" does not match manifest title "Fixture Day"'
      }
    ]);
  });
});

async function createFixtureRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-content-check-"));
  await mkdir(path.join(root, "src/content/days/001-fixture"), { recursive: true });
  await mkdir(path.join(root, "src/assets/css"), { recursive: true });
  await writeFile(path.join(root, "src/assets/css/book.css"), "@font-face { font-family: Fixture; }\n");
  return root;
}

async function writeRegistryDay(
  root: string,
  options: {
    en: string;
    zh: string;
  }
): Promise<void> {
  const dayDir = path.join(root, "src/content/days/001-fixture");
  await writeFile(path.join(dayDir, "day.yaml"), [
    "day: 1",
    "slug: fixture",
    "path: 001-fixture",
    "block: Fixture Block",
    "published: true",
    "locales:",
    "  en:",
    "    title: Fixture Day",
    "    summary: Fixture summary.",
    "    body: en.mdx",
    "    status: reviewed",
    "  zh:",
    "    title: 夹具日",
    "    summary: 中文夹具摘要。",
    "    body: zh.mdx",
    "    status: reviewed"
  ].join("\n"));
  await writeFile(path.join(dayDir, "en.mdx"), options.en);
  await writeFile(path.join(dayDir, "zh.mdx"), options.zh);
}

function body(title: string, locale: "en" | "zh" = "en"): string {
  return [
    `<h1>${title}</h1>`,
    locale === "zh"
      ? '<StatusChip status={"ok"} label={"已确立"} />'
      : '<StatusChip status={"ok"} label={"established"} />',
    '<section class="sources"></section>'
  ].join("\n");
}
