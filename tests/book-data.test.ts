import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readBookData, readBookSiteUrl } from "@lib/data/book";
import { bookDataFile } from "@lib/data/paths";

describe("book data", () => {
  it("loads the site URL from partial metadata", async () => {
    const root = await createBookRoot("site_url: https://180d.io\n");

    await expect(readBookSiteUrl(root)).resolves.toBe("https://180d.io");
  });

  it("rejects invalid site URLs in partial metadata", async () => {
    const root = await createBookRoot("site_url: not-a-url\n");

    await expect(readBookSiteUrl(root)).rejects.toThrow();
  });

  it("rejects site URLs that are not bare origins", async () => {
    const root = await createBookRoot("site_url: https://180d.io/\n");
    const pathRoot = await createBookRoot("site_url: https://180d.io/course\n");

    await expect(readBookSiteUrl(root)).rejects.toThrow("site_url must be an origin");
    await expect(readBookSiteUrl(pathRoot)).rejects.toThrow("site_url must be an origin");
  });

  it("rejects incomplete full book metadata", async () => {
    const root = await createBookRoot("site_url: https://180d.io\n");

    await expect(readBookData(root)).rejects.toThrow();
  });

  it("rejects invalid URLs in full book metadata", async () => {
    const root = await createBookRoot([
      "title: Fixture",
      "subtitle: Fixture subtitle",
      "deep_dive_subtitle: Fixture deep dive",
      "authors: Fixture Author",
      "human_editor:",
      "  name: Editor",
      "  url: not-a-url",
      "description: Fixture description",
      "site_url: https://180d.io",
      "repo: https://example.com/repo",
      "language: en",
      "publisher: Fixture Publisher",
      "published_year: 2026",
      "total_days: 180",
      "epub_identifier: 11111111-1111-4111-8111-111111111111",
      "zh:",
      "  language: zh-Hans",
      "  title: Fixture",
      "  subtitle: Fixture subtitle",
      "  deep_dive_subtitle: Fixture deep dive",
      "  authors: Fixture Author",
      "  translators: Fixture Translator",
      "  human_editor:",
      "    name: Editor",
      "    url: https://example.com/editor",
      "  description: Fixture description",
      "  epub_identifier: 22222222-2222-4222-8222-222222222222"
    ].join("\n"));

    await expect(readBookData(root)).rejects.toThrow();
  });
});

async function createBookRoot(source: string): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-book-data-"));
  await mkdir(path.dirname(bookDataFile(root)), { recursive: true });
  await writeFile(bookDataFile(root), source);
  return root;
}
