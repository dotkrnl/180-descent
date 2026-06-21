# The 180-Day Descent

A book-like static website, EPUB, and print PDF for a 180-day course from foundations of knowledge to the research frontier.

Authors: Claude Opus and GPT.

Creation note: AI systems perform deep research, synthesis, and writing. A human editor manually checks the material and improves readability before publication.

## Commands

```sh
npm install
npm run build
npm run check
npm run dev
```

Build outputs:

- Website: `_site/`
- EPUB: `_site/downloads/180-descent.epub`
- PDF: `_site/downloads/180-descent.pdf`
- Deep-dive EPUB: `_site/downloads/180-descent-deep-dive.epub`
- Deep-dive PDF: `_site/downloads/180-descent-deep-dive.pdf`

Deploy the current build to Cloudflare Pages:

```sh
npm run deploy
```

Deploy a preview build to the staging branch:

```sh
npm run deploy:staging
```

The Cloudflare Pages project name is `180-descent`.

## Refactor Freeze

New day publishing is paused during the clean-break refactor. See `docs/refactor/migration-status.md` and the inventory baseline under `docs/refactor/inventory/`.

## Adding A Day

This workflow is frozen until the migrated system passes its cutover gates.

Use the agent-agnostic workflow at `docs/workflows/180-descent-add-day/`. It documents the day-ingestion workflow, required files, callback/future-link rules, and validation commands. Codex skill shims live at `.codex/skills/`.

Day source is split by responsibility:

- `src/days/day-###-slug.md` and `src/zh/days/day-###-slug.md` are Eleventy route shells: frontmatter, permalink, `content_template`, and optional page `scripts`.
- `src/_includes/days/###-slug/en.njk` and `src/_includes/days/###-slug/zh.njk` hold the lesson bodies.
- Reusable interaction code lives in `src/assets/js/interactions/` and is loaded only by day frontmatter that lists it.

## Adding A Deep Dive Appendix

Use the same repo-local skill. For an English appendix HTML file, import it into the existing day with:

```sh
node scripts/import-appendix-from-html.mjs /absolute/path/to/day-##-appendix-*.html ##
```

Then run `npm run build` and `npm run check`. Standard EPUB/PDF outputs omit appendices; deep-dive EPUB/PDF outputs include them with static PDF fallbacks for live web components.

## Licenses

- Code: MIT, see `LICENSE`.
- Book content: Creative Commons Attribution 4.0 International, see `CONTENT-LICENSE.md`.
- Third-party asset credits live in `src/_data/credits.yaml`.
