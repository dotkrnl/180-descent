import { readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import { toPosixRelative } from "@lib/fs/path";
import { walkFiles } from "@lib/fs/walk";
import { jsExpressionEnd, jsLiteralOrCommentEnd } from "@lib/text/js";
import { stripFencedCodeBlocks } from "@lib/text/markdown";

interface ImportCheckOptions {
  root: string;
}

interface UnusedDefaultImport {
  path: string;
  name: string;
}

type SourceExt = ".astro" | ".mdx";

const DEFAULT_SOURCE_ROOTS = ["src/app", "src/content"] as const;

export async function checkUnusedDefaultImports(options: ImportCheckOptions): Promise<UnusedDefaultImport[]> {
  const failures: UnusedDefaultImport[] = [];

  for (const sourceRoot of DEFAULT_SOURCE_ROOTS) {
    const absoluteRoot = path.join(options.root, sourceRoot);
    for (const filePath of await walkFiles(absoluteRoot, { exts: new Set([".astro", ".mdx"]) })) {
      const source = await readFile(filePath, "utf8");
      for (const unusedImport of findUnusedDefaultImports(source, path.extname(filePath) as SourceExt)) {
        failures.push({
          path: toPosixRelative(options.root, filePath),
          name: unusedImport.name
        });
      }
    }
  }

  return failures;
}

function findUnusedDefaultImports(source: string, ext: SourceExt): Array<{ name: string }> {
  const sourceWithoutCodeBlocks = stripFencedCodeBlocks(source);
  const sourceWithoutComments = stripComments(sourceWithoutCodeBlocks);
  const imports = importDeclarations(sourceWithoutComments);
  const sourceWithoutImports = stripRanges(sourceWithoutComments, imports.map((entry) => entry.range));
  const jsUsageSource = jsUsageRegions(sourceWithoutImports, ext).join("\n");
  const unusedImports: Array<{ name: string }> = [];

  for (const entry of imports) {
    const name = defaultImportName(entry.text);
    if (!name) continue;
    if (!hasDefaultImportUsage(sourceWithoutImports, jsUsageSource, name)) {
      unusedImports.push({ name });
    }
  }

  return unusedImports;
}

function importDeclarations(source: string): Array<{ text: string; range: [number, number] }> {
  const declarations: Array<{ text: string; range: [number, number] }> = [];
  const lines = source.split(/(?<=\n)/);
  let offset = 0;

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trimStart().startsWith("import ")) {
      offset += line.length;
      continue;
    }

    const start = offset;
    let text = line;
    offset += line.length;
    while (!isCompleteImportDeclaration(text) && index + 1 < lines.length) {
      index += 1;
      text += lines[index];
      offset += lines[index].length;
    }
    declarations.push({ text, range: [start, offset] });
  }

  return declarations;
}

function isCompleteImportDeclaration(text: string): boolean {
  return /\bfrom\s+["'][^"']+["']\s*;?\s*$/.test(text) || /^import\s+["'][^"']+["']\s*;?\s*$/.test(text.trim());
}

function defaultImportName(importSource: string): string | null {
  const sourceFile = ts.createSourceFile("import.ts", importSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const statement = sourceFile.statements[0];
  if (!statement || !ts.isImportDeclaration(statement)) return null;
  if (!statement.importClause || statement.importClause.isTypeOnly || !statement.importClause.name) return null;
  return statement.importClause.name.text;
}

function stripRanges(source: string, ranges: Array<[number, number]>): string {
  const chars = source.split("");
  for (const [start, end] of ranges) {
    for (let index = start; index < end; index += 1) {
      chars[index] = " ";
    }
  }
  return chars.join("");
}

function stripComments(source: string): string {
  return source
    .replace(/<!--[\s\S]*?-->/g, replaceWithSpaces)
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, replaceWithSpaces)
    .replace(/\/\*[\s\S]*?\*\//g, replaceWithSpaces)
    .replace(/^[ \t]*\/\/.*$/gm, replaceWithSpaces);
}

function replaceWithSpaces(text: string): string {
  return text.replace(/[^\r\n]/g, " ");
}

function jsUsageRegions(source: string, ext: SourceExt): string[] {
  if (ext === ".astro") return [astroFrontmatter(source)].filter((entry): entry is string => entry !== null);
  return mdxExportDeclarations(source);
}

function astroFrontmatter(source: string): string | null {
  const opening = source.match(/^---\r?\n/);
  if (!opening) return null;

  const start = opening[0].length;
  const closing = source.slice(start).search(/\r?\n---\s*(?:\r?\n|$)/);
  return closing === -1 ? null : source.slice(start, start + closing);
}

function mdxExportDeclarations(source: string): string[] {
  const declarations: string[] = [];
  const lines = source.split(/(?<=\n)/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!line.trimStart().startsWith("export ")) continue;

    let text = line;
    while (!isCompleteExportDeclaration(text) && index + 1 < lines.length) {
      index += 1;
      text += lines[index];
    }
    declarations.push(text);
  }

  return declarations;
}

