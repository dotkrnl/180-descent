import { describe, expect, it } from "vitest";
import { checkPdf } from "@lib/checks/pdf";
import { bookArtifactName, dayArtifactName, downloadArtifactPath } from "@lib/artifacts/downloads";
import { createEmptyContentRoot, writeContentDay } from "./helpers/content-root";

describe("pdf check helpers", () => {
  it("reports missing required artifacts without throwing", async () => {
    const root = await createEmptyContentRoot("180-pdf-missing-");

    const result = await checkPdf({ root });

    expect(result.errors).toContain(`${downloadArtifactPath(bookArtifactName("pdf", "en", false))} is missing`);
  });

  it("reports missing per-day artifacts", async () => {
    const root = await createEmptyContentRoot("180-pdf-day-missing-");
    await writeContentDay(root);

    const result = await checkPdf({ root });

    expect(result.errors).toContain(`${downloadArtifactPath(dayArtifactName("pdf", "en", "001-fixture"))} is missing`);
    expect(result.errors).toContain(`${downloadArtifactPath(dayArtifactName("pdf", "zh", "001-fixture"))} is missing`);
  });
});
