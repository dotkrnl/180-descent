import { readdir, stat } from "node:fs/promises";
import fsSync from "node:fs";
import path from "node:path";

const DEFAULT_IGNORED = new Set([".git", "_site", "dist", "node_modules"]);

function normalizeExts(exts) {
  if (!exts) return null;
  if (typeof exts === "string") return new Set([exts]);
  if (exts instanceof Set) return exts;
  if (Array.isArray(exts)) return new Set(exts);
  return null;
}

function matchesExt(entryName, exts, regex) {
  if (regex) return regex.test(entryName);
  if (!exts) return true;
  return exts.has(path.extname(entryName));
}

export async function walk(dir, options = {}) {
  const exts = normalizeExts(options.exts);
  const ignored = options.ignored ? new Set(options.ignored) : DEFAULT_IGNORED;
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!ignored.has(entry.name)) {
        out.push(...await walk(path.join(dir, entry.name), options));
      }
    } else if (matchesExt(entry.name, exts, options.allowedExtensionsRegex)) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

export function walkSync(dir, options = {}, out = []) {
  const exts = normalizeExts(options.exts);
  const ignored = options.ignored ? new Set(options.ignored) : DEFAULT_IGNORED;
  for (const entry of fsSync.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignored.has(entry.name)) walkSync(full, options, out);
    } else if (matchesExt(entry.name, exts, options.allowedExtensionsRegex)) {
      out.push(full);
    }
  }
  return out;
}

export async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

export function existsSync(filePath) {
  try {
    fsSync.statSync(filePath);
    return true;
  } catch {
    return false;
  }
}
