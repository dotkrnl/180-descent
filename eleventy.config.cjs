const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const yaml = require("yaml");
const { createCodexRefinerMiddleware } = require("./scripts/codex-refiner-middleware.cjs");

const assetHashCache = new Map();

function assetUrl(value = "") {
  const raw = String(value || "");
  const match = raw.match(/^([^?#]+)(\?[^#]*)?(#.*)?$/);
  if (!match || !match[1].startsWith("/assets/")) return raw;

  const [, pathname, query = "", fragment = ""] = match;
  const sourcePath = path.join(__dirname, "src", pathname.slice(1));

  try {
    const stat = fs.statSync(sourcePath);
    const cached = assetHashCache.get(sourcePath);
    let hash = cached?.hash;

    if (!cached || cached.mtimeMs !== stat.mtimeMs || cached.size !== stat.size) {
      hash = crypto
        .createHash("sha256")
        .update(fs.readFileSync(sourcePath))
        .digest("hex")
        .slice(0, 12);
      assetHashCache.set(sourcePath, {
        hash,
        mtimeMs: stat.mtimeMs,
        size: stat.size
      });
    }

    const params = new URLSearchParams(query ? query.slice(1) : "");
    params.set("v", hash);
    return `${pathname}?${params.toString()}${fragment}`;
  } catch (error) {
    return raw;
  }
}

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absoluteUrl(value = "", siteUrl = "") {
  const raw = String(value || "");
  if (/^https?:\/\//i.test(raw)) return raw;
  const base = String(siteUrl || "").replace(/\/+$/g, "");
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${base}${path}`;
}

function alternateUrlFor(data = {}) {
  const pageUrl = data.page?.url || "";
  return languageAlternateUrl(pageUrl, data.locale, data.day_path, data.alternate_url, data.hide_language_toggle);
}

function languageAlternateUrl(pageUrl = "", locale = "", dayPath = "", explicit = "", hide = false) {
  if (explicit) return explicit;
  if (hide) return "";
  if (dayPath) return locale === "zh" ? `/days/${dayPath}/` : `/zh/days/${dayPath}/`;
  if (pageUrl === "/") return "/zh/";
  if (pageUrl === "/zh/") return "/";
  if (pageUrl.startsWith("/zh/")) return pageUrl.replace(/^\/zh/, "") || "/";
  if (pageUrl && pageUrl !== "/") return `/zh${pageUrl}`;
  return "";
}

function socialImageFor(data = {}) {
  if (data.seo_image || data.image) return data.seo_image || data.image;
  if (data.day_path) {
    const prefix = data.locale === "zh" ? "zh-day" : "day";
    return `/assets/images/social/${prefix}-${data.day_path}.png`;
  }
  return data.locale === "zh"
    ? "/assets/images/social/180-descent-zh.png"
    : "/assets/images/social/180-descent.png";
}

function xmlEscape(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function dateToIso(value) {
  const date = value instanceof Date ? value : new Date(value || Date.now());
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension("yaml,yml", (contents) => yaml.parse(contents));

  eleventyConfig.setServerOptions({
    domDiff: false,
    middleware: [
      createCodexRefinerMiddleware()
    ]
  });

  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });

  eleventyConfig.addFilter("assetUrl", assetUrl);
  eleventyConfig.addFilter("absoluteUrl", absoluteUrl);
  eleventyConfig.addFilter("alternateUrl", alternateUrlFor);
  eleventyConfig.addFilter("languageAlternateUrl", languageAlternateUrl);
  eleventyConfig.addFilter("socialImage", socialImageFor);
  eleventyConfig.addFilter("xmlEscape", xmlEscape);
  eleventyConfig.addFilter("dateToIso", dateToIso);
  eleventyConfig.addFilter("padDay", (value) => String(value).padStart(3, "0"));
  eleventyConfig.addFilter("slugify", (value = "") => String(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, ""));
  eleventyConfig.addFilter("roman", (value) => {
    const numerals = [
      [1000, "M"], [900, "CM"], [500, "D"], [400, "CD"],
      [100, "C"], [90, "XC"], [50, "L"], [40, "XL"],
      [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]
    ];
    let n = Number(value) || 0;
    let out = "";
    for (const [amount, label] of numerals) {
      while (n >= amount) {
        out += label;
        n -= amount;
      }
    }
    return out || String(value);
  });
  eleventyConfig.addFilter("blockOrdinal", (items, index) => {
    let ordinal = 0;
    let previous = "";
    for (let i = 0; i <= Number(index); i++) {
      const current = items[i]?.data?.block || "";
      if (current && current !== previous) {
        ordinal++;
        previous = current;
      }
    }
    return ordinal;
  });
  eleventyConfig.addFilter("statusClass", (value = "") => {
    const v = String(value).toLowerCase();
    if (v.includes("established")) return "ok";
    if (v.includes("promising") || v.includes("hint")) return "hint";
    return "bad";
  });
  eleventyConfig.addFilter("publishedCount", (items = []) => items.length);
  eleventyConfig.addFilter("totalSyllabusDays", (syllabus = {}) => {
    return (syllabus.blocks || []).reduce((total, block) => total + (block.days || []).length, 0);
  });
  eleventyConfig.addFilter("publishedUrlForDay", (items = [], day) => {
    const match = items.find((item) => Number(item.data?.day) === Number(day));
    return match?.url || "";
  });
  eleventyConfig.addFilter("publishedItemForDay", (items = [], day) => {
    return items.find((item) => Number(item.data?.day) === Number(day)) || null;
  });
  eleventyConfig.addFilter("latestDays", (items = [], count = 10) => {
    return [...items]
      .sort((a, b) => Number(b.data?.day || 0) - Number(a.data?.day || 0))
      .slice(0, Number(count));
  });
  eleventyConfig.addFilter("previousPublishedDay", (items = [], day) => {
    const sorted = [...items].sort((a, b) => Number(a.data?.day || 0) - Number(b.data?.day || 0));
    const index = sorted.findIndex((item) => Number(item.data?.day) === Number(day));
    return index > 0 ? sorted[index - 1] : null;
  });
  eleventyConfig.addFilter("nextPublishedDay", (items = [], day) => {
    const sorted = [...items].sort((a, b) => Number(a.data?.day || 0) - Number(b.data?.day || 0));
    const index = sorted.findIndex((item) => Number(item.data?.day) === Number(day));
    return index >= 0 && index < sorted.length - 1 ? sorted[index + 1] : null;
  });
  eleventyConfig.addFilter("nextSyllabusDay", (syllabus = {}, items = []) => {
    const published = new Set(items.map((item) => Number(item.data?.day)));
    for (const block of syllabus.blocks || []) {
      for (const day of block.days || []) {
        if (!published.has(Number(day.day))) return { ...day, block: block.title, block_id: block.id };
      }
    }
    return null;
  });
  eleventyConfig.addFilter("upcomingSyllabusDays", (syllabus = {}, items = [], count = 5) => {
    const published = new Set(items.map((item) => Number(item.data?.day)));
    const upcoming = [];
    for (const block of syllabus.blocks || []) {
      for (const day of block.days || []) {
        if (!published.has(Number(day.day))) {
          upcoming.push({ ...day, block: block.title, block_id: block.id });
          if (upcoming.length >= Number(count)) return upcoming;
        }
      }
    }
    return upcoming;
  });
  eleventyConfig.addFilter("json", (value) => JSON.stringify(value));

  eleventyConfig.addShortcode("statusChip", (label) => {
    const text = String(label || "").trim();
    const cls = text.toLowerCase().includes("established")
      ? "ok"
      : text.toLowerCase().includes("promising") || text.toLowerCase().includes("hint")
        ? "hint"
        : "bad";
    const compact = text.toLowerCase().includes("superseded")
      ? "superseded"
      : text.toLowerCase().includes("established")
        ? "established"
        : text.toLowerCase().includes("promising")
          ? "promising"
          : text.toLowerCase().includes("contested")
            ? "contested"
            : "review";
    return `<span class="chip ${cls}" data-print="${compact}"><i></i>${text}</span>`;
  });

  eleventyConfig.addShortcode("tip", function (text = "") {
    const locale = this?.ctx?.locale || "";
    const pageUrl = this?.page?.url || "";
    const isZh = locale === "zh" || String(pageUrl).startsWith("/zh/");
    const label = isZh ? "显示说明" : "Show note";
    return `<span class="tip-note"><button class="tip-note-mark" type="button" aria-expanded="false" aria-label="${escapeHtml(label)}">?</button><span class="tip-note-box" role="tooltip">${escapeHtml(text)}</span></span>`;
  });

  eleventyConfig.addCollection("days", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/days/*.md")
      .sort((a, b) => Number(a.data.day) - Number(b.data.day));
  });
  eleventyConfig.addCollection("zhDays", (collectionApi) => {
    return collectionApi
      .getFilteredByGlob("src/zh/days/*.md")
      .sort((a, b) => Number(a.data.day) - Number(b.data.day));
  });
  eleventyConfig.addCollection("introduction", (collectionApi) => {
    return collectionApi.getFilteredByGlob("src/pages/introduction.md");
  });
  eleventyConfig.addCollection("zhIntroduction", (collectionApi) => {
    return collectionApi.getFilteredByGlob("src/zh/introduction.md");
  });
  eleventyConfig.addCollection("sitemapPages", (collectionApi) => {
    return collectionApi
      .getAllSorted()
      .filter((item) => {
        if (!item.url || !item.outputPath || !item.outputPath.endsWith(".html")) return false;
        if (item.data?.sitemap_exclude || item.data?.robots?.includes("noindex")) return false;
        if (item.url.includes("/print")) return false;
        return true;
      });
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    dataTemplateEngine: "njk"
  };
};
