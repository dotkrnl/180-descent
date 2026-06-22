import { readdir } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

export interface LegacyDay {
  file: string;
  data: Record<string, unknown>;
  xhtml?: string;
}

export interface LegacyDayOptions {
  xhtml?: boolean;
}

export async function loadLegacyDays(dayDir: string, options: LegacyDayOptions = {}): Promise<LegacyDay[]> {
  const files = (await readdir(dayDir))
    .filter((file) => file.endsWith(".md"))
    .sort();

  return files.map((file) => {
    const parsed = matter.read(path.join(dayDir, file));
    const day: LegacyDay = { file, data: parsed.data };
    if (options.xhtml) {
      day.xhtml = `day-${String(parsed.data.day).padStart(3, "0")}.xhtml`;
    }
    return day;
  });
}
