import { readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export async function loadDays(dayDir, options = {}) {
  const withXhtml = options.xhtml === true;
  const files = (await readdir(dayDir))
    .filter((file) => file.endsWith(".md"))
    .sort();
  return files.map((file) => {
    const parsed = matter.read(path.join(dayDir, file));
    const day = { file, data: parsed.data };
    if (withXhtml) {
      day.xhtml = `day-${String(parsed.data.day).padStart(3, "0")}.xhtml`;
    }
    return day;
  });
}
