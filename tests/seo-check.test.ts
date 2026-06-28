import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkSeo } from "@lib/checks/seo";
import { bookDataFile } from "@lib/data/paths";

describe("seo check", () => {
  it("accepts a minimal indexable page with required metadata", async () => {
    const root = await createSiteRoot();
    await writeFile(path.join(root, "_site/index.html"), indexHtml());

    await expect(checkSeo({ root })).resolves.toEqual({
      checkedHtmlFiles: 1,
      errors: []
    });
  });

  it("reports incorrect hreflang targets for paired pages", async () => {
    const root = await createSiteRoot();
    await mkdir(path.join(root, "_site/zh"), { recursive: true });
    await writeFile(path.join(root, "_site/index.html"), indexHtml({
      alternates: {
        en: "https://180d.io/",
        zh: "https://180d.io/wrong/",
        xDefault: "https://180d.io/zh/"
      }
    }));
    await writeFile(path.join(root, "_site/zh/index.html"), indexHtml({
      canonicalPath: "/zh/",
      alternates: {
        en: "https://180d.io/",
        zh: "https://180d.io/zh/",
        xDefault: "https://180d.io/"
      }
    }));

    const result = await checkSeo({ root });

    expect(result.errors).toEqual([
      "/: hreflang zh-Hans should be https://180d.io/zh/, got https://180d.io/wrong/",
      "/: hreflang x-default should be https://180d.io/, got https://180d.io/zh/"
    ]);
  });

  it("rejects external asset URLs that only match a local pathname", async () => {
    const root = await createSiteRoot();
    await writeFile(path.join(root, "_site/index.html"), indexHtml({
      favicon: "https://example.com/favicon.ico"
    }));
    await writeFile(path.join(root, "_site/site.webmanifest"), JSON.stringify({
      icons: [{ src: "https://example.com/icon-192.png" }]
    }));

    const result = await checkSeo({ root });

    expect(result.errors).toEqual([
      "/: favicon does not exist locally (https://example.com/favicon.ico)",
      "/site.webmanifest: icon does not exist locally (https://example.com/icon-192.png)"
    ]);
  });

  it("reports invalid web manifests without throwing", async () => {
    const root = await createSiteRoot();
    await writeFile(path.join(root, "_site/index.html"), indexHtml());
    await writeFile(path.join(root, "_site/site.webmanifest"), "{");

    const result = await checkSeo({ root });

    expect(result.errors[0]).toMatch(/^\/site\.webmanifest: invalid web manifest JSON/);
  });

  it("reports non-array manifest icons without throwing", async () => {
    const root = await createSiteRoot();
    await writeFile(path.join(root, "_site/index.html"), indexHtml());
    await writeFile(path.join(root, "_site/site.webmanifest"), JSON.stringify({
      icons: { src: "/icon-192.png" }
    }));

    const result = await checkSeo({ root });

    expect(result.errors).toEqual([
      "/site.webmanifest: icons must be an array"
    ]);
  });

  it("reports invalid manifest icon entries without throwing", async () => {
    const root = await createSiteRoot();
    await writeFile(path.join(root, "_site/index.html"), indexHtml());
    await writeFile(path.join(root, "_site/site.webmanifest"), JSON.stringify({
      icons: [null]
    }));

    const result = await checkSeo({ root });

    expect(result.errors).toEqual([
      "/site.webmanifest: icon src must be a string"
    ]);
  });

  it("checks a shared manifest once", async () => {
    const root = await createSiteRoot();
    await mkdir(path.join(root, "_site/zh"), { recursive: true });
    await writeFile(path.join(root, "_site/index.html"), indexHtml({
      alternates: {
        en: "https://180d.io/",
        zh: "https://180d.io/zh/",
        xDefault: "https://180d.io/"
      }
    }));
    await writeFile(path.join(root, "_site/zh/index.html"), indexHtml({
      canonicalPath: "/zh/",
      alternates: {
        en: "https://180d.io/",
        zh: "https://180d.io/zh/",
        xDefault: "https://180d.io/"
      }
    }));
    await writeFile(path.join(root, "_site/site.webmanifest"), JSON.stringify({
      icons: [null]
    }));

    const result = await checkSeo({ root });

    expect(result.errors).toEqual([
      "/site.webmanifest: icon src must be a string"
    ]);
  });
});

async function createSiteRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-seo-check-"));
  await mkdir(path.join(root, "_site"), { recursive: true });
  await mkdir(path.join(root, "src/_data"), { recursive: true });
  await writeFile(bookDataFile(root), "site_url: https://180d.io\n");
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

function indexHtml(options: {
  canonicalPath?: string;
  favicon?: string;
  alternates?: {
    en: string;
    zh: string;
    xDefault: string;
  };
} = {}): string {
  const canonicalPath = options.canonicalPath ?? "/";
  const alternates = options.alternates
    ? [
      `<link rel="alternate" hreflang="en" href="${options.alternates.en}">`,
      `<link rel="alternate" hreflang="zh-Hans" href="${options.alternates.zh}">`,
      `<link rel="alternate" hreflang="x-default" href="${options.alternates.xDefault}">`
    ]
    : [];
  return [
    "<!doctype html>",
    "<html>",
    "<head>",
    "<title>Fixture</title>",
    '<meta name="description" content="Fixture description">',
    `<link rel="canonical" href="https://180d.io${canonicalPath}">`,
    ...alternates,
    '<meta property="og:title" content="Fixture">',
    '<meta property="og:description" content="Fixture description">',
    '<meta property="og:image" content="https://180d.io/social.png">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<script type="application/ld+json">{}</script>',
    `<link rel="icon" href="${options.favicon ?? "/favicon.ico"}">`,
    '<link rel="apple-touch-icon" href="/apple-touch-icon.png">',
    '<link rel="manifest" href="/site.webmanifest">',
    "</head>",
    "<body></body>",
    "</html>"
  ].join("\n");
}
