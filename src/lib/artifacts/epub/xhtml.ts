import type { ArtifactAppendix, ArtifactBlock, ArtifactDay } from "../model";

export function renderArtifactDayXhtml(day: ArtifactDay): string {
  return [
    "<?xml version=\"1.0\" encoding=\"utf-8\"?>",
    "<!DOCTYPE html>",
    `<html xmlns="http://www.w3.org/1999/xhtml" lang="${day.locale}">`,
    "<head>",
    "  <meta charset=\"utf-8\" />",
    `  <title>${escapeXml(day.title)}</title>`,
    "</head>",
    "<body>",
    `  <section id="${escapeAttribute(day.path)}">`,
    `    <h1>${escapeXml(day.title)}</h1>`,
    `    <p class="summary">${escapeXml(day.summary)}</p>`,
    ...day.blocks.map((block) => `    ${renderBlock(block, "epub")}`),
    ...day.appendices.map(renderAppendix),
    "  </section>",
    "</body>",
    "</html>"
  ].join("\n");
}

function renderAppendix(appendix: ArtifactAppendix): string {
  return [
    `    <section id="appendix-${escapeAttribute(appendix.id)}" class="appendix">`,
    `      <h2>${escapeXml(appendix.title)}</h2>`,
    ...appendix.blocks.map((block) => `      ${renderBlock(block, "epub")}`),
    "    </section>"
  ].join("\n");
}

function renderBlock(block: ArtifactBlock, target: "epub" | "pdf"): string {
  switch (block.kind) {
    case "heading":
      return `<h${block.level}>${escapeXml(block.text)}</h${block.level}>`;
    case "paragraph":
      return `<p>${escapeXml(block.text)}</p>`;
    case "interaction":
      return `<aside class="interaction-fallback" data-interaction="${escapeAttribute(block.id)}">${escapeXml(block[target === "epub" ? "epubVariant" : "pdfVariant"])}</aside>`;
  }
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&apos;");
}

function escapeAttribute(value: string): string {
  return escapeXml(value);
}
