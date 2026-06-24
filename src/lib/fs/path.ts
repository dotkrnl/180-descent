import path from "node:path";

export function toPosixRelative(root: string, filePath: string): string {
  return path.relative(root, filePath).split(path.sep).join("/");
}

export function isPathInside(root: string, filePath: string): boolean {
  const normalizedRoot = path.resolve(root);
  const normalizedFilePath = path.resolve(filePath);
  return normalizedFilePath === normalizedRoot || normalizedFilePath.startsWith(`${normalizedRoot}${path.sep}`);
}
