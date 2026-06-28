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
});

async function createCreditsRoot(source: string): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-credits-data-"));
  await mkdir(path.dirname(creditsDataFile(root)), { recursive: true });
  await writeFile(creditsDataFile(root), source);
  return root;
}
