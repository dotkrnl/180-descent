import { mkdir, readFile, writeFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildCss } from "@lib/assets";

describe("css build", () => {
  it("compiles the SCSS entrypoint and bundles generated CSS imports", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-css-build-"));
    await mkdir(path.join(root, "src/assets/css"), { recursive: true });
    await mkdir(path.join(root, "src/assets/scss/abstracts"), { recursive: true });
    await writeFile(path.join(root, "src/assets/css/generated.css"), ".generated { color: black; }\n");
    await writeFile(path.join(root, "src/assets/scss/abstracts/_tokens.scss"), "$book-color: white;\n");
    await writeFile(path.join(root, "src/assets/scss/book.scss"), '@use "abstracts/tokens";\n@import "../css/generated.css";\n.book { color: tokens.$book-color; }\n');

    const result = await buildCss({ root });
    const output = await readFile(path.join(root, "src/assets/css/book.css"), "utf8");

    expect(result.bytes).toBe(output.length);
    expect(output).toContain(".generated { color: black; }");
    expect(output).toMatch(/\.book\s*{\s*color: white;\s*}/);
  });
});
