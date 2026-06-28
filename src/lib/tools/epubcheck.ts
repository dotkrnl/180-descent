import { existsSync } from "node:fs";
import path from "node:path";

export type CommandSpec = [command: string, args: string[]];

const HOMEBREW_PREFIX = process.env.HOMEBREW_PREFIX || (existsSync("/opt/homebrew") ? "/opt/homebrew" : "/usr/local");

export function javaCommands(args: string[]): CommandSpec[] {
  return [
    ["java", args],
    [path.join(HOMEBREW_PREFIX, "opt/openjdk/bin/java"), args]
  ];
}

export function epubcheckVersionCommands(): CommandSpec[] {
  const jar = epubcheckJar();
  return jar ? javaCommands(["-jar", jar, "--version"]) : [["epubcheck", ["--version"]]];
}

export function epubcheckValidationCommands(absoluteFile: string): CommandSpec[] {
  const jar = epubcheckJar();
  return jar ? javaCommands(["-jar", jar, absoluteFile]) : [["epubcheck", [absoluteFile]]];
}

function epubcheckJar(): string | null {
  if (process.env.EPUBCHECK_JAR) return process.env.EPUBCHECK_JAR;

  const localJar = path.join(process.cwd(), "tools/epubcheck/epubcheck.jar");
  return existsSync(localJar) ? localJar : null;
}
