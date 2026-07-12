import { describe, expect, it } from "vitest";
import { normalizePdfGlyphs } from "@lib/artifacts/pdf/latex";

describe("PDF text normalization", () => {
  it("preserves diacritics in names", () => {
    const names = "Gödel, Fréchette, Erdős, Łukasiewicz, and Gaṅgeśa";

    expect(normalizePdfGlyphs(names.normalize("NFD"))).toBe(names);
  });
});
