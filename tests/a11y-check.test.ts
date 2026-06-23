import { mkdir, writeFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkStaticAccessibility } from "@lib/checks/a11y";

describe("static accessibility check", () => {
  it("reports missing image alt text and accessible-name label mismatches", async () => {
    const root = await createSiteRoot([
      '<img src="/image.png">',
      '<button aria-label="Submit">Send</button>'
    ].join("\n"));

    const result = await checkStaticAccessibility({ root });

    expect(result.errors).toEqual([
      "/: img 1 is missing alt",
      '/: button "Send" accessible name should include its visible label, got "Submit"'
    ]);
    expect(result.axePages).toEqual(["/"]);
  });

  it("skips print duplicate pages for axe", async () => {
    const root = await createSiteRoot('<meta name="robots" content="noindex">', "print/index.html");

    const result = await checkStaticAccessibility({ root });

    expect(result.errors).toEqual([]);
    expect(result.axePages).toEqual([]);
  });
});

async function createSiteRoot(html: string, relativePath = "index.html"): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-a11y-check-"));
  const filePath = path.join(root, "_site", relativePath);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, html);
  return root;
}
