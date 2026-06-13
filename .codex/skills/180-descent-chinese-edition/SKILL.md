---
name: 180-descent-chinese-edition
description: Mirror or refine The 180-Day Descent Chinese edition for normal lessons, deep-dive appendices, Chinese route shells, Chinese lesson includes, syllabus_zh metadata, and zh introduction updates. Use when Codex needs Simplified Chinese translation, terminology consistency, Kimi/GLM review, or zh artifact verification.
---

# Chinese Edition For 180 Descent

Use this skill when English lesson or appendix work must be mirrored into the Chinese edition.

## Slow-Agent Rule

Kimi translation and GLM refinement can be very slow for normal main lesson bodies, route shells, introduction updates, and appendix HTML. Use long-running commands, poll patiently, and let the process finish unless it exits with an error or the user explicitly tells you to stop. Do not substitute another translator, truncate the pass, or assume silence for several minutes means the agent is stuck. This rule applies equally to main day content and appendices.

## Factual Parity Gate

Chinese editions must preserve the fact-check status of the English source instead of introducing fresh factual drift.

1. After translation or refinement, compare the Chinese route/include against the English source for dates, chronology, names, article/book titles, quotations, numbers, percentages, sample sizes, score thresholds, "X of Y" claims, URLs, DOI strings, evidence labels, and source metadata.
2. If the English source was corrected during a fact-check pass, mirror the correction in Chinese before committing.
3. If a Chinese paraphrase creates a stronger claim than the English, weaken it back to the verified English meaning.
4. If the Chinese edition adds a factual claim not present in English, run the same claim-level verification required by the add-day or add-appendix Fact-Check Gate.
5. Keep terminology idiomatic, but do not trade away technical distinctions such as "replication effect sizes" versus "original effects were real", "conditional theorem" versus unconditional guarantee, or type-theoretic proof assistants versus classical higher-order logic systems.

## Tip Parity Gate

When the English source uses `{% tip '...' %}` explanatory notes, the Chinese
edition must preserve and translate them unless the Chinese prose already
defines the same term before the mention.

1. Keep each tip immediately after the matching Chinese term or phrase.
2. Translate the tip idiomatically into concise Simplified Chinese; do not
   leave English definitions inside Chinese prose unless the technical term
   itself must remain in English.
3. Preserve exact Nunjucks shortcode structure: `{% tip '...' %}`.
4. Do not introduce `<em>`, `<strong>`, links, citations, or other HTML inside
   tip text; the global shortcode escapes the text and renders it as a web tip
   box plus numbered PDF/EPUB footnote.
5. After Kimi or GLM edits, manually compare English and Chinese first-use tips
   for coverage and technical parity.

## SEO Parity Gate

Chinese route shells participate in the same canonical, `hreflang`, sitemap,
JSON-LD, and social-card system as English routes.

1. Preserve `locale: zh`, `tags: zhDay`, `day`, `slug`, `day_path`,
   `permalink: /zh/days/.../`, and `content_template` exactly in the expected
   Chinese route shell shape.
2. Translate `summary` as a concise Chinese search-result snippet. Keep the
   meaning parallel to English, but make it natural for Chinese readers.
3. Do not add custom `canonical_url`, `seo_image`, `robots: noindex`, or
   `sitemap_exclude` to Chinese normal day pages unless the user explicitly
   requests a documented special case.
4. Ensure English and Chinese route shells share the same `day_path`; this is
   what connects reciprocal `hreflang` links and generated day social cards.
5. Run `rtk node scripts/generate-social-cards.mjs` directly or via
   `rtk npm run build`, then run `rtk npm run check:seo` or the full project
   check before considering Chinese mirroring complete.

## Normal Day Workflow

1. Create `src/zh/days/day-###-slug.md` and `src/_includes/days/###-slug/zh.njk`.
2. Preserve the same `day_path` as English, but use `locale: zh`, `tags: zhDay`, `/zh/days/.../` permalink, and `content_template: days/###-slug/zh.njk`.
3. Use Kimi CLI for the first Chinese translation pass. Follow the Slow-Agent Rule. Do not use `--final-message-only`.

