---
name: 180-descent-add-appendix
description: Add a deep-dive appendix to an existing The 180-Day Descent day from a supplied appendix HTML file, preserving standard versus deep-dive output separation, route shell scripts, static fallbacks, source/factual review, future callbacks, Chinese mirroring for days that have zh editions, and full artifact verification.
---

# Add A Deep-Dive Appendix

Use this when the user provides a `day-##-appendix-*.html` file for an already published day.

## Workflow

1. Identify the target day from the filename or user message. Check whether the day already has `src/zh/days/day-###-*.md` and `src/_includes/days/###-*/zh.njk`.
2. Import with:

```sh
rtk node scripts/import-appendix-from-html.mjs /absolute/path/to/day-##-appendix-*.html ##
```

3. Review the resulting `src/_includes/days/###-slug/en.njk` block marked by `<!-- deep-dive:start -->` and `<!-- deep-dive:end -->`:
   - web version is a folded `<details class="deep-dive">` section headed by the appendix title, usually "The Rest of the Map"
   - live web components are class-scoped, not ID-scoped, so repeated appendices do not conflict
   - live components have adjacent `.format-alt.epub-only.print-only` static fallbacks
   - PDF/EPUB fallbacks are tables or semantic HTML diagrams, not empty space
   - imported IDs are namespaced with `appendix-d###-`
   - newly required interaction modules are listed in route-shell `scripts:` front matter
4. Review appendix text and sources with the add-day standard:
   - fact-check factual claims, dates, publication metadata, DOI/URL metadata, result numbers, and direct quotations before keeping them
   - for recent or current claims, verify against primary sources or reliable publication pages
   - keep citations tied to the claims they support
   - label frontier claims as established, promising hint, or contested/hype
   - remove source-page boilerplate such as "Receipts" if it violates project checks
5. Update `src/_data/future-links.yaml` for new future callbacks.
6. Preserve output separation:
   - standard EPUB/PDF: omit appendix content
   - deep-dive EPUB/PDF: include appendix content
   - PDF: no interactive controls; require static fallback representation
7. If the English target day already has a Chinese route/include, Chinese mirroring is required unless the user explicitly asked for English-only. Use `180-descent-chinese-edition` Appendix Translation:
   - translate only the new appendix into Simplified Chinese with Kimi using explicit temporary input/output files
   - expect Kimi translation and GLM refinement to be very slow on long appendix HTML; keep polling and let them finish unless they exit with an error or the user explicitly tells you to stop
   - do not replace Kimi with a different translator just because the process is quiet for several minutes
   - insert it into the matching Chinese include without disturbing existing appendices
   - run the GLM refinement pass
   - manually review preservation of HTML structure, comments, classes, ids, data attributes, fallbacks, citations, URLs, DOI metadata, scripts, and terminology
8. If images or other bundled assets are introduced, use `180-descent-assets`.
9. Run the target-day checklist and project checks:

```sh
rtk node .codex/skills/180-descent-add-day/scripts/add-day-checklist.mjs ### --require-zh
rtk npm run build
rtk npm run check
```

   Omit `--require-zh` only when the day has no Chinese edition or the user explicitly requested English-only.
10. Verify artifacts:
   - inspect `OEBPS/day-###.xhtml` inside both standard and deep-dive EPUB editions
   - extract PDF text with Ghostscript `txtwrite`
   - confirm standard files omit appendix headings and deep-dive files include fallback headings
   - when zh is in scope, repeat the same omission/inclusion checks for Chinese EPUB/PDF/day-specific artifacts
11. Commit only after verification and any requested human refinement are complete; use `180-descent-publish` for commit/push/deploy.

Do not edit generated files in `_site/` or `dist/`.
