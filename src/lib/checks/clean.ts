import { spawnSync } from "node:child_process";
import path from "node:path";
import { pathExists, walkFiles } from "@lib/fs/walk";

export interface CleanCheckOptions {
  root: string;
}

export interface CleanCheckFailure {
  path: string;
  reason: string;
}

const FORBIDDEN_PATHS = [
  ["eleventy.config.cjs", "Static-site config outside Astro must not exist"],
  ["src/days", "Day content must live under src/content/days"],
  ["src/zh/days", "Chinese day content must live under src/content/days"],
  ["src/_includes/days", "Day body includes must not exist outside MDX content"],
  ["scripts/import-day-from-html.mjs", "Blind day importers are not allowed; convert paired MDX manually"],
  ["scripts/import-appendix-from-html.mjs", "Blind appendix importers are not allowed; convert paired MDX manually"]
] as const;

const FORBIDDEN_TRACKED_PATHS = [
  ["_site", "Generated site output must not be committed"],
  ["src/assets/images/social", "Generated social-card PNGs must not be committed"]
] as const;

const FORBIDDEN_SCRIPT_PATTERNS = [
  /renderer-spike/i,
  /bulk-import/i,
  /parallel-adapter/i
];

export async function checkCleanRepo(options: CleanCheckOptions): Promise<CleanCheckFailure[]> {
  const failures: CleanCheckFailure[] = [];

  for (const [relativePath, reason] of FORBIDDEN_PATHS) {
    if (await pathExists(path.join(options.root, relativePath))) {
      failures.push({ path: relativePath, reason });
    }
  }

  for (const [relativePath, reason] of FORBIDDEN_TRACKED_PATHS) {
    if (hasTrackedPath(options.root, relativePath)) {
      failures.push({ path: relativePath, reason });
    }
  }

  const scriptsDir = path.join(options.root, "scripts");
  const scriptFiles = await pathExists(scriptsDir)
    ? await walkFiles(scriptsDir, { ignored: [] })
    : [];
  for (const file of scriptFiles) {
    const relativePath = toPosix(path.relative(options.root, file));
    for (const pattern of FORBIDDEN_SCRIPT_PATTERNS) {
      if (pattern.test(relativePath)) {
        failures.push({
          path: relativePath,
          reason: `Unsupported script path matches ${pattern}`
        });
      }
    }
  }

  return failures;
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
