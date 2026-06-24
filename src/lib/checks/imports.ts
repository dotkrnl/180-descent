import { readFile } from "node:fs/promises";
import path from "node:path";
import { toPosixRelative } from "@lib/fs/path";
import { pathExists, walkFiles } from "@lib/fs/walk";

interface ImportCheckOptions {
  root: string;
  sourceRoots?: readonly string[];
}

export interface UnusedDefaultImport {
  path: string;
  name: string;
}

const DEFAULT_SOURCE_ROOTS = ["src/app", "src/content"] as const;
const DEFAULT_IMPORT_PATTERN = /^import\s+([A-Za-z_$][\w$]*)(?:\s*,\s*[^;]+)?\s+from\s+["'][^"']+["'];?\s*$/gm;

export async function checkUnusedDefaultImports(options: ImportCheckOptions): Promise<UnusedDefaultImport[]> {
  const failures: UnusedDefaultImport[] = [];

  for (const sourceRoot of options.sourceRoots ?? DEFAULT_SOURCE_ROOTS) {
    const absoluteRoot = path.join(options.root, sourceRoot);
    if (!await pathExists(absoluteRoot)) continue;

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
  const sourceWithoutImports = source
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("import "))
    .join("\n");
  const unusedImports: Array<{ name: string }> = [];

  for (const match of source.matchAll(DEFAULT_IMPORT_PATTERN)) {
    const name = match[1];
    if (!hasIdentifier(sourceWithoutImports, name)) {
      unusedImports.push({ name });
    }
  }

  return unusedImports;
}

function hasIdentifier(source: string, name: string): boolean {
  return new RegExp(`(^|[^A-Za-z0-9_$])${escapeRegExp(name)}([^A-Za-z0-9_$]|$)`).test(source);
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
