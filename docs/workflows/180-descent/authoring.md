# Authoring and Artifact Contracts

## Source Model

Each published day lives under `src/content/days/###-slug/`. The directory
name is the canonical URL path, and the manifest `day` number must match the
three-digit directory prefix.

- `day.yaml` is the strict typed manifest: day number, block, locale metadata,
  appendices, and interaction scripts.
- `en.mdx` and `zh.mdx` are the paired main bodies.
- `appendices/<id>.en.mdx` and `appendices/<id>.zh.mdx` are optional paired
  deep-dive bodies; `<id>` must match the manifest appendix id.
- Shared prose/layout components live in `src/app/components/lesson/`.
- Reusable static figures live in `src/app/components/lesson/figures/`.
- Reusable web interactives live in `src/app/components/lesson/interactives/`.
- Interaction behavior lives in `src/assets/js/interactions/` and is registered
  through `day.yaml` `interactionScripts`.
- Asset files live under `src/assets/images/...` and are imported directly from
  MDX/Astro or resolved by artifact code.
- Styling is SCSS-only. Astro layouts import `src/assets/scss/book.scss`; edit
  SCSS modules under `src/assets/scss/`, not hand-written `.css` files.

Treat prose-bearing values in `src/_data/*.yaml` as published product copy, not
as an authoring scratchpad. Use natural reader-facing language and sentence
case. Do not leak bracketed status markers, drafting commands such as `keep as`
or `flag`, callback notes, uppercase directives, TODOs, or review state into
titles and descriptions. Represent machine state through typed schema fields or
components; keep temporary editorial notes outside published source data.
Localized syllabus titles must agree with their day manifests, and availability
or edition-count claims must be derived from the published registry rather than
assuming that all 180 planned lessons already exist.

Do not bulk-copy source HTML into project content. Convert material manually,
case by case, into MDX plus reusable Astro components. Preserve meaning,
citations, accessibility labels, static artifact equivalents, and bilingual parity
deliberately.

## Day Changes

1. Pick the canonical `###-slug` path from the syllabus and create or edit
   `src/content/days/###-slug/day.yaml`.
2. Keep English and Chinese locale entries paired when the day is published.
3. Put page title, summary, block, appendices, and interaction scripts in
   `day.yaml`; keep the manifest `day` number synchronized with the directory
   prefix, and do not duplicate slug routing metadata inside the manifest.
4. Write lesson bodies as real MDX. Import lesson components explicitly at the
   top of each MDX file.
5. Extract repeated or behavior-bearing markup into Astro components. Keep
   one-off diagrams readable; move reusable SVGs, complex markup, or any
   interaction-bearing DOM into a lesson component.
6. Check prior published days before introducing technical vocabulary. If a term
   has not already been explained in the course or is first introduced in this
   day/appendix without a plain same-sentence definition, wrap the first visible
   use with `Term` and add an adjacent `TipNote`. Keep notes concise,
   factual, bilingual, and artifact-safe; do not add tooltips to ordinary words
   or terms fully explained by the surrounding sentence.
7. Use stable ids and classes inside the reusable component that owns the DOM
   contract. When adding live behavior, add its bundle name to
   `interactionScripts`.
8. Keep static artifact equivalents purposeful. EPUB/PDF may drift from the live
   web component when the static form is clearer, but HTML should stay visually
   consistent with the intended web design.
9. For any original-source integration, including edits to existing days or
   appendices, apply the Original-source completeness review gate below after
   English MDX integration and again after Chinese translation/localization. Do
   not treat either stage as complete until content-completeness and
   visual-completeness review findings are resolved or explicitly rejected
   with a reason.
10. Run `npm run build:social-cards` when titles or summaries change.

For a new published day, the minimum source set is:

- `src/content/days/###-slug/day.yaml`
- `src/content/days/###-slug/en.mdx`
- `src/content/days/###-slug/zh.mdx`
- Optional paired appendices under `src/content/days/###-slug/appendices/*.en.mdx`
  and `*.zh.mdx`

