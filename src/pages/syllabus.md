---
layout: layouts/page.njk
permalink: /syllabus/
title: Syllabus
subtitle: The current published course map.
eyebrow: The map
description: Published days and future-link policy.
---

The full master syllabus is maintained at `../SYLLABUS.md` in the workspace. This site publishes completed days as they are incorporated into the canonical source tree.

<div class="toc-grid">
{% for item in collections.days %}
  {% include "components/day-card.njk" %}
{% endfor %}
</div>

Future callbacks are tracked in `src/_data/future-links.yaml`. Links become live when their target day is added.

