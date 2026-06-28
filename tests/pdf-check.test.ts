import { describe, expect, it } from "vitest";
import { checkPdf } from "@lib/checks/pdf";
import { bookArtifactPaths, dayArtifactPaths } from "@lib/artifacts/downloads";
import { createEmptyContentRoot, writeContentDay } from "./helpers/content-root";

describe("pdf check helpers", () => {
  it("reports missing book artifacts", async () => {
    const root = await createEmptyContentRoot("180-pdf-missing-");

    const errors = await checkPdf({ root });

    expect(errors).toContain(`${bookArtifactPaths("pdf")[0]} is missing`);
  });

  it("reports missing per-day artifacts", async () => {
    const root = await createEmptyContentRoot("180-pdf-day-missing-");
    await writeContentDay(root);

    const errors = await checkPdf({ root });

    expect(errors).toContain(`${dayArtifactPaths("pdf", "en", ["001-fixture"])[0]} is missing`);
    expect(errors).toContain(`${dayArtifactPaths("pdf", "zh", ["001-fixture"])[0]} is missing`);
  });
});
