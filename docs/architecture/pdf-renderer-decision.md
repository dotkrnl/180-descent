# PDF Renderer Decision

Date: 2026-06-23

## Decision

Use XeTeX as the only durable PDF renderer.

The PDF pipeline now reads the same Astro/MDX registry as the site and EPUB builders, converts semantic MDX nodes and reusable lesson components into LaTeX, and emits PDFs with `latexmk -xelatex`. Browser print pages are no longer part of PDF generation, and no Playwright fallback or legacy PDF renderer remains.

## Source Contract

- `src/content/days/**/day.yaml` remains the canonical manifest for day number, path, block, localized metadata, appendices, assets, and artifact variants.
- `en.mdx`, `zh.mdx`, and appendix MDX files are the canonical prose sources.
- MDX should express content semantically through Markdown and lesson components.
- Print-only alternatives belong in semantic MDX components such as `FormatAlt` and `FormatOnly`; live web controls should not leak into PDF output.
- The XeTeX renderer maps text, headings, lists, blockquotes, tables, `MathInline`, `MathBlock`, `TipNote`, `StatusChip`, `SimpleTable`, and `ImageFigure` directly to LaTeX.

## Rationale

XeTeX is selected because it gives the project a proper book renderer instead of a browser screenshot pipeline:

- stable TeX pagination and typography for long-form book PDFs;
- first-class math rendering from the MDX math source rather than browser-rendered KaTeX boxes;
- direct Chinese font support through `xeCJK`;
- a semantic artifact path from MDX to LaTeX, making PDF behavior easier to reason about and test;
- a free/open-source toolchain available through TeX Live and Homebrew.

The PDF output should match the website's visual vocabulary: serif body text, restrained teal accents, boxed notes, table hierarchy, captions, and bilingual typography. It does not attempt to clone browser layout. TeX may choose better page breaks, float placement, line breaking, and table pagination.

## Required Tools

- `latexmk`
- `xelatex`
- `rsvg-convert` for SVG image conversion
- Poppler `pdftotext` for PDF text extraction during checks

`npm run preflight` checks these tools.

## Checks

`npm run check:pdf` validates the generated PDFs as XeTeX book artifacts:

- every expected book and day PDF exists and has a valid PDF header;
- PDFs have pages and extractable text;
- PDFs contain no annotations or local/staging day links;
- standard editions omit appendix content;
- deep-dive and day-specific editions include appendix content and labels;
- live interactive control text does not leak into deep-dive PDFs.

Browser-specific assertions such as full-bleed page background sampling and Playwright running-header stamping are intentionally retired.
