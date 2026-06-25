---
name: 180-descent
description: Add, edit, verify, commit, deploy, and visually review The 180-Day Descent website, EPUB, and PDF from the unified Astro/MDX source model.
---

# 180 Descent Workflow

Use this workflow for any project work: day content, appendices, reusable lesson
components, paired Chinese editions, bundled assets, generated artifacts,
publishing, and visual comparison.

## Source Model

Each published day lives under `src/content/days/###-slug/`. The directory
name is the canonical URL path.

- `day.yaml` is the typed manifest: day number, block, publish state,
  locale metadata, appendices, interaction scripts, and assets.
- `en.mdx` and `zh.mdx` are the paired main bodies.
- `appendices/*.en.mdx` and `appendices/*.zh.mdx` are optional paired deep-dive
  bodies declared by manifest id.
- Shared prose/layout components live in `src/app/components/lesson/`.
- Reusable static figures live in `src/app/components/lesson/figures/`.
- Reusable web interactives live in `src/app/components/lesson/interactives/`.
- Interaction behavior lives in `src/assets/js/interactions/` and is registered
  through `day.yaml` `interactionScripts`.
- Asset files live under `src/assets/images/...` and are declared in
  `day.yaml` `assets`.
- Styling is SCSS-only. Astro layouts import `src/assets/scss/book.scss`; edit
  SCSS modules under `src/assets/scss/`, not hand-written `.css` files.

Do not bulk-copy source HTML into project content. Convert material manually,
case by case, into MDX plus reusable Astro components. Preserve meaning,
citations, accessibility labels, static artifact equivalents, and bilingual parity
deliberately.

MDX may use imported components and ordinary Markdown/MDX prose. Do not use raw
HTML as a formatting shortcut; use Markdown, existing lesson components, or a
small reusable component when inline JSX must wrap another component. MDX must
not own raw interactive controls, canvas, behavior ARIA roles, inline event
handlers, or action/state data hooks. Put those contracts inside
`lesson/interactives` components and let `npm run check:content` enforce the
boundary. Every uppercase MDX component tag must also have an explicit artifact
contract in `check:content`: rendered directly, transparent wrapper, or web-only
with a static `FormatOnly media="print-epub" variant="alternate"` equivalent.

## Day Changes

1. Pick the canonical `###-slug` path from the syllabus and create or edit
   `src/content/days/###-slug/day.yaml`.
2. Keep English and Chinese locale entries paired when the day is published.
3. Put page title, summary, block, appendices, interaction scripts, and assets in
   `day.yaml`; do not duplicate directory routing metadata inside the manifest.
4. Write lesson bodies as real MDX. Import lesson components explicitly at the
   top of each MDX file.
5. Extract repeated or behavior-bearing markup into Astro components. Keep
   one-off diagrams readable; move reusable SVGs, complex markup, or any
   interaction-bearing DOM into a lesson component.
6. Check prior published days before introducing technical vocabulary. If a term
   has not already been explained in the course or is first introduced in this
   day/appendix without a plain same-sentence definition, wrap the first visible
   use with `Term` and add an adjacent `TipNote`. Keep notes concise,
   factual, bilingual, and artifact-safe; do not add tooltips to ordinary words
   or terms fully explained by the surrounding sentence.
7. Use stable ids and classes inside the reusable component that owns the DOM
   contract. When adding live behavior, add its bundle name to
   `interactionScripts`.
8. Keep static artifact equivalents purposeful. EPUB/PDF may drift from the live
   web component when the static form is clearer, but HTML should stay visually
   consistent with the intended web design.
9. Run `npm run build:social-cards` when titles or summaries change.

For a new published day, the minimum source set is:

- `src/content/days/###-slug/day.yaml`
- `src/content/days/###-slug/en.mdx`
- `src/content/days/###-slug/zh.mdx`
- Optional paired appendices under `src/content/days/###-slug/appendices/*.en.mdx`
  and `*.zh.mdx`

### New Day Acceptance Gate

Do not treat a newly added day as done until all of these are true. This gate is
mandatory even when `npm run check` passes; automated checks catch structural
errors, not publication quality.

