# Refactor Review Set

This is the representative coverage set for the clean-break migration. It guides screenshots, EPUB/PDF inspections, and renderer spike samples. It is not a compatibility contract for URLs, filenames, layout, or pagination.

## Web Visual Continuity

Use these pages for near-identical web review across desktop, mobile, light theme, and dark theme:

| ID | Current Path | Why It Matters |
| --- | --- | --- |
| home-en | `/` | English landing shell, global navigation, hero, syllabus preview |
| home-zh | `/zh/` | Chinese landing shell, CJK typography, alternate-language navigation |
| syllabus-en | `/syllabus/` | Dense day-card grid and progress structure |
| syllabus-zh | `/zh/syllabus/` | Dense Chinese grid and locale-specific labels |
| downloads-en | `/downloads/` | Artifact links and download affordances |
| day-001-en | `/days/001-what-is-knowledge/` | Heaviest interactive day and deep-dive appendix source |
| day-001-zh | `/zh/days/001-what-is-knowledge/` | Chinese counterpart for heavy interactions |
| day-006-en | `/days/006-statistics-and-the-art-of-not-fooling-yourself/` | Statistics, math, charts, and appendix fallbacks |
| day-006-zh | `/zh/days/006-statistics-and-the-art-of-not-fooling-yourself/` | Chinese statistics/math rendering |
| day-007-en | `/days/007-information-theory/` | Information-theory figures and interaction variants |
| print-en | `/print/` | Standard full-book print source |
| print-deep-en | `/print-deep/` | Deep-dive full-book print source |
| print-zh | `/zh/print/` | Chinese standard print source |
| print-deep-zh | `/zh/print-deep/` | Chinese deep-dive print source |

## Artifact Inspection Set

Inspect these current artifacts before and after migration:

| ID | Current Artifact | Why It Matters |
| --- | --- | --- |
| epub-en | `_site/downloads/180-descent.epub` | English standard EPUB |
| epub-en-deep | `_site/downloads/180-descent-deep-dive.epub` | English deep-dive EPUB and appendix inclusion |
| epub-zh | `_site/downloads/180-descent-zh.epub` | Chinese standard EPUB |
| epub-zh-deep | `_site/downloads/180-descent-zh-deep-dive.epub` | Chinese deep-dive EPUB and appendix inclusion |
| pdf-en | `_site/downloads/180-descent.pdf` | English standard book PDF |
| pdf-en-deep | `_site/downloads/180-descent-deep-dive.pdf` | English deep-dive book PDF |
| pdf-zh | `_site/downloads/180-descent-zh.pdf` | Chinese standard book PDF |
| pdf-zh-deep | `_site/downloads/180-descent-zh-deep-dive.pdf` | Chinese deep-dive book PDF |
| day-001-pdf | `_site/downloads/180-descent-day-001-what-is-knowledge.pdf` | Per-day deep-dive PDF with many interaction fallbacks |
| day-006-pdf | `_site/downloads/180-descent-day-006-statistics-and-the-art-of-not-fooling-yourself.pdf` | Per-day math/statistics PDF |
| day-007-pdf | `_site/downloads/180-descent-day-007-information-theory.pdf` | Per-day information-theory PDF |

## PDF Renderer Spike Content

Every free renderer candidate gets a smoke attempt with:

- English prose: Day 1 core lesson excerpt.
- Chinese prose: Day 1 Chinese counterpart excerpt.
- Math/statistics: Day 6 formulas, charts, and explanatory notes.
- Image/SVG-heavy content: Days 6 and 7 figures.
- Interaction artifact variants: Day 1 and Day 6 static fallbacks.
- Sources and notes: Day 1 sources plus appendix source sections.
- Deep-dive appendix: Day 1 appendix sequence.

Only candidates that pass the smoke criteria advance to full representative samples.
