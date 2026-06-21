import { mkdir, writeFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkLinks } from "@lib/checks";

describe("link checks", () => {
  it("reports broken internal links and missing anchors", async () => {
    const root = await createFixtureRoot();
    await writeFile(path.join(root, "_site/index.html"), [
      '<a href="/missing/">missing</a>',
      '<a href="/target/#absent">bad anchor</a>'
    ].join("\n"));
    await mkdir(path.join(root, "_site/target"), { recursive: true });
    await writeFile(path.join(root, "_site/target/index.html"), '<main id="present"></main>');

    const failures = await checkLinks({ root });

    expect(failures.map((failure) => failure.message)).toEqual([
      "Broken internal link /missing/ in _site/index.html",
      'Missing anchor /target/#absent (anchor "absent" not found in _site/target/index.html) referenced from _site/index.html'
    ]);
  });

  it("reports future links that still target published days", async () => {
    const root = await createFixtureRoot();
    await writeFile(path.join(root, "_site/index.html"), "");
    await writeFile(path.join(root, "src/_data/future-links.yaml"), [
      "- id: day-1-callback",
      "  target_day: 1",
      "  status: pending"
    ].join("\n"));

    const failures = await checkLinks({ root });

    expect(failures).toEqual([
      {
        message: "Future link day-1-callback targets published day 1 but is still pending"
      }
    ]);
  });
});

async function createFixtureRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-check-links-"));
  await mkdir(path.join(root, "_site"), { recursive: true });
  await mkdir(path.join(root, "src/days"), { recursive: true });
  await mkdir(path.join(root, "src/_data"), { recursive: true });
  await writeFile(path.join(root, "src/days/day-001.md"), "---\nday: 1\n---\n");
  await writeFile(path.join(root, "src/_data/future-links.yaml"), "[]\n");
  return root;
}
