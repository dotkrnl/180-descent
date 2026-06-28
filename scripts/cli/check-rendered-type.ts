import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import { chromium } from "playwright";
import { walkFiles } from "@lib/fs/walk";
import { siteDir } from "@lib/static-site/routes";
import { contentType, sitePathForUrlPath, urlForHtml } from "@lib/static-site/url";
import { exitOnErrors } from "./support";

const MIN_PANEL_TITLE_FONT_SIZE = 13;
const MIN_MOBILE_PANEL_TITLE_FONT_SIZE = 14.5;
const MIN_MOBILE_HUMP_SVG_TEXT_HEIGHT = 10.5;
const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 1000 }
] as const;

interface RenderedTypeFailure {
  route: string;
  viewport: string;
  text: string;
  value: number;
  minimum: number;
  kind: string;
}

const root = process.cwd();
const builtSiteDir = siteDir(root);
const routes = (await walkFiles(builtSiteDir, { exts: ".html", ignoredDirNames: [] }))
  .map((file) => urlForHtml(builtSiteDir, file))
  .sort();
const server = createServer(async (request, response) => {
  try {
    const requestedPath = new URL(request.url || "/", "http://localhost").pathname;
    const candidate = sitePathForUrlPath(builtSiteDir, requestedPath);
    const filePath = await resolveStaticFile(candidate);
    if (!filePath) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }
    response.writeHead(200, { "content-type": contentType(filePath) });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(500);
    response.end(String(error));
  }
});

await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));

const address = server.address();
const port = typeof address === "object" && address ? address.port : 0;
const baseUrl = `http://127.0.0.1:${port}`;
const browser = await chromium.launch();
const failures: RenderedTypeFailure[] = [];

try {
  for (const route of routes) {
    for (const viewport of VIEWPORTS) {
      const page = await browser.newPage({ viewport });
      await page.goto(new URL(route, baseUrl).href, { waitUntil: "networkidle" });
      await page.evaluate(() => {
        for (const details of document.querySelectorAll("details")) {
          details.setAttribute("open", "");
        }
      });
      const minFontSize = viewport.name === "mobile" ? MIN_MOBILE_PANEL_TITLE_FONT_SIZE : MIN_PANEL_TITLE_FONT_SIZE;
      const pageFailures = await page.evaluate(({ minFontSize, minHumpTextHeight, isMobile }) => {
        const titleFailures = [...document.querySelectorAll<HTMLElement>(".panel .ptitle")].flatMap((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          if (style.display === "none" || style.visibility === "hidden" || rect.width === 0 || rect.height === 0) {
            return [];
          }
          const fontSize = Number.parseFloat(style.fontSize);
          if (fontSize >= minFontSize) return [];
          return [{
            text: (element.textContent || "").replace(/\s+/g, " ").trim(),
            value: fontSize,
            minimum: minFontSize,
            kind: "panel title font size"
          }];
        });

        const humpTextFailures = isMobile
          ? [...document.querySelectorAll<SVGTextElement>(".complexity-hump text")].flatMap((element) => {
              const rect = element.getBoundingClientRect();
              if (rect.width === 0 || rect.height === 0) return [];
              if (rect.height >= minHumpTextHeight) return [];
              return [{
                text: (element.textContent || "").replace(/\s+/g, " ").trim(),
                value: rect.height,
                minimum: minHumpTextHeight,
                kind: "complexity-hump rendered SVG text height"
              }];
            })
          : [];

        return [...titleFailures, ...humpTextFailures];
      }, {
        minFontSize,
        minHumpTextHeight: MIN_MOBILE_HUMP_SVG_TEXT_HEIGHT,
        isMobile: viewport.name === "mobile"
      });

      for (const failure of pageFailures) {
        failures.push({ route, viewport: viewport.name, ...failure });
      }
      await page.close();
    }
  }
} finally {
  await browser.close();
  await new Promise<void>((resolve) => server.close(() => resolve()));
}

exitOnErrors(
  failures,
  (failure) => `${failure.route} ${failure.viewport}: ${failure.kind} for "${failure.text}" renders at ${failure.value.toFixed(2)}px; minimum ${failure.minimum}px`,
  {
    heading: `Rendered typography check failed. Panel titles must render at least ${MIN_PANEL_TITLE_FONT_SIZE}px desktop and ${MIN_MOBILE_PANEL_TITLE_FONT_SIZE}px mobile; mobile complexity-hump SVG labels must render at least ${MIN_MOBILE_HUMP_SVG_TEXT_HEIGHT}px high.`
  }
);

console.log(`Rendered typography check passed. Minimum panel title font size: ${MIN_PANEL_TITLE_FONT_SIZE}px desktop, ${MIN_MOBILE_PANEL_TITLE_FONT_SIZE}px mobile; minimum mobile complexity-hump SVG label height: ${MIN_MOBILE_HUMP_SVG_TEXT_HEIGHT}px.`);

async function resolveStaticFile(candidate: string | null): Promise<string> {
  if (!candidate) return "";
  try {
    const info = await stat(candidate);
    if (info.isDirectory()) {
      return resolveStaticFile(path.join(candidate, "index.html"));
    }
    return candidate;
  } catch {
    return "";
  }
}
