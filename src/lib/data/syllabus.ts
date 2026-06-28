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
  blocks: z.array(rawSyllabusBlockSchema).min(1)
}).strict().superRefine((syllabus, context) => {
  const seenBlockIds = new Set<string>();
  const seenEnglishBlockTitles = new Set<string>();
  const seenDays = new Map<number, string>();
  let expectedStartDay = 1;
  for (const [blockIndex, block] of syllabus.blocks.entries()) {
    if (seenBlockIds.has(block.id)) {
      context.addIssue({
        code: "custom",
        path: ["blocks", blockIndex, "id"],
        message: `duplicate syllabus block id: ${block.id}`
      });
    }
    seenBlockIds.add(block.id);

    if (seenEnglishBlockTitles.has(block.title.en)) {
      context.addIssue({
        code: "custom",
        path: ["blocks", blockIndex, "title", "en"],
        message: `duplicate syllabus block English title: ${block.title.en}`
      });
    }
    seenEnglishBlockTitles.add(block.title.en);

    if (block.start_day !== expectedStartDay) {
      context.addIssue({
        code: "custom",
        path: ["blocks", blockIndex, "start_day"],
        message: blockIndex === 0
          ? `first block start_day must be 1, got ${block.start_day}`
          : `block ${block.id} start_day must be ${expectedStartDay} after previous block range, got ${block.start_day}`
      });
    }
    expectedStartDay = block.end_day + 1;

    if (block.start_day > block.end_day) {
      context.addIssue({
        code: "custom",
        path: ["blocks", blockIndex, "start_day"],
        message: `block ${block.id} start_day must be <= end_day`
      });
    }

    const expectedDays = block.end_day - block.start_day + 1;
    if (block.days.length !== expectedDays) {
      context.addIssue({
        code: "custom",
        path: ["blocks", blockIndex, "days"],
        message: `block ${block.id} must contain ${expectedDays} day(s) for its declared range`
      });
    }

    for (const [dayIndex, day] of block.days.entries()) {
      const expectedDay = block.start_day + dayIndex;
      if (day.day !== expectedDay) {
        context.addIssue({
          code: "custom",
          path: ["blocks", blockIndex, "days", dayIndex, "day"],
          message: `block ${block.id} day row ${dayIndex + 1} must be day ${expectedDay}`
        });
      }

      if (day.day < block.start_day || day.day > block.end_day) {
        context.addIssue({
          code: "custom",
          path: ["blocks", blockIndex, "days", dayIndex, "day"],
          message: `day ${day.day} is outside block ${block.id} range ${block.start_day}-${block.end_day}`
        });
      }

      const existingBlock = seenDays.get(day.day);
      if (existingBlock) {
        context.addIssue({
          code: "custom",
          path: ["blocks", blockIndex, "days", dayIndex, "day"],
          message: `day ${day.day} appears in both block ${existingBlock} and block ${block.id}`
        });
      } else {
        seenDays.set(day.day, block.id);
      }
    }
  }
});

type LocalizedText = z.infer<typeof localizedTextSchema>;
type RawSyllabus = z.infer<typeof rawSyllabusSchema>;

export async function readSyllabusData(root: string, locale: Locale): Promise<Syllabus> {
  return localizeSyllabus(await readRawSyllabus(root), locale);
}

export async function readSyllabusBlockTitleMap(root: string, locale: Locale): Promise<Map<string, string>> {
  const raw = await readRawSyllabus(root);
  return new Map(raw.blocks.map((block) => [block.title.en, block.title[locale]]));
}

async function readRawSyllabus(root: string): Promise<RawSyllabus> {
  return rawSyllabusSchema.parse(await readYamlFile(syllabusDataFile(root)));
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