### New Day Acceptance Gate

Do not treat a newly added day as done until all of these are true. This gate is
mandatory even when `npm run check` passes; automated checks catch
structural errors, not publication quality.

1. **Source parity:** compare `day.yaml`, English MDX, Chinese MDX, and every
   declared appendix pair. Confirm every appendix listed in the manifest has
   both locale bodies, both bodies are imported/rendered, and the web page
   exposes each appendix in the intended order.
2. **Chinese flow completed:** clear stale Chinese target prose before
   translation, then initialize each target Chinese file from a direct,
   untranslated copy of its paired English source. Keep translation and blind
   review as separate passes, with a reviewer who did not produce the translation.
   Do not treat either pass as complete until terminology, quote style, status
   labels, figure labels, alt text, static-artifact prose, and all actionable
   review findings have been resolved.
3. **Original-source completeness review:** when integrating from an original
   HTML/static file, design mock, external draft, or user-provided source,
   preserve the original source path in the working notes and run independent
   review before treating the MDX integration as complete. Use at least two
   read-only review passes: one focused on content completeness and one focused
   on visual completeness. The content reviewer must compare the
   original source against the integrated English MDX, rendered HTML, and
   affected artifact pages, looking for missing sections, edge-case
   elaboration, tables, captions, citations, source links, caveats, alt text,
   static alternates, appendix content, and connective prose. The visual
   reviewer must compare the original visual intent against the integrated web
   and PDF/EPUB output, looking for lost diagrams, weak table treatment,
   missing padding, collapsed cards, changed hierarchy, label overlap, mobile
   regressions, orphaned print pages, and degraded figure/table density. After
   Chinese translation and localization, repeat both reviews against
   the translated Chinese MDX/rendered output, using the finalized English MDX
   and original source as references for meaning, structure, visual completeness,
   localized labels, and artifact parity. Integrate actionable findings before
   final checks; do not mark the day complete merely because automated checks
   pass.
4. **Image options offered:** show the user relevant open-license,
   public-domain, Creative Commons, or official-source image options with title,
   creator, source, license, and proposed placement. Add selected images as
   optimized local assets with credits, alt text, and bilingual captions, or
   record that the options were declined or unsuitable.
5. **Interactives inventory:** make a list of every imported web-only
   interactive in the main lesson and appendices. For each one, verify it
   renders on the web, is registered in `WEB_ONLY_COMPONENTS`, has a localized
   `FormatOnly media="print-epub" variant="alternate"` block, and initializes
   only when visible on screen.
6. **Static artifact equivalence:** a print/EPUB alternate for an interactive
   must be a real static explanation, not a placeholder. If the live widget's
   teaching value is visual, include a static SVG/table/diagram that shows the
   relevant state, curve, grid, or comparison. The text-only summary may
   accompany the figure but must not be the only substitute.
7. **Figure renderer contract:** every reusable SVG figure used in MDX must be
   PDF-safe. Avoid relying only on external SCSS for fill, stroke, font size, or
   text positioning; include self-contained SVG styling or literal attributes
   for anything that must survive `rsvg-convert`. Register complex Astro figure
   components in `SVG_COMPONENTS` when the PDF renderer needs to extract them
   from rendered HTML.
8. **Tooltip discipline:** check prior published days before adding `Term` /
   `TipNote`. Tooltip only the first visible use of an unexplained technical
   concept. Do not tooltip a term immediately followed by its own plain
   definition in prose.
9. **Hype-filter discipline:** status tags must use `StatusChip`, stay short,
   and push caveats into prose. Use the visible chip label for the short subject
   only, then encode the verdict through `status` color and `printLabel`; prefer
   `Metric` with `printLabel="established"` over `Metric · established`.
   Frontier claim blocks must use the established claim/status components so
   labels do not degrade to plain text.
