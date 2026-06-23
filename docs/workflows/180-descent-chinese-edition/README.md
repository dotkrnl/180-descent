---
name: 180-descent-chinese-edition
description: Create, review, or refine the Simplified Chinese paired edition for The 180-Day Descent while preserving manifest, component, artifact, and visual parity.
---

# 180 Descent Chinese Edition

Use this workflow for Chinese lesson bodies, appendices, metadata, print labels, alt text, and bilingual parity fixes.

Read `docs/workflows/180-descent-content/README.md` first for the current Astro/MDX component model and validation rules.

## Translation And Editing Rules

- Write idiomatic Simplified Chinese, not line-by-line English.
- Preserve day number, slug, manifest structure, citations, URLs, DOI metadata, component imports, math meaning, alt meaning, and interaction behavior.
- Keep terminology consistent with existing Chinese days.
- Prefer natural Chinese rhythm and punctuation. Use Chinese quotes for quoted propositions and titles where appropriate.
- Avoid dense emphasis in Chinese prose. Use terminology styling and sparse color emphasis only when it clarifies structure.
- Localize print labels, block titles, status chip `printLabel`s, figure labels, and static artifact captions. Do not leak English labels into Chinese print, EPUB, or PDF surfaces.
- Keep HTML visually close to English and production expectations. PDF/EPUB may drift when the Chinese static layout needs a better visual solution.

## Component Rules

- Do not duplicate raw interactive HTML in Chinese MDX. Import the same reusable figure or interactive component used by English, with localized props or localized component data when needed.
- Preserve behavior hooks by keeping them inside `src/app/components/lesson/interactives/` and `src/assets/js/interactions/`.
- Translate image `alt`, SVG `aria-label`, captions, panel titles, and static table headings.
- Add Chinese-specific styling only through existing SCSS modules, especially `src/assets/scss/content/_zh.scss`, unless a shared style is more appropriate.

## Review Tools

Kimi, Gemini, and GLM review passes can be slow. When invoked, let them finish unless the process exits or the user explicitly stops it. Treat their output as review material, not automatic source truth.

Review AI edits manually for factual accuracy, terminology, formatting, component parity, artifact behavior, and Chinese typography.

## Verification

Run:

```sh
npm run typecheck
npm run test
npm run build
npm run check
```

For focused Chinese edits:

```sh
npm run check:content
npm run check:math
npm run check:appendix-style
npm run check:a11y
```

When Chinese print/PDF labels are touched, inspect `/zh/print/`, `/zh/print-deep/`, and run `npm run check:pdf`.
