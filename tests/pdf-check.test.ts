import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { PDFDocument, PDFHexString, PDFString } from "pdf-lib";
import { describe, expect, it } from "vitest";
import {
  checkPdf,
  forbiddenPdfAnnotationUriErrors,
  inspectPdfAnnotations
} from "@lib/checks/pdf";
import { bookArtifactPaths, dayArtifactPaths } from "@lib/artifacts/downloads";
import { createEmptyContentRoot, writeContentDay } from "./helpers/content-root";

describe("pdf check helpers", () => {
  it("reports missing book artifacts", async () => {
    const root = await createEmptyContentRoot("180-pdf-missing-");

    const errors = await checkPdf({ root });

    expect(errors).toContain(`${bookArtifactPaths("pdf")[0]} is missing`);
    expect(errors).not.toContain("_site/downloads/180-descent-day-001-what-is-knowledge.pdf is missing");
    expect(errors).not.toContain("English PDF is missing core text matching /The Scientific Method/i");
  });

  it("reports missing per-day artifacts", async () => {
    const root = await createEmptyContentRoot("180-pdf-day-missing-");
    await writeContentDay(root);

    const errors = await checkPdf({ root });

    expect(errors).toContain(`${dayArtifactPaths("pdf", "en", ["001-fixture"])[0]} is missing`);
    expect(errors).toContain(`${dayArtifactPaths("pdf", "zh", ["001-fixture"])[0]} is missing`);
    expect(errors).not.toContain("_site/downloads/180-descent-day-001-what-is-knowledge.pdf is missing");
  });

  it("reports invalid PDF artifacts without throwing", async () => {
    const root = await createEmptyContentRoot("180-pdf-invalid-");
    const artifact = bookArtifactPaths("pdf")[0];
    const artifactPath = path.join(root, artifact);
    await mkdir(path.dirname(artifactPath), { recursive: true });
    await writeFile(artifactPath, "not a pdf");

    const errors = await checkPdf({ root });

    expect(errors).toContain(`${artifact} does not start with a PDF header`);
    expect(errors).not.toContain("English PDF is missing core text matching /The Scientific Method/i");
  });

  it("finds forbidden URI actions hidden in generated object streams", async () => {
    const forbiddenUris = [
      "http://localhost:4321/days/001-fixture/",
      "http://127.0.0.1:4321/introduction/",
      "https://180-descent.pages.dev/days/001-fixture/",
      "https://180-descent.pages.dev/zh/introduction/"
    ];
    const allowedUri = "https://180-descent.example/days/001-fixture/";
    const data = await pdfWithUriAnnotations([...forbiddenUris, allowedUri]);
    const raw = data.toString("latin1");

    for (const uri of forbiddenUris) {
      expect(raw).not.toContain(uri);
    }

    const pdf = await PDFDocument.load(data);
    const inspection = inspectPdfAnnotations(pdf);

    expect(inspection.count).toBe(5);
    expect(inspection.uris.map(({ uri }) => uri)).toEqual([...forbiddenUris, allowedUri]);
    expect(forbiddenPdfAnnotationUriErrors("fixture.pdf", inspection.uris)).toEqual(
      forbiddenUris.map((uri) => (
        `fixture.pdf contains forbidden PDF annotation URI on page 1: ${JSON.stringify(uri)}`
      ))
    );
  });
});

async function pdfWithUriAnnotations(uris: readonly string[]): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([300, 300]);

  for (const [index, uri] of uris.entries()) {
    const action = pdf.context.register(pdf.context.obj({
      S: "URI",
      URI: index % 2 === 0 ? PDFHexString.fromText(uri) : PDFString.of(uri)
    }));
    const annotation = pdf.context.register(pdf.context.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [20, 260 - index * 30, 280, 280 - index * 30],
      Border: [0, 0, 0],
      A: action
    }));
    page.node.addAnnot(annotation);
  }

  return Buffer.from(await pdf.save({ useObjectStreams: true }));
}