```sh
rtk kimi --print --yolo -p "请直接在本仓库中翻译第 ### 日的中文版本文件，并原地编辑目标 route shell 与 lesson include。译文必须是简体中文，技术含义准确，但不要逐字直译；请按面向中文读者的自然中文科普读物来改写，语言要流畅、有节奏、有趣、耐读，读起来像优秀中文作者写出的科普文章。中文正文必须遵守本 skill 的 Typography Gate：中文强调只允许颜色、中文引号「」或二者组合；不要使用 <em>/<i>/<strong>/<b>/<u>；术语少量用 span.term，必要强调少量用 span.hl；命题、想法、口号、短语作为语言对象时优先使用「」；保留语义标签、图表、状态组件的既有颜色，不添加普通正文内联颜色；避免密集标记。保留所有 front matter 键、content_template、scripts、permalinks、locale: zh、day 数字、slug、URL、DOI 链接、citation metadata、HTML class、id、data attribute、ARIA 结构、表格、SVG 结构与 Nunjucks 语法，并保留和翻译所有 {% tip '...' %} 说明。不要编辑英文源文件或构建脚本。请输出简短进度说明，并在结束时用中文概括修改过的文件。"
```

4. Manually review Kimi edits for correctness, idiomatic Chinese, route-shell/body split, Typography Gate compliance, Tip Parity Gate compliance, and preservation of YAML, numbers, dates, citations, DOIs, URLs, CSS classes, ids, JS hooks, Nunjucks syntax, and permalink paths.
5. Run a GLM consistency and language refinement pass with opencode. Follow the Slow-Agent Rule. Ask GLM to edit files in place and tell it all repo shell commands must use `rtk`.

```sh
rtk opencode run -m zhipuai-coding-plan/glm-5.1 "请直接在本仓库中润色中文版本文件，并原地编辑。重点检查翻译准确性、术语一致性、仍需中文化的英文残留，以及中文表达是否自然、优雅、技术准确。不要做逐字直译式润色；请把文字调整成面向中文读者的自然中文科普读物风格，让内容有趣、耐读、清楚。中文正文必须遵守本 skill 的 Typography Gate：中文强调只允许颜色、中文引号「」或二者组合；不要使用 <em>/<i>/<strong>/<b>/<u>；术语少量用 span.term，必要强调少量用 span.hl；命题、想法、口号、短语作为语言对象时优先使用「」；保留语义标签、图表、状态组件的既有颜色，不添加普通正文内联颜色；避免密集标记。保留 route shell、lesson include、front matter、content_template、scripts、permalinks、URL、DOI 链接、citation metadata、HTML class、id、data attribute、ARIA 结构、表格、SVG 结构、JavaScript hook 与 Nunjucks 语法，并保留和润色所有 {% tip '...' %} 中文说明。不要编辑英文源文件或构建脚本。最后用中文简洁概括修改过的文件，以及需要 Codex 决定的遗留问题。"
```

6. Manually review GLM edits and keep only technically and stylistically sound changes. Confirm the Typography Gate and Tip Parity Gate before treating the Chinese edition as complete.
7. Run the Factual Parity Gate against the English source and any fact-check corrections made during the same work.
8. Run the SEO Parity Gate against the English route shell and the generated
   Chinese route shell.
9. Update `src/_data/syllabus_zh.yaml` and `src/zh/introduction.md` so scope, day count, and newest-day reference match English.
10. Run:

```sh
rtk node .codex/skills/180-descent-add-day/scripts/add-day-checklist.mjs ### --require-zh
rtk npm run build
rtk npm run check:seo
rtk npm run check
```

## Appendix Translation

For large appendices, use explicit temporary input/output files instead of asking an agent to overwrite its input:

```sh
rtk kimi --print --yolo -p "请读取英文输入文件 /tmp/day-###-appendix-en.md，并把输出文件 /tmp/day-###-appendix-zh.md 的全部内容原地替换为简体中文版本。只编辑 /tmp/day-###-appendix-zh.md，不要编辑仓库文件。译文不要逐字直译；请按面向中文读者的自然中文科普读物来改写，语言要流畅、有节奏、有趣、耐读，同时保持技术含义准确。中文正文必须遵守本 skill 的 Typography Gate：中文强调只允许颜色、中文引号「」或二者组合；不要使用 <em>/<i>/<strong>/<b>/<u>；术语少量用 span.term，必要强调少量用 span.hl；命题、想法、口号、短语作为语言对象时优先使用「」；保留语义标签、图表、状态组件的既有颜色，不添加普通正文内联颜色；避免密集标记。保留和翻译所有 {% tip '...' %} 说明。不要在聊天中返回一次性的完整文件译文。请输出简短进度说明，并在结束时用中文概括结果。"
```

