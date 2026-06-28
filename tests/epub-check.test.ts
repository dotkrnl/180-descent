import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { checkEpub } from "@lib/checks/epub";
import { bookArtifactPaths, dayArtifactPaths } from "@lib/artifacts/downloads";
import { createEmptyContentRoot, writeContentDay } from "./helpers/content-root";

describe("epub check helpers", () => {
  it("reports missing book artifacts", async () => {
    const root = await createEmptyContentRoot("180-epub-missing-");

    const errors = await checkEpub({ root });

    expect(errors).toContain(`${bookArtifactPaths("epub")[0]} is missing`);
  });

  it("reports missing per-day artifacts", async () => {
    const root = await createEmptyContentRoot("180-epub-day-missing-");
    await writeContentDay(root);

    const errors = await checkEpub({ root });

    expect(errors).toContain(`${dayArtifactPaths("epub", "en", ["001-fixture"])[0]} is missing`);
    expect(errors).toContain(`${dayArtifactPaths("epub", "zh", ["001-fixture"])[0]} is missing`);
  });

  it("reports missing local EPUB link anchors", async () => {
    const root = await createEmptyContentRoot("180-epub-anchor-missing-");
    const edition = bookArtifactPaths("epub")[0];
    await writeEpubFixture(root, edition);

    const errors = await checkEpub({ root });

    expect(errors).toContain(`${edition} references missing EPUB link anchor in OEBPS/day-001.xhtml: day-002.xhtml#missing-anchor`);
  });
});

async function writeEpubFixture(root: string, relativePath: string): Promise<void> {
  const zip = new JSZip();
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.file("META-INF/container.xml", '<?xml version="1.0" encoding="UTF-8"?><container/>');
  zip.file("OEBPS/content.opf", '<?xml version="1.0" encoding="UTF-8"?><package/>');
  zip.file("OEBPS/nav.xhtml", xhtml("<nav/>"));
  zip.file("OEBPS/introduction.xhtml", xhtml("<p>Intro</p>"));
  zip.file("OEBPS/day-001.xhtml", xhtml("<p><a href='day-002.xhtml#missing-anchor'>Next</a></p>"));
  zip.file("OEBPS/day-002.xhtml", xhtml('<p id="present-anchor">Target</p>'));

  const outputPath = path.join(root, relativePath);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, await zip.generateAsync({ type: "nodebuffer" }));
}

function xhtml(body: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml"><body>${body}</body></html>`;
}