1. **Source parity:** compare `day.yaml`, English MDX, Chinese MDX, and every
   declared appendix pair. Confirm every appendix listed in the manifest has
   both locale bodies, both bodies are imported/rendered, and the web page
   exposes each appendix in the intended order.
2. **Chinese flow completed:** clear stale Chinese target prose before
   translation; run Kimi, then Gemini, then GLM unless the user explicitly
   waives a step; manually review terminology, quote style, status labels,
   figure labels, alt text, and static artifact prose after the model passes.
3. **Interactives inventory:** make a list of every imported web-only
   interactive in the main lesson and appendices. For each one, verify it
   renders on the web, is registered in `WEB_ONLY_COMPONENTS`, has a localized
   `FormatOnly media="print-epub" variant="alternate"` block, and initializes
   only when visible on screen.
4. **Static artifact equivalence:** a print/EPUB alternate for an interactive
   must be a real static explanation, not a placeholder. If the live widget's
   teaching value is visual, include a static SVG/table/diagram that shows the
   relevant state, curve, grid, or comparison. The text-only summary may
   accompany the figure but must not be the only substitute.
5. **Figure renderer contract:** every reusable SVG figure used in MDX must be
   PDF-safe. Avoid relying only on external SCSS for fill, stroke, font size, or
   text positioning; include self-contained SVG styling or literal attributes
   for anything that must survive `rsvg-convert`. Register complex Astro figure
   components in `SVG_COMPONENTS` when the PDF renderer needs to extract them
   from rendered HTML.
6. **Tooltip discipline:** check prior published days before adding `Term` /
   `TipNote`. Tooltip only the first visible use of an unexplained technical
   concept. Do not tooltip a term immediately followed by its own plain
   definition in prose.
7. **Hype-filter discipline:** status tags must use `StatusChip`, stay short,
   and push caveats into prose. Frontier claim blocks must use the established
   claim/status components so labels do not degrade to plain text.
8. **Mobile typography:** inspect the main page on a narrow mobile viewport.
   SVG text, status chips, buttons, and long English titles must not overlap,
   shrink below legibility, or run into frames. The mobile rendered-type gate is
   a floor, not a substitute for visual review.
9. **Artifact visual review:** after `npm run build:site && npm run build:pdf`,
   render every affected day PDF page to PNG with Poppler: page 1, every page
   containing a new figure/table/interactive alternate, and the last page. Check
   both English and Chinese. Look for black rectangles, missing figures, wrong
   repeated diagrams, clipped text, label/frame overlap, stale English in
   Chinese artifacts, and orphaned headings.
10. **Deployed verification:** after deployment, fetch the deployed day PDFs
    from the preview URL, render the same representative pages, and smoke-check
    English desktop plus Chinese mobile HTML with Playwright. Do not rely only
    on the local `_site` render.

## Appendices

Appendices are declared in `day.yaml` under `appendices`.

- Give each appendix a stable `id`.
- Add locale-specific body paths and titles.
- Keep optional appendix content inside the appendix MDX file, not hidden in the
  main day body.
- Include static PDF/EPUB equivalents for any web-only controls.
- Verify the appendix appears only in deep-dive/full-day artifact editions.
- Standard EPUB/PDF outputs omit appendices; deep-dive EPUB/PDF outputs include
  them.

## Components And Styles

- Prefer existing components before adding new ones.
- Add a component only when it removes real duplication, owns a behavior
  contract, or makes MDX materially more readable.
- Put static lesson visuals with inline SVG or complex markup in
  `src/app/components/lesson/figures/`.
- Put controls, sliders, buttons, generated SVG roots, and DOM hooks in
  `src/app/components/lesson/interactives/`.
- Keep JavaScript behavior separate in `src/assets/js/interactions/`; avoid
  inline scripts in content.
- Mount web interactives lazily when their root enters the viewport, and stop
  animation loops when they leave it. Hidden appendices, collapsed sections, and
  below-the-fold canvases must not initialize expensive simulations on page open.
