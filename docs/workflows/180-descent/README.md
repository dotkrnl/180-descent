---
name: 180-descent
description: Add, edit, verify, commit, deploy, and visually review The 180-Day Descent website, EPUB, and PDF from the unified Astro/MDX source model.
---

# 180 Descent Workflow

Use this workflow for any project work: day content, appendices, reusable lesson
components, paired Chinese editions, bundled assets, generated artifacts,
publishing, and visual comparison.

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

## Approved Visual Redesign Decisions

Recorded 2026-07-09 from the visual redesign discovery conversation. These
decisions are the product brief for the web migration; implementation details
belong in `visual-redesign-migration.md`.

### Composition and reading behavior

- Use a hybrid book/atlas/editorial composition: book-like reading at the center,
  atlas-like navigation, and editorial marginalia.
- Wide screens use an elastic three-zone spread: left navigation, central reading
  field, and an optional right companion field. Do not use a geometrically
  centered article with a left rail; the layout must be tested for visual weight
  across the whole viewport.
- Prose is centered within the combined central/right reading field, not the
  viewport. Keep a stable literary measure, but let prose expand into otherwise
  empty companion space when appropriate.
- Right-side material is anchored to the passage it belongs to and scrolls away
  naturally. Use it selectively for visual explanation, editorial interpretation,
  and other curated companion material; do not fill empty space with generic UI.
- Use a continuous paper canvas rather than literal page cards or a forced page
  gutter. The visual language should be clean and flat, without texture or faux
  print distress.
- Maintain a rhythmic, content-aware pace: quiet prose, compressed idea
  clusters, full-spread visual events, and interactives should alternate by need.
- Use occasional full-height scenes only for major conceptual or visual moments;
  ordinary prose should follow natural flow.
- Keep ordinary content open and unboxed. Use sparse framing only for figures,
  interactives, warnings, and genuinely distinct content.
- Keep long-form prose within a strict literary measure. Lists, definitions,
  transcripts, and selected special passages may expand further.

### Visual language, typography, and motion

- Redesign the visual language from scratch; the current palette is not a
  constraint. The tone should be controlled surrealism: mostly a readable book,
  with unexpected visual events, layered annotations, and conceptual shifts.
- Use an editorial typography hybrid: readable body type, condensed labels or
  mono apparatus, expressive display type, and gradual typographic evolution
  across conceptual blocks.
- Use a shared visual foundation with block-specific motifs and occasional
  one-off events. New assets may combine abstract scientific, kinetic-system,
  cartographic, and surreal-symbolic language according to lesson needs.
- New visuals are allowed: combine redesigned existing assets with original
  diagrams, illustrations, chapter motifs, and visual transitions. Prefer
  code-native Astro/HTML/CSS/SVG figures for explanatory visuals; use bitmap
  imagery only when it adds real value.
- Motion should be narrative and interactive: use brief section transitions and
  meaningful micro-interactions, with reduced-motion behavior always respected.
- Page-to-page navigation uses quiet visual continuity rather than dramatic
  page-turn effects.
- Hover and focus states are content-aware. Ordinary links use typographic
  emphasis; figures and conceptual links may reveal context or use restrained
  micro-motion. Keyboard focus must provide equivalent discovery.

### Navigation and orientation

- Use an expandable expedition rail: a narrow depth marker remains present and
  the full navigation expands on hover or focus. On smaller screens, use the
  existing bottom-sheet pattern.
- On lesson pages, the full top navigation transforms into a compact running
  head while reading. It starts with day and title, then becomes section- and
  progress-aware deeper in the lesson.
- Day numbers remain quiet folios, not oversized chapter graphics.
- Lesson endings use layered closure: written recap, optional visual or
  interactive synthesis, then narrative next-day handoff plus compact folio and
  map navigation.
- Reading progress stays subtle during reading and becomes more detailed on the
  homepage and syllabus. Use a quiet folio marker and visible descent line, not
  a productivity dashboard.
- Keep reader controls minimal: language and theme only. Do not add a settings
  wall or reader customization panel.
- Use a quiet, context-aware brand presence: keep the existing logo unchanged,
  make it visible on the homepage, quiet in navigation, and omit it when it
  competes with lesson reading.

### Content, sources, and visual objects

- Preserve the intellectual content and citations. Minor labels, calls to action,
  section framing, and content grouping may change; sections may be reordered or
  regrouped when this improves reading rhythm.
- Keep citations as traditional footnotes and complete source sections. Do not
  introduce inline references or margin citations.
