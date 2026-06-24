---
name: 180-descent
description: Add, edit, verify, commit, deploy, and visually review The 180-Day Descent website, EPUB, and PDF from the unified Astro/MDX source model.
---

# 180 Descent Workflow

Use this workflow for any project work: day content, appendices, reusable lesson
components, paired Chinese editions, bundled assets, generated artifacts,
publishing, and visual comparison.

## Source Model

Each published day lives under `src/content/days/###-slug/`.

- `day.yaml` is the typed manifest: day number, URL path, block, publish state,
  locale metadata, appendices, components, assets, and artifact variants.
- `en.mdx` and `zh.mdx` are the paired main bodies.
- `appendices/*.en.mdx` and `appendices/*.zh.mdx` are optional paired deep-dive
  bodies declared by manifest id.
- Shared prose/layout components live in `src/app/components/lesson/`.
- Reusable static figures live in `src/app/components/lesson/figures/`.
- Reusable web interactives live in `src/app/components/lesson/interactives/`.
- Interaction behavior lives in `src/assets/js/interactions/` and is registered
  through `day.yaml` `components[].webEntry`.
- Asset files live under `src/assets/images/...` and are declared in
  `day.yaml` `assets`.
- Styling is SCSS-only. Astro layouts import `src/assets/scss/book.scss`; edit
  SCSS modules under `src/assets/scss/`, not hand-written `.css` files.

Do not bulk-copy source HTML into project content. Convert material manually,
case by case, into MDX plus reusable Astro components. Preserve meaning,
citations, accessibility labels, artifact variants, and bilingual parity
deliberately.

MDX may use imported components and ordinary Markdown/MDX prose. Do not use raw
HTML as a formatting shortcut; use Markdown, existing lesson components, or a
small reusable component when inline JSX must wrap another component. MDX must
not own raw interactive controls, canvas, behavior ARIA roles, inline event
handlers, or action/state data hooks. Put those contracts inside
`lesson/interactives` components and let `npm run check:content` enforce the
boundary.

## Day Changes

1. Pick the canonical `###-slug` path from the syllabus and create or edit
   `src/content/days/###-slug/day.yaml`.
2. Keep English and Chinese locale entries paired when the day is published. If
   a locale is intentionally absent, its manifest status must explain that state
   through the existing schema values.
3. Put page title, summary, block, threads, appendices, components, and assets
   in `day.yaml`; do not duplicate routing metadata elsewhere.
4. Write lesson bodies as real MDX. Import lesson components explicitly at the
   top of each MDX file.
5. Extract repeated or behavior-bearing markup into Astro components. Keep
   one-off diagrams readable; move reusable SVGs, complex markup, or any
   interaction-bearing DOM into a lesson component.
6. Use stable ids and classes inside the reusable component that owns the DOM
   contract. When adding a live component, add a matching manifest component with
   `webEntry` plus `artifactVariants.epub` and `artifactVariants.pdf`.
7. Keep artifact variants purposeful. EPUB/PDF may drift from the live web
   component when the static form is clearer, but HTML should stay visually
   consistent with the intended web design.
8. Run `npm run build:social-cards` when titles or summaries change.

For a new published day, the minimum source set is:

- `src/content/days/###-slug/day.yaml`
- `src/content/days/###-slug/en.mdx`
- `src/content/days/###-slug/zh.mdx`
- Optional paired appendices under `src/content/days/###-slug/appendices/*.en.mdx`
  and `*.zh.mdx`

## Appendices

Appendices are declared in `day.yaml` under `appendices`.

- Give each appendix a stable `id`.
- Add locale-specific body paths and titles.
- Keep optional appendix content inside the appendix MDX file, not hidden in the
  main day body.
- Include static PDF/EPUB equivalents for any web-only controls.
- Verify the appendix appears only in deep-dive/full-day artifact editions.
- Standard EPUB/PDF outputs omit appendices; deep-dive EPUB/PDF outputs include
  them.

## Components And Styles

- Prefer existing components before adding new ones.
- Add a component only when it removes real duplication, owns a behavior
  contract, or makes MDX materially more readable.
- Put static lesson visuals with inline SVG or complex markup in
  `src/app/components/lesson/figures/`.
- Put controls, sliders, buttons, generated SVG roots, and DOM hooks in
  `src/app/components/lesson/interactives/`.
- Keep JavaScript behavior separate in `src/assets/js/interactions/`; avoid
  inline scripts in content.
- Add or adjust styles in SCSS modules imported by `book.scss`. Do not add
  component-local `.css`, duplicate `book.css`, browser-print PDF styles, or
  one-off generated CSS.
