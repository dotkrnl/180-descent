---
name: 180-descent-add-day
description: Add a new day page to The 180-Day Descent repo from a supplied HTML lesson, improving content, citations, callbacks, future links, and web/EPUB/PDF component variants while preserving the project's static-book build flow.
---

# Add A Day To 180 Descent

Use this skill when the user provides a new day page for this repository.

## First Files To Read

1. `../SYLLABUS.md`
2. The supplied day HTML file
3. `src/_data/future-links.yaml`
4. Existing nearby day files in `src/days/`
5. If needed:
   - `references/lesson-schema.md`
   - `references/component-contract.md`
   - `references/citation-and-image-policy.md`

Read the syllabus entry for the target day plus the immediately previous and next days.

## Workflow

1. Identify day number, title, block, entry analogy, model, debate, and frontier from `../SYLLABUS.md`.
2. Convert the supplied HTML into `src/days/day-###-slug.md` with the canonical front matter.
3. Review the lesson text:
   - preserve the teaching arc and voice
   - fix factual issues
   - label frontier claims as established, promising hint, or contested/hype
   - add concrete callbacks to previous published days
   - leave future callbacks in `src/_data/future-links.yaml`
4. For every interactive piece, provide all variants:
   - live web UI
   - no-JS EPUB fallback
   - static PDF fallback
5. Prefer existing components and CSS classes before inventing new ones.
6. Add copyright-safe local assets only when they improve readability.
7. Run:

```sh
rtk npm run build
rtk npm run check
```

8. Inspect the built website and downloads before committing.
9. Commit a small batch with a conventional message, usually `feat: add day ### lesson`.

## Required Outputs

- Updated `src/days/day-###-slug.md`
- Updated callbacks and pending future links
- Updated asset credits if images or fonts were added
- Passing site, EPUB, PDF, link, content, and EPUB structural checks

Do not edit generated files in `_site/` or `dist/`; they are build outputs.

