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
      "  text: Systems thinking",
      "  status: pending",
      "  context: coherentism as web/system"
    ].join("\n"));

    await expect(readFutureLinksData(root)).resolves.toEqual([
      {
        id: "day-001-to-day-009-systems",
        from_day: 1,
        target_day: 9,
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

  it("rejects blank future link text fields", async () => {
    const root = await createFixtureRoot([
      "- id: day-001-to-day-009-systems",
      "  from_day: 1",
      "  target_day: 9",
      "  text: '   '",
      "  status: pending",
      "  context: coherentism as web/system"
    ].join("\n"));

    await expect(readFutureLinksData(root)).rejects.toThrow("must not be blank");
  });

  it("rejects duplicate future link ids", async () => {
    const root = await createFixtureRoot([
      "- id: day-001-to-day-009-systems",
      "  from_day: 1",
      "  target_day: 9",
      "  text: Systems thinking",
      "  status: pending",
      "  context: coherentism as web/system",
      "- id: day-001-to-day-009-systems",
      "  from_day: 2",
      "  target_day: 9",
      "  text: Systems thinking",
      "  status: pending",
      "  context: duplicate callback"
    ].join("\n"));

    await expect(readFutureLinksData(root)).rejects.toThrow(
      "duplicate future link id: day-001-to-day-009-systems"
    );
  });

  it("rejects future links that do not point forward", async () => {
    const root = await createFixtureRoot([
      "- id: day-009-to-day-001-systems",
      "  from_day: 9",
      "  target_day: 1",
      "  text: Systems thinking",
      "  status: pending",
      "  context: invalid backward callback"
    ].join("\n"));

    await expect(readFutureLinksData(root)).rejects.toThrow(
      "future link day-009-to-day-001-systems target_day must be greater than from_day"
    );
  });

  it("rejects future link ids that do not match their days", async () => {
    const root = await createFixtureRoot([
      "- id: day-001-to-day-009-systems",
      "  from_day: 2",
      "  target_day: 9",
      "  text: Systems thinking",
      "  status: pending",
      "  context: mismatched source day"
    ].join("\n"));

    await expect(readFutureLinksData(root)).rejects.toThrow(
      "future link day-001-to-day-009-systems id days must match from_day and target_day"
    );
  });

  it("rejects future link ids outside the canonical format", async () => {
    const root = await createFixtureRoot([
      "- id: day-9-callback",
      "  from_day: 1",
      "  target_day: 9",
      "  text: Systems thinking",
      "  status: pending",
      "  context: invalid id format"
    ].join("\n"));

    await expect(readFutureLinksData(root)).rejects.toThrow(
      "future link day-9-callback must use day-NNN-to-day-NNN id format"
    );
  });
});

async function createFixtureRoot(futureLinksYaml: string): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-future-links-data-"));
  await mkdir(path.dirname(futureLinksDataFile(root)), { recursive: true });
  await writeFile(futureLinksDataFile(root), `${futureLinksYaml}\n`);
  return root;
}
