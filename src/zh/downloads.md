---
layout: layouts/page.njk
permalink: /zh/downloads/
locale: zh
title: 下载
subtitle: 同一源文件，分别渲染为浏览器、电子阅读器与印刷品三种形态。
eyebrow: 格式
description: 选择精简的标准版，或包含专题附录的深入版；两者都提供 EPUB 与 PDF 格式。
alternate_url: /downloads/
---

<div class="download-grid downloads-list">
  <article class="download-card">
    <p class="card-kicker">EPUB</p>
    <h2><a href="{{ book.zh.downloads.epub }}">标准电子书版</a></h2>
    <p>适合电子阅读器和阅读应用，保留 180 天主线课程，不包含可选专题附录。</p>
  </article>
  <article class="download-card">
    <p class="card-kicker">PDF</p>
    <h2><a href="{{ book.zh.downloads.pdf }}">标准 PDF 版</a></h2>
    <p>固定版式的标准版，适合打印、离线阅读和按页批注，同样不包含可选专题附录。</p>
  </article>
  <article class="download-card">
    <p class="card-kicker">EPUB · 专题深入版</p>
    <h2><a href="{{ book.zh.downloads.deep_epub }}">专题深入电子书版</a></h2>
    <p>在电子书格式中加入每日专题附录，提供更多背景、例子与参考说明。</p>
  </article>
  <article class="download-card">
    <p class="card-kicker">PDF · 专题深入版</p>
    <h2><a href="{{ book.zh.downloads.deep_pdf }}">专题深入 PDF 版</a></h2>
    <p>包含专题附录的完整固定版式，适合系统学习、打印保存或长期查阅。</p>
  </article>
</div>
