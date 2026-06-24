import path from "node:path";
import { loadContentRegistry } from "@lib/content/registry";
import type { Locale } from "@lib/schemas/day";

interface ArtifactBook {
  locale: Locale;
  days: ArtifactBookDay[];
}

export interface ArtifactBookDay {
  day: number;
  path: string;
  locale: Locale;
  title: string;
  summary: string;
  block: string;
  bodyPath: string;
  bodySource: string;
  xhtml: string;
  appendices: ArtifactBookAppendix[];
  assets: ArtifactBookAsset[];
}

interface ArtifactBookAppendix {
  id: string;
  title: string;
  bodyPath: string;
  bodySource: string;
}

interface ArtifactBookAsset {
  id: string;
  path: string;
}

interface LoadArtifactBookOptions {
  daysDir?: string;
}

async function loadArtifactBook(
  root: string,
  locale: Locale,
  options: LoadArtifactBookOptions = {}
): Promise<ArtifactBook> {
  const registry = await loadContentRegistry({ daysDir: options.daysDir ?? path.join(root, "src/content/days") });
  const days = registry.days
    .filter((day) => day.manifest.published)
    .flatMap((day): ArtifactBookDay[] => {
      const localeEntry = day.manifest.locales[locale];
      const body = day.bodies.find((candidate) => candidate.locale === locale);
      if (!body) return [];

      return [{
        day: day.manifest.day,
        path: day.manifest.path,
        locale,
        title: localeEntry.title,
        summary: localeEntry.summary,
        block: day.manifest.block,
        bodyPath: body.path,
        bodySource: body.source,
        xhtml: `day-${String(day.manifest.day).padStart(3, "0")}.xhtml`,
        appendices: day.manifest.appendices.flatMap((appendix) => {
          const appendixEntry = appendix.locales[locale];
          const appendixBody = day.appendixBodies.find((candidate) => {
            return candidate.appendixId === appendix.id && candidate.locale === locale;
          });
          if (!appendixBody) return [];

          return [{
            id: appendix.id,
            title: appendixEntry.title,
            bodyPath: appendixBody.path,
            bodySource: appendixBody.source
          }];
        }),
        assets: day.manifest.assets.flatMap((asset) => {
          const assetPath = asset.files[locale] ?? asset.files.shared;
          return assetPath ? [{ id: asset.id, path: assetPath }] : [];
        })
      }];
    })
    .sort((a, b) => a.day - b.day);

  return { locale, days };
}

export async function loadArtifactBookDays(
  root: string,
  locale: Locale,
  options: LoadArtifactBookOptions = {}
): Promise<ArtifactBookDay[]> {
  return (await loadArtifactBook(root, locale, options)).days;
}
