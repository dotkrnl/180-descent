---
layout: layouts/page.njk
permalink: /credits/
title: Credits
subtitle: Licenses and source attribution for bundled assets.
eyebrow: Attribution
description: Credits for fonts, diagrams, and assets.
---

## Fonts

{% for font in credits.fonts %}
- **{{ font.name }}**: {{ font.license }}, [source]({{ font.source }})
{% endfor %}

## Images And Diagrams

{% for image in credits.images %}
- **{{ image.name }}**: {{ image.source }}, {{ image.license }}
{% endfor %}

