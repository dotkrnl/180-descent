import { contentDaysDir } from "@lib/content/paths";
import { loadContentRegistry } from "@lib/content/registry";
import { readBookData, type BookData } from "@lib/data/book";
import { readCreditsData, type CreditsData } from "@lib/data/credits";
import { readSyllabusData, type Syllabus, type SyllabusDay } from "@lib/data/syllabus";
import type { Locale } from "@lib/schemas/day";
import { dayUrl } from "@lib/static-site/routes";

export interface ContentDay {
  day: number;
  path: string;
  title: string;
  summary: string;
  block: string;
  url: string;
}

export interface UpcomingSyllabusDay extends SyllabusDay {
  block: string;
  blockId: string;
}

export async function getBookData(): Promise<BookData> {
  return readBookData(process.cwd());
}

export async function getCreditsData(): Promise<CreditsData> {
  return readCreditsData(process.cwd());
}

export async function getSyllabus(locale: Locale): Promise<Syllabus> {
  return readSyllabusData(process.cwd(), locale);
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

export function nextSyllabusDay(syllabus: Syllabus, days: ContentDay[]): UpcomingSyllabusDay | undefined {
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

export function upcomingSyllabusDays(syllabus: Syllabus, days: ContentDay[], count: number): UpcomingSyllabusDay[] {
  const contentDayNumbers = new Set(days.map((day) => day.day));
  const upcoming: UpcomingSyllabusDay[] = [];
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
