---
layout: layouts/day.njk
tags: zhDay
locale: zh
day: 1
title: "知识是什么？"
summary: "一座停走的时钟揭示：证成充分的真信念，未必就是知识。"
block: 知识与推理的根基
slug: what-is-knowledge
day_path: 001-what-is-knowledge
source_file: ../day-01-what-is-knowledge.html
threads:
  - 信息
  - 计算
  - 涌现
content_template: days/001-what-is-knowledge/zh.njk
scripts:
  - /assets/js/interactions/clock-ticks.js
  - /assets/js/interactions/gettier-machine.js
  - /assets/js/interactions/credence-dial.js
  - /assets/js/interactions/closure-machine.js
  - /assets/js/interactions/stakes-dial.js
  - /assets/js/interactions/modal-rings.js
  - /assets/js/interactions/echo-chamber.js
  - /assets/js/interactions/accuracy-domination.js
permalink: /zh/days/001-what-is-knowledge/
---
{% include content_template %}
