---
name: 180-descent-add-appendix
description: Legacy appendix workflow, paused during the clean-break Astro/MDX refactor. Do not append imported HTML into Nunjucks lesson bodies. Use only as historical editorial guidance until the paired-MDX appendix workflow replaces it.
---

# Add A Deep-Dive Appendix

## Refactor Freeze

This legacy workflow is paused while the project migrates to the clean-break Astro/MDX paired content model. Do not add appendices to `src/_includes/days/` and do not use or recreate blind HTML importers. New appendices resume only after the typed paired-MDX appendix workflow is complete.

Use this when the user provides a `day-##-appendix-*.html` file for an already published day.

## Fact-Check Gate

Appendices use the same claim-level review standard as normal days. Before keeping imported appendix text, treat every factual claim you are not personally 100% sure about as needing verification.

1. Inventory claims by local file and line, including dates, chronology, publication metadata, names/titles, quotes, numbers, statistical results, current claims, technical capabilities, "first/largest/only" superlatives, and frontier claims.
2. Verify against primary or strongest-available sources: original papers/books, DOI or publisher pages, official project pages, repositories, datasets, competition pages, SEP/IEP entries, PubMed/arXiv pages, or institutional pages.
3. For every scholarly source in appendix source lists, search DOI metadata and
   add a DOI plus `https://doi.org/...` link when a high-confidence exact match
   exists. Verify title, authors, year, venue, volume/issue, and pages against
   DOI/publisher metadata before adding it. Do not invent or add near-match
   DOIs; if no reliable DOI is found, leave the source without one.
4. Browse for current or unstable claims and compare dates carefully. Do not assume model, software, standards, law, leadership, or "latest" claims are still current.
5. Check direct quotes against original or reliable reproductions; paraphrase if exact wording is uncertain.
6. Recalculate numbers when possible and clarify count definitions, such as whether totals include trivial cases, self-pairs, exclusions, failed attempts, or completed-only denominators.
7. Audit wording for overclaiming. Soften unsupported superlatives, absolute guarantees, causal claims, and "settled" labels. Mark frontier claims as established, promising hint, or contested/hype.
8. Keep citations adjacent to supported claims, and revise any sentence whose source supports only part of the claim.
9. Keep source-screening methodology out of audience-facing prose. Apply date, source, and credibility rules internally; do not add meta notes such as "per the syllabus's standing rule" to appendix copy. Use ordinary prose, evidence labels, or source-list metadata instead.
10. If the target day has a Chinese edition, mirror all factual corrections into the Chinese appendix/include and manually verify numerical/date/citation parity after translation.

Do not proceed to commit/publish until this gate has been completed and any issues have been fixed or explicitly reported to the user.

## Explanatory Tip Gate

Appendices use the same reader-assistance standard as normal days. Before an
appendix is considered ready, review it as a smart bachelor-degree holder who
is not a specialist in the topic. Add a short explanatory tip for any first-use
term, theorem, named method, technical artifact, statistical measure,
philosophical position, current research label, or institutional acronym that
is not common knowledge at that level and is not already defined before or
immediately during the mention.

1. Add tips with the global shortcode immediately after the term:
   `{% tip 'Brief plain-language explanation.' %}`. On the website this renders
   as a tappable `?` tip box; PDF and EPUB exports render numbered footnotes,
   not inline parenthetical text after the term.
2. Keep tips brief and explanatory, not source citations. They should define the
   term or clarify why it matters in one sentence.
3. Do not over-annotate ordinary words, terms already defined nearby, repeated
   uses after the first clear definition, or component labels whose surrounding
   prose explains the concept.
4. If the target day has a Chinese edition, mirror each English tip into
   idiomatic Simplified Chinese at the matching term. Preserve the
   `{% tip '...' %}` shortcode syntax and manually check that Chinese punctuation
   does not break Nunjucks parsing.

## Text Refinement And Term Highlight Gate

Imported appendix HTML is a draft, not a finished source of truth. Before an
appendix is considered ready, refine the imported prose and audit visual term
highlighting in both languages when Chinese is in scope.

1. Improve clarity, rhythm, transitions, and entertainment value where it helps
   the appendix without weakening accuracy or changing the teaching arc. Remove
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

## Appendix Style Parity Gate

Deep-dive appendices must look and behave like the rest of the project in web,
EPUB, and PDF output. Do not preserve imported page-specific wrappers just
because they render in a browser.

1. Use the standard appendix shell:
   `<details class="deep-dive">`, a `<summary>` containing `.ptitle`,
   `.deep-dive-title`, and `.deep-dive-sub`, followed by
   `<div class="deep-dive-body">`. Keep the whole appendix inside the day
   include's normal `<div class="wrap">` content container; do not close the
   wrapper before `<!-- deep-dive:start -->`.
2. Put appendix sections inside semantic `<section>` blocks and use the shared
   heading pattern:
   `<p class="sec-eyebrow"><span class="n">§/Part/Movement label</span></p>`
   followed by the real heading. Do not add local wrappers such as
   `movement`, `dispatch`, `mv-num`, or `dp-num`.
