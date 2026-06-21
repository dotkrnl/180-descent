import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadContentRegistry } from "@lib/content";
import {
  artifactDayFromRegistry,
  renderArtifactDayXhtml,
  renderArtifactPrintHtml,
  renderArtifactTypst
} from "@lib/artifacts";

const fixtureDaysDir = path.join(process.cwd(), "tests/fixtures/content/days");

describe("semantic artifact model", () => {
  it("emits EPUB XHTML, print HTML, and Typst input from one registry day", async () => {
    const registry = await loadContentRegistry({ daysDir: fixtureDaysDir });
    const artifactDay = artifactDayFromRegistry(registry.days[0], "en");

    expect(artifactDay.title).toBe("Fixture Day");
    expect(artifactDay.appendices[0].id).toBe("appendix-a");

    const xhtml = renderArtifactDayXhtml(artifactDay);
    const printHtml = renderArtifactPrintHtml(artifactDay);
    const typst = renderArtifactTypst(artifactDay);

    expect(xhtml).toContain("xmlns=\"http://www.w3.org/1999/xhtml\"");
    expect(xhtml).toContain("table");
    expect(xhtml).not.toContain("<script");
    expect(printHtml).toContain("data-interaction=\"fixture-interaction\"");
    expect(printHtml).toContain("static-figure");
    expect(typst).toContain("#set document");
    expect(typst).toContain("Fixture Day");
    expect(typst).toContain("static-figure");
  });
});
