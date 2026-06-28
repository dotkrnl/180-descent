import { z } from "zod";

const localeSchema = z.enum(["en", "zh"]);
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

const localeContentSchema = z.object({
  body: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1)
}).strict();

const appendixLocaleSchema = z.object({
  body: z.string().min(1),
  title: z.string().min(1)
}).strict();

const appendixSchema = z.object({
  id: slugSchema,
  locales: z.object({
    en: appendixLocaleSchema,
    zh: appendixLocaleSchema
  }).strict()
}).strict();

export const dayManifestSchema = z.object({
  day: z.number().int().positive(),
  block: z.string().min(1),
  locales: z.object({
    en: localeContentSchema,
    zh: localeContentSchema
  }).strict(),
  appendices: z.array(appendixSchema),
  interactionScripts: z.array(slugSchema)
}).strict();

export type Locale = z.infer<typeof localeSchema>;
export type DayManifest = z.infer<typeof dayManifestSchema> & {
  path: string;
};
