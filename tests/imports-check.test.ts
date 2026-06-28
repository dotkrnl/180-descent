import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkUnusedDefaultImports } from "@lib/checks/imports";
import { contentDayFile, contentDaysDir } from "@lib/content/paths";

describe("import check", () => {
  it("finds unused default imports in Astro and MDX source files", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-import-check-"));
    await mkdir(path.join(root, "src/app/components"), { recursive: true });
    await mkdir(path.join(contentDaysDir(root), "001-fixture"), { recursive: true });

    await writeFile(path.join(root, "src/app/components/Used.astro"), [
      'import Panel from "./Panel.astro";',
      "<Panel />"
    ].join("\n"));
    await writeFile(path.join(root, "src/app/components/Unused.astro"), [
      'import Panel from "./Panel.astro";',
      "<div />"
    ].join("\n"));
    await writeFile(contentDayFile(root, "001-fixture", "en.mdx"), [
      'import Hero, { type HeroProps } from "@app/components/lesson/Hero.astro";',
      "# Fixture"
    ].join("\n"));

    await expect(checkUnusedDefaultImports({ root })).resolves.toEqual([
      {
        path: "src/app/components/Unused.astro",
        name: "Panel"
      },
      {
        path: "src/content/days/001-fixture/en.mdx",
        name: "Hero"
      }
    ]);
  });

  it("ignores named-only imports", async () => {
    await expect(unusedDefaultImportNames('import { Panel } from "./Panel.astro";\n<div />')).resolves.toEqual([]);
  });

  it("parses multi-line default imports", async () => {
    await expect(unusedDefaultImportNames([
      "import Hero, {",
      "  type HeroProps",
      '} from "./Hero.astro";',
      "<Hero />"
    ].join("\n"))).resolves.toEqual([]);
    await expect(unusedDefaultImportNames([
      "import Hero, {",
      "  type HeroProps",
      '} from "./Hero.astro";',
      "<div />"
    ].join("\n"))).resolves.toEqual(["Hero"]);
  });

  it("ignores type-only default imports", async () => {
    await expect(unusedDefaultImportNames('import type Hero from "./Hero.astro";\n<div />')).resolves.toEqual([]);
  });

  it("ignores imports and identifiers inside fenced code blocks", async () => {
    await expect(unusedDefaultImportNames([
      "```ts",
      'import Demo from "./Demo.astro";',
      "<Demo />",
      "```"
    ].join("\n"))).resolves.toEqual([]);

    await expect(unusedDefaultImportNames([
      'import Hero from "./Hero.astro";',
      "```mdx",
      "<Hero />",
      "```"
    ].join("\n"))).resolves.toEqual(["Hero"]);
  });

  it("ignores commented-out imports", async () => {
    await expect(unusedDefaultImportNames([
      "<!--",
      'import Hero from "./Hero.astro";',
      "-->",
      "<div />"
    ].join("\n"))).resolves.toEqual([]);

    await expect(unusedDefaultImportNames([
      "/*",
      'import Hero from "./Hero.astro";',
      "*/",
      "<div />"
    ].join("\n"))).resolves.toEqual([]);

    await expect(unusedDefaultImportNames([
      '// import Hero from "./Hero.astro";',
      "<div />"
    ].join("\n"))).resolves.toEqual([]);
  });

  it("ignores identifiers inside comments", async () => {
    await expect(unusedDefaultImportNames([
      'import Hero from "./Hero.astro";',
      "{/* <Hero /> */}",
      "<!-- <Hero /> -->",
      "/* Hero */"
    ].join("\n"))).resolves.toEqual(["Hero"]);
  });

  it("ignores identifiers inside JavaScript comments in expressions", async () => {
    await expect(unusedDefaultImportNames([
      'import figure from "./figure.jpg";',
      "<ImageFigure",
      "  src={fallback /* figure */}",
      "/>"
    ].join("\n"))).resolves.toEqual(["figure"]);

    await expect(unusedDefaultImportNames([
      'import figure from "./figure.jpg";',
      "<ImageFigure",
      "  src={fallback // figure",
      "  }",
      "/>"
    ].join("\n"))).resolves.toEqual(["figure"]);
  });

  it("ignores identifiers in prose and string values", async () => {
    await expect(unusedDefaultImportNames([
      'import Hero from "./Hero.astro";',
      "The Hero component used to live here.",
      '<div data-component="Hero" />',
      "<div data-template={`Hero`} />",
      "{\"Hero\"}"
    ].join("\n"))).resolves.toEqual(["Hero"]);
  });

  it("counts identifiers in braced expressions", async () => {
    await expect(unusedDefaultImportNames([
      'import figure from "./figure.jpg";',
      "<ImageFigure src={figure} />"
    ].join("\n"))).resolves.toEqual([]);
  });

  it("counts identifiers in Astro frontmatter code", async () => {
    await expect(unusedDefaultImportNames([
      "---",
      'import figure from "./figure.jpg";',
      "const imageSrc = figure.src;",
      "---",
      "<div />"
    ].join("\n"))).resolves.toEqual([]);

    await expect(unusedDefaultImportNames([
      "---",
      'import figure from "./figure.jpg";',
      'const label = "figure";',
      "---",
      "<div />"
    ].join("\n"))).resolves.toEqual(["figure"]);
  });

  it("counts identifiers in MDX export declarations", async () => {
    await expect(unusedDefaultImportNames([
      'import figure from "./figure.jpg";',
      "export const imageSrc = figure.src;",
      "# Fixture"
    ].join("\n"), "src/content/Fixture.mdx")).resolves.toEqual([]);

    await expect(unusedDefaultImportNames([
      'import figure from "./figure.jpg";',
      'export const label = "figure";',
      "# Fixture"
    ].join("\n"), "src/content/Fixture.mdx")).resolves.toEqual(["figure"]);
  });

  it("does not close braced expressions on braces inside strings or comments", async () => {
    await expect(unusedDefaultImportNames([
      'import figure from "./figure.jpg";',
      '<ImageFigure src={condition ? "}" : figure} />'
    ].join("\n"))).resolves.toEqual([]);

    await expect(unusedDefaultImportNames([
      'import figure from "./figure.jpg";',
      "<ImageFigure",
      "  src={condition // }",
      "    ? figure",
      "    : fallback}",
      "/>"
    ].join("\n"))).resolves.toEqual([]);
  });

  it("counts identifiers inside template literal interpolations", async () => {
    await expect(unusedDefaultImportNames([
      'import figure from "./figure.jpg";',
      "<ImageFigure src={`${figure}?w=1200`} />"
    ].join("\n"))).resolves.toEqual([]);

    await expect(unusedDefaultImportNames([
      'import figure from "./figure.jpg";',
      '<ImageFigure src={`${"figure"}?w=1200`} />'
    ].join("\n"))).resolves.toEqual(["figure"]);
  });

  it("does not consume body content after imports without semicolons", async () => {
    await expect(unusedDefaultImportNames([
      'import Hero from "./Hero.astro"',
      "<Hero />"
    ].join("\n"))).resolves.toEqual([]);
  });

  it("does not consume body content after imports with trailing comments", async () => {
    await expect(unusedDefaultImportNames([
      'import Hero from "./Hero.astro"; // used below',
      "<Hero />"
    ].join("\n"))).resolves.toEqual([]);
  });
});

async function unusedDefaultImportNames(source: string, relativePath = "src/app/Fixture.astro"): Promise<string[]> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-import-source-"));
  await mkdir(path.join(root, "src/app"), { recursive: true });
  await mkdir(path.join(root, "src/content"), { recursive: true });
  await mkdir(path.dirname(path.join(root, relativePath)), { recursive: true });
  await writeFile(path.join(root, relativePath), source);
  return (await checkUnusedDefaultImports({ root })).map((failure) => failure.name);
}
