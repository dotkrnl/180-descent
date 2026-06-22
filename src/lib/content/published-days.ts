import path from "node:path";
import type { Locale } from "@lib/schemas";
import { loadContentRegistry } from "./registry";

export interface PublishedContentDay {
  day: number;
  path: string;
  locale: Locale;
  title: string;
  summary: string;
  xhtml: string;
}

export async function loadPublishedContentDays(root: string, locale: Locale): Promise<PublishedContentDay[]> {
  const registry = await loadContentRegistry({ daysDir: path.join(root, "src/content/days") });
  return registry.days
    .filter((day) => day.manifest.published)
    .flatMap((day) => {
      const localeEntry = day.manifest.locales[locale];
      if (!localeEntry) return [];
      return [{
        day: day.manifest.day,
        path: day.manifest.path,
        locale,
        title: localeEntry.title,
        summary: localeEntry.summary,
        xhtml: `day-${String(day.manifest.day).padStart(3, "0")}.xhtml`
      }];
    })
    .sort((a, b) => a.day - b.day);
}
