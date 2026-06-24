import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { readYamlFile } from "@lib/data/yaml";
import { isPathInside } from "@lib/fs/path";
import { dayManifestSchema, type DayManifest, type Locale } from "@lib/schemas/day";

const LOCALES: readonly Locale[] = ["en", "zh"];

interface ContentRegistryOptions {
  daysDir: string;
}

interface RegistryBody {
  locale: Locale;
  path: string;
  source: string;
}

interface RegistryAppendixBody extends RegistryBody {
  appendixId: string;
}

interface RegistryDay {
  directory: string;
  manifestPath: string;
  manifest: DayManifest;
  bodies: Record<Locale, RegistryBody>;
  appendixBodies: RegistryAppendixBody[];
}

interface ContentRegistry {
  days: RegistryDay[];
}

export interface RegistryDayLocaleEntry {
  day: RegistryDay;
  body: RegistryBody;
  locale: Locale;
  title: string;
  summary: string;
}

export async function loadContentRegistry(options: ContentRegistryOptions): Promise<ContentRegistry> {
  const entries = await readdir(options.daysDir, { withFileTypes: true });
  const dayDirectories = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(options.daysDir, entry.name))
    .sort();

  const days = [];
  for (const directory of dayDirectories) {
    days.push(await loadRegistryDay(directory));
  }

  days.sort((a, b) => a.manifest.day - b.manifest.day);
  return { days };
}

async function loadRegistryDay(directory: string): Promise<RegistryDay> {
  const manifestPath = path.join(directory, "day.yaml");
  const rawManifest = await readYamlFile<unknown>(manifestPath);
  const manifest: DayManifest = {
    ...dayManifestSchema.parse(rawManifest),
    path: path.basename(directory)
  };

  const bodies: Record<Locale, RegistryBody> = {
    en: await loadRegistryBody(directory, "en", manifest.locales.en.body),
    zh: await loadRegistryBody(directory, "zh", manifest.locales.zh.body)
  };

  const appendixBodies = [];
  for (const appendix of manifest.appendices) {
    for (const locale of LOCALES) {
      const entry = appendix.locales[locale];
      appendixBodies.push({
        appendixId: appendix.id,
        locale,
        path: entry.body,
        source: await readReferencedFile(directory, entry.body)
      });
    }
  }

  return {
    directory,
    manifestPath,
    manifest,
    bodies,
    appendixBodies
  };
}

async function loadRegistryBody(root: string, locale: Locale, relativePath: string): Promise<RegistryBody> {
  return {
    locale,
    path: relativePath,
    source: await readReferencedFile(root, relativePath)
  };
}

async function readReferencedFile(root: string, relativePath: string): Promise<string> {
  return readFile(referencedFilePath(root, relativePath), "utf8");
}

function referencedFilePath(root: string, relativePath: string): string {
  const normalizedRoot = path.resolve(root);
  const filePath = path.resolve(normalizedRoot, relativePath);
  if (!isPathInside(normalizedRoot, filePath)) {
    throw new Error(`Manifest reference escapes day directory: ${relativePath}`);
  }
  return filePath;
}

export function listRegistryDayLocaleEntries(registry: ContentRegistry): RegistryDayLocaleEntry[] {
  return registry.days.flatMap((day) => {
    return LOCALES.map((locale) => {
      const body = day.bodies[locale];
      const localeEntry = day.manifest.locales[locale];

      return {
        day,
        body,
        locale,
        title: localeEntry.title,
        summary: localeEntry.summary
      };
    });
  });
}
