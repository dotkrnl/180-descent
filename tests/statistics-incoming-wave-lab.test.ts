import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { load } from "cheerio";
import os from "node:os";
import path from "node:path";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { getViteConfig } from "astro/config";
import type { AstroComponentFactory } from "astro/runtime/server/index.js";
import { createServer, type ViteDevServer } from "vite";

type Kind = "peek" | "conformal" | "ppi" | "paths" | "benchmark";
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
    cacheDir: path.join(process.env.TMPDIR ?? os.tmpdir(), "statistics-incoming-wave-vite"),
    server: { middlewareMode: true, hmr: false, ws: false }
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

  it.each(["en", "zh"] as const)("associates every range label for %s", async (locale) => {
    const kinds: Kind[] = ["peek", "conformal", "ppi", "paths", "benchmark"];
    const html = (await Promise.all(kinds.map((kind) => render(kind, locale)))).join("\n");
    const $ = load(html);
    const inputs = $('input[type="range"]');

    expect(inputs).toHaveLength(16);
    inputs.each((_, input) => {
      const id = $(input).attr("id");
      expect(id).toBeTruthy();
      expect($(`label[for="${id}"]`)).toHaveLength(1);
    });
  });
});