- Add or adjust styles in SCSS modules imported by `book.scss`. Do not add
  component-local `.css`, duplicate `book.css`, browser-print PDF styles, or
  one-off generated CSS.
- Do not add parallel adapter layers, blind importers, alternate source trees, or
  split project workflow skills. `npm run check:clean` blocks committed
  generated output, and `npm run check:workflows` enforces the single project
  workflow.
- PDF output is generated from semantic MDX through XeTeX. When a live web
  component is not suitable for print, provide a semantic `FormatOnly` print
  alternative instead of relying on DOM controls.

## Assets

- Prefer original diagrams built as reusable Astro figure or interactive
  components using SVG/HTML and SCSS.
- Use open-license, public-domain, Creative Commons, or official-source images
  only when they clarify the lesson and reuse is allowed.
- Do not hotlink external images.
- Download the source for conversion, but do not commit multi-megabyte originals.
- Place committed assets under `src/assets/images/...`.
- Resize and compress JPEG/WebP assets to real display needs. Aim for roughly
  100-200 KB per image when quality permits; use larger files only when the
  image carries important inspectable detail.
- Keep `width` and `height` attributes aligned with compressed asset dimensions.
- Update `src/_data/credits.yaml` for every added third-party asset: creator,
  title/description, source URL, license name/version, local asset path, and
  whether it was modified.
- Do not hand-edit generated social-card PNGs under
  `src/assets/images/social/`; they are ignored first-party build output from
  registry manifests.

Every committed image that appears in lesson, page, EPUB, or PDF output must
have an `alt` attribute at each markup use site. Write concise descriptive alt
text for informative images. Use `alt=""` only when the image is purely
decorative or adjacent text/caption fully duplicates the image's accessible
purpose. Translate Chinese alt text idiomatically while preserving the same
factual meaning.

Always check dark theme rendering when adding or changing an image, SVG, figure
frame, caption surface, card, or visual component. Prefer theme-token-driven
SVG/HTML/SCSS diagrams.

## Artifact Handling

- Use MDX/Astro imports for images rendered on site pages so Astro emits final
  `/_astro/...` URLs. Do not restore a `public/assets` mirror or hand-code
  public `/assets/images/...` URLs for page output.
- Use `/assets/images/...` only as the local source-path convention in
  `src/_data/credits.yaml`, day manifests, and artifact code that resolves back
  to `src/assets/images/...`.
- `npm run build:epub` must resolve local source image paths into
  `OEBPS/images/...` and add image manifest entries to `content.opf`.
- PDF generation reads semantic MDX and builds with XeTeX. `ImageFigure` sources
  backed by committed JPEG/PNG/PDF assets are included directly; SVGs are
  converted with `rsvg-convert`.
- If a PDF caption appears but the picture does not, check the MDX image import,
  the resolved asset path, and the XeTeX build log before changing lesson markup.
- Keep `npm run check:epub` guarding against absolute or missing EPUB image
  paths.
- Keep `npm run check:pdf` focused on artifact correctness: valid
  non-interactive PDFs, Poppler-extractable text, appendix inclusion rules, no
  local links, and no live interactive control leakage.

## PDF Notes

- Treat `src/lib/artifacts/pdf/xetex.ts` as the PDF renderer contract. It
  consumes semantic MDX, selected Astro-rendered figure components, inline SVG,
  Markdown tables, fenced code blocks, math components, and common lesson
  components.
- Keep diagrams source-of-truth in MDX/Astro/SVG. Reusable complex figures
  should live in `lesson/figures/`; one-off semantic SVG diagrams may remain
  inline in MDX because the PDF renderer converts `svg` nodes through
  `rsvg-convert`. Do not reimplement the same diagram separately in TeX.
- Use real fenced code blocks for code or pseudocode. The PDF renderer gives
  them a styled `codebox`; do not fake code with ad hoc HTML grids or
  paragraphs.
- Use `MathInline` and `MathBlock` for math so HTML gets KaTeX and PDF gets
  XeTeX math from the same source.
- For web interactives, keep behavior in the interactive component and provide a
  clear static PDF/EPUB representation with `FormatOnly`. Static artifact output
  may drift from the live web component when it improves readability.
