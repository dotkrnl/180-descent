import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { dayManifestSchema, type DayManifest } from "@lib/schemas";

export interface ContentRegistryOptions {
  daysDir: string;
}

export interface RegistryBody {
  locale: string;
  path: string;
  source: string;
}

export interface RegistryAppendixBody extends RegistryBody {
  appendixId: string;
}

export interface RegistryDay {
  directory: string;
  manifestPath: string;
  manifest: DayManifest;
  bodies: RegistryBody[];
  appendixBodies: RegistryAppendixBody[];
  assets: string[];
}

export interface ContentRegistry {
  days: RegistryDay[];
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
  const manifest = dayManifestSchema.parse(rawManifest);

  const bodies = [];
  for (const [locale, entry] of Object.entries(manifest.locales)) {
    if (!entry) continue;
    bodies.push({
      locale,
      path: entry.body,
      source: await readReferencedFile(directory, entry.body)
    });
  }

  const appendixBodies = [];
  for (const appendix of manifest.appendices) {
    for (const [locale, entry] of Object.entries(appendix.locales)) {
      if (!entry) continue;
      appendixBodies.push({
        appendixId: appendix.id,
        locale,
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
  const filePath = path.join(root, relativePath);
  return readFile(filePath, "utf8");
}

async function assertReferencedFile(root: string, relativePath: string): Promise<void> {
  const filePath = path.join(root, relativePath);
  await access(filePath);
}
