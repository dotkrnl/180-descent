---
name: 180-descent-assets
description: Add, credit, compress, and verify images or other bundled assets for The 180-Day Descent website, EPUB, and PDF outputs. Use when Codex proposes open-license figures, adds local images, updates src/_data/credits.yaml, adjusts EPUB/PDF asset handling, or validates image rendering in built artifacts.
---

# Manage 180 Descent Assets

Use this skill for lesson images and bundled third-party assets.

## Candidate Policy

Prefer, in order:

1. Original diagrams built in SVG/HTML/CSS.
2. Open-license, public-domain, or Creative Commons figures with local copies and attribution when they clarify the lesson.
3. Official-source images where reuse is clearly allowed.
4. Generated bitmap images when copyright-safe external images are unsuitable.

Before adding third-party images, show the user candidates unless they already named exact images. Include placement, why it helps, source URL, creator, license, and attribution/share-alike obligations.

Do not add decorative images just because they are available. Use images when they make a concept clearer, more concrete, or more memorable.

## Bundling

- Do not hotlink external images.
- Download the source for conversion, but do not commit multi-megabyte originals.
- Place committed assets under `src/assets/images/...`.
- Resize and compress JPEG/WebP assets to real display needs. Aim for roughly 100-200 KB per image when quality permits; use larger files only when the image carries important inspectable detail.
- Keep `width` and `height` attributes in lesson markup aligned with compressed asset dimensions.
- Update `src/_data/credits.yaml` for every added asset: creator, title/description, source URL, license name/version, local asset path, and whether it was modified.
- Note modifications such as "Locally resized and compressed from the Wikimedia Commons original."
- Social-card PNGs under `src/assets/images/social/` are generated first-party
  build assets from route-shell front matter by
  `scripts/generate-social-cards.mjs`; do not hand-edit or credit them as
  third-party assets.
- If a user explicitly wants a custom third-party image as `seo_image`, treat it
  like any other bundled image: store it locally, credit it in
  `src/_data/credits.yaml`, verify reuse rights, and run the SEO check.

## Artifact Handling

- Use `/assets/images/...` for local site images.
- `scripts/build-epub.mjs` must rewrite these paths into `OEBPS/images/...` and add image manifest entries to `content.opf`.
- PDF generation must force lazy images to load and decode before `page.pdf()`. If captions appear but pictures do not, check `scripts/build-pdf.mjs` before changing lesson markup.
- Keep `scripts/check-epub.mjs` guarding against absolute or missing EPUB image paths.
- Keep `scripts/check-pdf.mjs` fast: prefer cached whole-PDF/per-page text extraction and low-resolution pixel samples over repeated page-by-page Ghostscript calls. Add Ghostscript timeouts so validation fails quickly.

## Verification

Run:

```sh
rtk npm run build
rtk npm run check:seo
rtk npm run check
```

For every affected PDF page, render the page to PNG with Ghostscript and visually confirm the picture appears. Do not trust caption text alone.

For EPUB, inspect the zip:

```sh
rtk unzip -l _site/downloads/<file>.epub | rg 'OEBPS/images|image-name'
rtk unzip -p _site/downloads/<file>.epub OEBPS/content.opf | rg 'image-name|image/jpeg|image/png|image/webp'
```
