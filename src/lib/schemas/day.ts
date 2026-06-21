import { z } from "zod";

export const localeSchema = z.enum(["en", "zh"]);

export const reviewStatusSchema = z.enum([
  "draft",
  "needs-review",
  "reviewed",
  "unavailable",
  "pending"
]);

export const localeContentSchema = z.object({
  body: z.string().min(1),
  status: reviewStatusSchema,
  title: z.string().min(1),
  summary: z.string().min(1)
});

export const localizedTextSchema = z.object({
  en: z.string().min(1).optional(),
  zh: z.string().min(1).optional()
}).strict();

export const appendixLocaleSchema = z.object({
  body: z.string().min(1),
  status: reviewStatusSchema,
  title: z.string().min(1).optional()
});

export const appendixSchema = z.object({
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

export const localizedFilesSchema = z.object({
  shared: z.string().min(1).optional(),
  en: z.string().min(1).optional(),
  zh: z.string().min(1).optional()
}).refine(
  (value) => Boolean(value.shared || value.en || value.zh),
  "Asset must declare at least one shared or localized file"
);

export const assetSchema = z.object({
  id: z.string().min(1),
  files: localizedFilesSchema
}).strict();

export const componentSchema = z.object({
  id: z.string().min(1),
  webEntry: z.string().min(1),
  artifactVariants: z.object({
    epub: z.string().min(1),
    pdf: z.string().min(1)
  })
}).strict();

export const dayManifestSchema = z.object({
  day: z.number().int().positive(),
  slug: z.string().min(1),
  path: z.string().min(1),
  block: z.string().min(1),
  published: z.boolean().default(false),
  threads: z.array(z.string().min(1)).default([]),
  locales: z.object({
    en: localeContentSchema.optional(),
    zh: localeContentSchema.optional()
  }).strict().refine(
    (value) => Boolean(value.en || value.zh),
    "Day must declare at least one locale"
  ),
  appendices: z.array(appendixSchema).default([]),
  components: z.array(componentSchema).default([]),
  assets: z.array(assetSchema).default([]),
  sources: z.object({
    required: z.boolean().default(true)
  }).default({ required: true })
}).strict();

export type Locale = z.infer<typeof localeSchema>;
export type ReviewStatus = z.infer<typeof reviewStatusSchema>;
export type DayManifest = z.infer<typeof dayManifestSchema>;
