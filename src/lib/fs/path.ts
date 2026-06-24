import path from "node:path";

export function toPosixRelative(root: string, filePath: string): string {
  return path.relative(root, filePath).split(path.sep).join("/");
}
