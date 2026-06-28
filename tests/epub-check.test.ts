import { describe, expect, it } from "vitest";
import { checkEpub } from "@lib/checks/epub";
import { bookArtifactPaths, dayArtifactPaths } from "@lib/artifacts/downloads";
import { createEmptyContentRoot, writeContentDay } from "./helpers/content-root";

describe("epub check helpers", () => {
  it("reports missing required artifacts without throwing", async () => {
    const root = await createEmptyContentRoot("180-epub-missing-");

    const result = await checkEpub({ root });

    expect(result.errors).toContain(`${bookArtifactPaths("epub")[0]} is missing`);
  });

  it("reports missing per-day artifacts", async () => {
    const root = await createEmptyContentRoot("180-epub-day-missing-");
    await writeContentDay(root);

    const result = await checkEpub({ root });

    expect(result.errors).toContain(`${dayArtifactPaths("epub", "en", ["001-fixture"])[0]} is missing`);
    expect(result.errors).toContain(`${dayArtifactPaths("epub", "zh", ["001-fixture"])[0]} is missing`);
  });
});
