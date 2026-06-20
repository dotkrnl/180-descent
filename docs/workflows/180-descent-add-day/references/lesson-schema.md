# Lesson Schema

Each day has a tiny Eleventy route shell plus a lesson body include.

English:

- route shell: `src/days/day-###-slug.md`
- lesson body: `src/_includes/days/###-slug/en.njk`

Chinese:

- route shell: `src/zh/days/day-###-slug.md`
- lesson body: `src/_includes/days/###-slug/zh.njk`

Required English route-shell front matter:

```yaml
layout: layouts/day.njk
tags: day
day: 3
title: "Logic & Valid Inference"
summary: "One-sentence browse-card summary."
block: Foundations of Knowledge & Reasoning
slug: logic-and-valid-inference
day_path: 003-logic-and-valid-inference
source_file: ../day-03-logic-and-valid-inference.html
threads:
  - information
  - computation
content_template: days/003-logic-and-valid-inference/en.njk
scripts:
  - /assets/js/interactions/example-component.js
permalink: /days/003-logic-and-valid-inference/
```

The route shell body should be only:

```njk
{% include content_template %}
```

Omit `scripts:` when the day has no live web interaction modules.

Required Chinese differences:

```yaml
tags: zhDay
locale: zh
content_template: days/003-logic-and-valid-inference/zh.njk
permalink: /zh/days/003-logic-and-valid-inference/
```

Expected lesson-body order:

1. Hero with title, subtitle, and a meaningful visual.
2. Lede that introduces the entry analogy.
3. "Where we are" block with links to previous published days and plain-text future callbacks.
4. Core model sections.
5. Debate sections.
6. Frontier section with status chips.
7. Open questions.
8. Recap.
9. Tomorrow card.
10. Sources.

Use published internal links for previous days:

```html
<a href="/days/001-what-is-knowledge/"><strong>Day 1</strong></a>
```

Do not link future days until their pages exist. Add them to `src/_data/future-links.yaml`.
