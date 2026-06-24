import { describe, expect, it } from "vitest";
import { checkPdf } from "@lib/checks/pdf";
import { createEmptyContentRoot, writePublishedDay } from "./helpers/content-root";

describe("pdf check helpers", () => {
  it("reports missing required artifacts without throwing", async () => {
    const root = await createEmptyContentRoot("180-pdf-missing-");

    const result = await checkPdf({ root });

    expect(result.errors).toContain("_site/downloads/180-descent.pdf is missing");
  });

  it("reports missing per-day artifacts", async () => {
    const root = await createEmptyContentRoot("180-pdf-day-missing-");
    await writePublishedDay(root);

    const result = await checkPdf({ root });

    expect(result.errors).toContain("_site/downloads/180-descent-day-001-fixture.pdf is missing");
    expect(result.errors).toContain("_site/downloads/180-descent-zh-day-001-fixture.pdf is missing");
  });
});
