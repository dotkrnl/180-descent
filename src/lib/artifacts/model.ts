import type { RegistryDay } from "@lib/content";

export type ArtifactBlock =
  | { kind: "heading"; level: number; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "interaction"; id: string; epubVariant: string; pdfVariant: string };

export interface ArtifactAppendix {
  id: string;
  title: string;
  blocks: ArtifactBlock[];
}

export interface ArtifactDay {
  day: number;
  path: string;
  locale: "en" | "zh";
  title: string;
  summary: string;
  blocks: ArtifactBlock[];
  appendices: ArtifactAppendix[];
}

export function artifactDayFromRegistry(registryDay: RegistryDay, locale: "en" | "zh"): ArtifactDay {
  const localeManifest = registryDay.manifest.locales[locale];
  if (!localeManifest) {
    throw new Error(`${registryDay.manifest.path} does not declare locale ${locale}`);
  }

  const body = registryDay.bodies.find((entry) => entry.locale === locale);
  if (!body) {
    throw new Error(`${registryDay.manifest.path} is missing loaded body for locale ${locale}`);
  }

  const appendices = registryDay.manifest.appendices.flatMap((appendix) => {
    const appendixLocale = appendix.locales[locale];
    if (!appendixLocale) return [];
    const appendixBody = registryDay.appendixBodies.find((entry) => entry.appendixId === appendix.id && entry.locale === locale);
    if (!appendixBody) {
      throw new Error(`${registryDay.manifest.path} is missing appendix ${appendix.id} body for locale ${locale}`);
    }
    return [{
      id: appendix.id,
      title: appendixLocale.title ?? appendix.title?.[locale] ?? appendix.id,
      blocks: mdxToArtifactBlocks(appendixBody.source)
    }];
  });

  return {
    day: registryDay.manifest.day,
    path: registryDay.manifest.path,
    locale,
    title: localeManifest.title,
    summary: localeManifest.summary,
    blocks: [
      ...mdxToArtifactBlocks(body.source),
      ...registryDay.manifest.components.map((component) => ({
        kind: "interaction" as const,
        id: component.id,
        epubVariant: component.artifactVariants.epub,
        pdfVariant: component.artifactVariants.pdf
      }))
    ],
    appendices
  };
}

function mdxToArtifactBlocks(source: string): ArtifactBlock[] {
  const blocks: ArtifactBlock[] = [];
  const paragraphs: string[] = [];

  function flushParagraph() {
    if (!paragraphs.length) return;
    blocks.push({ kind: "paragraph", text: paragraphs.join(" ") });
    paragraphs.length = 0;
  }

  for (const line of source.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      continue;
    }

    const heading = /^(#{1,6})\s+(.+)$/.exec(trimmed);
    if (heading) {
      flushParagraph();
      blocks.push({ kind: "heading", level: heading[1].length, text: heading[2] });
      continue;
    }

    paragraphs.push(trimmed);
  }

  flushParagraph();
  return blocks;
}
