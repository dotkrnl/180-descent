---
name: 180-descent-add-day
description: Add a new day page to The 180-Day Descent repo from a supplied HTML lesson, using the route-shell plus lesson-include convention, improving content, citations, callbacks, future links, and web/EPUB/PDF component variants while preserving the project's static-book build flow.
---

# Add A Day To 180 Descent

Use this skill when the user provides a new day page for this repository.

## First Files To Read

1. `src/_data/syllabus.yaml`
2. The supplied day HTML file
3. `src/_data/future-links.yaml`
4. Existing nearby route shells in `src/days/` and lesson bodies in `src/_includes/days/`
5. If needed:
   - `references/lesson-schema.md`
   - `references/component-contract.md`
   - `references/citation-and-image-policy.md`

Read the syllabus entry for the target day plus the immediately previous and next days.

## Workflow

1. Identify day number, title, block, entry analogy, model, debate, and frontier from `src/_data/syllabus.yaml`.
2. Convert the supplied HTML into the current two-file day structure:
   - route shell: `src/days/day-###-slug.md`
   - lesson body: `src/_includes/days/###-slug/en.njk`
   Use `scripts/import-day-from-html.mjs` when it fits the source, then correct front matter from the syllabus as needed.
3. Review the lesson text:
   - preserve the teaching arc and voice
   - fix factual issues
   - label frontier claims as established, promising hint, or contested/hype
   - add concrete callbacks to previous published days
   - leave future callbacks in `src/_data/future-links.yaml`
4. Update the introduction opening-arc paragraph:
   - always refresh `src/pages/introduction.md`
   - when the Chinese edition is in scope, refresh `src/zh/introduction.md` in the same pass
   - keep the English and Chinese paragraphs matched in scope, day count, and newest-day reference
   - keep the paragraph concise so it summarizes the published opening arc and the newest day without becoming a running catalog
   - keep it to one short paragraph unless the user explicitly asks for a longer introduction
5. For every interactive piece, provide all variants:
   - live web UI
   - no-JS EPUB fallback
   - static PDF fallback
   Put live behavior in `src/assets/js/interactions/*.js` and list each module in the route shell `scripts:` front matter. Keep `src/assets/js/book.js` for truly global behavior only. Prefer semantic HTML/CSS diagrams with print/EPUB fallbacks over raw inline SVG when layout can be expressed with normal boxes and text.
6. Prefer existing components, CSS classes, and interaction modules before inventing new ones.
7. Add copyright-safe local assets only when they improve readability.
8. Run the skill checklist for the target day, then the full project checks:

```sh
rtk node .codex/skills/180-descent-add-day/scripts/add-day-checklist.mjs ###
rtk npm run build
rtk npm run check
```

9. Inspect the built website and downloads.
10. Run the human refinement gate below. Do not commit, push, or deploy until the user has finished this local-server review pass and explicitly confirms it is done.
11. Re-run the target-day checklist plus `rtk npm run build` and `rtk npm run check` if the human refinement gate changed any source files.
12. Commit a small batch with a conventional message, usually `feat: add day ### lesson`.

## Human Refinement Gate

Use this gate after the implementation, translation, checks, and artifact inspection are otherwise complete, and before any commit, push, or deploy.

1. Start the local dev server if it is not already running:

   ```sh
   rtk npm run dev -- --port 8080
   ```

   If port 8080 is unavailable, use another local port and tell the user the URL.
2. Ask the user to review the relevant English and/or Chinese pages in the local browser. The localhost-only Codex refiner appears when they select page text. They can enter an optional reason and click **Ask Codex**; accepted refinements must write back to source files through the local dev server, not remain as DOM-only edits.
3. Stay available while the user refines. If the refiner reports that selected text cannot be found uniquely in source, patch the source manually or adjust the selected range, then refresh and verify.
4. After the user says the human refinement pass is done, check `rtk git status -sb` and inspect the source diff. Confirm any user-made refinements are present in tracked source files under `src/` or skill files, never only in `_site/`.
5. Rebuild and rerun checks after any accepted refinement. Only proceed to commit, push, or deploy after the refined source passes validation and the user has no further changes.

## Required Outputs

- Updated `src/days/day-###-slug.md` route shell with `content_template`, optional `scripts`, permalink, and `{% include content_template %}`
- Added or updated `src/_includes/days/###-slug/en.njk` lesson body
- Updated concise opening-arc paragraph in `src/pages/introduction.md`
- When Chinese is in scope, updated matching opening-arc paragraph in `src/zh/introduction.md`
- Updated callbacks and pending future links
- Updated asset credits if images or fonts were added
- Added or reused `src/assets/js/interactions/*.js` modules for live components, with adjacent print/EPUB fallbacks in the lesson body
- Passing site, EPUB, PDF, link, content, and EPUB structural checks

## Chinese Edition Workflow

After completing the English day file and passing all checks, mirror the work into the Chinese edition:

