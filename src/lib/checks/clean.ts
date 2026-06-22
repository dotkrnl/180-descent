import { access, readdir } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";

export interface CleanCheckOptions {
  root: string;
}

export interface CleanCheckFailure {
  path: string;
  reason: string;
}

const FORBIDDEN_PATHS = [
  ["eleventy.config.cjs", "Retired static-site config must not exist"],
  ["src/days", "Retired English day shell directory must not exist"],
  ["src/zh/days", "Retired Chinese day shell directory must not exist"],
  ["src/_includes/days", "Retired day body directory must not exist"]
] as const;

const ALWAYS_FORBIDDEN_PATHS = [
  ["scripts/import-day-from-html.mjs", "Blind day importer has been retired; use manual paired-MDX conversion"],
  ["scripts/import-appendix-from-html.mjs", "Blind appendix importer has been retired; use manual paired-MDX conversion"]
] as const;

const FORBIDDEN_TRACKED_PATHS = [
  ["_site", "Generated site output must not be committed"],
  ["dist", "Generated temporary output must not be committed"],
  ["src/assets/images/social", "Generated social-card PNGs must not be committed"]
] as const;

const MIGRATION_ONLY_PATTERNS = [
  /renderer-spike/i,
  /migration-only/i,
  /compat(?:ibility)?-shim/i
];

export async function checkCleanRepo(options: CleanCheckOptions): Promise<CleanCheckFailure[]> {
  const failures: CleanCheckFailure[] = [];

  for (const [relativePath, reason] of FORBIDDEN_PATHS) {
    if (await pathExists(path.join(options.root, relativePath))) {
      failures.push({ path: relativePath, reason });
    }
  }

  for (const [relativePath, reason] of ALWAYS_FORBIDDEN_PATHS) {
    if (await pathExists(path.join(options.root, relativePath))) {
      failures.push({ path: relativePath, reason });
    }
  }

  for (const [relativePath, reason] of FORBIDDEN_TRACKED_PATHS) {
    if (hasTrackedPath(options.root, relativePath)) {
      failures.push({ path: relativePath, reason });
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

function hasTrackedPath(root: string, relativePath: string): boolean {
  const result = spawnSync("git", ["ls-files", relativePath], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  return result.status === 0 && result.stdout.trim().length > 0;
}
