---
name: 180-descent-publish
description: Verify, review, commit, push, and deploy The 180-Day Descent changes. Use when Codex needs the human refinement gate, full build/check validation, Conventional Commit creation, git push, or Cloudflare Pages deployment through npm run deploy.
---

# Publish 180 Descent

Use this skill when the user asks to commit, push, deploy, publish, or run the human review gate.

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
npm run build
npm run check:seo
npm run check:a11y
npm run check
```

The SEO check must pass before publishing. It verifies built canonical tags,
meta descriptions, reciprocal `hreflang`, JSON-LD, sitemap/robots discovery,
and local existence of Open Graph social images.

The accessibility check must pass before publishing. It scans every generated
HTML file for image `alt` attributes, named `role="img"` SVGs, named
links/buttons, visible-label/name matching, valid `aria-checked` roles, heading
order, and unique landmark names, then runs axe tests against every non-print
page. Do not bypass it for decorative images; use `alt=""` where decoration is
intentional.

3. Stage only intended files. Never stage unrelated user changes.
4. Commit with a Conventional Commit message, e.g. `feat: add open-license lesson images`.
5. Push the current branch:

```sh
git push origin HEAD
```

6. Deploy only when the user asks for deployment:

```sh
npm run deploy
```

7. Report commit hash, branch, push result, deploy URL or deployment status, and any residual risks.

Do not edit generated files in `_site/` or `dist/`; they are build outputs.
