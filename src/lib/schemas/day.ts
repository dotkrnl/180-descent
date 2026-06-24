import { z } from "zod";

const localeSchema = z.enum(["en", "zh"]);

const localeContentSchema = z.object({
  body: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1)
});

const localizedTextSchema = z.object({
  en: z.string().min(1).optional(),
  zh: z.string().min(1).optional()
}).strict();

const appendixLocaleSchema = z.object({
  body: z.string().min(1),
  title: z.string().min(1).optional()
});

const appendixSchema = z.object({
  id: z.string().min(1),
  title: localizedTextSchema.optional(),
  locales: z.object({
    en: appendixLocaleSchema.optional(),
    zh: appendixLocaleSchema.optional()
  }).strict().refine(
    (value) => Boolean(value.en || value.zh),
    "Appendix must declare at least one locale"
  )
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

const componentSchema = z.object({
  id: z.string().min(1),
  webEntry: z.string().min(1)
}).strict();

export const dayManifestSchema = z.object({
  day: z.number().int().positive(),
  block: z.string().min(1),
  published: z.boolean().default(false),
  locales: z.object({
    en: localeContentSchema.optional(),
    zh: localeContentSchema.optional()
  }).strict().refine(
    (value) => Boolean(value.en || value.zh),
    "Day must declare at least one locale"
  ),
  appendices: z.array(appendixSchema).default([]),
  components: z.array(componentSchema).default([]),
  assets: z.array(assetSchema).default([])
}).strict();

export type Locale = z.infer<typeof localeSchema>;
export type DayManifest = z.infer<typeof dayManifestSchema> & {
  path: string;
};
