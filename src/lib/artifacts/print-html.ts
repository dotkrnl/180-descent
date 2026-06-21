import type { ArtifactBlock, ArtifactDay } from "./model";

export function renderArtifactPrintHtml(day: ArtifactDay): string {
  return [
    "<!doctype html>",
    `<html lang="${day.locale}">`,
    "<head>",
    "  <meta charset=\"utf-8\">",
    `  <title>${escapeHtml(day.title)}</title>`,
    "</head>",
    "<body>",
    `  <article class="day day-${day.day}" data-locale="${day.locale}">`,
    `    <h1>${escapeHtml(day.title)}</h1>`,
    `    <p class="summary">${escapeHtml(day.summary)}</p>`,
    ...day.blocks.map((block) => `    ${renderBlock(block)}`),
    ...day.appendices.map((appendix) => [
      `    <section class="appendix" id="appendix-${escapeAttribute(appendix.id)}">`,
      `      <h2>${escapeHtml(appendix.title)}</h2>`,
      ...appendix.blocks.map((block) => `      ${renderBlock(block)}`),
      "    </section>"
    ].join("\n")),
    "  </article>",
    "</body>",
    "</html>"
  ].join("\n");
}

function renderBlock(block: ArtifactBlock): string {
  switch (block.kind) {
    case "heading":
      return `<h${block.level}>${escapeHtml(block.text)}</h${block.level}>`;
    case "paragraph":
      return `<p>${escapeHtml(block.text)}</p>`;
    case "interaction":
      return `<figure class="interaction-fallback" data-interaction="${escapeAttribute(block.id)}"><figcaption>${escapeHtml(block.pdfVariant)}</figcaption></figure>`;
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&#39;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}
