import path from "node:path";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import { listRegistryDayLocaleEntries, loadContentRegistry, type RegistryDayLocaleEntry } from "@lib/content";
import type { Locale } from "@lib/schemas";

type MdxModule = {
  default: AstroComponentFactory;
};

export interface DayAppendixRenderEntry {
  id: string;
  title: string;
  Body: AstroComponentFactory;
}

export interface DayPageModules {
  Body: AstroComponentFactory;
  appendices: DayAppendixRenderEntry[];
}

const mdxModules = import.meta.glob<MdxModule>("/src/content/days/**/*.mdx");

export async function getRegistryDayStaticPaths(locale: Locale) {
  const registry = await loadContentRegistry({ daysDir: path.join(process.cwd(), "src/content/days") });
  return listRegistryDayLocaleEntries(registry)
    .filter((entry) => entry.locale === locale)
    .map((entry) => ({
      params: { dayPath: entry.day.manifest.path },
      props: { entry }
    }));
}

export async function loadDayPageModules(entry: RegistryDayLocaleEntry): Promise<DayPageModules> {
  const Body = await loadMdxBody(entry.day.manifest.path, entry.body.path);
  const appendices: DayAppendixRenderEntry[] = [];

  for (const appendix of entry.day.manifest.appendices) {
    const localeAppendix = appendix.locales[entry.locale];
    if (!localeAppendix) continue;

    appendices.push({
      id: appendix.id,
      title: localeAppendix.title ?? appendix.title?.[entry.locale] ?? appendix.id,
      Body: await loadMdxBody(entry.day.manifest.path, localeAppendix.body)
    });
  }

  return { Body, appendices };
}

async function loadMdxBody(dayPath: string, bodyPath: string): Promise<AstroComponentFactory> {
  const modulePath = `/src/content/days/${dayPath}/${bodyPath}`;
  const loadBody = mdxModules[modulePath];
  if (!loadBody) {
    throw new Error(`Missing MDX module for ${modulePath}`);
  }

  return (await loadBody()).default;
}
