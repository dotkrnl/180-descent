import http, { type Server } from "node:http";
import { stat, readFile } from "node:fs/promises";
import { load, type CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import { walkFiles } from "@lib/fs/walk";
import { siteDir } from "@lib/static-site/routes";
import { contentType, siteFileForUrlPath, urlForHtml } from "@lib/static-site/url";

interface AccessibilityCheckOptions {
  root: string;
}

interface StaticAccessibilityResult {
  errors: string[];
  axePages: string[];
}

interface AccessibilityCheckResult {
  checkedPages: number;
  failures: string[];
}

interface StaticServer {
  server: Server;
  origin: string;
}

async function checkStaticAccessibility(options: AccessibilityCheckOptions): Promise<StaticAccessibilityResult> {
  const builtSiteDir = siteDir(options.root);
  const errors: string[] = [];
  const htmlFiles = await walkFiles(builtSiteDir, { exts: ".html", ignoredDirNames: [] });

  for (const filePath of htmlFiles) {
    const url = urlForHtml(builtSiteDir, filePath);
    const html = await readFile(filePath, "utf8");
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

    const landmarkCounts = new Map<string, number>();
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

  const axePages = htmlFiles.map((filePath) => urlForHtml(builtSiteDir, filePath));

  return { errors, axePages };
}

export async function checkAccessibility(options: AccessibilityCheckOptions): Promise<AccessibilityCheckResult> {
  const builtSiteDir = siteDir(options.root);
  await stat(builtSiteDir);

  const { errors: staticFailures, axePages } = await checkStaticAccessibility(options);
  const { server, origin } = await startServer(builtSiteDir);
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
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }

  return {
    checkedPages: axePages.length,
    failures
  };
}

async function startServer(siteDir: string): Promise<StaticServer> {
  const server = http.createServer(async (req, res) => {
    try {
      const filePath = siteFileForUrlPath(siteDir, req.url || "/");
      if (!filePath) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      const body = await readFile(filePath);
      res.writeHead(200, { "content-type": contentType(filePath) });
      res.end(body);
    } catch {
      res.writeHead(404);
      res.end("Not found");
    }
  });

  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", () => resolve()));
  const address = server.address();
  if (!address || typeof address === "string") {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    throw new Error("Accessibility check server did not bind to a TCP port");
  }
  return {
    server,
    origin: `http://127.0.0.1:${address.port}`
  };
}

function summarizeViolation(
  pagePath: string,
  violation: {
    id: string;
    impact?: string | null;
    help: string;
    nodes: { target: unknown[]; failureSummary?: string | null }[];
  }
): string {
  const nodes = violation.nodes
    .slice(0, 3)
    .map((node) => `    - ${node.target.map(String).join(", ")}: ${node.failureSummary?.replace(/\s+/g, " ").trim() || "no failure summary"}`)
    .join("\n");
  return [
    `${pagePath}: ${violation.id} (${violation.impact || "unknown impact"})`,
    `  ${violation.help}`,
    nodes
  ].filter(Boolean).join("\n");
}

function attrSelectorValue(value: string): string {
  return String(value).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function elementName($: CheerioAPI, el: Element): string {
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

function visibleLabel($: CheerioAPI, el: Element): string {
  const clone = $(el).clone();
  clone.find("[aria-hidden='true'],script,style").remove();
  return clone.text().replace(/\s+/g, " ").trim();
}

function labelTokens(value: string): string[] {
  return String(value || "")
    .toLowerCase()
    .match(/[\p{L}\p{N}?]+/gu) || [];
}

function labelMatchesName(label: string, name: string): boolean {
  const tokens = labelTokens(label);
  if (!tokens.length) return true;
  const haystack = String(name || "").toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

function landmarkName($: CheerioAPI, el: Element): string {
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

function landmarkRole(el: Element): string {
  const role = (el.attribs.role || "").trim();
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
