import { access, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

export interface CleanCheckOptions {
  root: string;
  final: boolean;
}

export interface CleanCheckFailure {
  path: string;
  reason: string;
}

const FINAL_FORBIDDEN_PATHS = [
  ["eleventy.config.cjs", "Eleventy config must be removed after Astro cutover"],
  ["src/days", "English route shells must be removed after paired MDX migration"],
  ["src/zh/days", "Separate Chinese route shells must be removed after paired MDX migration"],
  ["src/_includes/days", "Nunjucks day bodies must be removed after MDX migration"],
  ["scripts/import-day-from-html.mjs", "Blind day importer must not remain in final repo"],
  ["scripts/import-appendix-from-html.mjs", "Blind appendix importer must not remain in final repo"]
] as const;

const FINAL_FORBIDDEN_TRACKED_PATHS = [
  ["_site", "Generated site output must not be committed"],
  ["dist", "Generated temporary output must not be committed"]
] as const;

const MIGRATION_ONLY_PATTERNS = [
  /renderer-spike/i,
  /migration-only/i,
  /compat(?:ibility)?-shim/i
];

export async function checkCleanRepo(options: CleanCheckOptions): Promise<CleanCheckFailure[]> {
  const failures: CleanCheckFailure[] = [];

  if (options.final) {
    for (const [relativePath, reason] of FINAL_FORBIDDEN_PATHS) {
      if (await pathExists(path.join(options.root, relativePath))) {
        failures.push({ path: relativePath, reason });
      }
    }
    for (const [relativePath, reason] of FINAL_FORBIDDEN_TRACKED_PATHS) {
      if (isTracked(options.root, relativePath)) {
        failures.push({ path: relativePath, reason });
      }
    }
  }

  const scriptFiles = await listFiles(path.join(options.root, "scripts"));
  for (const file of scriptFiles) {
    const relativePath = toPosix(path.relative(options.root, file));
    for (const pattern of MIGRATION_ONLY_PATTERNS) {
      if (pattern.test(relativePath)) {
        failures.push({
          path: relativePath,
          reason: `Migration-only script path matches ${pattern}`
        });
      }
    }
  }

  return failures;
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(dir: string): Promise<string[]> {
  if (!(await pathExists(dir))) return [];

  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFiles(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function toPosix(value: string): string {
  return value.split(path.sep).join("/");
}

function isTracked(root: string, relativePath: string): boolean {
  const result = spawnSync("git", ["ls-files", "--error-unmatch", relativePath], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  return result.status === 0;
}