- Do not add parallel adapter layers, blind importers, alternate source trees, or
  split project workflow skills. `npm run check:clean` blocks committed
  generated output, and `npm run check:workflows` enforces the single project
  workflow.
- PDF output is generated from semantic MDX through XeTeX. When a live web
  component is not suitable for print, provide a semantic `FormatOnly` print
  alternative instead of relying on DOM controls.

## Assets

- Prefer original diagrams built as reusable Astro figure or interactive
  components using SVG/HTML and SCSS.
- Use open-license, public-domain, Creative Commons, or official-source images
  only when they clarify the lesson and reuse is allowed.
- Do not hotlink external images.
- Download the source for conversion, but do not commit multi-megabyte originals.
- Place committed assets under `src/assets/images/...`.
- Resize and compress JPEG/WebP assets to real display needs. Aim for roughly
  100-200 KB per image when quality permits; use larger files only when the
  image carries important inspectable detail.
- Keep `width` and `height` attributes aligned with compressed asset dimensions.
- Update `src/_data/credits.yaml` for every added third-party asset: creator,
  title/description, source URL, license name/version, local asset path, and
  whether it was modified.
- Do not hand-edit generated social-card PNGs under
  `src/assets/images/social/`; they are ignored first-party build output from
  registry manifests.

Every committed image that appears in lesson, page, EPUB, or PDF output must
have an `alt` attribute at each markup use site. Write concise descriptive alt
text for informative images. Use `alt=""` only when the image is purely
decorative or adjacent text/caption fully duplicates the image's accessible
purpose. Translate Chinese alt text idiomatically while preserving the same
factual meaning.

Always check dark theme rendering when adding or changing an image, SVG, figure
frame, caption surface, card, or visual component. Prefer theme-token-driven
SVG/HTML/SCSS diagrams.

## Artifact Handling

- Use MDX/Astro imports for images rendered on site pages so Astro emits final
  `/_astro/...` URLs. Do not restore a `public/assets` mirror or hand-code
  public `/assets/images/...` URLs for page output.
- Use `/assets/images/...` only as the local source-path convention in
  `src/_data/credits.yaml`, day manifests, and artifact code that resolves back
  to `src/assets/images/...`.
- `npm run build:epub` must resolve local source image paths into
  `OEBPS/images/...` and add image manifest entries to `content.opf`.
- PDF generation reads semantic MDX and builds with XeTeX. `ImageFigure` sources
  backed by committed JPEG/PNG/PDF assets are included directly; SVGs are
  converted with `rsvg-convert`.
- If a PDF caption appears but the picture does not, check the MDX image import,
  the resolved asset path, and the XeTeX build log before changing lesson markup.
- Keep `npm run check:epub` guarding against absolute or missing EPUB image
  paths.
- Keep `npm run check:pdf` focused on artifact correctness: valid
  non-interactive PDFs, Poppler-extractable text, appendix inclusion rules, no
  local links, and no live interactive control leakage.

## PDF Notes

- Treat `src/lib/artifacts/pdf/xetex.ts` as the PDF renderer contract. It
  consumes semantic MDX, selected Astro-rendered figure components, inline SVG,
  Markdown tables, fenced code blocks, math components, and common lesson
  components.
- Keep diagrams source-of-truth in MDX/Astro/SVG. Reusable complex figures
  should live in `lesson/figures/`; one-off semantic SVG diagrams may remain
  inline in MDX because the PDF renderer converts `svg` nodes through
  `rsvg-convert`. Do not reimplement the same diagram separately in TeX.
- Use real fenced code blocks for code or pseudocode. The PDF renderer gives
  them a styled `codebox`; do not fake code with ad hoc HTML grids or
  paragraphs.
- Use `MathInline` and `MathBlock` for math so HTML gets KaTeX and PDF gets
  XeTeX math from the same source.
- For web interactives, keep behavior in the interactive component and provide a
  clear static PDF/EPUB representation with `FormatOnly` or manifest artifact
  variants. Static artifact output may drift from the live web component when it
  improves readability.
- For PDF-affecting edits, run `npm run build:pdf` and `npm run check:pdf`. When
  changing PDF renderer, figure, table, code, or source-block behavior, also
  preserve logs with `PDF_KEEP_TEMP=1 npm run build:pdf` and scan for
  `Overfull`, `Missing character`, and font warnings.