3. Use existing shared components (`panel`, `aside`, `format-alt`, `roadmap`,
   `continues`, `recap`, `sources`, `alt-table`) or explicitly shared appendix
   components (`appendix-card-grid`, `appendix-card`, `appendix-timeline`,
   `appendix-figure`, `appendix-caption`, `appendix-note`, `source-note`,
   `table-subnote`, `chip-inline`, `tone-*`, `u-m-0`).
   Avoid generic imported classes such as `cards`, `card`, `tl`, `ttable`, and
   `warnstrip`. Do not reuse main-lesson layout wrappers such as `whereblock`
   inside appendices; use `continues` instead. If a new component is truly
   needed, add shared CSS whose selector is not tied to a day number or appendix
   id, then make it pass the appendix style check.
4. Do not use raw `<br>` elements for vertical spacing. Use block structure and
   shared CSS; line breaks are acceptable only for intentional inline/table-cell
   breaks.
5. Do not use inline `style="..."` attributes inside appendix source markup.
   Put static presentation in shared classes in `src/assets/css/book.css`.
   Runtime JS may update element style properties after load, but source markup
   should remain class-driven. SVG drawing attributes such as `fill`, `stroke`,
   `font-size`, and `opacity` are acceptable when they are part of the diagram.
6. Do not add day-scoped appendix classes or CSS selectors such as
   `.d003-*`, `.day-003-*`, `.appendix-d003-*`, or `#appendix-d003...` to CSS.
   IDs in markup should still be namespaced for JS/SVG uniqueness, but styling
   must come from reusable component or utility classes.
7. Run `npm run check:appendix-style` after adding or changing appendix
   markup. This gate scans every deep-dive source block for unowned classes,
   missing shell structure, escaped `.wrap` containers, inline styles,
   day-scoped CSS/classes, and raw spacing breaks that would cause style drift.

## Dark Theme Gate

Always consider the dark theme when adding or changing visual surfaces: recap
boxes, asides, panels, cards, appendix figures, SVG diagrams, image-backed SVGs,
interactive components, and generated or bundled assets. Avoid hard-coded light
backgrounds or dark ink that turn into bright blocks at night. Use theme tokens,
dark-mode overrides, or explicit light/dark asset variants, and verify the
affected page with the theme toggle before treating the appendix as complete.

## SEO Preservation Gate

Appendices do not normally create separate public URLs, but they can change the
quality of an existing day's indexable page. When adding or revising an
appendix:

1. Preserve the target route shell's `title`, `summary`, `day_path`,
   `permalink`, locale, and canonical/indexing metadata unless a deliberate SEO
   update is part of the task.
2. If the appendix changes the main page's search intent or makes the existing
   `summary` misleading, update the English summary and mirror the change into
   Chinese when that edition exists.
3. Do not manually edit generated social cards. Run `npm run build` or
   `npm run build:social-cards` after route-shell summary/title
   changes.
4. Run `npm run check:seo` or the full project check before treating the
   appendix as complete.

## Accessibility Gate

Appendices share the normal day accessibility standard because they render into
the same public day pages and deep-dive artifacts.

1. Every `<img>` in generated output must have an `alt` attribute. Use concise
   descriptive alt text for informative images, and `alt=""` only for purely
   decorative or redundant images.
2. Every `svg role="img"` must have `aria-label` or `aria-labelledby`; hide
   decorative SVGs with `aria-hidden="true"`.
3. Live appendix controls must use native buttons, inputs, and semantic tables
   where possible. Compact/icon controls need accessible names, and stateful
   controls must expose `aria-pressed`, `aria-checked` with a valid role, or
   other appropriate state.
4. If a control has visible text, its accessible name must include that visible
   label so voice-control users can target what they see.
5. Repeated landmarks must have unique accessible names, and appendix-added
   navigation/regions must not duplicate existing page landmark names.
6. Appendix headings must fit the page hierarchy without skipping levels; style
   a semantic heading rather than jumping levels for visual size.
7. Changing verdicts, counters, charts, or simulation readouts must have a
   screen-reader path, usually an `aria-live="polite"` region.
8. Do not rely on color alone for claims, verdicts, diagram keys, or state.
   Pair color with visible text, symbols, or structure, and keep small text at
   WCAG AA contrast.
9. SVG figure labels must remain readable across outputs. Keep SVG `text` and
   inherited SVG label sizes at or above the sitewide minimum enforced by
   `npm run check:svg-text`; widen spacing or simplify labels instead of
   shrinking text below the gate.
10. EPUB/PDF fallbacks must preserve the same information in accessible static
   form: real tables, labelled diagrams, or worked examples rather than empty
   visual placeholders.
11. If Chinese mirroring is in scope, translate alt text, accessible labels,
   button text, and fallback copy into idiomatic Simplified Chinese while
   preserving classes, IDs, and JS hooks.
