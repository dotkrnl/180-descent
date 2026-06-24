import path from "node:path";

const CONTENT_DAYS_MODULE_PREFIX = "/src/content/days";

export function contentDaysDir(root: string): string {
  return path.join(root, "src/content/days");
}

export function contentDayFile(root: string, dayPath: string, relativePath: string): string {
  return path.join(contentDaysDir(root), dayPath, relativePath);
}

export function contentDayModulePath(dayPath: string, relativePath: string): string {
  return `${CONTENT_DAYS_MODULE_PREFIX}/${dayPath}/${relativePath}`;
}
