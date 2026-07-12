# Verification and Release

## Publish

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

`npm run check` rebuilds all generated assets and download artifacts, then
runs all validators, including SEO, accessibility, EPUB, PDF, and repository
cleanliness.

3. Stage only intended files. Never stage unrelated user changes.
4. Commit with a Conventional Commit message, e.g.
   `feat: add open-license lesson images`.
5. Rebase the commit onto the latest remote main branch, then push main:

```sh
git fetch origin
git rebase origin/main
git push origin main
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

7. When asked to visually compare, compare
   `https://staging.180-descent.pages.dev` against `https://180d.io` after the
   staging deploy finishes. Cover every generated route in both English and
   Chinese at desktop and mobile widths. At minimum, check HTTP status, `lang`,
   title, H1, text/content drift, scroll height, horizontal overflow, and
   screenshots at top/middle/bottom scroll positions for long pages.
   Use the visual QA command to produce the route inventory, screenshots, and
   structural comparison report:

```sh
npm run build:site
npm run check:visual -- --base https://staging.180-descent.pages.dev --compare https://180d.io --out tmp/visual-qa
```

8. Treat structural mismatches, language/title/H1 mismatches, horizontal
   overflow, broken math, missing Chinese font behavior, and untranslated
   Chinese print labels as regressions. Distinguish expected content drift from
   visual degradation when staging intentionally includes newer content than
   production.
9. After a Pages deployment, verify the reported environment, branch, source
   commit, and unique deployment URL. Follow the stable Pages endpoint and
   custom-domain redirect, then compare a representative deployed file or hash
   with the freshly built `_site` output. A successful CLI exit alone does not
   prove that the intended release is live.
10. Report commit hash, branch, push result, deploy URL or deployment status,
   visual comparison scope, and any residual risks.

Do not edit generated files in `_site/`; they are build outputs.

## Verification

For focused edits, run the narrow checks first:

```sh
npm run typecheck
npm test
npm run check:content
npm run check:javascript
npm run check:math:source
npm run check:appendix-style
npm run check:imports
npm run check:dead
npm run check:svg-text
npm run check:clean
npm run check:workflows
```

The pull-request quality workflow runs every source-only contract, TypeScript,
and the unit suite on every pull request and on pushes to `main`. Keep the CI
Node major, `.node-version`, `package.json` engine, and `@types/node` on the same
supported runtime line. A content change is not ready to publish until those
gates pass; release-bound work still requires the full `npm run check` artifact
build below.

Keep source-only validators independent of `_site`; stale build output must not
change their result. Conversely, built-output validators must run after a fresh
build and fail clearly when required artifacts are absent. For test fixtures and
render-only Vite instances, use the worker-local `TMPDIR`, disable WebSockets and
dependency discovery, close the owning server before deleting its explicit
cache directory, and remove every fixture in teardown. Favor behavior-level
regression tests for focus, keyboard input, persisted reading state, and ARIA
semantics over source-regex assertions alone.

For changes that touch built pages, metadata, accessibility, rendered
typography, or download artifacts, add the focused built-output validators:

```sh
npm run check:math
npm run check:links
npm run check:seo
npm run check:a11y
npm run check:rendered-type
npm run check:epub
npm run check:pdf
```

`check:math` validates rendered KaTeX in built HTML, and `check:links`
validates rendered internal links, including download links. Run them only
after `_site` and the linked download artifacts are current.

For asset, artifact, global renderer, or release-bound changes, run:

```sh
npm run check
```

For every affected PDF page, render the page to PNG with Poppler and visually
confirm the expected output. Do not trust caption text alone.

For EPUB image changes, inspect the zip:

```sh
unzip -l _site/downloads/<file>.epub | rg 'OEBPS/images|image-name'
unzip -p _site/downloads/<file>.epub OEBPS/content.opf | rg 'image-name|image/jpeg|image/png|image/webp'
```