- Use content-aware visual placement: small figures stay near their passages,
  major figures can become full-spread events, and interactives receive dedicated
  exhibit space when needed.
- Use static pairing by default for figure explanations. Add sticky or
  scrollytelling treatment only where it materially improves understanding.
- Present important ideas with the least intrusive suitable treatment, especially
  margin pull quotes and large typographic pauses. Use explicit labels for
  uncertainty and evidence status, with symbols or color as secondary cues only.
- Treat interactives as museum exhibits with playful feedback. Do not turn them
  into generic dashboard controls.
- Use layered recaps: a concise written recap followed by optional synthesis.
- Treat appendices as optional archive side paths with denser source detail while
  retaining the main book system.

### Home, syllabus, support pages, and unpublished days

- Keep the homepage opening compact and editorial. Layer the cover, descent map,
  continue-reading path, latest lessons, and project context in that order of
  discovery.
- Use a layered cover: typography establishes the cover, then the map or a
  conceptual visual emerges on scroll.
- Use a zoomable syllabus map with hover previews and click-to-descend behavior,
  followed by a reliable searchable/index-like contents list.
- Use a concise editorial day list on the homepage and a full descent stream plus
  index on the syllabus.
- Show unpublished days as visible but clearly inactive future structure: the
  map can reveal the full ambition, but unavailable lessons must not look linked
  or published.
- Supporting pages remain part of the book, with quieter archival/catalog-like
  treatments for downloads, credits, introduction, and sources.

### Responsive, language, theme, and artifact boundaries

- On phones and tablets, use a single reading column. Insert companion material
  after its anchor passage or open it in a compact bottom sheet. Keep a quiet
  bottom reading dock for progress, contents, and previous/next navigation.
- Keep English and Chinese composition shared, with language-specific type,
  spacing, rhythm, and subtle atmospheric adjustments.
- Light and dark themes are two material editions of the same book: preserve
  structure and typography while giving each theme its own atmosphere.
- Design responsively across 1366–1920px, using 1440px as the reference viewport
  and explicitly testing for left-heavy imbalance and empty right-side space.
- The web is the expressive edition. EPUB and PDF inherit durable hierarchy,
  numbering, typography, and section motifs, but do not inherit web-only motion
  or interactive behavior.
- Treat left-heavy composition, interrupted readability, empty wide-screen
  space, and dashboard-like UI as non-negotiable failure modes to prevent.

MDX may use imported components and ordinary Markdown/MDX prose. Do not use raw
HTML as a formatting shortcut; use Markdown, existing lesson components, or a
small reusable component when inline JSX must wrap another component. MDX must
not own raw interactive controls, canvas, behavior ARIA roles, inline event
handlers, or action/state data hooks. Put those contracts inside
`lesson/interactives` components and let `npm run check:content` enforce
the boundary. Every uppercase MDX component tag must also have an explicit artifact
contract in `check:content`: rendered directly, transparent wrapper, or web-only
with a static `FormatOnly media="print-epub" variant="alternate"` equivalent.

### Format-specific copy contract

Treat every `FormatOnly` passage as finished reader-facing prose, not as an
implementation note. The web passage must stand on its own and may describe the
interaction it contains, but must not mention static output, fallbacks, print,
EPUB, or PDF. The print/EPUB passage must likewise stand on its own: do not call
it static, a fallback, a fixed figure/example, or a web/interactive version.
Replace those labels with the subject and its lesson—for example, `Figure ·
Idealization` and a sentence explaining what the figure reveals.

`npm run check:content` enforces this boundary in both English and Chinese,
including common translations of static, fallback, web-version, and fixed
figure labels. Keep the rules narrow enough to allow technical phrases such as
“fixed-horizon test” or “static clusters”; only format-meta language belongs in
the gate.

When a passage names an artifact or depends on its navigation model, keep its
media channel artifact-specific—for example, `deep-dive-print` versus
`deep-dive-epub`. The PDF renderer must not consume EPUB-only copy, or vice
versa.

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

## Claim And Evidence Calibration

Apply this gate to new lessons and existing-day edits in both locales.

- Prefer primary sources for factual, historical, scientific, and benchmark
  claims. Record enough version, release, access, and event-date context to
  identify what the source actually supports; do not confuse a publication date
  with the date of the event or result.
- State a theorem's assumptions and scope near the conclusion drawn from it.
  Keep formal consequences inside the formal model, and do not turn a proof,
  idealization, or modeling objective into an empirical, metaphysical, or
  truth-tracking guarantee it does not establish.
