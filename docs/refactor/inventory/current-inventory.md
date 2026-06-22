# Refactor Inventory Baseline

Generated: 2026-06-22T01:23:45.370Z
Status: migration-freeze-active

This report captures source facts for the clean-break refactor. It is a coverage baseline, not a compatibility promise.

## Summary

- English route shells: 7
- Chinese route shells: 7
- Paired day paths: 7
- Nunjucks day bodies: 14
- Interaction scripts: 20
- Build/check scripts: 19
- Workflow docs: 7
- Image assets: 41
- Existing generated downloads: 37

## Build And Deploy Surface

- Build scripts: build, build:astro, build:epub, build:pdf, build:site, build:social-cards
- Check scripts: check, check:a11y, check:appendix-style, check:clean, check:clean:final, check:content, check:epub, check:links, check:math, check:pdf, check:seo, check:svg-text, check:workflows
- Deploy scripts: deploy, deploy:staging

## Day Pairing Baseline

| Day | Path | EN Shell | ZH Shell | EN Body | ZH Body | Scripts |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 001-what-is-knowledge | src/days/day-001-what-is-knowledge.md | src/zh/days/day-001-what-is-knowledge.md | src/_includes/days/001-what-is-knowledge/en.njk | src/_includes/days/001-what-is-knowledge/zh.njk | accuracy-domination.js<br>clock-ticks.js<br>closure-machine.js<br>credence-dial.js<br>echo-chamber.js<br>gettier-machine.js<br>modal-rings.js<br>stakes-dial.js |
| 2 | 002-scientific-method-and-demarcation | src/days/day-002-scientific-method-and-demarcation.md | src/zh/days/day-002-scientific-method-and-demarcation.md | src/_includes/days/002-scientific-method-and-demarcation/en.njk | src/_includes/days/002-scientific-method-and-demarcation/zh.njk | base-rate-engine.js<br>demarcation-lab.js<br>grue-machine.js |
| 3 | 003-logic-and-valid-inference | src/days/day-003-logic-and-valid-inference.md | src/zh/days/day-003-logic-and-valid-inference.md | src/_includes/days/003-logic-and-valid-inference/en.njk | src/_includes/days/003-logic-and-valid-inference/zh.njk | fallacy-spotter.js<br>hype-filter-trainer.js<br>inference-inspector.js |
| 4 | 004-probability-as-extended-logic | src/days/day-004-probability-as-extended-logic.md | src/zh/days/day-004-probability-as-extended-logic.md | src/_includes/days/004-probability-as-extended-logic/en.njk | src/_includes/days/004-probability-as-extended-logic/zh.njk | probability-machines.js |
| 5 | 005-causation | src/days/day-005-causation.md | src/zh/days/day-005-causation.md | src/_includes/days/005-causation/en.njk | src/_includes/days/005-causation/zh.njk | causation-lab.js |
| 6 | 006-statistics-and-the-art-of-not-fooling-yourself | src/days/day-006-statistics-and-the-art-of-not-fooling-yourself.md | src/zh/days/day-006-statistics-and-the-art-of-not-fooling-yourself.md | src/_includes/days/006-statistics-and-the-art-of-not-fooling-yourself/en.njk | src/_includes/days/006-statistics-and-the-art-of-not-fooling-yourself/zh.njk | core.js<br>statistics-appendices.js<br>statistics-lab.js |
| 7 | 007-information-theory | src/days/day-007-information-theory.md | src/zh/days/day-007-information-theory.md | src/_includes/days/007-information-theory/en.njk | src/_includes/days/007-information-theory/zh.njk | information-theory.js |

## Old Conventions Present

- Eleventy config: present
- English route shells: 7
- Chinese route shells: 7
- Nunjucks day bodies: 14
- Importer scripts: none

## Generated Downloads Currently Present

- _site/downloads/180-descent-day-001-what-is-knowledge.epub
- _site/downloads/180-descent-day-001-what-is-knowledge.pdf
- _site/downloads/180-descent-day-002-scientific-method-and-demarcation.epub
- _site/downloads/180-descent-day-002-scientific-method-and-demarcation.pdf
- _site/downloads/180-descent-day-003-logic-and-valid-inference.epub
- _site/downloads/180-descent-day-003-logic-and-valid-inference.pdf
- _site/downloads/180-descent-day-004-probability-as-extended-logic.epub
- _site/downloads/180-descent-day-004-probability-as-extended-logic.pdf
- _site/downloads/180-descent-day-005-causation.epub
- _site/downloads/180-descent-day-005-causation.pdf
- _site/downloads/180-descent-day-006-statistics-and-the-art-of-not-fooling-yourself.epub
- _site/downloads/180-descent-day-006-statistics-and-the-art-of-not-fooling-yourself.pdf
- _site/downloads/180-descent-day-007-information-theory.epub
- _site/downloads/180-descent-day-007-information-theory.pdf
- _site/downloads/180-descent-deep-dive.epub
- _site/downloads/180-descent-deep-dive.pdf
- _site/downloads/180-descent-zh-day-001-what-is-knowledge.epub
- _site/downloads/180-descent-zh-day-001-what-is-knowledge.pdf
- _site/downloads/180-descent-zh-day-002-scientific-method-and-demarcation.epub
- _site/downloads/180-descent-zh-day-002-scientific-method-and-demarcation.pdf
- _site/downloads/180-descent-zh-day-003-logic-and-valid-inference.epub
- _site/downloads/180-descent-zh-day-003-logic-and-valid-inference.pdf
- _site/downloads/180-descent-zh-day-004-probability-as-extended-logic.epub
- _site/downloads/180-descent-zh-day-004-probability-as-extended-logic.pdf
- _site/downloads/180-descent-zh-day-005-causation.epub
- _site/downloads/180-descent-zh-day-005-causation.pdf
- _site/downloads/180-descent-zh-day-006-statistics-and-the-art-of-not-fooling-yourself.epub
- _site/downloads/180-descent-zh-day-006-statistics-and-the-art-of-not-fooling-yourself.pdf
- _site/downloads/180-descent-zh-day-007-information-theory.epub
- _site/downloads/180-descent-zh-day-007-information-theory.pdf
- _site/downloads/180-descent-zh-deep-dive.epub
- _site/downloads/180-descent-zh-deep-dive.pdf
- _site/downloads/180-descent-zh.epub
- _site/downloads/180-descent-zh.pdf
- _site/downloads/180-descent.epub
- _site/downloads/180-descent.pdf
- _site/downloads/index.html

## Workflow Docs

- docs/workflows/180-descent-add-appendix/README.md
- docs/workflows/180-descent-add-day/README.md
- docs/workflows/180-descent-add-day/references/component-contract.md
- docs/workflows/180-descent-add-day/references/lesson-schema.md
- docs/workflows/180-descent-assets/README.md
- docs/workflows/180-descent-chinese-edition/README.md
- docs/workflows/180-descent-publish/README.md

