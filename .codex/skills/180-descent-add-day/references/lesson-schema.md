# Lesson Schema

Each day is a Markdown file with HTML allowed in the body.

Required front matter:

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
permalink: /days/003-logic-and-valid-inference/
```

Expected body order:

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

