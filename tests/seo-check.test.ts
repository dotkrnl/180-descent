import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { checkSeo } from "@lib/checks/seo";
import { bookDataFile } from "@lib/data/paths";
import { validBookYaml } from "./helpers/book-data";

describe("seo check", () => {
  it("reports empty built sites instead of passing zero pages", async () => {
    const root = await createSiteRoot();

    await expect(checkSeo({ root })).resolves.toEqual({
      checkedHtmlFiles: 0,
      errors: ["_site contains no HTML files"]
    });
  });

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

  it("reports malformed web manifest JSON", async () => {
    const root = await createSiteRoot();
    await writeFile(path.join(root, "_site/index.html"), indexHtml());
    await writeFile(path.join(root, "_site/site.webmanifest"), "{");

    const result = await checkSeo({ root });

    expect(result.errors[0]).toMatch(/^\/site\.webmanifest: invalid web manifest JSON/);
  });

  it("reports non-object web manifests", async () => {
    const root = await createSiteRoot();
    await writeFile(path.join(root, "_site/index.html"), indexHtml());
    await writeFile(path.join(root, "_site/site.webmanifest"), JSON.stringify([]));

    const result = await checkSeo({ root });

    expect(result.errors).toEqual([
      "/site.webmanifest: web manifest must be a JSON object"
    ]);
  });

  it("reports non-array manifest icons", async () => {
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

  it("reports manifest icons without string sources", async () => {
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

  it("resolves relative manifest icons against the manifest URL", async () => {
    const root = await createSiteRoot();
    await mkdir(path.join(root, "_site/app"), { recursive: true });
    await writeFile(path.join(root, "_site/app/site.webmanifest"), JSON.stringify({
      icons: [{ src: "icon-192.png" }]
    }));
    await writeFile(path.join(root, "_site/app/icon-192.png"), "");
    await writeFile(path.join(root, "_site/index.html"), indexHtml({
      manifest: "/app/site.webmanifest"
    }));

    const result = await checkSeo({ root });

    expect(result.errors).toEqual([]);
  });

  it("resolves page-relative manifest links against the current page URL", async () => {
    const root = await createSiteRoot();
    await mkdir(path.join(root, "_site/app"), { recursive: true });
    await writeFile(path.join(root, "_site/app/site.webmanifest"), JSON.stringify({
      icons: [null]
    }));
    await writeFile(path.join(root, "_site/app/index.html"), indexHtml({
      canonicalPath: "/app/",
      manifest: "site.webmanifest"
    }));

    const result = await checkSeo({ root });

    expect(result.errors).toEqual([
      "/app/site.webmanifest: icon src must be a string"
    ]);
  });

  it("does not accept commented sitemap markup", async () => {
    const root = await createSiteRoot();
    await writeFile(path.join(root, "_site/index.html"), indexHtml());
    await writeFile(path.join(root, "_site/sitemap.xml"), "<!-- <urlset><xhtml:link rel=\"alternate\" /></urlset> -->");

    const result = await checkSeo({ root });

    expect(result.errors).toEqual([
      "sitemap.xml: missing urlset",
      "sitemap.xml: missing hreflang xhtml:link alternates"
    ]);
  });

  it("does not accept commented robots Sitemap directives", async () => {
    const root = await createSiteRoot();
    await writeFile(path.join(root, "_site/index.html"), indexHtml());
    await writeFile(path.join(root, "_site/robots.txt"), "# Sitemap: https://180d.io/sitemap.xml\n");

    const result = await checkSeo({ root });

    expect(result.errors).toEqual([
      "robots.txt: missing Sitemap directive"
    ]);
  });
});

async function createSiteRoot(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), "180-seo-check-"));
  await mkdir(path.join(root, "_site"), { recursive: true });
  await mkdir(path.join(root, "src/_data"), { recursive: true });
  await writeFile(bookDataFile(root), validBookYaml());
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
  manifest?: string;
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
    `<link rel="manifest" href="${options.manifest ?? "/site.webmanifest"}">`,
    "</head>",
    "<body></body>",
    "</html>"
  ].join("\n");
}
