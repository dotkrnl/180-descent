---
name: 180-descent-visual-redesign-migration
description: Migration plan for the approved wide-screen, book-like, editorial redesign of The 180-Day Descent website.
---

# Visual Redesign Migration Plan

Status: implementation complete; final visual and artifact validation passed.

## Final implementation audit

The final review covered the homepage, syllabus, support pages, Day 001, a
prose-heavy lesson region, complex interactive lessons, English and Chinese
routes, light and dark themes, and 390px, 768px, 1366px, 1440px, and 1920px
rendering. The final pass specifically corrected the desktop expedition rail,
mobile folio navigation, jump-position reveal opacity, mobile syllabus map
composition, compact map labels, and desktop map hover previews.

Validation evidence:

- `npm run check:visual -- --base http://localhost:4321` passed for all 32
  routes at the project mobile and desktop checkpoints.
- A 128-case Playwright metrics pass across all 32 routes at 1366px and 1920px
  in both themes found no HTTP or horizontal-overflow errors.
- `npm run check` and the final `npm run check:built` passed, including EPUB,
  PDF, accessibility, and rendered typography checks.

The redesign is web-primary. It changes the Astro/SCSS presentation system while
preserving the MDX source model, bilingual content, existing brand mark,
accessibility contracts, interactive behavior, and static artifact equivalents.
The approved product decisions are recorded in the parent workflow README.

## Guardrails

- Keep all styling in SCSS modules imported by `src/assets/scss/book.scss`.
- Do not rewrite lesson prose just to make the layout work. Only make the
  approved minor editorial and grouping changes when a component or page needs
  them.
- Do not introduce inline citations, reader settings, generic card grids, or a
  permanent left rail that makes the viewport left-heavy.
- Preserve all current route, language, theme, accessibility, interaction,
  EPUB, PDF, and social-card contracts unless a separate migration step names
  the contract explicitly.
- Build new explanatory visuals as reusable code-native components where
  possible. Keep bitmap imagery purposeful, local, licensed, credited, and
  bilingual when it is used.

## Migration phases

### 0. Baseline and visual inventory

Before editing product files:

- Render representative English and Chinese pages at 1366px, 1440px, and
  1920px, plus a narrow mobile viewport.
- Inventory all page families: homepage, lesson, syllabus, introduction,
  downloads, credits, appendices, and Chinese equivalents.
- Inventory the reusable lesson components, figure types, interactive roots,
  running-head hooks, rail hooks, theme hooks, and format-only alternates.
- Record existing visual regressions or layout assumptions in the implementation
  notes so the redesign can distinguish intentional changes from breakage.

Primary inspection points:

- `src/app/layouts/BookShell.astro`
- `src/app/layouts/PageShell.astro`
- `src/app/components/DayPage.astro`
- `src/app/components/HomePage.astro`
- `src/app/components/SyllabusPage.astro`
- `src/assets/scss/abstracts/_tokens.scss`
- `src/assets/scss/base/_base.scss`
- `src/assets/scss/layout/_topbar.scss`
- `src/assets/scss/layout/_rail.scss`
- `src/assets/scss/layout/_hero.scss`
- `src/assets/scss/pages/` feature partials (`_pages.scss` only controls order)
- `src/assets/scss/content/_lesson.scss`

### 1. Establish the new visual foundation

Refactor the tokens and base rules before changing individual page layouts:

- Replace the current palette with a new neutral foundation and a controlled,
  block-aware accent system. Keep light and dark tokens structurally parallel;
  do not simply invert colors.
- Define the new type hierarchy: body, display, mono/editorial apparatus, CJK
  body, and CJK display behavior.
- Define wide-screen shell variables for the elastic reading field, outer rail,
  companion field, max prose measure, full-spread breakouts, and responsive
  collapse points.
- Remove visual assumptions that create dashboard UI: excessive rounded cards,
  heavy shadows, and panel-first grouping.
- Keep focus rings, selection, skip links, reduced-motion rules, print rules,
  and contrast guarantees explicit in the base layer.

Likely files:

- `src/assets/scss/abstracts/_tokens.scss`
- `src/assets/scss/base/_base.scss`
- `src/assets/scss/media/_reduced-motion.scss`
- `src/assets/scss/media/_print.scss`

### 2. Rebuild the global book shell

Make the shell responsible for the page furniture, not for forcing every page
into the same geometry:

- Redesign the top bar so the existing brand mark is quiet and context-aware.
- Keep the current running-head data hooks, but change its visual states to the
  approved day/title/section/progress sequence.
- Replace the current top-bar visual weight with a compact book-furniture
  treatment that can transform without layout jump.
- Preserve language switching and theme switching; restyle them as secondary
  typographic controls.
- Rebuild release/download strips as editorial notices that do not compete with
  lesson content.
- Rebalance the footer as a colophon/archive page rather than a utility block.

Likely files:

- `src/app/layouts/BookShell.astro`
- `src/assets/scss/layout/_topbar.scss`
- `src/assets/scss/pages/_pages.scss`
- `src/assets/scss/base/_base.scss`

### 3. Create the elastic lesson spread

Use the existing lesson data hooks and add only the structural wrappers needed
to express the layout:

- Give the lesson a wide-screen grid with three logical regions: navigation,
  reading field, and optional companion field.
- Keep the prose column in the combined central/right field, with a strict
  readable measure. Let open prose expand only within the approved max measure.
- Allow figures, interactives, recaps, and selected claims to opt into right-side
  companion or full-spread treatment through stable semantic classes.
- Keep right-side editorial material anchored to the source passage. Do not
  generate filler marginalia from generic metadata.
