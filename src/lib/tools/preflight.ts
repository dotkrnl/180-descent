import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

type ToolCategory = "durable-required";

interface ToolDefinition {
  label: string;
  category: ToolCategory;
  usedBy: string;
  installHint: string;
  check: () => string;
}

interface ToolSuccess {
  name: string;
  label: string;
  category: ToolCategory;
  version: string;
}

interface ToolFailure {
  name: string;
  label?: string;
  category?: ToolCategory;
  usedBy?: string;
  installHint?: string;
  error: Error;
}

interface PreflightResult {
  present: ToolSuccess[];
  missing: ToolFailure[];
}

interface PreflightOptions {
  throwOnMissing?: boolean;
}

interface PreflightArgs {
  toolNames: string[];
  optional: boolean;
  list: boolean;
}

type CommandSpec = [command: string, args: string[]];

const EPUBCHECK_JAR_CANDIDATES = [
  process.env.EPUBCHECK_JAR,
  path.join(process.cwd(), "tools/epubcheck/epubcheck.jar")
].filter((candidate): candidate is string => Boolean(candidate));

const HOMEBREW_PREFIX = process.env.HOMEBREW_PREFIX || (existsSync("/opt/homebrew") ? "/opt/homebrew" : "/usr/local");

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
  pdftotext: {
    label: "Poppler pdftotext",
    category: "durable-required",
    usedBy: "check-pdf text extraction",
    installHint: "macOS: brew install poppler | Debian/Ubuntu: apt-get install poppler-utils",
    check() {
      return commandVersion("pdftotext", ["-v"]);
    }
  },
  latexmk: {
    label: "latexmk",
    category: "durable-required",
    usedBy: "build-pdf XeTeX orchestration",
    installHint: "macOS: brew install texlive | Debian/Ubuntu: apt-get install texlive-xetex latexmk",
    check() {
      return commandVersion("latexmk", ["-version"]);
    }
  },
  xelatex: {
    label: "XeLaTeX",
    category: "durable-required",
    usedBy: "build-pdf",
    installHint: "macOS: brew install texlive | Debian/Ubuntu: apt-get install texlive-xetex",
    check() {
      return commandVersion("xelatex", ["--version"]);
    }
  },
  fonttools: {
    label: "fonttools",
    category: "durable-required",
    usedBy: "build-pdf WOFF2 to OpenType font preparation",
    installHint: "macOS: brew install fonttools | Debian/Ubuntu: apt-get install fonttools",
    check() {
      return commandVersion("fonttools", ["ttLib.woff2", "decompress", "--help"]);
    }
  },
  rsvg: {
    label: "rsvg-convert",
    category: "durable-required",
    usedBy: "build-pdf SVG image conversion",
    installHint: "macOS: brew install librsvg | Debian/Ubuntu: apt-get install librsvg2-bin",
    check() {
      return commandVersion("rsvg-convert", ["--version"]);
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
    usedBy: "check-a11y, web screenshot QA",
    installHint: "npx playwright install chromium",
    check() {
      const executable = chromium.executablePath();
      if (!existsSync(executable)) {
        throw new Error(`Playwright Chromium executable not found at ${executable}`);
      }
      return playwrightBrowserName(executable);
    }
  },
  java: {
    label: "Java runtime",
    category: "durable-required",
    usedBy: "official EPUBCheck",
    installHint: "macOS: brew install openjdk | Debian/Ubuntu: apt-get install default-jre",
    check() {
      return checkCommandVersions([
        ["java", ["-version"]],
        [path.join(HOMEBREW_PREFIX, "opt/openjdk/bin/java"), ["-version"]]
      ]);
    }
  },
  epubcheck: {
    label: "EPUBCheck 5.3.0",
    category: "durable-required",
    usedBy: "official EPUB validation",
    installHint: "macOS: brew install epubcheck | or set EPUBCHECK_JAR / tools/epubcheck/epubcheck.jar",
    check() {
      const jar = EPUBCHECK_JAR_CANDIDATES.find((candidate) => existsSync(candidate));
      if (!jar) {
        return requireVersion("epubcheck", ["--version"], /EPUBCheck v5\.3\.0/);
      }
      return requireVersion(path.join(HOMEBREW_PREFIX, "opt/openjdk/bin/java"), ["-jar", jar, "--version"], /EPUBCheck v5\.3\.0/);
    }
  }
} satisfies Record<string, ToolDefinition>;

