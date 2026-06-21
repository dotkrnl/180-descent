import type { ArtifactBlock, ArtifactDay } from "../model";

export function renderArtifactTypst(day: ArtifactDay): string {
  return [
    "#set document(title: \"" + escapeTypst(day.title) + "\")",
    "",
    `= ${escapeTypst(day.title)}`,
    "",
    escapeTypst(day.summary),
    "",
    ...day.blocks.flatMap(renderBlock),
    ...day.appendices.flatMap((appendix) => [
      `== ${escapeTypst(appendix.title)}`,
      "",
      ...appendix.blocks.flatMap(renderBlock)
    ])
  ].join("\n");
}

function renderBlock(block: ArtifactBlock): string[] {
  switch (block.kind) {
    case "heading":
      return [`${"=".repeat(Math.min(block.level + 1, 6))} ${escapeTypst(block.text)}`, ""];
    case "paragraph":
      return [escapeTypst(block.text), ""];
    case "interaction":
      return [`#figure([${escapeTypst(block.pdfVariant)}], caption: [${escapeTypst(block.id)}])`, ""];
  }
}

function escapeTypst(value: string): string {
  return value
    .replaceAll("\\", "\\\\")
    .replaceAll("\"", "\\\"")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]");
}
