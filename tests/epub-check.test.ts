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

  it("reports invalid EPUB artifacts without throwing", async () => {
    const root = await createEmptyContentRoot("180-epub-invalid-");
    const artifact = bookArtifactPaths("epub")[0];
    const artifactPath = path.join(root, artifact);
    await mkdir(path.dirname(artifactPath), { recursive: true });
    await writeFile(artifactPath, "not an epub");

    const errors = await checkEpub({ root });

    expect(errors.some((error) => error.startsWith(`${artifact} cannot be parsed as EPUB ZIP (`))).toBe(true);
  });

  it("reports missing local EPUB link anchors", async () => {
    const root = await createEmptyContentRoot("180-epub-anchor-missing-");
    const edition = bookArtifactPaths("epub")[0];
    await writeEpubFixture(root, edition);

    const errors = await checkEpub({ root });

    expect(errors).toContain(`${edition} references missing EPUB link anchor in OEBPS/day-001.xhtml: day-002.xhtml#missing-anchor`);
  });

  it("reports missing relative EPUB images outside the images directory", async () => {
    const root = await createEmptyContentRoot("180-epub-image-missing-");
    const edition = bookArtifactPaths("epub")[0];
    await writeEpubFixture(root, edition, '<p><img src="missing.png" alt="Missing"/></p>');

    const errors = await checkEpub({ root });

    expect(errors).toContain(`${edition} references missing EPUB image in OEBPS/day-001.xhtml: missing.png`);
  });

  it("rejects parent-directory EPUB references before path normalization", async () => {
    const root = await createEmptyContentRoot("180-epub-parent-ref-");
    const edition = bookArtifactPaths("epub")[0];
    await writeEpubFixture(root, edition, [
      '<p><a href="../OEBPS/day-002.xhtml#present-anchor">Normalized link</a></p>',
      '<p><img src="../OEBPS/images/present.png" alt="Normalized image"/></p>'
    ].join(""));

    const errors = await checkEpub({ root });

    expect(errors).toContain(
      `${edition} contains parent-directory EPUB link in OEBPS/day-001.xhtml: ../OEBPS/day-002.xhtml#present-anchor`
    );
    expect(errors).toContain(
      `${edition} contains parent-directory EPUB image src in OEBPS/day-001.xhtml: ../OEBPS/images/present.png`
    );
  });

  it("reports invalid numeric XML entities without crashing", async () => {
    const root = await createEmptyContentRoot("180-epub-invalid-entity-");
    const edition = bookArtifactPaths("epub")[0];
    await writeEpubFixture(root, edition, "<p>Invalid entity &#x110000;</p>");

    const errors = await checkEpub({ root });

    expect(errors.some((error) => error.startsWith(`${edition} XML parse failed in OEBPS/day-001.xhtml`))).toBe(true);
  });
});

async function writeEpubFixture(
  root: string,
  relativePath: string,
  dayOneBody = "<p><a href='day-002.xhtml#missing-anchor'>Next</a></p>"
): Promise<void> {
  const zip = new JSZip();
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });
  zip.file("META-INF/container.xml", '<?xml version="1.0" encoding="UTF-8"?><container/>');
  zip.file("OEBPS/content.opf", '<?xml version="1.0" encoding="UTF-8"?><package/>');
  zip.file("OEBPS/nav.xhtml", xhtml("<nav/>"));
  zip.file("OEBPS/introduction.xhtml", xhtml("<p>Intro</p>"));
  zip.file("OEBPS/day-001.xhtml", xhtml(dayOneBody));
  zip.file("OEBPS/day-002.xhtml", xhtml('<p id="present-anchor">Target</p>'));
  zip.file("OEBPS/images/present.png", "");

  const outputPath = path.join(root, relativePath);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, await zip.generateAsync({ type: "nodebuffer" }));
}

function xhtml(body: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?><html xmlns="http://www.w3.org/1999/xhtml"><body>${body}</body></html>`;
}
