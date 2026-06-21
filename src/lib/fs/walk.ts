import { readdir, stat } from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

export interface WalkOptions {
  exts?: string | string[] | Set<string>;
  ignored?: Iterable<string>;
  allowedExtensionsRegex?: RegExp;
}

const DEFAULT_IGNORED = new Set([".git", "_site", "dist", "node_modules"]);

export async function walkFiles(dir: string, options: WalkOptions = {}): Promise<string[]> {
  const exts = normalizeExts(options.exts);
  const ignored = options.ignored ? new Set(options.ignored) : DEFAULT_IGNORED;
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignored.has(entry.name)) {
        out.push(...await walkFiles(full, options));
      }
    } else if (matchesExt(entry.name, exts, options.allowedExtensionsRegex)) {
      out.push(full);
    }
  }

  return out;
}

export function walkFilesSync(dir: string, options: WalkOptions = {}, out: string[] = []): string[] {
  const exts = normalizeExts(options.exts);
  const ignored = options.ignored ? new Set(options.ignored) : DEFAULT_IGNORED;

  for (const entry of fsSync.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignored.has(entry.name)) {
        walkFilesSync(full, options, out);
      }
    } else if (matchesExt(entry.name, exts, options.allowedExtensionsRegex)) {
      out.push(full);
    }
  }

  return out;
}

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

export function pathExistsSync(filePath: string): boolean {
  try {
    fsSync.statSync(filePath);
    return true;
  } catch {
    return false;
  }
}

function normalizeExts(exts: WalkOptions["exts"]): Set<string> | null {
  if (!exts) return null;
  if (typeof exts === "string") return new Set([exts]);
  if (exts instanceof Set) return exts;
  if (Array.isArray(exts)) return new Set(exts);
  return null;
}

function matchesExt(entryName: string, exts: Set<string> | null, regex?: RegExp): boolean {
  if (regex) return regex.test(entryName);
  if (!exts) return true;
  return exts.has(path.extname(entryName));
}
