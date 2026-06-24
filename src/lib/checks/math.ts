import { readFile } from "node:fs/promises";
import { contentDaysDir } from "@lib/content/paths";
import { toPosixRelative } from "@lib/fs/path";
import { walkFiles } from "@lib/fs/walk";
import { siteDir } from "@lib/static-site/routes";

interface MathCheckOptions {
  root: string;
}

interface MathCheckFailure {
  file: string;
  label: string;
}

interface MathCheckResult {
  checkedSourceFiles: number;
  failures: MathCheckFailure[];
}

const RAW_SOURCE_PATTERNS = [
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
  const sourceDir = contentDaysDir(options.root);
  const builtSiteDir = siteDir(options.root);
  const failures: MathCheckFailure[] = [];
  const sourceFiles = await walkFiles(sourceDir, { exts: ".mdx", ignored: [] });

  for (const file of sourceFiles) {
    const content = await readFile(file, "utf8");
    failures.push(...scanPatterns(options.root, file, content, RAW_SOURCE_PATTERNS));
  }

  const builtFiles = await walkFiles(builtSiteDir, { exts: ".html", ignored: [] });
  for (const file of builtFiles) {
    const content = await readFile(file, "utf8");
    failures.push(...scanPatterns(options.root, file, content, BUILT_PATTERNS));
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
