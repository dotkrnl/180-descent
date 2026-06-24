import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { dayManifestSchema, type DayManifest, type Locale } from "@lib/schemas/day";

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
  bodies: RegistryBody[];
  appendixBodies: RegistryAppendixBody[];
  assets: string[];
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
  const rawManifest = parseYaml(await readFile(manifestPath, "utf8"));
  const manifest: DayManifest = {
    ...dayManifestSchema.parse(rawManifest),
    path: path.basename(directory)
  };

  const bodies = [];
  for (const [locale, entry] of Object.entries(manifest.locales)) {
    bodies.push({
      locale: locale as Locale,
      path: entry.body,
      source: await readReferencedFile(directory, entry.body)
    });
  }

  const appendixBodies = [];
  for (const appendix of manifest.appendices) {
    for (const [locale, entry] of Object.entries(appendix.locales)) {
      appendixBodies.push({
        appendixId: appendix.id,
        locale: locale as Locale,
        path: entry.body,
        source: await readReferencedFile(directory, entry.body)
      });
    }
  }

  const assets = [];
  for (const asset of manifest.assets) {
    for (const assetPath of Object.values(asset.files)) {
      if (!assetPath) continue;
      await assertReferencedFile(directory, assetPath);
      assets.push(assetPath);
    }
  }

  return {
    directory,
    manifestPath,
    manifest,
    bodies,
    appendixBodies,
    assets
  };
}

async function readReferencedFile(root: string, relativePath: string): Promise<string> {
  return readFile(referencedFilePath(root, relativePath), "utf8");
}

async function assertReferencedFile(root: string, relativePath: string): Promise<void> {
  await access(referencedFilePath(root, relativePath));
}

function referencedFilePath(root: string, relativePath: string): string {
  const normalizedRoot = path.resolve(root);
  const filePath = path.resolve(normalizedRoot, relativePath);
  const rootPrefix = `${normalizedRoot}${path.sep}`;
  if (filePath !== normalizedRoot && !filePath.startsWith(rootPrefix)) {
    throw new Error(`Manifest reference escapes day directory: ${relativePath}`);
  }
  return filePath;
}

export function listRegistryDayLocaleEntries(registry: ContentRegistry): RegistryDayLocaleEntry[] {
  return registry.days.flatMap((day) => {
    return day.bodies.map((body) => {
      const localeEntry = day.manifest.locales[body.locale];

      return {
        day,
        body,
        locale: body.locale,
        title: localeEntry.title,
        summary: localeEntry.summary
      };
    });
  });
}