- For PDF-affecting edits, run `npm run build:pdf` and `npm run check:pdf`. When
  changing PDF renderer, figure, table, code, or source-block behavior, also
  preserve logs with `PDF_KEEP_TEMP=1 npm run build:pdf` when deeper diagnosis
  is needed. The PDF build fails on `Overfull` boxes and `Missing character`
  glyph loss. Use `PDF_STRICT_FONT_WARNINGS=1 npm run build:pdf` when tightening
  font-shape substitutions.
- Visual review scope: for global renderer/style changes, sample at least 20
  pages from each full PDF (`180-descent`, `180-descent-deep-dive`,
  `180-descent-zh`, `180-descent-zh-deep-dive`). For individual day PDFs, first
  and last page are sufficient unless the changed day contains a new figure,
  table, code block, or interactive print alternative; then inspect the affected
  interior page too.

## Chinese Edition

Chinese content should be idiomatic Simplified Chinese, not literal
line-by-line English.

- Use model-assisted translation in this order unless the user explicitly says
  otherwise:
  1. Kimi first, through `opencode` with `kimi-for-coding/k2p7`, for the initial
     Simplified Chinese draft.
  2. Gemini second, through Antigravity CLI `agy` with
     `Gemini 3.5 Flash (High)`, for review, accuracy, terminology, and idiomatic
     refinement. Use the legacy `gemini` CLI only when explicitly required or
     when `agy` is unavailable.
  3. GLM third, through `opencode` with `zhipuai-coding-plan/glm-5.1`, for a
     final consistency and language refinement pass.
- Kimi drafting, Gemini review, and GLM refinement can be slow for full lesson
  bodies, appendices, and introduction updates. Use long-running commands and
  poll patiently. Once a pass starts, let it finish unless the process exits
  with an error or the user explicitly stops it.
- Preserve manifest structure, day numbers, path, citations, URLs, DOI metadata,
  component imports, image alt meaning, and interaction behavior.
- Localize block titles and print labels through existing data/components; do not
  hard-code English labels into Chinese print surfaces.
- Translate image `alt`, SVG `aria-label`, captions, panel titles, status-chip
  print labels, figure labels, and static table headings.
- Import the same reusable figure or interactive component used by English, with
  localized props or localized component data when needed.
- Add Chinese-specific styling only through existing SCSS modules, especially
  `src/assets/scss/content/_zh.scss`, unless a shared style is more appropriate.
- Keep terminology consistent across existing Chinese days.
- Prefer natural Chinese rhythm and punctuation. Use Chinese quotes for quoted
  propositions and titles where appropriate.
- Avoid dense emphasis in Chinese prose. Use terminology styling and sparse
  color emphasis only when it clarifies structure.
- Review AI edits manually before accepting: factual accuracy, terminology,
  formatting, component parity, and artifact behavior.
- Use stable Chinese status labels for frontier claims: `已确立`,
  `有前景`, and `有争议／炒作风险`. Call the tool `炒作过滤器`;
  avoid mixing in alternate names such as `前沿校准器` unless a lesson has a
  specific reason.
- For Chinese typography, prefer `「」` for propositions, terms as language
  objects, and short emphasis; use Chinese book title marks for Chinese titles;
  keep original English paper titles in italics or plain Latin text rather than
  wrapping them in multiple quote systems. Preserve exact source titles in
  reference lists.
- When a technical English word has multiple near-synonyms, do not collapse
  distinct concepts into one Chinese term. For example, in physics contexts
  `exceptional point` is `例外点`, `odd elasticity` is `奇弹性`, `stigmergy` is
  `痕迹协同`, and an order parameter is `序参量`.
- `FormatOnly` static alternatives for web-only interactives must include the
  context that lived inside the interactive component: a localized title, the
  object being shown, and enough rules or captions for PDF/EPUB readers to
  understand the artifact without the live widget.

For a normal day, create or update `src/content/days/###-slug/zh.mdx` and any
Chinese locale fields in `day.yaml`, then run Kimi on the paired English and
Chinese source files:

