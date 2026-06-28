import path from "node:path";
import type { Locale } from "@lib/schemas/day";
import { siteDir } from "@lib/static-site/routes";

type ArtifactFormat = "epub" | "pdf";

export interface BookDownloadUrls {
  epub: string;
  pdf: string;
  deepEpub: string;
  deepPdf: string;
}

export function downloadsDir(root: string): string {
  return path.join(siteDir(root), "downloads");
}

export function bookArtifactName(format: ArtifactFormat, locale: Locale, deepDive: boolean): string {
  const localePart = locale === "zh" ? "-zh" : "";
  const deepDivePart = deepDive ? "-deep-dive" : "";
  return `180-descent${localePart}${deepDivePart}.${format}`;
}

export function bookArtifactPaths(format: ArtifactFormat): string[] {
  return [
    downloadArtifactPath(bookArtifactName(format, "en", false)),
    downloadArtifactPath(bookArtifactName(format, "en", true)),
    downloadArtifactPath(bookArtifactName(format, "zh", false)),
    downloadArtifactPath(bookArtifactName(format, "zh", true))
  ];
}

export function dayArtifactName(format: ArtifactFormat, locale: Locale, dayPath: string): string {
  const localePart = locale === "zh" ? "-zh" : "";
  return `180-descent${localePart}-day-${dayPath}.${format}`;
}

export function dayArtifactPaths(format: ArtifactFormat, locale: Locale, dayPaths: string[]): string[] {
  return dayPaths.map((dayPath) => downloadArtifactPath(dayArtifactName(format, locale, dayPath)));
}

function artifactDownloadUrl(fileName: string): string {
  return `/downloads/${fileName}`;
}

export function bookDownloadUrls(locale: Locale): BookDownloadUrls {
  return {
    epub: artifactDownloadUrl(bookArtifactName("epub", locale, false)),
    pdf: artifactDownloadUrl(bookArtifactName("pdf", locale, false)),
    deepEpub: artifactDownloadUrl(bookArtifactName("epub", locale, true)),
    deepPdf: artifactDownloadUrl(bookArtifactName("pdf", locale, true))
  };
}

export function dayArtifactDownloadUrl(format: ArtifactFormat, locale: Locale, dayPath: string): string {
  return artifactDownloadUrl(dayArtifactName(format, locale, dayPath));
}

export function downloadArtifactPath(fileName: string): string {
  return `_site/downloads/${fileName}`;
}