1. Create `src/zh/days/day-###-slug.md` as the Chinese route shell and `src/_includes/days/###-slug/zh.njk` as the Chinese lesson body. Preserve the same `day_path` as English, but use `locale: zh`, `tags: zhDay`, `/zh/days/.../` permalink, and `content_template: days/###-slug/zh.njk`.
2. Use Kimi CLI for the first Chinese translation pass. Kimi can be slow: use a long timeout, poll patiently, and do not assume it is stuck just because it is quiet for several minutes. It is normal for a large file to take 30-60 minutes before a useful write appears. Ask Kimi to work agentically and update files directly, not to return a one-shot full-file translation in chat. If delegated agents run shell commands inside this repo, explicitly tell them to prefix every shell command with `rtk`.

   Use the actual CLI prompt flag and keep progress visible. Do **not** add `--final-message-only` while supervising a long translation run; it hides intermediate tool calls and makes a quiet but healthy run look stuck. Prefer `--print --yolo -p` so Codex can see Kimi's reads/writes and progress notes:

   ```sh
   rtk kimi --print --yolo -p "请直接在本仓库中翻译第 ### 日的中文版本文件，并原地编辑目标 route shell 与 lesson include。译文必须是简体中文，技术含义准确，但不要逐字直译；请按面向中文读者的自然中文科普读物来改写，语言要流畅、有节奏、有趣、耐读，读起来像优秀中文作者写出的科普文章。保留所有 front matter 键、content_template、scripts、permalinks、locale: zh、day 数字、slug、URL、DOI 链接、citation metadata、HTML class、id、data attribute、ARIA 结构、表格、SVG 结构与 Nunjucks 语法。不要编辑英文源文件或构建脚本。请输出简短进度说明，并在结束时用中文概括修改过的文件。"
   ```

   For large existing files or appendix translation, prefer explicit separate paths instead of asking Kimi to overwrite its input. Extract the English source to a temporary input file, seed a separate Chinese output file, and ask Kimi to replace the output file in place:

   ```sh
   rtk kimi --print --yolo -p "请读取英文输入文件 /tmp/day-###-appendix-en.md，并把输出文件 /tmp/day-###-appendix-zh.md 的全部内容原地替换为简体中文版本。只编辑 /tmp/day-###-appendix-zh.md，不要编辑仓库文件。译文不要逐字直译；请按面向中文读者的自然中文科普读物来改写，语言要流畅、有节奏、有趣、耐读，同时保持技术含义准确。不要在聊天中返回一次性的完整文件译文。请输出简短进度说明，并在结束时用中文概括结果。"
   ```

3. Manually review the Kimi edits before involving GLM. Check correctness, idiomatic Chinese, terminology consistency, route-shell/body-include split, and preservation of all YAML front matter keys, indentation, numbers, dates, citations, DOIs, URLs, CSS classes, ids, JavaScript hooks, Nunjucks syntax, front matter structure, and permalink paths. Do not treat Kimi output as final.
4. Run a GLM consistency and language refinement pass with opencode using the Zhipu AI Coding Plan model. GLM can also be slow: use a long timeout and wait patiently. Ask GLM to refine the files directly in place, not to produce a one-shot review or replacement text:

   ```sh
   rtk opencode run -m zhipuai-coding-plan/glm-5.1 "请直接在本仓库中润色中文版本文件，并原地编辑。重点检查翻译准确性、术语一致性、仍需中文化的英文残留，以及中文表达是否自然、优雅、技术准确。不要做逐字直译式润色；请把文字调整成面向中文读者的自然中文科普读物风格，让内容有趣、耐读、清楚。保留 route shell、lesson include、front matter、content_template、scripts、permalinks、URL、DOI 链接、citation metadata、HTML class、id、data attribute、ARIA 结构、表格、SVG 结构、JavaScript hook 与 Nunjucks 语法。不要编辑英文源文件或构建脚本。最后用中文简洁概括修改过的文件，以及需要 Codex 决定的遗留问题。"
   ```

5. Manually review GLM's edits, keep only the corrections that are technically and stylistically sound, and reject or revert suggestions that would damage citations, code hooks, front matter, ids, URLs, or intended technical meaning.
6. Maintain these Chinese terminology conventions unless the user explicitly changes them:
   - book/course "descent" -> `深入`, not `下潜`
   - "deep dive" syllabus blocks -> `专题深入`
   - JTB -> `有正当理由的真信念`; prefer `正当理由` or `理由` in running prose, and avoid `证成` unless explicitly discussing the technical term
   - scientific replication -> `复现`, `复现实验`, or `可复现`; use `复现危机` for the reproducibility crisis, and use `复制` only for biological/molecular copying
   - preregistration -> `研究预登记`; registered reports -> `注册式报告`
   - day references -> `第 N 日`
   - hype filter -> `炒作过滤器`; evidence labels may use `争议/炒作`
   - names in Chinese running prose -> use established Simplified Chinese renderings or transliterations for major people and places, with the original Latin form in parentheses only on first mention when useful; keep source lists, article titles, DOI metadata, URLs, CSS/JS identifiers, and citation keys in their original Latin form
   - examples: `彼得·昂格尔`, `希拉里·普特南`, `G. E. 摩尔`, `德雷茨克`, `诺齐克`, `基思·德罗斯`, `邓肯·普里查德`, `《美诺篇》（Meno）`, `拉里萨（Larissa）`, `巴黎在法国`; do not mix untranslated prose names with translated prose names unless the name has no stable Chinese rendering or appears inside a bibliographic/source entry
   - use Chinese corner quotes `「」` for quoted speech, thoughts, propositions, slogans, and translated terms in Chinese prose; keep italics for book/journal titles, foreign terms, or true emphasis, not as a substitute for quotation marks
   - insert spaces between Chinese text and Latin letters, acronyms, Arabic numerals, percentages, and units where source typography permits, for example `2026 年`, `GLM 5.1`, `100 项`, `95% 置信区间`
   - avoid literal metaphors and stiff calques from machine translation; prefer natural, elegant Chinese that remains technically exact
