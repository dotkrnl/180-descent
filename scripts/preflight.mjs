import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import path from "node:path";
import os from "node:os";

const EPUBCHECK_JAR_CANDIDATES = [
  process.env.EPUBCHECK_JAR,
  path.join(process.cwd(), "tools/epubcheck/epubcheck.jar")
].filter(Boolean);

const HOMEBREW_PREFIX = process.env.HOMEBREW_PREFIX || (existsSync("/opt/homebrew") ? "/opt/homebrew" : "/usr/local");
const LOCAL_BIN = path.join(process.cwd(), "node_modules/.bin");

const TOOLS = {
  node: {
    label: "Node.js",
    category: "durable-required",
    usedBy: "all build/check scripts",
    installHint: "Install the project Node version, then run npm install.",
    check() {
      return process.version;
    }
  },
  npm: {
    label: "npm",
    category: "durable-required",
    usedBy: "all package scripts",
    installHint: "Install npm with Node.js.",
    check() {
      return execFileSync("npm", ["--version"], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
    }
  },
  gs: {
    label: "Ghostscript (gs)",
    category: "durable-required",
    usedBy: "build-pdf, check-pdf",
    installHint: "macOS: brew install ghostscript | Debian/Ubuntu: apt-get install ghostscript",
    check() {
      return execFileSync("gs", ["--version"], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
    }
  },
  xmllint: {
    label: "xmllint (libxml2)",
    category: "durable-required",
    usedBy: "check-epub XML fast checks",
    installHint: "macOS: brew install libxml2 | Debian/Ubuntu: apt-get install libxml2-utils",
    check() {
      return commandVersion("xmllint", ["--version"]);
    }
  },
  playwright: {
    label: "Playwright Chromium browser",
    category: "durable-required",
    usedBy: "build-pdf, check-a11y, web screenshot QA",
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
  },
  java: {
    label: "Java runtime",
    category: "planned-durable",
    usedBy: "official EPUBCheck once pinned",
    installHint: "macOS: brew install openjdk | Debian/Ubuntu: apt-get install default-jre",
    check() {
      return checkCommandVersions([
        ["java", ["-version"]],
        [path.join(HOMEBREW_PREFIX, "opt/openjdk/bin/java"), ["-version"]]
      ]);
    }
  },
  epubcheck: {
    label: "Pinned EPUBCheck jar",
    category: "planned-durable",
    usedBy: "official EPUB validation once pinned",
    installHint: "Set EPUBCHECK_JAR or install tools/epubcheck/epubcheck.jar with the pinned checksum.",
    check() {
      const jar = EPUBCHECK_JAR_CANDIDATES.find((candidate) => existsSync(candidate));
      if (!jar) {
        return commandVersion("epubcheck", ["--version"]);
      }
      return jar;
    }
  },
  texlive: {
    label: "TeX Live XeLaTeX/LuaLaTeX",
    category: "spike-only",
    usedBy: "PDF renderer spike",
    installHint: "macOS: brew install --cask mactex-no-gui | Debian/Ubuntu: apt-get install texlive-xetex texlive-luatex",
    check() {
      return checkFirstCommand([
        ["xelatex", ["--version"]],
        ["lualatex", ["--version"]]
      ]);
    }
  },
  pandoc: {
    label: "Pandoc",
    category: "spike-only",
    usedBy: "PDF renderer spike",
    installHint: "macOS: brew install pandoc | Debian/Ubuntu: apt-get install pandoc",
    check() {
      return firstLine(execFileSync("pandoc", ["--version"], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }));
    }
  },
  tectonic: {
    label: "Tectonic",
    category: "spike-only",
    usedBy: "PDF renderer spike",
    installHint: "macOS: brew install tectonic | see https://tectonic-typesetting.github.io/",
    check() {
      return firstLine(execFileSync("tectonic", ["--version"], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }));
    }
  },
  typst: {
    label: "Typst",
    category: "spike-only",
    usedBy: "PDF renderer spike",
    installHint: "macOS: brew install typst | see https://typst.app/open-source/",
    check() {
      return firstLine(execFileSync("typst", ["--version"], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }));
    }
  },
  weasyprint: {
    label: "WeasyPrint",
    category: "spike-only",
    usedBy: "PDF renderer spike",
    installHint: "Install with pipx or your OS package manager.",
    check() {
      return firstLine(execFileSync("weasyprint", ["--version"], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }));
    }
  },
  vivliostyle: {
    label: "Vivliostyle CLI",
    category: "spike-only",
    usedBy: "PDF renderer spike",
    installHint: "Install with npm or your package manager for the spike only.",
    check() {
      return checkCommandVersions([
        ["vivliostyle", ["--version"]],
        [path.join(LOCAL_BIN, "vivliostyle"), ["--version"]]
      ]);
    }
  }
};

