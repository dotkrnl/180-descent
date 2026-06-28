import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkContent } from "@lib/checks/content";
import { createEmptyContentRoot, writeContentDay } from "./helpers/content-root";

describe("content check", () => {
  it("accepts minimal paired registry content", async () => {
    const root = await createFixtureRoot();
    await writeRegistryDay(root, {
      en: body("Fixture Day"),
      zh: body("夹具日", "zh")
    });

    await expect(checkContent({ root })).resolves.toEqual([]);
  });

  it("reports mismatched h1 text and missing sources", async () => {
    const root = await createFixtureRoot();
    await writeRegistryDay(root, {
      en: [
        "# Different",
        '<StatusChip status={"ok"} label={"ok"} />'
      ].join("\n"),
      zh: body("夹具日", "zh")
    });

    const failures = await checkContent({ root });

    expect(failures).toEqual([
      {
        message: "EN 001-fixture has no sources section"
      },
      {
        message: 'EN 001-fixture h1 "Different" does not match manifest title "Fixture Day"'
      }
    ]);
  });

  it("reports raw interactive markup in MDX content", async () => {
    const root = await createFixtureRoot();
    await writeRegistryDay(root, {
      en: [
        body("Fixture Day"),
        '<button class="demo" data-action="next">Next</button>'
      ].join("\n"),
      zh: body("夹具日", "zh")
    });

    const failures = await checkContent({ root });

    expect(failures).toEqual([
      {
        message: "src/content/days/001-fixture/en.mdx contains raw interactive markup (raw control or canvas); extract it to a lesson component"
      }
    ]);
  });

  it("reports raw typographic wrapper markup in MDX content", async () => {
    const root = await createFixtureRoot();
    await writeRegistryDay(root, {
      en: [
        body("Fixture Day"),
        "<em>shortcut emphasis</em>"
      ].join("\n"),
      zh: body("夹具日", "zh")
    });

    const failures = await checkContent({ root });

    expect(failures).toEqual([
      {
        message: "src/content/days/001-fixture/en.mdx contains unsupported MDX wrapper markup; use Markdown emphasis or a shared inline component"
      }
    ]);
  });

  it("allows wrapper markup examples inside fenced code blocks", async () => {
    const root = await createFixtureRoot();
    await writeRegistryDay(root, {
      en: [
        body("Fixture Day"),
        "```html",
        '<section><p><em>example only</em></p></section>',
        "```"
      ].join("\n"),
      zh: body("夹具日", "zh")
    });

    await expect(checkContent({ root })).resolves.toEqual([]);
  });

  it("reports artifact-unfriendly alternate prose", async () => {
    const root = await createFixtureRoot();
    await writeRegistryDay(root, {
      en: [
        body("Fixture Day"),
        "Static version"
      ].join("\n"),
      zh: body("夹具日", "zh")
    });

    const failures = await checkContent({ root });

    expect(failures).toEqual([
      {
        message: "src/content/days/001-fixture/en.mdx contains artifact-unfriendly phrase: Static version"
      }
    ]);
  });

  it("reports invalid status component values", async () => {
    const root = await createFixtureRoot();
    await writeRegistryDay(root, {
      en: [
        "# Fixture Day",
        '<StatusChip status={"promising"} label={"promising"} />',
        "<StatusText status='contested' label='contested' />",
        '<MaturityTimelineItem status="established" year="2026" title="Fixture"></MaturityTimelineItem>',
        "<Sources></Sources>"
      ].join("\n"),
      zh: body("夹具日", "zh")
    });

    const failures = await checkContent({ root });

    expect(failures).toEqual([
      {
        message: 'src/content/days/001-fixture/en.mdx has invalid StatusChip status "promising"; use ok, hint, or bad'
      },
      {
        message: 'src/content/days/001-fixture/en.mdx has invalid StatusText status "contested"; use ok, hint, or bad'
      },
      {
        message: 'src/content/days/001-fixture/en.mdx has invalid MaturityTimelineItem status "established"; use ok, hint, or bad'
      }
    ]);
  });

  it("reports status components without literal status values", async () => {
    const root = await createFixtureRoot();
    await writeRegistryDay(root, {
      en: [
        "# Fixture Day",
        '<StatusChip status={frontierStatus} label={"dynamic"} />',
        '<StatusText label="missing" />',
        '<MaturityTimelineItem status={statusByYear[2026]} year="2026" title="Fixture"></MaturityTimelineItem>',
        "<Sources></Sources>"
      ].join("\n"),
      zh: body("夹具日", "zh")
    });

    const failures = await checkContent({ root });

    expect(failures).toEqual([
      {
        message: "src/content/days/001-fixture/en.mdx has StatusChip without a literal status; use ok, hint, or bad"
      },
      {
        message: "src/content/days/001-fixture/en.mdx has StatusText without a literal status; use ok, hint, or bad"
      },
      {
        message: "src/content/days/001-fixture/en.mdx has MaturityTimelineItem without a literal status; use ok, hint, or bad"
      }
    ]);
  });

  it("does not treat fenced examples as content markers or raw markup", async () => {
    const root = await createFixtureRoot();
    await writeRegistryDay(root, {
      en: [
        "# Fixture Day",
        "```mdx",
        '<StatusChip status={"ok"} label={"established"} />',
        "<Sources></Sources>",
        "<script>alert('example')</script>",
        "{% example %}",
        "```"
      ].join("\n"),
      zh: body("夹具日", "zh")
    });

    const failures = await checkContent({ root });

    expect(failures).toEqual([
      {
        message: "EN 001-fixture has no sources section"
      },
      {
        message: "EN 001-fixture has no frontier status chips"
      }
    ]);
  });

  it("does not accept prefix-sharing component names as required content markers", async () => {
    const root = await createFixtureRoot();
    await writeRegistryDay(root, {
      en: [
        "# Fixture Day",
        "<StatusChipRow></StatusChipRow>",
        "<SourcesTitle>Sources</SourcesTitle>"
      ].join("\n"),
      zh: body("夹具日", "zh")
    });

    const failures = await checkContent({ root });

    expect(failures).toEqual([
      {
        message: "EN 001-fixture has no sources section"
      },
      {
        message: "EN 001-fixture has no frontier status chips"
      }
    ]);
  });

  it("ignores generated files when checking parent Markdown references", async () => {
    const root = await createFixtureRoot();
    await mkdir(path.join(root, "tmp"), { recursive: true });
    await mkdir(path.join(root, "src/app"), { recursive: true });
    await writeRegistryDay(root, {
      en: body("Fixture Day"),
      zh: body("夹具日", "zh")
    });
    await writeFile(path.join(root, "tmp/generated.md"), "[scratch](../outside.md)");
    await writeFile(path.join(root, "src/app/source.md"), "[bad](../outside.md)");

    const failures = await checkContent({ root });

    expect(failures).toEqual([
      {
        message: "src/app/source.md references a parent Markdown file; keep canonical project content inside this repo"
      }
    ]);
  });

  it("reports missing and unregistered interaction scripts", async () => {
    const root = await createFixtureRoot();
    await mkdir(path.join(root, "src/assets/js/interactions"), { recursive: true });
    await writeFile(path.join(root, "src/assets/js/interactions/orphan.js"), "");
    await writeRegistryDay(root, {
      en: body("Fixture Day"),
      zh: body("夹具日", "zh"),
      interactionScripts: ["missing"]
    });

    const failures = await checkContent({ root });

    expect(failures).toEqual([
      {
        message: '001-fixture declares missing interaction script "missing"'
      },
      {
        message: "src/assets/js/interactions/orphan.js is not registered by any day manifest interactionScripts"
      }
    ]);
  });

  it("reports missing and uncredited open-license image assets", async () => {
    const root = await createFixtureRoot();
    await mkdir(path.join(root, "src/assets/images/open-license"), { recursive: true });
    await writeFile(path.join(root, "src/assets/images/open-license/orphan.jpg"), "");
    await writeFile(path.join(root, "src/_data/credits.yaml"), [
      "fonts: []",
      "images:",
      "  - title: Missing Image",
      "    creator: Fixture Creator",
      "    source: https://example.com/missing.jpg",
      "    license: CC BY 4.0",
      "    asset: /assets/images/open-license/missing.jpg",
      "    notes: Fixture notes."
    ].join("\n"));
    await writeRegistryDay(root, {
      en: body("Fixture Day"),
      zh: body("夹具日", "zh")
    });

    const failures = await checkContent({ root });

    expect(failures).toEqual([
      {
        message: "credits image asset does not exist: /assets/images/open-license/missing.jpg"
      },
      {
        message: "/assets/images/open-license/orphan.jpg is missing from credits.yaml images"
      }
    ]);
  });

  it("reports day manifest blocks that do not match the syllabus", async () => {
    const root = await createFixtureRoot();
    await writeContentDay(root, {
      block: "Wrong Block",
      enTitle: "Fixture Day",
      enSummary: "Fixture summary.",
      enBody: body("Fixture Day"),
      zhTitle: "夹具日",
      zhSummary: "中文夹具摘要。",
      zhBody: body("夹具日", "zh")
    });

    const failures = await checkContent({ root });

    expect(failures).toEqual([
      {
        message: '001-fixture block "Wrong Block" does not match syllabus block "Fixture"'
      }
    ]);
  });

  it("reports book totals that do not match the syllabus day count", async () => {
    const root = await createFixtureRoot();
    await writeFile(path.join(root, "src/_data/book.yaml"), fixtureBookYaml(2));
    await writeRegistryDay(root, {
      en: body("Fixture Day"),
      zh: body("夹具日", "zh")
    });

    const failures = await checkContent({ root });

    expect(failures).toEqual([
      {
        message: "book.yaml total_days 2 does not match syllabus day count 1"
      }
    ]);
  });

  it("reports appendix web panels without static alternates", async () => {
    const root = await createFixtureRoot();
    await writeRegistryDayWithAppendix(root, {
      enAppendix: [
        '<StatusChip status={"ok"} label={"ok"} />',
        '<Sources></Sources>',
        '<Panel class="web-only"><p>Interactive only</p></Panel>'
      ].join("\n"),
      zhAppendix: [
        '<StatusChip status={"ok"} label={"已确立"} />',
        '<Sources></Sources>'
      ].join("\n")
    });

    const failures = await checkContent({ root });

    expect(failures).toEqual([
      {
        message: "src/content/days/001-fixture/appendices/appendix-a.en.mdx contains unsupported MDX wrapper markup; use Markdown paragraphs, <Lead>, <FormatOnly>, <LessonNote>, or a shared paragraph component"
      },
      {
        message: "EN 001-fixture appendix appendix-a has 1 web-only artifact item(s) but only 0 static print/EPUB alternate(s)"
      }
    ]);
  });

  it("reports web-only components without static alternates", async () => {
    const root = await createFixtureRoot();
    await writeRegistryDay(root, {
      en: [
        body("Fixture Day"),
        '<GettierMachine locale="en" />'
      ].join("\n"),
      zh: body("夹具日", "zh")
    });

    const failures = await checkContent({ root });

    expect(failures).toEqual([
      {
        message: "EN 001-fixture has 1 web-only artifact item(s) but only 0 static print/EPUB alternate(s)"
      }
    ]);
  });

  it("reports components without artifact contracts", async () => {
    const root = await createFixtureRoot();
    await writeRegistryDay(root, {
      en: [
        body("Fixture Day"),
        "<NewWidget>Unclassified</NewWidget>"
      ].join("\n"),
      zh: body("夹具日", "zh")
    });

    const failures = await checkContent({ root });

    expect(failures).toEqual([
      {
        message: "src/content/days/001-fixture/en.mdx uses <NewWidget> without an artifact contract; classify its web, EPUB, and PDF behavior in checkContent"
      }
    ]);
  });

  it("accepts semantic static alternate variants", async () => {
    const root = await createFixtureRoot();
    await writeRegistryDayWithAppendix(root, {
      enAppendix: [
        '<StatusChip status={"ok"} label={"ok"} />',
        '<Sources></Sources>',
        '<Panel class="web-only">Interactive only</Panel>',
        '<FormatOnly media="print-epub" variant="alternate">Static alternate</FormatOnly>'
      ].join("\n"),
      zhAppendix: [
        '<StatusChip status={"ok"} label={"已确立"} />',
        '<Sources></Sources>'
      ].join("\n")
    });

    await expect(checkContent({ root })).resolves.toEqual([]);
  });
});

