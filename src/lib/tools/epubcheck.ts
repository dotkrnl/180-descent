import { existsSync } from "node:fs";
import path from "node:path";

export type CommandSpec = [command: string, args: string[]];

const EPUBCHECK_JAR_CANDIDATES = [
  process.env.EPUBCHECK_JAR,
  path.join(process.cwd(), "tools/epubcheck/epubcheck.jar")
].filter((candidate): candidate is string => Boolean(candidate));

const HOMEBREW_PREFIX = process.env.HOMEBREW_PREFIX || (existsSync("/opt/homebrew") ? "/opt/homebrew" : "/usr/local");

export function javaCommands(args: string[]): CommandSpec[] {
  return [
    ["java", args],
    [path.join(HOMEBREW_PREFIX, "opt/openjdk/bin/java"), args]
  ];
}

export function epubcheckVersionCommands(): CommandSpec[] {
  const jar = EPUBCHECK_JAR_CANDIDATES.find((candidate) => existsSync(candidate));
  return jar ? javaCommands(["-jar", jar, "--version"]) : [["epubcheck", ["--version"]]];
}

export function epubcheckValidationCommands(absoluteFile: string): CommandSpec[] {
  const jar = EPUBCHECK_JAR_CANDIDATES.find((candidate) => existsSync(candidate));
  return jar ? javaCommands(["-jar", jar, absoluteFile]) : [["epubcheck", [absoluteFile]]];
}
