import { describe, expect, it } from "vitest";
import { refactorFoundation } from "@lib/foundation";
import { contentFoundation } from "@content/foundation";
import { interactionFoundation } from "@interactions/foundation";

describe("refactor foundation", () => {
  it("declares the selected renderer and content model", () => {
    expect(refactorFoundation.renderer).toBe("astro");
    expect(refactorFoundation.contentModel).toBe("paired-day-registry");
  });

  it("keeps paired locale content as the target content shape", () => {
    expect(contentFoundation.manifest).toBe("day.yaml");
    expect(contentFoundation.locales).toEqual(["en", "zh"]);
  });

  it("keeps interactions on plain TypeScript DOM contracts", () => {
    expect(interactionFoundation.defaultRuntime).toBe("plain-typescript-dom");
  });
});
