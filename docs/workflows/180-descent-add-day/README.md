---
name: 180-descent-add-day
description: Add a new English day page to The 180-Day Descent repo from a supplied HTML lesson, using the route-shell plus lesson-include convention, refining imported prose, highlighting inline terms, reviewing factual claims and sources, adding callbacks, proactively searching useful image candidates, and providing web/EPUB/PDF component variants. Use when Codex needs to import or create a normal day lesson under src/days/ and src/_includes/days/.
---

# Add A Day To 180 Descent

Use this skill for the normal day-add workflow. The English route and lesson
include are handled here; when the repo already has a Chinese edition, Chinese
mirroring is part of the default workflow and hands off to
`180-descent-chinese-edition`.

Use adjacent skills when the workflow reaches their scope:

- Chinese mirroring or translation: `180-descent-chinese-edition`
- Deep-dive appendices: `180-descent-add-appendix`
- Images, credits, compression, EPUB/PDF asset handling: `180-descent-assets`
- Commit, push, deploy, or human refinement gate: `180-descent-publish`

## First Files To Read

1. `src/_data/syllabus-data.yaml`
2. The supplied day HTML file
3. `src/_data/future-links.yaml`
4. Existing nearby route shells in `src/days/` and lesson bodies in `src/_includes/days/`
5. If needed:
   - `references/lesson-schema.md`
   - `references/component-contract.md`

Read the syllabus entry for the target day plus the immediately previous and next days.

## Chinese Mirroring Default

In this repo, new normal day additions must be mirrored into the Chinese edition
when `src/zh/days/` and `src/_data/syllabus_zh.yaml` exist, unless the user
explicitly requests an English-only/no-Chinese change. Do not treat the absence
of an explicit Chinese request as meaning Chinese is out of scope.

When Chinese mirroring is required, run the `180-descent-chinese-edition` Normal
Day Workflow before considering the day complete. This includes the Chinese
route shell, Chinese lesson include, `src/_data/syllabus_zh.yaml`,
`src/zh/introduction.md`, translated interactive UI text, tomorrow-card behavior,
the Chinese Typography Gate for color/corner quotes and bold/color term spans
instead of mechanically mirrored English emphasis, and the `--require-zh`
target-day checklist.

## Fact-Check Gate

Before any new English day is considered ready, run a claim-level factual review. Treat every factual claim you are not personally 100% sure about as needing verification.

1. Inventory factual claims by local file and line: dates, chronology, publication metadata, names/titles, quotes, numbers, statistical results, legal/regulatory/current claims, technical capabilities, "first/largest/only" superlatives, and claims about contested frontier work.
2. Verify against the strongest practical source:
   - primary papers, books, official project pages, standards, repositories, release notes, datasets, or competition pages
   - reputable publisher pages, DOI records, SEP/IEP entries, PubMed/arXiv pages, or institutional pages when primary text is unavailable
   - avoid relying on Wikipedia except as a pointer to better sources
3. For every scholarly source in the lesson source list, search DOI metadata
   and add a DOI plus `https://doi.org/...` link when a high-confidence exact
   match exists. Verify title, authors, year, venue, volume/issue, and pages
   against DOI/publisher metadata before adding it. Do not invent or add
   near-match DOIs; if no reliable DOI is found, leave the source without one.
4. Browse for current or unstable claims, including model capabilities, software/library status, live statistics, leadership, prices, laws, standards, recent papers, and anything dated "latest", "current", "today", or this year.
5. Check direct quotes against the original publication, transcript, archive scan, or a reliable reproduction. If the exact wording cannot be verified, paraphrase and cite the source.
6. Check numbers by recalculating when possible: percentages, sample sizes, score thresholds, table rows, totals, and "X of Y" statements. Note whether a count includes trivial cases or self-pairs.
7. Audit wording for overclaiming. Soften unsupported superlatives, absolute guarantees, causal claims, and "settled" labels unless the cited source really supports them. Mark frontier items as established, promising hint, or contested/hype.
8. Keep citations adjacent to the claims they support. If a source supports only part of a sentence, revise the sentence or add the missing source.
9. Keep source-screening methodology out of audience-facing prose. Apply date, source, and credibility rules internally; do not add meta notes such as "per the syllabus's standing rule" to lesson copy. Use ordinary prose, evidence labels, or source-list metadata instead.
10. When Chinese mirroring is required, mirror every factual correction into the Chinese route/include and manually verify dates, numbers, names, source metadata, URLs, DOI strings, and evidence labels after translation.

Do not proceed to commit/publish until this gate has been completed and any issues have been fixed or explicitly reported to the user.

### Causal-Inference Claim Addendum

