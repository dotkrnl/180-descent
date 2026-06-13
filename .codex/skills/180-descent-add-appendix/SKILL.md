---
name: 180-descent-add-appendix
description: Add a deep-dive appendix to an existing The 180-Day Descent day from a supplied appendix HTML file, refining imported prose, highlighting inline terms, preserving standard versus deep-dive output separation, route shell scripts, static fallbacks, source/factual review, future callbacks, Chinese mirroring for days that have zh editions, and full artifact verification.
---

# Add A Deep-Dive Appendix

Use this when the user provides a `day-##-appendix-*.html` file for an already published day.

## Fact-Check Gate

Appendices use the same claim-level review standard as normal days. Before keeping imported appendix text, treat every factual claim you are not personally 100% sure about as needing verification.

1. Inventory claims by local file and line, including dates, chronology, publication metadata, names/titles, quotes, numbers, statistical results, current claims, technical capabilities, "first/largest/only" superlatives, and frontier claims.
2. Verify against primary or strongest-available sources: original papers/books, DOI or publisher pages, official project pages, repositories, datasets, competition pages, SEP/IEP entries, PubMed/arXiv pages, or institutional pages.
3. Browse for current or unstable claims and compare dates carefully. Do not assume model, software, standards, law, leadership, or "latest" claims are still current.
4. Check direct quotes against original or reliable reproductions; paraphrase if exact wording is uncertain.
5. Recalculate numbers when possible and clarify count definitions, such as whether totals include trivial cases, self-pairs, exclusions, failed attempts, or completed-only denominators.
6. Audit wording for overclaiming. Soften unsupported superlatives, absolute guarantees, causal claims, and "settled" labels. Mark frontier claims as established, promising hint, or contested/hype.
7. Keep citations adjacent to supported claims, and revise any sentence whose source supports only part of the claim.
8. If the target day has a Chinese edition, mirror all factual corrections into the Chinese appendix/include and manually verify numerical/date/citation parity after translation.

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
rtk node -e 'const fs=require("fs"); for (const file of process.argv.slice(1)) { const s=fs.readFileSync(file,"utf8"); const terms=[...s.matchAll(/<(?:em|span|u)\s+class="term"[^>]*>(.*?)<\/(?:em|span|u)>/g)].map(m=>m[1].replace(/<[^>]+>/g,"").trim()); console.log(`${file}: ${terms.length}`); }' src/_includes/days/###-slug/{en,zh}.njk
```

   Equal counts are a quick signal, not a substitute for manually checking
   meaning, order, and placement.

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
3. Do not manually edit generated social cards. Run `rtk npm run build` or
   `rtk node scripts/generate-social-cards.mjs` after route-shell summary/title
   changes.
4. Run `rtk npm run check:seo` or the full project check before treating the
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
9. EPUB/PDF fallbacks must preserve the same information in accessible static
   form: real tables, labelled diagrams, or worked examples rather than empty
   visual placeholders.
10. If Chinese mirroring is in scope, translate alt text, accessible labels,
   button text, and fallback copy into idiomatic Simplified Chinese while
   preserving classes, IDs, and JS hooks.
11. Run `rtk npm run check:a11y` directly or through `rtk npm run check` before
   treating the appendix as complete.

## Workflow

1. Identify the target day from the filename or user message. Check whether the day already has `src/zh/days/day-###-*.md` and `src/_includes/days/###-*/zh.njk`.
2. Import with:

```sh
rtk node scripts/import-appendix-from-html.mjs /absolute/path/to/day-##-appendix-*.html ##
```

3. Review the resulting `src/_includes/days/###-slug/en.njk` block marked by `<!-- deep-dive:start -->` and `<!-- deep-dive:end -->`:
   - web version is a folded `<details class="deep-dive">` section headed by the appendix title, usually "The Rest of the Map"
   - live web components are class-scoped, not ID-scoped, so repeated appendices do not conflict
   - live components have adjacent `.format-alt.epub-only.print-only` static fallbacks
   - PDF/EPUB fallbacks are tables or semantic HTML diagrams, not empty space
   - reader-visible PDF/EPUB prose names the artifact readers actually get
     (table, diagram, worked example, note), not "static", "print form", or an
     absent widget
   - shared prose that says "drag", "click", "try below", "interactive",
     "widget", or similar is split into `.web-only` copy plus
     `.epub-only.print-only` copy for the fallback
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
6. Update `src/_data/future-links.yaml` for new future callbacks.
7. Preserve output separation:
   - standard EPUB/PDF: omit appendix content
   - deep-dive EPUB/PDF: include appendix content
   - PDF: no interactive controls; require static fallback representation
   - EPUB/PDF copy: describe only the fallback table, diagram, worked example,
     or note the reader can use
8. If the English target day already has a Chinese route/include, Chinese mirroring is required unless the user explicitly asked for English-only. Use `180-descent-chinese-edition` Appendix Translation:
   - translate only the new appendix into Simplified Chinese with Gemini using explicit temporary input/output files
   - run Kimi review after Gemini, then GLM refinement
   - expect Kimi review and GLM refinement to be very slow on long appendix HTML; keep polling and let them finish unless they exit with an error or the user explicitly tells you to stop
   - do not replace Kimi or GLM with a different reviewer just because the process is quiet for several minutes
   - insert it into the matching Chinese include without disturbing existing appendices
   - run the GLM refinement pass
   - manually review preservation of HTML structure, comments, classes, ids, data attributes, fallbacks, citations, URLs, DOI metadata, scripts, and terminology
9. If images or other bundled assets are introduced, use `180-descent-assets`.
10. Run the target-day checklist and project checks:

```sh
rtk node .codex/skills/180-descent-add-day/scripts/add-day-checklist.mjs ### --require-zh
rtk npm run build
rtk npm run check:seo
rtk npm run check
```

   Omit `--require-zh` only when the day has no Chinese edition or the user explicitly requested English-only.
11. Verify artifacts:
   - inspect `OEBPS/day-###.xhtml` inside both standard and deep-dive EPUB editions
   - extract PDF text with Ghostscript `txtwrite`
   - confirm standard files omit appendix headings and deep-dive files include fallback headings
   - when zh is in scope, repeat the same omission/inclusion checks for Chinese EPUB/PDF/day-specific artifacts
12. Commit only after verification and any requested human refinement are complete; use `180-descent-publish` for commit/push/deploy.

Do not edit generated files in `_site/` or `dist/`.
