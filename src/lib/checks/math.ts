import { readFile } from "node:fs/promises";
import path from "node:path";
import { toPosixRelative } from "@lib/fs/path";
import { pathExists, walkFiles } from "@lib/fs/walk";

interface MathCheckOptions {
  root: string;
  sourceDir?: string;
  siteDir?: string;
}

interface MathCheckFailure {
  file: string;
  label: string;
}

interface MathCheckResult {
  checkedSourceFiles: number;
  failures: MathCheckFailure[];
}

const LEGACY_PATTERNS = [
  { pattern: /class="formula"[^>]*>[\s\S]*?<p\s+class="eq"/, label: "raw .formula .eq (use <MathBlock> instead)" },
  { pattern: /<p\s+class="formula"><code>/, label: "raw <p class=formula><code> (use <MathBlock> instead)" },
  { pattern: /\\\[.*\\\]/, label: "raw \\[ \\] delimiters (use <MathBlock> instead)" },
  { pattern: /<text[^>]*>[^<]*\\\(/, label: "KaTeX delimiter inside SVG text (SVG text cannot render KaTeX)" }
] as const;

const BUILT_PATTERNS = [
  { pattern: /katex-error|ParseError|KaTeX parse error/, label: "KaTeX render error in built HTML" },
  { pattern: /\\\(|\\\)|\\\[|\\\]/, label: "unrendered KaTeX delimiter in built HTML" }
] as const;

export async function checkMath(options: MathCheckOptions): Promise<MathCheckResult> {
  const sourceDir = path.join(options.root, options.sourceDir ?? "src/content/days");
  const siteDir = path.join(options.root, options.siteDir ?? "_site");
  const failures: MathCheckFailure[] = [];
  const sourceFiles = await pathExists(sourceDir)
    ? await walkFiles(sourceDir, { exts: ".mdx", ignored: [] })
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
        file: toPosixRelative(root, file),
        label
      });
    }
  }

  return failures;
}
