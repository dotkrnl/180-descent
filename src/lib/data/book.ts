import { readFile } from "node:fs/promises";
import path from "node:path";
import YAML from "yaml";

export interface BookData {
  title: string;
  subtitle: string;
  deep_dive_subtitle?: string;
  authors: string;
  description: string;
  site_url: string;
  repo: string;
  language: string;
  publisher: string;
  published_year: number;
  total_days: number;
  epub_identifier: string;
  downloads: DownloadData;
  zh: {
    language: string;
    title: string;
    subtitle: string;
    deep_dive_subtitle?: string;
    authors: string;
    translators: string;
    description: string;
    epub_identifier: string;
    downloads: DownloadData;
  };
}

interface DownloadData {
  epub: string;
  pdf: string;
  deep_epub: string;
  deep_pdf: string;
}

export async function readBookData(root: string): Promise<BookData> {
  return YAML.parse(await readFile(path.join(root, "src/_data/book.yaml"), "utf8")) as BookData;
}
