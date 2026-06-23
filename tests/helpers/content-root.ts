import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export async function createEmptyContentRoot(prefix: string): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), prefix));
  await mkdir(path.join(root, "src/content/days"), { recursive: true });
  return root;
}

interface PublishedDayOptions {
  enTitle?: string;
  enSummary?: string;
  zhTitle?: string;
  zhSummary?: string;
}

export async function writePublishedDay(root: string, options: PublishedDayOptions = {}): Promise<void> {
  const enTitle = options.enTitle ?? "Fixture";
  const enSummary = options.enSummary ?? "English summary.";
  const zhTitle = options.zhTitle ?? "夹具";
  const zhSummary = options.zhSummary ?? "中文简介。";
  const dayDir = path.join(root, "src/content/days/001-fixture");
  await mkdir(dayDir, { recursive: true });
  await writeFile(path.join(dayDir, "day.yaml"), [
    "day: 1",
    "slug: fixture",
    "path: 001-fixture",
    "block: Fixture",
    "published: true",
    "locales:",
    "  en:",
    `    title: ${enTitle}`,
    `    summary: ${enSummary}`,
    "    body: en.mdx",
    "    status: reviewed",
    "  zh:",
    `    title: ${zhTitle}`,
    `    summary: ${zhSummary}`,
    "    body: zh.mdx",
    "    status: reviewed"
  ].join("\n"));
  await writeFile(path.join(dayDir, "en.mdx"), "");
  await writeFile(path.join(dayDir, "zh.mdx"), "");
}