const TOOL_GROUPS = {
  durable: ["node", "npm", "gs", "xmllint", "playwright"],
  "epubcheck-planned": ["java", "epubcheck"],
  "pdf-spike": ["texlive", "pandoc", "tectonic", "typst", "weasyprint", "vivliostyle", "playwright"]
};

function firstLine(value) {
  return value.trim().split("\n")[0];
}

function commandVersion(command, args) {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || `${command} exited ${result.status}`).trim());
  }
  return firstLine(`${result.stdout || ""}\n${result.stderr || ""}`) || "available";
}

function checkCommandVersions(commands) {
  const errors = [];
  for (const [command, args] of commands) {
    try {
      return commandVersion(command, args);
    } catch (error) {
      errors.push(`${command}: ${error.message}`);
    }
  }
  throw new Error(errors.join("; "));
}

function checkFirstCommand(commands) {
  const errors = [];
  for (const [command, args] of commands) {
    try {
      return firstLine(execFileSync(command, args, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }));
    } catch (error) {
      errors.push(`${command}: ${error.message}`);
    }
  }
  throw new Error(errors.join("; "));
}

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

function resolveToolNames(requested = []) {
  const names = requested.length ? requested : ["durable"];
  return [...new Set(names.flatMap((name) => TOOL_GROUPS[name] ?? [name]))];
}

export function checkTools(required = TOOL_GROUPS.durable, { throwOnMissing = true } = {}) {
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
      present.push({ name, label: tool.label, category: tool.category, version });
    } catch (error) {
      missing.push({
        name,
        label: tool.label,
        category: tool.category,
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
      if (m.category) lines.push(`    category:  ${m.category}`);
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

function printToolList() {
  console.log("Preflight groups:");
  for (const [name, tools] of Object.entries(TOOL_GROUPS)) {
    console.log(`  ${name}: ${tools.join(", ")}`);
  }
  console.log("");
  console.log("Tools:");
  for (const [name, tool] of Object.entries(TOOLS)) {
    console.log(`  ${name} [${tool.category}] - ${tool.usedBy}`);
  }
}

function parseArgs(args) {
  const toolNames = [];
  let optional = false;
  let list = false;

  for (const arg of args) {
    if (arg === "--optional") {
      optional = true;
    } else if (arg === "--list") {
      list = true;
    } else if (arg.startsWith("--group=")) {
      toolNames.push(arg.slice("--group=".length));
    } else {
      toolNames.push(arg);
    }
  }

  return { toolNames, optional, list };
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === new URL(import.meta.url).pathname;

if (isCli) {
  const { toolNames, optional, list } = parseArgs(process.argv.slice(2));
  if (list) {
    printToolList();
  } else {
    const names = resolveToolNames(toolNames);
    const result = checkTools(names, { throwOnMissing: !optional });
    for (const tool of result.present) {
      console.log(`ok ${tool.name} (${tool.category}): ${tool.version}`);
    }
    for (const tool of result.missing) {
      console.log(`missing ${tool.name} (${tool.category}): ${tool.error?.message}`);
    }
    if (result.missing.length && optional) {
      console.log("Optional preflight completed with missing tools.");
    }
  }
}
