# Chinese Edition

Chinese content must be idiomatic Simplified Chinese, not line-by-line English.
Keep translation, blind review, and final consistency review as independent
passes. Internal tool or model names must never appear as translator credit or
reader-facing attribution.

- Inventory every paired English/Chinese MDX file, including the introduction
  and appendices. When work is parallelized, assign non-overlapping files to each
  translation pass. For new or fully refreshed targets, initialize the Chinese
  file from its paired English source before translation; this is input, not
  finished Chinese.
- Give each translator the canonical prompt below, the paired English sources,
  and the terminology glossary. A translation pass may edit only its assigned
  Chinese files and necessary localized data or glossary entries.
- Assign independent blind reviewers who did not translate the files. Reviewers
  receive the English source, final Chinese target, and
  glossary—but not draft history, translator commentary, or prior review comments.
  They must independently identify omissions, additions, mistranslations,
  terminology drift, untranslated UI text, and unidiomatic or overly literal
  Chinese. Resolve all actionable findings before final source-parity review.
- Preserve manifest structure, day numbers, path, citations, URLs, DOI metadata,
  component imports, image alt meaning, and interaction behavior.
- Preserve claim parity, not English syntax. Numbers, dates, named entities,
  rankings, qualifications, evidence status, and uncertainty must agree across
  locales; a rhetorical edit may remain locale-specific when the underlying
  calibrated meaning already agrees.
- Localize block titles and print labels through existing data/components; do not
  hard-code English labels into Chinese print surfaces.
- Translate image `alt`, SVG `aria-label`, captions, panel titles, status-chip
  print labels, figure labels, and static table headings.
- Import the same reusable figure or interactive component used by English, with
  localized props or localized component data when needed.
- Add Chinese-specific styling only through existing SCSS modules, especially
  `src/assets/scss/content/_zh.scss`, unless a shared style is more appropriate.
- Keep terminology consistent across existing Chinese days. Before any Chinese
  translation or review pass, read
  `docs/workflows/180-descent/zh-terminology-glossary.md` and treat it as the
  authoritative glossary.
- When adding or standardizing a recurring term, scan prior Chinese days for
  existing translations before choosing the Chinese form, then update the
  glossary and normalize affected content in the same change where practical.
- For an existing-day consistency pass, preserve the approved Chinese source and
  compare the paired English and Chinese files section by section before editing;
  do not blindly replace an existing translation with English input. Normalize
  shared UI language across the sweep: `模块一` for Block I, `前沿 01` (and so
  on) for frontier claim eyebrows, `未决问题` for the open-question eyebrow,
  and `核心观点` / `最佳类比` / `仍在争论` for the three main recap labels.
- Prefer natural Chinese rhythm and punctuation. Use Chinese quotes for quoted
  propositions and titles where appropriate.
- Avoid `诚实` and `冷静` as routine translations for English `honest` and
  `sober`. Translate the actual function in context: `准确`, `完整`, `稳妥`,
  `严格`, `克制`, `校准`, `审慎`, `相关`, or a local paraphrase. Keep `Sober` as
  an author name and preserve source titles or exact quotations.
- Avoid dense emphasis in Chinese prose. Use terminology styling and sparse
  color emphasis only when it clarifies structure.
- In running Chinese prose, do not use Markdown bold or `<Term as="em">` as a
  translation of English emphasis. Prefer a plain sentence, the default
  `Term` span for a technical term, or a deliberately sparse `Highlight`; keep
  italics only where they identify an original Latin/English title or term.
- Review AI edits manually before accepting: factual accuracy, terminology,
  formatting, component parity, and artifact behavior.
- If a repeated course term is missing, newly standardized, or found
  inconsistent, update `docs/workflows/180-descent/zh-terminology-glossary.md`
  in the same change and fix the affected content where practical.
- For Chinese typography, prefer `「」` for propositions, terms as language
  objects, and short emphasis; use Chinese book title marks for Chinese titles;
  keep original English paper titles in italics or plain Latin text rather than
  wrapping them in multiple quote systems. Preserve exact source titles in
  reference lists.
