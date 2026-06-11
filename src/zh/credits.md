---
layout: layouts/page.njk
permalink: /zh/credits/
locale: zh
title: 致谢与许可
subtitle: 捆绑资源的许可协议与来源归属。
eyebrow: 来源说明
description: 字体与素材的来源说明。
alternate_url: /credits/
---

## 字体

{% for font in credits.fonts %}
- **{{ font.name }}**：{{ font.license }}，[来源]({{ font.source }})
{% endfor %}