12. Run `npm run check:a11y` directly or through `npm run check` before
   treating the appendix as complete.

## Output-Variant Copy Gate

Appendix interactions must have separate copy for web and static outputs.

1. Shared appendix prose must not tell readers to click, drag, toggle, press
   buttons, move sliders, run a live simulation, use a widget, or use "the next
   panel" unless that affordance exists in web, EPUB, and PDF.
2. Put live instructions in `.web-only` copy beside the live component.
3. Put static instructions in `.epub-only.print-only` copy that names the table,
   diagram, worked example, reference note, or calculation present in the
   fallback.
4. Do not describe fallbacks as "static", "print form", "PDF/EPUB version",
   "canned", or an inferior substitute. Name the useful artifact.
5. In Chinese appendices, split the copy the same way: web copy may mention
   `交互`, `点击`, `拖动`, `切换`, `按钮`, `滑块`, or `实时模拟`; fallback copy should
   name `表格`, `示意图`, `算例`, or `参考说明`.
6. Run the target-day checklist after insertion; it scans common web-copy leaks
   around `.panel.web-only` components and fallback-only control language.

## Workflow

1. Identify the target day from the filename or user message, then stop unless the work is explicitly part of the paired-MDX migration.
2. During the refactor freeze, treat any source HTML as reference material for manual paired-MDX conversion. Do not append imported HTML into legacy Nunjucks lesson bodies.
3. When reviewing legacy appendix material for migration, inspect the existing `src/_includes/days/###-slug/en.njk` block marked by `<!-- deep-dive:start -->` and `<!-- deep-dive:end -->`:
   - web version is a folded `<details class="deep-dive">` section headed by the appendix title, usually "The Rest of the Map"
   - live web components are class-scoped, not ID-scoped, so repeated appendices do not conflict
   - live components have adjacent `.format-alt.epub-only.print-only` static fallbacks
   - PDF/EPUB fallbacks are tables or semantic HTML diagrams, not empty space
   - run the Output-Variant Copy Gate so reader-visible PDF/EPUB prose names
     the artifact readers actually get and shared web-control instructions are
     split into `.web-only` plus `.epub-only.print-only` copy
   - imported IDs are namespaced with `appendix-d###-`
   - newly required interaction modules are listed in route-shell `scripts:` front matter
4. Review appendix text and sources with the add-day standard:
   - run the Text Refinement And Term Highlight Gate before treating imported HTML as finished text
   - run the Fact-Check Gate before keeping factual claims
   - run the Explanatory Tip Gate for first-use specialist terms and mirror the tips into Chinese when Chinese mirroring is in scope
   - for recent or current claims, verify against primary sources or reliable publication pages
   - keep citations tied to the claims they support
   - label frontier claims as established, promising hint, or contested/hype
   - remove source-page boilerplate such as "Receipts" if it violates project checks
5. Run the Accessibility Gate for any images, SVGs, controls, live outputs,
   fallback artifacts, or Chinese accessible labels added or changed by the
   appendix.
6. Run the Appendix Style Parity Gate whenever appendix markup or CSS changes.
7. Update `src/_data/future-links.yaml` for new future callbacks.
8. Preserve output separation:
   - standard EPUB/PDF: omit appendix content
   - deep-dive EPUB/PDF: include appendix content
   - PDF: no interactive controls; require static fallback representation
   - EPUB/PDF copy: describe only the fallback table, diagram, worked example,
     or note the reader can use
9. If the English target day already has a Chinese route/include, Chinese mirroring is required unless the user explicitly asked for English-only. Use `180-descent-chinese-edition` Appendix Translation:
   - translate only the new appendix into Simplified Chinese with Gemini using explicit temporary input/output files
   - run Kimi review after Gemini, then GLM refinement
   - expect Kimi review and GLM refinement to be very slow on long appendix HTML; keep polling and let them finish unless they exit with an error or the user explicitly tells you to stop
   - do not replace Kimi or GLM with a different reviewer just because the process is quiet for several minutes
   - insert it into the matching Chinese include without disturbing existing appendices
   - run the GLM refinement pass
   - manually review preservation of HTML structure, comments, classes, ids, data attributes, fallbacks, citations, URLs, DOI metadata, scripts, and terminology
10. If images or other bundled assets are introduced, use `180-descent-assets`.
11. Run the project checks:

```sh
npm run build
npm run check:appendix-style
npm run check:seo
npm run check
```

   Omit `--require-zh` only when the day has no Chinese edition or the user explicitly requested English-only.
12. Verify artifacts:
   - inspect `OEBPS/day-###.xhtml` inside both standard and deep-dive EPUB editions
   - extract PDF text with Ghostscript `txtwrite`
   - confirm standard files omit appendix headings and deep-dive files include fallback headings
   - when zh is in scope, repeat the same omission/inclusion checks for Chinese EPUB/PDF/day-specific artifacts
13. Commit only after verification and any requested human refinement are complete; use `180-descent-publish` for commit/push/deploy.

Do not edit generated files in `_site/` or `dist/`.