10. **Lexical discipline:** do not lean on `honest`, `honestly`, `honesty`,
   `sober`, or `sobering` as generic signals of rigor, restraint, or seriousness.
   Replace them with the specific meaning required by the sentence: `accurate`,
   `complete`, `calibrated`, `careful`, `warranted`, `strict`, `restrained`,
   `unsettling`, `relevant`, or another precise word. In Chinese, do not default
   to `诚实` or `冷静`; prefer context-specific choices such as `准确`, `完整`,
   `稳妥`, `严格`, `克制`, `校准`, `审慎`, or `相关`. Preserve proper names,
   source titles, and exact quotations.
11. **Edge-section structure:** frontier/edge sections should use `Claim` with a
   compact `ClaimHeader` eyebrow (`Edge 01`, `前沿 01`, etc.) and the descriptive
   title as the following heading. Do not pack the title into the eyebrow label,
   and do not wrap ordinary edge prose in `Panel`/`PanelNote`; reserve boxes for
   genuine callouts, static alternates, captions, and interactive notes.
12. **No source-hygiene editor notes:** do not publish meta notes narrating
   drafting/source-vetting process, such as discarded future-dated arXiv IDs or
   claims that sources were checked. Put evidence status in the actual citation,
   `Meta`, `SourceNote`, or claim prose instead.
13. **Mobile typography:** inspect the main page on a narrow mobile viewport.
   SVG text, status chips, buttons, and long English titles must not overlap,
   shrink below legibility, or run into frames. The mobile rendered-type gate is
   a floor, not a substitute for visual review.
14. **Artifact visual review:** after `npm run build:site` and
   `npm run build:pdf`,
   render every affected day PDF page to PNG with Poppler: page 1, every page
   containing a new figure/table/interactive alternate, and the last page. Check
   both English and Chinese. Look for black rectangles, missing figures, wrong
   repeated diagrams, clipped text, label/frame overlap, stale English in
   Chinese artifacts, and orphaned headings.
15. **Deployed verification:** after deployment, fetch the deployed day PDFs
    from the preview URL, render the same representative pages, and smoke-check
    English desktop plus Chinese mobile HTML with Playwright. Do not rely only
    on the local `_site` render.

## Appendices

Appendices are declared in `day.yaml` under `appendices`.

- Give each appendix a stable `id`.
- Add locale-specific body paths and titles. Body paths must be
  `appendices/<id>.en.mdx` and `appendices/<id>.zh.mdx`.
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
- Mount web interactives lazily when their root enters the viewport, and stop
  animation loops when they leave it. Hidden appendices, collapsed sections, and
  below-the-fold canvases must not initialize expensive simulations on page open.
- Give every interaction a keyboard path and a programmatic name. Canvas-only
  interactions need a focusable control surface, equivalent keyboard commands,
  visible focus, concise instructions, and a live text status; range controls
  need real labels and must expose correct initial and current values on the
  scale the reader perceives when it differs from the native numeric scale.
- Use `role="group"` for an SVG that contains interactive descendants; reserve
  `role="img"` for a non-interactive figure. Preserve accessible names on both
  the group and its controls, and test behavior rather than source strings alone.
- When a rail, drawer, or bottom sheet opens, move focus to a useful control;
  when it closes, restore focus to its trigger. Reset visibility, focus, and ARIA
  state when a responsive breakpoint changes which navigation surface is active.
- Persist reading progress monotonically per locale: revisiting an earlier
  section must not erase the furthest position reached in that language.
- Add or adjust styles in SCSS modules imported by `book.scss`. Do not add
  component-local `.css`, duplicate `book.css`, browser-print PDF styles, or
  one-off generated CSS.
- Do not add parallel adapter layers, blind importers, or alternate source
  trees. `npm run check:clean` blocks committed
  generated output and any tracked file that matches `.gitignore`; `npm run
  check:workflows` enforces the single project workflow.
