import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkSeo } from "@lib/checks/seo";

describe("seo check", () => {
  it("accepts a minimal indexable page with required metadata", async () => {
    const root = await createSiteRoot();
    await writeFile(path.join(root, "_site/index.html"), indexHtml());

    await expect(checkSeo({ root })).resolves.toEqual({
      checkedHtmlFiles: 1,
      errors: []
    });
  });
});

async function createSiteRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-seo-check-"));
  await mkdir(path.join(root, "_site"), { recursive: true });
  await writeFile(path.join(root, "_site/social.png"), "");
  await writeFile(path.join(root, "_site/favicon.ico"), "");
  await writeFile(path.join(root, "_site/apple-touch-icon.png"), "");
  await writeFile(path.join(root, "_site/icon-192.png"), "");
  await writeFile(path.join(root, "_site/site.webmanifest"), JSON.stringify({
    icons: [{ src: "/icon-192.png" }]
  }));
  await writeFile(path.join(root, "_site/sitemap.xml"), '<urlset><xhtml:link rel="alternate" /></urlset>');
  await writeFile(path.join(root, "_site/robots.txt"), "Sitemap: https://180d.io/sitemap.xml\n");
  return root;
}

function indexHtml(): string {
  return [
    "<!doctype html>",
    "<html>",
    "<head>",
    "<title>Fixture</title>",
    '<meta name="description" content="Fixture description">',
    '<link rel="canonical" href="https://180d.io/">',
    '<meta property="og:title" content="Fixture">',
    '<meta property="og:description" content="Fixture description">',
    '<meta property="og:image" content="https://180d.io/social.png">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<script type="application/ld+json">{}</script>',
    '<link rel="icon" href="/favicon.ico">',
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/site.webmanifest">',
    "</head>",
    "<body></body>",
    "</html>"
  ].join("\n");
}
