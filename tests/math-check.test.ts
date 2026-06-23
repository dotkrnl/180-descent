import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkMath } from "@lib/checks/math";

describe("math check", () => {
  it("reports raw display math patterns in MDX content", async () => {
    const root = await createFixtureRoot();
    await writeFile(path.join(root, "src/content/days/001-fixture/en.mdx"), '<p class="formula"><code>x</code></p>');

    const result = await checkMath({ root });

    expect(result.checkedSourceFiles).toBe(1);
    expect(result.failures).toEqual([
      {
        file: "src/content/days/001-fixture/en.mdx",
        label: "raw <p class=formula><code> (use <MathBlock> instead)"
      }
    ]);
  });

  it("reports unrendered delimiters in built HTML", async () => {
    const root = await createFixtureRoot();
    await writeFile(path.join(root, "_site/index.html"), String.raw`<p>\(x\)</p>`);

    const result = await checkMath({ root });

    expect(result.failures).toEqual([
      {
        file: "_site/index.html",
        label: "unrendered KaTeX delimiter in built HTML"
      }
    ]);
  });

  it("allows prose-font KaTeX CSS overrides", async () => {
    const root = await createFixtureRoot();
    await mkdir(path.join(root, "src/assets/scss/base"), { recursive: true });
    await writeFile(path.join(root, "src/assets/scss/base/_base.scss"), ".katex .mathnormal{font-family:inherit;}");

    const result = await checkMath({ root });

    expect(result.failures).toEqual([]);
  });
});

async function createFixtureRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-math-check-"));
  await mkdir(path.join(root, "src/content/days/001-fixture"), { recursive: true });
  await mkdir(path.join(root, "_site"), { recursive: true });
  return root;
}
