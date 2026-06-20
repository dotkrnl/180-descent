import http from "node:http";
import fs from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import { walk } from "./lib/fs.mjs";
import { contentType, urlForHtml } from "./lib/url.mjs";

const siteDir = path.resolve("_site");

async function fileForUrl(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const clean = decoded.replace(/^\/+/, "");
  const candidate = path.join(siteDir, clean);
  const resolved = path.resolve(candidate);
  if (!resolved.startsWith(siteDir)) return "";

  try {
    const stats = await fs.stat(resolved);
    if (stats.isDirectory()) return path.join(resolved, "index.html");
    return resolved;
  } catch {
    return path.join(resolved, "index.html");
  }
}

async function startServer() {
  const server = http.createServer(async (req, res) => {
    try {
      const filePath = await fileForUrl(req.url || "/");
      if (!filePath) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      const body = await fs.readFile(filePath);
      res.writeHead(200, { "content-type": contentType(filePath) });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  return {
    server,
    origin: `http://127.0.0.1:${address.port}`
  };
}

function summarizeViolation(pagePath, violation) {
  const nodes = violation.nodes
    .slice(0, 3)
    .map((node) => `    - ${node.target.join(", ")}: ${node.failureSummary?.replace(/\s+/g, " ").trim() || "no failure summary"}`)
    .join("\n");
  return [
    `${pagePath}: ${violation.id} (${violation.impact || "unknown impact"})`,
    `  ${violation.help}`,
    nodes
  ].filter(Boolean).join("\n");
}

function attrSelectorValue(value) {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function elementName($, el) {
  const ariaLabel = $(el).attr("aria-label");
  if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

  const labelledBy = $(el).attr("aria-labelledby");
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => $(`[id="${attrSelectorValue(id)}"]`).text().trim())
      .filter(Boolean)
      .join(" ");
    if (text) return text;
  }

  const text = $(el).text().trim();
  if (text) return text;

  const imageAlt = $(el).find("img[alt]").map((_, img) => $(img).attr("alt") || "").get().join(" ").trim();
  return imageAlt;
}

function visibleLabel($, el) {
  const clone = $(el).clone();
  clone.find("[aria-hidden='true'],script,style").remove();
  return clone.text().replace(/\s+/g, " ").trim();
}

function labelTokens(value) {
  return String(value || "")
    .toLowerCase()
    .match(/[\p{L}\p{N}?]+/gu) || [];
}

function labelMatchesName(label, name) {
  const tokens = labelTokens(label);
  if (!tokens.length) return true;
  const haystack = String(name || "").toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

function landmarkName($, el) {
  const ariaLabel = $(el).attr("aria-label");
  if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

  const labelledBy = $(el).attr("aria-labelledby");
  if (labelledBy) {
    return labelledBy
      .split(/\s+/)
      .map((id) => $(`[id="${attrSelectorValue(id)}"]`).text().trim())
      .filter(Boolean)
      .join(" ");
  }

  return "";
}

function landmarkRole(el) {
  const role = (el.attribs?.role || "").trim();
  if (role) return role;
  if (el.tagName === "header") return "banner";
  if (el.tagName === "main") return "main";
  if (el.tagName === "footer") return "contentinfo";
  if (el.tagName === "nav") return "navigation";
  if (el.tagName === "aside") return "complementary";
  if (el.tagName === "form") return "form";
  if (el.tagName === "section") return "region";
  return "";
}

async function checkStaticAccessibility() {
  const errors = [];
  const htmlFiles = await walk(siteDir, { exts: ".html", ignored: [] });

  for (const filePath of htmlFiles) {
    const url = urlForHtml(siteDir, filePath);
    const html = await fs.readFile(filePath, "utf8");
    const $ = load(html);

    $("img").each((index, el) => {
      if (!$(el).attr("alt") && $(el).attr("alt") !== "") {
        errors.push(`${url}: img ${index + 1} is missing alt`);
      }
    });

    $('svg[role="img"]').each((index, el) => {
      if (!$(el).attr("aria-label") && !$(el).attr("aria-labelledby")) {
        errors.push(`${url}: svg[role="img"] ${index + 1} is missing an accessible name`);
      }
    });

    $("a[href],button").each((index, el) => {
      const name = elementName($, el);
      if (!name) {
        errors.push(`${url}: ${el.tagName} ${index + 1} is missing an accessible name`);
      }
      const label = visibleLabel($, el);
      if (name && label && !labelMatchesName(label, name)) {
        errors.push(`${url}: ${el.tagName} "${label}" accessible name should include its visible label, got "${name}"`);
      }
    });

    $("[aria-checked]").each((index, el) => {
      const role = $(el).attr("role") || "";
      if (!["checkbox", "menuitemcheckbox", "radio", "switch"].includes(role)) {
        errors.push(`${url}: [aria-checked] ${index + 1} must use checkbox, menuitemcheckbox, radio, or switch role`);
      }
    });

    let previousHeadingLevel = 0;
    $("h1,h2,h3,h4,h5,h6").each((_, el) => {
      const level = Number(el.tagName.slice(1));
      const text = $(el).text().replace(/\s+/g, " ").trim();
      if (level === 1) {
        previousHeadingLevel = 1;
        return;
      }
      if (previousHeadingLevel && level > previousHeadingLevel + 1) {
        errors.push(`${url}: heading jumps from h${previousHeadingLevel} to h${level}${text ? ` at "${text}"` : ""}`);
      }
      previousHeadingLevel = level;
    });

    const landmarkCounts = new Map();
    $("header,nav,main,footer,aside,form,section[aria-label],section[aria-labelledby],[role='banner'],[role='navigation'],[role='main'],[role='contentinfo'],[role='complementary'],[role='form'],[role='region']").each((_, el) => {
      const role = landmarkRole(el);
      if (!role) return;
      const name = landmarkName($, el);
      const key = `${role}|${name}`;
      landmarkCounts.set(key, (landmarkCounts.get(key) || 0) + 1);
    });
    for (const [key, count] of landmarkCounts) {
      const [role, name] = key.split("|");
      if (name && count > 1) {
        errors.push(`${url}: ${count} ${role} landmarks share accessible name "${name}"`);
      }
    }
  }

  const axePages = htmlFiles
    .map((filePath) => urlForHtml(siteDir, filePath))
    .filter((url) => !/^\/(?:zh\/)?print(?:-deep)?\//.test(url));

  return { errors, axePages };
}

async function main() {
  await fs.access(siteDir);
  const { errors: staticFailures, axePages } = await checkStaticAccessibility();
  const { server, origin } = await startServer();
  const browser = await chromium.launch();
  const failures = [...staticFailures];

  try {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    for (const pagePath of axePages) {
      await page.goto(`${origin}${pagePath}`, { waitUntil: "networkidle" });
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();
      for (const violation of results.violations) {
        failures.push(summarizeViolation(pagePath, violation));
      }
    }
  } finally {
    await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }

  if (failures.length) {
    console.error("Accessibility check failed:");
    console.error(failures.join("\n\n"));
    process.exit(1);
  }

  console.log(`Accessibility check passed for ${axePages.length} pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
