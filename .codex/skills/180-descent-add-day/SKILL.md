---
name: 180-descent-add-day
description: Add a new day page to The 180-Day Descent repo from a supplied HTML lesson, improving content, citations, callbacks, future links, and web/EPUB/PDF component variants while preserving the project's static-book build flow.
---

# Add A Day To 180 Descent

Use this skill when the user provides a new day page for this repository.

## First Files To Read

1. `src/_data/syllabus.yaml`
2. The supplied day HTML file
3. `src/_data/future-links.yaml`
4. Existing nearby day files in `src/days/`
5. If needed:
   - `references/lesson-schema.md`
   - `references/component-contract.md`
   - `references/citation-and-image-policy.md`

Read the syllabus entry for the target day plus the immediately previous and next days.

## Workflow

1. Identify day number, title, block, entry analogy, model, debate, and frontier from `src/_data/syllabus.yaml`.
2. Convert the supplied HTML into `src/days/day-###-slug.md` with the canonical front matter.
3. Review the lesson text:
   - preserve the teaching arc and voice
   - fix factual issues
   - label frontier claims as established, promising hint, or contested/hype
   - add concrete callbacks to previous published days
   - leave future callbacks in `src/_data/future-links.yaml`
4. Update `src/pages/introduction.md`:
   - keep the paragraph that begins with "The first two days set the tone" concise
   - refresh it each day so it summarizes the published opening arc and the newest day without becoming a running catalog
   - keep it to one short paragraph unless the user explicitly asks for a longer introduction
5. For every interactive piece, provide all variants:
   - live web UI
   - no-JS EPUB fallback
   - static PDF fallback
   Prefer semantic HTML/CSS diagrams with print/EPUB fallbacks over raw inline SVG when layout can be expressed with normal boxes and text.
6. Prefer existing components and CSS classes before inventing new ones.
7. Add copyright-safe local assets only when they improve readability.
8. Run:

```sh
rtk npm run build
rtk npm run check
```

9. Inspect the built website and downloads before committing.
10. Commit a small batch with a conventional message, usually `feat: add day ### lesson`.

## Required Outputs

- Updated `src/days/day-###-slug.md`
- Updated concise opening-arc paragraph in `src/pages/introduction.md`
- Updated callbacks and pending future links
- Updated asset credits if images or fonts were added
- Passing site, EPUB, PDF, link, content, and EPUB structural checks

## Chinese Edition Workflow

After completing the English day file and passing all checks, mirror the work into the Chinese edition:

1. Create `src/zh/days/day-###-slug.md` as a translation of the English day file.
2. Use Kimi CLI for the first Chinese translation pass. Kimi can be slow: use a long timeout, poll patiently, and do not assume it is stuck just because it is quiet for several minutes. Ask Kimi to work agentically and update the target files directly, not to return a one-shot full-file translation in chat:

   ```sh
   rtk kimi "Translate the Chinese edition files for Day ### directly in the repository. Edit the target files in place. Produce Simplified Chinese that is 优雅，文艺，读起来令人愉悦 while remaining technically precise. Preserve all front matter keys, permalinks, locale: zh, day numbers, slugs, URLs, DOI links, citation metadata, HTML classes, ids, data attributes, ARIA structure, tables, SVG structure, and Nunjucks syntax. Do not edit English source files or build scripts. Finish with a concise summary of changed files."
   ```

3. Manually review the Kimi edits before involving GLM. Check correctness, idiomatic Chinese, terminology consistency, and preservation of all YAML front matter keys, indentation, numbers, dates, citations, DOIs, URLs, CSS classes, ids, JavaScript hooks, Nunjucks syntax, front matter structure, and permalink paths. Do not treat Kimi output as final.
4. Run a GLM consistency and language refinement pass with opencode using the Zhipu AI Coding Plan model. GLM can also be slow: use a long timeout and wait patiently. Ask GLM to refine the files directly in place, not to produce a one-shot review or replacement text:

   ```sh
   rtk opencode run -m zhipuai-coding-plan/glm-5.1 "Refine the Chinese edition files directly in the repository. Edit files in place for translation correctness, terminology consistency, remaining English that should be Chinese, and elegant but technically precise wording. Preserve front matter, permalinks, URLs, DOI links, citation metadata, HTML classes, ids, data attributes, ARIA structure, tables, SVG structure, JavaScript hooks, and Nunjucks syntax. Do not edit English source files or build scripts. Finish with a concise summary of changed files and any issues left for Codex to decide."
   ```