7. Update `src/_data/syllabus_zh.yaml` with the Chinese title, entry, model, debate, and frontier for the new day, and update `src/zh/introduction.md` so the Chinese opening-arc paragraph matches the English scope, day count, and newest-day reference.
8. Run the target-day checklist plus the zh-specific build and checks:

   ```sh
   rtk node .codex/skills/180-descent-add-day/scripts/add-day-checklist.mjs ### --require-zh
   rtk npm run build
   rtk npm run check
   ```

9. Inspect the built zh website, EPUB, and PDF outputs.
10. Run the human refinement gate before committing. Include both English and Chinese local pages when both are in scope.
11. Re-run the target-day checklist plus `rtk npm run build` and `rtk npm run check` if the human refinement gate changed any source files.
12. Commit the Chinese edition in the same batch or a follow-up batch with a conventional message, usually `feat: add day ### zh lesson`.

## Deep Dive Appendix Workflow

Use this when the user provides a `day-##-appendix-*.html` file for an already published English day.

1. Identify the target day from the filename or user message.
2. Import the appendix with the reusable importer:

   ```sh
   rtk node scripts/import-appendix-from-html.mjs /absolute/path/to/day-##-appendix-*.html ##
   ```

3. Review the resulting `src/_includes/days/###-slug/en.njk` block marked by `<!-- deep-dive:start -->` and `<!-- deep-dive:end -->`:
   - the web version must be a folded `<details class="deep-dive">` section headed by the appendix title, usually "The Rest of the Map"
   - every live web component must be class-scoped, not ID-scoped, so repeated appendices do not conflict
   - every live component must have an adjacent `.format-alt.epub-only.print-only` static fallback
   - static PDF/EPUB fallbacks should be tables or semantic HTML diagrams, not removed empty space
   - imported IDs should be namespaced with `appendix-d###-`
   - any newly required interaction modules must be listed in the route shell `scripts:` front matter
4. Update `src/_data/future-links.yaml` for new future callbacks introduced by the appendix.
5. Keep standard outputs appendix-free and deep-dive outputs appendix-inclusive:
   - standard EPUB/PDF: no deep-dive appendix content
   - deep-dive EPUB/PDF: appendix content included
   - PDF: no interactive controls; require the static fallback representation
6. Run:

   ```sh
   rtk npm run build
   rtk npm run check
   ```

7. Verify artifacts with text-only checks when image inspection is unavailable or forbidden:
   - inspect `OEBPS/day-###.xhtml` inside both EPUB editions
   - extract PDF text with Ghostscript `txtwrite`
   - confirm standard files omit appendix headings and deep-dive files include fallback headings
8. Mirror the appendix into the Chinese edition in this order:
   - Kimi first: extract the English deep-dive block to `/tmp/day-###-appendix-en.md`, seed `/tmp/day-###-appendix-zh.md`, and run Kimi with explicit input/output paths using `rtk kimi --print --yolo -p`. The prompt itself should be in Chinese and should explicitly require natural Chinese popular-science prose, not literal translation. Do not use `--final-message-only`; watch progress and allow 30-60 minutes for large appendix work before treating silence as failure.
   - Codex review second: compare structure against the English block, preserve comments, classes, ids, data attributes, print/EPUB fallbacks, citations, URLs, DOI links, and JavaScript hooks, then insert the reviewed Chinese block into `src/_includes/days/###-slug/zh.njk` in the matching position.
   - GLM third: run `rtk opencode run -m zhipuai-coding-plan/glm-5.1` with a Chinese prompt, and ask GLM to refine the Chinese file directly in place, not return a one-shot replacement. Tell GLM that any shell command it runs inside this repo must use the `rtk` prefix. Manually review GLM's edits before keeping them.
9. Run the human refinement gate before committing. Include the standard and deep-dive local pages that expose the appendix content.
10. Re-run `rtk npm run build` and `rtk npm run check` if the human refinement gate changed any source files.
11. Commit a small batch with a conventional message, usually `feat: add day ### deep dive appendix`.

Do not edit generated files in `_site/` or `dist/`; they are build outputs.
