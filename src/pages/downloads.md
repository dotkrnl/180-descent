---
layout: layouts/page.njk
permalink: /downloads/
title: Downloads
subtitle: The same source rendered for the browser, ebook readers, and print.
eyebrow: Formats
description: Download EPUB and PDF editions.
---

<div class="download-grid downloads-list">
  <article class="download-card">
    <p class="card-kicker">Standard EPUB</p>
    <h2><a href="{{ book.downloads.epub }}">180-descent.epub</a></h2>
    <p>The main lessons without deep-dive appendices.</p>
  </article>
  <article class="download-card">
    <p class="card-kicker">Standard PDF</p>
    <h2><a href="{{ book.downloads.pdf }}">180-descent.pdf</a></h2>
    <p>The print edition without deep-dive appendices.</p>
  </article>
  <article class="download-card">
    <p class="card-kicker">Deep Dive EPUB</p>
    <h2><a href="{{ book.downloads.deep_epub }}">180-descent-deep-dive.epub</a></h2>
    <p>Includes each day's appendix material.</p>
  </article>
  <article class="download-card">
    <p class="card-kicker">Deep Dive PDF</p>
    <h2><a href="{{ book.downloads.deep_pdf }}">180-descent-deep-dive.pdf</a></h2>
    <p>Includes each day's appendix material in static print form.</p>
  </article>
</div>
