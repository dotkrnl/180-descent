import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { toError } from "@lib/errors";
import { epubcheckVersionCommands, javaCommands, type CommandSpec } from "@lib/tools/epubcheck";

interface ToolDefinition {
  label: string;
  usedBy: string;
  installHint: string;
  check: () => string;
}

interface ToolSuccess {
  name: string;
  label: string;
  version: string;
}

interface ToolFailure {
  name: string;
  label?: string;
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
  errors: string[];
}

const TOOLS = {
  node: {
    label: "Node.js",
    usedBy: "all build/check scripts",
    installHint: "Install the project Node version, then run npm install.",
    check() {
      return process.version;
    }
  },
  npm: {
    label: "npm",
    usedBy: "all package scripts",
    installHint: "Install npm with Node.js.",
    check() {
      return execFileSync("npm", ["--version"], { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
    }
  },
  pdftotext: {
    label: "Poppler pdftotext",
    usedBy: "check-pdf text extraction",
    installHint: "macOS: brew install poppler | Debian/Ubuntu: apt-get install poppler-utils",
    check() {
      return commandVersion("pdftotext", ["-v"]);
    }
  },
  latexmk: {
    label: "latexmk",
    usedBy: "build-pdf XeTeX orchestration",
    installHint: "macOS: brew install texlive | Debian/Ubuntu: apt-get install texlive-xetex latexmk",
    check() {
      return commandVersion("latexmk", ["-version"]);
    }
  },
  xelatex: {
    label: "XeLaTeX",
    usedBy: "build-pdf",
    installHint: "macOS: brew install texlive | Debian/Ubuntu: apt-get install texlive-xetex",
    check() {
      return commandVersion("xelatex", ["--version"]);
    }
  },
  fonttools: {
    label: "fonttools",
    usedBy: "build-pdf WOFF2 to OpenType font preparation",
    installHint: "macOS: brew install fonttools | Debian/Ubuntu: apt-get install fonttools",
    check() {
      return commandVersion("fonttools", ["ttLib.woff2", "decompress", "--help"]);
    }
  },
  rsvg: {
    label: "rsvg-convert",
    usedBy: "build-pdf SVG image conversion",
    installHint: "macOS: brew install librsvg | Debian/Ubuntu: apt-get install librsvg2-bin",
    check() {
      return commandVersion("rsvg-convert", ["--version"]);
    }
  },
  xmllint: {
    label: "xmllint (libxml2)",
    usedBy: "check-epub XML fast checks",
    installHint: "macOS: brew install libxml2 | Debian/Ubuntu: apt-get install libxml2-utils",
    check() {
      return commandVersion("xmllint", ["--version"]);
    }
  },
  playwright: {
    label: "Playwright Chromium browser",
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
    usedBy: "official EPUBCheck",
    installHint: "macOS: brew install openjdk | Debian/Ubuntu: apt-get install default-jre",
    check() {
      return checkCommandVersions(javaCommands(["-version"]));
    }
  },
  epubcheck: {
    label: "EPUBCheck 5.3.0",
    usedBy: "official EPUB validation",
    installHint: "macOS: brew install epubcheck | or set EPUBCHECK_JAR / tools/epubcheck/epubcheck.jar",
    check() {
      return requireCommandVersion(epubcheckVersionCommands(), /EPUBCheck v5\.3\.0/);
    }
  }
} satisfies Record<string, ToolDefinition>;

const TOOL_GROUPS = {
  build: ["node", "npm", "pdftotext", "latexmk", "xelatex", "fonttools", "rsvg", "xmllint", "playwright", "java", "epubcheck"],
  epubcheck: ["java", "epubcheck"]
} as const;

type ToolGroupName = keyof typeof TOOL_GROUPS;

export class PreflightError extends Error {
  constructor(readonly missing: ToolFailure[]) {
    super("Preflight check failed");
  }
}

export function checkTools(required: string[] = [...TOOL_GROUPS.build], options: PreflightOptions = {}): PreflightResult {
  const throwOnMissing = options.throwOnMissing ?? true;
  const missing: ToolFailure[] = [];
  const present: ToolSuccess[] = [];

  for (const name of required) {
    const tool = TOOLS[name as keyof typeof TOOLS];
    if (!tool) {
      missing.push({ name, error: new Error(`Unknown tool: ${name}`) });
      continue;
    }
    try {
      const version = tool.check();
      present.push({ name, label: tool.label, version });
    } catch (error) {
      missing.push({
        name,
        label: tool.label,
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
  const names = requested.length ? requested : ["build"];
  return [...new Set(names.flatMap((name) => {
    return isToolGroupName(name) ? [...TOOL_GROUPS[name]] : [name];
  }))];
}

function isToolGroupName(name: string): name is ToolGroupName {
  return name in TOOL_GROUPS;
}

export function parsePreflightArgs(args: string[]): PreflightArgs {
  const toolNames: string[] = [];
  const errors: string[] = [];
  let optional = false;
  let list = false;

  for (const arg of args) {
    if (arg === "--optional") {
      optional = true;
    } else if (arg === "--list") {
      list = true;
    } else if (arg.startsWith("--group=")) {
      const group = arg.slice("--group=".length);
      if (group) {
        toolNames.push(group);
      } else {
        errors.push("--group requires a value");
      }
    } else if (arg.startsWith("--")) {
      errors.push(`Unknown option: ${arg}`);
    } else {
      toolNames.push(arg);
    }
  }

  return { toolNames, optional, list, errors };
}

export function formatToolList(): string {
  const lines = ["Preflight groups:"];
  for (const [name, tools] of Object.entries(TOOL_GROUPS)) {
    lines.push(`  ${name}: ${tools.join(", ")}`);
  }
  lines.push("");
  lines.push("Tools:");
  for (const [name, tool] of Object.entries(TOOLS)) {
    lines.push(`  ${name} - ${tool.usedBy}`);
  }
  return lines.join("\n");
}

export function formatPreflightFailure(missing: ToolFailure[]): string {
  const lines = ["Preflight check failed. The following required tools are missing:"];
  for (const failure of missing) {
    lines.push("");
    lines.push(`  ${failure.label || failure.name}`);
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

function requireCommandVersion(commands: CommandSpec[], pattern: RegExp): string {
  const version = checkCommandVersions(commands);
  if (!pattern.test(version)) {
    throw new Error(`version did not match ${pattern}: ${version}`);
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
