import { mkdir, readFile, writeFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { buildCss } from "@lib/assets";

describe("css build", () => {
  it("bundles imported css into the output file", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-css-build-"));
    await mkdir(path.join(root, "src/assets/css/src/partials"), { recursive: true });
    await writeFile(path.join(root, "src/assets/css/src/partials/base.css"), ".base { color: black; }\n");
    await writeFile(path.join(root, "src/assets/css/src/book.css"), '@import "./partials/base.css";\n.book { color: white; }\n');

    const result = await buildCss({ root });
    const output = await readFile(path.join(root, "src/assets/css/book.css"), "utf8");

    expect(result.bytes).toBe(output.length);
    expect(output).toContain(".base { color: black; }");
    expect(output).toContain(".book { color: white; }");
  });
});
