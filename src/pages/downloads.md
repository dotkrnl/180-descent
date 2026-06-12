---
layout: layouts/page.njk
permalink: /downloads/
title: Downloads
subtitle: One map, different forms.
eyebrow: Formats
description: Choose a concise standard edition or the appendix-rich deep-dive edition in EPUB or PDF format.
---

<div class="download-grid downloads-list">
  <article class="download-card">
    <p class="card-kicker">Standard EPUB</p>
    <h2><a href="{{ book.downloads.epub }}">Standard ebook edition</a></h2>
    <p>For ebook readers and reading apps. Contains the core 180-day lesson sequence without the optional research appendices.</p>
  </article>
  <article class="download-card">
    <p class="card-kicker">Standard PDF</p>
    <h2><a href="{{ book.downloads.pdf }}">Standard print edition</a></h2>
    <p>A fixed-layout, print-friendly copy of the core lessons, tuned for paging, citations, and offline reading.</p>
  </article>
  <article class="download-card">
    <p class="card-kicker">Deep Dive EPUB</p>
    <h2><a href="{{ book.downloads.deep_epub }}">Deep-dive ebook edition</a></h2>
    <p>The ebook reader version with each day's optional appendix included for fuller context, extra examples, and source notes.</p>
  </article>
  <article class="download-card">
    <p class="card-kicker">Deep Dive PDF</p>
    <h2><a href="{{ book.downloads.deep_pdf }}">Deep-dive print edition</a></h2>
    <p>The complete print-ready edition with deep-dive appendices included, best for offline study, annotation, or reference.</p>
  </article>
</div>