When a day discusses causation, causal inference, treatment effects, experiments, or observational adjustment, apply these extra checks before translation and publishing:

1. State the causal question before the method: unit, exposure/treatment, outcome, timing, intervention, and estimand.
2. Separate association, intervention, counterfactuals, causal-effect inference, causal discovery, and actual causation. Do not let one framework sound like a complete answer to all of them.
3. Write `P(Y | do(X=x))` and `P(Y | X=x)` as different questions that need not be equal; never imply a universal inequality or universal equality.
4. Treat Simpson reversals as subgroup-weight phenomena. Causal knowledge decides whether pooling or stratifying is relevant; the third variable may be a confounder, mediator, collider, selection variable, or descriptive partition.
5. For observational examples, explicitly distinguish a table reversal from causal superiority. Note randomization, historical/nonrandomized design, case mix, selection, time-period differences, and support limits when relevant.
6. Include minimum assumptions vocabulary when teaching adjustment: consistency, exchangeability, positivity/overlap, no interference, measurement/attrition/selection concerns, and sensitivity to violations.
7. For do-calculus, front-door/back-door, causal discovery, LiNGAM/additive-noise models, faithfulness, RCTs, and LLM causal reasoning, keep scope clauses attached to claims. Do not convert identification results, model assumptions, or benchmark performance into unconditional guarantees.
8. For causal interactives, generate displayed observational, adjusted, and interventional quantities from an explicit stated data-generating model or table; do not animate an arbitrary bias formula unless it is labeled as a purely illustrative heuristic.

## Image Candidate Gate

Before any new day is considered ready, perform a proactive image pass even if
the supplied lesson did not ask for images.

1. Identify two to four places where a non-decorative image might make the
   lesson clearer, more concrete, or more memorable. Prefer places where the
   lesson names a real person, artifact, experiment, historical scene, diagram,
   instrument, manuscript, chart, or visual object.
2. Search for practical candidates from open-license, public-domain, Creative
   Commons, or official-source collections. Browse when needed to verify source,
   creator, license, and reuse terms; do not rely on a thumbnail alone.
3. Present useful candidates to the user before adding any third-party image.
   Include proposed placement, why it helps, source URL, creator, license, and
   attribution/share-alike obligations. If no candidate is good enough, say
   that explicitly and continue without images.
4. Do not add decorative images merely to satisfy the gate. Prefer existing
   semantic HTML/CSS/SVG diagrams when they explain the concept better than a
   photo or scan.
5. If the user accepts a third-party image, switch to `180-descent-assets` for
   bundling, credits, compression, EPUB/PDF handling, and visual verification.

## Dark Theme Gate

Always consider the dark theme when adding or changing visual surfaces: recap
boxes, asides, panels, cards, figures, SVG diagrams, image-backed SVGs,
interactive components, and generated or bundled assets. Avoid hard-coded light
backgrounds or dark ink that turn into bright blocks at night. Use theme tokens,
dark-mode overrides, or explicit light/dark asset variants, and verify the
affected page with the theme toggle before treating the day as complete.

## Explanatory Tip Gate

Before any new day is considered ready, review the lesson as a smart
bachelor-degree holder who is not a specialist in the topic. Add a short
explanatory tip for any first-use term, theorem, named method, technical
artifact, statistical measure, philosophical position, current research label,
or institutional acronym that is not common knowledge at that level and is not
already defined before or immediately during the mention.

1. Add tips with the global shortcode immediately after the term:
   `{% tip 'Brief plain-language explanation.' %}`. On the website this renders
   as a tappable `?` tip box; PDF and EPUB exports render numbered footnotes,
   not inline parenthetical text after the term.
2. Keep tips brief and explanatory, not source citations. They should define the
   term or clarify why it matters in one sentence.
3. Do not over-annotate ordinary words, terms already defined nearby, repeated
   uses after the first clear definition, or component labels whose surrounding
   prose explains the concept.
4. Do include tips inside deep-dive appendix content, fallback copy, and the
   introduction when those pages are in scope.
5. When Chinese mirroring is required, mirror each English tip into idiomatic
   Simplified Chinese at the matching term. Preserve the `{% tip '...' %}`
   shortcode syntax and manually check that Chinese punctuation does not break
   Nunjucks parsing.

## Text Refinement And Term Highlight Gate

Imported lesson HTML is a draft, not a finished source of truth. Before any new
day is considered ready, refine the imported prose and audit visual term
highlighting in both languages.

1. Improve clarity, rhythm, transitions, and entertainment value where it helps
   the lesson without weakening accuracy or changing the teaching arc. Remove
   source-page boilerplate and smooth awkward imported phrasing.
