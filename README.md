# The 180-Day Descent

A book-like static website, EPUB, and print PDF for a 180-day course from foundations of knowledge to the research frontier.

Authors: Claude Fable and GPT Sol.

Creation note: AI systems perform deep research, synthesis, and writing. Human editors Jason Lau and Zhengmei Huang manually check the material and improve readability before publication.

## Commands

```sh
npm install
npm run check
npm run dev
```

Build outputs:

- Website: `_site/`
- English book downloads: `_site/downloads/180-descent.{epub,pdf}` and `_site/downloads/180-descent-deep-dive.{epub,pdf}`
- Chinese book downloads: `_site/downloads/180-descent-zh.{epub,pdf}` and `_site/downloads/180-descent-zh-deep-dive.{epub,pdf}`
- Per-day downloads: `_site/downloads/180-descent-day-###-slug.{epub,pdf}` and `_site/downloads/180-descent-zh-day-###-slug.{epub,pdf}`

Deploy the current build to Cloudflare Pages:

```sh
npm run deploy
```

Deploy a preview build to the staging branch:

```sh
npm run deploy:staging
```

The Cloudflare Pages project name is `180-descent`.

`npm run check` is self-contained: it rebuilds the site, EPUBs, PDFs, generated fonts, generated SCSS, and social cards before validating the built artifacts. Use `npm run check:built` only when those artifacts are already current and you want to re-run validators without rebuilding.

## Content Workflow

Use the single agent-agnostic workflow at `docs/workflows/180-descent/` for adding days, adding appendices, editing paired Chinese content, extracting reusable components, and maintaining artifact variants. Codex skills live at `.codex/skills/`.

Day source is split by responsibility:

- `src/content/days/###-slug/day.yaml` is the typed day manifest; its `day` value must match the directory prefix.
- `src/content/days/###-slug/en.mdx` and `src/content/days/###-slug/zh.mdx` hold the paired lesson bodies.
- `src/content/days/###-slug/appendices/*.en.mdx` and `*.zh.mdx` hold paired optional deep-dive content declared in the manifest.
- Reusable figures live in `src/app/components/lesson/figures/`.
- Reusable interactive DOM lives in `src/app/components/lesson/interactives/`.
- Interaction behavior lives in `src/assets/js/interactions/` and is registered by manifest `interactionScripts`.
- Styling is SCSS-only under `src/assets/scss/`.

## Adding A Deep Dive Appendix

Use the same content workflow. Add the appendix body under the day directory, declare it in `day.yaml`, and provide static EPUB/PDF variants for any live web components. Standard EPUB/PDF outputs omit appendices; deep-dive EPUB/PDF outputs include them.

## Licenses

- Code: MIT, see `LICENSE`.
- Book content: Creative Commons Attribution 4.0 International, see `CONTENT-LICENSE.md`.
- Third-party asset credits live in `src/_data/credits.yaml`.
