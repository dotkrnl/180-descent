import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkContent } from "@lib/checks/content";
import { createEmptyContentRoot, writePublishedDay } from "./helpers/content-root";

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
        message: "EN 001-fixture appendix appendix-a has 1 web-only panels but only 0 static print/EPUB alternates"
      },
      {
        message: "src/content/days/001-fixture/appendices/appendix-a.en.mdx contains unsupported MDX wrapper markup; use Markdown paragraphs, <Lead>, <FormatOnly>, <LessonNote>, or a shared paragraph component"
      }
    ]);
  });
});

async function createFixtureRoot(): Promise<string> {
  const root = await createEmptyContentRoot("180-content-check-");
  await mkdir(path.join(root, "src/assets/scss"), { recursive: true });
  await writeFile(path.join(root, "src/assets/scss/book.scss"), "@font-face { font-family: Fixture; }\n");
  return root;
}

async function writeRegistryDay(
  root: string,
  options: {
    en: string;
    zh: string;
  }
): Promise<void> {
  await writePublishedDay(root, {
    enTitle: "Fixture Day",
    enSummary: "Fixture summary.",
    enBody: options.en,
    zhTitle: "夹具日",
    zhSummary: "中文夹具摘要。",
    zhBody: options.zh
  });
}

async function writeRegistryDayWithAppendix(
  root: string,
  options: {
    enAppendix: string;
    zhAppendix: string;
  }
): Promise<void> {
  await writePublishedDay(root, {
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
