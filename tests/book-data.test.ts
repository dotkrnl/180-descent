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

  it("rejects incomplete full book metadata", async () => {
    const root = await createBookRoot("site_url: https://180d.io\n");

    await expect(readBookData(root)).rejects.toThrow();
  });
});

async function createBookRoot(source: string): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-book-data-"));
  await mkdir(path.dirname(bookDataFile(root)), { recursive: true });
  await writeFile(bookDataFile(root), source);
  return root;
}
