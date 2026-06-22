import { mkdir, writeFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkContent } from "@lib/checks";

describe("content check", () => {
  it("accepts a minimal legacy day shell and include", async () => {
    const root = await createFixtureRoot();
    await writeLegacyDay(root, {
      title: "Fixture Day",
      include: [
        "<h1>Fixture Day</h1>",
        '<span class="chip ok" data-print="ok">ok</span>',
        '<section class="sources"></section>'
      ].join("\n")
    });

    await expect(checkContent({ root })).resolves.toEqual([]);
  });

  it("reports missing scripts and mismatched h1 text", async () => {
    const root = await createFixtureRoot();
    await writeLegacyDay(root, {
      title: "Fixture Day",
      scripts: ["/assets/js/interactions/missing.js"],
      include: [
        "<h1>Different</h1>",
        '<span class="chip ok" data-print="ok">ok</span>',
        '<section class="sources"></section>'
      ].join("\n")
    });

    const failures = await checkContent({ root });

    expect(failures).toEqual([
      {
        message: "English day-001-fixture.md references missing script: /assets/js/interactions/missing.js"
      },
      {
        message: 'English day-001-fixture.md h1 "Different" does not match route title "Fixture Day"'
      }
    ]);
  });
});

async function createFixtureRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-content-check-"));
  await mkdir(path.join(root, "src/days"), { recursive: true });
  await mkdir(path.join(root, "src/_includes/days/001-fixture"), { recursive: true });
  await mkdir(path.join(root, "src/assets/css"), { recursive: true });
  await writeFile(path.join(root, "src/assets/css/book.css"), "@font-face { font-family: Fixture; }\n");
  return root;
}

async function writeLegacyDay(
  root: string,
  options: {
    title: string;
    include: string;
    scripts?: string[];
  }
): Promise<void> {
  await writeFile(path.join(root, "src/_includes/days/001-fixture/en.njk"), options.include);
  await writeFile(path.join(root, "src/days/day-001-fixture.md"), [
    "---",
    "day: 1",
    `title: ${options.title}`,
    "summary: Fixture summary.",
    "threads:",
    "  - information",
    "content_template: days/001-fixture/en.njk",
    "permalink: /days/001-fixture/",
    ...(options.scripts?.length ? ["scripts:", ...options.scripts.map((script) => `  - ${script}`)] : []),
    "---",
    "{% include content_template %}"
  ].join("\n"));
}
