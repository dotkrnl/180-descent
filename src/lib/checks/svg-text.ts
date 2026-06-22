import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { walkFilesSync } from "@lib/fs";

export const MIN_SVG_FONT_SIZE = 10.5;

export interface SvgTextCheckOptions {
  root: string;
  roots?: string[];
}

export interface SvgTextCheckFailure {
  file: string;
  line: number;
  value: number;
}

const ALLOWED_EXTENSIONS = /\.(css|html|js|md|njk|scss|svg)$/i;
const GENERATED_STYLE_PATTERN = /^src\/assets\/scss\/generated\//;

export function checkSvgTextSize(options: SvgTextCheckOptions): SvgTextCheckFailure[] {
  const roots = options.roots ?? ["src"];
  const failures: SvgTextCheckFailure[] = [];

  for (const root of roots) {
    const absoluteRoot = path.join(options.root, root);
    if (!existsSync(absoluteRoot)) continue;

    for (const file of walkFilesSync(absoluteRoot, { allowedExtensionsRegex: ALLOWED_EXTENSIONS })) {
      const relativeFile = toRelative(options.root, file);
      if (GENERATED_STYLE_PATTERN.test(relativeFile)) continue;

      const source = readFileSync(file, "utf8");
      if (file.endsWith(".css") || file.endsWith(".js") || file.endsWith(".scss")) {
        checkSegment(source, source, relativeFile, failures);
        continue;
      }

      const svgPattern = /<svg\b[\s\S]*?<\/svg>/gi;
      for (const svgMatch of source.matchAll(svgPattern)) {
        checkSegment(source, svgMatch[0], relativeFile, failures, svgMatch.index ?? 0);
      }
    }
  }

  return failures;
}

function checkSegment(
  source: string,
  segment: string,
  file: string,
  failures: SvgTextCheckFailure[],
  offset = 0
): void {
  const attrPattern = /font-size\s*=\s*["']([0-9]*\.?[0-9]+)(?:px)?["']/gi;
  for (const attrMatch of segment.matchAll(attrPattern)) {
    const value = Number(attrMatch[1]);
    if (value < MIN_SVG_FONT_SIZE) {
      failures.push({
        file,
        line: lineNumber(source, offset + (attrMatch.index ?? 0)),
        value
      });
    }
  }

  const stylePattern = /font-size\s*:\s*([0-9]*\.?[0-9]+)px/gi;
  for (const styleMatch of segment.matchAll(stylePattern)) {
    const value = Number(styleMatch[1]);
    if (value < MIN_SVG_FONT_SIZE) {
      failures.push({
        file,
        line: lineNumber(source, offset + (styleMatch.index ?? 0)),
        value
      });
    }
  }
}

function lineNumber(source: string, index: number): number {
  return source.slice(0, index).split(/\r?\n/).length;
}

function toRelative(root: string, filePath: string): string {
  return path.relative(root, filePath).split(path.sep).join("/");
}
