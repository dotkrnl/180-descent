---
name: 180-descent-add-appendix
description: Add a deep-dive appendix to an existing The 180-Day Descent day from a supplied appendix HTML file, preserving standard versus deep-dive output separation, route shell scripts, static fallbacks, optional appendix labeling, and zh mirroring when needed.
---

# Add A Deep-Dive Appendix

Use this when the user provides a `day-##-appendix-*.html` file for an already published day.

## Workflow

1. Identify the target day from the filename or user message.
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
4. Update `src/_data/future-links.yaml` for new future callbacks.
5. Preserve output separation:
   - standard EPUB/PDF: omit appendix content
   - deep-dive EPUB/PDF: include appendix content
   - PDF: no interactive controls; require static fallback representation
6. If images or other bundled assets are introduced, use `180-descent-assets`.
7. Run:

```sh
rtk npm run build
rtk npm run check
```

8. Verify artifacts:
   - inspect `OEBPS/day-###.xhtml` inside both standard and deep-dive EPUB editions
   - extract PDF text with Ghostscript `txtwrite`
   - confirm standard files omit appendix headings and deep-dive files include fallback headings
9. If Chinese mirroring is needed, use `180-descent-chinese-edition`.
10. Commit only after verification and any requested human refinement are complete; use `180-descent-publish` for commit/push/deploy.

Do not edit generated files in `_site/` or `dist/`.
