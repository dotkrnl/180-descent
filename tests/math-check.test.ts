import { mkdir, writeFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkMath } from "@lib/checks";

describe("math check", () => {
  it("reports legacy display math patterns in lesson includes", async () => {
    const root = await createFixtureRoot();
    await writeFile(path.join(root, "src/_includes/days/day/en.njk"), '<p class="formula"><code>x</code></p>');

    const result = await checkMath({ root });

    expect(result.checkedSourceFiles).toBe(1);
    expect(result.failures).toEqual([
      {
        file: "src/_includes/days/day/en.njk",
        label: "raw <p class=formula><code> (use {% math %} instead)"
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
});

async function createFixtureRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-math-check-"));
  await mkdir(path.join(root, "src/_includes/days/day"), { recursive: true });
  await mkdir(path.join(root, "_site"), { recursive: true });
  return root;
}
