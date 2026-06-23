import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export async function createEmptyContentRoot(prefix: string): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), prefix));
  await mkdir(path.join(root, "src/content/days"), { recursive: true });
  return root;
}

export async function writePublishedDay(root: string): Promise<void> {
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
    "    title: Fixture",
    "    summary: English summary.",
    "    body: en.mdx",
    "    status: reviewed",
    "  zh:",
    "    title: 夹具",
    "    summary: 中文简介。",
    "    body: zh.mdx",
    "    status: reviewed"
  ].join("\n"));
  await writeFile(path.join(dayDir, "en.mdx"), "");
  await writeFile(path.join(dayDir, "zh.mdx"), "");
}
