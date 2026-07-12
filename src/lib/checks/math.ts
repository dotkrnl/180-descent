import { readFile } from "node:fs/promises";
import { builtHtmlFiles } from "@lib/checks/built-site";
import { contentDaysDir } from "@lib/content/paths";
import { toPosixRelative } from "@lib/fs/path";
import { walkFiles } from "@lib/fs/walk";
import { stripFencedCodeBlocks } from "@lib/text/markdown";

interface MathCheckOptions {
  root: string;
  requireBuiltHtml?: boolean;
}

interface MathCheckFailure {
  file: string;
  label: string;
}

interface MathCheckResult {
  checkedSourceFiles: number;
  checkedBuiltFiles: number;
  failures: MathCheckFailure[];
}

const RAW_SOURCE_PATTERNS = [
  { pattern: /class=(["'])formula\1[^>]*>[\s\S]*?<p\s+class=(["'])eq\2/, label: "raw .formula .eq (use <MathBlock> instead)" },
  { pattern: /<p\s+class=(["'])formula\1><code>/, label: "raw <p class=formula><code> (use <MathBlock> instead)" },
  { pattern: /\\\[[\s\S]*?\\\]/, label: "raw \\[ \\] delimiters (use <MathBlock> instead)" },
  { pattern: /<text[^>]*>[^<]*\\\(/, label: "KaTeX delimiter inside SVG text (SVG text cannot render KaTeX)" }
] as const;

const BUILT_PATTERNS = [
  { pattern: /katex-error|ParseError|KaTeX parse error/, label: "KaTeX render error in built HTML" },
  { pattern: /\\\(|\\\)|\\\[|\\\]/, label: "unrendered KaTeX delimiter in built HTML" }
] as const;

export async function checkMath(options: MathCheckOptions): Promise<MathCheckResult> {
  const sourceDir = contentDaysDir(options.root);
  const failures: MathCheckFailure[] = [];
  const sourceFiles = await walkFiles(sourceDir, { exts: ".mdx", ignoredDirNames: [] });

  for (const file of sourceFiles) {
    const content = stripFencedCodeBlocks(await readFile(file, "utf8"));
    failures.push(...scanPatterns(options.root, file, content, RAW_SOURCE_PATTERNS));
  }

  const builtFiles = options.requireBuiltHtml === false
    ? []
    : (await builtHtmlFiles(options.root, { required: options.requireBuiltHtml })).htmlFiles;
  if (options.requireBuiltHtml === true && !builtFiles.length) {
    failures.push({
      file: "_site",
      label: "contains no HTML files"
    });
  }

  for (const file of builtFiles) {
    const content = await readFile(file, "utf8");
    failures.push(...scanPatterns(options.root, file, content, BUILT_PATTERNS));
  }

  return {
    checkedSourceFiles: sourceFiles.length,
    checkedBuiltFiles: builtFiles.length,
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