- Compare systems or results only when the benchmark version, model release,
  evaluation protocol, tools, sampling budget, and other material conditions are
  compatible. When they are not, describe the results separately instead of
  implying a ranking or trend.
- Distinguish an institution's or vendor's characterization from independent
  evidence. Put uncertainty, limitations, and evidence status in reader-facing
  claim or source prose—not in editorial notes claiming that sources were
  checked.
- Keep English and Chinese aligned on factual scope, numbers, dates, rankings,
  evidence status, and uncertainty. A correction to any of those requires a
  paired-locale review. Do not mechanically rewrite already-natural Chinese for
  an English-only rhetorical tightening when both versions still make the same
  calibrated claim.

## Existing-Day Editorial Pass

Use this pass when reviewing a run of already-published days. It is an editorial
review, not a translation reset or a reason to flatten the established voice.

1. Inventory each paired main body and every declared appendix; compare headings,
   imports, interactive/static alternates, sources, recap blocks, thread labels,
   and next-day handoffs section by section.
2. Preserve the narrative engine of each day: a concrete opening hook, a clear
   conceptual model, an example or experiment, the live evidence boundary, and a
   forward-looking handoff. Prefer vivid examples and varied sentence rhythm;
   remove repetition, translationese, and UI-label drift without sanding away
   the intellectual tension.
3. Normalize shared course furniture across the sweep. Main days should use the
   same frontier numbering, open-question eyebrow, three-part recap shape, and
   thread treatment in both locales; appendix labels may remain local when they
   describe appendix-specific material.
4. Preserve claims, citations, caveats, and evidence strength. Run the Claim And
   Evidence Calibration gate above. Any wording change that alters a number,
   timeframe, status label, or uncertainty claim requires a paired-source check
   and an update to the relevant glossary or source note.
5. Remove model-shaped editorial residue where it is actually present: repeated
   abstract triads, automatic `not X but Y` contrasts, generic claims of rigor,
   manufactured superlatives, fake suspense, clusters of rhetorical questions,
   stock `rewrite the landscape` metaphors, self-conscious source-vetting
   narration, inflated certainty, and authoring instructions in reader copy.
   Replace each with the concrete claim, evidence, or transition the passage
   needs; do not flatten deliberate voice or rhythm.
6. Run the Chinese Edition rules below as a separate review of the Chinese files,
   then run content, type, math, import, appendix-style, and artifact checks after
   the entire sweep.

## Chinese Edition

Chinese content must be idiomatic Simplified Chinese, not line-by-line English.
Keep translation, blind review, and final consistency review as independent
passes. Internal tool or model names must never appear as translator credit or
reader-facing attribution.

- Inventory every paired English/Chinese MDX file, including the introduction
  and appendices. When work is parallelized, assign non-overlapping files to each
  translation pass. For new or fully refreshed targets, initialize the Chinese
  file from its paired English source before translation; this is input, not
  finished Chinese.
- Give each translator the canonical prompt below, the paired English sources,
  and the terminology glossary. A translation pass may edit only its assigned
  Chinese files and necessary localized data or glossary entries.
- Assign independent blind reviewers who did not translate the files. Reviewers
  receive the English source, final Chinese target, and
  glossary—but not draft history, translator commentary, or prior review comments.
  They must independently identify omissions, additions, mistranslations,
  terminology drift, untranslated UI text, and unidiomatic or overly literal
  Chinese. Resolve all actionable findings before final source-parity review.
- Preserve manifest structure, day numbers, path, citations, URLs, DOI metadata,
  component imports, image alt meaning, and interaction behavior.
- Preserve claim parity, not English syntax. Numbers, dates, named entities,
  rankings, qualifications, evidence status, and uncertainty must agree across
  locales; a rhetorical edit may remain locale-specific when the underlying
  calibrated meaning already agrees.
- Localize block titles and print labels through existing data/components; do not
  hard-code English labels into Chinese print surfaces.
- Translate image `alt`, SVG `aria-label`, captions, panel titles, status-chip
  print labels, figure labels, and static table headings.
- Import the same reusable figure or interactive component used by English, with
  localized props or localized component data when needed.
- Add Chinese-specific styling only through existing SCSS modules, especially
  `src/assets/scss/content/_zh.scss`, unless a shared style is more appropriate.
- Keep terminology consistent across existing Chinese days. Before any Chinese
  translation or review pass, read
  `docs/workflows/180-descent/zh-terminology-glossary.md` and treat it as the
  authoritative glossary.
