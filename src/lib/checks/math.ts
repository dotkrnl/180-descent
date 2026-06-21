import { readFile } from "node:fs/promises";
import path from "node:path";
import { pathExists, walkFiles } from "@lib/fs";

export interface MathCheckOptions {
  root: string;
  includeDir?: string;
  siteDir?: string;
}

export interface MathCheckFailure {
  file: string;
  label: string;
}

export interface MathCheckResult {
  checkedSourceFiles: number;
  failures: MathCheckFailure[];
}

const LEGACY_PATTERNS = [
  { pattern: /class="formula"[^>]*>[\s\S]*?<p\s+class="eq"/, label: "raw .formula .eq (use {% math %} instead)" },
  { pattern: /<p\s+class="formula"><code>/, label: "raw <p class=formula><code> (use {% math %} instead)" },
  { pattern: /\\\[.*\\\]/, label: "raw \\[ \\] delimiters (use {% math %} instead)" },
  { pattern: /<text[^>]*>[^<]*\\\(/, label: "KaTeX delimiter inside SVG text (SVG text cannot render KaTeX)" }
] as const;

const BUILT_PATTERNS = [
  { pattern: /katex-error|ParseError|KaTeX parse error/, label: "KaTeX render error in built HTML" },
  { pattern: /\\\(|\\\)|\\\[|\\\]/, label: "unrendered KaTeX delimiter in built HTML" }
] as const;

export async function checkMath(options: MathCheckOptions): Promise<MathCheckResult> {
  const includeDir = path.join(options.root, options.includeDir ?? "src/_includes/days");
  const siteDir = path.join(options.root, options.siteDir ?? "_site");
  const failures: MathCheckFailure[] = [];
  const sourceFiles = await pathExists(includeDir)
    ? await walkFiles(includeDir, { exts: ".njk", ignored: [] })
    : [];

  for (const file of sourceFiles) {
    const content = await readFile(file, "utf8");
    failures.push(...scanPatterns(options.root, file, content, LEGACY_PATTERNS));
  }

  if (await pathExists(siteDir)) {
    const builtFiles = await walkFiles(siteDir, { exts: ".html", ignored: [] });
    for (const file of builtFiles) {
      const content = await readFile(file, "utf8");
      failures.push(...scanPatterns(options.root, file, content, BUILT_PATTERNS));
    }
  }

  return {
    checkedSourceFiles: sourceFiles.length,
    failures
  };
}

function scanPatterns(
  root: string,
  file: string,
  content: string,
  patterns: readonly { pattern: RegExp; label: string }[]
): MathCheckFailure[] {
  const failures: MathCheckFailure[] = [];

  for (const { pattern, label } of patterns) {
    pattern.lastIndex = 0;
    if (pattern.test(content)) {
      failures.push({
        file: toRelative(root, file),
        label
      });
    }
  }

  return failures;
}

function toRelative(root: string, filePath: string): string {
  return path.relative(root, filePath).split(path.sep).join("/");
}
