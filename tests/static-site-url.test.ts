import path from "node:path";
import { describe, expect, it } from "vitest";
import { siteFileForUrlPath, sitePathForHref, sitePathForUrlPath, urlForHtml } from "@lib/static-site/url";

describe("static site URL helpers", () => {
  it("maps built HTML files to canonical route URLs", () => {
    const siteDir = path.join(path.sep, "repo", "_site");

    expect(urlForHtml(siteDir, path.join(siteDir, "index.html"))).toBe("/");
    expect(urlForHtml(siteDir, path.join(siteDir, "zh", "index.html"))).toBe("/zh/");
    expect(urlForHtml(siteDir, path.join(siteDir, "robots.txt"))).toBe("/robots.txt");
  });

  it("resolves local URL paths without allowing sibling-prefix escapes", () => {
    const siteDir = path.join(path.sep, "repo", "_site");

    expect(sitePathForUrlPath(siteDir, "/zh/?x=1")).toBe(path.join(siteDir, "zh"));
    expect(siteFileForUrlPath(siteDir, "/zh/")).toBe(path.join(siteDir, "zh", "index.html"));
    expect(siteFileForUrlPath(siteDir, "/zh")).toBe(path.join(siteDir, "zh", "index.html"));
    expect(siteFileForUrlPath(siteDir, "/standalone.html")).toBe(path.join(siteDir, "standalone.html"));
    expect(siteFileForUrlPath(siteDir, "/favicon.ico")).toBe(path.join(siteDir, "favicon.ico"));
    expect(sitePathForUrlPath(siteDir, "/../_site-copy/secret.txt")).toBe("");
  });

  it("resolves only same-site hrefs", () => {
    const siteDir = path.join(path.sep, "repo", "_site");
    const siteUrl = "https://180d.io";

    expect(sitePathForHref(siteDir, siteUrl, "/favicon.ico")).toBe(path.join(siteDir, "favicon.ico"));
    expect(sitePathForHref(siteDir, siteUrl, "https://180d.io/social.png")).toBe(path.join(siteDir, "social.png"));
    expect(sitePathForHref(siteDir, siteUrl, "https://example.com/social.png")).toBe("");
    expect(sitePathForHref(siteDir, siteUrl, "HTTPS://example.com/social.png")).toBe("");
    expect(sitePathForHref(siteDir, siteUrl, "//example.com/social.png")).toBe("");
  });
});
