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
  ["src/assets/fonts", "Generated font assets must not be committed"],
  ["src/assets/scss/generated", "Generated SCSS partials must not be committed"],
  ["src/assets/images/social", "Generated social-card PNGs must not be committed"],
  ["public/assets", "Public assets must be imported through Astro instead of committed under public/assets"]
] as const;

export function checkCleanRepo(options: CleanCheckOptions): CleanCheckFailure[] {
  const failures: CleanCheckFailure[] = [];
  const trackedPaths = trackedForbiddenPaths(options.root);

  for (const [relativePath, reason] of FORBIDDEN_TRACKED_PATHS) {
    if (trackedPaths.some((trackedPath) => trackedPath === relativePath || trackedPath.startsWith(`${relativePath}/`))) {
      failures.push({ path: relativePath, reason });
    }
  }
  return failures;
}

function trackedForbiddenPaths(root: string): string[] {
  const result = spawnSync("git", ["ls-files", "--", ...FORBIDDEN_TRACKED_PATHS.map(([relativePath]) => relativePath)], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (result.status !== 0) return [];
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
