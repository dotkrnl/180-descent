import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkUnusedDefaultImports, findUnusedDefaultImports } from "@lib/checks/imports";
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

  it("ignores named-only imports", () => {
    expect(findUnusedDefaultImports('import { Panel } from "./Panel.astro";\n<div />')).toEqual([]);
  });

  it("parses multi-line default imports", () => {
    expect(findUnusedDefaultImports([
      "import Hero, {",
      "  type HeroProps",
      '} from "./Hero.astro";',
      "<Hero />"
    ].join("\n"))).toEqual([]);
    expect(findUnusedDefaultImports([
      "import Hero, {",
      "  type HeroProps",
      '} from "./Hero.astro";',
      "<div />"
    ].join("\n"))).toEqual([{ name: "Hero" }]);
  });

  it("ignores type-only default imports", () => {
    expect(findUnusedDefaultImports('import type Hero from "./Hero.astro";\n<div />')).toEqual([]);
  });

  it("ignores imports and identifiers inside fenced code blocks", () => {
    expect(findUnusedDefaultImports([
      "```ts",
      'import Demo from "./Demo.astro";',
      "<Demo />",
      "```"
    ].join("\n"))).toEqual([]);

    expect(findUnusedDefaultImports([
      'import Hero from "./Hero.astro";',
      "```mdx",
      "<Hero />",
      "```"
    ].join("\n"))).toEqual([{ name: "Hero" }]);
  });

  it("does not consume body content after imports without semicolons", () => {
    expect(findUnusedDefaultImports([
      'import Hero from "./Hero.astro"',
      "<Hero />"
    ].join("\n"))).toEqual([]);
  });
});
