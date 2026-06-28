import { z } from "zod";

const localeSchema = z.enum(["en", "zh"]);
const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const mdxPathSchema = z.string().regex(/^.+\.mdx$/);

const localeContentSchema = z.object({
  body: mdxPathSchema,
  title: z.string().min(1),
  summary: z.string().min(1)
}).strict();

const appendixLocaleSchema = z.object({
  body: mdxPathSchema,
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
}).strict().superRefine((manifest, context) => {
  checkUniqueValues(manifest.appendices.map((appendix) => appendix.id), ["appendices"], "appendix id", context);
  checkUniqueValues(manifest.interactionScripts, ["interactionScripts"], "interaction script", context);
});

function checkUniqueValues(values: string[], path: Array<string | number>, label: string, context: z.RefinementCtx): void {
  const seen = new Set<string>();
  for (const [index, value] of values.entries()) {
    if (seen.has(value)) {
      context.addIssue({
        code: "custom",
        path: [...path, index],
        message: `duplicate ${label}: ${value}`
      });
    }
    seen.add(value);
  }
}

export type Locale = z.infer<typeof localeSchema>;
export type DayManifest = z.infer<typeof dayManifestSchema> & {
  path: string;
};
