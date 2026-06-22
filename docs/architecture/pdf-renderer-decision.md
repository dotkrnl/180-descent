# PDF Renderer Decision

Date: 2026-06-21

## Decision

Keep Playwright/Chromium as the durable PDF renderer for the current book pipeline.

This is a free/open-source renderer choice. The project still uses a dedicated Astro print surface plus the artifact book model as PDF input; Playwright is the final pagination and PDF emission engine.

## Smoke Matrix

Temporary smoke artifacts were generated outside the repository under `/tmp/180-descent-pdf-smoke-*` and were not committed. Each smoke used English prose, Chinese prose, a math expression, SVG/image content, a link, and a static interaction table. First-page PNGs were rendered with Poppler.

| Candidate | Version | Result | Notes |
| --- | --- | --- | --- |
| Pandoc + XeLaTeX | Pandoc 3.10, XeLaTeX from TeX Live | Pass | CJK and SVG worked after installing `librsvg` and using `Songti SC`. Math produced through the Pandoc path was visibly degraded for the smoke expression, so this would need a custom template/conversion path. |
| Tectonic | 0.16.9 | Pass | Math quality was good, but layout overflowed the interaction table without a maintained TeX template and explicit asset conversion rules. |
| Typst | 0.15.0 | Pass | Clean output and low operational weight. Adopting it would require a maintained MDX/component-to-Typst renderer parallel to the existing HTML artifact surface. |
| WeasyPrint | 69.0 | Pass | CJK, HTML/CSS, and SVG worked. Math quality was weak without separate KaTeX/MathML engineering, and CSS behavior differs from Chromium. |
| Vivliostyle CLI | via `npx @vivliostyle/cli` | Pass with CJK concern | HTML/CSS and SVG rendered, but the smoke output dropped most Chinese text, making it unsafe as the bilingual default without additional CJK work. |
| Playwright/Chromium | Playwright 1.60.0 | Pass | Preserved the same browser CSS, CJK behavior, SVG rendering, and artifact table behavior used by the current print pages. |

## Rationale

The dedicated typesetting engines remain credible future candidates, especially Typst and a custom TeX path. They are not selected now because they would add a second maintained renderer for MDX/component contracts before the artifact model has enough complexity to justify it.

Playwright wins for this refactor because it:

- keeps one print HTML/CSS surface for web-adjacent artifact layout;
- preserves current CJK behavior and project typography;
- supports the existing SVG, table, static interaction, and print CSS patterns;
- already passes the PDF checks for full-book, deep-dive, per-day, English, and Chinese outputs;
- avoids committing unselected renderer adapters, sample outputs, or spike scripts.

This decision should be revisited only if Playwright blocks book-quality typography, cross-reference behavior, CJK pagination, or maintainable print CSS. A future renderer change must replace this path cleanly rather than adding a parallel durable renderer.
