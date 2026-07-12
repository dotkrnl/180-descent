import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

export default async function setup(): Promise<() => Promise<void>> {
  const previousTmpDir = process.env.TMPDIR;
  const testTmpDir = await mkdtemp(path.join(os.tmpdir(), "180-descent-tests-"));
  process.env.TMPDIR = testTmpDir;

  return async () => {
    if (previousTmpDir === undefined) {
      delete process.env.TMPDIR;
    } else {
      process.env.TMPDIR = previousTmpDir;
    }
    await rm(testTmpDir, { recursive: true, force: true });
  };
}
