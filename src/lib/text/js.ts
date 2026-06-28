export function jsExpressionEnd(source: string, openBraceIndex: number): number | null {
  let depth = 1;
  for (let index = openBraceIndex + 1; index < source.length; index += 1) {
    const skipEnd = jsLiteralOrCommentEnd(source, index);
    if (skipEnd !== null) {
      index = skipEnd;
      continue;
    }

    const char = source[index];
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return null;
}

export function jsLiteralOrCommentEnd(source: string, index: number): number | null {
  const char = source[index];
  if (char === "\"" || char === "'" || char === "`") return quotedLiteralEnd(source, index);
  if (char === "/" && source[index + 1] === "/") return lineCommentEnd(source, index + 2);
  if (char === "/" && source[index + 1] === "*") return blockCommentEnd(source, index + 2);
  return null;
}

function quotedLiteralEnd(source: string, start: number): number {
  const quote = source[start];
  for (let index = start + 1; index < source.length; index += 1) {
    const char = source[index];
    if (char === "\\") {
      index += 1;
    } else if (char === quote) {
      return index;
    }
  }
  return source.length - 1;
}

function lineCommentEnd(source: string, start: number): number {
  const end = source.indexOf("\n", start);
  return end === -1 ? source.length - 1 : end;
}

function blockCommentEnd(source: string, start: number): number {
  const end = source.indexOf("*/", start);
  return end === -1 ? source.length - 1 : end + 1;
}
