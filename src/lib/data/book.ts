import { bookDataFile } from "@lib/data/paths";
import { readYamlFile } from "@lib/data/yaml";

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
  downloads: DownloadData;
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
    downloads: DownloadData;
  };
}

interface DownloadData {
  epub: string;
  pdf: string;
  deepEpub: string;
  deepPdf: string;
}

export interface HumanEditorData {
  name: string;
  url: string;
}

interface RawBookData {
  title: string;
  subtitle: string;
  deep_dive_subtitle: string;
  authors: string;
  human_editor: RawHumanEditorData;
  description: string;
  site_url: string;
  repo: string;
  language: string;
  publisher: string;
  published_year: number;
  total_days: number;
  epub_identifier: string;
  downloads: RawDownloadData;
  zh: {
    language: string;
    title: string;
    subtitle: string;
    deep_dive_subtitle: string;
    authors: string;
    translators: string;
    human_editor: RawHumanEditorData;
    description: string;
    epub_identifier: string;
    downloads: RawDownloadData;
  };
}

interface RawBookSiteData {
  site_url: string;
}

interface RawDownloadData {
  epub: string;
  pdf: string;
  deep_epub: string;
  deep_pdf: string;
}

interface RawHumanEditorData {
  name: string;
  url: string;
}

export async function readBookData(root: string): Promise<BookData> {
  const raw = await readYamlFile<RawBookData>(bookDataFile(root));
  return {
    title: raw.title,
    subtitle: raw.subtitle,
    deepDiveSubtitle: raw.deep_dive_subtitle,
    authors: raw.authors,
    humanEditor: normalizeHumanEditor(raw.human_editor),
    description: raw.description,
    siteUrl: raw.site_url,
    repo: raw.repo,
    language: raw.language,
    publisher: raw.publisher,
    publishedYear: raw.published_year,
    totalDays: raw.total_days,
    epubIdentifier: raw.epub_identifier,
    downloads: normalizeDownloads(raw.downloads),
    zh: {
      language: raw.zh.language,
      title: raw.zh.title,
      subtitle: raw.zh.subtitle,
      deepDiveSubtitle: raw.zh.deep_dive_subtitle,
      authors: raw.zh.authors,
      translators: raw.zh.translators,
      humanEditor: normalizeHumanEditor(raw.zh.human_editor),
      description: raw.zh.description,
      epubIdentifier: raw.zh.epub_identifier,
      downloads: normalizeDownloads(raw.zh.downloads)
    }
  };
}

export async function readBookSiteUrl(root: string): Promise<string> {
  const raw = await readYamlFile<RawBookSiteData>(bookDataFile(root));
  return raw.site_url;
}

function normalizeDownloads(raw: RawDownloadData): DownloadData {
  return {
    epub: raw.epub,
    pdf: raw.pdf,
    deepEpub: raw.deep_epub,
    deepPdf: raw.deep_pdf
  };
}

function normalizeHumanEditor(raw: RawHumanEditorData): HumanEditorData {
  return {
    name: raw.name,
    url: raw.url
  };
}
