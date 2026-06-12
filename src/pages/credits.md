---
layout: layouts/page.njk
permalink: /credits/
title: Credits
subtitle: Licenses and source attribution for bundled assets.
eyebrow: Attribution
description: Credits for fonts and assets.
---

## Fonts

{% for font in credits.fonts %}
- **{{ font.name }}**: {{ font.license }}, [source]({{ font.source }})
{% endfor %}

## Images

{% for image in credits.images %}
- **{{ image.title }}** by {{ image.creator }}: {{ image.license }}, [source]({{ image.source }}). {{ image.notes }}
{% endfor %}
