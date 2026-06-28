import { readdir, stat } from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { isPathUnavailableError } from "@lib/fs/errors";

interface WalkOptions {
  exts?: string | ReadonlySet<string>;
  ignoredDirNames?: Iterable<string>;
}

const DEFAULT_IGNORED = new Set([".git", "_site", "node_modules"]);

export async function walkFiles(dir: string, options: WalkOptions = {}): Promise<string[]> {
  const exts = normalizeExts(options.exts);
  const ignoredDirNames = options.ignoredDirNames ? new Set(options.ignoredDirNames) : DEFAULT_IGNORED;
  const out: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirNames.has(entry.name)) {
        out.push(...await walkFiles(full, options));
      }
    } else if (matchesExt(entry.name, exts)) {
      out.push(full);
    }
  }

  return out;
}

export function walkFilesSync(dir: string, options: WalkOptions = {}, out: string[] = []): string[] {
  const exts = normalizeExts(options.exts);
  const ignoredDirNames = options.ignoredDirNames ? new Set(options.ignoredDirNames) : DEFAULT_IGNORED;

  for (const entry of fsSync.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoredDirNames.has(entry.name)) {
        walkFilesSync(full, options, out);
      }
    } else if (matchesExt(entry.name, exts)) {
      out.push(full);
    }
  }

  return out;
}

export async function pathExists(filePath: string): Promise<boolean> {
  try {
    await stat(filePath);
    return true;
  } catch (error) {
    if (!isPathUnavailableError(error)) throw error;
    return false;
  }
}

function normalizeExts(exts: WalkOptions["exts"]): ReadonlySet<string> | null {
  if (!exts) return null;
  if (typeof exts === "string") return new Set([exts]);
  return exts;
}

function matchesExt(entryName: string, exts: ReadonlySet<string> | null): boolean {
  if (!exts) return true;
  return exts.has(path.extname(entryName));
}
