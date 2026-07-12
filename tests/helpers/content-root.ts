import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { contentDaysDir } from "@lib/content/paths";

export async function createEmptyContentRoot(prefix: string): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), prefix));
  await mkdir(contentDaysDir(root), { recursive: true });
  return root;
}

interface ContentDayOptions {
  day?: number;
  block?: string;
  enTitle?: string;
  enSummary?: string;
  enBody?: string;
  zhTitle?: string;
  zhSummary?: string;
  zhBody?: string;
  appendices?: ContentDayAppendixOptions[];
  interactionScripts?: string[];
}

interface ContentDayAppendixOptions {
  id: string;
  enTitle: string;
  enBodyPath: string;
  enBody: string;
  zhTitle: string;
  zhBodyPath: string;
  zhBody: string;
}

export async function writeContentDay(root: string, options: ContentDayOptions = {}): Promise<void> {
  const day = options.day ?? 1;
  const enTitle = options.enTitle ?? "Fixture";
  const enSummary = options.enSummary ?? "English summary.";
  const enBody = options.enBody ?? "";
  const zhTitle = options.zhTitle ?? "夹具";
  const zhSummary = options.zhSummary ?? "中文简介。";
  const zhBody = options.zhBody ?? "";
  const dayDir = path.join(contentDaysDir(root), `${String(day).padStart(3, "0")}-fixture`);
  await mkdir(dayDir, { recursive: true });
  const manifest = [
    `day: ${day}`,
    `block: ${options.block ?? "Fixture"}`,
    "locales:",
    "  en:",
    `    title: ${enTitle}`,
    `    summary: ${enSummary}`,
    "    body: en.mdx",
    "  zh:",
    `    title: ${zhTitle}`,
    `    summary: ${zhSummary}`,
    "    body: zh.mdx"
  ];

  if (options.appendices?.length) {
    manifest.push("appendices:");
    for (const appendix of options.appendices) {
      manifest.push(
        `  - id: ${appendix.id}`,
        "    locales:",
        "      en:",
        `        title: ${appendix.enTitle}`,
        `        body: ${appendix.enBodyPath}`,
        "      zh:",
        `        title: ${appendix.zhTitle}`,
        `        body: ${appendix.zhBodyPath}`
      );
    }
  } else {
    manifest.push("appendices: []");
  }

  if (options.interactionScripts?.length) {
    manifest.push("interactionScripts:");
    for (const script of options.interactionScripts) {
      manifest.push(`  - ${script}`);
    }
  } else {
    manifest.push("interactionScripts: []");
  }

  await writeFile(path.join(dayDir, "day.yaml"), manifest.join("\n"));
  await writeFile(path.join(dayDir, "en.mdx"), enBody);
  await writeFile(path.join(dayDir, "zh.mdx"), zhBody);

  for (const appendix of options.appendices ?? []) {
    await mkdir(path.dirname(path.join(dayDir, appendix.enBodyPath)), { recursive: true });
    await writeFile(path.join(dayDir, appendix.enBodyPath), appendix.enBody);
    await mkdir(path.dirname(path.join(dayDir, appendix.zhBodyPath)), { recursive: true });
    await writeFile(path.join(dayDir, appendix.zhBodyPath), appendix.zhBody);
  }
}
