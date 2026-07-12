import { execFile } from "node:child_process";
import path from "node:path";
import { promisify } from "node:util";
import { toError } from "@lib/errors";
import { toPosixRelative } from "@lib/fs/path";
import { walkFiles } from "@lib/fs/walk";

const execFileAsync = promisify(execFile);

interface JavaScriptSyntaxCheckOptions {
  root: string;
}

interface JavaScriptSyntaxFailure {
  file: string;
  reason: string;
}

export interface JavaScriptSyntaxCheckResult {
  checkedFiles: number;
  failures: JavaScriptSyntaxFailure[];
}

export async function checkJavaScriptSyntax(
  options: JavaScriptSyntaxCheckOptions
): Promise<JavaScriptSyntaxCheckResult> {
  const sourceDir = path.join(options.root, "src/assets/js");
  const files = await walkFiles(sourceDir, { exts: ".js", ignoredDirNames: [] });
  const failures: JavaScriptSyntaxFailure[] = [];

  for (const file of files) {
    try {
      await execFileAsync(process.execPath, ["--check", file]);
    } catch (error) {
      failures.push({
        file: toPosixRelative(options.root, file),
        reason: syntaxErrorReason(error)
      });
    }
  }

  return { checkedFiles: files.length, failures };
}

function syntaxErrorReason(error: unknown): string {
  const stderr = commandStderr(error);
  const lines = stderr.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const syntaxError = lines.find((line) => line.startsWith("SyntaxError:"));
  const location = lines.find((line) => /:\d+(?::\d+)?$/.test(line));
  const line = location?.match(/:(\d+)(?::\d+)?$/)?.[1];

  if (syntaxError) return line ? `line ${line}: ${syntaxError}` : syntaxError;
  return toError(error).message;
}

function commandStderr(error: unknown): string {
  if (!error || typeof error !== "object" || !("stderr" in error)) return "";
  const stderr = (error as { stderr?: unknown }).stderr;
  if (typeof stderr === "string") return stderr;
  return Buffer.isBuffer(stderr) ? stderr.toString("utf8") : "";
}
