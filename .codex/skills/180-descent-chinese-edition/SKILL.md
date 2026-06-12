---
name: 180-descent-chinese-edition
description: Mirror or refine The 180-Day Descent Chinese edition for normal lessons, deep-dive appendices, Chinese route shells, Chinese lesson includes, syllabus_zh metadata, and zh introduction updates. Use when Codex needs Simplified Chinese translation, terminology consistency, Kimi/GLM review, or zh artifact verification.
---

# Chinese Edition For 180 Descent

Use this skill when English lesson or appendix work must be mirrored into the Chinese edition.

## Slow-Agent Rule

Kimi translation and GLM refinement can be very slow for normal main lesson bodies, route shells, introduction updates, and appendix HTML. Use long-running commands, poll patiently, and let the process finish unless it exits with an error or the user explicitly tells you to stop. Do not substitute another translator, truncate the pass, or assume silence for several minutes means the agent is stuck. This rule applies equally to main day content and appendices.

## Normal Day Workflow

1. Create `src/zh/days/day-###-slug.md` and `src/_includes/days/###-slug/zh.njk`.
2. Preserve the same `day_path` as English, but use `locale: zh`, `tags: zhDay`, `/zh/days/.../` permalink, and `content_template: days/###-slug/zh.njk`.
3. Use Kimi CLI for the first Chinese translation pass. Follow the Slow-Agent Rule. Do not use `--final-message-only`.

```sh
rtk kimi --print --yolo -p "请直接在本仓库中翻译第 ### 日的中文版本文件，并原地编辑目标 route shell 与 lesson include。译文必须是简体中文，技术含义准确，但不要逐字直译；请按面向中文读者的自然中文科普读物来改写，语言要流畅、有节奏、有趣、耐读，读起来像优秀中文作者写出的科普文章。保留所有 front matter 键、content_template、scripts、permalinks、locale: zh、day 数字、slug、URL、DOI 链接、citation metadata、HTML class、id、data attribute、ARIA 结构、表格、SVG 结构与 Nunjucks 语法。不要编辑英文源文件或构建脚本。请输出简短进度说明，并在结束时用中文概括修改过的文件。"
```

4. Manually review Kimi edits for correctness, idiomatic Chinese, route-shell/body split, and preservation of YAML, numbers, dates, citations, DOIs, URLs, CSS classes, ids, JS hooks, Nunjucks syntax, and permalink paths.
5. Run a GLM consistency and language refinement pass with opencode. Follow the Slow-Agent Rule. Ask GLM to edit files in place and tell it all repo shell commands must use `rtk`.

```sh
rtk opencode run -m zhipuai-coding-plan/glm-5.1 "请直接在本仓库中润色中文版本文件，并原地编辑。重点检查翻译准确性、术语一致性、仍需中文化的英文残留，以及中文表达是否自然、优雅、技术准确。不要做逐字直译式润色；请把文字调整成面向中文读者的自然中文科普读物风格，让内容有趣、耐读、清楚。保留 route shell、lesson include、front matter、content_template、scripts、permalinks、URL、DOI 链接、citation metadata、HTML class、id、data attribute、ARIA 结构、表格、SVG 结构、JavaScript hook 与 Nunjucks 语法。不要编辑英文源文件或构建脚本。最后用中文简洁概括修改过的文件，以及需要 Codex 决定的遗留问题。"
```

6. Manually review GLM edits and keep only technically and stylistically sound changes.
7. Update `src/_data/syllabus_zh.yaml` and `src/zh/introduction.md` so scope, day count, and newest-day reference match English.
8. Run:

```sh
rtk node .codex/skills/180-descent-add-day/scripts/add-day-checklist.mjs ### --require-zh
rtk npm run build
rtk npm run check
```

## Appendix Translation

For large appendices, use explicit temporary input/output files instead of asking an agent to overwrite its input:

```sh
rtk kimi --print --yolo -p "请读取英文输入文件 /tmp/day-###-appendix-en.md，并把输出文件 /tmp/day-###-appendix-zh.md 的全部内容原地替换为简体中文版本。只编辑 /tmp/day-###-appendix-zh.md，不要编辑仓库文件。译文不要逐字直译；请按面向中文读者的自然中文科普读物来改写，语言要流畅、有节奏、有趣、耐读，同时保持技术含义准确。不要在聊天中返回一次性的完整文件译文。请输出简短进度说明，并在结束时用中文概括结果。"
```

Then compare structure against English, preserve comments/classes/ids/data attributes/fallbacks/citations/URLs/DOIs/JS hooks, insert into the matching Chinese include, run GLM, manually review, then build and check.

## Terminology

Maintain these conventions unless the user changes them:

- book/course "descent" -> `深入`, not `下潜`
- "deep dive" syllabus blocks -> `专题深入`
- JTB -> `有正当理由的真信念`; prefer `正当理由` or `理由` in running prose, avoid `证成` unless discussing the technical term
- scientific replication -> `复现`, `复现实验`, or `可复现`; use `复现危机`; use `复制` only for biological/molecular copying
- preregistration -> `研究预登记`; registered reports -> `注册式报告`
- day references -> `第 N 日`
- hype filter -> `炒作过滤器`; evidence labels may use `争议/炒作`
- names in Chinese running prose -> use established Simplified Chinese renderings or transliterations, with Latin form on first mention only when useful; keep source lists, article titles, DOI metadata, URLs, CSS/JS identifiers, and citation keys in Latin form
- examples: `彼得·昂格尔`, `希拉里·普特南`, `G. E. 摩尔`, `德雷茨克`, `诺齐克`, `基思·德罗斯`, `邓肯·普里查德`, `《美诺篇》（Meno）`, `拉里萨（Larissa）`, `巴黎在法国`
- use Chinese corner quotes `「」` for quoted speech, thoughts, propositions, slogans, and translated terms in Chinese prose
- insert spaces between Chinese text and Latin letters, acronyms, Arabic numerals, percentages, and units where source typography permits, e.g. `2026 年`, `GLM 5.1`, `100 项`, `95% 置信区间`
- avoid literal metaphors and stiff calques; prefer natural, elegant Chinese that remains technically exact