- When adding or standardizing a recurring term, scan prior Chinese days for
  existing translations before choosing the Chinese form, then update the
  glossary and normalize affected content in the same change where practical.
- For an existing-day consistency pass, preserve the approved Chinese source and
  compare the paired English and Chinese files section by section before editing;
  do not blindly replace an existing translation with English input. Normalize
  shared UI language across the sweep: `模块一` for Block I, `前沿 01` (and so
  on) for frontier claim eyebrows, `未决问题` for the open-question eyebrow,
  and `核心观点` / `最佳类比` / `仍在争论` for the three main recap labels.
- Prefer natural Chinese rhythm and punctuation. Use Chinese quotes for quoted
  propositions and titles where appropriate.
- Avoid `诚实` and `冷静` as routine translations for English `honest` and
  `sober`. Translate the actual function in context: `准确`, `完整`, `稳妥`,
  `严格`, `克制`, `校准`, `审慎`, `相关`, or a local paraphrase. Keep `Sober` as
  an author name and preserve source titles or exact quotations.
- Avoid dense emphasis in Chinese prose. Use terminology styling and sparse
  color emphasis only when it clarifies structure.
- In running Chinese prose, do not use Markdown bold or `<Term as="em">` as a
  translation of English emphasis. Prefer a plain sentence, the default
  `Term` span for a technical term, or a deliberately sparse `Highlight`; keep
  italics only where they identify an original Latin/English title or term.
- Review AI edits manually before accepting: factual accuracy, terminology,
  formatting, component parity, and artifact behavior.
- If a repeated course term is missing, newly standardized, or found
  inconsistent, update `docs/workflows/180-descent/zh-terminology-glossary.md`
  in the same change and fix the affected content where practical.
- For Chinese typography, prefer `「」` for propositions, terms as language
  objects, and short emphasis; use Chinese book title marks for Chinese titles;
  keep original English paper titles in italics or plain Latin text rather than
  wrapping them in multiple quote systems. Preserve exact source titles in
  reference lists.
- When a technical English word has multiple near-synonyms, do not collapse
  distinct concepts into one Chinese term. Follow the glossary for status
  labels, frontier-method names, and technical terms.

- `FormatOnly` static alternatives for web-only interactives must include the
  context that lived inside the interactive component: a localized title, the
  object being shown, and enough rules or captions for PDF/EPUB readers to
  understand the artifact without the live widget.

For a new day or an explicitly approved full retranslation, create or update
Chinese locale fields in `day.yaml`, then initialize
`src/content/days/###-slug/zh.mdx` from a direct, untranslated copy of
`src/content/days/###-slug/en.mdx`. This is translation input, not finished
Chinese, and it may temporarily fail locale checks. Never use this reset during
an existing-day editorial pass. Assign translation and blind review to different
people or independent review passes.

```text
请逐篇审校全部中文译文，并与对应英文原文逐项对照，找出并修正任何信息遗漏、误译、无依据增补、术语不一致和未本地化的界面文字。译文应当信、达、雅，符合现代书面汉语习惯：行文自然、清晰、凝练，不带翻译腔，不使用只有英文才成立的比喻。必要时可以摆脱英文句法和修辞、按中文逻辑彻底重写；但若原文可以自然译出，必须完整保留其信息、限定与证据强度。使用优雅的书面语，避免口语化。

开始前必须完整阅读 docs/workflows/180-descent/zh-terminology-glossary.md，并严格遵循其中的术语；如需新增或统一反复出现的术语，须在同一次修改中更新词表并修正受影响内容。不要把 honest、sober 等词机械译为「诚实」或「冷静」；应按语境采用准确、完整、稳妥、严格、克制、校准、审慎、相关或自然的改写。中文强调应节制使用术语字重、颜色与「」；运行正文不得使用 Markdown 粗体或 <Term as="em">，也不得使用 <em>、<i>、<strong>、<b>、<u>；英文原始论文标题可按词表规则保留斜体。命题、口号和作为语言对象的短语优先用「」。

保留并正确本地化所有 front matter/manifest 键、imports、component props、URLs、DOI、引文元数据、class、id、data attribute、ARIA 结构、图片 alt 文本、表格、SVG、JavaScript hook、MDX 语法及说明性注释。不得编辑英文源文件或构建脚本。完成后用中文简要列出已修改文件、已解决的实质问题，以及仍需负责人决定的事项。
```

For blind review, give a reviewer the source, target, and glossary only:

