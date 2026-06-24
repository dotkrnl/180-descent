import { spawnSync } from "node:child_process";

interface CleanCheckOptions {
  root: string;
}

interface CleanCheckFailure {
  path: string;
  reason: string;
}

const FORBIDDEN_TRACKED_PATHS = [
  ["_site", "Generated site output must not be committed"],
  ["src/assets/images/social", "Generated social-card PNGs must not be committed"]
] as const;

export function checkCleanRepo(options: CleanCheckOptions): CleanCheckFailure[] {
  const failures: CleanCheckFailure[] = [];

  for (const [relativePath, reason] of FORBIDDEN_TRACKED_PATHS) {
    if (hasTrackedPath(options.root, relativePath)) {
      failures.push({ path: relativePath, reason });
    }
  }

  return failures;
}

function hasTrackedPath(root: string, relativePath: string): boolean {
  const result = spawnSync("git", ["ls-files", relativePath], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  return result.status === 0 && result.stdout.trim().length > 0;
}
