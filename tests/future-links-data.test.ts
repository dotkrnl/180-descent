import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { futureLinksDataFile } from "@lib/data/paths";
import { readFutureLinksData } from "@lib/data/future-links";

describe("future links data", () => {
  it("loads valid future link rows", async () => {
    const root = await createFixtureRoot([
      "- id: day-001-to-day-009-systems",
      "  from_day: 1",
      "  target_day: 9",
      "  target_anchor: null",
      "  text: Systems thinking",
      "  status: pending",
      "  context: coherentism as web/system"
    ].join("\n"));

    await expect(readFutureLinksData(root)).resolves.toEqual([
      {
        id: "day-001-to-day-009-systems",
        from_day: 1,
        target_day: 9,
        target_anchor: null,
        text: "Systems thinking",
        status: "pending",
        context: "coherentism as web/system"
      }
    ]);
  });

  it("rejects incomplete future link rows", async () => {
    const root = await createFixtureRoot([
      "- id: day-001-to-day-009-systems",
      "  target_day: 9",
      "  status: pending"
    ].join("\n"));

    await expect(readFutureLinksData(root)).rejects.toThrow();
  });

  it("rejects duplicate future link ids", async () => {
    const root = await createFixtureRoot([
      "- id: day-001-to-day-009-systems",
      "  from_day: 1",
      "  target_day: 9",
      "  target_anchor: null",
      "  text: Systems thinking",
      "  status: pending",
      "  context: coherentism as web/system",
      "- id: day-001-to-day-009-systems",
      "  from_day: 2",
      "  target_day: 9",
      "  target_anchor: null",
      "  text: Systems thinking",
      "  status: pending",
      "  context: duplicate callback"
    ].join("\n"));

    await expect(readFutureLinksData(root)).rejects.toThrow(
      "duplicate future link id: day-001-to-day-009-systems"
    );
  });
});

async function createFixtureRoot(futureLinksYaml: string): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-future-links-data-"));
  await mkdir(path.dirname(futureLinksDataFile(root)), { recursive: true });
  await writeFile(futureLinksDataFile(root), `${futureLinksYaml}\n`);
  return root;
}
