import { z } from "zod";
import { syllabusDataFile } from "@lib/data/paths";
import { readYamlFile } from "@lib/data/yaml";
import type { Locale } from "@lib/schemas/day";

export interface Syllabus {
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

export interface SyllabusDay {
  day: number;
  title: string;
  entry?: string;
  model?: string;
  debate?: string;
  frontier?: string;
  note?: string;
  block?: string;
  blockId?: string;
}

interface LocalizedText {
  en: string;
  zh: string;
}

interface RawSyllabus {
  title: LocalizedText;
  subtitle: LocalizedText;
  purpose: LocalizedText;
  method: LocalizedText;
  blocks: RawSyllabusBlock[];
}

interface RawSyllabusBlock {
  id: string;
  start_day: number;
  end_day: number;
  title: LocalizedText;
  summary: LocalizedText;
  days: RawSyllabusDay[];
}

interface RawSyllabusDay {
  day: number;
  title: LocalizedText;
  entry?: LocalizedText;
  model?: LocalizedText;
  debate?: LocalizedText;
  frontier?: LocalizedText;
  note?: LocalizedText;
}

const localizedTextSchema = z.object({
  en: z.string().min(1),
  zh: z.string().min(1)
}).strict();

const rawSyllabusDaySchema = z.object({
  day: z.number().int().positive(),
  title: localizedTextSchema,
  entry: localizedTextSchema.optional(),
  model: localizedTextSchema.optional(),
  debate: localizedTextSchema.optional(),
  frontier: localizedTextSchema.optional(),
  note: localizedTextSchema.optional()
}).strict();

const rawSyllabusBlockSchema = z.object({
  id: z.string().min(1),
  start_day: z.number().int().positive(),
  end_day: z.number().int().positive(),
  title: localizedTextSchema,
  summary: localizedTextSchema,
  days: z.array(rawSyllabusDaySchema)
}).strict();

const rawSyllabusSchema = z.object({
  title: localizedTextSchema,
  subtitle: localizedTextSchema,
  purpose: localizedTextSchema,
  method: localizedTextSchema,
  blocks: z.array(rawSyllabusBlockSchema)
}).strict();

export async function readSyllabusData(root: string, locale: Locale): Promise<Syllabus> {
  return localizeSyllabus(await readRawSyllabus(root), locale);
}

export async function readSyllabusBlockTitleMap(root: string, locale: Locale): Promise<Map<string, string>> {
  const raw = await readRawSyllabus(root);
  return new Map(raw.blocks.map((block) => [block.title.en, block.title[locale]]));
}

async function readRawSyllabus(root: string): Promise<RawSyllabus> {
  return rawSyllabusSchema.parse(await readYamlFile<unknown>(syllabusDataFile(root))) as RawSyllabus;
}

function localizeSyllabus(raw: RawSyllabus, locale: Locale): Syllabus {
  return {
    title: raw.title[locale],
    subtitle: raw.subtitle[locale],
    purpose: raw.purpose[locale],
    method: raw.method[locale],
    blocks: raw.blocks.map((block) => ({
      id: block.id,
      startDay: block.start_day,
      endDay: block.end_day,
      title: block.title[locale],
      summary: block.summary[locale],
      days: block.days.map((day) => ({
        day: day.day,
        title: day.title[locale],
        entry: localizeOptional(day.entry, locale),
        model: localizeOptional(day.model, locale),
        debate: localizeOptional(day.debate, locale),
        frontier: localizeOptional(day.frontier, locale),
        note: localizeOptional(day.note, locale)
      }))
    }))
  };
}

function localizeOptional(value: LocalizedText | undefined, locale: Locale): string | undefined {
  return value?.[locale];
}
