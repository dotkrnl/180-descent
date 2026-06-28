const FENCED_CODE_BLOCK_PATTERN = /^(`{3,}|~{3,})[^\r\n]*(?:\r?\n[\s\S]*?^\1[ \t]*)$/gm;

export function stripFencedCodeBlocks(source: string): string {
  return source.replace(FENCED_CODE_BLOCK_PATTERN, "");
}

export function stripFencedCodeBlocksPreservingLines(source: string): string {
  return source.replace(FENCED_CODE_BLOCK_PATTERN, (block) => "\n".repeat(countNewlines(block)));
}

function countNewlines(text: string): number {
  return text.match(/\n/g)?.length ?? 0;
}