Then compare structure against English, preserve comments/classes/ids/data attributes/fallbacks/citations/URLs/DOIs/JS hooks and `{% tip %}` notes, insert into the matching Chinese include, run GLM, manually review, confirm the Typography Gate and Tip Parity Gate, then build and check.

## Terminology

Maintain these conventions unless the user changes them:

- book/course "descent" -> `深入`, not `下潜`
- "deep dive" syllabus blocks -> `专题深入`
- JTB -> expand on first use as `JTB（Justified True Belief，证成的真信念）`; thereafter `JTB（证成的真信念）` is acceptable in Chinese prose
- scientific replication -> `复现`, `复现实验`, or `可复现`; use `复现危机`; use `复制` only for biological/molecular copying
- preregistration -> `研究预登记`; registered reports -> `注册式报告`
- day references -> `第 N 日`
- hype filter -> `前沿校准器`; evidence labels may use `争议/炒作`
- names in Chinese running prose -> use established Simplified Chinese renderings or transliterations, with Latin form on first mention only when useful; keep source lists, article titles, DOI metadata, URLs, CSS/JS identifiers, and citation keys in Latin form
- examples: `彼得·昂格尔`, `希拉里·普特南`, `G. E. 摩尔`, `德雷茨克`, `诺齐克`, `基思·德罗斯`, `邓肯·普里查德`, `《美诺篇》（Meno）`, `拉里萨（Larissa）`, `巴黎在法国`
- use Chinese corner quotes `「」` for quoted speech, thoughts, propositions, slogans, and translated terms in Chinese prose
- insert spaces between Chinese text and Latin letters, acronyms, Arabic numerals, percentages, and units where source typography permits, e.g. `2026 年`, `GLM 5.1`, `100 项`, `95% 置信区间`
- avoid literal metaphors and stiff calques; prefer natural, elegant Chinese that remains technically exact

## Typography Gate

Chinese editions should be visually quieter than English editions. Keep the
semantic meaning of English emphasis, but do not mirror English markup
mechanically.

- English editions keep `<em>...</em>` for emphasis, `<em class="term">...</em>` for terms, and `<strong>...</strong>` for strong contrast or structural labels.
- Chinese running prose may use only two highlight types: color and Chinese corner quotes `「」`. These may be combined. Do not use `<em>...</em>`, `<i>...</i>`, `<strong>...</strong>`, `<b>...</b>`, or `<u>...</u>` in Chinese prose.
- Use `<span class="term">...</span>` only for a first-use technical term in the local section. Use sparse `<span class="hl">...</span>` only for necessary conceptual stress. Both classes must remain color-only.
- Prefer Chinese corner quotes `「」` over color for quoted speech, thoughts, propositions, slogans, translated terms, and phrases discussed as language.
- Use Chinese title marks `《》` for translated book, article, dialogue, and work titles where appropriate. Keep Latin source-list metadata, DOI strings, URLs, citation keys, CSS/JS identifiers, and journal metadata stable.
- Preserve semantic color/status components: evidence chips, hype/frontier labels, diagram keys, warnings, and component states. Do not add inline `style="color:..."` for ordinary prose emphasis.
- Keep emphasis sparse: target at most one marked phrase per normal paragraph, two only when a paragraph explicitly teaches a contrast. If several nearby phrases are marked, rewrite the sentence or use quotes instead.
- Never stack visual emphasis in prose except for the allowed color-plus-`「」` combination. Bold, italic, and underline are not part of the Chinese highlight system.
- When converting or editing Chinese files, decide case by case:
  1. first-use technical term -> `<span class="term">...</span>`
  2. necessary conceptual stress -> sparse `<span class="hl">...</span>` or `「...」`
  3. proposition, thought, slogan, or phrase-as-language -> `「」`
  4. title -> `《》` when idiomatic, otherwise plain text
  5. ordinary emphasis -> remove markup
  6. structural UI/status/diagram markup -> preserve existing classes and semantics, but do not introduce bold/italic/underline as Chinese highlights