2. Highlight inline concept definitions with `class="term"` even when no
   explanatory `{% tip %}` is needed. Do not limit term highlighting to terms
   that have tips.
3. Use term markup for first definitions or anchor mentions of specialist
   terms, named methods, theorems, positions, statistical measures, technical
   artifacts, and research labels. Do not mark every repeated mention, ordinary
   words, source titles, or biographical names unless they are the concept being
   taught.
4. Match the local English markup pattern for term elements (`em`, `span`, or
   `u` with `class="term"`). Do not use `<strong>` merely to create the term
   style.
5. In Chinese prose, use `span class="term"` for conceptual terms. Chinese
   terms are color-coded and bold through CSS; keep `span.hl` for sparse
   color-only emphasis. Avoid mechanically mirroring English italics or bold.
6. When English and Chinese versions both exist, sync the conceptual term set:
   each English highlighted definition should have a corresponding Chinese
   highlighted term at the matching location, and vice versa. Translations need
   not be word-for-word, but the teaching anchors should align.
7. Audit parity before completion, for example:

```sh
node -e 'const fs=require("fs"); for (const file of process.argv.slice(1)) { const s=fs.readFileSync(file,"utf8"); const terms=[...s.matchAll(/<(?:em|span|u)\s+class="term"[^>]*>(.*?)<\/(?:em|span|u)>/g)].map(m=>m[1].replace(/<[^>]+>/g,"").trim()); console.log(`${file}: ${terms.length}`); }' src/_includes/days/###-slug/{en,zh}.njk
```

   Equal counts are a quick signal, not a substitute for manually checking
   meaning, order, and placement.

## SEO Gate

Every new normal day is a public indexable page. Before a day is considered
ready, confirm its route shell supports the shared SEO system:

1. Keep front matter `title`, `summary`, `day`, `day_path`, `locale` when
   applicable, `permalink`, and `content_template` accurate. The shared base
   layout uses `summary` as the day meta description, Open Graph/Twitter
   description, and LearningResource JSON-LD description when no explicit
   `description` is present.
2. Write `summary` as a concise search-result snippet for the lesson, not as an
   internal note. It should identify the concrete puzzle/model and why the day
   matters.
3. Do not set `robots: noindex`, `sitemap_exclude: true`, `canonical_url`, or
   `seo_image` for normal day pages unless the user explicitly requests a
   special case and the reason is documented.
4. Preserve the same `day_path` across English and Chinese editions. The base
   layout derives canonical URLs, reciprocal `hreflang`, previous/next links,
   and day-specific social-card paths from this metadata.
5. Do not manually edit generated files in `src/assets/images/social/`. Run the
   build or `node scripts/generate-social-cards.mjs`; it creates/refreshes
   default and per-day PNG cards from route-shell front matter.
6. After building, run `npm run check:seo` or the full `npm run check`
   and fix any missing canonical, hreflang, sitemap, JSON-LD, or social-image
   issue before treating the addition as complete.

## Accessibility Gate

Every new or revised day must preserve the site's accessible reading and
interaction contract.

1. Every `<img>` in generated output must have an `alt` attribute. Use concise
   descriptive alt text for informative images, and `alt=""` only when the image
   is purely decorative or already fully described by adjacent text.
2. Every `svg role="img"` must have `aria-label` or `aria-labelledby`. SVGs
   that are decorative must be hidden with `aria-hidden="true"`.
3. Interactive controls must use native controls where possible. Icon-only
   buttons and compact controls need accessible names; selected/toggled state
   must use appropriate `aria-current`, `aria-pressed`, or `aria-checked` plus a
   valid role such as `switch`.
4. If a control has visible text, its accessible name must include that visible
   label so voice-control users can target what they see. Put the visible label
   first when adding extra context, for example `中文, Switch to Chinese`.
5. Landmark regions that repeat on the same page must have unique accessible
   names, for example top and bottom lesson navigation.
6. Heading levels must follow a logical sequence without skipping levels. Keep
   visual size separate from semantic level by styling classes/selectors rather
   than jumping from `h2` to `h4`.
7. Dynamic verdicts, counters, and simulation/readout text that changes after
   user input must be reachable to screen readers, usually through
   `aria-live="polite"` on the changing output region.
8. Do not rely on color alone for meaning. Pair color/status with text labels,
   symbols, or structural copy, and keep small text/color-token choices within
   WCAG AA contrast.
9. SVG figure labels must remain readable across outputs. Keep SVG `text` and
   inherited SVG label sizes at or above the sitewide minimum enforced by
   `npm run check:svg-text`; widen spacing or simplify labels instead of
   shrinking text below the gate.
