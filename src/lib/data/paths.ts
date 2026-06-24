import path from "node:path";

export function bookDataFile(root: string): string {
  return path.join(root, "src/_data/book.yaml");
}

export function creditsDataFile(root: string): string {
  return path.join(root, "src/_data/credits.yaml");
}

export function futureLinksDataFile(root: string): string {
  return path.join(root, "src/_data/future-links.yaml");
}

export function syllabusDataFile(root: string): string {
  return path.join(root, "src/_data/syllabus-data.yaml");
}
