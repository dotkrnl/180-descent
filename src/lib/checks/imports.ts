import { readFile } from "node:fs/promises";
import path from "node:path";
import ts from "typescript";
import { toPosixRelative } from "@lib/fs/path";
import { walkFiles } from "@lib/fs/walk";

interface ImportCheckOptions {
  root: string;
}

interface UnusedDefaultImport {
  path: string;
  name: string;
}

const DEFAULT_SOURCE_ROOTS = ["src/app", "src/content"] as const;

export async function checkUnusedDefaultImports(options: ImportCheckOptions): Promise<UnusedDefaultImport[]> {
  const failures: UnusedDefaultImport[] = [];

  for (const sourceRoot of DEFAULT_SOURCE_ROOTS) {
    const absoluteRoot = path.join(options.root, sourceRoot);
    for (const filePath of await walkFiles(absoluteRoot, { exts: new Set([".astro", ".mdx"]) })) {
      const source = await readFile(filePath, "utf8");
      for (const unusedImport of findUnusedDefaultImports(source)) {
        failures.push({
          path: toPosixRelative(options.root, filePath),
          name: unusedImport.name
        });
      }
    }
  }

  return failures;
}

export function findUnusedDefaultImports(source: string): Array<{ name: string }> {
  const sourceWithoutCodeBlocks = stripCodeBlocks(source);
  const imports = importDeclarations(sourceWithoutCodeBlocks);
  const sourceWithoutImports = stripRanges(sourceWithoutCodeBlocks, imports.map((entry) => entry.range));
  const unusedImports: Array<{ name: string }> = [];

  for (const entry of imports) {
    const name = defaultImportName(entry.text);
    if (!name) continue;
    if (!hasIdentifier(sourceWithoutImports, name)) {
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

function stripCodeBlocks(source: string): string {
  return source.replace(/```[\s\S]*?```/g, "");
}

function hasIdentifier(source: string, name: string): boolean {
  return new RegExp(`(^|[^A-Za-z0-9_$])${escapeRegExp(name)}([^A-Za-z0-9_$]|$)`).test(source);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
