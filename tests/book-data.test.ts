import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readBookData } from "@lib/data/book";
import { bookDataFile } from "@lib/data/paths";
import { validBookYaml } from "./helpers/book-data";

describe("book data", () => {
  it("loads full metadata", async () => {
    const root = await createBookRoot(validBookYaml());

    await expect(readBookData(root)).resolves.toMatchObject({
      siteUrl: "https://180d.io",
      title: "Fixture",
      zh: {
        language: "zh-Hans"
      }
    });
  });

  it("rejects site URLs that are not bare origins", async () => {
    const root = await createBookRoot(
      validBookYaml().replace("site_url: https://180d.io", "site_url: https://180d.io/")
    );
    const pathRoot = await createBookRoot(
      validBookYaml().replace("site_url: https://180d.io", "site_url: https://180d.io/course")
    );

    await expect(readBookData(root)).rejects.toThrow("site_url must be an origin");
    await expect(readBookData(pathRoot)).rejects.toThrow("site_url must be an origin");
  });

  it("rejects incomplete full book metadata", async () => {
    const root = await createBookRoot("site_url: https://180d.io\n");

    await expect(readBookData(root)).rejects.toThrow();
  });

  it("rejects blank required metadata strings", async () => {
    const root = await createBookRoot(
      validBookYaml().replace("title: Fixture", "title: '   '")
    );

    await expect(readBookData(root)).rejects.toThrow("must not be blank");
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

  it("rejects unstable EPUB identifier seeds", async () => {
    const root = await createBookRoot(
      validBookYaml().replace("epub_identifier: 11111111-1111-4111-8111-111111111111", "epub_identifier: not stable")
    );
    const zhRoot = await createBookRoot(
      validBookYaml().replace("epub_identifier: 22222222-2222-4222-8222-222222222222", "epub_identifier: not stable")
    );

    await expect(readBookData(root)).rejects.toThrow("epub_identifier must be a stable identifier seed");
    await expect(readBookData(zhRoot)).rejects.toThrow("epub_identifier must be a stable identifier seed");
  });
});

async function createBookRoot(source: string): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-book-data-"));
  await mkdir(path.dirname(bookDataFile(root)), { recursive: true });
  await writeFile(bookDataFile(root), source);
  return root;
}
