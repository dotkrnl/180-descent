---
name: 180-descent-add-day
description: Add a new published day to The 180-Day Descent through the current Astro/MDX registry, reusable component, paired Chinese, EPUB/PDF, and validation workflow.
---

# Add A 180 Descent Day

Use this workflow when creating a new `src/content/days/###-slug/` lesson.

Read `docs/workflows/180-descent-content/README.md` first. That file is the canonical source model for manifests, MDX, reusable figures/interactives, SCSS, artifact variants, and verification.

## Required Files

- `src/content/days/###-slug/day.yaml`
- `src/content/days/###-slug/en.mdx`
- `src/content/days/###-slug/zh.mdx`
- Optional paired appendices under `src/content/days/###-slug/appendices/*.en.mdx` and `*.zh.mdx`
- Any new reusable components under `src/app/components/lesson/figures/` or `src/app/components/lesson/interactives/`

## Workflow

1. Choose the canonical day number, slug, block, and thread metadata from `src/_data/syllabus-data.yaml`.
2. Create `day.yaml` with both `en` and `zh` locale entries before publishing. Keep route, title, summary, status, appendices, components, and assets in the manifest.
3. Write real MDX, not pasted HTML. Use Markdown and existing lesson components for prose structure.
4. Extract complex figures into `lesson/figures` components. Extract controls, sliders, buttons, generated SVG roots, and DOM hooks into `lesson/interactives` components.
5. Register every live interactive in `day.yaml` with `components[].webEntry` and explicit `artifactVariants.epub` and `artifactVariants.pdf`.
6. Keep EPUB/PDF static variants useful rather than identical when a static representation is clearer. Keep HTML visually consistent with the intended web design.
7. Update or add SCSS under `src/assets/scss/` only. Do not create hand-maintained `.css` files.
8. Run `npm run build:social-cards` when title or summary metadata changes.

## Verification

Run:

```sh
npm run typecheck
npm run test
npm run build
npm run check
```

For focused iteration, run the narrow checks first:

```sh
npm run check:content
npm run check:math
npm run check:appendix-style
npm run check:clean
```

Do not deploy unless the user explicitly asks.
