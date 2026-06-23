---
name: 180-descent-add-appendix
description: Add or revise a paired deep-dive appendix for The 180-Day Descent through the current manifest, MDX, component, and artifact workflow.
---

# Add A 180 Descent Appendix

Use this workflow for optional deep-dive appendices attached to an existing day.

Read `docs/workflows/180-descent-content/README.md` first. It is the canonical source model for MDX, reusable components, raw-interactive markup boundaries, SCSS, artifact variants, and checks.

## Required Files

- Existing day manifest: `src/content/days/###-slug/day.yaml`
- Paired appendix bodies:
  - `src/content/days/###-slug/appendices/<appendix-id>.en.mdx`
  - `src/content/days/###-slug/appendices/<appendix-id>.zh.mdx`

## Workflow

1. Add a stable appendix `id` under `day.yaml` `appendices`.
2. Add localized titles and locale body paths for both English and Chinese.
3. Keep optional content inside the appendix files; do not hide appendix material in the main day body.
4. Use real MDX and shared components. Do not paste raw page sections, legacy wrappers, or raw interactive controls into appendix MDX.
5. Extract repeated visuals into `lesson/figures` and behavior-bearing controls into `lesson/interactives`.
6. If the appendix adds a live web component, register it in `day.yaml` with static EPUB/PDF variants.
7. Ensure standard EPUB/PDF outputs omit appendices and deep-dive EPUB/PDF outputs include them.

## Verification

Run:

```sh
npm run typecheck
npm run test
npm run build
npm run check
```

For focused appendix edits:

```sh
npm run check:content
npm run check:appendix-style
npm run check:math
npm run check:epub
npm run check:pdf
```

Do not deploy unless the user explicitly asks.
