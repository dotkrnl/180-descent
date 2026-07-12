import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { load } from "cheerio";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getViteConfig } from "astro/config";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import { createServer, type ViteDevServer } from "vite";

type Kind = "conformal" | "ppi";
type Locale = "en" | "zh";

let component: AstroComponentFactory;
let container: AstroContainer;
let server: ViteDevServer;

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
    server: { middlewareMode: true }
  });
  const module = await server.ssrLoadModule(
    "/src/app/components/lesson/interactives/StatisticsIncomingWaveLab.astro"
  );
  component = module.default as AstroComponentFactory;
  container = await AstroContainer.create();
}, 30_000);

afterAll(async () => {
  await server.close();
});

async function render(kind: Kind, locale: Locale): Promise<string> {
  return container.renderToString(component, { props: { kind, locale } });
}

describe("StatisticsIncomingWaveLab", () => {
  it.each(["en", "zh"] as const)("renders scaled slider defaults for %s", async (locale) => {
    const conformal = load(await render("conformal", locale));
    expect(conformal("#appendix-d006-the-incoming-wave-confSkill").attr("value")).toBe("70");

    const ppi = load(await render("ppi", locale));
    expect(ppi("#appendix-d006-the-incoming-wave-ppiR").attr("value")).toBe("70");
    expect(ppi("#appendix-d006-the-incoming-wave-ppiBias").attr("value")).toBe("20");
  });
});
