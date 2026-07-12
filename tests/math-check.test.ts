import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkMath } from "@lib/checks/math";
import { contentDayFile, contentDaysDir } from "@lib/content/paths";

describe("math check", () => {
  it("does not require built HTML for source-only checks", async () => {
    const root = await createSourceOnlyFixtureRoot();
    await writeFile(contentDayFile(root, "001-fixture", "en.mdx"), "Plain source.");

    const result = await checkMath({ root });

    expect(result).toEqual({
      checkedSourceFiles: 1,
      checkedBuiltFiles: 0,
      failures: []
    });
  });

  it("reports raw display math patterns in MDX content", async () => {
    const root = await createFixtureRoot();
    await writeFile(contentDayFile(root, "001-fixture", "en.mdx"), '<p class="formula"><code>x</code></p>');

    const result = await checkMath({ root });

    expect(result.checkedSourceFiles).toBe(1);
    expect(result.checkedBuiltFiles).toBe(0);
    expect(result.failures).toEqual([
      {
        file: "src/content/days/001-fixture/en.mdx",
        label: "raw <p class=formula><code> (use <MathBlock> instead)"
      }
    ]);
  });

  it("reports single-quoted raw formula markup in MDX content", async () => {
    const root = await createFixtureRoot();
    await writeFile(contentDayFile(root, "001-fixture", "en.mdx"), [
      "<p class='formula'><code>x</code></p>",
      "<div class='formula'><p class='eq'>y</p></div>"
    ].join("\n"));

    const result = await checkMath({ root });

    expect(result.failures).toEqual([
      {
        file: "src/content/days/001-fixture/en.mdx",
        label: "raw .formula .eq (use <MathBlock> instead)"
      },
      {
        file: "src/content/days/001-fixture/en.mdx",
        label: "raw <p class=formula><code> (use <MathBlock> instead)"
      }
    ]);
  });

  it("reports multiline raw display math delimiters in MDX content", async () => {
    const root = await createFixtureRoot();
    await writeFile(contentDayFile(root, "001-fixture", "en.mdx"), [
      "\\[",
      "x + y",
      "\\]"
    ].join("\n"));

    const result = await checkMath({ root });

    expect(result.failures).toEqual([
      {
        file: "src/content/days/001-fixture/en.mdx",
        label: "raw \\[ \\] delimiters (use <MathBlock> instead)"
      }
    ]);
  });

  it("ignores raw math examples inside fenced code blocks", async () => {
    const root = await createFixtureRoot();
    await writeFile(contentDayFile(root, "001-fixture", "en.mdx"), [
      "```mdx",
      '<MathBlock latex={String.raw`\\[x\\]`} />',
      '<p class="formula"><code>x</code></p>',
      "```"
    ].join("\n"));

    const result = await checkMath({ root });

    expect(result.failures).toEqual([]);
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

  it("skips stale built HTML when built checks are disabled", async () => {
    const root = await createFixtureRoot();
    await writeFile(contentDayFile(root, "001-fixture", "en.mdx"), "Plain source.");
    await writeFile(path.join(root, "_site/index.html"), String.raw`<p>\(stale\)</p>`);

    const result = await checkMath({ root, requireBuiltHtml: false });

    expect(result).toEqual({
      checkedSourceFiles: 1,
      checkedBuiltFiles: 0,
      failures: []
    });
  });

  it("can require built HTML files", async () => {
    const root = await createFixtureRoot();

    const result = await checkMath({ root, requireBuiltHtml: true });

    expect(result.checkedBuiltFiles).toBe(0);
    expect(result.failures).toEqual([
      {
        file: "_site",
        label: "contains no HTML files"
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
  await mkdir(path.join(contentDaysDir(root), "001-fixture"), { recursive: true });
  await mkdir(path.join(root, "_site"), { recursive: true });
  return root;
}

async function createSourceOnlyFixtureRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-math-check-"));
  await mkdir(path.join(contentDaysDir(root), "001-fixture"), { recursive: true });
  return root;
}
