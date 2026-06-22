import { mkdir, readFile, writeFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildCss } from "@lib/assets";

describe("css build", () => {
  it("compiles the SCSS entrypoint into an ignored generated CSS artifact", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-css-build-"));
    await mkdir(path.join(root, "src/assets/scss/abstracts"), { recursive: true });
    await mkdir(path.join(root, "src/assets/scss/generated"), { recursive: true });
    await writeFile(path.join(root, "src/assets/scss/abstracts/_tokens.scss"), "$book-color: white;\n");
    await writeFile(path.join(root, "src/assets/scss/generated/_fixture.scss"), ".generated { color: black; }\n");
    await writeFile(path.join(root, "src/assets/scss/book.scss"), '@use "sass:meta";\n@use "abstracts/tokens";\n@include meta.load-css("generated/fixture");\n.book { color: tokens.$book-color; }\n');

    const result = await buildCss({ root });
    const output = await readFile(path.join(root, "dist/generated/book.css"), "utf8");

    expect(result.bytes).toBe(output.length);
    expect(result.outFile).toBe(path.join(root, "dist/generated/book.css"));
    expect(output).toMatch(/\.generated\s*{\s*color: black;\s*}/);
    expect(output).toMatch(/\.book\s*{\s*color: white;\s*}/);
  });
});
