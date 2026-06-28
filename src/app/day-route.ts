import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import { contentDayModulePath, contentDaysDir } from "@lib/content/paths";
import { listRegistryDayLocaleEntries, loadContentRegistry, type RegistryDayLocaleEntry } from "@lib/content/registry";
import type { Locale } from "@lib/schemas/day";

type MdxModule = {
  default: AstroComponentFactory;
};

interface DayAppendixRenderEntry {
  id: string;
  title: string;
  Body: AstroComponentFactory;
}

export interface DayNavEntry {
  day: number;
  path: string;
  title: string;
}

interface DayPageModules {
  Body: AstroComponentFactory;
  appendices: DayAppendixRenderEntry[];
}

export interface RegistryDayRouteProps {
  entry: RegistryDayLocaleEntry;
  previous?: DayNavEntry;
  next?: DayNavEntry;
}

const mdxModules = import.meta.glob<MdxModule>("/src/content/days/**/*.mdx");

export async function getRegistryDayStaticPaths(locale: Locale) {
  const registry = await loadContentRegistry({ daysDir: contentDaysDir(process.cwd()) });
  const entries = listRegistryDayLocaleEntries(registry)
    .filter((entry) => entry.locale === locale)
    .sort((a, b) => a.day.manifest.day - b.day.manifest.day);

  return entries.map((entry, index) => ({
    params: { dayPath: entry.day.manifest.path },
    props: {
      entry,
      previous: toDayNavEntry(entries[index - 1]),
      next: toDayNavEntry(entries[index + 1])
    } satisfies RegistryDayRouteProps
  }));
}

export async function loadDayPageModules(entry: RegistryDayLocaleEntry): Promise<DayPageModules> {
  const Body = await loadMdxBody(entry.day.manifest.path, entry.body.path);
  const appendices: DayAppendixRenderEntry[] = [];

  for (const appendix of entry.day.manifest.appendices) {
    const localeAppendix = appendix.locales[entry.locale];

    appendices.push({
      id: appendix.id,
      title: localeAppendix.title,
      Body: await loadMdxBody(entry.day.manifest.path, localeAppendix.body)
    });
  }

  return { Body, appendices };
}

async function loadMdxBody(dayPath: string, bodyPath: string): Promise<AstroComponentFactory> {
  const modulePath = contentDayModulePath(dayPath, bodyPath);
  const loadBody = mdxModules[modulePath];
  if (!loadBody) {
    throw new Error(`Missing MDX module for ${modulePath}`);
  }

  return (await loadBody()).default;
}

function toDayNavEntry(entry: RegistryDayLocaleEntry | undefined): DayNavEntry | undefined {
  if (!entry) return undefined;
  return {
    day: entry.day.manifest.day,
    path: entry.day.manifest.path,
    title: entry.title
  };
}
