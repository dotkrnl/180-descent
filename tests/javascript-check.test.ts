import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkJavaScriptSyntax } from "@lib/checks/javascript";

describe("JavaScript syntax check", () => {
  it("reports malformed interaction scripts", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "180-javascript-check-"));
    const interactionsDir = path.join(root, "src/assets/js/interactions");
    await mkdir(interactionsDir, { recursive: true });
    await writeFile(path.join(root, "src/assets/js/book.js"), "const ready = true;\n");
    await writeFile(path.join(interactionsDir, "broken.js"), "const answer = ;\n");

    const result = await checkJavaScriptSyntax({ root });

    expect(result.checkedFiles).toBe(2);
    expect(result.failures).toEqual([{
      file: "src/assets/js/interactions/broken.js",
      reason: expect.stringMatching(/^line 1: SyntaxError:/)
    }]);
  });
});
