import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkLinks } from "@lib/checks/links";
import { futureLinksDataFile } from "@lib/data/paths";
import { writeContentDay } from "./helpers/content-root";

describe("link checks", () => {
  it("reports empty built sites instead of passing zero pages", async () => {
    const root = await createFixtureRoot();

    const failures = await checkLinks({ root });

    expect(failures).toEqual([
      {
        message: "_site contains no HTML files"
      }
    ]);
  });

  it("reports broken internal links and missing anchors", async () => {
    const root = await createFixtureRoot();
    await writeFile(path.join(root, "_site/index.html"), [
      '<a href="/missing/">missing</a>',
      '<a href="/target/#absent">bad anchor</a>'
    ].join("\n"));
    await mkdir(path.join(root, "_site/target"), { recursive: true });
    await writeFile(path.join(root, "_site/target/index.html"), '<main id="present"></main>');

    const failures = await checkLinks({ root });

    expect(failures.map((failure) => failure.message)).toEqual([
      "Broken internal link /missing/ in _site/index.html",
      'Missing anchor /target/#absent (anchor "absent" not found in _site/target/index.html) referenced from _site/index.html'
    ]);
  });

  it("parses internal URLs and validates same-page anchors", async () => {
    const root = await createFixtureRoot();
    await writeFile(path.join(root, "_site/index.html"), [
      '<main id="present"></main>',
      '<a href="/target/?from=index#present">target with query</a>',
      '<a href="/target#absent">slashless target missing anchor</a>',
      '<a href="/bad-%zz-path">malformed path</a>',
      '<a href="/../outside/">escaped path</a>',
      '<a href="#missing">same-page missing</a>',
      '<a href="//example.com/path">external protocol-relative</a>',
      '<a href="tel:+15555555555">phone</a>'
    ].join("\n"));
    await mkdir(path.join(root, "_site/target"), { recursive: true });
    await writeFile(path.join(root, "_site/target/index.html"), '<main id="present"></main>');

    const failures = await checkLinks({ root });

    expect(failures.map((failure) => failure.message)).toEqual([
      'Missing anchor /target#absent (anchor "absent" not found in _site/target/index.html) referenced from _site/index.html',
      "Broken internal link /bad-%zz-path in _site/index.html",
      "Broken internal link /../outside/ in _site/index.html",
      'Missing anchor #missing (anchor "missing" not found in _site/index.html) referenced from _site/index.html'
    ]);
  });

  it("validates percent-encoded anchors against decoded element ids", async () => {
    const root = await createFixtureRoot();
    await writeFile(path.join(root, "_site/index.html"), [
      '<main id="same page"></main>',
      '<a href="#same%20page">same page encoded anchor</a>',
      '<a href="/target/#target%20page">target encoded anchor</a>'
    ].join("\n"));
    await mkdir(path.join(root, "_site/target"), { recursive: true });
    await writeFile(path.join(root, "_site/target/index.html"), '<main id="target page"></main>');

    const failures = await checkLinks({ root });

    expect(failures).toEqual([]);
  });

  it("resolves relative internal links against the current page", async () => {
    const root = await createFixtureRoot();
    await writeFile(path.join(root, "_site/index.html"), [
      '<a href="target/#present">relative target</a>',
      '<a href="missing/">relative missing</a>'
    ].join("\n"));
    await mkdir(path.join(root, "_site/section"), { recursive: true });
    await writeFile(path.join(root, "_site/section/index.html"), [
      '<main id="local"></main>',
      '<a href="?view=1#local">same page query anchor</a>',
      '<a href="../target/#absent">parent target missing anchor</a>'
    ].join("\n"));
    await mkdir(path.join(root, "_site/target"), { recursive: true });
    await writeFile(path.join(root, "_site/target/index.html"), '<main id="present"></main>');

    const failures = await checkLinks({ root });

    expect(failures.map((failure) => failure.message)).toEqual([
      "Broken internal link missing/ in _site/index.html",
      'Missing anchor ../target/#absent (anchor "absent" not found in _site/target/index.html) referenced from _site/section/index.html'
    ]);
  });

  it("reports future links that still target published days", async () => {
    const root = await createFixtureRoot();
    await writeSecondContentDay(root);
    await writeFile(path.join(root, "_site/index.html"), "");
    await writeFile(futureLinksDataFile(root), [
      "- id: day-001-to-day-002-callback",
      "  from_day: 1",
      "  target_day: 2",
      "  text: Callback",
      "  status: pending",
      "  context: test callback"
    ].join("\n"));

    const failures = await checkLinks({ root });

    expect(failures).toEqual([
      {
        message: "Future link day-001-to-day-002-callback targets published day 2 but is still pending"
      }
    ]);
  });

  it("reports resolved future links that target unpublished days", async () => {
    const root = await createFixtureRoot();
    await writeFile(path.join(root, "_site/index.html"), "");
    await writeFile(futureLinksDataFile(root), [
      "- id: day-001-to-day-009-callback",
      "  from_day: 1",
      "  target_day: 9",
      "  text: Callback",
      "  status: resolved",
      "  context: test callback"
    ].join("\n"));

    const failures = await checkLinks({ root });

    expect(failures).toEqual([
      {
        message: "Future link day-001-to-day-009-callback targets unpublished day 9 but is marked resolved"
      }
    ]);
  });
});

async function createFixtureRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-check-links-"));
  await mkdir(path.join(root, "_site"), { recursive: true });
  await mkdir(path.join(root, "src/_data"), { recursive: true });
  await writeContentDay(root);
  await writeFile(futureLinksDataFile(root), "[]\n");
  return root;
}

async function writeSecondContentDay(root: string): Promise<void> {
  const dayDir = path.join(root, "src/content/days/002-fixture");
  await mkdir(dayDir, { recursive: true });
  await writeFile(path.join(dayDir, "day.yaml"), [
    "day: 2",
    "block: Fixture",
    "locales:",
    "  en:",
    "    title: Fixture Day 2",
    "    summary: Fixture summary.",
    "    body: en.mdx",
    "  zh:",
    "    title: 夹具日二",
    "    summary: 中文夹具摘要。",
    "    body: zh.mdx",
    "appendices: []",
    "interactionScripts: []"
  ].join("\n"));
  await writeFile(path.join(dayDir, "en.mdx"), "");
  await writeFile(path.join(dayDir, "zh.mdx"), "");
}
