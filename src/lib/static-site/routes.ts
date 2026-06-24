import path from "node:path";
import type { Locale } from "@lib/schemas/day";

export type StaticPageSlug = "credits" | "downloads" | "introduction" | "syllabus";

export function alternateLocale(locale: Locale): Locale {
  return locale === "zh" ? "en" : "zh";
}

export function homeUrl(locale: Locale): string {
  return locale === "zh" ? "/zh/" : "/";
}

export function staticPageUrl(locale: Locale, slug: StaticPageSlug): string {
  return locale === "zh" ? `/zh/${slug}/` : `/${slug}/`;
}

export function dayUrl(locale: Locale, dayPath: string): string {
  return `${dayUrlPrefix(locale)}${dayPath}/`;
}

export function dayUrlPrefix(locale: Locale): string {
  return locale === "zh" ? "/zh/days/" : "/days/";
}

export function siteDir(root: string): string {
  return path.join(root, "_site");
}

export function siteDayDir(root: string, locale: Locale): string {
  return locale === "zh" ? path.join(siteDir(root), "zh/days") : path.join(siteDir(root), "days");
}

export function sitePageFile(root: string, locale: Locale, slug: StaticPageSlug): string {
  return locale === "zh"
    ? path.join(siteDir(root), "zh", slug, "index.html")
    : path.join(siteDir(root), slug, "index.html");
}
