import { spawnSync } from "node:child_process";

interface CleanCheckOptions {
  root: string;
}

interface CleanCheckFailure {
  path: string;
  reason: string;
}

const FORBIDDEN_TRACKED_PATHS = [
  [".astro", "Generated Astro metadata must not be committed"],
  ["_site", "Generated site output must not be committed"],
  ["dist", "Generated distribution output must not be committed"],
  ["tmp", "Temporary build output must not be committed"],
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
  for (const trackedPath of trackedIgnoredPaths(options.root)) {
    if (isForbiddenTrackedPath(trackedPath)) continue;
    failures.push({
      path: trackedPath,
      reason: "Tracked file matches .gitignore"
    });
  }
  return failures;
}

function isForbiddenTrackedPath(trackedPath: string): boolean {
  return FORBIDDEN_TRACKED_PATHS.some(([relativePath]) => (
    trackedPath === relativePath || trackedPath.startsWith(`${relativePath}/`)
  ));
}

function trackedForbiddenPaths(root: string): string[] {
  return gitLines(root, ["ls-files", "--", ...FORBIDDEN_TRACKED_PATHS.map(([relativePath]) => relativePath)]);
}

function trackedIgnoredPaths(root: string): string[] {
  return gitLines(root, ["ls-files", "--ignored", "--cached", "--exclude-standard"]);
}

function gitLines(root: string, args: string[]): string[] {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || `git ${args.join(" ")} exited ${result.status}`).trim());
  }
  return result.stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
