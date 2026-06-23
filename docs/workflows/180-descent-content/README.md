---
name: 180-descent-content
description: Add or edit The 180-Day Descent day content, appendices, reusable lesson components, and Chinese paired editions through the Astro/MDX registry model.
---

# 180 Descent Content Workflow

Use this workflow for new days, day edits, reusable lesson components, deep-dive appendices, and Chinese paired content.

## Source Model

Each published day lives under `src/content/days/###-slug/`.

- `day.yaml` is the typed manifest: day number, URL path, block, publish state, locale metadata, appendices, components, assets, and artifact variants.
- `en.mdx` and `zh.mdx` are the main bodies.
- `appendices/*.en.mdx` and `appendices/*.zh.mdx` are optional deep-dive bodies declared by manifest id.
- Shared prose/layout components live in `src/app/components/lesson/`.
- Reusable static figures live in `src/app/components/lesson/figures/`.
- Reusable web interactives live in `src/app/components/lesson/interactives/`.
- Interaction behavior lives in `src/assets/js/interactions/` and is registered through `day.yaml` `components[].webEntry`.
- Asset files live under `src/assets/images/...` and are declared in `day.yaml` `assets`.
- Styling is SCSS-only. Astro layouts import `src/assets/scss/book.scss`; edit SCSS modules under `src/assets/scss/`, not hand-written `.css` files.

Do not bulk-copy source HTML into project content. Convert material manually, case by case, into MDX plus reusable Astro components. Preserve meaning, citations, accessibility labels, and static artifact variants deliberately.

MDX may use imported components and ordinary Markdown/MDX prose, but it must not own raw interactive controls, canvas, behavior ARIA roles, inline event handlers, or action/state data hooks. Put those contracts inside `lesson/interactives` components and let `npm run check:content` enforce the boundary.

## Day Changes

1. Pick the canonical `###-slug` path from the syllabus and create or edit `src/content/days/###-slug/day.yaml`.
2. Keep English and Chinese locale entries paired when the day is published. If a locale is intentionally absent, its manifest status must explain that state through the existing schema values.
3. Put page title, summary, block, threads, appendices, components, and assets in `day.yaml`; do not duplicate routing metadata elsewhere.
4. Write lesson bodies as real MDX. Import lesson components explicitly at the top of each MDX file, for example `Hero`, `TipNote`, `MathInline`, `MathBlock`, `StatusChip`, `SimpleTable`, `ImageFigure`, a figure component, or an interactive component.
5. Extract repeated or behavior-bearing markup into Astro components. Keep raw HTML in MDX only when it is genuinely semantic prose markup that has no existing component and no interaction behavior.
6. Use stable ids and classes inside the reusable component that owns the DOM contract. When adding a live component, add a matching manifest component with `webEntry` plus `artifactVariants.epub` and `artifactVariants.pdf`.
7. Keep artifact variants purposeful. EPUB/PDF may drift from the live web component when the static form is clearer, but HTML should stay visually consistent with the intended web design.
8. Run `npm run build:social-cards` when titles or summaries change.

For a new published day, the minimum source set is:

- `src/content/days/###-slug/day.yaml`
- `src/content/days/###-slug/en.mdx`
- `src/content/days/###-slug/zh.mdx`
- Optional paired appendices under `src/content/days/###-slug/appendices/*.en.mdx` and `*.zh.mdx`

## Appendices

Appendices are declared in `day.yaml` under `appendices`.

- Give each appendix a stable `id`.
- Add locale-specific body paths and titles.
- Keep optional appendix content inside the appendix MDX file, not hidden in the main day body.
- Include static PDF/EPUB equivalents for any web-only controls.
- Verify the appendix appears only in deep-dive/full-day artifact editions.
- Standard EPUB/PDF outputs omit appendices; deep-dive EPUB/PDF outputs include them.

## Components And Styles

- Prefer existing components before adding new ones.
- Add a component only when it removes real duplication, owns a behavior contract, or makes MDX materially more readable.
- Put static lesson visuals with inline SVG or complex markup in `src/app/components/lesson/figures/`.
- Put controls, sliders, buttons, generated SVG roots, and DOM hooks in `src/app/components/lesson/interactives/`.
- Keep JavaScript behavior separate in `src/assets/js/interactions/`; avoid inline scripts in content.
- Add or adjust styles in SCSS modules imported by `book.scss`. Do not add component-local `.css`, legacy `book.css`, fallback CSS, or migration-only styles.
- Do not add compatibility shims, legacy importers, or fallback paths. `npm run check:clean` blocks retired static-site paths and blind HTML importers.

## Chinese Edition

Chinese content should be idiomatic Simplified Chinese, not literal line-by-line English.

- Preserve manifest structure, day numbers, path, citations, URLs, DOI metadata, component imports, image alt meaning, and interaction behavior.
- Localize block titles and print labels through existing data/components; do not hard-code English labels into Chinese print surfaces.
- Translate image `alt`, SVG `aria-label`, captions, panel titles, status-chip print labels, figure labels, and static table headings.
- Import the same reusable figure or interactive component used by English, with localized props or localized component data when needed.
- Add Chinese-specific styling only through existing SCSS modules, especially `src/assets/scss/content/_zh.scss`, unless a shared style is more appropriate.
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
npm run check:clean
```

For asset or artifact changes, also inspect EPUB/PDF outputs:

```sh
npm run check:epub
npm run check:pdf
```

Do not deploy from this workflow unless the user explicitly asks for deployment.
