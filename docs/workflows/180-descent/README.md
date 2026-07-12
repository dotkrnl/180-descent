---
name: 180-descent
description: Add, edit, verify, commit, deploy, and visually review The 180-Day Descent website, EPUB, and PDF from the unified Astro/MDX source model.
---

# 180 Descent Workflow

Use this workflow for any project work: day content, appendices, reusable lesson
components, paired Chinese editions, bundled assets, generated artifacts,
publishing, and visual comparison.

## Required reading

Read every selected file completely before acting. Combine files when a task
crosses concerns.

- For any source, content, component, style, asset, EPUB, or PDF change, read
  [authoring.md](authoring.md).
- For visual design, page composition, interaction presentation, responsive
  behavior, or `FormatOnly` copy, read [design-brief.md](design-brief.md). For
  redesign implementation, also read
  [visual-redesign-migration.md](visual-redesign-migration.md).
- For factual claims, source integration, prose revision, existing-day cleanup,
  removal of model-shaped editorial residue, or the human refinement gate, read
  [editorial.md](editorial.md).
- For any Chinese translation, localization, bilingual parity, or Chinese
  review, read [localization.md](localization.md) and the authoritative
  [zh-terminology-glossary.md](zh-terminology-glossary.md).
- For checks, commits, pushes, deployment, or visual comparison, read
  [release.md](release.md).

For a new day or a complete day revision, read all five focused workflow files
and the Chinese glossary. For a narrower task, read the files named for every
affected concern; do not omit a review or verification contract merely because
the implementation itself is small.

## Core workflow

1. Identify the affected source and artifact surfaces, then load the required
   references above.
2. Make the smallest source-of-truth change that preserves English/Chinese and
   web/EPUB/PDF behavior. Never hand-edit generated `_site/` output.
3. Apply every acceptance, editorial, localization, accessibility, and artifact
   gate routed by the change.
4. Run the focused checks first, then the full release check when scope requires
   it.
5. Commit, push, or deploy only when requested, following `release.md` exactly.