- Make the left expedition rail expandable and visually quiet. Preserve the
  existing mobile bottom-sheet behavior, but restyle its trigger and surface.
- Make the top and bottom `DayNav` feel like folio navigation with a narrative
  next-day handoff.
- Keep appendix content in the same book system, with an archive/side-path
  treatment rather than a generic accordion card.

Likely files:

- `src/app/components/DayPage.astro`
- `src/app/components/DayNav.astro`
- `src/app/components/lesson/Hero.astro`
- `src/app/components/lesson/ContentSection.astro`
- `src/app/components/lesson/Wrap.astro`
- `src/assets/scss/layout/_rail.scss`
- `src/assets/scss/layout/_hero.scss`
- `src/assets/scss/content/_lesson.scss`

If a new wrapper is required, prefer one reusable semantic component such as a
lesson stage/companion wrapper over page-specific DOM or CSS selectors. Keep
MDX imports and artifact contracts explicit.

### 4. Reclassify the lesson visual vocabulary

Move the existing component styling toward open editorial composition:

- Make `Hero`, `Lead`, `ContentSection`, headings, claims, block quotes, and
  sources form the stable reading rhythm.
- Reduce default panel/card treatment for `Aside`, `Panel`, `Roadmap`, tables,
  and appendix cards. Add stronger framing only where the content is genuinely
  an exhibit, warning, or static alternate.
- Restyle `Recap` as the layered closing synthesis, preserving its semantic
  structure and dark/light accessibility.
- Make `Claim` and `StatusChip` the explicit evidence/uncertainty grammar;
  labels remain textual and color/symbols stay secondary.
- Make figures and interactives content-aware: near-passage, right companion,
  or full-spread classes should be composable and artifact-safe.
- Preserve traditional footnote/source behavior. Do not convert `TipNote` or
  source components into a new citation system.

Likely files:

- `src/assets/scss/content/_lesson.scss`
- `src/assets/scss/components/_interactions.scss`
- `src/assets/scss/components/_chip.scss`
- `src/assets/scss/components/_statistics.scss`
- reusable lesson components only where a stable hook is missing

### 5. Redesign homepage, syllabus, and support pages

- Homepage: replace the current split cover with a compact editorial opening,
  layered cover-to-map reveal, continue-reading path, latest-day stream, and
  project context.
- Syllabus: use a zoomable block map with clear unavailable states, then a
  reliable index/stream for direct navigation. Preserve accessible links for
  every published day.
- Downloads, Credits, Introduction, and Sources: use quieter archival chapter
  treatments with the same type and shell, not dashboard cards.
- Keep Chinese pages structurally paired while allowing CJK-specific line
  lengths, label density, and title rhythm.

Likely files:

- `src/app/components/HomePage.astro`
- `src/app/components/SyllabusPage.astro`
- `src/app/components/DownloadsPage.astro`
- `src/app/components/CreditsPage.astro`
- `src/app/layouts/PageShell.astro`
- `src/assets/scss/pages/_pages.scss`
- `src/assets/scss/content/_zh.scss`

### 6. Add controlled visual events

Only after the composition is stable:

- Add reusable chapter/block motifs using Astro/HTML/CSS/SVG where they clarify
  conceptual structure.
- Add full-spread visual events for selected turning points, not every section.
- Add scrollytelling only to interactives whose explanatory value depends on
  ordered state changes; otherwise use static or reader-triggered pairing.
- Keep new assets consistent through the shared visual grammar, with block-level
  variation and occasional surreal or cartographic exceptions.
- Verify every new visual in dark theme, CJK pages, print/PDF fallback, and
  reduced-motion mode.

Potential locations:

- `src/app/components/lesson/figures/`
- `src/app/components/lesson/interactives/`
- `src/assets/js/interactions/`
- `src/assets/scss/content/_lesson.scss`
- `src/assets/scss/components/_interactions.scss`

### 7. Responsive and interaction migration

- Desktop: validate 1366px, 1440px, and 1920px compositions for left/right
  visual balance.
- Tablet/mobile: collapse to one reading column, move companions after their
  anchor or into a bottom sheet, and retain the compact reading dock.
- Preserve keyboard equivalents for all hover/focus reveals.
- Preserve reduced-motion behavior and avoid sticky/scrollytelling initialization
  when the visual is hidden or the user has requested reduced motion.
- Keep the existing language and theme behavior; do not add a customization
  surface.

### 8. Validation and artifact review

Run in this order after the migration:

1. `npm run typecheck`
2. `npm run build:site`
3. `npm run build:epub`
4. `npm run build:pdf`
5. `npm run check:built`
6. `npm run check:visual`

For visual QA, inspect at minimum:

- English homepage, syllabus, and Day 001 at 1366px, 1440px, and 1920px.
- Chinese homepage, syllabus, and a lesson at desktop and narrow mobile widths.
- A prose-heavy lesson region with no figure beside it.
- A lesson with a large figure or interactive.
- A recap, traditional sources section, appendix, and end-of-lesson navigation.
- Light and dark themes, reduced motion, keyboard focus, and the mobile bottom
  sheet/dock.

The primary acceptance question is not whether the page fills the viewport. It
is whether the entire composition feels balanced, readable, and intentional when
the right companion field is empty, partially populated, or visually dominant.

## Suggested implementation order

1. Apply the workflow record and capture a baseline.
2. Replace tokens and base/page furniture.
3. Rebuild the lesson spread and rail.
4. Reclassify content blocks and figure placement.
5. Redesign homepage and syllabus.
6. Add selected visual events and asset work.
7. Rework responsive behavior and language/theme details.
8. Run build, artifact, accessibility, and visual checks.
9. Iterate only on evidence from the representative screenshots and tests.
