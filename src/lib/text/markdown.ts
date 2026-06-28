export function stripFencedCodeBlocks(source: string): string {
  return replaceFencedCodeBlocks(source, () => "");
}

export function stripFencedCodeBlocksPreservingLines(source: string): string {
  return replaceFencedCodeBlocks(source, (block) => "\n".repeat(countNewlines(block)));
}

function replaceFencedCodeBlocks(source: string, replacement: (block: string) => string): string {
  const ranges = fencedCodeBlockRanges(source);
  if (!ranges.length) return source;

  let out = "";
  let offset = 0;
  for (const [start, end] of ranges) {
    out += source.slice(offset, start);
    out += replacement(source.slice(start, end));
    offset = end;
  }
  return out + source.slice(offset);
}

function fencedCodeBlockRanges(source: string): Array<[number, number]> {
  const lines = source.match(/^.*(?:\r?\n|$)/gm)?.filter((line) => line.length) ?? [];
  const ranges: Array<[number, number]> = [];
  let offset = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const opening = line.match(/^(?: {0,3})(`{3,}|~{3,})/);
    if (!opening) {
      offset += line.length;
      continue;
    }

    const start = offset;
    const fenceChar = opening[1][0];
    const fenceLength = opening[1].length;
    let closed = false;
    offset += line.length;

    while (index + 1 < lines.length) {
      index += 1;
      const closingLine = lines[index];
      const closing = closingLine.match(/^(?: {0,3})(`{3,}|~{3,})[ \t]*(?:\r?\n)?$/);
      if (closing && closing[1][0] === fenceChar && closing[1].length >= fenceLength) {
        ranges.push([start, offset + lineLengthWithoutTerminator(closingLine)]);
        closed = true;
        offset += closingLine.length;
        break;
      }
      offset += closingLine.length;
    }

    if (!closed) {
      ranges.push([start, source.length]);
      offset = source.length;
    }
  }

  return ranges;
}

function lineLengthWithoutTerminator(line: string): number {
  return line.replace(/\r?\n$/, "").length;
}

function countNewlines(text: string): number {
  return text.match(/\n/g)?.length ?? 0;
}
