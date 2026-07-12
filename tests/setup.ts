import { mkdtempSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll } from "vitest";

const previousTmpDir = process.env.TMPDIR;
const testTmpDir = mkdtempSync(path.join(os.tmpdir(), "180-descent-tests-"));
process.env.TMPDIR = testTmpDir;

afterAll(() => {
  if (previousTmpDir === undefined) {
    delete process.env.TMPDIR;
  } else {
    process.env.TMPDIR = previousTmpDir;
  }
  rmSync(testTmpDir, { recursive: true, force: true });
});
