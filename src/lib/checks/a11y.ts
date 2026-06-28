import { readFile } from "node:fs/promises";
import { load, type CheerioAPI } from "cheerio";
import type { Element } from "domhandler";
import { chromium } from "playwright";
import { AxeBuilder } from "@axe-core/playwright";
import { builtHtmlFiles } from "@lib/checks/built-site";
import { closeServer, startStaticSiteServer } from "@lib/static-site/server";
import { urlForSiteFile } from "@lib/static-site/url";

interface AccessibilityCheckOptions {
  root: string;
}

interface StaticAccessibilityResult {
  errors: string[];
  routes: string[];
}

interface AccessibilityCheckResult {
  checkedPages: number;
  failures: string[];
}

async function checkStaticAccessibility(builtSiteDir: string, htmlFiles: string[]): Promise<StaticAccessibilityResult> {
  const errors: string[] = [];

  for (const filePath of htmlFiles) {
    const url = urlForSiteFile(builtSiteDir, filePath);
    const html = await readFile(filePath, "utf8");
    const $ = load(html);

    $("img").each((index, el) => {
      if (!$(el).attr("alt") && $(el).attr("alt") !== "") {
        errors.push(`${url}: img ${index + 1} is missing alt`);
      }
    });

    $('svg[role="img"]').each((index, el) => {
      if (!svgAccessibleName($, el)) {
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

    const landmarkCounts = new Map<string, Map<string, number>>();
    $("header,nav,main,footer,aside,form,section[aria-label],section[aria-labelledby],[role='banner'],[role='navigation'],[role='main'],[role='contentinfo'],[role='complementary'],[role='form'],[role='region']").each((_, el) => {
      const role = landmarkRole(el);
      if (!role) return;
      const name = landmarkName($, el);
      const roleCounts = landmarkCounts.get(role) ?? new Map<string, number>();
      roleCounts.set(name, (roleCounts.get(name) ?? 0) + 1);
      landmarkCounts.set(role, roleCounts);
    });
    for (const [role, nameCounts] of landmarkCounts) {
      for (const [name, count] of nameCounts) {
        if (name && count > 1) {
          errors.push(`${url}: ${count} ${role} landmarks share accessible name "${name}"`);
        }
      }
    }
  }

  const routes = htmlFiles.map((filePath) => urlForSiteFile(builtSiteDir, filePath));

  return { errors, routes };
}

export async function checkAccessibility(options: AccessibilityCheckOptions): Promise<AccessibilityCheckResult> {
  const { builtSiteDir, htmlFiles } = await builtHtmlFiles(options.root, { required: true });

  const { errors: staticFailures, routes } = await checkStaticAccessibility(builtSiteDir, htmlFiles);
  if (!routes.length) {
    return {
      checkedPages: 0,
      failures: [...staticFailures, "_site contains no HTML files"]
    };
  }

  const { server, origin } = await startStaticSiteServer(builtSiteDir, "Accessibility check");
  let browser: Awaited<ReturnType<typeof chromium.launch>> | null = null;
  const failures = [...staticFailures];

  try {
    browser = await chromium.launch();
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    try {
      const page = await context.newPage();
      for (const route of routes) {
        await page.goto(`${origin}${route}`, { waitUntil: "networkidle" });
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        for (const violation of results.violations) {
          failures.push(summarizeViolation(route, violation));
        }
      }
    } finally {
      await context.close();
    }
  } finally {
    if (browser) await browser.close();
    await closeServer(server);
  }

  return {
    checkedPages: routes.length,
    failures
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
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function svgAccessibleName($: CheerioAPI, el: Element): string {
  const ariaLabel = $(el).attr("aria-label");
  if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

  return labelledByText($, el);
}

function elementName($: CheerioAPI, el: Element): string {
  const ariaLabel = $(el).attr("aria-label");
  if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

  const labelledBy = labelledByText($, el);
  if (labelledBy) return labelledBy;

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
  return value
    .toLowerCase()
    .match(/[\p{L}\p{N}?]+/gu) || [];
}

function labelMatchesName(label: string, name: string): boolean {
  const tokens = labelTokens(label);
  if (!tokens.length) return true;
  const haystack = name.toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

function landmarkName($: CheerioAPI, el: Element): string {
  const ariaLabel = $(el).attr("aria-label");
  if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

  return labelledByText($, el);
}

function labelledByText($: CheerioAPI, el: Element): string {
  const labelledBy = $(el).attr("aria-labelledby");
  if (!labelledBy) return "";
  return labelledBy
    .split(/\s+/)
    .map((id) => $(`[id="${attrSelectorValue(id)}"]`).text().trim())
    .filter(Boolean)
    .join(" ");
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
