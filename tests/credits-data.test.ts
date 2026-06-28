import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readCreditsData } from "@lib/data/credits";
import { creditsDataFile } from "@lib/data/paths";

describe("credits data", () => {
  it("loads valid credits data", async () => {
    const root = await createCreditsRoot([
      "fonts:",
      "  - name: Fixture Font",
      "    source: https://example.com/font",
      "    license: OFL-1.1",
      "images:",
      "  - title: Fixture Image",
      "    creator: Fixture Creator",
      "    source: https://example.com/image",
      "    license: CC BY 4.0",
      "    asset: /assets/images/open-license/fixture.jpg",
      "    notes: Fixture notes."
    ].join("\n"));

    await expect(readCreditsData(root)).resolves.toMatchObject({
      fonts: [{ name: "Fixture Font" }],
      images: [{ asset: "/assets/images/open-license/fixture.jpg" }]
    });
  });

  it("rejects incomplete image credits", async () => {
    const root = await createCreditsRoot([
      "fonts: []",
      "images:",
      "  - title: Fixture Image",
      "    creator: Fixture Creator",
      "    source: https://example.com/image",
      "    license: CC BY 4.0",
      "    asset: /assets/images/open-license/fixture.jpg"
    ].join("\n"));

    await expect(readCreditsData(root)).rejects.toThrow();
  });

  it("rejects blank required credit strings", async () => {
    const root = await createCreditsRoot([
      "fonts:",
      "  - name: '   '",
      "    source: https://example.com/font",
      "    license: OFL-1.1",
      "images: []"
    ].join("\n"));

    await expect(readCreditsData(root)).rejects.toThrow("must not be blank");
  });

  it("rejects image assets outside the site image tree", async () => {
    const root = await createCreditsRoot([
      "fonts: []",
      "images:",
      "  - title: Fixture Image",
      "    creator: Fixture Creator",
      "    source: https://example.com/image",
      "    license: CC BY 4.0",
      "    asset: /downloads/fixture.jpg",
      "    notes: Fixture notes."
    ].join("\n"));

    await expect(readCreditsData(root)).rejects.toThrow();
  });

  it("rejects parent directory segments in image assets", async () => {
    const root = await createCreditsRoot([
      "fonts: []",
      "images:",
      "  - title: Fixture Image",
      "    creator: Fixture Creator",
      "    source: https://example.com/image",
      "    license: CC BY 4.0",
      "    asset: /assets/images/../fixture.jpg",
      "    notes: Fixture notes."
    ].join("\n"));

    await expect(readCreditsData(root)).rejects.toThrow(
      "image asset must be a normalized absolute path under /assets/images"
    );
  });

  it("rejects non-normalized image asset paths", async () => {
    for (const asset of ["/assets/images/open-license//fixture.jpg", "/assets/images/./fixture.jpg"]) {
      const root = await createCreditsRoot([
        "fonts: []",
        "images:",
        "  - title: Fixture Image",
        "    creator: Fixture Creator",
        "    source: https://example.com/image",
        "    license: CC BY 4.0",
        `    asset: ${asset}`,
        "    notes: Fixture notes."
      ].join("\n"));

      await expect(readCreditsData(root)).rejects.toThrow(
        "image asset must be a normalized absolute path under /assets/images"
      );
    }
  });

  it("rejects non-image asset extensions", async () => {
    const root = await createCreditsRoot([
      "fonts: []",
      "images:",
      "  - title: Fixture Image",
      "    creator: Fixture Creator",
      "    source: https://example.com/image",
      "    license: CC BY 4.0",
      "    asset: /assets/images/open-license/fixture.txt",
      "    notes: Fixture notes."
    ].join("\n"));

    await expect(readCreditsData(root)).rejects.toThrow();
  });

  it("rejects duplicate font names", async () => {
    const root = await createCreditsRoot([
      "fonts:",
      "  - name: Fixture Font",
      "    source: https://example.com/font",
      "    license: OFL-1.1",
      "  - name: Fixture Font",
      "    source: https://example.com/other-font",
      "    license: OFL-1.1",
      "images: []"
    ].join("\n"));

    await expect(readCreditsData(root)).rejects.toThrow("duplicate credit font name: Fixture Font");
  });

  it("rejects duplicate image assets", async () => {
    const root = await createCreditsRoot([
      "fonts: []",
      "images:",
      "  - title: Fixture Image",
      "    creator: Fixture Creator",
      "    source: https://example.com/image",
      "    license: CC BY 4.0",
      "    asset: /assets/images/open-license/fixture.jpg",
      "    notes: Fixture notes.",
      "  - title: Fixture Image Copy",
      "    creator: Fixture Creator",
      "    source: https://example.com/image-copy",
      "    license: CC BY 4.0",
      "    asset: /assets/images/open-license/fixture.jpg",
      "    notes: Fixture notes."
    ].join("\n"));

    await expect(readCreditsData(root)).rejects.toThrow(
      "duplicate credit image asset: /assets/images/open-license/fixture.jpg"
    );
  });
});

async function createCreditsRoot(source: string): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-credits-data-"));
  await mkdir(path.dirname(creditsDataFile(root)), { recursive: true });
  await writeFile(creditsDataFile(root), source);
  return root;
}
