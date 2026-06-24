import { readFile } from "node:fs/promises";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { loadContentRegistry } from "@lib/content/registry";
import type { Locale } from "@lib/schemas/day";

interface BookData {
  title: string;
  subtitle: string;
  deep_dive_subtitle?: string;
  authors: string;
  description: string;
  site_url: string;
  repo: string;
  language: string;
  publisher: string;
  published_year: number;
  total_days: number;
  downloads: DownloadData;
  zh: {
    language: string;
    title: string;
    subtitle: string;
    deep_dive_subtitle?: string;
    authors: string;
    translators: string;
    description: string;
    downloads: DownloadData;
  };
}

interface DownloadData {
  epub: string;
  pdf: string;
  deep_epub: string;
  deep_pdf: string;
}

interface CreditsData {
  fonts: CreditFont[];
  images: CreditImage[];
}

interface CreditFont {
  name: string;
  source: string;
  license: string;
}

interface CreditImage {
  title: string;
  creator: string;
  source: string;
  license: string;
  notes: string;
}

export interface PublishedDay {
  day: number;
  path: string;
  title: string;
  summary: string;
  block: string;
  url: string;
}

interface Syllabus {
  title: string;
  subtitle: string;
  purpose: string;
  method: string;
  threads: string[];
  frontier_labels: string[];
  blocks: SyllabusBlock[];
}

interface SyllabusBlock {
  id: string;
  start_day: number;
  end_day: number;
  title: string;
  summary: string;
  days: SyllabusDay[];
}

interface SyllabusDay {
  day: number;
  title: string;
  entry?: string;
  model?: string;
  debate?: string;
  note?: string;
  block?: string;
  block_id?: string;
}

export async function getBookData(): Promise<BookData> {
  return readYaml<BookData>("src/_data/book.yaml");
}

export async function getCreditsData(): Promise<CreditsData> {
  return readYaml<CreditsData>("src/_data/credits.yaml");
}

export async function getSyllabus(locale: Locale): Promise<Syllabus> {
  const raw = await readYaml<unknown>("src/_data/syllabus-data.yaml");
  return projectLocale(raw, locale) as Syllabus;
}

export async function getPublishedDays(locale: Locale): Promise<PublishedDay[]> {
  const registry = await loadContentRegistry({ daysDir: path.join(process.cwd(), "src/content/days") });
  return registry.days
    .filter((day) => day.manifest.published && Boolean(day.manifest.locales[locale]))
    .map((day) => {
      const localeData = day.manifest.locales[locale];
      if (!localeData) throw new Error(`Missing ${locale} locale for ${day.manifest.path}`);
      return {
        day: day.manifest.day,
        path: day.manifest.path,
        title: localeData.title,
        summary: localeData.summary,
        block: day.manifest.block,
        url: locale === "zh" ? `/zh/days/${day.manifest.path}/` : `/days/${day.manifest.path}/`
      };
    })
    .sort((a, b) => a.day - b.day);
}

export function padDay(value: number): string {
  return String(value).padStart(3, "0");
}

export function latestDays(days: PublishedDay[], count: number): PublishedDay[] {
  return [...days].sort((a, b) => b.day - a.day).slice(0, count);
}

export function totalSyllabusDays(syllabus: Syllabus): number {
  return syllabus.blocks.reduce((total, block) => total + block.days.length, 0);
}

export function publishedByDay(days: PublishedDay[]): Map<number, PublishedDay> {
  return new Map(days.map((day) => [day.day, day]));
}

export function nextSyllabusDay(syllabus: Syllabus, days: PublishedDay[]): SyllabusDay | undefined {
  const published = new Set(days.map((day) => day.day));
  for (const block of syllabus.blocks) {
    for (const day of block.days) {
      if (!published.has(day.day)) {
        return { ...day, block: block.title, block_id: block.id };
      }
    }
  }
  return undefined;
}

export function upcomingSyllabusDays(syllabus: Syllabus, days: PublishedDay[], count: number): SyllabusDay[] {
  const published = new Set(days.map((day) => day.day));
  const upcoming: SyllabusDay[] = [];
  for (const block of syllabus.blocks) {
    for (const day of block.days) {
      if (!published.has(day.day)) {
        upcoming.push({ ...day, block: block.title, block_id: block.id });
        if (upcoming.length >= count) return upcoming;
      }
    }
  }
  return upcoming;
}

export function absoluteUrl(pathname: string, siteUrl: string): string {
  return new URL(pathname, siteUrl).href;
}

async function readYaml<T>(relativePath: string): Promise<T> {
  return parseYaml(await readFile(path.join(process.cwd(), relativePath), "utf8")) as T;
}

function projectLocale(value: unknown, locale: Locale): unknown {
  if (Array.isArray(value)) return value.map((entry) => projectLocale(entry, locale));
  if (!value || typeof value !== "object") return value;

  const record = value as Record<string, unknown>;
  if ("en" in record && "zh" in record && Object.keys(record).every((key) => key === "en" || key === "zh")) {
    return record[locale];
  }

  return Object.fromEntries(Object.entries(record).map(([key, entry]) => [key, projectLocale(entry, locale)]));
}
