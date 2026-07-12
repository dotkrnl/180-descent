import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { load } from "cheerio";
import { rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getViteConfig } from "astro/config";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import { createServer, type ViteDevServer } from "vite";

type Locale = "en" | "zh";

const cases = [
  {
    component: "HammingCube",
    selector: ".ham-stage > svg",
    labels: {
      en: "A cube whose eight corners are the 3-bit strings, with 000 and 111 as codewords.",
      zh: "一个立方体，其八个角是 3 比特字符串，其中 000 与 111 为编码词。"
    }
  },
  {
    component: "Day10LevinsTriangle",
    selector: ".day10-levins-svg > svg",
    labels: {
      en: "Levins's triangle: the three vertices are generality, realism, and precision. Selecting a vertex sacrifices it; the opposite edge marks the two desiderata kept.",
      zh: "列文斯三角：三个顶点分别是一般性、逼真性和精确性。点击一个顶点表示牺牲它，对边表示保留的两项。"
    }
  },
  {
    component: "Day10FrontierMap",
    selector: ".fm-chart > svg",
    labels: {
      en: "Interactive scatter plot of AI modeling frontier developments by evidential strength and potential impact.",
      zh: "按证据强度和潜在影响排列 AI 建模前沿工作的交互散点图。"
    }
  }
] as const;

let container: AstroContainer;
let server: ViteDevServer;
const components = new Map<string, AstroComponentFactory>();
const viteCacheDir = path.join(process.env.TMPDIR ?? os.tmpdir(), "interactive-svg-vite");

beforeAll(async () => {
  const root = process.cwd();
  const configFactory = getViteConfig({ root }, { root });
  const config = await configFactory({
    command: "serve",
    mode: "test",
    isPreview: false,
    isSsrBuild: true
  });
  server = await createServer({
    ...config,
    cacheDir: viteCacheDir,
    optimizeDeps: { noDiscovery: true },
    server: { middlewareMode: true, hmr: false, ws: false }
  });

  for (const testCase of cases) {
    const module = await server.ssrLoadModule(
      `/src/app/components/lesson/interactives/${testCase.component}.astro`
    );
    components.set(testCase.component, module.default as AstroComponentFactory);
  }
  container = await AstroContainer.create();
}, 30_000);

afterAll(async () => {
  await server.close();
  await rm(viteCacheDir, { recursive: true, force: true });
});

async function render(componentName: string, locale: Locale): Promise<string> {
  const component = components.get(componentName);
  if (!component) throw new Error(`Component not loaded: ${componentName}`);
  return container.renderToString(component, { props: { locale } });
}

describe("interactive SVG semantics", () => {
  for (const testCase of cases) {
    it.each(["en", "zh"] as const)(
      `${testCase.component} exposes its controls as a named group in %s`,
      async (locale) => {
        const $ = load(await render(testCase.component, locale));
        const svg = $(testCase.selector);

        expect(svg).toHaveLength(1);
        expect(svg.attr("role")).toBe("group");
        expect(svg.attr("aria-label")).toBe(testCase.labels[locale]);
      }
    );
  }
});
