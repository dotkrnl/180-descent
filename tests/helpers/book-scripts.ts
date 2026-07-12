import { readFile } from "node:fs/promises";
import path from "node:path";

const bookScriptPaths = [
  "/book/theme.js",
  "/book/accessibility.js",
  "/book/reading-progress.js",
  "/book/lesson-chrome.js",
  "/book/syllabus-map.js"
] as const;

export async function readBookScripts(): Promise<Record<string, string>> {
  return Object.fromEntries(await Promise.all(bookScriptPaths.map(async (scriptPath) => [
    scriptPath,
    await readFile(path.join(process.cwd(), "src/assets/js", scriptPath), "utf8")
  ])));
}

export function bookScriptTags(): string {
  return bookScriptPaths
    .map((scriptPath) => `<script src="${scriptPath}" defer></script>`)
    .join("\n");
}
