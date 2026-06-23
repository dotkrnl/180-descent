import { describe, expect, it } from "vitest";
import { loadArtifactBookDays } from "@lib/artifacts/book";

const root = process.cwd();

describe("pdf builder model", () => {
  it("loads block titles from the shared artifact model", async () => {
    const days = await loadArtifactBookDays(root, "en");
    expect(days[0]?.block).toBe("Foundations of Knowledge & Reasoning");
    expect(days[0]?.title).toBe("What Is Knowledge?");
  });
});