const TOOLS_BY_NAME: Record<string, ToolDefinition | undefined> = TOOLS;

const TOOL_GROUPS = {
  durable: ["node", "npm", "pdftotext", "latexmk", "xelatex", "fonttools", "rsvg", "xmllint", "playwright", "java", "epubcheck"],
  epubcheck: ["java", "epubcheck"]
} as const;

export class PreflightError extends Error {
  constructor(readonly missing: ToolFailure[]) {
    super("Preflight check failed");
  }
}

export function checkTools(required: string[] = [...TOOL_GROUPS.durable], options: PreflightOptions = {}): PreflightResult {
  const throwOnMissing = options.throwOnMissing ?? true;
  const missing: ToolFailure[] = [];
  const present: ToolSuccess[] = [];

  for (const name of required) {
    const tool = TOOLS_BY_NAME[name];
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
        error: toError(error)
      });
    }
  }

  if (missing.length && throwOnMissing) {
    throw new PreflightError(missing);
  }

  return { present, missing };
}

export function resolveToolNames(requested: string[] = []): string[] {
  const names = requested.length ? requested : ["durable"];
  return [...new Set(names.flatMap((name) => {
    const group = TOOL_GROUPS[name as keyof typeof TOOL_GROUPS];
    return group ? [...group] : [name];
  }))];
}

export function parsePreflightArgs(args: string[]): PreflightArgs {
  const toolNames: string[] = [];
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

export function formatToolList(): string {
  const lines = ["Preflight groups:"];
  for (const [name, tools] of Object.entries(TOOL_GROUPS)) {
    lines.push(`  ${name}: ${tools.join(", ")}`);
  }
  lines.push("");
  lines.push("Tools:");
  for (const [name, tool] of Object.entries(TOOLS)) {
    lines.push(`  ${name} [${tool.category}] - ${tool.usedBy}`);
  }
  return lines.join("\n");
}

export function formatPreflightFailure(missing: ToolFailure[]): string {
  const lines = ["Preflight check failed. The following required tools are missing:"];
  for (const failure of missing) {
    lines.push("");
    lines.push(`  ${failure.label || failure.name}`);
    if (failure.category) lines.push(`    category:  ${failure.category}`);
    if (failure.usedBy) lines.push(`    needed by: ${failure.usedBy}`);
    if (failure.installHint) lines.push(`    install:   ${failure.installHint}`);
    if (failure.error.message) lines.push(`    detail:    ${failure.error.message}`);
  }
  lines.push("");
  return lines.join("\n");
}

function firstLine(value: string): string {
  return value.trim().split("\n")[0] || "";
}

function commandVersion(command: string, args: string[]): string {
  const result = spawnSync(command, args, { encoding: "utf8" });
  if (result.error) {
    throw result.error;
  }
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || `${command} exited ${result.status}`).trim());
  }
  return firstLine(`${result.stdout || ""}\n${result.stderr || ""}`) || "available";
}

function requireVersion(command: string, args: string[], pattern: RegExp): string {
  const version = commandVersion(command, args);
  if (!pattern.test(version)) {
    throw new Error(`${command} version did not match ${pattern}: ${version}`);
  }
  return version;
}

function checkCommandVersions(commands: CommandSpec[]): string {
  const errors: string[] = [];
  for (const [command, args] of commands) {
    try {
      return commandVersion(command, args);
    } catch (error) {
      errors.push(`${command}: ${toError(error).message}`);
    }
  }
  throw new Error(errors.join("; "));
}

function playwrightBrowserName(executable: string): string {
  return executable
    .split(path.sep)
    .find((part) => /^chromium(?:_headless_shell)?-\d+$/.test(part))
    ?? executable;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
