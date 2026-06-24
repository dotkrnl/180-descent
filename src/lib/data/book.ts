import { readFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

export interface BookData {
  title: string;
  subtitle: string;
  deepDiveSubtitle: string;
  authors: string;
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

interface RawBookData {
  title: string;
  subtitle: string;
  deep_dive_subtitle: string;
  authors: string;
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
    description: string;
    epub_identifier: string;
    downloads: RawDownloadData;
  };
}

interface RawDownloadData {
  epub: string;
  pdf: string;
  deep_epub: string;
  deep_pdf: string;
}

export async function readBookData(root: string): Promise<BookData> {
  const raw = YAML.parse(await readFile(path.join(root, "src/_data/book.yaml"), "utf8")) as RawBookData;
  return {
    title: raw.title,
    subtitle: raw.subtitle,
    deepDiveSubtitle: raw.deep_dive_subtitle,
    authors: raw.authors,
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
      description: raw.zh.description,
      epubIdentifier: raw.zh.epub_identifier,
      downloads: normalizeDownloads(raw.zh.downloads)
    }
  };
}

function normalizeDownloads(raw: RawDownloadData): DownloadData {
  return {
    epub: raw.epub,
    pdf: raw.pdf,
    deepEpub: raw.deep_epub,
    deepPdf: raw.deep_pdf
  };
}
