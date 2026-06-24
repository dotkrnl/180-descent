import { z } from "zod";

const localeSchema = z.enum(["en", "zh"]);

const localeContentSchema = z.object({
  body: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1)
});

const appendixLocaleSchema = z.object({
  body: z.string().min(1),
  title: z.string().min(1)
});

const appendixSchema = z.object({
  id: z.string().min(1),
  locales: z.object({
    en: appendixLocaleSchema,
    zh: appendixLocaleSchema
  }).strict()
});

const localizedFilesSchema = z.object({
  shared: z.string().min(1).optional(),
  en: z.string().min(1).optional(),
  zh: z.string().min(1).optional()
}).refine(
  (value) => Boolean(value.shared || value.en || value.zh),
  "Asset must declare at least one shared or localized file"
);

const assetSchema = z.object({
  id: z.string().min(1),
  files: localizedFilesSchema
}).strict();

export const dayManifestSchema = z.object({
  day: z.number().int().positive(),
  block: z.string().min(1),
  published: z.boolean(),
  locales: z.object({
    en: localeContentSchema,
    zh: localeContentSchema
  }).strict(),
  appendices: z.array(appendixSchema).default([]),
  interactionScripts: z.array(z.string().min(1)).default([]),
  assets: z.array(assetSchema).default([])
}).strict();

export type Locale = z.infer<typeof localeSchema>;
export type DayManifest = z.infer<typeof dayManifestSchema> & {
  path: string;
};