```sh
rtk opencode run --dangerously-skip-permissions -m kimi-for-coding/k2p7 "请以 yolo 模式直接在本仓库中翻译第 ### 日的中文版本文件，并原地编辑 src/content/days/###-slug/zh.mdx 和必要的 day.yaml 中文 locale 字段。所有仓库 shell 命令都必须使用 rtk 前缀。译文必须是简体中文，技术含义准确，但不要逐字直译；请按面向中文读者的自然中文科普读物来改写，语言要流畅、有节奏、有趣、耐读，读起来像优秀中文作者写出的科普文章。中文正文必须遵守中文排版约定：中文强调只允许颜色、术语字重、中文引号「」或这些方式的克制组合；不要使用 <em>/<i>/<strong>/<b>/<u>；术语少量用 span.term，必要强调少量用 span.hl；命题、想法、口号、短语作为语言对象时优先使用「」。保留所有 front matter 或 manifest 键、imports、component props、URLs、DOI 链接、citation metadata、class、id、data attribute、ARIA 结构、图片 alt 文本、表格、SVG 结构、JavaScript hook 与 MDX 语法，并保留和翻译所有说明性注释。不要编辑英文源文件或构建脚本。请输出简短进度说明，并在结束时用中文概括修改过的文件。"
```

After manually reviewing Kimi edits, run Gemini as the second pass:

```sh
rtk agy --dangerously-skip-permissions --model "Gemini 3.5 Flash (High)" --print-timeout 20m -p "请以 yolo 模式直接在本仓库中审核并润色第 ### 日的中文版本文件，并原地编辑 src/content/days/###-slug/zh.mdx 和必要的 day.yaml 中文 locale 字段。重点检查 Kimi 初稿的翻译准确性、术语一致性、仍需中文化的英文残留，以及中文表达是否自然、优雅、技术准确。不要做逐字直译式润色；请把文字调整成面向中文读者的自然中文科普读物风格，让内容有趣、耐读、清楚。中文正文必须遵守中文排版约定：中文强调只允许颜色、术语字重、中文引号「」或这些方式的克制组合；不要使用 <em>/<i>/<strong>/<b>/<u>；术语少量用 span.term，必要强调少量用 span.hl；命题、想法、口号、短语作为语言对象时优先使用「」。保留所有 front matter 或 manifest 键、imports、component props、URLs、DOI 链接、citation metadata、class、id、data attribute、ARIA 结构、图片 alt 文本、表格、SVG 结构、JavaScript hook 与 MDX 语法。不要编辑英文源文件或构建脚本。请输出简短进度说明，并在结束时用中文概括修改过的文件，以及需要 Codex 决定的遗留问题。"
```

After manually reviewing Gemini edits, run GLM as the final consistency pass:

```sh
rtk opencode run --dangerously-skip-permissions -m zhipuai-coding-plan/glm-5.1 "请以 yolo 模式直接在本仓库中润色第 ### 日的中文版本文件，并原地编辑 src/content/days/###-slug/zh.mdx 和必要的 day.yaml 中文 locale 字段。所有仓库 shell 命令都必须使用 rtk 前缀。重点检查翻译准确性、术语一致性、仍需中文化的英文残留，以及中文表达是否自然、优雅、技术准确。不要做逐字直译式润色；请把文字调整成面向中文读者的自然中文科普读物风格，让内容有趣、耐读、清楚。中文正文必须遵守中文排版约定：中文强调只允许颜色、术语字重、中文引号「」或这些方式的克制组合；不要使用 <em>/<i>/<strong>/<b>/<u>；术语少量用 span.term，必要强调少量用 span.hl；命题、想法、口号、短语作为语言对象时优先使用「」。保留 imports、component props、manifest/front matter、URLs、DOI 链接、citation metadata、class、id、data attribute、ARIA 结构、图片 alt 文本、表格、SVG 结构、JavaScript hook 与 MDX 语法。不要编辑英文源文件或构建脚本。最后用中文简洁概括修改过的文件，以及需要 Codex 决定的遗留问题。"
```

