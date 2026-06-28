export function stripFencedCodeBlocks(source: string): string {
  return source.replace(/```[\s\S]*?```/g, "");
}
