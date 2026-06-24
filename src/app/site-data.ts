import { readFile } from "node:fs/promises";
import { parse as parseYaml } from "yaml";
import { contentDaysDir } from "@lib/content/paths";
import { loadContentRegistry } from "@lib/content/registry";
import { readBookData, type BookData } from "@lib/data/book";
import { creditsDataFile, syllabusDataFile } from "@lib/data/paths";
import type { Locale } from "@lib/schemas/day";
import { dayUrl } from "@lib/static-site/routes";

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

export interface ContentDay {
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
  blocks: SyllabusBlock[];
}

interface SyllabusBlock {
  id: string;
  startDay: number;
  endDay: number;
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
  blockId?: string;
}

interface RawSyllabus {
  title: string;
  subtitle: string;
  purpose: string;
  method: string;
  blocks: RawSyllabusBlock[];
}

interface RawSyllabusBlock {
  id: string;
  start_day: number;
  end_day: number;
  title: string;
  summary: string;
  days: SyllabusDay[];
}

export async function getBookData(): Promise<BookData> {
  return readBookData(process.cwd());
}

export async function getCreditsData(): Promise<CreditsData> {
  return readYaml<CreditsData>(creditsDataFile(process.cwd()));
}

export async function getSyllabus(locale: Locale): Promise<Syllabus> {
  const raw = await readYaml<unknown>(syllabusDataFile(process.cwd()));
  return normalizeSyllabus(projectLocale(raw, locale) as RawSyllabus);
}

export async function getContentDays(locale: Locale): Promise<ContentDay[]> {
  const registry = await loadContentRegistry({ daysDir: contentDaysDir(process.cwd()) });
  return registry.days
    .map((day) => {
      const localeData = day.manifest.locales[locale];
      return {
        day: day.manifest.day,
        path: day.manifest.path,
        title: localeData.title,
        summary: localeData.summary,
        block: day.manifest.block,
        url: dayUrl(locale, day.manifest.path)
      };
    })
    .sort((a, b) => a.day - b.day);
}

export function padDay(value: number): string {
  return String(value).padStart(3, "0");
}

export function latestDays(days: ContentDay[], count: number): ContentDay[] {
  return [...days].sort((a, b) => b.day - a.day).slice(0, count);
}

export function totalSyllabusDays(syllabus: Syllabus): number {
  return syllabus.blocks.reduce((total, block) => total + block.days.length, 0);
}

export function contentDaysByNumber(days: ContentDay[]): Map<number, ContentDay> {
  return new Map(days.map((day) => [day.day, day]));
}

export function nextSyllabusDay(syllabus: Syllabus, days: ContentDay[]): SyllabusDay | undefined {
  const contentDayNumbers = new Set(days.map((day) => day.day));
  for (const block of syllabus.blocks) {
    for (const day of block.days) {
      if (!contentDayNumbers.has(day.day)) {
        return { ...day, block: block.title, blockId: block.id };
      }
    }
  }
  return undefined;
}

export function upcomingSyllabusDays(syllabus: Syllabus, days: ContentDay[], count: number): SyllabusDay[] {
  const contentDayNumbers = new Set(days.map((day) => day.day));
  const upcoming: SyllabusDay[] = [];
  for (const block of syllabus.blocks) {
    for (const day of block.days) {
      if (!contentDayNumbers.has(day.day)) {
        upcoming.push({ ...day, block: block.title, blockId: block.id });
        if (upcoming.length >= count) return upcoming;
      }
    }
  }
  return upcoming;
}

async function readYaml<T>(filePath: string): Promise<T> {
  return parseYaml(await readFile(filePath, "utf8")) as T;
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

function normalizeSyllabus(raw: RawSyllabus): Syllabus {
  return {
    title: raw.title,
    subtitle: raw.subtitle,
    purpose: raw.purpose,
    method: raw.method,
    blocks: raw.blocks.map((block) => ({
      id: block.id,
      startDay: block.start_day,
      endDay: block.end_day,
      title: block.title,
      summary: block.summary,
      days: block.days
    }))
  };
}
