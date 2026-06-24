---
name: 180-descent-publish
description: Verify, review, commit, push, deploy, and visually compare The 180-Day Descent changes. Use when Codex needs the human refinement gate, full build/check validation, Conventional Commit creation, git push, Cloudflare Pages production deployment, staging deployment, or production-vs-staging visual comparison.
---

# Publish 180 Descent

Use this skill when the user asks to commit, push, deploy, publish, deploy staging, visually compare, or run the human review gate.

## Human Refinement Gate

Use this gate after implementation, translation, checks, and artifact inspection are otherwise complete, and before commit/push/deploy unless the user explicitly asks to publish immediately.

1. Start the local dev server if it is not already running:

```sh
npm run dev -- --port 8080
```

If port 8080 is unavailable, use another local port and tell the user the URL.

2. Ask the user to review relevant English/Chinese pages in the local browser. The localhost-only Codex refiner appears when they select page text. Accepted refinements must write back through the local dev server, not remain DOM-only edits.
3. If selected text cannot be found uniquely in source, patch manually or adjust the selected range, refresh, and verify.
4. After the user says the refinement pass is done, check `git status -sb` and inspect the source diff. Confirm refinements are in tracked source files under `src/` or skill files, never only `_site/`.
5. Rebuild and rerun checks after accepted refinements.

## Publish Workflow

1. Inspect current branch and diff:

```sh
git branch --show-current
git status --short
git diff --stat
```

2. Run:

```sh
npm run check
```

`npm run check` rebuilds all site and download artifacts, then runs every
validator needed before publishing, including SEO, accessibility, EPUB, and PDF
checks.

The SEO check verifies built canonical tags,
meta descriptions, reciprocal `hreflang`, JSON-LD, sitemap/robots discovery,
local Open Graph social images, favicon, apple-touch-icon, web app manifest,
and manifest icons.

The accessibility check scans every generated
HTML file for image `alt` attributes, named `role="img"` SVGs, named
links/buttons, visible-label/name matching, valid `aria-checked` roles, heading
order, and unique landmark names, then runs axe tests against every generated
HTML page. Do not bypass it for decorative images; use `alt=""` where decoration is
intentional.

3. Stage only intended files. Never stage unrelated user changes.
4. Commit with a Conventional Commit message, e.g. `feat: add open-license lesson images`.
5. Push the current branch:

```sh
git push origin HEAD
```

6. Deploy only when the user asks for deployment.

For production:

```sh
npm run deploy
```

For staging:

```sh
npm run deploy:staging
```

7. When asked to visually compare, compare `https://staging.180-descent.pages.dev` against `https://180d.io` after the staging deploy finishes. Cover every generated route in both English and Chinese at desktop and mobile widths. At minimum, check HTTP status, `lang`, title, H1, text/content drift, scroll height, horizontal overflow, and screenshots at top/middle/bottom scroll positions for long pages.
8. Treat structural mismatches, language/title/H1 mismatches, horizontal overflow, broken math, missing Chinese font behavior, and untranslated Chinese print labels as regressions. Distinguish expected content drift from visual degradation when staging intentionally includes newer content than production.
9. Report commit hash, branch, push result, deploy URL or deployment status, visual comparison scope, and any residual risks.

Do not edit generated files in `_site/`; they are build outputs.