- When a technical English word has multiple near-synonyms, do not collapse
  distinct concepts into one Chinese term. Follow the glossary for status
  labels, frontier-method names, and technical terms.

- `FormatOnly` static alternatives for web-only interactives must include the
  context that lived inside the interactive component: a localized title, the
  object being shown, and enough rules or captions for PDF/EPUB readers to
  understand the artifact without the live widget.

For a new day or an explicitly approved full retranslation, create or update
Chinese locale fields in `day.yaml`, then initialize
`src/content/days/###-slug/zh.mdx` from a direct, untranslated copy of
`src/content/days/###-slug/en.mdx`. This is translation input, not finished
Chinese, and it may temporarily fail locale checks. Never use this reset during
an existing-day editorial pass. Assign translation and blind review to different
people or independent review passes.

```text
请逐篇审校全部中文译文，并与对应英文原文逐项对照，找出并修正任何信息遗漏、误译、无依据增补、术语不一致和未本地化的界面文字。译文应当信、达、雅，符合现代书面汉语习惯：行文自然、清晰、凝练，不带翻译腔，不使用只有英文才成立的比喻。必要时可以摆脱英文句法和修辞、按中文逻辑彻底重写；但若原文可以自然译出，必须完整保留其信息、限定与证据强度。使用优雅的书面语，避免口语化。

开始前必须完整阅读 docs/workflows/180-descent/zh-terminology-glossary.md，并严格遵循其中的术语；如需新增或统一反复出现的术语，须在同一次修改中更新词表并修正受影响内容。不要把 honest、sober 等词机械译为「诚实」或「冷静」；应按语境采用准确、完整、稳妥、严格、克制、校准、审慎、相关或自然的改写。中文强调应节制使用术语字重、颜色与「」；运行正文不得使用 Markdown 粗体或 <Term as="em">，也不得使用 <em>、<i>、<strong>、<b>、<u>；英文原始论文标题可按词表规则保留斜体。命题、口号和作为语言对象的短语优先用「」。

保留并正确本地化所有 front matter/manifest 键、imports、component props、URLs、DOI、引文元数据、class、id、data attribute、ARIA 结构、图片 alt 文本、表格、SVG、JavaScript hook、MDX 语法及说明性注释。不得编辑英文源文件或构建脚本。完成后用中文简要列出已修改文件、已解决的实质问题，以及仍需负责人决定的事项。
```

For blind review, give a reviewer the source, target, and glossary only:

```text
盲审时不得查看译者的推理、草稿历史或既有评语。请独立比对英文原文与最终中文，逐项报告信息遗漏、误译、无依据增补、术语偏移、未翻译文字、英文句法痕迹及不合中文书面语习惯的表达；只在证据充分时提出修改，并列出相应的英文依据。
```

将盲审中可执行的问题修正后，再由另一名未参与翻译的审校者进行最终一致性检查：

```text
确认译文已经完整保留英文原文的信息、限定条件与证据强度；术语、状态标签、引用、图表文字、替代文本和静态制品文案均与词表及英文对应；中文自然、正式、无翻译腔，且不含仅适用于英文的比喻。
```

For large appendices, use temporary files instead of overwriting translation
input: `/tmp/day-###-appendix-N-en.mdx` and
`/tmp/day-###-appendix-N-zh.mdx`. Start by replacing the temporary Chinese
target with a direct, untranslated copy of the paired English appendix source so
stale Chinese prose cannot be mistaken for reviewed output. Split large English
sources at section boundaries into `/tmp/day-###-appendix-N-part-M-en.mdx`
chunks, translate matching `part-M-zh.mdx` files in separate non-overlapping
passes, then reassemble the result for blind review. Reviewers
must not see translator reasoning, draft history, or earlier review comments.
Only after blind review, manual structure comparison, and artifact validation
should the temporary result replace
`src/content/days/###-slug/appendices/*.zh.mdx`.