5. Manually review GLM's edits, keep only the corrections that are technically and stylistically sound, and reject or revert suggestions that would damage citations, code hooks, front matter, ids, URLs, or intended technical meaning.
6. Maintain these Chinese terminology conventions unless the user explicitly changes them:
   - book/course "descent" -> `深入`, not `下潜`
   - "deep dive" syllabus blocks -> `专题深入`
   - JTB -> `有正当理由的真信念`; prefer `正当理由` or `理由` in running prose, and avoid `证成` unless explicitly discussing the technical term
   - scientific replication -> `复现`, `复现实验`, or `可复现`; use `复现危机` for the reproducibility crisis, and use `复制` only for biological/molecular copying
   - preregistration -> `研究预登记`; registered reports -> `注册式报告`
   - day references -> `第 N 日`
   - hype filter -> `炒作过滤器`; evidence labels may use `争议/炒作`
   - use Chinese corner quotes `「」` for quoted speech, thoughts, propositions, slogans, and translated terms in Chinese prose; keep italics for book/journal titles, foreign terms, or true emphasis, not as a substitute for quotation marks
   - insert spaces between Chinese text and Latin letters, acronyms, Arabic numerals, percentages, and units where source typography permits, for example `2026 年`, `GLM 5.1`, `100 项`, `95% 置信区间`
   - avoid literal metaphors and stiff calques from machine translation; prefer natural, elegant Chinese that remains technically exact
7. Update `src/_data/syllabus_zh.yaml` with the Chinese title, entry, model, debate, and frontier for the new day.
8. Run the zh-specific build and checks:

   ```sh
   rtk npm run build
   rtk npm run check
   ```

9. Inspect the built zh website, EPUB, and PDF outputs before committing.
10. Commit the Chinese edition in the same batch or a follow-up batch with a conventional message, usually `feat: add day ### zh lesson`.

## Deep Dive Appendix Workflow

Use this when the user provides a `day-##-appendix-*.html` file for an already published English day.

1. Identify the target day from the filename or user message.
2. Import the appendix with the reusable importer:

   ```sh
   rtk node scripts/import-appendix-from-html.mjs /absolute/path/to/day-##-appendix-*.html ##
   ```

3. Review the resulting `src/days/day-###-*.md` block marked by `<!-- deep-dive:start -->` and `<!-- deep-dive:end -->`:
   - the web version must be a folded `<details class="deep-dive">` section headed by the appendix title, usually "The Rest of the Map"
   - every live web component must be class-scoped, not ID-scoped, so repeated appendices do not conflict
   - every live component must have an adjacent `.format-alt.epub-only.print-only` static fallback
   - static PDF/EPUB fallbacks should be tables or semantic HTML diagrams, not removed empty space
   - imported IDs should be namespaced with `appendix-d###-`
4. Update `src/_data/future-links.yaml` for new future callbacks introduced by the appendix.
5. Keep standard outputs appendix-free and deep-dive outputs appendix-inclusive:
   - standard EPUB/PDF: no deep-dive appendix content
   - deep-dive EPUB/PDF: appendix content included
   - PDF: no interactive controls; require the static fallback representation
6. Run:

   ```sh
   rtk npm run build
   rtk npm run check
   ```

7. Verify artifacts with text-only checks when image inspection is unavailable or forbidden:
   - inspect `OEBPS/day-###.xhtml` inside both EPUB editions
   - extract PDF text with Ghostscript `txtwrite`
   - confirm standard files omit appendix headings and deep-dive files include fallback headings
8. Commit a small batch with a conventional message, usually `feat: add day ### deep dive appendix`.

Do not edit generated files in `_site/` or `dist/`; they are build outputs.
