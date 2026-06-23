import { mkdir, mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkPdf, hasPdfHeader, textMatchesAny } from "@lib/checks/pdf";
import { parsePpm } from "@lib/pdf/ppm";
import { escapeRegExp } from "@lib/text/escape";

describe("pdf check helpers", () => {
  it("classifies PDF headers and text pattern matches", () => {
    expect(hasPdfHeader(Buffer.from("%PDF-1.7\n"))).toBe(true);
    expect(hasPdfHeader(Buffer.from("not a pdf"))).toBe(false);
    expect(textMatchesAny("The 180-Day Descent", [/180-Day/, /missing/])).toBe(true);
    expect(textMatchesAny("The 180-Day Descent", [/missing/])).toBe(false);
  });

  it("parses binary PPM headers", () => {
    const buffer = Buffer.concat([Buffer.from("P6\n# comment\n2 1\n255\n", "ascii"), Buffer.from([0, 1, 2, 3, 4, 5])]);
    expect(parsePpm(buffer)).toEqual({
      width: 2,
      height: 1,
      max: 255,
      dataOffset: buffer.length - 6
    });
  });

  it("escapes regular expression text", () => {
    expect(escapeRegExp("A+B?")).toBe("A\\+B\\?");
  });

  it("reports missing required artifacts without throwing", async () => {
    const root = await createEmptyContentRoot("180-pdf-missing-");

    const result = await checkPdf({ root });

    expect(result.errors).toContain("_site/downloads/180-descent.pdf is missing");
  });
});

async function createEmptyContentRoot(prefix: string): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), prefix));
  await mkdir(path.join(root, "src/content/days"), { recursive: true });
  return root;
}
