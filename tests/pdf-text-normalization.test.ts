import { describe, expect, it } from "vitest";
import { latexEscape, normalizePdfGlyphs } from "@lib/artifacts/pdf/latex";

describe("PDF text normalization", () => {
  it("preserves diacritics in names", () => {
    const names = "Gödel, Fréchette, Erdős, Łukasiewicz, and Gaṅgeśa";

    expect(normalizePdfGlyphs(names.normalize("NFD"))).toBe(names);
  });

  it("renders alphabetic isotope modifiers without relying on Unicode glyphs", () => {
    expect(latexEscape("Nₐ · ²²⁹ᵐTh")).toBe("N\\textsubscript{a} · \\textsuperscript{229}\\textsuperscript{m}Th");
  });

  it("renders inline square-root notation as LaTeX math", () => {
    expect(latexEscape("1/√N")).toBe("1/\\ensuremath{\\sqrt{N}}");
  });
});
