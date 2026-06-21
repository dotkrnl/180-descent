import { mkdir, writeFile } from "node:fs/promises";
import { mkdtemp } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkAppendixStyle } from "@lib/checks";

describe("appendix style check", () => {
  it("reports forbidden appendix-local classes", async () => {
    const root = await createFixtureRoot();
    await writeFile(path.join(root, "src/_includes/days/day/en.njk"), deepDive('<div class="movement"></div>'));

    const result = await checkAppendixStyle({ root });

    expect(result.checkedIncludeFiles).toBe(1);
    expect(result.errors).toEqual([
      'src/_includes/days/day/en.njk: forbidden appendix class "movement". Use <section> with .sec-eyebrow instead of appendix-local section wrappers.'
    ]);
  });

  it("reports missing standard deep-dive structure", async () => {
    const root = await createFixtureRoot();
    await writeFile(path.join(root, "src/_includes/days/day/en.njk"), [
      '<div class="wrap">',
      "<!-- deep-dive:start -->",
      '<details class="deep-dive"><summary>Title</summary></details>',
      "<!-- deep-dive:end -->",
      "</div>"
    ].join("\n"));

    const result = await checkAppendixStyle({ root });

    expect(result.errors).toEqual([
      "src/_includes/days/day/en.njk: deep-dive summary is missing the standard title/subtitle structure",
      "src/_includes/days/day/en.njk: deep-dive block has no .deep-dive-body wrapper"
    ]);
  });
});

async function createFixtureRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-appendix-style-"));
  await mkdir(path.join(root, "src/_includes/days/day"), { recursive: true });
  await mkdir(path.join(root, "src/assets/css"), { recursive: true });
  await mkdir(path.join(root, "src/assets/js/interactions"), { recursive: true });
  await writeFile(path.join(root, "src/assets/css/book.css"), [
    ".wrap{}",
    ".deep-dive{}",
    ".ptitle{}",
    ".deep-dive-title{}",
    ".deep-dive-sub{}",
    ".deep-dive-body{}"
  ].join("\n"));
  return root;
}

function deepDive(body: string): string {
  return [
    '<div class="wrap">',
    "<!-- deep-dive:start -->",
    '<details class="deep-dive">',
    "<summary>",
    '<p class="ptitle">Deep dive</p>',
    '<h2 class="deep-dive-title">Title</h2>',
    '<p class="deep-dive-sub">Subtitle</p>',
    "</summary>",
    '<div class="deep-dive-body">',
    body,
    "</div>",
    "</details>",
    "<!-- deep-dive:end -->",
    "</div>"
  ].join("\n");
}
