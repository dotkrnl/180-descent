import { chromium } from "playwright";
import { walkFiles } from "@lib/fs/walk";
import { siteDir } from "@lib/static-site/routes";
import { closeServer, startStaticSiteServer } from "@lib/static-site/server";
import { urlForSiteFile } from "@lib/static-site/url";

const MIN_PANEL_TITLE_FONT_SIZE = 13;
const MIN_MOBILE_PANEL_TITLE_FONT_SIZE = 14.5;
const MIN_MOBILE_HUMP_SVG_TEXT_HEIGHT = 10.5;
export const RENDERED_TYPE_FAILURE_HEADING = `Rendered typography check failed. Panel titles must render at least ${MIN_PANEL_TITLE_FONT_SIZE}px desktop and ${MIN_MOBILE_PANEL_TITLE_FONT_SIZE}px mobile; mobile complexity-hump SVG labels must render at least ${MIN_MOBILE_HUMP_SVG_TEXT_HEIGHT}px high.`;

interface RenderedTypeCheckOptions {
  root: string;
}

interface RenderedTypeCheckResult {
  checkedPages: number;
  errors: string[];
}

interface RenderedTypeFailure {
  route: string;
  viewport: string;
  text: string;
  value: number;
  minimum: number;
  kind: string;
}

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "desktop", width: 1440, height: 1000 }
] as const;

export async function checkRenderedType(options: RenderedTypeCheckOptions): Promise<RenderedTypeCheckResult> {
  const builtSiteDir = siteDir(options.root);
  const routes = (await walkFiles(builtSiteDir, { exts: ".html", ignoredDirNames: [] }))
    .map((file) => urlForSiteFile(builtSiteDir, file))
    .sort();

  if (!routes.length) {
    return {
      checkedPages: 0,
      errors: ["_site contains no HTML files"]
    };
  }

  const { server, origin } = await startStaticSiteServer(builtSiteDir, "Rendered typography check");
  const browser = await chromium.launch();
  const failures: RenderedTypeFailure[] = [];

  try {
    for (const route of routes) {
      for (const viewport of VIEWPORTS) {
        const page = await browser.newPage({ viewport });
        await page.goto(new URL(route, origin).href, { waitUntil: "networkidle" });
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
    await closeServer(server);
  }

  return {
    checkedPages: routes.length,
    errors: failures.map(renderedTypeFailureMessage)
  };
}

function renderedTypeFailureMessage(failure: RenderedTypeFailure): string {
  return `${failure.route} ${failure.viewport}: ${failure.kind} for "${failure.text}" renders at ${failure.value.toFixed(2)}px; minimum ${failure.minimum}px`;
}