10. Keyboard focus must remain visible and logical through navigation,
   disclosure widgets, sliders, and lesson interactions.
11. When Chinese mirroring is in scope, translate user-facing alt text,
   `aria-label`, `aria-labelledby` text, button labels, and fallback copy into
   idiomatic Simplified Chinese while preserving IDs, classes, and JS hooks.
12. Run `npm run check:a11y` directly or through `npm run check` and fix
   failures before treating the day as complete. The check gate enforces all
   generated images having `alt`, named `role="img"` SVGs, named links/buttons,
   visible-label/name matching, valid `aria-checked` roles, heading order,
   unique landmark names, and axe tests for every non-print page.

## Output-Variant Copy Gate

Every interactive, animated, or web-only component needs reader-visible copy
for each output mode. Do not let web instructions leak into print or EPUB.

1. Shared prose must not say the reader can click, drag, toggle, press buttons,
   move sliders, run a live simulation, use a widget, or use "the next panel"
   unless that exact affordance exists in every output mode.
2. Put web instructions in `.web-only` copy beside the live component.
3. Put print/EPUB instructions in `.epub-only.print-only` copy that names the
   static artifact the reader actually gets: a table, diagram, worked example,
   reference note, or calculation.
4. Fallback copy must not call itself "static", "print form", "PDF/EPUB
   version", "canned", or an inferior substitute. Describe the useful object.
5. In Chinese, apply the same split idiomatically: web copy may mention
   `交互`, `点击`, `拖动`, `切换`, `按钮`, `滑块`, or `实时模拟`; fallback copy should
   name `表格`, `示意图`, `算例`, or `参考说明` instead.
6. After editing, run the target-day checklist. It scans common leaks such as
   shared copy immediately before `.panel.web-only` and fallback-only copy that
   still mentions absent controls.

## Workflow

1. Identify day number, title, block, entry analogy, model, debate, and frontier from `src/_data/syllabus-data.yaml`.
2. Convert the supplied HTML into the two-file day structure:
   - route shell: `src/days/day-###-slug.md`
   - lesson body: `src/_includes/days/###-slug/en.njk`
   Use `scripts/import-day-from-html.mjs` when it fits the source, then correct front matter from the syllabus as needed.
   Confirm the route shell passes the SEO Gate before moving on.
3. Review the lesson text:
   - preserve the teaching arc and voice
   - run the Text Refinement And Term Highlight Gate before treating imported HTML as finished text
   - run the Fact-Check Gate before keeping or adding factual claims
   - run the Explanatory Tip Gate for first-use specialist terms and mirror the tips into Chinese when Chinese mirroring is in scope
   - verify direct quotes against the original publication, transcript, archive scan, or reliable reproduction; paraphrase uncertain wording
   - keep citations tied to the claims they support
   - label frontier claims as established, promising hint, or contested/hype
   - add concrete callbacks to previous published days
   - after the new route exists, run a forward-pointer sweep across all earlier
     published English and Chinese lesson includes, including appendix content:
     search `src/_data/future-links.yaml` plus source text for the new day
     number, title, slug, and distinctive callback phrases; every reference to
     the newly published day should link to its route in that edition, not
     remain plain text such as `<strong>Day N</strong>` or
     `<strong>第 N 日</strong>`
   - verify all resolved `future-links.yaml` entries for the new target day have
     matching source links or deliberately documented prose callbacks
   - verify the inline `class="tomorrow"` block: if the next day already has a published route, link its title to that route; if the next day is not published yet, preview it without adding a broken link
   - update the previous published day's inline `class="tomorrow"` block in
     both English and Chinese when adding day N: the `<h3>` text must match the
     new route-shell `title` exactly, the link must point to the new
     `permalink`, and the preview paragraph must summarize the actual finished
     lesson rather than stale syllabus/import-placeholder copy
   - leave future callbacks in `src/_data/future-links.yaml`
   - improve readability, clarity, rhythm, and entertainment value when doing so helps the lesson without weakening accuracy
4. Update the English introduction opening-arc paragraph in `src/pages/introduction.md`:
   - summarize the published opening arc and newest day
   - keep it concise, normally one short paragraph
   - when Chinese mirroring is required, use `180-descent-chinese-edition` for the matched `src/zh/introduction.md` update
   - when using `180-descent-chinese-edition`, follow its translator order: Gemini first, then Kimi review, then GLM review
   - follow its Slow-Agent Rule for Kimi and GLM; do not interrupt or substitute those passes just because they are quiet for several minutes
