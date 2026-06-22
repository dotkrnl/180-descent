---
name: 180-descent-content
description: Add or edit The 180-Day Descent day content, appendices, and Chinese paired editions through the Astro/MDX registry model.
---

# 180 Descent Content Workflow

Use this workflow for new days, day edits, deep-dive appendices, and Chinese paired content.

## Source Model

Each published day lives under `src/content/days/###-slug/`.

- `day.yaml` is the typed manifest: day number, URL path, block, publish state, locale metadata, appendices, components, assets, and artifact variants.
- `en.mdx` and `zh.mdx` are the main bodies.
- `appendices/*.en.mdx` and `appendices/*.zh.mdx` are optional deep-dive bodies declared by manifest id.
- Shared lesson components live in `src/app/components/lesson/`.
- Live interaction modules live in `src/assets/js/interactions/` and are registered through `day.yaml` `components[].webEntry`.
- Asset files live under `src/assets/images/...` and are declared in `day.yaml` `assets`.

Do not bulk-copy source HTML into project content. Convert material manually, case by case, into the manifest and MDX structure. Preserve meaning, citations, ids/classes used by interactions, accessibility labels, and static artifact variants deliberately.

## Day Changes

1. Pick the canonical `###-slug` path from the syllabus and create or edit `src/content/days/###-slug/day.yaml`.
2. Keep English and Chinese locale entries paired when the day is published. If a locale is intentionally absent, its manifest status must explain that state through the existing schema values.
3. Put page title, summary, block, threads, appendices, components, and assets in `day.yaml`; do not duplicate routing metadata elsewhere.
4. Write lesson bodies as MDX. Import lesson components explicitly at the top of each MDX file, for example `TipNote`, `MathInline`, `MathBlock`, or `StatusChip`.
5. Use stable ids and classes for diagrams and controls. When adding a live component, add a matching manifest component with `webEntry` plus `artifactVariants.epub` and `artifactVariants.pdf`.
6. Keep artifact variants purposeful. EPUB/PDF may drift from the live web component when the static form is clearer, but HTML should stay visually consistent with the intended web design.
7. Run `npm run build:social-cards` when titles or summaries change.

## Appendices

Appendices are declared in `day.yaml` under `appendices`.

- Give each appendix a stable `id`.
- Add locale-specific body paths and titles.
- Keep optional appendix content inside the appendix MDX file, not hidden in the main day body.
- Include static PDF/EPUB equivalents for any web-only controls.
- Verify the appendix appears only in deep-dive/full-day artifact editions.

## Chinese Edition

Chinese content should be idiomatic Simplified Chinese, not literal line-by-line English.

- Preserve manifest structure, day numbers, path, citations, URLs, DOI metadata, ids, classes, data attributes, SVG structure, tables, image alt meaning, and interaction hooks.
- Keep terminology consistent across existing Chinese days.
- Prefer natural Chinese rhythm and punctuation. Use Chinese quotes for quoted propositions and titles where appropriate.
- Avoid dense emphasis in Chinese prose. Use terminology styling and sparse color emphasis only when it clarifies structure.
- Kimi, Gemini, and GLM review passes can be slow. When invoked, let them finish unless the process exits or the user explicitly stops it.
- Review AI edits manually before accepting: factual accuracy, terminology, formatting, component parity, and artifact behavior.

## Verification

For content-only changes, run:

```sh
npm run typecheck
npm run test
npm run build
npm run check
```

For focused edits, run the narrow checks first:

```sh
npm run check:content
npm run check:math
npm run check:appendix-style
npm run check:links
```

For asset or artifact changes, also inspect EPUB/PDF outputs:

```sh
npm run check:epub
npm run check:pdf
```

Do not deploy from this workflow unless the user explicitly asks for deployment.
