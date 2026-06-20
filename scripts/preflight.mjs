import { execFileSync } from "node:child_process";
import { readdirSync, existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";

const TOOLS = {
  gs: {
    label: "Ghostscript (gs)",
    usedBy: "build-pdf, check-pdf",
    installHint: "macOS: brew install ghostscript | Debian/Ubuntu: apt-get install ghostscript",
    check() {
      const version = execFileSync("gs", ["--version"], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
      return version;
    }
  },
  xmllint: {
    label: "xmllint (libxml2)",
    usedBy: "check-epub",
    installHint: "macOS: brew install libxml2 | Debian/Ubuntu: apt-get install libxml2-utils",
    check() {
      const output = execFileSync("xmllint", ["--version"], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] });
      return output.trim().split("\n")[0];
    }
  },
  playwright: {
    label: "Playwright Chromium browser",
    usedBy: "build-pdf, generate-social-cards, check-a11y",
    installHint: "npx playwright install chromium",
    check() {
      const cacheDir = playwrightCacheDir();
      if (!existsSync(cacheDir)) {
        throw new Error(`Playwright browser cache not found at ${cacheDir}`);
      }
      const entries = readdirSync(cacheDir);
      const chromium = entries.find((entry) => entry.startsWith("chromium-"));
      if (!chromium) {
        throw new Error(`No chromium-* directory in ${cacheDir}`);
      }
      return chromium;
    }
  }
};

function playwrightCacheDir() {
  if (process.env.PLAYWRIGHT_BROWSERS_PATH) return process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (process.platform === "darwin") {
    return path.join(os.homedir(), "Library", "Caches", "ms-playwright");
  }
  if (process.platform === "win32") {
    return path.join(process.env.LOCALAPPDATA || path.join(os.homedir(), "AppData", "Local"), "ms-playwright");
  }
  return path.join(os.homedir(), ".cache", "ms-playwright");
}

export function checkTools(required = Object.keys(TOOLS), { throwOnMissing = true } = {}) {
  const missing = [];
  const present = [];

  for (const name of required) {
    const tool = TOOLS[name];
    if (!tool) {
      missing.push({ name, error: new Error(`Unknown tool: ${name}`) });
      continue;
    }
    try {
      const version = tool.check();
      present.push({ name, version });
    } catch (error) {
      missing.push({
        name,
        label: tool.label,
        usedBy: tool.usedBy,
        installHint: tool.installHint,
        error
      });
    }
  }

  if (missing.length && throwOnMissing) {
    const lines = ["Preflight check failed. The following required tools are missing:"];
    for (const m of missing) {
      lines.push("");
      lines.push(`  ${m.label || m.name}`);
      if (m.usedBy) lines.push(`    needed by: ${m.usedBy}`);
      if (m.installHint) lines.push(`    install:   ${m.installHint}`);
      if (m.error?.message) lines.push(`    detail:    ${m.error.message}`);
    }
    lines.push("");
    console.error(lines.join("\n"));
    process.exit(1);
  }

  return { present, missing };
}

const required = process.argv.slice(2);
if (required.length > 0 || process.env.PREFLIGHT_AUTO) {
  checkTools(required.length > 0 ? required : undefined);
}