For large appendices, use temporary files instead of asking an agent to
overwrite its input: `/tmp/day-###-appendix-N-en.mdx` and
`/tmp/day-###-appendix-N-zh.mdx`. Start by clearing the target Chinese appendix
body or temporary target so stale prose cannot be mistaken for reviewed output.
Run Kimi first on the temporary pair. If Kimi stalls on a large appendix, split
the English source at section boundaries into
`/tmp/day-###-appendix-N-part-M-en.mdx` chunks, have Kimi write matching
`part-M-zh.mdx` files, then concatenate the translated chunks back into the
single appendix target before downstream review.

After Kimi, run Gemini review and then GLM refinement on the combined temporary
appendix. If `agy` requires interactive OAuth, try the legacy `gemini` CLI as the
documented fallback; if both Gemini paths are unavailable, record the auth
blocker in the work summary and compensate with a stricter local review for
English residue, MDX structure, and terminology. If GLM hangs without writing,
retry a narrower per-appendix pass once; if it still hangs, stop the session,
record the blocker, and do not leave the process running.

Only after the model-assisted passes and manual structure comparison should the
temporary result replace
`src/content/days/###-slug/appendices/*.zh.mdx`.

## Human Refinement Gate

Use this gate after implementation, translation, checks, and artifact inspection
are otherwise complete, and before commit/push/deploy unless the user explicitly
asks to publish immediately.

1. Start the local dev server if it is not already running:

```sh
rtk npm run dev -- --port 8080
```

If port 8080 is unavailable, use another local port and tell the user the URL.

2. Ask the user to review relevant English/Chinese pages in the local browser.
   The localhost-only Codex refiner appears when they select page text. Accepted
   refinements must write back through the local dev server, not remain DOM-only
   edits.
3. If selected text cannot be found uniquely in source, patch manually or adjust
   the selected range, refresh, and verify.
4. After the user says the refinement pass is done, check `git status -sb` and
   inspect the source diff. Confirm refinements are in tracked source files under
   `src/` or workflow files, never only `_site/`.
5. Rebuild and rerun checks after accepted refinements.

## Publish

1. Inspect current branch and diff:

```sh
rtk git branch --show-current
rtk git status --short
rtk git diff --stat
```

2. Run:

```sh
rtk npm run check
```

`npm run check` rebuilds all generated assets and download artifacts, then runs
all validators, including SEO, accessibility, EPUB, PDF, and repository
cleanliness.

3. Stage only intended files. Never stage unrelated user changes.
4. Commit with a Conventional Commit message, e.g.
   `feat: add open-license lesson images`.
5. Push the current branch:

```sh
rtk git push origin HEAD
```

6. Deploy only when the user asks for deployment.

For production:

```sh
rtk npm run deploy
```

For staging:

```sh
rtk npm run deploy:staging
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
rtk npm run build:site
rtk npm run check:visual -- --base https://staging.180-descent.pages.dev --compare https://180d.io --out tmp/visual-qa
```

8. Treat structural mismatches, language/title/H1 mismatches, horizontal
   overflow, broken math, missing Chinese font behavior, and untranslated
   Chinese print labels as regressions. Distinguish expected content drift from
   visual degradation when staging intentionally includes newer content than
   production.
9. Report commit hash, branch, push result, deploy URL or deployment status,
   visual comparison scope, and any residual risks.

Do not edit generated files in `_site/`; they are build outputs.

## Verification

For focused edits, run the narrow checks first:

```sh
rtk npm run typecheck
rtk npm test
rtk npm run check:content
rtk npm run check:math
rtk npm run check:appendix-style
rtk npm run check:links
rtk npm run check:clean
rtk npm run check:workflows
```

For asset, artifact, global renderer, or release-bound changes, run:

```sh
rtk npm run check
```

For every affected PDF page, render the page to PNG with Poppler and visually
confirm the expected output. Do not trust caption text alone.

For EPUB image changes, inspect the zip:

```sh
rtk unzip -l _site/downloads/<file>.epub | rtk rg 'OEBPS/images|image-name'
rtk unzip -p _site/downloads/<file>.epub OEBPS/content.opf | rtk rg 'image-name|image/jpeg|image/png|image/webp'
```
