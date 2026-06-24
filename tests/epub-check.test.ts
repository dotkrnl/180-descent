import { describe, expect, it } from "vitest";
import { checkEpub } from "@lib/checks/epub";
import { createEmptyContentRoot, writePublishedDay } from "./helpers/content-root";

describe("epub check helpers", () => {
  it("reports missing required artifacts without throwing", async () => {
    const root = await createEmptyContentRoot("180-epub-missing-");

    const result = await checkEpub({ root });

    expect(result.errors).toContain("_site/downloads/180-descent.epub is missing");
  });

  it("reports missing per-day artifacts", async () => {
    const root = await createEmptyContentRoot("180-epub-day-missing-");
    await writePublishedDay(root);

    const result = await checkEpub({ root });

    expect(result.errors).toContain("_site/downloads/180-descent-day-001-fixture.epub is missing");
    expect(result.errors).toContain("_site/downloads/180-descent-zh-day-001-fixture.epub is missing");
  });
});