- PDF output is generated from semantic MDX through XeTeX. When a live web
  component is not suitable for print, provide a semantic `FormatOnly` print
  alternative instead of relying on DOM controls.

## Assets

- Prefer original diagrams built as reusable Astro figure or interactive
  components using SVG/HTML and SCSS.
- When helping add a new day or appendix, proactively present a short list of
  relevant open-license, public-domain, Creative Commons, or official-source
  image options before finalizing. Include title, creator, source, license, and
  proposed placement; add selected assets with local files, credits, alt text,
  and bilingual captions, or record that no option was selected.
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
  `src/_data/credits.yaml` and artifact code that resolves back to
  `src/assets/images/...`.
- `npm run build:epub` must resolve local source image paths into
  `OEBPS/images/...` and add image manifest entries to `content.opf`.
- EPUB generation rewrites packaged day links to local `day-###.xhtml`
  documents and the syllabus map link to `nav.xhtml`. Single-day EPUBs preserve
  cross-day links as absolute `site_url` links because those target days are not
  packaged in the per-day file.
- PDF generation reads semantic MDX and builds with XeTeX. `ImageFigure` sources
  backed by committed JPEG/PNG/PDF assets are included directly; SVGs are
  converted with `rsvg-convert`.
- If a PDF caption appears but the picture does not, check the MDX image import,
  the resolved asset path, and the XeTeX build log before changing lesson markup.
- Keep `npm run check:epub` guarding against absolute, parent-directory, or
  missing EPUB image paths, non-local internal links, missing link targets, and
  missing link anchors.
- Keep `npm run check:pdf` focused on artifact correctness: valid
  non-interactive PDFs, Poppler-extractable text, appendix inclusion rules, no
  local links, and no live interactive control leakage.
- Derive artifact completeness expectations from the current published-day
  registry and every supported locale. Never hard-code one or two sample days in
  a validator that claims to cover the complete books or download set.

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
- Use `SimpleTable` only with non-empty literal string-array `headers` and
  non-empty literal string-matrix `rows`; each row must contain at least one
  cell and match the header column count. `npm run check:content` rejects
  dynamic, empty, malformed, or uneven props because PDF output must not
  silently drop table content.
- Use `MathInline` and `MathBlock` for math so HTML gets KaTeX and PDF gets
  XeTeX math from the same source. KaTeX must parse the source; invalid math
  fails the site build instead of rendering as fallback text.
- For web interactives, keep behavior in the interactive component and provide a
  clear static PDF/EPUB representation with `FormatOnly`. Static artifact output
  may drift from the live web component when it improves readability.
- For PDF-affecting edits, run `npm run build:pdf` and
  `npm run check:pdf`. When changing PDF renderer, figure, table, code, or
  source-block behavior, set `PDF_KEEP_TEMP=1` for `npm run build:pdf` when
  deeper diagnosis is needed. The PDF build fails on any remaining `Overfull`
  or `Underfull` box, missing glyph, or LaTeX/package/font warning. The
  renderer suppresses only the harmless short-line noise produced by
  intentionally ragged table cells; actual overflow and fallback warnings
  remain fatal.
- Validate external PDF links through parsed annotation action dictionaries and
  decoded URI values. Searching raw PDF bytes is not sufficient because object
  streams and string encodings may hide or transform a link.
- Preserve proper-name spelling and diacritics in extracted PDF text. Resolve
  missing glyphs with a targeted font fallback or renderer fix; do not apply
  blanket transliteration to make a check pass.
- Visual review scope: for global renderer/style changes, sample at least 20
  pages from each full PDF (`180-descent`, `180-descent-deep-dive`,
  `180-descent-zh`, `180-descent-zh-deep-dive`). For individual day PDFs, first
  and last page are sufficient unless the changed day contains a new figure,
  table, code block, or interactive print alternative; then inspect the affected
  interior page too.
