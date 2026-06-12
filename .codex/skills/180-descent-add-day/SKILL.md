---
name: 180-descent-add-day
description: Add a new English day page to The 180-Day Descent repo from a supplied HTML lesson, using the route-shell plus lesson-include convention, reviewing factual claims and sources, adding callbacks, and providing web/EPUB/PDF component variants. Use when Codex needs to import or create a normal day lesson under src/days/ and src/_includes/days/.
---

# Add A Day To 180 Descent

Use this skill for the core English day-add workflow only.

Use adjacent skills when the request includes their scope:

- Chinese mirroring or translation: `180-descent-chinese-edition`
- Deep-dive appendices: `180-descent-add-appendix`
- Images, credits, compression, EPUB/PDF asset handling: `180-descent-assets`
- Commit, push, deploy, or human refinement gate: `180-descent-publish`

## First Files To Read

1. `src/_data/syllabus.yaml`
2. The supplied day HTML file
3. `src/_data/future-links.yaml`
4. Existing nearby route shells in `src/days/` and lesson bodies in `src/_includes/days/`
5. If needed:
   - `references/lesson-schema.md`
   - `references/component-contract.md`

Read the syllabus entry for the target day plus the immediately previous and next days.

## Fact-Check Gate

Before any new English day is considered ready, run a claim-level factual review. Treat every factual claim you are not personally 100% sure about as needing verification.

1. Inventory factual claims by local file and line: dates, chronology, publication metadata, names/titles, quotes, numbers, statistical results, legal/regulatory/current claims, technical capabilities, "first/largest/only" superlatives, and claims about contested frontier work.
2. Verify against the strongest practical source:
   - primary papers, books, official project pages, standards, repositories, release notes, datasets, or competition pages
   - reputable publisher pages, DOI records, SEP/IEP entries, PubMed/arXiv pages, or institutional pages when primary text is unavailable
   - avoid relying on Wikipedia except as a pointer to better sources
3. Browse for current or unstable claims, including model capabilities, software/library status, live statistics, leadership, prices, laws, standards, recent papers, and anything dated "latest", "current", "today", or this year.
4. Check direct quotes against the original publication, transcript, archive scan, or a reliable reproduction. If the exact wording cannot be verified, paraphrase and cite the source.
5. Check numbers by recalculating when possible: percentages, sample sizes, score thresholds, table rows, totals, and "X of Y" statements. Note whether a count includes trivial cases or self-pairs.
6. Audit wording for overclaiming. Soften unsupported superlatives, absolute guarantees, causal claims, and "settled" labels unless the cited source really supports them. Mark frontier items as established, promising hint, or contested/hype.
7. Keep citations adjacent to the claims they support. If a source supports only part of a sentence, revise the sentence or add the missing source.
8. When Chinese is in scope, mirror every factual correction into the Chinese route/include and manually verify dates, numbers, names, source metadata, URLs, DOI strings, and evidence labels after translation.

Do not proceed to commit/publish until this gate has been completed and any issues have been fixed or explicitly reported to the user.

## Workflow

1. Identify day number, title, block, entry analogy, model, debate, and frontier from `src/_data/syllabus.yaml`.
2. Convert the supplied HTML into the two-file day structure:
   - route shell: `src/days/day-###-slug.md`
   - lesson body: `src/_includes/days/###-slug/en.njk`
   Use `scripts/import-day-from-html.mjs` when it fits the source, then correct front matter from the syllabus as needed.
3. Review the lesson text:
   - preserve the teaching arc and voice
   - run the Fact-Check Gate before keeping or adding factual claims
   - verify direct quotes against the original publication, transcript, archive scan, or reliable reproduction; paraphrase uncertain wording
   - keep citations tied to the claims they support
   - label frontier claims as established, promising hint, or contested/hype
   - add concrete callbacks to previous published days
   - verify the inline `class="tomorrow"` block: if the next day already has a published route, link its title to that route; if the next day is not published yet, preview it without adding a broken link
   - leave future callbacks in `src/_data/future-links.yaml`
   - improve readability, clarity, rhythm, and entertainment value when doing so helps the lesson without weakening accuracy
4. Update the English introduction opening-arc paragraph in `src/pages/introduction.md`:
   - summarize the published opening arc and newest day
   - keep it concise, normally one short paragraph
   - if Chinese is also in scope, use `180-descent-chinese-edition` for the matched `src/zh/introduction.md` update
   - when using `180-descent-chinese-edition`, follow its Slow-Agent Rule for Kimi and GLM; do not interrupt or substitute those passes just because they are quiet for several minutes
5. If Chinese mirroring is in scope for the day, run the `180-descent-chinese-edition` Normal Day Workflow for the main route shell and lesson body:
   - translate the normal day content with Kimi and run the GLM refinement pass
   - follow the Slow-Agent Rule for both agents; they can be very slow on main lesson content, not just appendices
   - do not interrupt, replace, or truncate either pass merely because it is quiet for several minutes
   - manually review the resulting Chinese route shell, lesson include, terminology, interactive text, citations, URLs, DOI metadata, and Nunjucks/HTML structure
6. For every interactive piece, provide all variants:
   - live web UI
   - no-JS EPUB fallback
   - static PDF fallback
   Put live behavior in `src/assets/js/interactions/*.js` and list each module in the route shell `scripts:` front matter. Keep `src/assets/js/book.js` for truly global behavior only. Prefer semantic HTML/CSS diagrams with print/EPUB fallbacks over raw inline SVG when layout can be expressed with normal boxes and text.
7. Prefer existing components, CSS classes, and interaction modules before inventing new ones.
8. If images or other bundled assets would improve the lesson, switch to `180-descent-assets` before adding them.
9. Run the target-day checklist and project checks:

```sh
rtk node .codex/skills/180-descent-add-day/scripts/add-day-checklist.mjs ###
rtk npm run build
rtk npm run check
```

## Required Outputs

- Updated `src/days/day-###-slug.md` route shell with `content_template`, optional `scripts`, permalink, and `{% include content_template %}`
- Added or updated `src/_includes/days/###-slug/en.njk` lesson body
- Correct inline tomorrow block link behavior for both English and Chinese editions: published next days link to their route; unpublished next days remain unlinked
- Updated concise opening-arc paragraph in `src/pages/introduction.md`
- Updated callbacks and pending future links
- Added or reused `src/assets/js/interactions/*.js` modules for live components, with adjacent print/EPUB fallbacks in the lesson body
- Passing target-day checklist, site build, EPUB/PDF build, link/content checks, EPUB structural checks, and PDF checks

Do not edit generated files in `_site/` or `dist/`; they are build outputs.
