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

## Workflow

1. Identify day number, title, block, entry analogy, model, debate, and frontier from `src/_data/syllabus.yaml`.
2. Convert the supplied HTML into the two-file day structure:
   - route shell: `src/days/day-###-slug.md`
   - lesson body: `src/_includes/days/###-slug/en.njk`
   Use `scripts/import-day-from-html.mjs` when it fits the source, then correct front matter from the syllabus as needed.
3. Review the lesson text:
   - preserve the teaching arc and voice
   - fact-check factual claims, quotes, citations, DOI/URL metadata, dates, and result numbers before keeping or adding them
   - verify direct quotes against the original publication, transcript, archive scan, or reliable reproduction; paraphrase uncertain wording
   - keep citations tied to the claims they support
   - label frontier claims as established, promising hint, or contested/hype
   - add concrete callbacks to previous published days
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
- Updated concise opening-arc paragraph in `src/pages/introduction.md`
- Updated callbacks and pending future links
- Added or reused `src/assets/js/interactions/*.js` modules for live components, with adjacent print/EPUB fallbacks in the lesson body
- Passing target-day checklist, site build, EPUB/PDF build, link/content checks, EPUB structural checks, and PDF checks

Do not edit generated files in `_site/` or `dist/`; they are build outputs.