```text
盲审时不得查看译者的推理、草稿历史或既有评语。请独立比对英文原文与最终中文，逐项报告信息遗漏、误译、无依据增补、术语偏移、未翻译文字、英文句法痕迹及不合中文书面语习惯的表达；只在证据充分时提出修改，并列出相应的英文依据。
```

将盲审中可执行的问题修正后，再由另一名未参与翻译的审校者进行最终一致性检查：

```text
确认译文已经完整保留英文原文的信息、限定条件与证据强度；术语、状态标签、引用、图表文字、替代文本和静态制品文案均与词表及英文对应；中文自然、正式、无翻译腔，且不含仅适用于英文的比喻。
```

For large appendices, use temporary files instead of overwriting translation
input: `/tmp/day-###-appendix-N-en.mdx` and
`/tmp/day-###-appendix-N-zh.mdx`. Start by replacing the temporary Chinese
target with a direct, untranslated copy of the paired English appendix source so
stale Chinese prose cannot be mistaken for reviewed output. Split large English
sources at section boundaries into `/tmp/day-###-appendix-N-part-M-en.mdx`
chunks, translate matching `part-M-zh.mdx` files in separate non-overlapping
passes, then reassemble the result for blind review. Reviewers
must not see translator reasoning, draft history, or earlier review comments.
Only after blind review, manual structure comparison, and artifact validation
should the temporary result replace
`src/content/days/###-slug/appendices/*.zh.mdx`.

## Human Refinement Gate

Use this gate after implementation, translation, checks, and artifact inspection
are otherwise complete, and before commit/push/deploy unless the user explicitly
asks to publish immediately.

1. Start the local dev server if it is not already running:

```sh
npm run dev -- --port 8080
```

If port 8080 is unavailable, use another local port and tell the user the URL.

2. Ask the user to review relevant English/Chinese pages in the local browser
   and provide concrete corrections or selected passages.
3. Apply accepted refinements to tracked source files, then refresh and verify
   the rendered result. Do not leave changes as browser-only DOM edits.
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

`npm run check` rebuilds all generated assets and download artifacts, then
runs all validators, including SEO, accessibility, EPUB, PDF, and repository
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
   Use the visual QA command to produce the route inventory, screenshots, and
   structural comparison report:

```sh
npm run build:site
npm run check:visual -- --base https://staging.180-descent.pages.dev --compare https://180d.io --out tmp/visual-qa
```

8. Treat structural mismatches, language/title/H1 mismatches, horizontal
   overflow, broken math, missing Chinese font behavior, and untranslated
   Chinese print labels as regressions. Distinguish expected content drift from
   visual degradation when staging intentionally includes newer content than
   production.
9. After a Pages deployment, verify the reported environment, branch, source
   commit, and unique deployment URL. Follow the stable Pages endpoint and
   custom-domain redirect, then compare a representative deployed file or hash
   with the freshly built `_site` output. A successful CLI exit alone does not
   prove that the intended release is live.
10. Report commit hash, branch, push result, deploy URL or deployment status,
   visual comparison scope, and any residual risks.

Do not edit generated files in `_site/`; they are build outputs.

## Verification

For focused edits, run the narrow checks first:

```sh
npm run typecheck
npm test
npm run check:content
npm run check:javascript
npm run check:math:source
npm run check:appendix-style
npm run check:imports
npm run check:dead
npm run check:svg-text
npm run check:clean
npm run check:workflows
```

The pull-request quality workflow runs every source-only contract, TypeScript,
and the unit suite on every pull request and on pushes to `main`. Keep the CI
Node major, `.node-version`, `package.json` engine, and `@types/node` on the same
supported runtime line. A content change is not ready to publish until those
gates pass; release-bound work still requires the full `npm run check` artifact
build below.

Keep source-only validators independent of `_site`; stale build output must not
change their result. Conversely, built-output validators must run after a fresh
build and fail clearly when required artifacts are absent. For test fixtures and
render-only Vite instances, use the worker-local `TMPDIR`, disable WebSockets and
dependency discovery, close the owning server before deleting its explicit
cache directory, and remove every fixture in teardown. Favor behavior-level
regression tests for focus, keyboard input, persisted reading state, and ARIA
semantics over source-regex assertions alone.

For changes that touch built pages, metadata, accessibility, rendered
typography, or download artifacts, add the focused built-output validators:

```sh
npm run check:math
npm run check:links
npm run check:seo
npm run check:a11y
npm run check:rendered-type
npm run check:epub
npm run check:pdf
```

`check:math` validates rendered KaTeX in built HTML, and `check:links`
validates rendered internal links, including download links. Run them only
after `_site` and the linked download artifacts are current.

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
