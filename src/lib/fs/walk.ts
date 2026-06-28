import { readdir, stat } from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";
import { isPathUnavailableError } from "@lib/fs/errors";

interface WalkOptions {
  exts?: string | ReadonlySet<string>;
  ignoredDirNames?: Iterable<string>;
}

interface NormalizedWalkOptions {
  exts: ReadonlySet<string> | null;
  ignoredDirNames: ReadonlySet<string>;
}

const DEFAULT_IGNORED = new Set([".git", "_site", "node_modules"]);

export async function walkFiles(dir: string, options: WalkOptions = {}): Promise<string[]> {
  return walkFilesInto(dir, normalizeWalkOptions(options), []);
}

async function walkFilesInto(dir: string, options: NormalizedWalkOptions, out: string[]): Promise<string[]> {
  const entries = (await readdir(dir, { withFileTypes: true }))
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!options.ignoredDirNames.has(entry.name)) {
        await walkFilesInto(full, options, out);
      }
    } else if (matchesExt(entry.name, options.exts)) {
      out.push(full);
    }
  }

  return out;
}

export function walkFilesSync(dir: string, options: WalkOptions = {}): string[] {
  return walkFilesSyncInto(dir, normalizeWalkOptions(options), []);
}

function walkFilesSyncInto(dir: string, options: NormalizedWalkOptions, out: string[]): string[] {
  const entries = fsSync.readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!options.ignoredDirNames.has(entry.name)) {
        walkFilesSyncInto(full, options, out);
      }
    } else if (matchesExt(entry.name, options.exts)) {
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

function normalizeWalkOptions(options: WalkOptions): NormalizedWalkOptions {
  return {
    exts: normalizeExts(options.exts),
    ignoredDirNames: options.ignoredDirNames ? new Set(options.ignoredDirNames) : DEFAULT_IGNORED
  };
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
