---
layout: layouts/page.njk
permalink: /downloads/
title: Downloads
subtitle: The same source rendered for the browser, ebook readers, and print.
eyebrow: Formats
description: Download EPUB and PDF editions.
---

<div class="download-grid">
  <article class="download-card">
    <p class="card-kicker">EPUB</p>
    <h2><a href="{{ book.downloads.epub }}">180-descent.epub</a></h2>
    <p>Reflowable ebook edition with no-JS reveal and static interaction fallbacks.</p>
  </article>
  <article class="download-card">
    <p class="card-kicker">PDF</p>
    <h2><a href="{{ book.downloads.pdf }}">180-descent.pdf</a></h2>
    <p>6 by 9 inch print edition. Live controls are replaced by static diagrams and tables.</p>
  </article>
</div>

