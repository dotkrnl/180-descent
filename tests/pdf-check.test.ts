import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkPdf } from "@lib/checks/pdf";
import { bookArtifactPaths, dayArtifactPaths } from "@lib/artifacts/downloads";
import { createEmptyContentRoot, writeContentDay } from "./helpers/content-root";

describe("pdf check helpers", () => {
  it("reports missing book artifacts", async () => {
    const root = await createEmptyContentRoot("180-pdf-missing-");

    const errors = await checkPdf({ root });

    expect(errors).toContain(`${bookArtifactPaths("pdf")[0]} is missing`);
    expect(errors).not.toContain("English PDF is missing core text matching /The Scientific Method/i");
  });

  it("reports missing per-day artifacts", async () => {
    const root = await createEmptyContentRoot("180-pdf-day-missing-");
    await writeContentDay(root);

    const errors = await checkPdf({ root });

    expect(errors).toContain(`${dayArtifactPaths("pdf", "en", ["001-fixture"])[0]} is missing`);
    expect(errors).toContain(`${dayArtifactPaths("pdf", "zh", ["001-fixture"])[0]} is missing`);
  });

  it("reports invalid PDF artifacts without throwing", async () => {
    const root = await createEmptyContentRoot("180-pdf-invalid-");
    const artifact = bookArtifactPaths("pdf")[0];
    const artifactPath = path.join(root, artifact);
    await mkdir(path.dirname(artifactPath), { recursive: true });
    await writeFile(artifactPath, "not a pdf");

    const errors = await checkPdf({ root });

    expect(errors).toContain(`${artifact} does not start with a PDF header`);
    expect(errors).not.toContain("English PDF is missing core text matching /The Scientific Method/i");
  });
});
