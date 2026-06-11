# The 180-Day Descent

A book-like static website, EPUB, and print PDF for a 180-day course from foundations of knowledge to the research frontier.

Authors: Claude Opus and GPT.

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

The Cloudflare Pages project name is `180-descent`.

## Adding A Day

Use the repo-local Codex skill at `.codex/skills/180-descent-add-day/`. It documents the day-ingestion workflow, required files, callback/future-link rules, and validation commands.

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