async function createFixtureRoot(): Promise<string> {
  const root = await createEmptyContentRoot("180-content-check-");
  await mkdir(path.join(root, "src/_data"), { recursive: true });
  await mkdir(path.join(root, "src/assets/scss"), { recursive: true });
  await writeFile(path.join(root, "src/_data/book.yaml"), fixtureBookYaml(1));
  await writeFile(path.join(root, "src/_data/credits.yaml"), "fonts: []\nimages: []\n");
  await writeFile(path.join(root, "src/_data/syllabus-data.yaml"), fixtureSyllabusYaml());
  await writeFile(path.join(root, "src/assets/scss/book.scss"), "@font-face { font-family: Fixture; }\n");
  return root;
}

async function writeRegistryDay(
  root: string,
  options: {
    en: string;
    zh: string;
    interactionScripts?: string[];
  }
): Promise<void> {
  await writeContentDay(root, {
    enTitle: "Fixture Day",
    enSummary: "Fixture summary.",
    enBody: options.en,
    zhTitle: "夹具日",
    zhSummary: "中文夹具摘要。",
    zhBody: options.zh,
    interactionScripts: options.interactionScripts
  });
}

async function writeRegistryDayWithAppendix(
  root: string,
  options: {
    enAppendix: string;
    zhAppendix: string;
  }
): Promise<void> {
  await writeContentDay(root, {
    enTitle: "Fixture Day",
    enSummary: "Fixture summary.",
    enBody: body("Fixture Day"),
    zhTitle: "夹具日",
    zhSummary: "中文夹具摘要。",
    zhBody: body("夹具日", "zh"),
    appendices: [
      {
        id: "appendix-a",
        enTitle: "Appendix A",
        enBodyPath: "appendices/appendix-a.en.mdx",
        enBody: options.enAppendix,
        zhTitle: "附录甲",
        zhBodyPath: "appendices/appendix-a.zh.mdx",
        zhBody: options.zhAppendix
      }
    ]
  });
}

