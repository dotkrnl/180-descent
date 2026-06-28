import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { bookArtifactPaths } from "@lib/artifacts/downloads";
import { buildAllEpubs, epubImageFilePath } from "@lib/artifacts/epub/build";
import { bookDataFile } from "@lib/data/paths";
import { validBookYaml } from "./helpers/book-data";
import { createEmptyContentRoot, writeContentDay } from "./helpers/content-root";

describe("epub build helpers", () => {
  it("resolves source image conventions to source files and Astro images to built files", () => {
    const root = path.join(path.sep, "repo");

    expect(epubImageFilePath(root, "/assets/images/open-license/fixture.jpg")).toBe(
      path.join(root, "src/assets/images/open-license/fixture.jpg")
    );
    expect(epubImageFilePath(root, "/_astro/fixture.hash.jpg")).toBe(
      path.join(root, "_site/_astro/fixture.hash.jpg")
    );
  });

  it("prepares generated font assets before compiling EPUB CSS", async () => {
    const root = await createEmptyContentRoot("180-epub-build-assets-");
    await mkdir(path.dirname(bookDataFile(root)), { recursive: true });
    await writeFile(bookDataFile(root), validBookYaml());
    await writeContentDay(root, {
      block: "Foundations",
      enBody: "# Fixture\n",
      zhBody: "# 夹具\n"
    });
    await writeBuiltPage(root, "introduction", "Introduction");
    await writeBuiltPage(root, "zh/introduction", "导言");
    await writeBuiltPage(root, "days/001-fixture", "Fixture");
    await writeBuiltPage(root, "zh/days/001-fixture", "夹具");
    await writeScssEntry(root);

    await buildAllEpubs({ root });

    await expect(access(path.join(root, "src/assets/scss/generated/_cjk.scss"))).resolves.toBeUndefined();
    await expect(access(path.join(root, "src/assets/scss/generated/_katex.scss"))).resolves.toBeUndefined();
    await expect(access(path.join(root, bookArtifactPaths("epub")[0]))).resolves.toBeUndefined();
  });
});

async function writeScssEntry(root: string): Promise<void> {
  const file = path.join(root, "src/assets/scss/book.scss");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, [
    '@use "sass:meta";',
    '@include meta.load-css("generated/cjk");',
    '@include meta.load-css("generated/katex");'
  ].join("\n"));
}

async function writeBuiltPage(root: string, route: string, title: string): Promise<void> {
  const file = path.join(root, "_site", route, "index.html");
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    `<title>${title}</title>`,
    "</head>",
    "<body>",
    `<main id="content"><h1>${title}</h1><p>Fixture body.</p></main>`,
    "</body>",
    "</html>"
  ].join("\n"));
}
