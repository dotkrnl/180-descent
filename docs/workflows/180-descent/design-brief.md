# Design Brief

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

## Format-specific copy contract

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