function body(title: string, locale: "en" | "zh" = "en"): string {
  return [
    `# ${title}`,
    locale === "zh"
      ? '<StatusChip status={"ok"} label={"已确立"} />'
      : '<StatusChip status={"ok"} label={"established"} />',
    "<Sources></Sources>"
  ].join("\n");
}

function fixtureBookYaml(totalDays: number): string {
  return [
    "title: Fixture",
    "subtitle: Fixture subtitle",
    "deep_dive_subtitle: Fixture deep dive",
    "authors: Fixture Author",
    "human_editor:",
    "  name: Editor",
    "  url: https://example.com/editor",
    "description: Fixture description",
    "site_url: https://180d.io",
    "repo: https://example.com/repo",
    "language: en",
    "publisher: Fixture Publisher",
    "published_year: 2026",
    `total_days: ${totalDays}`,
    "epub_identifier: 11111111-1111-4111-8111-111111111111",
    "zh:",
    "  language: zh-Hans",
    "  title: Fixture",
    "  subtitle: Fixture subtitle",
    "  deep_dive_subtitle: Fixture deep dive",
    "  authors: Fixture Author",
    "  translators: Fixture Translator",
    "  human_editor:",
    "    name: Editor",
    "    url: https://example.com/editor",
    "  description: Fixture description",
    "  epub_identifier: 22222222-2222-4222-8222-222222222222"
  ].join("\n");
}

function fixtureSyllabusYaml(): string {
  return [
    "title:",
    "  en: Fixture Syllabus",
    "  zh: 夹具课程表",
    "subtitle:",
    "  en: Fixture subtitle",
    "  zh: 夹具副标题",
    "purpose:",
    "  en: Fixture purpose",
    "  zh: 夹具目的",
    "method:",
    "  en: Fixture method",
    "  zh: 夹具方法",
    "blocks:",
    "  - id: I",
    "    start_day: 1",
    "    end_day: 1",
    "    title:",
    "      en: Fixture",
    "      zh: 夹具",
    "    summary:",
    "      en: Fixture block",
    "      zh: 夹具模块",
    "    days:",
    "      - day: 1",
    "        title:",
    "          en: Fixture Day",
    "          zh: 夹具日"
  ].join("\n");
}
