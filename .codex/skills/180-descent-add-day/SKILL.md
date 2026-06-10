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
2. Use Kimi CLI for Chinese translation, instructing it to produce text that is **优雅，文艺，读起来令人愉悦** while remaining technically precise.
3. Manually review the Kimi output for correctness, terminology consistency, and preservation of all YAML front matter keys, indentation, numbers, dates, citations, DOIs, URLs, CSS classes, ids, JavaScript hooks, Nunjucks syntax, front matter structure, and permalink paths. Do not treat Kimi output as final.
4. Run a GLM consistency and language refinement pass with opencode using the Zhipu AI Coding Plan model:

   ```sh
   rtk opencode run -m zhipuai-coding-plan/glm-5.1 "Review the Chinese edition changes for translation correctness, terminology consistency, remaining English that should be Chinese, and elegant but technically precise wording. Do not edit files; return concise actionable findings with file:line, current phrase, recommended replacement, and rationale."
   ```

5. Manually review GLM's findings, apply only the corrections that are technically and stylistically sound, and reject suggestions that would damage citations, code hooks, front matter, ids, URLs, or intended technical meaning.
6. Maintain these Chinese terminology conventions unless the user explicitly changes them:
   - book/course "descent" -> `深入`, not `下潜`
   - "deep dive" syllabus blocks -> `专题深入`
   - JTB -> `被证成的真信念`
   - scientific replication -> `复现`, `重复实验`, or `可重复性`; use `复制` only for biological/molecular copying
   - day references -> `第 N 日`
   - hype filter -> `炒作过滤器`; evidence labels may use `争议/炒作`
7. Update `src/_data/syllabus_zh.yaml` with the Chinese title, entry, model, debate, and frontier for the new day.
8. Run the zh-specific build and checks:

   ```sh
   rtk npm run build
   rtk npm run check
   ```

9. Inspect the built zh website, EPUB, and PDF outputs before committing.
10. Commit the Chinese edition in the same batch or a follow-up batch with a conventional message, usually `feat: add day ### zh lesson`.

Do not edit generated files in `_site/` or `dist/`; they are build outputs.