- Visual review scope: for global renderer/style changes, sample at least 20
  pages from each full PDF (`180-descent`, `180-descent-deep-dive`,
  `180-descent-zh`, `180-descent-zh-deep-dive`). For individual day PDFs, first
  and last page are sufficient unless the changed day contains a new figure,
  table, code block, or interactive print alternative; then inspect the affected
  interior page too.

## Chinese Edition

Chinese content should be idiomatic Simplified Chinese, not literal
line-by-line English.

- Preserve manifest structure, day numbers, path, citations, URLs, DOI metadata,
  component imports, image alt meaning, and interaction behavior.
- Localize block titles and print labels through existing data/components; do not
  hard-code English labels into Chinese print surfaces.
- Translate image `alt`, SVG `aria-label`, captions, panel titles, status-chip
  print labels, figure labels, and static table headings.
- Import the same reusable figure or interactive component used by English, with
  localized props or localized component data when needed.
- Add Chinese-specific styling only through existing SCSS modules, especially
  `src/assets/scss/content/_zh.scss`, unless a shared style is more appropriate.
- Keep terminology consistent across existing Chinese days.
- Prefer natural Chinese rhythm and punctuation. Use Chinese quotes for quoted
  propositions and titles where appropriate.
- Avoid dense emphasis in Chinese prose. Use terminology styling and sparse
  color emphasis only when it clarifies structure.
- Kimi, Gemini, and GLM review passes can be slow. When invoked, let them finish
  unless the process exits or the user explicitly stops it.
- Review AI edits manually before accepting: factual accuracy, terminology,
  formatting, component parity, and artifact behavior.

## Human Refinement Gate

Use this gate after implementation, translation, checks, and artifact inspection
are otherwise complete, and before commit/push/deploy unless the user explicitly
asks to publish immediately.

1. Start the local dev server if it is not already running:

```sh
npm run dev -- --port 8080
```

If port 8080 is unavailable, use another local port and tell the user the URL.

2. Ask the user to review relevant English/Chinese pages in the local browser.
   The localhost-only Codex refiner appears when they select page text. Accepted
   refinements must write back through the local dev server, not remain DOM-only
   edits.
3. If selected text cannot be found uniquely in source, patch manually or adjust
   the selected range, refresh, and verify.
4. After the user says the refinement pass is done, check `git status -sb` and
   inspect the source diff. Confirm refinements are in tracked source files under
   `src/` or workflow files, never only `_site/`.
5. Rebuild and rerun checks after accepted refinements.

## Publish

1. Inspect current branch and diff:

```sh
git branch --show-current
git status --short
git diff --stat
```

2. Run:

```sh
npm run check
```

`npm run check` rebuilds all generated assets and download artifacts, then runs
all validators, including SEO, accessibility, EPUB, PDF, and repository
cleanliness.

3. Stage only intended files. Never stage unrelated user changes.
4. Commit with a Conventional Commit message, e.g.
   `feat: add open-license lesson images`.
5. Push the current branch:

```sh
git push origin HEAD
```

6. Deploy only when the user asks for deployment.

For production:

```sh
npm run deploy
```

For staging:

```sh
npm run deploy:staging
```

7. When asked to visually compare, compare
   `https://staging.180-descent.pages.dev` against `https://180d.io` after the
   staging deploy finishes. Cover every generated route in both English and
   Chinese at desktop and mobile widths. At minimum, check HTTP status, `lang`,
   title, H1, text/content drift, scroll height, horizontal overflow, and
   screenshots at top/middle/bottom scroll positions for long pages.
8. Treat structural mismatches, language/title/H1 mismatches, horizontal
   overflow, broken math, missing Chinese font behavior, and untranslated
   Chinese print labels as regressions. Distinguish expected content drift from
   visual degradation when staging intentionally includes newer content than
   production.
9. Report commit hash, branch, push result, deploy URL or deployment status,
   visual comparison scope, and any residual risks.

Do not edit generated files in `_site/`; they are build outputs.

## Verification

For focused edits, run the narrow checks first:

```sh
npm run typecheck
npm test
npm run check:content
npm run check:math
npm run check:appendix-style
npm run check:links
npm run check:clean
npm run check:workflows
```

For asset, artifact, global renderer, or release-bound changes, run:

```sh
npm run check
```

For every affected PDF page, render the page to PNG with Poppler and visually
confirm the expected output. Do not trust caption text alone.

For EPUB image changes, inspect the zip:

```sh
unzip -l _site/downloads/<file>.epub | rg 'OEBPS/images|image-name'
unzip -p _site/downloads/<file>.epub OEBPS/content.opf | rg 'image-name|image/jpeg|image/png|image/webp'
```