5. When Chinese mirroring is required by default or explicitly requested, run the `180-descent-chinese-edition` Normal Day Workflow for the main route shell and lesson body:
   - translate the normal day content with Gemini, then run Kimi and GLM refinement passes
   - follow the Slow-Agent Rule for Kimi and GLM; they can be very slow on main lesson content, not just appendices
   - do not interrupt, replace, or truncate either pass merely because it is quiet for several minutes
   - manually review the resulting Chinese route shell, lesson include, terminology, interactive text, citations, URLs, DOI metadata, and Nunjucks/HTML structure
   - apply the Chinese Typography Gate from `180-descent-chinese-edition`: remove dense emphasis; avoid `<em>/<i>/<strong>/<b>/<u>` in Chinese prose; use bold/color term spans (`span.term`), sparse color-only highlights (`span.hl`), and `「」` for the allowed highlight system; prefer `「」`/`《》` where markup is only acting as voice, quotation, or title; preserve semantic status, diagram, and component-state color
6. For every interactive piece, provide all variants:
   - live web UI
   - no-JS EPUB fallback
   - static PDF fallback
   Put live behavior in `src/assets/js/interactions/*.js` and list each module in the route shell `scripts:` front matter. Keep `src/assets/js/book.js` for truly global behavior only. Prefer semantic HTML/CSS diagrams with print/EPUB fallbacks over raw inline SVG when layout can be expressed with normal boxes and text.
   Run the Output-Variant Copy Gate on surrounding prose so web-only affordance
   language is split from print/EPUB fallback language.
7. Prefer existing components, CSS classes, and interaction modules before inventing new ones.
8. Run the Accessibility Gate for any markup, images, SVGs, controls, live
   outputs, or fallback content added or changed by the day.
9. Run the Image Candidate Gate. If the user accepts any third-party image or bundled asset, switch to `180-descent-assets` before adding it.
10. Run the target-day checklist and project checks:

```sh
node docs/workflows/180-descent-add-day/scripts/add-day-checklist.mjs ###
npm run build
npm run check:seo
npm run check
```

When Chinese mirroring is required, run the checklist with `--require-zh`.

## Required Outputs

- Updated `src/days/day-###-slug.md` route shell with `content_template`, optional `scripts`, permalink, and `{% include content_template %}`
- SEO-ready day front matter: accurate `title`, snippet-quality `summary`,
  stable `day_path`, correct locale/permalink metadata, and no accidental
  `noindex`, `sitemap_exclude`, custom canonical, or stale custom social image
- Added or updated `src/_includes/days/###-slug/en.njk` lesson body
- Added or updated Chinese route shell, Chinese lesson include, `src/_data/syllabus_zh.yaml`, and `src/zh/introduction.md` when the repo has a Chinese edition unless the user explicitly skipped it
- Correct inline tomorrow block link behavior for both English and Chinese editions when present: published next days link to their route; unpublished next days remain unlinked
- Previous-day tomorrow blocks updated in both editions when present: linked
  title matches the new route title exactly, and the preview summary reflects
  the published lesson's real title, scope, and teaching arc
- Resolved forward pointers from earlier published days and appendices to the newly published day in both English and Chinese editions when present
- Updated concise opening-arc paragraph in `src/pages/introduction.md`
- Updated callbacks and pending future links
- Added first-use explanatory `{% tip %}` notes for specialist terms that are not common knowledge and are not already defined, with Chinese mirrors when the Chinese edition is in scope
- Refined imported prose and synced `class="term"` highlights for inline
  concept definitions across English and Chinese, including terms that do not
  need explanatory tips
- Completed Image Candidate Gate outcome: accepted candidates added through
  `180-descent-assets`, or proposed/rejected/no-useful-candidate status reported
  to the user before commit/publish
- Added or reused `src/assets/js/interactions/*.js` modules for live components, with adjacent print/EPUB fallbacks in the lesson body
- Output-Variant Copy Gate completed: web-only prose describes live controls;
  print/EPUB prose describes the actual fallback table, diagram, worked
  example, or note; no shared or fallback copy tells book readers to use absent
  controls
- Accessibility Gate completed: image alt text, SVG names, control names/states,
  visible-label/name matching, unique landmarks, heading order, live readouts,
  keyboard focus, contrast, and Chinese accessible-label parity are covered,
  with `check:a11y` passing
- Generated or refreshed social-card PNGs through
  `scripts/generate-social-cards.mjs`, with `check:seo` passing for canonical,
  hreflang, sitemap, JSON-LD, and social-image coverage
- Passing target-day checklist, site build, EPUB/PDF build, link/content checks,
  accessibility checks, EPUB structural checks, and PDF checks

Do not edit generated files in `_site/` or `dist/`; they are build outputs.
