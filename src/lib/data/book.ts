import { bookDownloadUrls, type BookDownloadUrls } from "@lib/artifacts/downloads";
import { bookDataFile } from "@lib/data/paths";
import { readYamlFile } from "@lib/data/yaml";
import { z } from "zod";

export interface BookData {
  title: string;
  subtitle: string;
  deepDiveSubtitle: string;
  authors: string;
  humanEditor: HumanEditorData;
  description: string;
  siteUrl: string;
  repo: string;
  language: string;
  publisher: string;
  publishedYear: number;
  totalDays: number;
  epubIdentifier: string;
  downloads: BookDownloadUrls;
  zh: {
    language: string;
    title: string;
    subtitle: string;
    deepDiveSubtitle: string;
    authors: string;
    translators: string;
    humanEditor: HumanEditorData;
    description: string;
    epubIdentifier: string;
    downloads: BookDownloadUrls;
  };
}

export interface HumanEditorData {
  name: string;
  url: string;
}

const humanEditorSchema = z.object({
  name: z.string().min(1),
  url: z.string().min(1)
}).strict();

const localizedBookSchema = z.object({
  language: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().min(1),
  deep_dive_subtitle: z.string().min(1),
  authors: z.string().min(1),
  translators: z.string().min(1),
  human_editor: humanEditorSchema,
  description: z.string().min(1),
  epub_identifier: z.string().min(1)
}).strict();

const bookDataSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().min(1),
  deep_dive_subtitle: z.string().min(1),
  authors: z.string().min(1),
  human_editor: humanEditorSchema,
  description: z.string().min(1),
  site_url: z.string().min(1),
  repo: z.string().min(1),
  language: z.string().min(1),
  publisher: z.string().min(1),
  published_year: z.number().int().positive(),
  total_days: z.number().int().positive(),
  epub_identifier: z.string().min(1),
  zh: localizedBookSchema
}).strict();

const bookSiteDataSchema = z.object({
  site_url: z.string().min(1)
}).passthrough();

export async function readBookData(root: string): Promise<BookData> {
  const raw = bookDataSchema.parse(await readYamlFile<unknown>(bookDataFile(root)));
  return {
    title: raw.title,
    subtitle: raw.subtitle,
    deepDiveSubtitle: raw.deep_dive_subtitle,
    authors: raw.authors,
    humanEditor: raw.human_editor,
    description: raw.description,
    siteUrl: raw.site_url,
    repo: raw.repo,
    language: raw.language,
    publisher: raw.publisher,
    publishedYear: raw.published_year,
    totalDays: raw.total_days,
    epubIdentifier: raw.epub_identifier,
    downloads: bookDownloadUrls("en"),
    zh: {
      language: raw.zh.language,
      title: raw.zh.title,
      subtitle: raw.zh.subtitle,
      deepDiveSubtitle: raw.zh.deep_dive_subtitle,
      authors: raw.zh.authors,
      translators: raw.zh.translators,
      humanEditor: raw.zh.human_editor,
      description: raw.zh.description,
      epubIdentifier: raw.zh.epub_identifier,
      downloads: bookDownloadUrls("zh")
    }
  };
}

export async function readBookSiteUrl(root: string): Promise<string> {
  const raw = bookSiteDataSchema.parse(await readYamlFile<unknown>(bookDataFile(root)));
  return raw.site_url;
}