function isCompleteExportDeclaration(text: string): boolean {
  const sourceFile = ts.createSourceFile("export.ts", text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const diagnostics = (sourceFile as ts.SourceFile & { parseDiagnostics: readonly ts.Diagnostic[] }).parseDiagnostics;
  return sourceFile.statements.length > 0 && diagnostics.length === 0;
}

function hasDefaultImportUsage(source: string, jsUsageSource: string, name: string): boolean {
  return hasIdentifier(stripJsComments(stripStringLiterals(jsUsageSource)), name)
    || hasJsxTag(source, name)
    || bracedExpressions(source).some((expression) => {
      return hasIdentifier(stripJsComments(stripStringLiterals(expression)), name);
    });
}

function hasJsxTag(source: string, name: string): boolean {
  return new RegExp(`<\\/?\\s*${escapeRegExp(name)}(?=[\\s>/])`).test(source);
}

function bracedExpressions(source: string): string[] {
  const expressions: string[] = [];
  let start: number | null = null;
  let depth = 0;

  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    if (depth > 0) {
      const skipEnd = jsLiteralOrCommentEnd(source, index);
      if (skipEnd !== null) {
        index = skipEnd;
        continue;
      }
    }
    if (char === "{") {
      if (depth === 0) start = index;
      depth += 1;
      continue;
    }
    if (char === "}" && depth > 0) {
      depth -= 1;
      if (depth === 0 && start !== null) {
        expressions.push(source.slice(start, index + 1));
        start = null;
      }
    }
  }

  return expressions;
}

function stripStringLiterals(source: string): string {
  const chars = source.split("");

  for (let index = 0; index < chars.length; index += 1) {
    const quote = chars[index];
    if (quote !== '"' && quote !== "'" && quote !== "`") continue;

    chars[index] = " ";
    index += 1;
    while (index < chars.length) {
      const char = chars[index];
      if (quote === "`" && char === "$" && chars[index + 1] === "{") {
        chars[index] = " ";
        const end = jsExpressionEnd(source, index + 1);
        if (end === null) {
          index += 1;
          continue;
        }
        const expressionStart = index + 2;
        const strippedExpression = stripStringLiterals(source.slice(expressionStart, end));
        for (let offset = 0; offset < strippedExpression.length; offset += 1) {
          chars[expressionStart + offset] = strippedExpression[offset];
        }
        index = end;
        continue;
      }
      chars[index] = char === "\n" || char === "\r" ? char : " ";
      if (char === "\\") {
        index += 1;
        if (index < chars.length && chars[index] !== "\n" && chars[index] !== "\r") {
          chars[index] = " ";
        }
      } else if (char === quote) {
        break;
      }
      index += 1;
    }
  }

  return chars.join("");
}

function stripJsComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, replaceWithSpaces)
    .replace(/\/\/[^\r\n]*/g, replaceWithSpaces);
}

function hasIdentifier(source: string, name: string): boolean {
  return new RegExp(`(^|[^A-Za-z0-9_$])${escapeRegExp(name)}([^A-Za-z0-9_$]|$)`).test(source);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
