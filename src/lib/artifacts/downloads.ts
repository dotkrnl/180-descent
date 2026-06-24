import path from "node:path";
import type { Locale } from "@lib/schemas/day";
import { siteDir } from "@lib/static-site/routes";

type ArtifactFormat = "epub" | "pdf";

export function downloadsDir(root: string): string {
  return path.join(siteDir(root), "downloads");
}

export function bookArtifactName(format: ArtifactFormat, locale: Locale, deepDive: boolean): string {
  const localePart = locale === "zh" ? "-zh" : "";
  const deepDivePart = deepDive ? "-deep-dive" : "";
  return `180-descent${localePart}${deepDivePart}.${format}`;
}

export function dayArtifactName(format: ArtifactFormat, locale: Locale, dayPath: string): string {
  const localePart = locale === "zh" ? "-zh" : "";
  return `180-descent${localePart}-day-${dayPath}.${format}`;
}

export function downloadArtifactPath(fileName: string): string {
  return `_site/downloads/${fileName}`;
}
