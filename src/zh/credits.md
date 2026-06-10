---
layout: layouts/page.njk
permalink: /zh/credits/
locale: zh
title: Credits
subtitle: Licenses and source attribution for bundled assets.
eyebrow: Attribution
description: Credits for fonts, diagrams, and assets.
alternate_url: /credits/
---

## Fonts

{% for font in credits.fonts %}
- **{{ font.name }}**: {{ font.license }}, [source]({{ font.source }})
{% endfor %}

## Images And Diagrams

{% for image in credits.images %}
- **{{ image.name }}**: {{ image.source }}, {{ image.license }}
{% endfor %}
