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

export function siteDayDir(root: string, locale: Locale): string {
  return locale === "zh" ? path.join(root, "_site/zh/days") : path.join(root, "_site/days");
}

export function sitePageFile(root: string, locale: Locale, slug: StaticPageSlug): string {
  return locale === "zh"
    ? path.join(root, "_site/zh", slug, "index.html")
    : path.join(root, "_site", slug, "index.html");
}
