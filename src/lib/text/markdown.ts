export function stripFencedCodeBlocks(source: string): string {
  return source.replace(/```[\s\S]*?```/g, "");
}

export function stripFencedCodeBlocksPreservingLines(source: string): string {
  return source.replace(/```[\s\S]*?```/g, (block) => "\n".repeat(countNewlines(block)));
}

function countNewlines(text: string): number {
  return text.match(/\n/g)?.length ?? 0;
}
