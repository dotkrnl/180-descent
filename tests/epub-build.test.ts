import path from "node:path";
import { describe, expect, it } from "vitest";
import { epubImageFilePath } from "@lib/artifacts/epub/build";

describe("epub build helpers", () => {
  it("resolves source image conventions to source files and Astro images to built files", () => {
    const root = path.join(path.sep, "repo");

    expect(epubImageFilePath(root, "/assets/images/open-license/fixture.jpg")).toBe(
      path.join(root, "src/assets/images/open-license/fixture.jpg")
    );
    expect(epubImageFilePath(root, "/_astro/fixture.hash.jpg")).toBe(
      path.join(root, "_site/_astro/fixture.hash.jpg")
    );
  });
});
